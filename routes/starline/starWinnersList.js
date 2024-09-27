const router = require('express').Router();
const bids = require('../../model/API/Bids');
var dateTime = require('node-datetime');
const Mongoose = require('mongoose');
const session = require('../helpersModule/session');

router.get('/', session, async (req, res)=>{
    const dt = dateTime.create();
    const formatted = dt.format('m/d/Y');
    const id = Mongoose.Types.ObjectId('5d32cc5d14cc2220ccf5b467');
    bids.aggregate([
        {
            $match: {
                "game_date": formatted,
                "game_provider_id" : id,
            }
        },
        {
            $group: {
                _id : "$game_type_id",
                "resultDetails" : {
                    $push: "$$ROOT"
                },
                "count": {
                    $sum: 1
                }
            }
        }
    ],function (error, lookup) {
        if (error) throw error;
        else  {
            res.json(lookup);
        }
    });
});

module.exports = router;
