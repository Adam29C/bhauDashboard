const mongoose = require('mongoose');

const digitsSchema = new mongoose.Schema({
        Digit: {
            type: String,
            required: true
        },
        DigitFamily:{
            type: String,
            required: true
        },
        createDate:{
            type:Date,
            default:Date.now 
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('220Digits', digitsSchema);