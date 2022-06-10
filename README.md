# All-States-Visualization


## Files

### zipPolygon.json

This file is generated from boudaries-io by RAPID API. This API estimates each zip code in the United States as a geojson polygon. The json is an array of geojson objects
each with a defined zip code.

### uszips.csv

This file is a document that tracks the population of each zipcode in the US. Sola uses this file to generate sample homeowners based on population density.

## Scripts

### createhomeowners.js

The main function that gets called in this file is **addTests()**.

This function parses through each zip code in **uszips.csv** and creates x number of homes based on the population of that zip code given by **zipPolygon.json**.

### findDamage.js

The main function in this file is findHouses(). This function takes in a date and a state and returns all houses that have been hit by a tornado 


