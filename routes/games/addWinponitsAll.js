const router = require('express').Router();
const user = require('../../model/API/Users');
const history = require('../../model/wallet_history');
const abResult = require('../../model/AndarBahar/ABGameResult');
const ABbids = require('../../model/AndarBahar/ABbids');
const starResult = require('../../model/starline/GameResult');
const starBIds = require('../../model/starline/StarlineBids');
const gameBids = require('../../model/games/gameBids');
const gameResult = require('../../model/games/GameResult');
const Loginsession = require('../helpersModule/session');
const notification = require('../helpersModule/sendNotification');
const gameSum = require('../../model/dashBoard/BidSumGames');
const dateTime = require('node-datetime');
const Pusher = require('pusher');

router.post('/gameWinner', Loginsession, async (req, res) => {
    try {
        const provider = req.body.providerId;
        const digit = req.body.windigit;
        const gamedate = req.body.gameDate;
        const digitFamily = req.body.digitFamily;
        const resultId = req.body.resultId;
        const session = req.body.session;
        const userInfo = req.session.details;
        const adminId = userInfo.user_id;
        const adminName = userInfo.username;
        let historyDataArray = [];
        let tokenArray = [];
        let resultList = '';
        let totalPoints = 0;
        let namefor = '';

        resultList = await gameBids.find({
            $and: [
                { $or: [{ bidDigit: digit }, { bidDigit: digitFamily }] }], providerId: provider, gameDate: gamedate, gameSession: session
        }).sort({ bidDigit: 1 });

        calculateSum(session, provider, gamedate);
        if (session === 'Close') {
            const jodiDigit = req.body.jodiDigit;
            const halfSangam1 = req.body.halfSangam1;
            const halfSangam2 = req.body.halfSangam2;
            const fullSangam = req.body.fullSangam;

            const winnerListJoidClose = await gameBids.find({
                $and: [
                    { $or: [{ bidDigit: jodiDigit }] }], providerId: provider, gameDate: gamedate, gameSession: session
            }).sort({ bidDigit: 1 });

            const winnerListClose = await gameBids.find({
                $and: [
                    { $or: [{ bidDigit: halfSangam1 }, { bidDigit: halfSangam2 }, { bidDigit: fullSangam }] }], providerId: provider, gameDate: gamedate, gameSession: session
            }).sort({ bidDigit: 1 });

            if (Object.keys(resultList).length === 0) {
                resultList = winnerListJoidClose.concat(winnerListClose);
            }
            else {
                resultList = resultList.concat(winnerListJoidClose, winnerListClose);
            }
        }
        const dt0 = dateTime.create();
        const date = dt0.format('d/m/Y');
        const formatted = dt0.format('m/d/Y I:M:S p');
        const formatted2 = dt0.format('d/m/Y I:M:S p');

        for (index in resultList) {
            let bidPoint = resultList[index].biddingPoints;
            let gamePrice = resultList[index].gameTypePrice;
            let bal = bidPoint * gamePrice;
            totalPoints += bal;
            let userID = resultList[index].userId;
            let id = resultList[index]._id;
            let gameName = resultList[index].providerName;
            namefor = gameName;
            let gameType = resultList[index].gameTypeName;
            await gameBids.updateOne(
                { _id: id },
                {
                    $set: {
                        winStatus: 1,
                        gameWinPoints: bal,
                        updatedAt: formatted
                    }
                });

            const userBal = await user.findOne({ _id: userID }, {
                wallet_balance: 1, username: 1,
                firebaseId: 1
            });

            if (userBal) {
                const previous_amount = userBal.wallet_balance;
                const current_amount = previous_amount + bal;
                const name = userBal.username;
                const userToken = userBal.firebaseId;
                await user.updateOne(
                    { _id: userID },
                    { $inc: { wallet_balance: bal } },
                    {
                        $set: {
                            wallet_bal_updated_at: formatted2
                        }
                    });

                let dt1 = dateTime.create();
                let time = dt1.format('I:M:S p');
                let arrValue = {
                    userId: userID,
                    bidId: id,
                    reqType: "main",
                    previous_amount: previous_amount,
                    current_amount: current_amount,
                    provider_id: provider,
                    transaction_amount: bal,
                    username: name,
                    provider_ssession: session,
                    description: "Amount Added To Wallet For " + gameName + " : " + gameType + " Game Win",
                    transaction_date: date,
                    filterType: 1,
                    transaction_status: "Success",
                    win_revert_status: 1,
                    transaction_time: time,
                    admin_id: adminId,
                    addedBy_name: adminName
                }
                historyDataArray.push(arrValue);
                let token = {
                    firebaseId: userToken,
                    amount: bal
                }
                tokenArray.push(token);
            }
        }

        await history.insertMany(historyDataArray);
        await gameResult.updateOne(
            { _id: resultId },
            { $set: { status: 1 } });

        await gameBids.updateMany(
            { winStatus: 0, providerId: provider, gameDate: gamedate, gameSession: session },
            {
                $set:
                {
                    winStatus: 2,
                    updatedAt: formatted
                }
            }
        );

        let sumDgit = namefor;
        notification(req, res, sumDgit, tokenArray);
        refreshEveryWhere(5205);
        res.status(200).send({
            status: 1,
            message: 'Points Added Successfully'
        });

    } catch (error) {
        res.status(400).send({
            status: 0,
            message: 'Contact Support',
            error: error
        });
    }
});

