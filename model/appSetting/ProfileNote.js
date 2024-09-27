const mongoose = require('mongoose');

const profileNoteSchema = new mongoose.Schema({
        note: {
            type: String,
            required: true
        },
        modified:{
            type: Date,
            default: Date.now()
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('ProfileNote', profileNoteSchema);
