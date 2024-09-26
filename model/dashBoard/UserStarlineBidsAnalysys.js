const mongoose = require('mongoose');

const  StarRatioAnalysys = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    totalBids:{
        type: String,
        required: true
    },
    totalWin:{
        type: String,
        required: true,
        unique: true
    },
    totalLoss:{
        type: String,
        required: true
    },
    totalPending:{
        type: Number,
        required: true
    },
    totalBidsAmount:{
        type: String,
        required: true,
        unique: true
    },
    totalWinAmount:{
        type: Number,
        required: true
    },
    marketRatio : {
        type: Array,
        required: true
    }
},
{
    versionKey : false
});

module.exports = mongoose.model('user_Starline_Bids_Analysys', StarRatioAnalysys);