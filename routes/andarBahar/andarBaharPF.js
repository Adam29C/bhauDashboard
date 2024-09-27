const router = require("express").Router();
const mongodb = require("mongodb");
const { ObjectId } = require('mongodb');
const ABList = require("../../model/AndarBahar/ABProvider");
const ABtype = require("../../model/AndarBahar/ABGameList");
const ABbids = require("../../model/AndarBahar/ABbids");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
	try {
		const provider = await ABList.find({}, { providerName: 1, _id: 1 }).sort({
			_id: 1,
		});
		const userInfo = req.session.details;
		const permissionArray = req.view;
		let check = permissionArray["abProftLoss"].showStatus;
		if (check === 1) {
			res.render("./andarbahar/ABprofitloss", {
				data: provider,
				userInfo: userInfo,
				permission: permissionArray,
				title: "AB Profit Loss",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (e) {
		res.json({ message: e });
	}
});

router.post("/getResult", async (req, res) => {
	try {
		const provider = req.body.provider;
		const date = req.body.date;
		let type = await ABtype.find(
			{},
			{ gamePrice: 1, _id: 1, gameName: 1 }
		).sort({ _id: 1 });
        const data1 = await ABbids.aggregate([
			{ $match: { providerId: new ObjectId(provider), gameDate: date } },
			{
				$group: {
					_id: "$gameTypeId",
					sumdigit: { $sum: "$biddingPoints" },
					countBid: { $sum: 1 },
					gameType: { $first: "$gameSession" },
				},
			},
		]);
		const data2 = await ABbids.aggregate([
			{ $match: { providerId: new ObjectId(provider), gameDate: date } },
			{
				$group: {
					_id: "$bidDigit",
					sumdigit: { $sum: "$biddingPoints" },
					countBid: { $sum: 1 },
					date: { $first: "$gameDate" },
				},
			},
		]);
		res.json({ data: data1, data2: data2, type: type });
	} catch (error) {
		res.json(error);
	}
});

router.post("/getBidData", session, async (req, res) => {
	const date = req.body.date;
	const bidDigit = req.body.bidDigit;
	const gameId = req.body.id;
	try {
		const bidData = await ABbids.find({
			providerId: gameId,
			gameDate: date,
			bidDigit: bidDigit,
		}).sort({ _id: 1 });
		res.json(bidData);
	} catch (e) {
		res.json(e);
	}
});

module.exports = router;