router.post('/abWinners', Loginsession, async (req, res) => {
    try {
        const provider = req.body.providerId;
        const digit = req.body.windigit;
        const date = req.body.gameDate;
        const gamePrice = req.body.gamePrice;
        const resultId = req.body.resultId;
        const userInfo = req.session.details;
        const adminId = userInfo.user_id;
        const adminName = userInfo.username;
        let namefor = '';
        let historyDataArray = []; let tokenArray = [];
        const resultList = await ABbids.find({ providerId: provider, bidDigit: digit, gameDate: date }).sort({ _id: -1 });

        const dt0 = dateTime.create();
        const todayDate = dt0.format('d/m/Y');
        let formatted = dt0.format('m/d/Y I:M:S p');
        let formatted2 = dt0.format('d/m/Y I:M:S p');
        for (index in resultList) {

            let bidPoint = resultList[index].biddingPoints;
            let bal = bidPoint * gamePrice;
            let userID = resultList[index].userId;
            let id = resultList[index]._id;
            let gameName = resultList[index].providerName;
            let gameType = resultList[index].gameTypeName;
            namefor = 'Jackpot (' + gameName + ')';
            await ABbids.updateOne(
                { _id: id },
                {
                    $set: {
                        winStatus: 1,
                        gameWinPoints: bal,
                        updatedAt: formatted
                    }
                });
            const userBal = await user.findOne({ _id: userID }, {
                wallet_balance: 1, username: 1,
                firebaseId: 1
            });
            const previous_amount = userBal.wallet_balance;
            const current_amount = previous_amount + bal;
            const username = userBal.username;
            const userToken = userBal.firebaseId;

            await user.updateOne(
                { _id: userID },
                { $inc: { wallet_balance: bal } },
                {
                    $set: {
                        wallet_bal_updated_at: formatted2
                    }
                });

            let time = dt0.format('I:M:S p');
            let arrValue = {
                userId: userID,
                bidId: id,
                reqType: "andarBahar",
                previous_amount: previous_amount,
                current_amount: current_amount,
                provider_id: provider,
                transaction_amount: bal,
                username: username,
                description: "Amount Added To Wallet For " + gameName + " : " + gameType + " Jackpot Game Win",
                transaction_date: todayDate,
                filterType: 1,
                transaction_time: time,
                transaction_status: "Success",
                win_revert_status: 1,
                admin_id: adminId,
                addedBy_name: adminName
            }
            historyDataArray.push(arrValue);
            // let token = {
            //     firebaseId : userToken,
            //     gameName : 'Dhan Jackpot ('+ gameName + ')'
            // }
            let token = {
                firebaseId: userToken,
                amount: bal
            }
            tokenArray.push(token);
        }

        await history.insertMany(historyDataArray);
        await abResult.updateOne(
            { _id: resultId },
            { $set: { status: 1 } });

        await ABbids.updateMany(
            { winStatus: 0, providerId: provider, gameDate: date },
            {
                $set:
                {
                    winStatus: 2,
                    updatedAt: formatted
                }
            }
        );

        let sumDgit = namefor;
        notification(req, res, sumDgit, tokenArray);
        refreshEveryWhere(5207)
        res.status(200).send({
            status: 1,
            message: 'Points Added Successfully'
        });
    } catch (error) {
        res.status(400).send({
            status: 0,
            message: 'Something Bad Happened',
            error: error
        });
    }
});

