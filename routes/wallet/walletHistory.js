const router = require('express').Router();
const w_history = require('../../model/wallet_history');
const session = require('../helpersModule/session');

router.get('/history', session, async(req, res)=>{
    try {
        const historyData = await w_history.find();
        res.json(historyData);
    }
    catch (e) {
        res.json(e);
    }
});