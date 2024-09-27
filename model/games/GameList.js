const mongoose = require('mongoose');
const gameListSchema = new mongoose.Schema({

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

module.exports = mongoose.model('game_types', gameListSchema);
