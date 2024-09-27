const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
        total_wallet_balance: {
            type: Number,
            required: true
        },
        total_user:{
            type: Number,
            required: true
        },
        banned_Users:{
            type: Number,
            required: true
        },
        totol_bids:{
            type: Number,
            required: true
        },
        total_paid_today:{
            type: Number,
            required: true
        },
        Active_users:{
            type: Number,
            required: true
        },
        total_zero_bal_users:{
            type: Number,
            required: true
        },
        today_total_zero_bal_users:{
            type: Number,
            required: true
        },
        total_withdraw_amount:{
            type: Number,
            required: true
        },
        total_deposit_amount:{
            type: Number,
            required: true
        },
        todayRegistered:{
            type: Number,
            required: true
        },
        current_Week_regis_user:{
            type: Number,
            required: true
        },
        current_month_Registered:{
            type: Number,
            required: true
        },
        lastmonthRegistered:{
            type: Number,
            required: true
        },
        lastweekRegistered:{
            type: Number,
            required: true
        },
        lastUpdatedAt:{
            type: String,
            required: true
        },
        yesterdayRegistered:{
            type: Number,
            required: true
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('dashBoard_data', dashboardSchema);