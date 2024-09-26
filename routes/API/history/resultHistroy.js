const router = require('express').Router();
const starline = require('../../../model/starline/GameResult');
const AB = require('../../../model/AndarBahar/ABGameResult');
const gameResult = require('../../../model/games/GameResult');
const fund = require('../../../model/API/FundRequest');
const verify = require('../verifyTokens');
const moment = require('moment');

router.post('/starlineHistory', verify, async (req, res)=>{
    
    try{
        const date = req.body.date;
        const formatDate = moment(date , 'DD/MM/YYYY').format('MM/DD/YYYY');
        const resultData = await starline.find({resultDate : formatDate}).sort({_id: -1});    
        if (Object.keys(resultData).length === 0){
            res.status(200).json({
                status: 0,
                message: "No Result Found For Date : " + date
            });
        }
        else{
            res.status(200).json({
                status: 1,
                message: "Success",
                data: resultData
            });
        }
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/fundRequestHistory', verify, async (req, res)=>{
    try {
        const resultData = await fund.find({userId : req.body.id}).sort({_id: -1}).limit(30);
        if (Object.keys(resultData).length === 0){
            res.status(200).json({
                status: 0,
                message: "No Fund Request History"
            });
        }
        else{
            res.status(200).json({
                status: 1,
                message: "Success",
                data: resultData
            });
        }
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/creditRequestHistory', verify, async (req, res)=>{
    try {
        const resultData = await fund.find({userId : req.body.id, reqStatus: "Approved" , reqType: "Credit"}).sort({_id: -1}).limit(30);
        if (Object.keys(resultData).length === 0){
            res.status(200).json({
                status: 0,
                message: "No Credit Request History"
            });
        }
        else{
            res.status(200).json({
                status: 1,
                message: "Success",
                data: resultData
            });
        }
    }
    catch (e) {
        res.status(400).status(200).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/debitRequestHistory', verify, async (req, res)=>{
    try {
        const resultData = await fund.find({userId : req.body.id, reqStatus: "Approved" , reqType: "Debit"}).sort({_id: -1}).limit(30);
        if (Object.keys(resultData).length === 0){
            res.status(200).json({
                status: 0,
                message: "No Debit Request History"
            });
        }
        else{
            res.status(200).json({
                status: 1,
                message: "Success",
                data: resultData
            });
        }
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/andarBaharRequestHistory', verify, async (req, res)=>{
    try {
        const date = req.body.date;
        const formatDate = moment(date , 'DD/MM/YYYY').format('MM/DD/YYYY');
        const resultData = await AB.find({resultDate : formatDate}).sort({_id: -1}).limit(30);
        if (Object.keys(resultData).length === 0){
            res.status(200).json({
                status: 0,
                message: "No Result Found For Date : " + date
            });
        }
        else{
            res.status(200).json({
                status: 1,
                message: "Success",
                data: resultData
            });
        }
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/fundHistoryPagination', verify, async (req, res)=>{
    try {
        const userId = req.body.id;
        let perPage = 50;
        let page = parseInt(req.body.skipValue);
        fund.find({userId : userId})
            .sort({_id: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage).exec(function (err, hisdata) {
                if (err) throw err;  
                 if(Object.keys(hisdata).length > 0){
                    fund.countDocuments({userId : userId}).exec((err, count) => {
                    res.json({
                        status: 1,
                        records: hisdata,
                        current: page,
                        totalBids: count,
                        pages: Math.ceil(count / perPage),
                    });
                });
                }
                else{
                    res.json({
                        status: 0,
                        message: "No Fund History Found"
                    });
                }  
                 
            });
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/creditHistoryPagination', verify,async (req, res)=>{
    try {
       
        let userId = req.body.id;
        let perPage = 50;
        let page = parseInt(req.body.skipValue);
        fund.find({userId : userId, reqStatus: "Approved" , reqType: "Credit"})
            .sort({_id: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage).exec(function (err, hisdata) {
                if (err) throw err;  
                 if(Object.keys(hisdata).length > 0){
                    fund.countDocuments({userId : userId, reqStatus: "Approved" , reqType: "Credit"}).exec((err, count) => {
                    res.json({
                        status: 1,
                        records: hisdata,
                        current: page,
                        totalBids: count,
                        pages: Math.ceil(count / perPage),
                    });
                });
                }
                else{
                    res.json({
                        status: 0,
                        message: "No Credit History Found"
                    });
                }
            });
    }
    catch (e) {
        res.status(400).status(200).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/debitHistoryPagination', verify, async (req, res)=>{
    try {
        let userId = req.body.id;
        let perPage = 50;
        let page = parseInt(req.body.skipValue);
        fund.find({userId : userId, reqStatus: "Approved" , reqType: "Debit"})
            .sort({_id: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage).exec(function (err, hisdata) {
                if (err) throw err;  
                 if(Object.keys(hisdata).length > 0){
                    fund.countDocuments({userId : userId, reqStatus: "Approved" , reqType: "Debit"}).exec((err, count) => {
                    res.json({
                        status: 1,
                        records: hisdata,
                        current: page,
                        totalBids: count,
                        pages: Math.ceil(count / perPage),
                    });
                });
                }
                else{
                    res.json({
                        status: 0,
                        message: "No Debit History Found"
                    });
                }
            });
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/mainHistory', async (req, res)=>{
    try{
        const id = req.body.providerId;
        const resultData = await gameResult.find({"providerId": id});    
        if (Object.keys(resultData).length === 0){
            res.status(200).json({
                status: 0,
                message: "No Result Found"
            });
        }
        else{
            res.status(200).json({
                status: 1,
                message: "Success",
                data: resultData
            });
        }
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/jackpotHistory', async (req, res)=>{
    try{
        const id = req.body.providerId;
        const resultData = await AB.find({"providerId": id});    
        if (Object.keys(resultData).length === 0){
            res.status(200).json({
                status: 0,
                message: "No Result Found"
            });
        }
        else{
            res.status(200).json({
                status: 1,
                message: "Success",
                data: resultData
            });
        }
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/starlineHistoryWeb', async (req, res)=>{
    try{
        const id = req.body.providerId;
        const resultData = await starline.find({"providerId": id});    
        if (Object.keys(resultData).length === 0){
            res.status(200).json({
                status: 0,
                message: "No Result Found"
            });
        }
        else{
            res.status(200).json({
                status: 1,
                message: "Success",
                data: resultData
            });
        }
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

module.exports = router;
