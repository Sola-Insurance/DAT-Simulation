// Import statements
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const fetch = require('node-fetch')
const mongoose = require("mongoose");
const fs = require('fs')
const {home} = require("nodemon/lib/utils");

// Defining constants
const policyPrice = 50;
const numYears = 1;

// Defining variables that are used to calculate statistics
let numHomes = 0;
let maxPayout = 0;
let totalPayout = 0;
let numPayouts = 0;

// Connect to mongo
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

// Creates list of policyholders who received a payout
async function findTHbyPayout(list, map) {
    for (const [key, ph] of map.entries()) {
        const phPoint = {
            type: "Feature",
            properties: {
                severity: ph.severity
            },
            geometry: ph.holder.location
        }
        list.features.push(phPoint)

        const payout = ph.payout

        numPayouts++
        totalPayout += payout

        if (payout > maxPayout) {
            maxPayout = payout
        }
    }
}

// Creates a geojson of all points within the state
async function allTH(state) {
    const houses = require(`../models/${state}house`)
    const tempPH = await houses.find({})
    numHomes = tempPH.length

    let geoJson = {
        type: "FeatureCollection",
        features: []
    }

    for (const ph of tempPH) {
        const phPoint = {
            type: "Feature",
            geometry: ph.location
        }
        geoJson.features.push(phPoint)
    }

    const geoJsonString = JSON.stringify(geoJson)

    await fs.writeFile(`../../samplebooks/${state}Points.json`, geoJsonString, (err) => {
        if (err) {
            throw err
        }
        console.log("JSON data is saved.")
    })
}

// Creates a geojson of all payout points within the state
async function payoutTH(map, year, state) {

    let geoJson = {
        type: "FeatureCollection",
        features: []
    }

    await findTHbyPayout(geoJson, map)

    const geoJsonString = JSON.stringify(geoJson)

    // Writes json file to a directory
    await fs.writeFile(`../../samplebooks/${state}Payouts${year}.json`, geoJsonString, (err) => {
        if (err) {
            throw err;
        }

        return Promise.resolve("Payout Homeowners Generated")
    });
}

// Calls the payouts and points generator, and then calculates/generates statistics based on the 2 function calls
async function statGenerator(map, year, state) {
    const houses = require('../models/' + state + 'house')

    await payoutTH(map, year, state)
        .then(() => {
            console.log("Payouts Generated")
    })

    await allTH(state)
        .then(() => {
            console.log("Points Generated")
    })

    let avgPayout = totalPayout / numPayouts;
    let gwp = policyPrice * numYears * numHomes;
    let grossLossRatio = totalPayout / gwp;
    let netLossRatio = grossLossRatio / 0.7;

    let statJson = {Statistics:[{numHomes: numHomes, grossLossRatio: grossLossRatio, netLossRatio: netLossRatio, totalPayout: totalPayout, avgPayout: avgPayout, maxPayout: maxPayout, numPayouts: numPayouts}]};
    const statJsonString = JSON.stringify(statJson)

    // Writes json file to a directory
    await fs.writeFile(`../../samplebooks/${state}Statistics${year}.json`, statJsonString, (err) => {
        if (err) {
            throw err;
        }
        console.log(`${state[0].toUpperCase()}${state.substring(1)} ${year} Statistics Generated`);
    });
}

module.exports = {statGenerator}