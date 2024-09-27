const mongoose = require("mongoose");
const dataTables = require("mongoose-datatables");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			min: 3,
			max: 255,
		},
		password: {
			type: String,
			required: false,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		role: {
			type: String,
			required: false,
		},
		email: {
			type: String,
			required: false,
		},
		mobile: {
			type: String,
			required: true,
			unique: true,
		},
		firebaseId: {
			type: String,
			required: false,
		},
		deviceName: {
			type: String,
			required: true,
		},
		deviceId: {
			type: String,
			required: true,
			unique: true,
		},
		banned: {
			type: Boolean,
			required: true,
			// false : Not Banned, true : Banned
		},
		wallet_balance: {
			type: Number,
			required: false,
		},
		wallet_bal_updated_at: {
			type: String,
			required: false,
		},
		mpin: {
			type: String,
			required: false,
		},
		fingerPrint:{
			type:String,
			required: false,
		},
		register_via: {
			type: Number,
			required: false,
			//1 : registered from android, 2 : registered from web
		},
		mpinOtp: {
			type: Number,
			required: false,
		},
		deviceVeriOTP: {
			type: Number,
		},
		forgotOtp:{
			type:Number,
		},
		forgotOtpTime:{
			type:Number,
		},
		CreatedAt: {
			type: String,
			required: true,
		},
		UpdatedAt: {
			type: String,
			required: false,
		},
		changeDetails: {
			type: Array,
			required: false,
		},
		loginStatus: {
			type: String,
			required: true,
		},
		mainNotification: {
			type: Boolean,
			required: true,
		},
		gameNotification: {
			type: Boolean,
			required: true,
		},
		starLineNotification: {
			type: Boolean,
			required: true,
		},
		andarBaharNotification: {
			type: Boolean,
			required: true,
		},
		time: {
			type: String,
			required: false,
		},
		timestamp: {
			type: Number,
			required: false,
		},
		blockReason: {
			type: String,
			required: false,
		},
		lastLoginDate:{
			type: String,
			required: false,
		},
		withdrawalCount:{
			type:Number,
			default:0,
		},
		withdrawalTime:{
			type:Date,
			default:Date.now
		}
	},
	{
		versionKey: false,
	}
);

userSchema.plugin(dataTables, uniqueValidator);
module.exports = mongoose.model("Users", userSchema);
