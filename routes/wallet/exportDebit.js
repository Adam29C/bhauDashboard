const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../../model/API/Users");
const debitReq = require("../../model/API/FundRequest");
const userProfile = require("../../model/API/Profile");
const history = require("../../model/wallet_history");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const dateTime = require("node-datetime");
const Pusher = require("pusher");
const dashBoardUp = require("../../model/MainPage");
const daily = require("../../model/dailyWithdraw");
const notification = require("../helpersModule/creditDebitNotification");
const moment = require("moment");

// const gcm = require("node-gcm");
// const sender = new gcm.Sender("AAAAz-Vezi4:APA91bHNVKatfjZiHl13fcF1xzWK5pLOixdZlHE8KVRwIxVHLJdWGF973uErxgjL_HkzzD1K7a8oxgfjXp4StlVk_tNOTYdFkSdWe6vaKw6hVEDdt0Dw-J0rEeHpbozOMXd_Xlt-_dM1");
// const sender = new gcm.Sender(process.env.FIREBASE_SENDER_KEY);

router.get("/", session, permission, async (req, res) => {
	const dt = dateTime.create();
	const formatted = dt.format("d/m/Y");
	const userBebitReq = await debitReq.find(
		{ reqStatus: "Pending", reqType: "Debit", reqDate: formatted },
		{ _id: 1, userId: 1, reqAmount: 1, withdrawalMode: 1, reqDate: 1 }
	);
	let userIdArray = [];
	let debitArray = [];
	for (index in userBebitReq) {
		let reqAmount = userBebitReq[index].reqAmount;
		let withdrawalMode = userBebitReq[index].withdrawalMode;
		let reqDate = userBebitReq[index].reqDate;
		let user = userBebitReq[index].userId;
		let rowId = userBebitReq[index]._id;
		let userKi = mongoose.mongo.ObjectId(user);

		userIdArray.push(userKi);
		debitArray[userKi] = {
			rowId: rowId,
			userId: userKi,
			reqAmount: reqAmount,
			withdrawalMode: withdrawalMode,
			reqDate: reqDate,
		};
	}

	let userData = await User.find(
		{ _id: { $in: userIdArray } },
		{ _id: 1, wallet_balance: 1, username: 1, mobile: 1, firebaseId: 1 }
	);
	let user_Profile = await userProfile.find({ userId: { $in: userIdArray } });

	for (index in userData) {
		let id = userData[index]._id;
		let walletBal = userData[index].wallet_balance;
		let mobile = userData[index].mobile;
		let username = userData[index].username;
		let firebaseId = userData[index].firebaseId;
		if (debitArray[id]) {
			debitArray[id].walletBal = walletBal;
			debitArray[id].mobile = mobile;
			debitArray[id].username = username;
			debitArray[id].firebaseId = firebaseId;
		}
	}

	for (index in user_Profile) {
		let id = user_Profile[index].userId;
		if (debitArray[id]) {
			debitArray[id].address = user_Profile[index].address;
			debitArray[id].city = user_Profile[index].city;
			debitArray[id].pincode = user_Profile[index].pincode;
			debitArray[id].name = user_Profile[index].account_holder_name;
			debitArray[id].account_no = user_Profile[index].account_no;
			debitArray[id].bank_name = user_Profile[index].bank_name;
			debitArray[id].ifsc = user_Profile[index].ifsc_code;
			debitArray[id].paytm_number = user_Profile[index].paytm_number;
		}
	}
	const userInfo = req.session.details;
	const permissionArray = req.view;
	const check = permissionArray["exportDebit"].showStatus;
	if (check === 1) {
		res.render("./wallet/exportDebitReport", {
			userInfo: userInfo,
			data: debitArray,
			userInfo: userInfo,
			permission: permissionArray,
			title: "Export Debit Report",
		});
	} else {
		res.render("./dashboard/starterPage", {
			userInfo: userInfo,
			permission: permissionArray,
			title: "Dashboard",
		});
	}
});

router.get("/moneyCheck", session, permission, async (req, res) => {
	const userInfo = req.session.details;
	const permissionArray = req.view;
	const check = permissionArray["exportDebit"].showStatus;
	if (check === 1) {
		res.render("./wallet/downloadReport", {
			userInfo: userInfo,
			permission: permissionArray,
			title: "Export Debit Report",
		});
	} else {
		res.render("./dashboard/starterPage", {
			userInfo: userInfo,
			permission: permissionArray,
			title: "Dashboard",
		});
	}
});

