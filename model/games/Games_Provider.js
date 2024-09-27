const mongoose = require("mongoose");
const gamesSchema = new mongoose.Schema(
	{
		providerName: {
			type: String,
			required: true,
		},
		providerResult: {
			type: String,
			required: false,
		},
		resultStatus: {
			type: Number,
			required: false,
		},
		activeStatus: {
			type: Boolean,
			required: false,
		},
		modifiedAt: {
			type: String,
			required: true,
		},
		mobile:{
			type: String,
			required: false,
		}
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model("games_provider", gamesSchema);
