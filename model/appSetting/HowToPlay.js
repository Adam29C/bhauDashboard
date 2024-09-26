const mongoose = require('mongoose');

const howtoplaySchema = new mongoose.Schema({
    howtoplay: [
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            videoUrl: {
                type: String,
                required: true
            },
            modified: {
                type: Date,
                default: Date.now()
            }
        }
    ]
}, {
    versionKey: false
});

module.exports = mongoose.model('HowToPlay', howtoplaySchema);
