const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    ApprovedIDs: {
        type: Array,
        required: false
    },
    ReportName: {
        type: String,
        required: true
    },
    ReportTime: {
        type: String,
        required: true
    },
    ReportDate: {
        type: String,
        required: true
    },
    adminName: {
        type: String,
        required: true
    }
},
    {
        versionKey: false,
        timestamps: {
            createdAt: 'createTime',
            updatedAt: 'updatedTime'
        }
    }
);

module.exports = mongoose.model('DailyWithdraw', reportSchema);