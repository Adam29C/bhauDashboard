const router = require("express").Router();
const fundReq = require("../../../model/API/FundRequest");
const User = require("../../../model/API/Users");
const bank = require("../../../model/bank");
const verify = require("../verifyTokens");
const adminVerify = require("../../helpersModule/verifyAdmin");
const checkONOff = require("../../../model/Withdraw_Req_On_Off");
const history = require("../../../model/wallet_history");
const upi = require("../../../model/API/upiPayments");
const notification = require("../../helpersModule/creditDebitNotification");
const withdrawText = require("../../../model/withDrawMessage");
const dashBoardUp = require("../../../model/MainPage");
const gatewayPayment = require("../../../model/onlineTransaction");
const upiIds = require("../../../model/upi_ids");
const moment = require("moment");
const dateTime = require("node-datetime");
const Users = require("../../../model/API/Users");

router.get("/", (req, res) => {
	res.json({ status: 0, message: "Access Denied" });
});

router.post("/addFund", verify, async (req, res) => {
	try {
		const userId = req.body.user_id;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.json({
				status: 0,
				message: "User Not Found",
			});
		} else {
			const findAlreadyPending = await fundReq.findOne({
				userId: userId,
				reqStatus: "Pending",
				reqType: "Credit",
			});
			if (findAlreadyPending === null) {
				const formatted = dt.format("d/m/Y");
				const ts = moment(formatted, "DD/MM/YYYY").unix();

				const addReq = new fundReq({
					userId: req.body.user_id,
					reqAmount: req.body.req_amount,
					fullname: req.body.fullname,
					username: req.body.username,
					mobile: req.body.mobile,
					reqType: "Credit",
					reqStatus: "Pending",
					reqDate: req.body.req_date,
					reqTime: req.body.req_time,
					withdrawalMode: "null",
					UpdatedBy: "null",
					reqUpdatedAt: "null",
					timestamp: ts,
				});

				await addReq.save();

				res.status(200).send({
					status: 1,
					message: "Add Fund Request Raised Successfully",
				});
			} else {
				res.status(200).send({
					status: 1,
					message: "Your Previous Credit Request Is Pending",
				});
			}
		}
	} catch (e) {
		res.status(400).json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
			error: e,
		});
	}
});

// router.post("/withdrawFund", async (req, res) => {

// 	try {
// 		let accNumber = req.body.accNumber;
// 		let ifscCode = req.body.ifscCode;
// 		let bankName = req.body.bankName;
// 		let accName = req.body.accName;

// 		if (accNumber == undefined || ifscCode == undefined || bankName == undefined || accName == undefined) {
// 			return res.json({
// 				status: 1,
// 				message: "Cannot Raise Withdraw Request, Contact Support"
// 			})
// 		}

// 		const dt = dateTime.create();
// 		var dayName = dt.format("W");

// 		const checkDayoff = await checkONOff.findOne(
// 			{ dayName: dayName },
// 			{ enabled: 1, message: 1 }
// 		);
// 		const dayOffStatus = checkDayoff.enabled;
// 		const message = checkDayoff.message;
// 		if (dayOffStatus === false) {
// 			return res.status(200).json({
// 				status: 0,
// 				message: message,
// 			});
// 		} else {
// 			const currentTime = dt.format("I:M p");
// 			const endTime = "11:59 PM";
// 			var beginningTime = moment(currentTime, "h:mm a");
// 			var formatTime = moment(endTime, "h:mm a");
// 			if ((beginningTime > formatTime)) {
// 				return res.status(200).send({
// 					status: 0,
// 					message: "Withdraw Request Time Is Over",
// 				});
// 			} else {
// 				const userId = req.body.user_id;
// 				const user = await User.findOne({ _id: userId });
// 				if (!user) {
// 					return res.status(200).send({
// 						status: 0,
// 						message: "No User Exist With Name :" + req.body.username,
// 					});
// 				} else {
// 					const findAlreadyPending = await fundReq.findOne({
// 						userId: userId,
// 						reqStatus: "Pending",
// 						reqType: "Debit",
// 					});
// 					if (findAlreadyPending === null) {
// 						const formatted = dt.format("d/m/Y");
// 						const ts = moment(formatted, "DD/MM/YYYY").unix();
// 						const lastUpi = await upi.findOne({ userId: userId });
// 						if (!lastUpi) {
// 							const addReq = new fundReq({
// 								userId: req.body.user_id,
// 								reqAmount: req.body.req_amount,
// 								fullname: user.name,
// 								username: req.body.username,
// 								mobile: req.body.mobile,
// 								reqType: "Debit",
// 								reqStatus: "Pending",
// 								toAccount: {
// 									accNumber: req.body.accNumber,
// 									ifscCode: req.body.ifscCode,
// 									bankName: req.body.bankName,
// 									accName: req.body.accName
// 								},
// 								reqDate: formatted,
// 								reqTime: currentTime,
// 								withdrawalMode: req.body.withdrawalMode,
// 								UpdatedBy: "null",
// 								reqUpdatedAt: "null",
// 								timestamp: ts,
// 							});
// 							const save = await addReq.save();
// 							return res.status(200).json({
// 								status: 1,
// 								message: "Withdraw Request Raised Successfully",
// 							});
// 						}
// 						const upidate = lastUpi.reqDate;
// 						const upiTime = lastUpi.reqTime;
// 						if (upidate != formatted) {
// 							const addReq = new fundReq({
// 								userId: req.body.user_id,
// 								reqAmount: req.body.req_amount,
// 								fullname: user.name,
// 								username: req.body.username,
// 								mobile: req.body.mobile,
// 								reqType: "Debit",
// 								reqStatus: "Pending",
// 								toAccount: {
// 									accNumber: req.body.accNumber,
// 									ifscCode: req.body.ifscCode,
// 									bankName: req.body.bankName,
// 									accName: req.body.accName
// 								},
// 								reqDate: formatted,
// 								reqTime: currentTime,
// 								withdrawalMode: req.body.withdrawalMode,
// 								UpdatedBy: "null",
// 								reqUpdatedAt: "null",
// 								timestamp: ts,
// 							});
// 							const save = await addReq.save();
// 							return res.status(200).json({
// 								status: 1,
// 								message: "Withdraw Request Raised Successfully",
// 							});
// 						}

