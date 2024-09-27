const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
		userId:{
			type: mongoose.Schema.Types.ObjectId,
			required: true
		},
		username:{
			type: String,
			required: true
		},
		address:{
			type: String,
			required: false
		},
		city:{
			type: String,
			required: false,
		},
		pincode:{
			type: String,
			required: false,
		},
		account_no:{
			type: String,
			required: false
		},
		bank_name:{
			type: String,
			required: false
		},
		ifsc_code:{
			type: String,
			required: false
		},
		account_holder_name:{
			type: String,
			required: false
		},
		paytm_number:{
			type: String,
			required: false
		},
		changeDetails : {
			type: Array,
			required: false
		},
		created_at:{
			type: String,
			required: true
		},
		updatedAt:{
			type: String,
			required: false
		},
		profileChangeCounter: {
			type: Number,
			required: false
		}
	},
	{
		versionKey : false
	});

module.exports = mongoose.model('user_profile', profileSchema);
