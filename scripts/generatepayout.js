// Import statements
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const findDamage = require('./findDamage')

// Runs findDamage algorithm by passing in an array of each month when given a startYear and numMonths
// Returns a map of damaged houses
async function addPayoutTH(state, numMonths, startMonth, startYear) {
        let dates = await genDates(numMonths, startMonth, startYear)
        let houseMap = new Map()

        // Finds all damaged houses and outputs an array of both a map and array of damaged houses
        await findDamage.findHouses(dates, state)
        .then(async (houses) => {
            
            // Saves all damaged house payouts to the database
            for (const house of houses[0]) {

                let oldJson = house.holder.total

                let newJson = {}

                for (const [key, value] of Object.entries(oldJson)) {
                    newJson[key] = []
                    for (const entry of value) {
                        newJson[key].push(entry)
                    }
                }

                if (newJson[startYear] == null) {
                    newJson[startYear] = []
                }

                newJson[startYear].push(house.payout)

                house.holder.total = newJson

                await house.holder.save()
            }

            houseMap = houses[1]
        })

        return Promise.resolve(houseMap)
}

// Creates an array of dates for each month in the date range
function genDates(numMonths, startMonth, startYear) {
    let dates = []

    for (let i = 1; i <= numMonths; i++) {
        const j = (i + startMonth - 2) % 12 + 1
        const k = Math.floor((i + startMonth - 2) / 12) + startYear
        const date = `${j}/1/${k}`

        dates.push(date)
    }

    return dates
}

module.exports = {addPayoutTH}