// 						const currentDaTi = moment().format("DD/MM/YYYY hh:mm:ss A");
// 						const lastupdte = upidate + " " + upiTime;

// 						let check = moment
// 							.utc(
// 								moment(currentDaTi, "DD/MM/YYYY HH:mm:ss A").diff(
// 									moment(lastupdte, "DD/MM/YYYY HH:mm:ss A")
// 								)
// 							)
// 							.format("HH:mm:ss");

// 						let checkTime = "00:05:00";

// 						if (check > checkTime) {
// 							const addReq = new fundReq({
// 								userId: req.body.user_id,
// 								reqAmount: req.body.req_amount,
// 								fullname: user.name,
// 								username: req.body.username,
// 								mobile: req.body.mobile,
// 								reqType: "Debit",
// 								reqStatus: "Pending",
// 								toAccount: {
// 									accNumber: req.body.accNumber,
// 									ifscCode: req.body.ifscCode,
// 									bankName: req.body.bankName,
// 									accName: req.body.accName
// 								},
// 								reqDate: formatted,
// 								reqTime: currentTime,
// 								withdrawalMode: req.body.withdrawalMode,
// 								UpdatedBy: "null",
// 								reqUpdatedAt: "null",
// 								timestamp: ts,
// 							});
// 							const save = await addReq.save();
// 							return res.status(200).json({
// 								status: 1,
// 								message: "Withdraw Request Raised Successfully",
// 							});
// 						} else {
// 							let wait_time = moment.utc(moment(checkTime, "HH:mm:ss").diff(moment(check, "HH:mm:ss"))).format("mm:ss");
// 							return res.json({
// 								status: 5,
// 								message:
// 									"Please Wait For " +
// 									wait_time +
// 									" Minutes To Raise Withdraw Request.",
// 							});
// 						}
// 					} else {
// 						return res.status(200).send({
// 							status: 1,
// 							message: "Your Previous Debit Request Is Pending",
// 						});
// 					}
// 				}
// 			}
// 		}
// 	} catch (error) {
// 		res.status(400).json({
// 			status: 0,
// 			message: "Something Bad Happened Please Contact Support " + error.toString(),
// 			error: error,
// 		});
// 	}
// });

