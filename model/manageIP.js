const mongoose = require('mongoose');

const detectIP = new mongoose.Schema({
        ipAddress: {
            type: String,
            required: true
        },
        ipCount: {
            type: Number,
            required: true
        },
        modified:{
            type: String,
            default: true
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('ipBlock', detectIP);