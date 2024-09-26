const mongoose = require('mongoose');
const starlinegamesResultSchema = new mongoose.Schema({

        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        providerName: {
            type: String,
            required: true
        },
        session:{
            type: String,
            required: true
        },
        resultDate:{
            type: String,
            required: true
        },
        winningDigit:{
            type: String,
            required: true
        },
        winningDigitFamily:{
            type: Number,
            required: true
        },
        createdAt:{
            type: String,
            required: true
        },
        status:{
            type: Number,
            required: true
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('starline_game_Result', starlinegamesResultSchema);