router.post("/withdrawFund", async (req, res) => {
	try{
		let accNumber = req.body.accNumber;
		let ifscCode = req.body.ifscCode;
		let bankName = req.body.bankName;
		let accName = req.body.accName;

		if (accNumber == undefined || ifscCode == undefined || bankName == undefined || accName == undefined) {
			return res.json({
				status: 1,
				message: "Cannot Raise Withdraw Request, Contact Support"
			})
		}

		const dt = dateTime.create();
		var dayName = dt.format("W");

		const checkDayoff = await checkONOff.findOne(
			{ dayName: dayName },
			{ enabled: 1, message: 1 }
		);
		const dayOffStatus = checkDayoff.enabled;
		const message = checkDayoff.message;
		if (dayOffStatus === false) {
			return res.status(200).json({
				status: 0,
				message: message,
			});
		}
		// else {
		const userId = req.body.user_id;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(200).json({
				status: 0,
				message: "No User Exist With Name :" + req.body.username,
			});
		}

		let withdrawDetails = await checkONOff.findOne({ isRequest: true }, { startTime: 1, endTime: 1, requestCount: 1 });
		let currentTime = moment();

		// Parse startTime and endTime into Moment objects
		let startMoment = moment(withdrawDetails.startTime, "HH:mm");
		let endMoment = moment(withdrawDetails.endTime, "HH:mm");
		let count = 0;
		if (currentTime.isBetween(startMoment, endMoment, null, '[)')) {
			let storedDate = moment(user.withdrawalTime).utc().startOf('day');
			let todayDate = moment().utc().startOf('day');
			if (storedDate.isSame(todayDate, 'day')) {
				if (user.withdrawalCount >= withdrawDetails.requestCount) {
					return res.status(400).json({
						status: 0,
						message: `Your Withdraw Limit Is Over`,
					});
				}
				count = user?.withdrawalCount + 1;
			} else {
				count = 1;
			}
		} else {
			return res.status(400).json({
				status: 0,
				message: `Withdraw Time Over Please Try ${withdrawDetails.startTime} To ${withdrawDetails.endTime} Thank you`,
			});
		}
		const findAlreadyPending = await fundReq.findOne({
			userId: userId,
			reqStatus: "Pending",
			reqType: "Debit",
		});
		if (findAlreadyPending === null) {
			const formatted = dt.format("d/m/Y");
			const ts = moment(formatted, "DD/MM/YYYY").unix();
			const lastUpi = await upi.findOne({ userId: userId });
			if (!lastUpi) {
				const addReq = new fundReq({
					userId: req.body.user_id,
					reqAmount: req.body.req_amount,
					fullname: user.name,
					username: req.body.username,
					mobile: req.body.mobile,
					reqType: "Debit",
					reqStatus: "Pending",
					toAccount: {
						accNumber: req.body.accNumber,
						ifscCode: req.body.ifscCode,
						bankName: req.body.bankName,
						accName: req.body.accName
					},
					reqDate: formatted,
					reqTime: currentTime,
					withdrawalMode: req.body.withdrawalMode,
					UpdatedBy: "null",
					reqUpdatedAt: "null",
					timestamp: ts,
				});
				const save = await addReq.save();
				await User.findOneAndUpdate({ _id: userId }, { withdrawalCount: count, withdrawalTime: currentTime.format() });
				return res.status(200).json({
					status: 1,
					message: "Withdraw Request Raised Successfully",
				});
			}
			const upidate = lastUpi.reqDate;
			const upiTime = lastUpi.reqTime;
			if (upidate != formatted) {
				const addReq = new fundReq({
					userId: req.body.user_id,
					reqAmount: req.body.req_amount,
					fullname: user.name,
					username: req.body.username,
					mobile: req.body.mobile,
					reqType: "Debit",
					reqStatus: "Pending",
					toAccount: {
						accNumber: req.body.accNumber,
						ifscCode: req.body.ifscCode,
						bankName: req.body.bankName,
						accName: req.body.accName
					},
					reqDate: formatted,
					reqTime: currentTime,
					withdrawalMode: req.body.withdrawalMode,
					UpdatedBy: "null",
					reqUpdatedAt: "null",
					timestamp: ts,
				});
				const save = await addReq.save();
				await User.findOneAndUpdate({ _id: userId }, { withdrawalCount: count, withdrawalTime: currentTime.format() });
				return res.status(200).json({
					status: 1,
					message: "Withdraw Request Raised Successfully",
				});
			}

			const currentDaTi = moment().format("DD/MM/YYYY hh:mm:ss A");
			const lastupdte = upidate + " " + upiTime;

			let check = moment
				.utc(
					moment(currentDaTi, "DD/MM/YYYY HH:mm:ss A").diff(
						moment(lastupdte, "DD/MM/YYYY HH:mm:ss A")
					)
				)
				.format("HH:mm:ss");

			let checkTime = "00:05:00";

			if (check > checkTime) {
				const addReq = new fundReq({
					userId: req.body.user_id,
					reqAmount: req.body.req_amount,
					fullname: user.name,
					username: req.body.username,
					mobile: req.body.mobile,
					reqType: "Debit",
					reqStatus: "Pending",
					toAccount: {
						accNumber: req.body.accNumber,
						ifscCode: req.body.ifscCode,
						bankName: req.body.bankName,
						accName: req.body.accName
					},
					reqDate: formatted,
					reqTime: currentTime,
					withdrawalMode: req.body.withdrawalMode,
					UpdatedBy: "null",
					reqUpdatedAt: "null",
					timestamp: ts,
				});
				const save = await addReq.save();
				await User.findOneAndUpdate({ _id: userId }, { withdrawalCount: count, withdrawalTime: currentTime.format() });
				return res.status(200).json({
					status: 1,
					message: "Withdraw Request Raised Successfully",
				});
			} else {
				let wait_time = moment.utc(moment(checkTime, "HH:mm:ss").diff(moment(check, "HH:mm:ss"))).format("mm:ss");
				return res.json({
					status: 5,
					message:
						"Please Wait For " +
						wait_time +
						" Minutes To Raise Withdraw Request.",
				});
			}
		} else {
			return res.status(200).json({
				status: 1,
				message: "Your Previous Debit Request Is Pending",
			});
		}
		// }
		// }
		// }
	} catch (error) {
		return res.status(400).json({
			status: 0,
			message: "Something Bad Happened Please Contact Support " + error.toString(),
			error: error,
		});
	}
});

