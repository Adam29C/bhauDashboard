const router = require("express").Router();
const StarList = require("../../model/starline/Starline_Provider");
const Starbids = require("../../model/starline/StarlineBids");
// const mongodb = require("mongodb");
const { ObjectId } = require('mongodb');
const session = require("../helpersModule/session");
const digits = require("../../model/digits");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
	try {
		const provider = await StarList.find({}, { providerName: 1, _id: 1 }).sort({
			_id: 1,
		});
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["starlineProfit"].showStatus;
		if (check === 1) {
			res.render("./starline/starLinePF", {
				data: provider,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Starline Profit Loss",
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
	const provider = req.body.provider;
	const date = req.body.date;
	try {
		const data1 = await Starbids.aggregate([
			{ $match: { providerId: new ObjectId(provider), gameDate: date } },
			{
				$group: {
					_id: "$gameTypeId",
					sumdigit: { $sum: "$biddingPoints" },
					countBid: { $sum: 1 },
					gameType: { $first: "$gameSession" },
					gameTypeName: { $first: "$gameTypeName" },
					bidDigit: { $first: "$bidDigit" },
				},
			},
		]);

		//Data by bids and game type
		const data2 = await Starbids.aggregate([
			{ $match: { providerId: new ObjectId(provider), gameDate: date } },
			{
				$group: {
					_id: "$bidDigit",
					sumdigit: { $sum: "$biddingPoints" },
					countBid: { $sum: 1 },
					date: { $first: "$gameDate" },
					gamePrice: { $first: "$gameTypePrice" },
				},
			},
		]);
		const pana = await digits.find();
		res.json({ data: data1, data2: data2, pana: pana });
	} catch (error) {
		res.json(error);
	}
});

router.post("/getBidData", session, async (req, res) => {
	const date = req.body.date;
	const bidDigit = req.body.bidDigit;
	const gameId = req.body.id;
	try {
		const bidData = await Starbids.find({
			gameDate: date,
			providerId: gameId,
			bidDigit: bidDigit,
		});
		res.json(bidData);
	} catch (e) {
		res.json(e);
	}
});

module.exports = router;
