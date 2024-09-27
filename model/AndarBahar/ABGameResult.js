const mongoose = require('mongoose');
const abgamesResultSchema = new mongoose.Schema({

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
            required: false
        },
        resultDate:{
            type: String,
            required: true
        },
        winningDigit:{
            type: String,
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

module.exports = mongoose.model('ab_game_Result', abgamesResultSchema);