// router.post("/addpoint", async (req, res) => {
// 	try {
// 		const id = req.body.id;
// 		const user = await User.findOne({ _id: id });
// 		if (user) {
// 			let reqType = req.body.reqType;
// 			let bank = req.body.particular;
// 			let updateRefStatus = req.body.forceStatus;
// 			const amt = req.body.reqAmount;
// 			const adminId = req.body.adminId;
// 			let adminName = req.body.adminName;
// 			const refNo = req.body.refNo;
// 			let wallet_balance = parseInt(user.wallet_balance);
// 			let previous_amount = parseInt(user.wallet_balance);
// 			let time_updated = user.wallet_bal_updated_at;
// 			const username = user.username;
// 			const fullname = user.name;
// 			const mobile = user.mobile;
// 			const firebaseToken = user.firebaseId;
// 			const dt = dateTime.create();
// 			let time = dt.format("d/m/Y I:M:S");
// 			let check = moment
// 				.utc(
// 					moment(time, "DD/MM/YYYY HH:mm:ss").diff(
// 						moment(time_updated, "DD/MM/YYYY HH:mm:ss")
// 					)
// 				)
// 				.format("HH:mm:ss");

// 			let checkTime = "00:05:00";
// 			let desc = "";

// 			if (check > checkTime) {
// 				// 1: credit 2: debit
// 				let type = parseInt(reqType);
// 				if (type === 1) {
// 					wallet_balance = wallet_balance + parseInt(amt);
// 					reqType = "Credit";
// 					desc = "Amount Added To Wallet By " + adminName;
// 					filter = 4;
// 					update(amt);
// 				}

// 				if (type === 2) {
// 					wallet_balance = wallet_balance - parseInt(amt);
// 					reqType = "Debit";
// 					desc = "Amount Withdrawn From Wallet By " + adminName;
// 					filter = 5;
// 				}

// 				let dateUpdate = dt.format("d/m/Y");
// 				let time = dt.format("I:M:S p");
// 				const ts = moment(dateUpdate, "DD/MM/YYYY").unix();

// 				if (refNo) {
// 					if (updateRefStatus == true) {
// 						await upi.updateOne({ refrence_no: refNo }, {
// 							$set: {
// 								"reqStatus": "Approved",
// 							}
// 						})
// 						adminName = `UPI CHAT PANEL BY : ${adminName}`;
// 					}
// 					else {
// 						const refCheck = await upi.findOne({ refrence_no: refNo });
// 						if (refCheck) {
// 							if (refCheck.reqStatus == "submitted") {
// 								let messageShow = `Warning :- ${refCheck.reqAmount}/- Points Not Added to ${refCheck.username} wallet Reference Number: ${refNo}, because Payment Status Is Pending. Please forword this msg to dg admin`;
// 								forceStatus = true;
// 								return res.json({
// 									status: 0,
// 									message: messageShow,
// 									data: refCheck,
// 									forceStatus: forceStatus
// 								});
// 							}
// 							else if (refCheck.reqStatus == "Approved") {
// 								let dispMessage = `${refCheck.reqAmount}/- Points Already Added to ${refCheck.username} wallet with this Reference Number : ${refNo}`;
// 								let forceStatus = false;
// 								return res.json({
// 									status: 0,
// 									message: dispMessage,
// 									data: refCheck,
// 									forceStatus: forceStatus
// 								});
// 							}
// 							else {
// 								let showMessage3 = `${refCheck.reqAmount}/- Points Already Added to ${refCheck.username} wallet with this Reference Number : ${refNo}`;
// 								let forceStatus = false;
// 								return res.json({
// 									status: 0,
// 									message: showMessage3,
// 									data: refCheck,
// 									forceStatus: forceStatus,
// 									from: refCheck.reqStatus
// 								});
// 							}
// 						} else {
// 							const upi_name = req.body.upiName;
// 							const upi_name_id = req.body.upiId;

// 							const insertPayment = new upi({
// 								userId: id,
// 								fullname: fullname,
// 								upi_name_id: upi_name_id,
// 								upi_name: upi_name,
// 								username: username,
// 								mobile: mobile,
// 								reqAmount: amt,
// 								reqType: "Credit",
// 								reqStatus: "Approved",
// 								reqDate: dateUpdate,
// 								reqTime: time,
// 								paymentMode: "UPI",
// 								upi_app_name: "google pay",
// 								refrence_no: refNo,
// 								transaction_id: refNo,
// 								timestamp: ts,
// 							});
// 							await insertPayment.save();
// 							adminName = `UPI CHAT PANEL BY : ${adminName}`;
// 						}
// 					}
// 				}

// 				await User.updateOne(
// 					{ _id: id },
// 					{
// 						$set: {
// 							wallet_balance: wallet_balance,
// 							wallet_bal_updated_at: dateUpdate + " " + time,
// 						},
// 					}
// 				);

// 				const addReq = new fundReq({
// 					userId: id,
// 					reqAmount: amt,
// 					fullname: fullname,
// 					username: username,
// 					mobile: mobile,
// 					reqType: reqType,
// 					reqStatus: "Approved",
// 					reqDate: dateUpdate,
// 					reqTime: time,
// 					withdrawalMode: bank,
// 					UpdatedBy: adminName,
// 					reqUpdatedAt: dateUpdate + " " + time,
// 					fromExport: false,
// 					from: 1,
// 					timestamp: ts,
// 				});

// 				const saveId = await addReq.save();

