const mongoose = require("mongoose");
const dataTables = require("mongoose-datatables");
const kgDg = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		mobile: {
			type: String,
			required: true,
		},
		wallet_balance: {
			type: Number,
			required: true,
		},
	},
	{
		versionKey: false,
	}
);

kgDg.plugin(dataTables);
module.exports = mongoose.model("kgDg", kgDg);
