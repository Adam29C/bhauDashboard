const router = require('express').Router();
const verify = require('../verifyTokens');
const starType = require('../../../model/starline/GameList');
const mainType = require('../../../model/games/GameList');
const abType = require('../../../model/AndarBahar/ABGameList');

router.get('/starLineGameType',async (req, res) => {
    try {
        const provider = await starType.find({}, {_id : 1, gameName: 1, gamePrice: 1}).sort({_id: 1});
        res.status(200).json({
                status: 1,
                message: 'Success',
                gameTypes: provider
            });
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: 'Something Went Wrong',
            error: error
        });
    }
});

router.get('/ABgameGameType', verify, async (req, res) => {
    try {
        const provider = await abType.find({}, {_id : 1, gameName: 1, gamePrice: 1}).sort({_id: 1});
        res.status(200).json({status: 1, message: 'Success', gameTypes: provider,});
            
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: 'Something Went Wrong',
            error: error
        });    
    }
});

router.get('/gameType', verify, async (req, res) => {
    try {
        const provider = await mainType.find({}, {_id : 1, gameName: 1, gamePrice: 1}).sort({_id: 1});
        res.status(200).json({status: 1, message: 'Success', gameTypes: provider,});        
    } catch (error) {
        res.status(400).json({
            status: 0,
            message: 'Something Went Wrong',
            error: error
        });
    }
});

module.exports = router;