// 				const point_history = new history({
// 					userId: id,
// 					bidId: saveId._id,
// 					filterType: filter,
// 					previous_amount: previous_amount,
// 					current_amount: wallet_balance,
// 					transaction_amount: amt,
// 					description: desc,
// 					transaction_date: dateUpdate,
// 					transaction_time: time,
// 					transaction_status: "Success",
// 					admin_id: adminId,
// 					addedBy_name: adminName,
// 					particular: bank,
// 					reqType: reqType,
// 					username: username,
// 					mobile: mobile,
// 				});

// 				await point_history.save();

// 				if (type === 1) {
// 					let userToken = [];
// 					userToken.push(firebaseToken);
// 					let title = "Your Credit Request Of Rs. " + amt + " is Approved";
// 					let body = "Wallet Notification";
// 					notification(userToken, title, body);
// 				}

// 				res.json({
// 					status: 1,
// 					message: "Wallet Balance Updated Succesfully",
// 				});
// 			} else {
// 				let wait_time = moment
// 					.utc(moment(checkTime, "HH:mm:ss").diff(moment(check, "HH:mm:ss")))
// 					.format("mm:ss");

// 				res.json({
// 					status: 5,
// 					message:
// 						"Please Wait For " +
// 						wait_time +
// 						" Minutes To Add Points To " +
// 						username +
// 						" Wallet.",
// 				});
// 			}
// 		} else {
// 			res.json({
// 				status: 0,
// 				message: "User Not Found",
// 			});
// 		}
// 	} catch (error) {
// 		res.json({
// 			status: 0,
// 			message: "Something Bad Happened Contact Support",
// 			error: error.toString(),
// 		});
// 	}
// });

router.post("/addpoint", async (req, res) => {
	try {
		const { userId, type, amount, paymenttype, upiId, refrenceNumber } = req.body;
		const user = await User.findOne({ _id: userId });
		if (user) {
			let wallet_balance = user.wallet_balance;
			let previous_amount = user.wallet_balance;
			const username = user.username;
			const fullname = user.name;
			const mobile = user.mobile;
			const firebaseToken = user.firebaseId;
			let requestType = parseInt(type);
			let dt = dateTime.create();
			let dateUpdate = dt.format("d/m/Y");
			let time = dt.format("I:M:S p");
			let ts = moment(dateUpdate, "DD/MM/YYYY").unix();
			let reqType;
			let upiDetails;
			let upiObjId = null;
			let UPINumber = null
			let title;
			let body;
                        let filter= 4;
			if (upiId !== null && upiId !== undefined) {
				upiDetails = await upiIds.findOne({ _id: upiId });
				upiObjId = upiDetails._id;
				UPINumber = upiDetails.UPI_ID
			}
			if (requestType === 1) {
				// body = "Wallet Notification";
				// title = `Your Credit Request Of Rs. ${amount}-/ is Approved`
				title = `Your Credit (Deposit) Request Of Rs.${amount}/- is Approved ✔️🤑💰`;
			    body = `Hello ${username} 🤩🤩`;
				wallet_balance = wallet_balance + parseInt(amount);
				reqType = "Credit";
				desc = "Amount Added To Wallet By Admin";
				filter = 4;
				update(amount);
				const insertPayment = new upi({
					userId: userId,
					fullname: fullname,
					upi_name_id: upiObjId,
					upi_name: UPINumber,
					username: username,
					mobile: mobile,
					reqAmount: parseInt(amount),
					reqType: "Credit",
					reqStatus: "Approved",
					reqDate: dateUpdate,
					reqTime: time,
					paymentMode: paymenttype,
					upi_app_name: "",
					refrence_no: refrenceNumber,
					transaction_id: "",
					timestamp: ts,
				});
				await insertPayment.save();
			}
			if (requestType === 2) {
				if (parseInt(amount) > user.wallet_balance) {
					return res.status(400).send({
						statusCode: 400,
						status: "Failure",
						message: `Your Withdrawal request amount is greater than to your current amount ${user.wallet_balance}`,
					});
				}
				title = `Your Debit (Withdrawal) Request Of Rs. ${amount}/- is Approved ✔️🤑💰`;
			    body = `Hello ${username} 🤩🤩`;
				// body = "Wallet Notification";
				// title = `Your Debit Request Of Rs. ${amount}-/ is Approved`
				wallet_balance = wallet_balance - parseInt(amount);
				reqType = "Debit";
				desc = "Amount Withdrawn From Wallet By Admin";
				filter = 5;
			}
			await User.updateOne(
				{ _id: userId },
				{
					$set: {
						wallet_balance: wallet_balance,
						wallet_bal_updated_at: dateUpdate + " " + time,
					},
				}
			);
			const addReq = new fundReq({
				userId: userId,
				reqAmount: parseInt(amount),
				fullname: fullname,
				username: username,
				mobile: mobile,
				reqType: reqType,
				reqStatus: "Approved",
				reqDate: dateUpdate,
				reqTime: time,
				reqUpdatedAt: dateUpdate + " " + time,
				UpdatedBy: "Admin",
				withdrawalMode: paymenttype,
				fromExport: false,
				from: 1,
				timestamp: ts,
			});
			const saveId = await addReq.save();

			const date2 = moment().format("DD/MM/YYYY");
			let timestamp = moment(date2, "DD/MM/YYYY").unix();

			const wallet_his = new history({
				userId: userId,
				bidId: saveId._id,
				filterType: filter,
				previous_amount: previous_amount,
				current_amount: wallet_balance,
				transaction_amount: parseInt(amount),
				description: desc,
				transaction_date: dateUpdate,
				transaction_time: time,
				transaction_status: "Success",
				particular: paymenttype,
				reqType: reqType,
				username: username,
				mobile: mobile,
				addedBy_name: "Admin",
				upiId: UPINumber,
				timestamp: timestamp,
				transaction_id: refrenceNumber,
			});
			await wallet_his.save();
			notification([firebaseToken], title, body);

			return res.status(200).send({
				statusCode: 200,
				status: "Success",
				message: "Wallet Balance Updated Succesfully",
			});
		}
	} catch (error) {
		res.status(400).json({
			status: 0,
			message: "Something Bad Happened Please Contact Support " + error.toString(),
			error: error,
		});
	}
});

