// Import statements
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const fetch = require('node-fetch')
const turf = require('@turf/turf')
const mongoose = require("mongoose")
const fs = require("fs")
const logUpdate = require('log-update')
const { promiseImpl } = require('ejs')

// Connecting to mongo
const db = async () => {
    await mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true
    }).then(
        () => {
          console.info(`Connected to database`)
        },
        error => {
          console.error(`Connection error: ${error.stack}`)
          process.exit(1)
        }
    )
}

db().catch(error => console.error(error))


// Importing statepolygon data to filter polygons
const rawdata = fs.readFileSync('statepolys.json')
const statepolys = JSON.parse(rawdata)
let state

// Declaring some constant vars
const ONE_DAY_MILLISECONDS = 86400000
const EF = ['EF0', 'EF1' ,'EF2', 'EF3', 'EF4', 'EF5']

// Class for a sample polygon (can be line and point too)
class DamagePolygon {

    /**
     * Class to hold coordinates of a damage polygon + its severity in EFScale.
     * @param coords of polygon
     * @param severity of the damage
     */
    constructor(coords, severity) {
        this.coords = coords
        this.severity = severity
    }
}

// Class for a Damaged house
class DamagedHouse {
    constructor(holder, severity, payout) {
        this.holder = holder
        this.severity = severity
        this.payout = payout
    }
}

// Function to set a delay for api calls
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Returns Damage Polygon when given raw data from nws
function makePolygon(geometry, scale, geoType) {
    try {
        let coordList
        let polyCords

        // Generates different polygon based on type of geojson object
        switch (geoType) {
            case "polygon":
                coordList = geometry.rings

                polyCords = turf.polygon(coordList).geometry

                break

            case "line":
                let line1 = turf.multiLineString(geometry.paths)
                if (line1.geometry.coordinates.length !== 0) {
                    let line2 = turf.lineOffset(line1, 0.095, {units: 'miles'})
                    let line3 = turf.lineOffset(line1, -0.095, {units: 'miles'})

                    // Removes point where lineOffset returns invalid values
                    let arr2 = line2.geometry.coordinates[0]

                    for (let i = 0; i < arr2.length; i++) {
                        let x = arr2[i][0]
                        let y = arr2[i][1]

                        if (Math.abs(x) > 180 || Math.abs(y) > 90) {
                            console.log(`\nRemoved point: [${arr2[i]}] from line 2\n`)

                            arr2.splice(i, 1)
                        }
                    }

                    arr3 = line3.geometry.coordinates[0]

                    for (let i = 0; i < arr3.length; i++) {
                        let x = arr3[i][0]
                        let y = arr3[i][1]

                        if (Math.abs(x) > 180 || Math.abs(y) > 90) {
                            console.log(`Removed point: [${arr3[i]}] from line 3\n\n`)

                            arr3.splice(i, 1)
                        }
                    }


                    coordList = line2.geometry.coordinates[0].concat(line3.geometry.coordinates[0].reverse())
                    coordList.push(coordList[0])

                    polyCords = {
                        type: "Polygon",
                        coordinates: [coordList]
                    }
                } else {
                    polyCords = {
                        type: "Polygon",
                        coordinates: []
                    }
                }
                break

            default:
                try {
                    polyCords = turf.circle([geometry.x, geometry.y], 0.0946969, { units: 'miles' }).geometry
                } catch (e) {
                    polyCords = {
                        type: "Polygon",
                        coordinates: []
                    }
                }
        }

        return new DamagePolygon(polyCords, scale)

    } catch(err) { return err }
}


