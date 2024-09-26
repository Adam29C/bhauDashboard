const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables')

const walletHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    bidId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    filterType: {
        type: Number,  //0: Bid Placed, 1: Bid Status Won, 2: Bid Status Loss, 3: Bid Status Refund, 4: Fund Credit, 5: Fund Debit, 6 : Fund Declined, 7: Account Update Charge, 8: Payment Revert 
        required: false
    },
    provider_ssession: {
        type: String,
        required: false
    },
    addedBy_name: {
        type: String,
        required: false
    },
    previous_amount: {
        type: Number,
        required: true
    },
    current_amount: {
        type: Number,
        required: true
    },
    transaction_amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    transaction_date: {
        type: String,
        required: true
    },
    transaction_time: {
        type: String,
        required: true
    },
    transaction_status: {
        type: String,
        required: true
    },
    win_revert_status: {
        type: Number,
        required: false
    },
    particular: {
        type: String,
        required: false
    },
    upiId: {
        type: String,
    },
    timestamp: {
        type: Number,
    },
    fullname: {
        type: String,
    },
    reqType: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: false
    },
    transaction_id: {
        type: String,
        required: false
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

walletHistorySchema.plugin(dataTables);
module.exports = mongoose.model('wallet_history', walletHistorySchema);