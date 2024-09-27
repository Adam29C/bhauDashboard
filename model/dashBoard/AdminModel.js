const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const AdminModel = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			min: 3,
			max: 255,
		},
		email: {
			type: String,
			required: false,
			max: 255,
			min: 6,
		},
		password: {
			type: String,
			required: true,
			max: 1024,
			min: 6,
		},
		username: {
			type: String,
			required: true,
			unique: true,
			max: 1024,
			min: 4,
		},
		designation: {
			type: String,
			required: true,
			max: 1024,
			min: 4,
		},
		role: {
			type: Number,
			required: true,
		},
		mobile: {
			type: String,
			required: false,
		},
		user_counter: {
			type: Number,
			required: true,
		},
		banned: {
			type: Number,
			required: true,
		},
		CtreatedAt: {
			type: Date,
			default: Date.now(),
		},
		loginStatus: {
			type: String,
			required: true,
		},
		last_login: {
			type: String,
			required: true,
		},
		col_view_permission: {
			type: Array,
			required: true,
		},
		loginFor: {
			type: Number,
			required: true,
		},
	},
	{
		versionKey: false,
	}
);

AdminModel.plugin(uniqueValidator);
module.exports = mongoose.model("admin", AdminModel);
