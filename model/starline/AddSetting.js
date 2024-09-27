const mongoose = require('mongoose');
const stargamesSettingSchema = new mongoose.Schema({

        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        gameDay:{
            type: String,
            required: true
        },
        OBT:{
            type: String,
            required: true
        },
        CBT:{
            type: String,
            required: true
        },
        OBRT:{
            type: String,
            required: true
        },
        isClosed:{
            type: String,
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

module.exports = mongoose.model('starline_games_setting', stargamesSettingSchema);
