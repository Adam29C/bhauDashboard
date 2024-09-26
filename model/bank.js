const mongoose = require('mongoose');
const bankSchema = new mongoose.Schema({
        bankName: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        
        status: {
            type: String,
            required: true
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('Bank', bankSchema);
