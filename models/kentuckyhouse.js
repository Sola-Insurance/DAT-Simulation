const mongoose = require('mongoose')

// a Policyholder represents one home
const phSchema = new mongoose.Schema({

    /**
     * Payouts you have received
     * {
     *     2010: [2000],
     *     2011: [2000,5000],
     *     2012: []
     * }
     */
    total: {
        type: JSON,
        default: {},
    },
    zip: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
})

module.exports = mongoose.model('Kentucky House', phSchema)