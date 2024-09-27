const mongoose = require('mongoose');

const loginRecords = new mongoose.Schema({
        adminName: {
            type: String,
            required: true
        },
        loginIp:{
            type: String,
            required: true
        },
        loginCount:
        {
            type: Number,
            required: true
        },
        loginAt :{
            type: String,
            required: true
        },
        loginTime :{
            type: String,
            required: true
        }
    },
    {
        versionKey : false,
        timestamps: {
            createdAt: 'createTime',
            updatedAt: 'updatedTime'
        }
    });

module.exports = mongoose.model('Emp_loginRecord', loginRecords);
