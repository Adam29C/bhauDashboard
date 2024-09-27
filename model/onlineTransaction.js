const mongoose = require("mongoose");

const payments = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		fullname: {
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
		transaction_id: {
			type: String,
			required: true,
		},
		reqStatus: {
			type: String,
			required: true,
		},
		reqDescription: {
			type: String,
			required: true,
		},
		reqDate: {
			type: String,
			required: true,
		},
		mode: {
			type: String,
			required: false,
		},
		timestamp: {
			type: Number,
			required: true,
		},
		allResponse: {
			type: String,
			required: false,
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

module.exports = mongoose.model("gateway_payment", payments);
