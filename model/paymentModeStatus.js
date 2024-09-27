const mongoose = require('mongoose');

const payemnt_mode_status = new mongoose.Schema({
    modeName: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        require: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('paymentModeStatus', payemnt_mode_status);