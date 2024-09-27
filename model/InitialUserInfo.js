const mongoose = require('mongoose');

const InitialUserInfoSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: false
    },
    Otp: {
        type: Number,
        required: false
    },
    status: {
        type: Number,
        required: false
    },
    currentTime:{
        type:Number,
        required: false
    }
},
    {
        timestamps: {
            createdAt: 'createTime',
            updatedAt: 'updatedTime'
        }
    });

module.exports = mongoose.model('InitialUserInfo', InitialUserInfoSchema);