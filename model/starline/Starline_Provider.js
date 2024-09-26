const mongoose = require('mongoose');
const starlineSchema = new mongoose.Schema({

        providerName: {
            type: String,
            required: true
        },
        providerResult:{
            type: String,
            required: false
        },
        resultStatus:{
            type: Number,
            required: false
        },
        modifiedAt:{
            type: String,
            required: true
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('starline_provider', starlineSchema);
