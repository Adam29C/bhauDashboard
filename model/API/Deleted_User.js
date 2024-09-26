const mongoose = require('mongoose');
const dataTables = require('mongoose-datatables');

const userSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    name: {
        type: String,
        required: false
    },
    username:{
        type: String,
        required: false
    },
    mobile:{
        type: String,
        required: false
    },
    CreatedAt: {
        type: String,
        required: false
    },
},
{
  versionKey : false
});

userSchema.plugin(dataTables);
module.exports = mongoose.model('Deleted_User', userSchema);