router.post("/decline", session, async (req, res) => {
	try {
		const rowId = req.body.rowId;
		const firebaseId = req.body.firebaseId;
		const userId = req.body.userId;
		const reason = req.body.reason;
		const transaction_amount = req.body.amountDecline;

		const dt = dateTime.create();
		const formatted = dt.format("m/d/Y I:M:S");
		const time = dt.format("I:M p");
		const dateToday = dt.format("d/m/Y");
		const userInfo = req.session.details;
		const adminName = userInfo.name;
		const adminId = userInfo.user_id;

		let token = [];
		await debitReq.updateOne(
			{ _id: rowId },
			{
				$set: {
					reqStatus: "Declined",
					reqUpdatedAt: formatted,
					UpdatedBy: adminName,
				},
			}
		);

		const findUser = await User.findOne({ _id: userId }, { wallet_balance: 1, mobile: 1, username: 1, firebaseId: 1, _id: 0 })

		let dataHistory = new history({
			userId: userId,
			bidId: rowId,
			filterType: 9,
			previous_amount: findUser.wallet_balance,
			current_amount: findUser.wallet_balance,
			transaction_amount: transaction_amount,
			username: findUser.username,
			description: "Your Withdraw Request Is Cancelled Due To " + reason,
			transaction_date: dateToday,
			transaction_time: time,
			transaction_status: "Success",
			reqType: "Debit",
			admin_id: adminId,
			addedBy_name: adminName,
			mobile: findUser.mobile,
		});

		await dataHistory.save()

		// var message = new gcm.Message({
		// 	priority: "high",
		// 	data: {
		// 		title: "Withdraw Request Declined",
		// 		icon: "ic_launcher",
		// 		body: "Your Withdraw Request Is Cancelled Due To " + reason,
		// 	},
		// });
		// token.push(firebaseId);
		// sender.send(message, { registrationTokens: token }, function (
		// 	err,
		// 	response
		// ) {});

		let title = `Your Debit (Withdrawal) Request is decline for ${reason} 😌😌.\nRegards,\nBhau 777`;
		let body = `Dear ${userName}`;
		notification(token, title, body);

		res.json({
			status: 1,
			data: rowId,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error,
		});
	}
});

router.post("/approveReq", session, async (req, res) => {
	try {
		const updateArray = req.body.ids;
		const userArray = req.body.userData;
		const userplusIds = req.body.userplusIds;
		const dt = dateTime.create();
		const formatted = dt.format("m/d/Y I:M:S p");
		const formatted2 = dt.format("d/m/Y I:M:S p");
		const time = dt.format("I:M p");
		const dateToday = dt.format("d/m/Y");
		const userInfo = req.session.details;
		const adminName = userInfo.username;
		const adminId = userInfo.user_id;
		let total = 0;
		const historyArray = [];


		const dailyReport = new daily({
			ApprovedIDs: updateArray,
			ReportName: time + " Report",
			ReportTime: time,
			ReportDate: dateToday,
			adminName: adminName,
		});

		await dailyReport.save();

		await debitReq.updateMany(
			{ _id: updateArray },
			{
				$set: {
					reqStatus: "Approved",
					UpdatedBy: adminName,
					reqUpdatedAt: formatted,
					fromExport: true,
					from: 2,
				},
			}
		);

		for (index in userArray) {
			let userId = userArray[index].userId;
			let userName = userArray[index].username;
			let transaction_amount = userArray[index].req_amt;
			let mobile = userArray[index].mobile;

			total += parseInt(transaction_amount);

			let userDetail = await User.findOne(
				{ _id: userId },
				{ wallet_balance: 1, firebaseId: 1 }
			);
			let wallet_balance = userDetail.wallet_balance;
			let updateAmt = wallet_balance - transaction_amount;
			await User.updateOne(
				{ _id: userId },
				{
					$set: {
						wallet_balance: updateAmt,
						wallet_bal_updated_at: formatted2,
					},
				}
			);

			let dt0 = dateTime.create();
			let time = dt0.format("I:M:S p");

			let rowSearch = userplusIds[userId];
			let rowId = rowSearch.rowId

			let dataHistory = {
				userId: userId,
				bidId: rowId,
				filterType: 9,
				previous_amount: wallet_balance,
				current_amount: updateAmt,
				transaction_amount: transaction_amount,
				username: userName,
				description: "Amount Debited For Withdraw Request",
				transaction_date: dateToday,
				transaction_time: time,
				transaction_status: "Success",
				reqType: "Debit",
				admin_id: adminId,
				addedBy_name: adminName,
				mobile: mobile,
			};
			historyArray.push(dataHistory);
			updateReal(total);

			let userToken = [];
			userToken.push(userDetail.firebaseId);
			let title = `Your Debit (Withdrawal) Request Of Rs.${transaction_amount}/- is Approved ✔️🤑💰.\nRegards,\nBhau 777`;
			let body = `Dear ${userName} 🤩🤩`;
			notification(userToken, title, body);
		}

		await history.insertMany(historyArray);

		res.json({
			status: 1,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error,
		});
	}
});

