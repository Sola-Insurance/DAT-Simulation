if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// Import Statements
const fs = require('fs');
const path = require('path');
const { parse } = require('fast-csv');
const randomPointsOnPolygon = require('random-points-on-polygon');
const turf = require('@turf/turf');
const logUpdate = require('log-update')

// Defining all constants
const states = [['illinois', 'IL', 12.7], ['indiana', 'IN', 6.7], ['iowa', 'IA', 3.2], ['kansas', 'KS', 2.9], ['kentucky', 'KY', 4.5], ['louisiana', 'LA', 4.7], ['mississippi', 'MS', 3.0], ['missouri', 'MO', 6.1], ['nebraska', 'NE', 1.9], ['ohio', 'OH', 11.7], ['pennsylvania', 'PA', 12.8], ['tennessee', 'TN', 6.8], ['texas', 'TX', 28.6], ['wisconsin', 'WI', 5.8], ['florida', 'FL', 21.2], ['georgia', 'GA', 10.5], ['arkansas', 'AR', 3.0], ['alabama', 'AL', 5.0], ['oklahoma', 'OK', 4.0]];
let numRows = 0
const TOTAL_HOMEOWNERS = 52000
const homeownerCap = 33300
const start = 0
let totalSample = 0

// MAKE SURE TO SET THESE FOUR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
let i = 2; // go to 16

const state = states[i][0];
const TOTAL_POP = states[i][2] * 1000000;
const stateID = states[i][1];
// MAKE SURE TO SET THESE FOUR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// Requiring mongo schema
const testHouse = require('../models/' + state + 'house');

// Accessing MongoDB
const mongoose = require('mongoose');

const db = async () => {
    await mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true
    }).then(
        () => {
            console.info(`Connected to database`);
        },
        error => {
            console.error(`Connection error: ${error.stack}`);
            process.exit(1);
        }
    )
}

db().catch(error => console.error(error))

const ratio = TOTAL_HOMEOWNERS / TOTAL_POP

let zipList = []
let rawdata = fs.readFileSync('zipPolygon.json')
let zipData = JSON.parse(rawdata)


/*
Parse through uszips.csv file, which contains all of the zip codes in the US, as well as some corresponding data
*/
const zipStream = fs.createReadStream(path.resolve(__dirname, 'uszips.csv'))
    .pipe(parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('end', async rowCount => {
        console.log(`Parsed ${rowCount} rows`)
        console.log("Length of zip polygon data: " + zipData.features.length)
    });

addTests()

/*
This is a function to add test homeowners to sample database
*/

async function addTests() {
    for await (const row of zipStream) {
        try {
            if (numRows >= start && numRows < start + homeownerCap) {
                if (zipData.features[numRows].properties.zipCode !== row.zip) {
                    console.log("zip codes are different")
                    break
                }

                const originalPop = parseInt(row.population)
                const isInSet = row.state_id === stateID

                if (!isNaN(originalPop) && isInSet) {
                    const numPHs = parseInt(originalPop * ratio)
                    const polygon = turf.polygon(zipData.features[numRows].geometry.coordinates)
                    const points = randomPointsOnPolygon(numPHs, polygon)

                    for (const point of points) {
                        const location = point.geometry

                        // generate different sets of houses based on location
                        const TH = new testHouse({
                            total: {},
                            zip: row.zip,
                            location: location
                        })

                        try {
                            await TH.save()

                        } catch (e) {
                            console.log(e)
                            console.log(row.zip)
                            console.log(numPHs)
                            console.log(originalPop)
                        }
                    }

                    totalSample += numPHs

                } else {
                    numNans++
                }
            }
        } catch (e) {
            numErrors++
        }

        numRows++
    }

    console.log(totalSample)
}

/*
Gets polygons based on list of zip codes
*/
async function getPolygon(zipList) {
    let zipString = ''

    for (const zip of zipList) {
        zipString += zip.toString()
        zipString += "%2C"
    }

    const fetch = require('node-fetch');

    const url = `https://vanitysoft-boundaries-io-v1.p.rapidapi.com/rest/v1/public/boundary/zipcode?zipcode=${zipString}`

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': 'vanitysoft-boundaries-io-v1.p.rapidapi.com',
            'X-RapidAPI-Key': 'b85ec7ea0emshb886b0b14d4e6bcp1249f3jsn4dc13cce1466'
        }
    };

    return await fetch(url, options)
        .then(res => res.json())
        // .then(json => console.log(json))
        .catch(err => console.error('error:' + err));
}

/*
adds missing zip code for 96917 and subs it for 96918
*/
function addMissingZip() {
    zipData.features.splice(31861,0,{
        type: "Feature",
        properties: {
            zipCode: "96917",
            country: "US",
            city: "Unknown",
            county: "Guam",
            state: "GU"
        },
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [
                        144.78629472693143,
                        13.444299817015061
                    ],
                    [
                        144.78629300034405,
                        13.444299558331517
                    ],
                    [
                        144.78627827395613,
                        13.44429434907392
                    ],
                    [
                        144.78626068174273,
                        13.444276107449097
                    ],
                    [
                        144.7862561345007,
                        13.444253624697362
                    ],
                    [
                        144.78628501904396,
                        13.444216114792848
                    ],
                    [
                        144.78634346041875,
                        13.444269125036671
                    ],
                    [
                        144.78633564957246,
                        13.444283747519158
                    ],
                    [
                        144.7863320401086,
                        13.444287664978859
                    ],
                    [
                        144.78629472693143,
                        13.444299817015061
                    ]
                ]
            ]
        }
    })

    const zipDataString = JSON.stringify(zipData)
    
    fs.writeFile('zipPolygon.json', zipDataString, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    })
}