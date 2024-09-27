const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables')

const fundreqSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    reqAmount: {
        type: Number,
        required: true
    },
    reqType: {
        type: String,
        required: true
    },
    reqStatus: {
        type: String,
        required: true
    },
    fromExport: {
        type: Boolean,
        required: false
    },
    from: {
        type: Number,   //0 : from export, 1: from chatpanel or view Wallet, 2 : from pending Debit
        required: false
    },
    toAccount: {
        accNumber: { type: String, required: false },
        ifscCode: { type: String, required: false },
        bankName: { type: String, required: false },
        accName: { type: String, required: false }
    },
    reqDate: {
        type: String,
        required: true
    },
    reqTime: {
        type: String,
        required: true
    },
    withdrawalMode: {
        type: String,
        required: true
    },
    UpdatedBy: {
        type: String,
        required: false
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    reqUpdatedAt: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: false
    }
},
    {
        versionKey: false,
        timestamps: {
            createdAt: 'createTime',
            updatedAt: 'updatedTime'
        }
    });

fundreqSchema.plugin(dataTables);
module.exports = mongoose.model('fund_request', fundreqSchema);