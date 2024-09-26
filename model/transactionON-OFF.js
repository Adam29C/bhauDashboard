const mongoose = require("mongoose");
const tranSchema = new mongoose.Schema(
	{
		mode: {
			type: String,
			required: true,
		},
		disabled: {
			type: Boolean,
			required: true,
		},
		redirectURL: {
			type: String,
			required: false,
		},
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model("transaction-0n-off", tranSchema);
