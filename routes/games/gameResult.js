const router = require("express").Router();
const dateTime = require("node-datetime");
const gamesProvider = require("../../model/games/Games_Provider");
const gameResult = require("../../model/games/GameResult");
const gameSetting = require("../../model/games/AddSetting");
const gameDigit = require("../../model/digits");
const session = require("../helpersModule/session");
const gameBids = require("../../model/games/gameBids");
const notification = require("../helpersModule/sendNotification");
const permission = require("../helpersModule/permission");
const mainUser = require("../../model/API/Users");
const revertEntries = require("../../model/revertPayment");
const history = require("../../model/wallet_history");
const moment = require("moment");
const messaging = require("../../firebase");
const lodash = require('lodash');

router.get("/", session, permission, async (req, res) => {
	try {
		const dt = dateTime.create();
		const formatted = dt.format("m/d/Y");
		const name = req.query.name;
		const provider = await gamesProvider.find().sort({ _id: 1 });
		const result = await gameResult
			.find({ resultDate: formatted })
			.sort({ _id: -1 });
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["gamesResult"].showStatus;

		if (Object.keys(result).length > 0) {
			if (name === "mohit") {
				res.json(result);
			} else {
				if (check === 1) {
					res.render("./games/gameresult", {
						data: provider,
						result: result,
						userInfo: userInfo,
						permission: permissionArray,
						title: "Game Result"
					});
				} else {
					res.render("./dashboard/starterPage", {
						userInfo: userInfo,
						permission: permissionArray,
						title: "Dashboard",
					});
				}
			}
		} else {
			const currentTime = dt.format("I:M p");
			const checkTime = "09:00 AM";

			var beginningTime = moment(currentTime, "h:mm a");
			var endTime = moment(checkTime, "h:mm a");

			if (beginningTime > endTime) {
				if (check === 1) {
					res.render("./games/gameresult", {
						data: provider,
						result: result,
						userInfo: userInfo,
						permission: permissionArray,
						title: "Game Result",
					});
				} else {
					res.render("./dashboard/starterPage", {
						userInfo: userInfo,
						permission: permissionArray,
						title: "Dashboard",
					});
				}
			} else {
				let previousDate = moment(formatted, "MM/DD/YYYY")
					.subtract(1, "days")
					.format("MM/DD/YYYY");

				const pastResult = await gameResult
					.find()
					.sort({ _id: -1 })
					.where("resultDate")
					.equals(previousDate);

				if (check === 1) {
					res.render("./games/gameresult", {
						data: provider,
						result: pastResult,
						userInfo: userInfo,
						permission: permissionArray,
						title: "Game Result",
					});
				} else {
					res.render("./dashboard/starterPage", {
						userInfo: userInfo,
						permission: permissionArray,
						title: "Dashboard",
					});
				}
			}
		}
	} catch (e) {
		res.json({
			status: 0,
			message: e,
		});
	}
});

