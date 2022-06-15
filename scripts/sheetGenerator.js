const { google } = require("googleapis");
const fs = require('fs')

// Authenticating Google Sheets API
const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets", 
});

// Dictionary containing offset values for rows based on the current state
const offsetDict = {
    AL: 0,
    AR: 1,
    FL: 2,
    GA: 3,
    IL: 4,
    IN: 5,
    IA: 6,
    KS: 7,
    KY: 8,
    LA: 9,
    MS: 10,
    MO: 11,
    NE: 12,
    OH: 13,
    OK: 14,
    PA: 15,
    TN: 16,
    TX: 17,
    WI: 18
}

// Dictionary containing all state codes
const stateDict = {
    alabama: "AL",
    arkansas: "AR",
    florida: "FL",
    georgia: "GA",
    illinois: "IL",
    indiana: "IN",
    iowa: "IA",
    kansas: "KS",
    kentucky: "KY",
    louisiana: "LA",
    mississippi: "MS",
    missouri: "MO",
    nebraska: "NE",
    ohio: "OH",
    oklahoma: "OK",
    pennsylvania: "PA",
    tennessee: "TN",
    texas: "TX",
    wisconsin: "WI"
}

// Dictionary containing all column values based on the current year
const columnDict = {
    2011: "B",
    2012: "C",
    2013: "D",
    2014: "E",
    2015: "F",
    2016: "G",
    2017: "H",
    2018: "I",
    2019: "J",
    2020: "K",
    2021: "L"
}

// Dictionary containing all row values based on the statistic we are entering
const rowDict = {
    avgPayout: 121,
    grossLossRatio: 52,
    maxPayout: 144,
    numHomes: 6,
    numPayouts: 98,
    netLossRatio: 75,
    totalPayout: 29
}

// Generates the data object to batch update the sheet when given an array of statistic geojsons
async function genRequests(files, data) {

    // Iterates through the files
    for (let fileName of files) {
        // Parsing filename and searching for identifying values
        const split = fileName.split('Statistics')

        const state = split[0]
        const stateCode = stateDict[state]
        const offset = offsetDict[stateCode]
    
        const year = split[1].split('.')[0]
    
        let column = columnDict[year];
    
        // Reading JSON file
        const rawFile = await fs.readFileSync(`../../samplebooks/${fileName}`);
        const stats = await JSON.parse(rawFile).Statistics[0];

        // Formatting statistics
        stats.grossLossRatio = parseFloat((stats.grossLossRatio) * 100).toFixed(2)
        stats.numHomes = stats.numHomes.toLocaleString('en-US');
        stats.netLossRatio = `${parseFloat((stats.netLossRatio) * 100).toFixed(2)}%`;
        stats.totalPayout = `$${stats.totalPayout.toLocaleString('en-US')}`;
        stats.avgPayout = `$${parseFloat(stats.avgPayout).toFixed(2).toLocaleString('en-US')}`;
        stats.maxPayout = `$${stats.maxPayout.toLocaleString('en-US')}`;
        stats.numPayouts = stats.numPayouts.toLocaleString('en-US');
    
        // Adding each statistic to the data array as a request if it is not null
        for ([key, value] of Object.entries(stats)) {
            if (value != null && value != '$NaN') {
                const row = rowDict[key] + offset;
        
                let cell = `${column}${row}`
        
                if (key == "numHomes") {
                    cell = `B${row}`
                }
        
                let request = {
                    range: `Sheet1!${cell}:${cell}`,
                    values: [[value]]
                };
    
                data.push(request)
            }
        }
    }

    return Promise.resolve(data)
}

/**
 *  Generates all request jsons and then calls batch update 
 *  to update the google sheets document all at once
 * */
async function runner(files) {
    let data = []
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    
    // ID for the google sheet, found between the 'd/' tag and the '/edit' tag in the url
    const spreadsheetId = "1INGKUPbuG252SgYVGpTHGXuEE_41V1evgaTOIZ0bix4";

    await genRequests(files, data).then((data1) => {
        googleSheets.spreadsheets.values.batchUpdate({
            auth: auth, //auth object
            spreadsheetId: spreadsheetId, //spreadsheet id
            resource: {
                data: data1,
                valueInputOption: "USER_ENTERED"
            }
        })
    })
}

// Local directory for all statistic files
const files = fs.readdirSync('../../samplebooks/').slice(2);

// Function call
runner(files)