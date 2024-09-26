const mongoose = require('mongoose');

const  sumModel = new mongoose.Schema({
    providerId: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    half_Sangamsum: {
        type: Number,
        required: true
    },
    full_Sangamsum:{
        type: Number,
        required: true
    },
    Jodi_Sum:{
        type: Number,
        required: true
    }
},
{
    versionKey : false
});

module.exports = mongoose.model('GameBidSum', sumModel);