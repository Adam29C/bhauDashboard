const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables')

const gameAnalysisSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        gameWinPoints:{
            type: Number,
            required: false
        },
        gameBidPoint:{
            type: Number,
            required: false
        },
        starWinPoints:{
            type: Number,
            required: false
        },
        starBidPoint:{
            type: Number,
            required: false
        },
        AbWinPoints:{
            type: Number,
            required: false
        },
        AbBidPoint:{
            type: Number,
            required: false
        },
        totalPointsCredited:{
            type: Number,
            required: false
        },
        totalPointsDebited:{
            type: Number,
            required: false
        },
        username:{
            type: String,
            required: false
        },
        userLastPlayed:{
            type: String,
            required: false
        },
        updatedAt:{
            type: String,
            required: false
        }
    },
    {
        versionKey : false,
        timestamps: {
            createdAt: 'createTime',
            updatedAt: 'updatedTime'
        }
    });

gameAnalysisSchema.plugin(dataTables);
module.exports = mongoose.model('game_analysis', gameAnalysisSchema);