router.post('/starWinners', Loginsession, async (req, res) => {
    try {
        const provider = req.body.providerId;
        const digit = req.body.windigit;
        const date = req.body.gameDate;
        const digitFamily = req.body.digitFamily;
        const resultId = req.body.resultId;
        const userInfo = req.session.details;
        const adminId = userInfo.user_id;
        const adminName = userInfo.username;
        let namefor = '';
        let historyDataArray = []; let tokenArray = [];
        const resultList = await starBIds.find({
            $and: [
                { $or: [{ bidDigit: digit }, { bidDigit: digitFamily }] }
            ], providerId: provider, gameDate: date
        }).sort({ _id: -1 });

        const dt0 = dateTime.create();
        const todayDate = dt0.format('d/m/Y');
        const formatted = dt0.format('m/d/Y I:M:S p');
        const formatted2 = dt0.format('d/m/Y I:M:S p');
        for (index in resultList) {
            let bidPoint = resultList[index].biddingPoints;
            let gamePrice = resultList[index].gameTypePrice;
            let bal = bidPoint * gamePrice;
            let userID = resultList[index].userId;
            let id = resultList[index]._id;
            let gameName = resultList[index].providerName;
            let gameType = resultList[index].gameTypeName;
            namefor = 'Starline (' + gameName + ')'
            await starBIds.updateOne(
                { _id: id },
                {
                    $set: {
                        winStatus: 1,
                        gameWinPoints: bal,
                        updatedAt: formatted
                    }
                });
            const userBal = await user.findOne({ _id: userID }, {
                wallet_balance: 1, username: 1,
                firebaseId: 1
            });
            const previous_amount = userBal.wallet_balance;
            const current_amount = previous_amount + bal;
            const name = userBal.username;
            const userToken = userBal.firebaseId;
            await user.updateOne(
                { _id: userID },
                { $inc: { wallet_balance: bal } },
                {
                    $set: {
                        wallet_bal_updated_at: formatted2
                    }
                });

            let dt1 = dateTime.create();
            let time = dt1.format('I:M:S p');
            let arrValue = {
                userId: userID,
                bidId: id,
                reqType: "star",
                previous_amount: previous_amount,
                current_amount: current_amount,
                provider_id: provider,
                transaction_amount: bal,
                username: name,
                description: "Amount Added To Wallet For " + gameName + " : " + gameType + " Khatri Starline Game Win",
                transaction_date: todayDate,
                filterType: 1,
                transaction_time: time,
                transaction_status: "Success",
                win_revert_status: 1,
                admin_id: adminId,
                addedBy_name: adminName
            }
            historyDataArray.push(arrValue);
            let token = {
                firebaseId: userToken,
                amount: bal
            }
            tokenArray.push(token);
        }

        await history.insertMany(historyDataArray);
        await starResult.updateOne(
            { _id: resultId },
            { $set: { status: 1 } });

        await starBIds.updateMany(
            { providerId: provider, gameDate: date, winStatus: 0, gameSession: 'Open' },
            {
                $set:
                {
                    winStatus: 2,
                    updatedAt: formatted
                }
            }
        );

        let sumDgit = namefor;
        notification(req, res, sumDgit, tokenArray);
        refreshEveryWhere(5206);
        res.status(200).send({
            status: 1,
            message: 'Points Added Successfully'
        });

    } catch (error) {

        res.status(400).send({
            status: 0,
            message: 'Something Bad Happened',
            error: error
        });
    }
});

async function calculateSum(session, providerId, gameDate) {
    try {
        if (session == "Open") {
            const bids = await gameBids.find({ providerId: providerId, gameDate: gameDate, $and: [{ $or: [{ gameTypeName: "Jodi Digit" }, { gameTypeName: "Full Sangam Digits" }, { gameTypeName: "Half Sangam Digits" }] }] });

            let jodiPrice = 0; let halfSangam = 0; let fullSangam = 0;

            for (index in bids) {
                let bidDigit = bids[index].bidDigit;
                let strLength = bidDigit.length;
                let points = bids[index].biddingPoints;
                switch (strLength) {
                    case 2:
                        jodiPrice = jodiPrice + points;
                        break;
                    case 5:
                        halfSangam = halfSangam + points;
                        break;
                    case 7:
                        fullSangam = fullSangam + points;
                        break;
                }
            }

            const sum = new gameSum({
                providerId: providerId,
                date: gameDate,
                half_Sangamsum: halfSangam,
                full_Sangamsum: fullSangam,
                Jodi_Sum: jodiPrice
            })
            await sum.save();
        }
    } catch (error) {
        console.log(error);
    }
}


async function refreshEveryWhere(checkNum) {

    const channels_client = new Pusher({
        appId: '1024162',
        key: 'c5324b557c7f3a56788a',
        secret: 'c75c293b0250419f6161',
        cluster: 'ap2'
    });

    channels_client.trigger('my-channel', 'my-event', {
        "type": checkNum
    });

}

module.exports = router;