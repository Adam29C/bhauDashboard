const { boolean } = require('@hapi/joi');
const mongoose = require('mongoose');

const reqOnOffSchema = new mongoose.Schema({
    dayNumber: {
        type: Number,
        required: true
    },
    dayName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        required: true
    },
    updatedAt: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
    },
    endTime: {
        type: String,
    },
    requestCount: {
        type: Number,
    },
    isRequest: {
        type: Boolean,
        default:false
    }
},
    {
        versionKey: false
    });

module.exports = mongoose.model('reqONoFF', reqOnOffSchema);