const router = require("express").Router();
const verify = require("../verifyTokens");
const bids = require("../../../model/AndarBahar/ABbids");
const Sbids = require("../../../model/starline/StarlineBids");
const Gbids = require("../../../model/games/gameBids");
const gameSetting = require("../../../model/games/AddSetting");
const stargameSetting = require("../../../model/starline/AddSetting");
const abGameSetting = require("../../../model/AndarBahar/ABAddSetting");
const dashboard = require("../../../model/MainPage");
const UserKS = require("../../../model/API/Users");
const history = require("../../../model/wallet_history");
const dateTime = require("node-datetime");
const moment = require("moment");
const Pusher = require("pusher");

router.get("/", verify, async (req, res) => {
	res.json({ status: 0, message: "Access Denied" });
});

router.post("/abBids", verify, async (req, res) => {
	try {
		const bidDatarray = req.body.bidData;
		const userId = req.body.userId;
		const Balance = req.body.bidSum;
		const user = await UserKS.findOne({ _id: userId });
		const userName = bidDatarray[0].userName;
		let historyDataArray = [];
		if (user) {
			const providerId = req.body.providerId;
			const gameDate = req.body.gameDate;
			const dayName = moment(gameDate, "MM/DD/YYYY").format("dddd");
			const findTime = await abGameSetting.findOne({
				providerId: providerId,
				gameDay: dayName,
			});
			const closeTime = findTime.CBT;
			const openTime = findTime.OBT;

			checksatrBid(openTime, closeTime, dayName).then(async function (data) {
				let checkStatus = parseInt(data);
				if (checkStatus === 1) {
					const dt = dateTime.create();
					const currentDate = dt.format("d/m/Y");
					let formatted2 = dt.format("d/m/Y I:M:S p");
					let walletBal = user.wallet_balance;
					const updatedWallet = walletBal - Balance;

					if (walletBal >= Balance) {
						const arr = await bids.insertMany(bidDatarray);
						await UserKS.updateOne(
							{ _id: userId },
							{ $set: { wallet_balance: updatedWallet } }
						);
						for (index in arr) {
							previous_amount = walletBal;
							walletBal = walletBal - arr[index].biddingPoints;
							let time = dt.format("I:M:S p");
							let arrValue = {
								userId: userId,
								bidId: arr[index]._id,
								reqType : "andarBahar",
								previous_amount: previous_amount,
								current_amount: walletBal,
								transaction_amount: arr[index].biddingPoints,
								username: userName,
								filterType : 0,
								description:
									arr[index].providerName +
									" (" +
									arr[index].gameTypeName +
									") : " +
									arr[index].bidDigit,
								transaction_date: currentDate,
								transaction_time: time,
								transaction_status: "Success",
							};
							historyDataArray.push(arrValue);
						}
						await history.insertMany(historyDataArray);
						return res.status(200).send({
							status: 1,
							message: "Bids Placed Successfully",
							updatedWalletBal: updatedWallet,
						});
					}else{
						return res.status(200).send({
							status: 2,
							message: "Insufficient Wallet Amount",
						});
					}
				} else {
					return res.status(200).send({
						status: 2,
						message:
							"Sorry Your Bid Cannot Be Placed, Bid-Time Closed For The Following Game",
					});
				}
			});
		} else {
			return res.status(200).send({
				status: 0,
				message: "User Not Found",
			});
		}
	} catch (e) {
		res.status(400).json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
			error: e,
		});
	}
});

router.post("/starLineBids", verify, async (req, res) => {
	try {
		const bidDatarray = req.body.bidData;
		const userId = req.body.userId;
		const Balance = req.body.bidSum;
		const user = await UserKS.findOne({ _id: userId });
		const userName = bidDatarray[0].userName;
		let historyDataArray = [];
		if (user) {
			const providerId = req.body.providerId;
			const gameDate = req.body.gameDate;
			const dayName = moment(gameDate, "MM-DD-YYYY").format("dddd");
			const findTime = await stargameSetting.findOne({
				providerId: providerId,
				gameDay: dayName,
			});
			const closeTime = findTime.CBT;
			const openTime = findTime.OBT;
			checksatrBid(openTime, closeTime, dayName).then(async function (data) {
				let checkStatus = parseInt(data);
				if (checkStatus === 1) {
					const dt = dateTime.create();
					const currentDate = dt.format("d/m/Y");
					let formatted2 = dt.format("d/m/Y I:M:S p");
					let walletBal = user.wallet_balance;
					const updatedWallet = walletBal - Balance;

					if (walletBal >= Balance) {
						const arr = await Sbids.insertMany(bidDatarray);
						await UserKS.updateOne(
							{ _id: userId },
							{
								$set: {
									wallet_balance: updatedWallet,
								},
							});

						for (index in arr) {
							previous_amount = walletBal;
							walletBal = walletBal - arr[index].biddingPoints;
							let dt0 = dateTime.create();
							let time = dt0.format("I:M:S p");
							let arrValue = {
								userId: userId,
								bidId: arr[index]._id,
								previous_amount: previous_amount,
								current_amount: walletBal,
								reqType : "star",
								transaction_amount: arr[index].biddingPoints,
								username: userName,
								filterType : 0,
								description:
									arr[index].providerName +
									" (" +
									arr[index].gameTypeName +
									") : " +
									arr[index].bidDigit,
								transaction_date: currentDate,
								transaction_time: time,
								transaction_status: "Success",
							};
							historyDataArray.push(arrValue);
						}
	
						await history.insertMany(historyDataArray);
						return res.status(200).send({
								status: 1,
								message: "Bids Placed Successfully",
								updatedWalletBal: updatedWallet,
							});
					}
					else{
						res.status(200).send({
							status: 2,
							message: "Insufficient Wallet Amount",
						});
					}
				} else {
					return res.status(200).send({
						status: 2,
						message: "Sorry Your Bid Cannot Be Placed, Bid-Time Closed For The Following Game",
					});
				}
			});
		} else {
			return res.status(200).send({
				status: 0,
				message: "User Not Found",
			});
		}
	} catch (e) {
		res.status(400).json({
			status: 0,
			message: "Something Bad Happened Contact The Support",
			error: e,
		});
	}
});

