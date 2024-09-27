const mongoose = require("mongoose");

const upi_payments = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		upi_name_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		fullname: {
			type: String,
			required: true,
		},
		upi_name: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		mobile: {
			type: String,
			required: true,
		},
		reqAmount: {
			type: Number,
			required: true,
		},
		reqType: {
			type: String,
			required: true,
		},
		reqStatus: {
			type: String,
			required: true,
		},
		reqDate: {
			type: String,
			required: true,
		},
		reqTime: {
			type: String,
			required: true,
		},
		paymentMode: {
			type: String,
			required: true,
		},
		refrence_no: {
			type: String,
			required: false,
		},
		transaction_id: {
			type: String,
			required: false,
		},
		upi_app_name: {
			type: String,
			required: false,
		},
		updateAt: {
			type: String,
			required: false,
		},
		timestamp: {
			type: Number,
			required: true,
		},
	},
	{
		versionKey: false,
		timestamps: {
			createdAt: 'createTime',
			updatedAt: 'updatedTime'
		}
	}
);

module.exports = mongoose.model("UPI_payments", upi_payments);
