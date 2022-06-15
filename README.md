# All-States-Visualization


## Files

### zipPolygon.json

This file is generated from boudaries-io by RAPID API. This API estimates each zip code in the United States as a geojson polygon. The json is an array of geojson objects
each with a defined zip code.

Access this file here: https://drive.google.com/file/d/1Ug9p8d7yfrdGoGBbZ5EpDsjLyjCI7IpN/view?usp=sharing

### uszips.csv

This file is a document that tracks the population of each zipcode in the US. Sola uses this file to generate sample homeowners based on population density.

Access this file here: https://drive.google.com/file/d/1GJOIYf7mMxvY0qfCW6l2gnR82FBxE_3X/view?usp=sharing

## Scripts

### createhomeowners.js

The main function that gets called in this file is **addTests()**.

This function parses through each zip code in **uszips.csv** and creates x number of homes based on the population of that zip code given by **zipPolygon.json**.

### findDamage.js

The main function in this file is findHouses(). This function takes in a date and a state and returns all houses that have been hit by a tornado.

findHouses() starts by initiating an empty array and map. It then runs the function runGenGeoms() which calls the DAT and merges each feature into a multipolygon by EF level. runGenGeoms() returns a dictionary mapping an EF level with a multipolygon. 

findHouses() then continues by querying each sample policyholder that's within a given multipolygon for each EF level. These policyholders are then added to a map and stored in the database.

### generatePayout.js

This script simply calls findHouses() within findDamage.js and loops through each state for each year.

### generateGeoJson.js

This script takes the data from generatePayout and turns it into a visualization that can be passed into mapbox.

### scriptRunner.js

This script runs generatePayout then generateGeoJson to analyze payouts and generate visualizations for them.

### sheetGenerator.js

This script converts the data into a readable form in google sheets.


