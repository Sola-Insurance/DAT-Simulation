const express = require('express')
const router = express.Router()


router.get('/', (req, res) => {
    res.render('documentation/index')
})

router.get('/methodology', (req, res) => {
    res.render('documentation/methodology')
})

router.get('/incomplete_data', (req, res) => {
    res.render('documentation/incomplete_data')
})

router.get('/future_plans', (req, res) => {
    res.render('documentation/future_plans')
})

module.exports = router