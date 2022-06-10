const express = require('express')
const router = express.Router()


router.get('/', (req, res) => {
    res.redirect('/payouts/alabama')
})

router.get('/alabama', (req, res) => {
    res.render('DAT Model/index', {
        state: 'alabama',
        zoom: 5.5,
        center: [-86.7835, 32.8794],
        year: 2021,
        acc: true
    })
})

router.post('/alabama', (req, res) => {
    res.render('DAT Model/index', {
        state: 'alabama',
        zoom: 5.5,
        center: [-86.7835, 32.8794],
        year: req.body.year,
        acc: true
    })
})

router.get('/oklahoma', (req, res) => {
    res.render('DAT Model/index', {
        state: 'oklahoma',
        zoom: 5.6,
        center: [-98.4929, 35.2078],
        year: 2021,
        acc: false
    })
})

router.post('/oklahoma', (req, res) => {
    res.render('DAT Model/index', {
        state: 'oklahoma',
        zoom: 5.6,
        center: [-98.4929, 35.2078],
        year: req.body.year,
        acc: false
    })
})

router.get('/arkansas', (req, res) => {
    res.render('DAT Model/index', {
        state: 'arkansas',
        zoom: 5.53,
        center: [-91.8318, 34.7010],
        year: 2021,
        acc: true
    })
})

router.post('/arkansas', (req, res) => {
    res.render('DAT Model/index', {
        state: 'arkansas',
        zoom: 5.53,
        center: [-91.8318, 34.7010],
        year: req.body.year,
        acc: true
    })
})

router.get('/florida', (req, res) => {
    res.render('DAT Model/index', {
        state: 'florida',
        zoom: 5.2,
        center: [-83.5158, 27.9648],
        year: 2021,
        acc: true
    })
})

router.post('/florida', (req, res) => {
    res.render('DAT Model/index', {
        state: 'florida',
        zoom: 5.2,
        center: [-83.5158, 27.9648],
        year: req.body.year,
        acc: true
    })
})

router.get('/georgia', (req, res) => {
    res.render('DAT Model/index', {
        state: 'georgia',
        zoom: 5.53,
        center: [-82.9023, 32.7182],
        year: 2021,
        acc: false
    })
})

router.post('/georgia', (req, res) => {
    res.render('DAT Model/index', {
        state: 'georgia',
        zoom: 5.53,
        center: [-82.9023, 32.7182],
        year: req.body.year,
        acc: false
    })
})

router.get('/illinois', (req, res) => {
    res.render('DAT Model/index', {
        state: 'illinois',
        zoom: 5.15,
        center: [-89.3985, 39.8331],
        year: 2021,
        acc: false
    })
})

router.post('/illinois', (req, res) => {
    res.render('DAT Model/index', {
        state: 'illinois',
        zoom: 5.15,
        center: [-89.3985, 39.8331],
        year: req.body.year,
        acc: false
    })
})

router.get('/indiana', (req, res) => {
    res.render('DAT Model/index', {
        state: 'indiana',
        zoom: 5.53,
        center: [-86.1023, 39.8672],
        year: 2021,
        acc: false
    })
})

router.post('/indiana', (req, res) => {
    res.render('DAT Model/index', {
        state: 'indiana',
        zoom: 5.53,
        center: [-86.1023, 39.8672],
        year: req.body.year,
        acc: false
    })
})

router.get('/iowa', (req, res) => {
    res.render('DAT Model/index', {
        state: 'iowa',
        zoom: 0,
        center: [0,0],
        year: 2021,
        acc: false
    })
})

router.post('/iowa', (req, res) => {
    res.render('DAT Model/index', {
        state: 'iowa',
        zoom: 0,
        center: [0,0],
        year: req.body.year,
        acc: false
    })
})

router.get('/kansas', (req, res) => {
    res.render('DAT Model/index', {
        state: 'kansas',
        zoom: 5.53,
        center: [-98.4842, 38.5119],
        year: 2021,
        acc: false
    })
})

router.post('/kansas', (req, res) => {
    res.render('DAT Model/index', {
        state: 'kansas',
        zoom: 5.53,
        center: [-98.4842, 38.5119],
        year: req.body.year,
        acc: false
    })
})

router.get('/kentucky', (req, res) => {
    res.render('DAT Model/index', {
        state: 'kentucky',
        zoom: 5.75,
        center: [-86.2000, 37.8393],
        year: 2021,
        acc: false
    })
})

