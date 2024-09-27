const router = require('express').Router();
const Rules = require('../../../model/appSetting/HowToPlay');
const NoticeBoard = require('../../../model/appSetting/NoticeBoard');
const ProfileNOte  = require('../../../model/appSetting/ProfileNote');
const WalletContact  = require('../../../model/appSetting/WalletContact');
const verify = require('../verifyTokens');

router.get('/', verify, async (req, res)=>{
    try {
        const data = await Rules.find({});

        let finalData = data.length > 0 ? data[0]?.howtoplay : []

        res.json({
                status: 1,
                message: "Success",
                data: finalData
            });
    }
    catch (e) {
        res.status(400).send(
            {
                status: 0,
                message: 'Something Happened Please Contact the Support',
                error: e
            });
    }
});

router.get('/noticeBoard', verify, async (req, res)=>{
    try {
        const data = await NoticeBoard.find({},{ title1: 1,title2: 1,title3: 1,description1: 1,description2: 1, description3: 1 });
        res.json({
            status: 1,
            message: "Success",
            data: data
        });
    }
    catch (e) {
        res.status(400).send({
            status: 0,
            message: 'Something Happened Please Contact the Support',
            error: e
        });
    }
});

router.get('/profileNote', verify, async (req, res)=>{
    try {
        const data = await ProfileNOte.find({},{note : 1});
        res.json({
            status: 1,
            message: "Success",
            data: data
        });
    }
    catch (e) {
        res.status(400).send({
            status: 0,
            message: 'Something Happened Please Contact the Support',
            error: e
        });
    }
});

router.get('/walletContact', verify, async (req, res)=>{
    try {
        const data = await WalletContact.find({},{number: 1});
        res.json({
            status: 1,
            message: "Success",
            data: data
        });
    }
    catch (e) {
        res.status(400).send({
            status: 0,
            message: 'Something Happened Please Contact the Support',
            error: e
        });
    }
});

module.exports = router;