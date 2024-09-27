const mongoose = require('mongoose');

const withDrawAppMessage = new mongoose.Schema({
        textMain : {
            type: String,
            required: true
        },
        textSecondry : {
            type: String,
            required: true
        },
        Number:{
            type: String,
            required: true
        },
        Timing:{
            type: String,
            required: true
        },
        updatedAt:{
            type: String,
            required: true
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('withDrawAppMessage', withDrawAppMessage);