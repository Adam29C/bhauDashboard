const mongoose = require('mongoose');
const StarbidsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    gameTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    gameTypePrice:{
        type: Number,
        required: true
    },
    providerName: {
        type: String,
        required: true
    }, 
    gameTypeName:{
        type: String,
        required: false
    },
    userName: {
        type: String,
        required: true
    }, 
    mobileNumber:{
        type: String,
        required: true
    },
    bidDigit:{
        type: String,
        required: true
    },
    biddingPoints:{
        type: Number,
        required: true
    },
    winStatus:{
        type: Number,
        required: true
    },
    gameWinPoints:{
        type: Number,
        required: true
    },
    gameDate:{
        type: String,
        required: true
    },
    dateStamp:{
        type: Number,
        required: false
    },
    gameSession:{
        type: String,
        required: true
    },
    createdAt:{
        type: String,
        required: true
    },
    updatedAt:{
        type: String,
        required: true
    }
    },
    {
        versionKey : false,
        timestamps: {
            createdAt: 'createTime',
            updatedAt: 'updatedTime'
        }
    });

module.exports = mongoose.model('starline_bids', StarbidsSchema);