router.post("/xlsDataNew", session, async (req, res) => {
	try {
		const reqStatus = req.body.searchType;
		const reportDate = req.body.reportDate;
		const formatDate = moment(reportDate, "MM/DD/YYYY").format("DD/MM/YYYY");

		let query = {
			reqStatus: reqStatus,
			reqType: "Debit",
			reqDate: formatDate,
			fromExport: true,
		};

		if (reqStatus == "Pending") {
			query = { reqStatus: reqStatus, reqType: "Debit", reqDate: formatDate };
		}

		const userBebitReq = await debitReq.find(query, {
			_id: 1,
			reqAmount: 1,
			withdrawalMode: 1,
			reqDate: 1,
			toAccount: 1
		});

		let Product_Code = req.body.Product_Code;
		let Bank_Code_Indicator = req.body.Bank_Code_Indicator;
		let Client_Code = req.body.Client_Code;
		let Dr_Ac_No = req.body.Dr_Ac_No;

		const filename = formatDate + Client_Code + ".txt";
		let finalReport = "";

		for (index in userBebitReq) {

			let bankDetails = userBebitReq[index].toAccount;
			let ifsc = bankDetails.ifscCode;
			let name = bankDetails.accName;
			let amt = userBebitReq[index].reqAmount;
			let accNo = bankDetails.accNumber;

			if (ifsc != null) {
				ifsc = ifsc.toUpperCase();
				name = name.replace(/\.+/g, " ");
				name = name.toUpperCase();
			}

			finalReport += Client_Code + "~" + Product_Code + "~NEFT~~" + formatDate + "~~" + Dr_Ac_No + "~" + amt + "~" + Bank_Code_Indicator + "~~" + name + "~~" + ifsc + "~" + accNo + "~~~~~~~~~~" + name + "~" + name + "~~~~~~~~~~~~~~~~~~~~~~~~\n";
		}

		res.json({
			status: 0,
			filename: filename,
			writeString: finalReport,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error.toString(),
		});
	}
});

router.post("/todayApproved", session, async (req, res) => {
	try {
		const date = req.body.date;
		const formatDate = moment(date, "MM/DD/YYYY").format("DD/MM/YYYY");
		const todayReports = await daily.find({ ReportDate: formatDate });
		res.json({
			status: 1,
			data: todayReports,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error,
		});
	}
});

router.post("/xlsDataDaily", session, async (req, res) => {
	try {
		const { reportID, type, reportType, Product_Code, Bank_Code_Indicator, Client_Code, Dr_Ac_No } = req.body;
		const formatDate = moment().format("DD/MM/YYYY");
		const todayReports = await daily.findOne({ _id: reportID });
		const ids = todayReports.ApprovedIDs;
		const reportName = todayReports.ReportName;
		const userBebitReq = await debitReq.find({ _id: { $in: ids } });
		if (type === 1) {
			return res.json({
				status: 0,
				Profile: userBebitReq,
				date: formatDate,
			});
		}
		const filename = formatDate + Client_Code + reportName + ".txt";
		let finalReport = "";
		for (index in userBebitReq) {
			let bankDetails = userBebitReq[index].toAccount;
			let ifsc = bankDetails.ifscCode;
			let name = bankDetails.accName;
			let amt = userBebitReq[index].reqAmount;
			let accNo = bankDetails.accNumber;
			if (ifsc != null) {
				ifsc = ifsc.toUpperCase();
				name = name.replace(/\.+/g, " ");
				name = name.toUpperCase();
			}
			finalReport += Client_Code + "~" + Product_Code + "~NEFT~~" + formatDate + "~~" + Dr_Ac_No + "~" + amt + "~" + Bank_Code_Indicator + "~~" + name + "~~" + ifsc + "~" + accNo + "~~~~~~~~~~" + name + "~" + name + "~~~~~~~~~~~~~~~~~~~~~~~~\n";
		}
		res.json({
			status: 0,
			filename: filename,
			writeString: finalReport,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error.toString(),
		});
	}
});

