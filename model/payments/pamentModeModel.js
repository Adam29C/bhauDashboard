const mongoose = require('mongoose');
const paymentModesSchema = new mongoose.Schema({
    paymentMode: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('PaymentModes', paymentModesSchema);
