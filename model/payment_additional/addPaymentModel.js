const mongoose = require('mongoose');

const paymentGatewaySchema = new mongoose.Schema({
    gatewayName: {
        type: String,
        required: true
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('PaymentMode', paymentGatewaySchema);