router.get("/revertPayment", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const role = userInfo.role;
		const permissionArray = req.view;
		const dt = dateTime.create();
		const formatted = dt.format("m/d/Y");
		const result = await gameResult
			.find()
			.sort({ _id: -1 })
			.where("resultDate")
			.equals(formatted);
		if (role === 0) {
			res.render("./games/revert", {
				result: result,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Revert Game Payment",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
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
		const formatted1 = dt.format("m/d/Y I:M:S p");
		const resultid = req.body.resultId;
		const providerId = req.body.providerId;
		const session = req.body.session;
		const dltStatus = req.body.dltPast;
		const dltResult = await gameResult.deleteOne({ _id: resultid });

		if (dltStatus == 0) {
			if (session == "Open") {
				await gamesProvider.updateOne(
					{ _id: providerId },
					{
						$set: {
							providerResult: "***-**-***",
							modifiedAt: formatted1,
							resultStatus: 0,
						},
					}
				);
			} else {
				const result = await gamesProvider.findOne({ _id: providerId });
				let digit = result.providerResult;
				const data = digit.split("-");
				let openDigit = data[0];
				let sumDgit = parseInt(data[1].charAt(0));
				let finalDigit = openDigit + "-" + sumDgit;
				await gamesProvider.updateOne(
					{ _id: providerId },
					{
						$set: {
							providerResult: finalDigit,
							modifiedAt: formatted1,
							resultStatus: 1,
						},
					}
				);
			}
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
		const id = data[0]; //provider id
		const name = data[1];
		const session = req.body.session;
		const resultDate = req.body.resultDate;
		const winningDigit = req.body.winningDigit;
		let sendStatus = 0;
		let savedGames;
		let finalResult;

		const formatted1 = dt.format("m/d/Y I:M:S p");
		const todayDay = dt.format("W");
		const todayDate = dt.format("m/d/Y");
		const currentTime = dt.format("I:M p");

		if (session === "Close") {
			let gameResultData = await gameResult.findOne({
				providerId: id,
				resultDate: resultDate,
				session: "Open"
			});
			if (!gameResultData) {
				return res.json({
					status: 0,
					message: "Result  Not Declared",
					data: `Open Result Not Declared For :${name}, Date: ${req.body.resultDate}, Declare Open First`,
				});
			}

		}

		let getItem = { OBRT: 1, gameDay: 1 };
		if (session == "Close") {
			getItem = { CBRT: 1, gameDay: 1 };
		}

		const findTime = await gameSetting.findOne(
			{ providerId: id, gameDay: todayDay },
			getItem
		);
		let timeCheck = findTime.OBRT;
		if (session == "Close") {
			timeCheck = findTime.CBRT;
		}

		var beginningTime = moment(currentTime, "h:mm a");
		var endTime = moment(timeCheck, "h:mm a");

		const provider = await gamesProvider.findOne({ _id: id });
		const resultStatus = provider.resultStatus;
		const lastUpdated = provider.modifiedAt;
		const result = provider.providerResult;

		const digitFamily = await gameDigit.findOne({
			Digit: winningDigit,
		});

		let sumDgit = digitFamily.DigitFamily;

		if (todayDate === resultDate) {
			if (beginningTime >= endTime) {
				const exist = await gameResult.findOne({
					providerId: id,
					resultDate: resultDate,
					session: session,
				});
				if (!exist) {
					if (session == "Open") {
						const details = new gameResult({
							providerId: id,
							providerName: name,
							session: session,
							resultDate: resultDate,
							winningDigit: winningDigit,
							winningDigitFamily: sumDgit,
							status: "0",
							createdAt: formatted1,
						});

						savedGames = await details.save();
						finalResult = winningDigit + "-" + sumDgit;
						const update1 = await gamesProvider.updateOne(
							{ _id: id },
							{
								$set: {
									providerResult: finalResult,
									modifiedAt: formatted1,
									resultStatus: 1,
								},
							}
						);
						sendStatus = 1;
					} else {
						if (resultStatus === 1) {
							const details = new gameResult({
								providerId: id,
								providerName: name,
								session: session,
								resultDate: resultDate,
								winningDigit: winningDigit,
								winningDigitFamily: sumDgit,
								status: "0",
								createdAt: formatted1,
							});
							savedGames = await details.save();

							const Updatedresult = sumDgit + "-" + winningDigit;
							finalResult = result + "" + Updatedresult;
							const update1 = await gamesProvider.updateOne(
								{ _id: id },
								{
									$set: {
										providerResult: finalResult,
										modifiedAt: formatted1,
										resultStatus: 1,
									},
								}
							);
							sendStatus = 1;
						} else {
							const data =
								"Open Result Not Declared For : " +
								name +
								", Date: " +
								req.body.resultDate +
								", Declare Open First";
							res.json({
								status: 0,
								message: "Result  Not Declared",
								data: data,
							});
						}
					}

					if (sendStatus === 1) {
						let token = [];
						notification(req, res, finalResult, token);
						const rowData = {
							providerId: id,
							session: session,
							resultDate: resultDate,
							winningDigit: winningDigit,
							resultId: savedGames._id,
							status: savedGames.status,
							digitFamily: sumDgit,
							providerName: name,
							time: savedGames.createdAt,
						};

						res.json({
							status: 1,
							message: "Result Declared Successfully",
							data: rowData,
						});
					}
				} else {
					const data =
						"Details Already Filled For : " +
						name +
						", Session : " +
						req.body.session +
						", Date: " +
						req.body.resultDate;
					res.json({
						status: 0,
						message: "Result  Not Declared",
						data: data,
					});
				}
			} else {
				const data = "It is not time to declare the result yet";
				res.json({
					status: 0,
					message: "Cannot Declare Result",
					data: data,
				});
			}
		} else {
			let dateCheck = lastUpdated.split(" ");
			const exist = await gameResult.findOne({
				providerId: id,
				resultDate: resultDate,
				session: session,
			});
			if (!exist) {
				if (session == "Open") {
					const details = new gameResult({
						providerId: id,
						providerName: name,
						session: session,
						resultDate: resultDate,
						winningDigit: winningDigit,
						winningDigitFamily: sumDgit,
						status: "0",
						createdAt: formatted1,
					});
					savedGames = await details.save();

					if (dateCheck[0] == resultDate) {
						finalResult = winningDigit + "-" + sumDgit;
						const update1 = await gamesProvider.updateOne(
							{ _id: id },
							{
								$set: {
									providerResult: finalResult,
									modifiedAt: formatted1,
									resultStatus: 1,
								},
							}
						);
						sendStatus = 1;
					}
				} else {
					const checkOpen = await gameResult.findOne({
						providerId: id,
						resultDate: resultDate,
						session: "Open",
					});

					if (checkOpen) {
						const details = new gameResult({
							providerId: id,
							providerName: name,
							session: session,
							resultDate: resultDate,
							winningDigit: winningDigit,
							winningDigitFamily: sumDgit,
							status: "0",
							createdAt: formatted1,
						});
						savedGames = await details.save();
						if (dateCheck[0] == resultDate) {
							const Updatedresult = sumDgit + "-" + winningDigit;
							finalResult = result + "" + Updatedresult;
							const update1 = await gamesProvider.updateOne(
								{ _id: id },
								{
									$set: {
										providerResult: finalResult,
										modifiedAt: formatted1,
										resultStatus: 1,
									},
								}
							);
							sendStatus = 1;
						}
					} else {
						const data =
							"Open Result Not Declared For : " +
							name +
							", Date: " +
							req.body.resultDate +
							", Declare Open First";
						res.json({
							status: 0,
							message: "Result  Not Declared",
							data: data,
						});
					}
				}
				const countResult = await gameResult
					.find({ resultDate: resultDate })
					.countDocuments();
				const providerCount = await gamesProvider.find().countDocuments();
				const pendingCount = providerCount * 2 - countResult;
				if (sendStatus === 1) {
					let token = [];
					notification(req, res, finalResult, token);
					const rowData = {
						providerId: id,
						session: session,
						resultDate: resultDate,
						winningDigit: winningDigit,
						resultId: savedGames._id,
						status: savedGames.status,
						digitFamily: sumDgit,
						providerName: name,
						time: savedGames.createdAt,
					};

					res.json({
						status: 1,
						message: "Result Declared Successfully",
						data: rowData,
					});
				} else {
					res.json({
						status: 3,
						message: "Result Declared Successfully",
						countResultt: countResult,
						providerCountt: providerCount,
						pendingCountt: pendingCount,
					});
				}
			} else {
				const data =
					"Details Already Filled For : " +
					name +
					", Session : " +
					req.body.session +
					", Date: " +
					req.body.resultDate;
				res.json({
					status: 0,
					message: "Result Not Declared",
					data: data,
				});
			}
		}
	} catch (e) {
		res.json({
			status: 5,
			message: e,
		});
	}
});

router.get("/pastResult", session, async (req, res) => {
	try {
		const name = req.query.date;
		const result = await gameResult.find().where("resultDate").equals(name);
		const countResult = await gameResult
			.find({ resultDate: name })
			.countDocuments();
		const providerCount = await gamesProvider.find().countDocuments();
		const pendingCount = providerCount * 2 - countResult;
		res.json({
			result: result,
			countResult: countResult,
			providerCount: providerCount,
			pendingCount: pendingCount,
		});
	} catch (e) {
		res.json({
			status: 0,
			message: e,
		});
	}
});

router.post("/digits", async (req, res) => {
	try {
		const digitArray = req.body;
		const arr = await gameDigit.insertMany(digitArray);
		res.json(arr);
	} catch (e) {
		res.json({
			status: 0,
			message: e,
		});
	}
});

router.post("/paymentRevert", session, async (req, res) => {
	try {
		const id = req.body.resultId;
		const provider = req.body.providerId;
		const session = req.body.session;
		const digit = req.body.digit;
		const digitFamily = req.body.family;
		const gameDate = req.body.date;
		const userInfo = req.session.details;
		const adminId = userInfo.user_id;
		const adminName = userInfo.username;
		let historyArray = [];
		let historyDataArray = [];
		const dt = dateTime.create();
		const formattedDate = dt.format("d/m/Y");
		const formattedTime = dt.format("I:M:S p");
		let updateResult = "***-**-***";
		let statusValue = 0;
		const winnerList = await gameBids
			.find({
				providerId: provider,
				gameDate: gameDate,
				gameSession: session,
				$and: [{ $or: [{ bidDigit: digit }, { bidDigit: digitFamily }] }],
			})
			.sort({ _id: -1, bidDigit: 1 });

		if (session === "Close") {
			const openResult = await gameResult.findOne({
				providerId: provider,
				resultDate: gameDate,
				session: "Open",
			});

			if (openResult) {
				const openFamily = openResult.winningDigitFamily;
				const openPana = openResult.winningDigit;
				updateResult = openPana + "-" + openFamily;
				jodiDigit = openFamily + digitFamily;
				halfSangam1 = openFamily + "-" + digit;
				halfSangam2 = openPana + "-" + digitFamily;
				fullSangam = openPana + "-" + digit;
				const winnerList = await gameBids
					.find({
						providerId: provider,
						gameDate: gameDate,
						gameSession: session,
						$and: [
							{
								$or: [
									{ bidDigit: jodiDigit },
									{ bidDigit: halfSangam1 },
									{ bidDigit: halfSangam2 },
									{ bidDigit: fullSangam },
								],
							},
						],
					})
					.sort({ bidDigit: 1 });

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
						reqType: "main",
						previous_amount: walletBal,
						current_amount: revertBalance,
						transaction_amount: winAmount,
						provider_id: providerId,
						username: username,
						provider_ssession: session,
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
			statusValue = 1;
		}

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
					filterType: 3,
					reqType: "main",
					previous_amount: walletBal,
					current_amount: revertBalance,
					transaction_amount: winAmount,
					provider_id: providerId,
					username: username,
					provider_ssession: session,
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

		const asbs = await gameBids.updateMany(
			{ providerId: provider, gameDate: gameDate, gameSession: session },
			{
				$set: {
					winStatus: 0,
					gameWinPoints: 0,
				},
			}
		);

		await gamesProvider.updateOne(
			{ _id: provider },
			{
				$set: {
					providerResult: updateResult,
					resultStatus: statusValue,
				},
			}
		);

		await gameResult.deleteOne({ _id: id });

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
	const provider = await gamesProvider.find().sort({ _id: 1 });
	if (role === 0) {
		res.render("./games/refund", {
			data: provider,
			userInfo: userInfo,
			permission: permissionArray,
			title: "Refund Payment",
		});
	} else {
		res.render("./dashboard/starterPage", {
			userInfo: userInfo,
			permission: permissionArray,
		});
	}
});

router.post("/refundList", session, async (req, res) => {
	try {
		const providerId = req.body.providerId;
		const gameDate = req.body.resultDate;
		const userlist = await gameBids.find({
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

		// const dt0 = dateTime.create();
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
			let singleUserBidUpdate = await gameBids.findOne({
				userId: userId,
				providerId: providerId,
				gameDate: resultDate,
				winStatus: 0,
			})

			// var singleUserBidUpdate = await gameBids.findOneAndUpdate(
			// 	{
			// userId: userId,
			// providerId: providerId,
			// gameDate: resultDate,
			// winStatus: 0,
			// 	},
			// 	{
			// 		winStatus: 5,
			// 		updatedAt: formatted2,
			// 	},
			// 	{
			// 		new: true,
			// 		upsert: true,
			// 	}
			// );

			await gameBids.deleteOne({
				userId: userId,
				providerId: providerId,
				gameDate: resultDate,
				winStatus: 0,
			})

			const dateTime = formatted2.split(" ");
			let arrValue = new history({
				userId: userId,
				bidId: singleUserUpdate._id,
				reqType: "main",
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
			const body = `Hello ${singleUserUpdate.username}, Your Bid Amount ${biddingPoints}/- RS Is Refund Successful In Your Wallet!`;
			sendRefundNotification(tokenArray, name, body);
		} else {
			const userlist = await gameBids.find({
				providerId: providerId,
				gameDate: resultDate,
				winStatus: 0,
			});

			if (Object.keys(userlist).length > 0) {
				let i = 1;
				for (index in userlist) {
					var rowId = userlist[index]._id;
					var userId = userlist[index]["userId"];
					var biddingPoints = userlist[index]["biddingPoints"];
					var findUser = await mainUser.findOne(
						{ _id: userId },
						{ wallet_balance: 1 }
					);
					var current_amount = findUser.wallet_balance;

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

					var dateTime = formatted2.split(" ");

					let arrValue = new history({
						userId: userId,
						bidId: rowId._id,
						filterType: 3,
						reqType: "main",
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

					// await gameBids.updateOne(
					// 	{ _id: rowId },
					// 	{
					// 		$set: {
					// 			winStatus: 5,
					// 			updatedAt: formatted2,
					// 		},
					// 	}
					// );
					await gameBids.deleteOne({ _id: rowId })
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