router.post("/bankList", adminVerify, async (req, res) => {
	try {
		const bankList = await bank.find({ status: "1" });
		const upiList = await upiIds.find({ is_Active_chat: true }, { _id: 1, UPI_ID: 1 });
		res.json({
			status: 1,
			message: "Active Bank List Data",
			data: bankList,
			UPIlist: upiList,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happened Contact Support",
			error: error,
		});
	}
});

router.post("/withdrawText", async (req, res) => {
	try {
		let userDetails = await Users.findOne({ _id: req.body.id }, { username: 1, mobile: 1, _id: 0 });
		const text = await withdrawText.findOne();
		let data = {
			textMain: text.textMain,
			textSecondry: text.textSecondry,
			Number: userDetails.mobile,
			userName: userDetails.username,
			Timing: text.Timing,
		};

		res.json({
			status: 1,
			message: "Success",
			data: data,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happened Contact Support",
			error: error,
		});
	}
});

router.post("/idsUpi", async (req, res) => {
	try {
		const { last_id, userId } = req.body;
		if (last_id == "") {
			const upi = await upiIds.findOne({ is_Active: true });
			if (upi) {
				const upi_ID = upi.UPI_ID;
				const id = upi._id;
				res.json({
					status: 1,
					message: "Success",
					data: upi_ID,
					id: id,
				});
			} else {
				res.json({
					status: 0,
					message: "Payment Mode Not Activate. Please Try Again After Some Time",
				});
			}
		} else {
			const upi = await upiIds.findOne(
				{ _id: last_id, is_Active: true },
				{ _id: 1, UPI_ID: 1 }
			);
			if (upi) {
				let userDetails = await Users.findOne({_id:userId},{mobile:1,username:1,wallet_balance:1});
				const upi_ID = upi.UPI_ID;
				const id = upi._id;
				let mobile = userDetails.mobile;
				let username = userDetails.username;
				let walletBalance = userDetails.wallet_balance
				res.json({
					status: 1,
					message: "Success",
					data: upi_ID,
					id: id,
					mobile,
					username,
					walletBalance
				});
			} else {
				const upi = await upiIds.findOne({ is_Active: true });
				if (upi) {
					const upi_ID = upi.UPI_ID;
					const id = upi._id;
					res.json({
						status: 1,
						message: "Success",
						data: upi_ID,
						id: id,
					});
				} else {
					res.json({
						status: 0,
						message: "Upi Not Available, Comeback After Sometime",
					});
				}
			}
		}
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happened Contact Support",
			error: error,
		});
	}
});