router.post("/xlsDataDailyTrak", session, async (req, res) => {
	try {
		const reqStatus = req.body.searchType;
		const reportDate = req.body.reportDate;
		const formatDate = moment(reportDate, "MM/DD/YYYY").format("DD/MM/YYYY");

		let query = {
			reqStatus: reqStatus,
			reqType: "Debit",
			reqDate: formatDate,
			fromExport: true,
		};

		if (reqStatus == "Pending") {
			query = { reqStatus: reqStatus, reqType: "Debit", reqDate: formatDate };
		}

		const userBebitReq = await debitReq.find(query, {
			_id: 1,
			reqAmount: 1,
			withdrawalMode: 1,
			reqDate: 1,
			toAccount: 1,
			mobile: 1
		});

		res.json({
			status: 0,
			Profile: userBebitReq,
			date: formatDate,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error,
		});
	}
});

router.post("/showCondition", session, async (req, res) => {
	try {
		const reqStatus = req.body.searchType;
		const reportDate = req.body.reportDate;
		const formatDate = moment(reportDate, "MM/DD/YYYY").format("DD/MM/YYYY");
		let totlaAmt = 0;
		let query;

		switch (reqStatus) {
			case "0":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
				};
				break;
			case "1":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $eq: 1000 },
				};

				break;
			case "2":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $lte: 5000 },
				};
				break;
			case "3":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $lt: 20000 },
				};
				break;
			case "4":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $gte: 20000 },
				};
				break;
		}

		if (reqStatus == "Pending") {
			query = { reqStatus: reqStatus, reqType: "Debit", reqDate: formatDate };
		}

		const userBebitReq = await debitReq.find(query, {
			_id: 1,
			userId: 1,
			reqAmount: 1,
			withdrawalMode: 1,
			reqDate: 1,
			username: 1,
		});

		let userIdArray = [];
		let debitArray = {};

		for (index in userBebitReq) {
			let reqAmount = userBebitReq[index].reqAmount;
			let withdrawalMode = userBebitReq[index].withdrawalMode;
			let reqDate = userBebitReq[index].reqDate;
			let username = userBebitReq[index].username;
			let user = userBebitReq[index].userId;
			let userKi = mongoose.mongo.ObjectId(user);
			userIdArray.push(userKi);
			totlaAmt += reqAmount;
			debitArray[userKi] = {
				reqAmount: reqAmount,
				withdrawalMode: withdrawalMode,
				reqDate: reqDate,
				username: username,
			};
		}

		let user_Profile = await userProfile.find({ userId: { $in: userIdArray } });

		for (index in user_Profile) {
			let id = user_Profile[index].userId;
			if (debitArray[id]) {
				debitArray[id].name = user_Profile[index].account_holder_name;
				debitArray[id].account_no = user_Profile[index].account_no;
				debitArray[id].ifsc = user_Profile[index].ifsc_code;
				debitArray[id].bname = user_Profile[index].bank_name;
			}
		}

		res.json({
			status: 0,
			Profile: debitArray,
			totalAmt: totlaAmt,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error,
		});
	}
});