// Function used to request and return polygons from the NWS API
async function fetchDAT(num, startDate, endDate, numTries) {
    const settings = { method: 'Get' }
    const url = `https://services.dat.noaa.gov/arcgis/rest/services/nws_damageassessmenttoolkit/DamageViewer/FeatureServer/${num}/query?time=${startDate}%2C${endDate}&outFields=*&outSR=4326&f=json`

    try {
        const rawResp = await fetch(url, settings)
        .then(response => response)

        let resp = await rawResp.json()

        if (resp.features.length >= 2000) {
            const midDate = ((endDate - startDate) / 2) + startDate

            const resp1 = await fetchDAT(num, startDate, midDate, numTries)
            const resp2 = await fetchDAT(num, midDate, endDate, numTries)

            let combinedFeatures = []
            combinedFeatures.push.apply(combinedFeatures, resp1.features)
            combinedFeatures.push.apply(combinedFeatures, resp2.features)

            resp.features = combinedFeatures
        }

        return resp

    }   catch (e) {
        
        if (numTries < 11) {
            console.log(e);
            numTries++
            console.log(`${state} Server Request Failed (${numTries})`);

            let returnVal = {}

            delay(7500).then(() => {returnVal = fetchDAT(num, startDate, endDate, numTries)})

            return returnVal
        }

        console.log(e);
    }
}

// Generates a dictionary of polygons by EF level when given a date range and polygon type to search for
async function generateGeom(startDate, endDate, typeNum, type, state) {

    let polygonDict = {
        EF0: [],
        EF1: [],
        EF2: [],
        EF3: [],
        EF4: [],
        EF5: []
    }

    const res = await fetchDAT(typeNum, startDate, endDate)

    const allPolygons = res.features

    const max = allPolygons.length
    let num = 0

    await updateConsole(num, max, false, type)
    num++

    // Polygon that allows us to filter the damage polygons by state
    const statePoly = statepolys[state]
    const newStatePoly = turf.polygon(statePoly.coordinates)

    // Iterates through all polygons and adds them to the polygon dictionary if they are within our bounds
    for await (const rawPolygon of allPolygons) {
        let ef = rawPolygon.attributes.efscale

        if (type === 'polygon' && rawPolygon.geometry.rings[0] === undefined) {
            continue
        }
        if (type === 'line' && rawPolygon.geometry.paths[0] === undefined) {
            continue
        }
        if (type === 'point' && rawPolygon.geometry.x === null) {
            continue
        }

        if (EF.includes(ef)) {
            let polygon = await makePolygon(rawPolygon.geometry, ef, type)

            let tempPolygon

            try {
                tempPolygon = turf.polygon(polygon.coords.coordinates)

            }   catch(e) {
                console.log(e)
            }


            if (turf.booleanOverlap(newStatePoly, tempPolygon) || turf.booleanContains(newStatePoly, tempPolygon)) {
                await polygonDict[ef].push(tempPolygon)
                await updateConsole(num, max, false, type)
            }
        }

        num++
    }

    updateConsole(max, max, true, type)

    return polygonDict
}

// Runs generateGeom for each month, and passes in urls for polygons, lines, and points
async function runGenGeoms(dates, state) {
    let damagePolygonList = []

    let polygonDict = {
        EF0: [],
        EF1: [],
        EF2: [],
        EF3: [],
        EF4: [],
        EF5: []
    }

    let i = 0

    // For each date, generate a polygon dictionary and merge it into 1 main polygon dictionary
    for (const date of dates) {

        console.log(`Date passed: ${date}`)

        const dateObj = new Date(date)
        const startDate = Date.parse(dateObj)
        const endDate = startDate + (getDaysInMonth(dateObj) * ONE_DAY_MILLISECONDS)

        console.log("Fetching Data From NWS Server");

        let [dict1, dict2, dict3] = await Promise.all([generateGeom(startDate, endDate, 2, "polygon", state),
                                                       generateGeom(startDate, endDate, 1, "line", state),
                                                       generateGeom(startDate, endDate, 0, "point", state)])

        polygonDict.EF0 = polygonDict.EF0.concat(dict1.EF0, dict2.EF0, dict3.EF0)
        polygonDict.EF1 = polygonDict.EF1.concat(dict1.EF1, dict2.EF1, dict3.EF1)
        polygonDict.EF2 = polygonDict.EF2.concat(dict1.EF2, dict2.EF2, dict3.EF2)
        polygonDict.EF3 = polygonDict.EF3.concat(dict1.EF3, dict2.EF3, dict3.EF3)
        polygonDict.EF4 = polygonDict.EF4.concat(dict1.EF4, dict2.EF4, dict3.EF4)
        polygonDict.EF5 = polygonDict.EF5.concat(dict1.EF5, dict2.EF5, dict3.EF5)

        i++
        console.log(`Loops done: ${i}\n`)
    }

    let num = 0
    let frames = ['.', '..', '...']

    // Generates multipolygons for each EF level
    for (const [key, value] of Object.entries(polygonDict)) {
        let coords = {
            type: 'MultiPolygon',
            coordinates: []
        }

        if (value.length > 0) {
            let i = 0

            let progressString = `Generating EF${num} MultiPolygon`
            logUpdate(progressString)

            const efInterval = setInterval(() => {
                const frame = frames[i++ % frames.length]
                progressString = `Generating EF${num} MultiPolygon  ${frame}`
                logUpdate(progressString)
            }, 200)

            let union = await merge(value)

            coords = union.geometry

            num++
            clearInterval(efInterval)
            logUpdate.done();
        }

        damagePolygonList.push(new DamagePolygon(coords, String(key)))
    }

    return Promise.resolve(damagePolygonList)
}

