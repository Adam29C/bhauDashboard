const mongoose = require('mongoose');
const ABListSchema = new mongoose.Schema({
        gameName: {
            type: String,
            required: true
        },
        gamePrice:{
            type: Number,
            required: true
        },
        modifiedAt:{
            type: String,
            required: true
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('ab_game_types', ABListSchema);
