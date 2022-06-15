// THIS FILE IS WHAT SHOULD BE RUN WHEN GENERATING THE PAYOUTS AND GEOJSONS


// Defining Constants
const generatePayout = require('./generatepayout')
const generateGeoJson = require('./generategeojson')

const states = ['illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'mississippi', 'missouri', 'nebraska', 'ohio', 'pennsylvania', 'tennessee', 'texas', 'wisconsin', 'florida', 'georgia', 'arkansas', 'oklahoma', 'alabama']

// Generates all payouts for policyholders within a certain date range
async function payoutRunner(year, state) {
    let map = new Map()

    await generatePayout.addPayoutTH(state, numMonths, startMonth, year)
    .then((houses) => {
        map = houses
        console.log(`Done with ` + state[0].toUpperCase() + state.substring(1) + "\n")
    })

    return Promise.resolve(map)
}

// Runs payout runner and then generates geojson files for payout runner's output
function runFiles(year, state) {
    let map = new Map()

    payoutRunner(year, state)
    .then(async (houses) => {
        map = houses
        await generateGeoJson.statGenerator(map, year, state)
    })
}

// constants for running code, DON'T MODIFY
const startMonth = 1
const numMonths = 12
// DON'T MODIFY

async function run() {
    for (let state of states) {
        let years = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]

        for (const element of years) {
            await runFiles(element, state)
        }
    }
}

// function call
run().then()