// Merges an array of polygons into a multipolygon with an algorithm similar to mergesort
async function merge(arr) {

    if (arr.length < 2) {
        return arr[0]
    }

    const mid = Math.floor(arr.length / 2)

    const left = arr.slice(0, mid)
    const right = arr.slice(mid, arr.length)

    const sortedLeft = await merge(left)
    const sortedRight = await merge(right)

    return turf.union(sortedLeft, sortedRight)
}

// Finds all intersecting houses and returns an array containing both a map and array of damaged houses
async function findHouses(dates, state) {
    const houses = require('../models/' + state + 'house')
    await houses.updateMany({}, { total: {} })

    let dhArr = []
    let dhMap = new Map()

    // Finds all damage polygons
    await runGenGeoms(dates, state)
        .then(async (damagePolygons) => {
            console.log("Polygons Generated");

            let num = 1
            const max = damagePolygons.length

            // iterates through each damage polygon and finds whether it is intersecting a house
            for (const damagePolygon of damagePolygons) {
                let tempPH

                const progressString = `Searching MultiPolygons: ${num}/${max}`
                await logUpdate(progressString)

                if (damagePolygon.coords.coordinates.length > 0) {

                    try {
                        tempPH = await houses.find({
                            location: {
                                $geoWithin: {
                                    $geometry: {
                                        type: damagePolygon.coords.type,
                                        coordinates: damagePolygon.coords.coordinates
                                    }
                                }
                            }
                        })
                    } catch (e) {
                        tempPH = undefined
                        console.log(e);
                    }

                    // Adds damaged house to both an array and a map
                    if (tempPH) {
                        for (const ph of tempPH) {
                            let tempDH = new DamagedHouse(ph, damagePolygon.severity, sevToPayout(damagePolygon.severity))

                            dhArr.push(tempDH)
                            dhMap.set(ph._id.toString(), tempDH)
                        }
                    }
                }

                num++
            }
    })

    logUpdate.done()

    console.log("Created Damaged Houses Map");

    return Promise.resolve([dhArr, dhMap])
}



// Takes in an EF value and returns a payout
async function sevToPayout(severity) {
    switch(severity) {
        case 'EF5':
            return 15000
        case 'EF4':
            return 10000
        case 'EF3':
            return 7500
        case 'EF2':
            return 5000
        case 'EF1':
            return 2000
        case 'EF0':
            return 2000
        default:
            return 0
    }
}

// Function to run logupdate
async function updateConsole(num, max, isDone, type) {
    if (!isDone) {
        const progressString = `Generating ${type}s: ${num}/${max}`
        logUpdate(progressString)
    }   else {
        const progressString = `Generating ${type}s: ${num}/${max}`
        logUpdate(progressString)
        logUpdate.done()
    }
}

// returns the number of days in any given month
function getDaysInMonth(date) {
   return new Date(date.getYear(), date.getMonth(), 0).getDate();
}

module.exports = {findHouses}