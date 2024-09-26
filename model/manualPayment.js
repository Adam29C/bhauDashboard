const mongoose = require("mongoose");
const manualPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    userName: { type: String, },
    mobileNumber: { type: String },
    amount: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
      enm: ["pending", "approve", "decline"]
    },
    imageUrl: {
      type: String,
    },
    utrNumber: {
      type: String,
    },
    upiId: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'createTime',
      updatedAt: 'updatedTime'
    }
  }
);

module.exports = mongoose.model('manualPayment', manualPaymentSchema);
