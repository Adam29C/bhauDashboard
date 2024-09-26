const mongoose = require('mongoose');

const  RatioAnalysys = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    totalBids:{
        type: Number,
        required: false
    },
    totalWin:{
        type: Number,
        required: false
    },
    totalLoss:{
        type: Number,
        required: false
    },
    totalPending:{
        type: Number,
        required: false
    },
    totalBidsAmount:{
        type: Number,
        required: false,
    },
    totalWinAmount:{
        type: Number,
        required: false
    },
    marketRatio : {
        type: Array,
        required: false
    }
},
{
    versionKey : false
});

module.exports = mongoose.model('user_Bids_Analysys', RatioAnalysys);