router.post('/kentucky', (req, res) => {
    res.render('DAT Model/index', {
        state: 'kentucky',
        zoom: 5.75,
        center: [-86.2000, 37.8393],
        year: req.body.year,
        acc: false
    })
})

router.get('/louisiana', (req, res) => {
    res.render('DAT Model/index', {
        state: 'louisiana',
        zoom: 5.65,
        center: [-91.9623, 31.1843],
        year: 2021,
        acc: true
    })
})

router.post('/louisiana', (req, res) => {
    res.render('DAT Model/index', {
        state: 'louisiana',
        zoom: 5.65,
        center: [-91.9623, 31.1843],
        year: req.body.year,
        acc: true
    })
})

router.get('/mississippi', (req, res) => {
    res.render('DAT Model/index', {
        state: 'mississippi',
        zoom: 5.45,
        center: [-89.9023, 32.7182],
        year: 2021,
        acc: true
    })
})

router.post('/mississippi', (req, res) => {
    res.render('DAT Model/index', {
        state: 'mississippi',
        zoom: 5.45,
        center: [-89.9023, 32.7182],
        year: req.body.year,
        acc: true
    })
})

router.get('/missouri', (req, res) => {
    res.render('DAT Model/index', {
        state: 'missouri',
        zoom: 5.4,
        center: [-92.9318, 38.3643],
        year: 2021,
        acc: false
    })
})

router.post('/missouri', (req, res) => {
    res.render('DAT Model/index', {
        state: 'missouri',
        zoom: 5.4,
        center: [-92.9318, 38.3643],
        year: req.body.year,
        acc: false
    })
})

router.get('/nebraska', (req, res) => {
    res.render('DAT Model/index', {
        state: 'nebraska',
        zoom: 5.53,
        center: [-99.9018, 41.4925],
        year: 2021,
        acc: true
    })
})

router.post('/nebraska', (req, res) => {
    res.render('DAT Model/index', {
        state: 'nebraska',
        zoom: 5.53,
        center: [-99.9018, 41.4925],
        year: req.body.year,
        acc: true
    })
})

router.get('/ohio', (req, res) => {
    res.render('DAT Model/index', {
        state: 'ohio',
        zoom: 5.65,
        center: [-82.9071, 40.2173],
        year: 2021,
        acc: true
    })
})

router.post('/ohio', (req, res) => {
    res.render('DAT Model/index', {
        state: 'ohio',
        zoom: 5.65,
        center: [-82.9071, 40.2173],
        year: req.body.year,
        acc: true
    })
})

router.get('/pennsylvania', (req, res) => {
    res.render('DAT Model/index', {
        state: 'pennsylvania',
        zoom: 5.85,
        center: [-77.6945, 40.8033],
        year: 2021,
        acc: true
    })
})

router.post('/pennsylvania', (req, res) => {
    res.render('DAT Model/index', {
        state: 'pennsylvania',
        zoom: 5.85,
        center: [-77.6945, 40.8033],
        year: req.body.year,
        acc: true
    })
})

router.get('/tennessee', (req, res) => {
    res.render('DAT Model/index', {
        state: 'tennessee',
        zoom: 6.0,
        center: [-86.2023, 35.7182],
        year: 2021,
        acc: true
    })
})

router.post('/tennessee', (req, res) => {
    res.render('DAT Model/index', {
        state: 'tennessee',
        zoom: 6.0,
        center: [-86.2023, 35.7182],
        year: req.body.year,
        acc: true
    })
})

router.get('/texas', (req, res) => {
    res.render('DAT Model/index', {
        state: 'texas',
        zoom: 4.3,
        center: [-99.9018, 31.4686],
        year: 2021,
        acc: false
    })
})

router.post('/texas', (req, res) => {
    res.render('DAT Model/index', {
        state: 'texas',
        zoom: 4.3,
        center: [-99.9018, 31.4686],
        year: req.body.year,
        acc: false
    })
})

router.get('/wisconsin', (req, res) => {
    res.render('DAT Model/index', {
        state: 'wisconsin',
        zoom: 5.25,
        center: [-89.5879, 44.6844],
        year: 2021,
        acc: false
    })
})

router.post('/wisconsin', (req, res) => {
    res.render('DAT Model/index', {
        state: 'wisconsin',
        zoom: 5.25,
        center: [-89.5879, 44.6844],
        year: req.body.year,
        acc: false
    })
})

module.exports = router