router.post("/newAutoPaymentUpi", async (req, res) => {
	try {
		const userId = req.body.userId;
		const findUser = await User.findOne({ _id: userId });
		if (findUser) {
			const status = req.body.payment_status;
			const userBalance = findUser.wallet_balance;
			const amount = parseInt(req.body.amount);
			const transaction_id = req.body.transactiondId;
			const refrence_no = req.body.reference_id;
			const mode = req.body.transaction_mode;
			const upi_name = req.body.UPI_name;
			const upi_name_id = req.body.UPI_id;
			const fullName = findUser.name;
			const username = findUser.username;
			const mobile = findUser.mobile;
			const firebaseToken = findUser.firebaseId;
			const dt2 = dateTime.create();
			const dateUpdate = dt2.format("d/m/Y");
			const time = dt2.format("I:M:S p");
			const appName = req.body.app;

			const ts = moment(dateUpdate, "DD/MM/YYYY").unix();

			let updatedBal = userBalance + amount;


			const insertPayment = new upi({
				userId: userId,
				fullname: fullName,
				upi_name_id: upi_name_id,
				upi_name: upi_name,
				username: username,
				mobile: mobile,
				reqAmount: amount,
				reqType: "Credit",
				reqStatus: status,
				reqDate: dateUpdate,
				reqTime: time,
				paymentMode: mode,
				upi_app_name: appName,
				refrence_no: refrence_no,
				transaction_id: transaction_id,
				timestamp: ts,
			});

			await insertPayment.save();

			if (status == "Approved") {
				await User.updateOne(
					{ _id: userId },
					{
						$set: {
							wallet_balance: updatedBal,
							wallet_bal_updated_at: dateUpdate + time,
						},
					}
				);

				const addReq = new fundReq({
					userId: userId,
					reqAmount: amount,
					fullname: fullName,
					username: username,
					mobile: mobile,
					reqType: "Credit",
					reqStatus: "Approved",
					reqDate: dateUpdate,
					reqTime: time,
					reqUpdatedAt: dateUpdate + " " + time,
					UpdatedBy: "Auto/Self",
					withdrawalMode: mode,
					timestamp: ts,
				});

				const saveId = await addReq.save();
				const date2 = moment().format("DD/MM/YYYY");
				let timestamp = moment(date2, "DD/MM/YYYY").unix();
				const wallet_his = new history({
					userId: userId,
					bidId: saveId._id,
					filterType: 4,
					previous_amount: userBalance,
					current_amount: updatedBal,
					transaction_amount: amount,
					description:
						amount +
						"/- Added To Wallet By UPI, Transaction Id : " +
						transaction_id,
					transaction_date: dateUpdate,
					transaction_time: time,
					transaction_status: "Success",
					particular: "UPI",
					reqType: "Credit",
					username: username,
					mobile: mobile,
					addedBy_name: "Auto/Self",
					upiId: upi_name,
					timestamp: timestamp,
					transaction_id,
				});
				await wallet_his.save();

				let userToken = [];
				userToken.push(firebaseToken);
				let title = "Your Credit Request Of Rs. " + amount + " is Approved";
				let body = "Wallet Notification";
				notification(userToken, title, body);

				update(amount);

				res.json({
					status: 1,
					message:
						"Previous Balance : " +
						userBalance +
						", \n Current Balance : " +
						updatedBal,
					updatedBal: updatedBal,
				});
			} else if (status == "pending" || status == "submitted") {
				res.json({
					status: 1,
					message:
						"Your Payment Status is pending, Kindly Share Screenshot with Support To Add Point If Your Payment is Deducted",
				});
			} else {
				res.json({
					status: 0,
					message: "Please Try Again Later",
				});
			}
		} else {
			res.json({
				status: 0,
				message: "User Not Found",
			});
		}
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happened Contact Support",
			error: error,
		});
	}
});
router.post("/completeAutoPayment",async(req,res)=>{
	try{
        console.log("Or Kasa kai. kai kri rai rio tu. ");
		console.log("tharo kam hogyo gai");
		console.log(req.body)
	}catch(error){
		res.json({
			status: 0,
			message: "Something Bad Happened Contact Support",
			error: error,
		});
	}
})
router.post("/addPaymentOnline", async (req, res) => {
	try {
		const {
			mobile,
			status,
			description,
			allData,
			reqAmount,
			transaction_id,
			payment_mode,
		} = req.body;

		const checkId = await gatewayPayment.findOne({
			transaction_id: transaction_id,
		});

		if (checkId) {
			return res.json({
				status: 0,
				message: "Amount Already Added With This Id",
			});
		}

		const findUser = await User.findOne({ mobile: `+91${mobile}` });

		if (findUser == null) {
			return res.json({
				status: 0,
				message: "User not Found 1st",
			});
		}
		const userid = findUser._id;
		const username = findUser.username;
		const name = findUser.name;

		const date = moment().format("DD/MM/YYYY");
		const time = moment().format("hh:mm:ss A");
		const ts = moment(date, "DD/MM/YYYY").unix();

		const paymentDetail = new gatewayPayment({
			userId: userid,
			fullname: name,
			username: username,
			mobile: `+91${mobile}`,
			reqAmount: reqAmount,
			transaction_id: transaction_id,
			reqType: "Credit",
			reqStatus: status,
			reqDescription: description,
			mode: payment_mode,
			reqDate: date + " " + time,
			timestamp: ts,
			allResponse: allData,
		});

		await paymentDetail.save();

		if (status == 0) {
			const userCheck = await User.findOneAndUpdate(
				{ _id: userid },
				{
					$inc: {
						wallet_balance: parseInt(reqAmount),
					},
					$set: {
						wallet_bal_updated_at: date + " " + time,
					},
				},
				{
					returnOriginal: false,
				}
			);

			if (userCheck == null) {
				return res.json({
					status: 0,
					message: "User not Found",
				});
			}

			const current_amount = userCheck.wallet_balance;
			const previous_amount = parseInt(current_amount) - parseInt(reqAmount);
			const transaction_amount = reqAmount;

			const addReq = new fundReq({
				userId: userid,
				reqAmount: transaction_amount,
				fullname: name,
				username: username,
				mobile: `+91${mobile}`,
				reqType: "Credit",
				reqStatus: "Approved",
				reqDate: date,
				reqTime: time,
				reqUpdatedAt: date + " " + time,
				UpdatedBy: "Auto/Self",
				withdrawalMode: payment_mode,
				timestamp: ts,
			});

			const saveId = await addReq.save();

			const wallet_his = new history({
				userId: userid,
				bidId: saveId._id,
				filterType: 4,
				previous_amount: previous_amount,
				current_amount: current_amount,
				transaction_amount: transaction_amount,
				transaction_time: time,
				description: `${transaction_amount} added to wallet by ${payment_mode}, Transaction id : ${transaction_id}`,
				transaction_date: date,
				transaction_time: time,
				transaction_status: "Success",
				particular: payment_mode,
				reqType: "Credit",
				username: username,
				mobile: `+91${mobile}`,
				addedBy_name: "Auto/Self",
			});

			await wallet_his.save();

			let userToken = [];
			userToken.push(userCheck.firebaseId);
			let title =
				"Your Credit Request Of Rs. " +
				transaction_amount +
				"/- is Approved ✔️🤑💰";
			let body = "Hello " + username + " 🙋‍♂️🤩";
			notification(userToken, title, body);
		}

		return res.json({
			status: 1,
			message: "Dear User Your Transaction is processed successfully",
		});
	} catch (error) {
		return res.json({
			status: 0,
			message: "Something Bad Happened Contact Support",
			error: error.toString(),
		});
	}
});

