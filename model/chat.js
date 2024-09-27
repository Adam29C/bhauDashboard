const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const messageSchema = new Schema({
    sender: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    images: {
        type: [String] // Array of image filenames
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});
const chatSchema = new Schema({
    users: {
        type: [String],
        required: true
    },
    messages: [messageSchema]
});
module.exports = mongoose.model('Chat', chatSchema);