const mongoose = require('mongoose');

const walletContactSchema = new mongoose.Schema({
        number: {
            type: String,
            required: true
        },
        headline:{
            type:String,
        },
        upiId:{
            type:String,
        },
        modified:{
            type: Date,
            default: Date.now()
        }
    },
    {
        timeStamp:true,
        // versionKey : false
    });

module.exports = mongoose.model('walletContact', walletContactSchema);
