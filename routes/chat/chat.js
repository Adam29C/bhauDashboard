const multer = require('multer');
const multerS3 = require('multer-s3');
const router = require("express").Router();
const { S3Client } = require('@aws-sdk/client-s3');
const Chat = require("../../model/chat");
const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const s3Storage = multerS3({
    s3: s3,
    bucket: "bhau777bucket",
    acl: "public-read",
    metadata: (req, file, cb) => {
        cb(null, { fieldname: file.fieldname });
    },
    key: (req, file, cb) => {
        const fileName = `uploads/${file.fieldname}_${file.originalname}`;
        cb(null, fileName);
    },
});
const multerInstanceForUpload = multer({
    storage: s3Storage,
});
router.post('/sendMessage', multerInstanceForUpload.array('images', 10), async (req, res) => {
    const { sender, receiver, message } = req.body;
    let images = []
    if(req.file){
        images = req.file.map(file => file.location);
    }
    if (!sender || !receiver || (!message && images.length === 0)) {
        return res.status(400).json({
            statusCode: 400,
            status: false,
            msg: "Missing required fields"
        });
    }
    try {
        let chat = await Chat.findOne({ users: { $all: [sender, receiver] } });
        if (!chat) {
            chat = new Chat({ users: [sender, receiver], messages: [] });
        }
        const newMessage = { sender, message, images };
        chat.messages.push(newMessage);
        await chat.save();
        return res.status(200).json({
            statusCode: 200,
            status: true,
            msg: "Message sent"
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            status: false,
            msg: "Internal Server Error"
        });
    }
});
router.get('/receive', async (req, res) => {
    const { user1, user2 } = req.query;
    try {
        const chat = await Chat.findOne({ users: { $all: [user1, user2] } });
        if (!chat) {
            return res.status(404).json({
                statusCode: 404,
                status: false,
                msg: "No messages found"
            });
        }
        return res.status(200).json({
            statusCode: 200,
            status: true,
            data: chat.messages
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            status: false,
            msg: "Internal Server Error"
        });
    }
});
router.get('/allChatHistory', async (req, res) => {
    try {
        const chats = await Chat.find();
        return res.status(200).json({
            statusCode: 200,
            status: true,
            data: chats
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            status: false,
            msg: "Internal Server Error"
        });
    }
});
module.exports = router;