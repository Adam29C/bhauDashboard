const mongoose = require('mongoose');

const noticeBoardSchema = new mongoose.Schema({
        title1: {
            type: String,
            required: true
        },
        description1: {
            type: String,
            required: true
        },
        title2: {
            type: String,
            required: true
        },
        description2: {
            type: String,
            required: true
        },
        title3: {
            type: String,
            required: true
        },
        description3: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
        },
        modified:{
            type: Date,
            default: Date.now()
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('NoticeBoard', noticeBoardSchema);
