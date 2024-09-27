const mongoose = require('mongoose');
const versionSchema = new mongoose.Schema({
        appVersion: {
            type: Number,
            required: false
        },
        forceUpdate: {
            type: Boolean,
            required: false
        },
        apkFileName: {
            type: String,
            required: false
        },
        maintainence: {
            type: Boolean,
            required: false
        },
        updatedOn: {
            type: String,
            required: false
        }
    },
    {
        versionKey : false
    });

module.exports = mongoose.model('VersionSetting', versionSchema);