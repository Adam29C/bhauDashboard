const router = require('express').Router();
const starline = require('../../../model/starline/StarlineBids');
const AB = require('../../../model/AndarBahar/ABbids');
const game_bids = require('../../../model/games/gameBids');
const Starline_Provider = require('../../../model/starline/Starline_Provider');
const AB_provider = require('../../../model/AndarBahar/ABProvider');
const game_provider = require('../../../model/games/Games_Provider');
const fundreq =require('../../../model/API/FundRequest');
const verify = require('../verifyTokens');

router.post('/stalineBidsPagination', verify, async(req, res)=>{
    try 
    {
        let perPage = 50;
        let page = parseInt(req.body.skipValue);
        let userId = req.body.userId;
        starline.find({userId : userId})
            .sort({_id: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage).exec(function (err, hisdata) {
                if (err) throw err;    
                if(Object.keys(hisdata).length > 0){
                    starline.countDocuments({userId : userId}).exec((err, count) => {
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
                        message: "No Bid History Found"
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

router.post('/abBidsPagination', verify, async(req, res)=>{
    try {   
        let perPage = 50;
        let page = parseInt(req.body.skipValue);
        let userId = req.body.userId;
        AB.find({userId : userId})
            .sort({_id: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage).exec(function (err, hisdata) {
                if (err) throw err;  
                 if(Object.keys(hisdata).length > 0){
                    AB.countDocuments({userId : userId}).exec((err, count) => {
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
                        message: "No Bid History Found"
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

router.post('/gameBidsPagination', verify, async(req, res)=>{
    try 
    {
        let perPage = 50;
        let page = parseInt(req.body.skipValue);
        let userId = req.body.userId;
        game_bids.find({userId : userId})
            .sort({_id: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage).exec(function (err, hisdata) {
                if (err) throw err;    
                if(Object.keys(hisdata).length > 0){
                    game_bids.countDocuments({userId : userId}).exec((err, count) => {
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
                        message: "No Bid History Found"
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

router.post('/stalineBidsFilter',  async(req, res)=>{
    try 
    {
        let perPage = 50;
        let page = parseInt(req.body.skipValue);
        let userId = req.body.userId;
        const idArray = req.body.providerId;
        const statusArray = req.body.status;

        let query = {userId : userId, providerId:{$in:idArray},winStatus:{$in:statusArray}}

        let lengthIds = Object.keys(idArray).length;
        let lenghtStats = Object.keys(statusArray).length;

        if(lenghtStats != 0 && lengthIds == 0){
            query = {userId : userId, winStatus:{$in:statusArray}}
        }
        else if(lenghtStats == 0 && lengthIds != 0){
            query = {userId : userId, providerId:{$in:idArray}}
        }
        else if(lenghtStats == 0 && lengthIds == 0){
            query = {userId : userId}
        }


        starline.find(query)
            .sort({_id: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage).exec(function (err, hisdata) {
                if (err) throw err;    
                if(Object.keys(hisdata).length > 0){
                    starline.countDocuments(query).exec((err, count) => {
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
                        message: "No Bid History Found"
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

router.post('/abBidsFilter',  async(req, res)=>{
    try {   
        let perPage = 50;
        let page = parseInt(req.body.skipValue);
        let userId = req.body.userId;
        const idArray = req.body.providerId;
        const statusArray = req.body.status;

        let query = {userId : userId, providerId:{$in:idArray},winStatus:{$in:statusArray}}

        let lengthIds = Object.keys(idArray).length;
        let lenghtStats = Object.keys(statusArray).length;

        if(lenghtStats != 0 && lengthIds == 0){
            query = {userId : userId, winStatus:{$in:statusArray}}
        }
        else if(lenghtStats == 0 && lengthIds != 0){
            query = {userId : userId, providerId:{$in:idArray}}
        }
        else if(lenghtStats == 0 && lengthIds == 0){
            query = {userId : userId}
        }


        AB.find(query)
            .sort({_id: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage).exec(function (err, hisdata) {
                if (err) throw err;  
                 if(Object.keys(hisdata).length > 0){
                    AB.countDocuments(query).exec((err, count) => {
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
                        message: "No Bid History Found"
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

router.post('/gameBidsFilter',  async(req, res)=>{
    try 
    {
        let perPage = 50;
        let page = parseInt(req.body.skipValue);
        let userId = req.body.userId;
        const idArray = req.body.providerId;
        const sessionArray = req.body.session;
        const statusArray = req.body.status;

        //default Query
        let query = {userId : userId, providerId:{$in:idArray},gameSession: {$in:sessionArray},winStatus:{$in:statusArray} }

        let lengthIds = Object.keys(idArray).length;
        let lengthSess = Object.keys(sessionArray).length;
        let lenghtStats = Object.keys(statusArray).length;

        if(lengthIds == 0 && lengthSess == 0 && lenghtStats == 0){
            query = {userId : userId}
        }
        else if(lengthIds != 0 && lengthSess == 0 && lenghtStats == 0){
            query = {userId : userId, providerId:{$in:idArray}}
        }
        else if(lengthIds == 0 && lengthSess != 0 && lenghtStats == 0){
            query = {userId : userId, gameSession: {$in:sessionArray}}
        }
        else if(lengthIds == 0 && lengthSess == 0 && lenghtStats != 0){
            query = {userId : userId, winStatus:{$in:statusArray}}
        }
        else if(lengthIds != 0 && lengthSess != 0 && lenghtStats == 0){
            query = {userId : userId, providerId:{$in:idArray}, gameSession: {$in:sessionArray}}
        }
        else if(lengthIds != 0 && lengthSess == 0 && lenghtStats != 0){
            query = {userId : userId, providerId:{$in:idArray}, winStatus:{$in:statusArray}}
        }
        else if(lengthIds == 0 && lengthSess != 0 && lenghtStats != 0){
            query = {userId : userId, gameSession: {$in:sessionArray}, winStatus:{$in:statusArray}}
        }

        game_bids.find(query)
            .sort({_id: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage).exec(function (err, hisdata) {
                if (err) throw err;    
                if(Object.keys(hisdata).length > 0){
                    game_bids.countDocuments(query).exec((err, count) => {
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
                        message: "No Bid History Found"
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

router.post('/providers',  async(req, res)=>{
    try 
    {
        const switchCase = req.body.case;
        let message = "Success";
        let providers;

        switch(switchCase) {
            case '1':
                providers =  await game_provider.find();
                break;
            case '2':
                providers =  await AB_provider.find();
                break;
            case '3':
                providers =  await Starline_Provider.find();
                break;
            default : 
                message  :"Invalid Case"
                break;
        }

        res.json({
            status : 1,
            message : message,
            data : providers
        })
    }
    catch (e) {
        res.status(400).json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error : e
        });
    }
});

router.post('/getBid', async(req, res)=>{
    try {
        const {id, type} = req.body;
        let data = [];

        switch (type) {
            case "main":
                data = await game_bids.findOne({_id : id})
                break;

            case "star":
                data = await starline.findOne({_id : id})
                break;

            case "andarBahar":
                data = await AB.findOne({_id : id})
                break;

            default : 
                data = await fundreq.findOne({_id : id},{ UpdatedBy: 0, fromExport : 0, from : 0 })
                break;
        }

        res.json({
            status : 1,
            message : "Success",
            data : data
        })
    } catch (error) {
        res.json({
            status : 0,
            message : `Server Errror : ${error.toString()}`
        })
    }
});

module.exports = router;