router.post("/xlsDataNewCondition", session, async (req, res) => {
	try {
		const reqStatus = req.body.searchType;
		const reportDate = req.body.reportDate;
		const formatDate = moment(reportDate, "MM/DD/YYYY").format("DD/MM/YYYY");
		let totlaAmt = 0;
		let query;

		switch (reqStatus) {
			case "0":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
				};
				break;
			case "1":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $eq: 1000 },
				};

				break;
			case "2":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $lte: 5000 },
				};
				break;
			case "3":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $lt: 20000 },
				};
				break;
			case "4":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $gte: 20000 },
				};
				break;
		}

		if (reqStatus == "Pending") {
			query = { reqStatus: reqStatus, reqType: "Debit", reqDate: formatDate };
		}

		const userBebitReq = await debitReq.find(query, {
			_id: 1,
			userId: 1,
			reqAmount: 1,
			withdrawalMode: 1,
			reqDate: 1,
		});

		let userIdArray = [];
		let debitArray = {};

		for (index in userBebitReq) {
			let reqAmount = userBebitReq[index].reqAmount;
			let withdrawalMode = userBebitReq[index].withdrawalMode;
			let reqDate = userBebitReq[index].reqDate;
			let user = userBebitReq[index].userId;
			let rowId = userBebitReq[index]._id;
			let userKi = mongoose.mongo.ObjectId(user);
			totlaAmt += reqAmount;
			userIdArray.push(userKi);
			debitArray[userKi] = {
				rowId: rowId,
				userId: userKi,
				reqAmount: reqAmount,
				withdrawalMode: withdrawalMode,
				reqDate: reqDate,
			};
		}

		let userData = await User.find(
			{ _id: { $in: userIdArray } },
			{ _id: 1, wallet_balance: 1 }
		);

		for (index in userData) {
			let id = userData[index]._id;
			let walletBal = userData[index].wallet_balance;
			if (debitArray[id]) {
				debitArray[id].walletBal = walletBal;
			}
		}

		let user_Profile = await userProfile.find({ userId: { $in: userIdArray } });

		for (index in user_Profile) {
			let id = user_Profile[index].userId;
			if (debitArray[id]) {
				debitArray[id].name = user_Profile[index].account_holder_name;
				debitArray[id].account_no = user_Profile[index].account_no;
				debitArray[id].ifsc = user_Profile[index].ifsc_code;
			}
		}

		let Product_Code = req.body.Product_Code;
		let Bank_Code_Indicator = req.body.Bank_Code_Indicator;
		let Client_Code = req.body.Client_Code;
		let Dr_Ac_No = req.body.Dr_Ac_No;

		const filename = formatDate + Client_Code + ".txt";
		let finalReport = "";

		for (index in debitArray) {
			let ifsc = debitArray[index].ifsc;
			let name = debitArray[index].name;
			let amt = debitArray[index].reqAmount;
			let accNo = debitArray[index].account_no;

			if (ifsc != null) {
				ifsc = ifsc.toUpperCase();
				name = name.replace(/\.+/g, " ");
				name = name.toUpperCase();
			}

			finalReport +=
				Client_Code +
				"~" +
				Product_Code +
				"~NEFT~~" +
				formatDate +
				"~~" +
				Dr_Ac_No +
				"~" +
				amt +
				"~" +
				Bank_Code_Indicator +
				"~~" +
				name +
				"~~" +
				ifsc +
				"~" +
				accNo +
				"~~~~~~~~~~" +
				name +
				"~" +
				name +
				"~~~~~~~~~~~~~~~~~~~~~~~~\n";
		}

		res.json({
			status: 0,
			Profile: debitArray,
			filename: filename,
			writeString: finalReport,
			totalAmt: totlaAmt,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error,
		});
	}
});