router.post("/addPaymentOnlinePayu", async (req, res) => {
	try {
		const {
			mobile,
			status,
			description,
			allData,
			reqAmount,
			transaction_id,
			payment_mode,
			udf1,
		} = req.body;

		const checkId = await gatewayPayment.findOne({
			transaction_id: transaction_id,
		});

		if (checkId) {
			return res.json({
				status: 0,
				message: "Amount Already Added With This Id",
			});
		}
		let findUser = "";
		if (udf1 !== "") {
			findUser = await User.findOne({ _id: udf1 });
		} else {
			findUser = await User.findOne({ mobile: `+91${mobile}` });
		}
		if (findUser == null) {
			return res.json({
				status: 0,
				message: "User not Found 1st",
			});
		}
		const userid = findUser._id;
		const username = findUser.username;
		const name = findUser.name;

		const date = moment().format("DD/MM/YYYY");
		const time = moment().format("hh:mm:ss A");
		const ts = moment(date, "DD/MM/YYYY").unix();

		const paymentDetail = new gatewayPayment({
			userId: userid,
			fullname: name,
			username: username,
			mobile: `+91${mobile}`,
			reqAmount: reqAmount,
			transaction_id: transaction_id,
			reqType: "Credit",
			reqStatus: status,
			reqDescription: description,
			mode: payment_mode,
			reqDate: date + " " + time,
			timestamp: ts,
			allResponse: allData,
		});

		await paymentDetail.save();

		if (status == 0) {
			const userCheck = await User.findOneAndUpdate(
				{ _id: userid },
				{
					$inc: {
						wallet_balance: parseInt(reqAmount),
					},
					$set: {
						wallet_bal_updated_at: date + " " + time,
					},
				},
				{
					returnOriginal: false,
				}
			);

			if (userCheck == null) {
				return res.json({
					status: 0,
					message: "User not Found",
				});
			}

			const current_amount = userCheck.wallet_balance;
			const previous_amount = parseInt(current_amount) - parseInt(reqAmount);
			const transaction_amount = reqAmount;

			const addReq = new fundReq({
				userId: userid,
				reqAmount: transaction_amount,
				fullname: name,
				username: username,
				mobile: `+91${mobile}`,
				reqType: "Credit",
				reqStatus: "Approved",
				reqDate: date,
				reqTime: time,
				reqUpdatedAt: date + " " + time,
				UpdatedBy: "Auto/Self",
				withdrawalMode: payment_mode,
				timestamp: ts,
			});

			const saveId = await addReq.save();

			const wallet_his = new history({
				userId: userid,
				bidId: saveId._id,
				filterType: 4,
				previous_amount: previous_amount,
				current_amount: current_amount,
				transaction_amount: transaction_amount,
				transaction_time: time,
				description: `${transaction_amount} added to wallet by ${payment_mode}, Transaction id : ${transaction_id}`,
				transaction_date: date,
				transaction_time: time,
				transaction_status: "Success",
				particular: payment_mode,
				reqType: "Credit",
				username: username,
				mobile: `+91${mobile}`,
				addedBy_name: "Auto/Self",
			});

			await wallet_his.save();

			let userToken = [];
			userToken.push(userCheck.firebaseId);
			let title =
				"Your Credit Request Of Rs. " +
				transaction_amount +
				"/- is Approved ✔️🤑💰";
			let body = "Hello " + username + " 🙋‍♂️🤩";
			notification(userToken, title, body);
		}

		return res.json({
			status: 1,
			message: "Dear User Your Transaction is processed successfully",
		});
	} catch (error) {
		return res.json({
			status: 0,
			message: "Something Bad Happened Contact Support",
			error: error.toString(),
		});
	}
});

async function update(totalPoints) {
	let dataUpdate = await dashBoardUp.find();
	const update_id = dataUpdate[0]._id;
	await dashBoardUp.updateOne(
		{ _id: update_id },
		{
			$inc: { total_deposit_amount: parseInt(totalPoints) },
		}
	);
}

module.exports = router;