router.post("/game_bids", verify, async (req, res) => {
	try {
		const userId = req.body.userId;
		const user = await UserKS.findOne({ _id: userId });
		if (user) {
			const bidDatarray = req.body.bidData;
			const userName = bidDatarray[0].userName;
			const Balance = req.body.bidSum;
			let previous_amount = 0;
			let historyDataArray = [];
			const providerId = req.body.providerId;
			const gameDate = req.body.gameDate;
			const gameSession = req.body.gameSession;
			const dayName = moment(gameDate, "MM-DD-YYYY").format("dddd");
			const findTime = await gameSetting.findOne(
				{ providerId: providerId, gameDay: dayName },
				{ OBT: 1, CBT: 1, gameDay: 1 }
			);
			const openTime = findTime.OBT;
			const closeTime = findTime.CBT;
			const gameDay = findTime.gameDay;
			checkBid(openTime, closeTime, gameSession, gameDay).then(async function (
				data
			) {
				let checkStatus = parseInt(data);
				if (checkStatus === 1) {
					let dt = dateTime.create();
					let currentDate = dt.format("d/m/Y");
					let formatted2 = dt.format("d/m/Y I:M:S p");
					let walletBal = user.wallet_balance;
					const updatedWallet = walletBal - Balance;

					if (walletBal >= Balance) {
						const arr = await Gbids.insertMany(bidDatarray);

						await UserKS.updateOne(
							{ _id: userId },
							{
								$set: {
									wallet_balance: updatedWallet,
								},
							}
						);

						for (index in arr) {
							previous_amount = walletBal;
							walletBal = walletBal - arr[index].biddingPoints;
							let time = dt.format("I:M:S p");
							let arrValue = {
								userId: userId,
								bidId: arr[index]._id,
								reqType : "main",
								previous_amount: previous_amount,
								current_amount: walletBal,
								transaction_amount: arr[index].biddingPoints,
								username: userName,
								filterType : 0,
								description:
									arr[index].providerName +
									" (" +
									arr[index].gameTypeName +
									", " +
									arr[index].gameSession +
									" ) :  " +
									arr[index].bidDigit,
								transaction_date: currentDate,
								transaction_time: time,
								transaction_status: "Success",
							};
							historyDataArray.push(arrValue);
						}
						await history.insertMany(historyDataArray);

						return res.status(200).send({
							status: 1,
							message: "Bids Placed Successfully",
							updatedWalletBal: updatedWallet,
						});
					} else {
						return res.status(200).send({
							status: 2,
							message: "Insufficient Wallet Amount",
						});
					}
				} else {
					return res.status(200).send({
						status: 2,
						message:
							"Sorry Your Bid Cannot Be Placed, Bid-Time Closed For The Following Game",
					});
				}
			});
		} else {
			return res.status(200).send({
				status: 0,
				message: "User Not Found",
			});
		}
	} catch (e) {
		return res.status(400).json({
			status: 0,
			message: "Something Bad Happened Contact The Support",
			error: e,
		});
	}
});

async function checkBid(OBT, CBT, session, gameDay) {
	const OpenTime = OBT;
	const CloseTime = CBT;
	const day = gameDay;
	const dt3 = dateTime.create();
	const time = dt3.format("I:M p");
	const current = moment(time, "HH:mm a");
	const endTime = moment(CloseTime, "HH:mm a");
	const startTime = moment(OpenTime, "HH:mm a");
	const dt2 = dateTime.create();
	const todayDay = dt2.format("W");
	let status = 1;

	if (day == todayDay) {
		if (session === "Open") {
			if (current > startTime) {
				status = 0;
			}
		} else {
			if (current > endTime) {
				status = 0;
			}
		}
		return Promise.resolve(status);
	} else {
		return Promise.resolve(status);
	}
}

async function checksatrBid(OBT, CBT, gameDay) {
	const CloseTime = CBT;
	const day = gameDay;
	const dt3 = dateTime.create();
	const time = dt3.format("I:M p");
	const current = moment(time, "HH:mm a");
	const endTime = moment(CloseTime, "HH:mm a");
	const dt2 = dateTime.create();
	const todayDay = dt2.format("W");
	let status = 1;

	if (day == todayDay) {
		if (current > endTime) {
			status = 0;
		}
		return Promise.resolve(status);
	} else {
		return Promise.resolve(0);
	}
}

module.exports = router;