router.post("/xlsDataDailyTrakCondition", session, async (req, res) => {
	try {
		const reqStatus = req.body.searchType;
		const reportDate = req.body.reportDate;
		const formatDate = moment(reportDate, "MM/DD/YYYY").format("DD/MM/YYYY");
		let totlaAmt = 0;
		let query;

		switch (reqStatus) {
			case "0":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
				};
				break;
			case "1":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $eq: 1000 },
				};

				break;
			case "2":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $lte: 5000 },
				};
				break;
			case "3":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $lt: 20000 },
				};
				break;
			case "4":
				query = {
					reqStatus: "Approved",
					reqType: "Debit",
					reqDate: formatDate,
					fromExport: true,
					reqAmount: { $gte: 20000 },
				};
				break;
		}

		const userBebitReq = await debitReq.find(query, {
			_id: 1,
			userId: 1,
			reqAmount: 1,
			withdrawalMode: 1,
			reqDate: 1,
		});

		let userIdArray = [];
		let debitArray = {};

		for (index in userBebitReq) {
			let reqAmount = userBebitReq[index].reqAmount;
			let withdrawalMode = userBebitReq[index].withdrawalMode;
			let reqDate = userBebitReq[index].reqDate;
			let user = userBebitReq[index].userId;
			let rowId = userBebitReq[index]._id;
			let userKi = mongoose.mongo.ObjectId(user);
			totlaAmt += reqAmount;
			userIdArray.push(userKi);
			debitArray[userKi] = {
				rowId: rowId,
				userId: userKi,
				reqAmount: reqAmount,
				withdrawalMode: withdrawalMode,
				reqDate: reqDate,
			};
		}

		let userData = await User.find(
			{ _id: { $in: userIdArray } },
			{ _id: 1, wallet_balance: 1 }
		);

		for (index in userData) {
			let id = userData[index]._id;
			let walletBal = userData[index].wallet_balance;
			if (debitArray[id]) {
				debitArray[id].walletBal = walletBal;
			}
		}

		let user_Profile = await userProfile.find({ userId: { $in: userIdArray } });

		for (index in user_Profile) {
			let id = user_Profile[index].userId;
			if (debitArray[id]) {
				debitArray[id].name = user_Profile[index].account_holder_name;
				debitArray[id].account_no = user_Profile[index].account_no;
				debitArray[id].ifsc = user_Profile[index].ifsc_code;
				debitArray[id].bank_name = user_Profile[index].bank_name;
			}
		}

		res.json({
			status: 0,
			Profile: debitArray,
			date: formatDate,
			totalAmt: totlaAmt,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error,
		});
	}
});

router.post("/getDetails", session, async (req, res) => {
	try {
		const number = req.body.acc_num;
		let profile = await userProfile.find({ account_no: { $regex: number } });
		let profileAgain = await userProfile.find({
			"changeDetails.old_acc_no": { $regex: number },
		});
		let merge = [...profile, ...profileAgain]
		res.json(merge);
	} catch (error) {
		res.json({
			status: 0,
			error: error,
		});
	}
});

router.post("/getChangeDetails", session, async (req, res) => {
	try {
		const number = req.body.rowId;
		let profile = await userProfile.findOne({ _id: number });
		res.json(profile);
	} catch (error) {
		res.json({
			status: 0,
			error: error,
		});
	}
});

async function updateReal(points) {
	let dataUpdate = await dashBoardUp.find();
	const update_id = dataUpdate[0]._id;
	await dashBoardUp.updateOne(
		{ _id: update_id },
		{
			$inc: {
				total_withdraw_amount: parseInt(points),
			},
		}
	);
}
router.post("/rblxls", async (req, res) => {
	try {
		const reqStatus = req.body.searchType;
		const reportDate = req.body.reportDate;
		const formatDate = moment(reportDate, "MM/DD/YYYY").format("DD/MM/YYYY");
		let query = {
			reqStatus: reqStatus,
			reqType: "Debit",
			reqDate: formatDate,
			fromExport: true,
		};
		if (reqStatus == "Pending") {
			query = { reqStatus: reqStatus, reqType: "Debit", reqDate: formatDate };
		}
		const userBebitReq = await debitReq.find(query, {
			_id: 1,
			reqAmount: 1,
			withdrawalMode: 1,
			reqDate: 1,
			toAccount: 1,
			mobile: 1
		});
		const formattedData = userBebitReq.map(item => ({
			destinationAcNumber: item.toAccount.accNumber,
			destinationBankName: item.toAccount.bankName,
			destinationIfscCode: item.toAccount.ifscCode,
			destinationAccName: item.toAccount.accName,
			amount: item.reqAmount,
			withdrawalMode: item.withdrawalMode,
			paymentType: "NFT",
			sourceNarration: "to XYZ",
			currency: "INR",
			destinationNarration: "From abc",
			beneficiaryAccountType: "Saving",
			sourceAccountNumber: "100881008810088",
			email: "abc@ac.com"
		}));
		res.json({
			status: 0,
			Profile: formattedData,
			date: formatDate,
		});
	} catch (error) {
		res.json({
			status: 0,
			error: error.message || error,
		});
	}
});

module.exports = router;
