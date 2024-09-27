const mongoose = require('mongoose');
const stargameListSchema = new mongoose.Schema({
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

module.exports = mongoose.model('starline_game_types', stargameListSchema);
