const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables');

const newideas = new mongoose.Schema({
        userid: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        username:{
            type: String,
            required: true
        },
        idea: {
            type: String,
            required: false
        },
        createdAt: {
            type: String,
            required: true
        },
        timestamp:{
            type: Number,
            required: false
        },
        approveIdea :{
            type : Boolean,
            required : true
        }
    },
    {
        versionKey : false,
        timestamps: {
            createdAt: 'createTime',
            updatedAt: 'updatedTime'
        }
    });

newideas.plugin(dataTables);
module.exports = mongoose.model('ideasUser', newideas);