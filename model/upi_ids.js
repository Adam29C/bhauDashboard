const mongoose = require('mongoose');

const UPI_Schema = new mongoose.Schema({
        UPI_ID: {
            type: String,
            required: true
        },
        bank_name: {
            type: String,
            required: false
        },
        updated_at: {
            type: String,
            required: true
        },
        is_Active:{
            type: Boolean,
            required: true
        },
        is_Active_chat:{
            type: Boolean,
            required: false
        },
        merchantName:{
            type: String,
            required: false
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('UPI_IDS', UPI_Schema);