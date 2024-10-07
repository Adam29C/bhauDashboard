const router = require("express").Router();
const StarlineProvider = require("../../model/starline/Starline_Provider");
const StarlinegameResult = require("../../model/starline/GameResult");
const starBids = require("../../model/starline/StarlineBids");
const gameDigit = require("../../model/digits");
const dateTime = require("node-datetime");
const session = require("../helpersModule/session");
const noti = require("../helpersModule/sendNotification");
const permission = require("../helpersModule/permission");
const gameSetting = require("../../model/starline/AddSetting");
const mainUser = require("../../model/API/Users");
const revertEntries = require("../../model/revertPayment");
const history = require("../../model/wallet_history");
const moment = require("moment");
const messaging = require("../../firebase")
const lodash = require('lodash');

router.get("/", session, permission, async (req, res) => {
	const dt = dateTime.create();
	const formatted = dt.format("m/d/Y");
	try {
		const provider = await StarlineProvider.find().sort({ _id: 1 });
		const result = await StarlinegameResult.find({
			resultDate: formatted,
		}).sort({ _id: -1 });
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["starlineResult"].showStatus;
		if (check === 1) {
			res.render("./starline/starlinegameresult", {
				data: provider,
				result: result,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Starline Game Result",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (e) {
		res.json(e);
	}
});

router.get("/revertPayment", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const role = userInfo.role;
		const permissionArray = req.view;
		const dt = dateTime.create();
		const formatted = dt.format("m/d/Y");
		const result = await StarlinegameResult.find()
			.sort({ _id: -1 })
			.where("resultDate")
			.equals(formatted);
		if (role === 0) {
			res.render("./starline/revert", {
				result: result,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Starline Payment Report",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (e) {
		res.json({
			status: 0,
			message: e,
		});
	}
});

router.delete("/delete", session, async (req, res) => {
	try {
		const dt = dateTime.create();
		const formatted1 = dt.format("m/d/Y I:M:S");
		const resultid = req.body.resultId;
		const providerId = req.body.providerId;
		const statusPast = req.body.dltPast;
		const dltResult = await StarlinegameResult.deleteOne({ _id: resultid });

		if (statusPast == 0) {
			await StarlineProvider.updateOne(
				{ _id: providerId },
				{
					$set: {
						providerResult: "***-**",
						modifiedAt: formatted1,
						resultStatus: 0,
					},
				}
			);
		}

		res.json({
			status: 1,
			message: "Result Deleted Successfully",
			data: dltResult,
		});
	} catch (e) {
		res.json({
			status: 0,
			message: "Server Error Contact Support",
			err: e,
		});
	}
});

router.post("/", session, async (req, res) => {
	try {
		const dt = dateTime.create();

		const str = req.body.providerId;
		const data = str.split("|");
		const id = data[0];
		const name = data[1];
		const date = req.body.resultDate;
		const digit = req.body.winningDigit;

		const formatted1 = dt.format("d/m/Y I:M:S p");
		const todayDay = dt.format("W");
		const todayDate = dt.format("m/d/Y");
		const currentTime = dt.format("I:M p");

		const findTime = await gameSetting.findOne(
			{ providerId: id, gameDay: todayDay },
			{ OBRT: 1, gameDay: 1 }
		);

		let timeCheck = findTime.OBRT;
		var beginningTime = moment(currentTime, "h:mm a");
		var endTime = moment(timeCheck, "h:mm a");
		if (todayDate === date) {
			if (beginningTime >= endTime) {
				const exist = await StarlinegameResult.find({
					providerId: id,
					resultDate: date,
				});
				if (Object.keys(exist).length === 0) {
					const digitFamily = await gameDigit.findOne({
						Digit: req.body.winningDigit,
					});
					const sumDgit = digitFamily.DigitFamily;
					const details = new StarlinegameResult({
						providerId: id,
						providerName: name,
						session: req.body.session,
						resultDate: req.body.resultDate,
						winningDigit: req.body.winningDigit,
						winningDigitFamily: sumDgit,
						status: 0,
						createdAt: formatted1,
					});
					const savedGames = await details.save();
					const result = req.body.winningDigit + "-" + sumDgit;
					const update1 = await StarlineProvider.updateOne(
						{ _id: id },
						{
							$set: {
								providerResult: result,
								modifiedAt: formatted1,
								resultStatus: 1,
							},
						}
					);
					const Resultid = savedGames._id;
					const listData = {
						providerId: id,
						resultDate: date,
						status: 0,
						winningDigit: digit,
						digitFamily: sumDgit,
						resultId: Resultid,
						providerName: name,
						time: formatted1,
					};
					let token = [];
					noti(req, res, result, token);
					return res.json({
						status: 1,
						message: "Success",
						data: listData,
					});
				} else {
					const data =
						"Details Already Filled For : " +
						name +
						", Session : " +
						req.body.session +
						", Date: " +
						req.body.resultDate;
					return res.json({
						status: 0,
						message: "Success",
						data: data,
					});
				}
			} else {
				const data = "It Is Not Time To Declare The Result Yet";
				return res.json({
					status: 0,
					message: "Success",
					data: data,
				});
			}
		} else {
			const exist = await StarlinegameResult.find({
				providerId: id,
				resultDate: date,
			});
			if (Object.keys(exist).length === 0) {
				const digitFamily = await gameDigit.findOne({
					Digit: req.body.winningDigit,
				});
				const sumDgit = digitFamily.DigitFamily;
				const details = new StarlinegameResult({
					providerId: id,
					providerName: name,
					session: req.body.session,
					resultDate: req.body.resultDate,
					winningDigit: req.body.winningDigit,
					winningDigitFamily: sumDgit,
					status: 0,
				});
				const savedGames = await details.save();

				const countResult = await StarlinegameResult.find({
					resultDate: date,
				}).countDocuments();
				const providerCount = await StarlineProvider.find().countDocuments();
				const pendingCount = providerCount - countResult;

				res.status(200).json({
					status: 3,
					message: "Result Declared Successfully",
					countResult: countResult,
					providerCount: providerCount,
					pendingCount: pendingCount,
				});
			} else {
				const data =
					"Details Already Filled For : " +
					name +
					", Session : " +
					req.body.session +
					", Date: " +
					req.body.resultDate;
				return res.json({
					status: 0,
					message: "Success",
					data: data,
				});
			}
		}
	} catch (e) {
		return res.json(e);
	}
});

router.get("/pastResult", session, async (req, res) => {
	try {
		// Need to Test
		//return res.json('Not Found');
		const name = req.query.date;
		const result = await StarlinegameResult.find({ resultDate: name });
		const countResult = await StarlinegameResult.find({
			resultDate: name,
		}).countDocuments();
		const providerCount = await StarlineProvider.find().countDocuments();
		const pendingCount = providerCount - countResult;

		res.json({
			result: result,
			countResult: countResult,
			providerCount: providerCount,
			pendingCount: pendingCount,
		});
	} catch (e) {
		res.json(e);
	}
});

router.post("/paymentRevert", session, async (req, res) => {
	try {
		const id = req.body.resultId;
		const provider = req.body.providerId;
		const digit = req.body.digit;
		const gameDate = req.body.date;
		const digitFamily = req.body.family;
		const userInfo = req.session.details;
		const adminId = userInfo.user_id;
		const adminName = userInfo.username;
		let historyArray = [];
		let historyDataArray = [];
		const dt = dateTime.create();
		const formattedDate = dt.format("d/m/Y");
		const formattedTime = dt.format("I:M:S p");
		let updateResult = "***-*";

		const winnerList = await starBids
			.find({
				providerId: provider,
				gameDate: gameDate,
				$and: [{ $or: [{ bidDigit: digit }, { bidDigit: digitFamily }] }],
			})
			.sort({ _id: -1, bidDigit: 1 });

		if (Object.keys(winnerList).length > 0) {
			for (index in winnerList) {
				let rowId = winnerList[index]._id;
				let userid = winnerList[index].userId;
				let winAmount = winnerList[index].gameWinPoints;
				let providerId = winnerList[index].providerId;
				let gameTypeid = winnerList[index].gameTypeId;
				let providerName = winnerList[index].providerName;
				let gameName = winnerList[index].gameTypeName;
				let username = winnerList[index].userName;
				let mobileNumber = winnerList[index].mobileNumber;

				let user = await mainUser.findOne(
					{ _id: userid },
					{ wallet_balance: 1 }
				);
				let walletBal = user.wallet_balance;
				revertBalance = walletBal - winAmount;

				let update = await mainUser.updateOne(
					{ _id: userid },
					{
						$set: {
							wallet_balance: revertBalance,
						},
					}
				);

				//history
				let arrValue = {
					userId: userid,
					bidId: rowId,
					filterType: 8,
					reqType: "star",
					previous_amount: walletBal,
					current_amount: revertBalance,
					transaction_amount: winAmount,
					provider_id: providerId,
					username: username,
					description: "Amount Reverted",
					transaction_date: formattedDate,
					transaction_status: "Success",
					win_revert_status: 0,
					transaction_time: formattedTime,
					admin_id: adminId,
					addedBy_name: adminName,
				};

				historyDataArray.push(arrValue);

				arrValue = {
					userId: userid,
					providerId: providerId,
					gameTypeId: gameTypeid,
					providerName: providerName,
					username: username,
					mobileNumber: mobileNumber,
					gameTypeName: gameName,
					wallet_bal_before: walletBal,
					wallet_bal_after: revertBalance,
					revert_amount: winAmount,
					date: formattedDate,
					dateTime: formattedTime,
				};

				historyArray.push(arrValue);
			}
		}

		await revertEntries.insertMany(historyArray);
		await history.insertMany(historyDataArray);
		await starBids.updateMany(
			{ providerId: provider, gameDate: gameDate },
			{
				$set: {
					winStatus: 0,
					gameWinPoints: 0,
				},
			}
		);

		await StarlineProvider.updateOne(
			{ _id: provider },
			{
				$set: {
					providerResult: updateResult,
					resultStatus: 0,
				},
			}
		);

		await StarlinegameResult.deleteOne({ _id: id });

		res.json({
			status: 1,
			message: "Reverted Successfully",
		});
	} catch (e) {
		res.json({
			status: 0,
			message: e,
		});
	}
});

router.get("/refundPayment", session, permission, async (req, res) => {
	const userInfo = req.session.details;
	const role = userInfo.role;
	const permissionArray = req.view;
	const provider = await StarlineProvider.find().sort({ _id: 1 });
	if (role === 0) {
		res.render("./starline/refund", {
			data: provider,
			userInfo: userInfo,
			permission: permissionArray,
			title: "Refund Payment",
		});
	} else {
		res.render("./dashboard/starterPage", {
			userInfo: userInfo,
			permission: permissionArray,
			title: "Dashboard",
		});
	}
});

router.post("/refundList", session, async (req, res) => {
	try {
		const providerId = req.body.providerId;
		const gameDate = req.body.resultDate;
		const userlist = await starBids.find({
			providerId: providerId,
			gameDate: gameDate,
			winStatus: 0,
		});
		res.json({
			status: 1,
			data: userlist,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Went Wrong Contact Support",
			err: error,
		});
	}
});

router.post("/refundAll", session, async (req, res) => {
	try {
		const type = req.body.type;
		var providerId = req.body.providerId;
		var resultDate = req.body.resultDate;
		var providerName = req.body.providerName;
		const userInfo = req.session.details;
		const adminId = userInfo.user_id;
		const adminName = userInfo.username;

		let tokenArray = [];
		if (type == 1) {
			var userId = req.body.userid;
			var biddingPoints = req.body.biddingPoints;
		}

		const formatted2 = moment().format("DD/MM/YYYY hh:mm:ss A");

		if (type == 1) {
			var findUser = await mainUser.findOne(
				{ _id: userId },
				{ wallet_balance: 1 }
			);
			const current_amount = findUser.wallet_balance;
			var singleUserUpdate = await mainUser.findOneAndUpdate(
				{ _id: userId },
				{
					$inc: { wallet_balance: parseInt(biddingPoints) },
					wallet_bal_updated_at: formatted2,
				},
				{
					new: true,
					upsert: true,
				}
			);

			const firebaseId = singleUserUpdate.firebaseId;
			let singleUserBidUpdate = await starBids.findOne({
				userId: userId,
				providerId: providerId,
				gameDate: resultDate,
				winStatus: 0,
			})
		
			await starBids.deleteOne({
				userId: userId,
				providerId: providerId,
				gameDate: resultDate,
				winStatus: 0,
			})

			const dateTime = formatted2.split(" ");
			let arrValue = new history({
				userId: userId,
				bidId: singleUserBidUpdate._id,
				reqType: "star",
				filterType: 3,
				previous_amount: current_amount,
				current_amount: singleUserUpdate.wallet_balance,
				provider_id: singleUserBidUpdate.providerId,
				transaction_amount: biddingPoints,
				username: singleUserUpdate.name,
				description: "Amount Refunded For " + singleUserBidUpdate.providerName + " Game",
				transaction_date: dateTime[0],
				transaction_status: "Success",
				transaction_time: dateTime[1],
				admin_id: adminId,
				addedBy_name: adminName,
			});

			const save = await arrValue.save();
			tokenArray.push(firebaseId);
			const name = singleUserBidUpdate.providerName;
			const body =
				"Hello " +
				singleUserUpdate.username +
				", Refund Successfully Done For " +
				name;
			sendRefundNotification(tokenArray, name, body);
		} else {
			const userlist = await starBids.find({
				providerId: providerId,
				gameDate: resultDate,
				winStatus: 0,
			});
			let i = 1;
			if (Object.keys(userlist).length > 0) {
				for (index in userlist) {
					var rowId = userlist[index]._id;
					var userId = userlist[index]["userId"];
					var biddingPoints = userlist[index]["biddingPoints"];
					var findUser = await mainUser.findOne(
						{ _id: userId },
						{ wallet_balance: 1 }
					);
					const current_amount = findUser.wallet_balance;

					var singleUserUpdate = await mainUser.findOneAndUpdate(
						{ _id: userId },
						{
							$inc: { wallet_balance: parseInt(biddingPoints) },
							wallet_bal_updated_at: formatted2,
						},
						{
							new: true,
							upsert: true,
						}
					);

					const dateTime = formatted2.split(" ");
					let arrValue = new history({
						userId: userId,
						bidId: rowId._id,
						filterType: 3,
						reqType: "star",
						previous_amount: current_amount,
						current_amount: singleUserUpdate.wallet_balance,
						transaction_amount: biddingPoints,
						username: singleUserUpdate.username,
						description: "Amount Refunded For " + providerName + " Game",
						transaction_date: dateTime[0],
						transaction_status: "Success",
						transaction_time: dateTime[1] + " " + dateTime[2],
						admin_id: adminId,
						addedBy_name: adminName,
					});

					await arrValue.save();

					await starBids.deleteOne({ _id: rowId })
					let firebaseId = singleUserUpdate.firebaseId;
					tokenArray.push(firebaseId);
					i++;
				}

				const body =
					"Hello Khatri Games User, Your Refund For Date : " +
					resultDate +
					", is Processed Successfully";
				sendRefundNotification(tokenArray, providerName, body);
			}
		}
		res.json({
			status: 1,
			message: "Refund Initiated Successfully",
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Went Wrong Contact Support",
			err: error,
		});
	}
});

async function sendRefundNotification(tokenArray, name, body) {
    let finalArr = tokenArray.filter(token => token !== "");
    let tokenChunks = lodash.chunk(finalArr, 500);
    let message = {
        android: {
            priority: 'high',
        },
        data: {
			title: `Refund For ${name}`,
			body: body,
			icon: 'ic_launcher',
			type: 'Notification',
        },
    };
    for (let chunk of tokenChunks) {
        message.tokens = chunk;
        try {
            const response = await messaging.sendMulticast(message);
            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        console.error(`Failed to send to ${chunk[idx]}: ${resp.error}`);
                    }
                });
            }
        } catch (error) {
            console.log('Error sending message:', error);
        }
    }
}

module.exports = router;
