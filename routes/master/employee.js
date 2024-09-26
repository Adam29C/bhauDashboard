const router = require("express").Router();
const empInsert = require("../../model/dashBoard/AdminModel");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const fetch = require("node-fetch");
const dateTime = require("node-datetime");
const bcrypt = require("bcryptjs");

router.get("/", session, permission, async (req, res) => {
	try {
		let empList = await empInsert.find({ role: 1 });
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["manageEmp"].showStatus;
		if (check === 1) {
			res.render("./masters/employee", {
				empList: empList,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Employee",
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

router.get("/profileAdmin", session, permission, async (req, res) => {
	try {
		let empList = await empInsert.find({ role: 1 });
		const userInfo = req.session.details;
		const role = userInfo.role;
		const permissionArray = req.view;

		if (role == 0) {
			const check = permissionArray["manageEmp"].showStatus;
			if (check === 1) {
				res.render("./masters/adminProfile", {
					empList: empList,
					userInfo: userInfo,
					permission: permissionArray,
					title: "Admin Profile",
				});
			} else {
				res.render("./dashboard/starterPage", {
					userInfo: userInfo,
					permission: permissionArray,
					title: "Dashboard",
				});
			}
		} else {
			res.redirect("/dashboard");
		}
	} catch (e) {
		res.json({ message: e });
	}
});

router.post("/blockEmployee", session, async (req, res) => {
	try {
		const id = req.body.id;
		const status = req.body.status;

		await empInsert.updateOne({ _id: id }, { $set: { banned: status } });

		let empList = await empInsert.find({ role: 1 });
		res.json({
			status: 1,
			message: "Blocked Successfully",
			response: empList,
		});
	} catch (e) {
		res.json({ message: e });
	}
});

router.get("/registerNewEmployee", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["createEmployee"].showStatus;
		if (check === 1) {
			res.render("./masters/createEmployee", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Create Employee",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (error) {
		res.json({ message: error });
	}
});

router.post("/createEmployee", session, async function (req, res) {
	try {
		let user = req.body.e_Username;
		let mobi = req.body.e_number;
		let emp_check = await empInsert.findOne({
			username: user.toLowerCase().replace(/\s/g, ""),
		});
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.e_password, salt);
		if (!emp_check) {
			let permission = [];
			permission[0] = req.body.main;
			permission[1] = req.body.users;
			permission[2] = req.body.games;
			permission[3] = req.body.gamesProvider;
			permission[4] = req.body.gamesSetting;
			permission[5] = req.body.gamesRates;
			permission[6] = req.body.gamesResult;
			permission[7] = req.body.starline;
			permission[8] = req.body.starlineProvider;
			permission[9] = req.body.starlineSetting;
			permission[10] = req.body.starlineRates;
			permission[11] = req.body.starlineProfit;
			permission[12] = req.body.starlineResult;
			permission[13] = req.body.ab;
			permission[14] = req.body.abProvider;
			permission[15] = req.body.abSetting;
			permission[16] = req.body.abRates;
			permission[17] = req.body.abProftLoss;
			permission[18] = req.body.abResult;
			permission[19] = req.body.cg;
			permission[20] = req.body.fcg;
			permission[21] = req.body.wallet;
			permission[22] = req.body.fundRequest;
			permission[23] = req.body.exportDebit;
			permission[24] = req.body.invoices;
			permission[25] = req.body.viewWallet;
			permission[26] = req.body.reqONOFF;
			permission[27] = req.body.appDebit;
			permission[28] = req.body.paytmReq;
			permission[29] = req.body.bankReq;
			permission[30] = req.body.decDebit;
			permission[31] = req.body.noti;
			permission[32] = req.body.news;
			permission[33] = req.body.appSetting;
			permission[34] = req.body.howToPlay;
			permission[35] = req.body.noticeBoard;
			permission[36] = req.body.profileNote;
			permission[37] = req.body.walletContact;
			permission[38] = req.body.masters;
			permission[39] = req.body.reports;
			permission[40] = req.body.jodiAll;
			permission[41] = req.body.salesReport;
			permission[42] = req.body.starLineSaleReport;
			permission[43] = req.body.abSalesReport;
			permission[44] = req.body.abTotalBids;
			permission[45] = req.body.totalBids;
			permission[46] = req.body.ajaySir;
			permission[47] = req.body.credDebReport;
			permission[48] = req.body.dailyReport;
			permission[49] = req.body.biddingReport;
			permission[50] = req.body.customerBal;
			permission[51] = req.body.allUserBIds;
			permission[52] = req.body.userBidsRatio;
			permission[53] = req.body.starlineBidsRatio;
			permission[54] = req.body.bank;
			permission[55] = req.body.manageEmp;
			permission[56] = req.body.createEmployee;
			permission[57] = req.body.fundReport;
			permission[58] = req.body.delete;
			permission[59] = req.body.upiReport;
			permission[60] = req.body.ocCutting;
			permission[61] = req.body.bookie;
			permission[62] = req.body.gamesRevert;
			permission[63] = req.body.gamesRefund;
			permission[64] = req.body.starlineRevert;
			permission[65] = req.body.abRevert;
			permission[66] = req.body.starlineRefund;
			permission[67] = req.body.abRefund
			permission[68] = req.body.creditrequest
			permission[69] = req.body.pendingDebitReq
			permission[70] = req.body.pendingBankReq
			permission[71] = req.body.pendingPaytmReq
			permission[72] = req.body.withdrawScreen
			permission[73] = req.body.appVersion;
			permission[74] = req.body.upiId
			permission[75] = req.body.addFoundMode
			permission[76] = req.body.deleteUser
			const emp_data = new empInsert({
				name: req.body.e_name,
				password: hashedPassword,
				username: req.body.e_Username.toLowerCase().replace(/\s/g, ""),
				designation: req.body.e_desi,
				user_counter: 0,
				role: "1",
				banned: 1,
				loginStatus: "Offline",
				last_login: "null",
				col_view_permission: permission,
				loginFor: req.body.loginFor,
			});

			await emp_data.save();
			// const userInfo = req.session.details;
			// const dt = dateTime.create();
			// const formatted = dt.format("m/d/Y I:M:S p");
			// let mobile = userInfo.mobile;
			// let url =
			// 	"https://api.msg91.com/api/sendhttp.php?route=4&sender=DGAMES&message=Name : " +
			// 	req.body.e_name +
			// 	"\n" +
			// 	"Username : " +
			// 	req.body.e_Username +
			// 	"\n" +
			// 	"Password : " +
			// 	req.body.e_password +
			// 	"\n\nCreated By : " +
			// 	userInfo.name +
			// 	"\nTime :" +
			// 	formatted +
			// 	"\n\n\n\nIf User Not Created By You Kindly Contact Support or Ignore If Created By You \nThank You - Team Khatri Games&country=91&mobiles=" +
			// 	mobile +
			// 	"&authkey=290393AuGCyi6j5d5bfd26";

			// fetch(url)
			// 	.then((res) => res.text())
			// 	.then((body) => body);

			res.json({
				status: 1,
				message: "Registered SuccessFully",
			});
		} else {
			if (emp_check.mobile == mobi) {
				res.json({
					status: 0,
					message: "USER ALREADY REGISTERED WITH THIS MOBILE NUMBER",
				});
			} else {
				res.json({
					status: 0,
					message: "USERNAME ALREADY EXIST",
				});
			}
		}
	} catch (error) {
		res.json({
			status: 2,
			messgae: "Server Error",
			error: error,
		});
	}
});

router.get("/editEmp/:id", session, permission, async function (req, res) {
	try {
		const empID = req.params.id;
		const findEmp = await empInsert.findOne({ _id: empID });
		const userInfo = req.session.details;
		const permissionArray = req.view;
		let arrayPer = findEmp.col_view_permission;
		let finalArray = {};

		for (index in arrayPer) {
			if (arrayPer[index] != null) {
				let indexValue = arrayPer[index];
				finalArray[indexValue] = {
					value: 1,
				};
			}
		}

		const check = permissionArray["manageEmp"].showStatus;
		if (check === 1) {
			res.render("./masters/editEmp", {
				empList: finalArray,
				userInfo: userInfo,
				permission: permissionArray,
				empDetails: findEmp,
				title: "Edit Employee",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happend Contact Support",
		});
	}
});

router.post("/updateEmployee", session, async function (req, res) {
	try {
console.log(req.body,"@#############")
		let empId = req.body.emp_id;
		let username = req.body.username;
		let permission = [];
		permission[0] = req.body.main;
		permission[1] = req.body.users;
		permission[2] = req.body.games;
		permission[3] = req.body.gamesProvider;
		permission[4] = req.body.gamesSetting;
		permission[5] = req.body.gamesRates;
		permission[6] = req.body.gamesResult;
		permission[7] = req.body.starline;
		permission[8] = req.body.starlineProvider;
		permission[9] = req.body.starlineSetting;
		permission[10] = req.body.starlineRates;
		permission[11] = req.body.starlineProfit;
		permission[12] = req.body.starlineResult;
		permission[13] = req.body.ab;
		permission[14] = req.body.abProvider;
		permission[15] = req.body.abSetting;
		permission[16] = req.body.abRates;
		permission[17] = req.body.abProftLoss;
		permission[18] = req.body.abResult;
		permission[19] = req.body.cg;
		permission[20] = req.body.fcg;
		permission[21] = req.body.wallet;
		permission[22] = req.body.fundRequest;
		permission[23] = req.body.exportDebit;
		permission[24] = req.body.invoices;
		permission[25] = req.body.viewWallet;
		permission[26] = req.body.reqONOFF;
		permission[27] = req.body.appDebit;
		permission[28] = req.body.paytmReq;
		permission[29] = req.body.bankReq;
		permission[30] = req.body.decDebit;
		permission[31] = req.body.noti;
		permission[32] = req.body.news;
		permission[33] = req.body.appSetting;
		permission[34] = req.body.howToPlay;
		permission[35] = req.body.noticeBoard;
		permission[36] = req.body.profileNote;
		permission[37] = req.body.walletContact;
		permission[38] = req.body.masters;
		permission[39] = req.body.reports;
		permission[40] = req.body.jodiAll;
		permission[41] = req.body.salesReport;
		permission[42] = req.body.starLineSaleReport;
		permission[43] = req.body.abSalesReport;
		permission[44] = req.body.abTotalBids;
		permission[45] = req.body.totalBids;
		permission[46] = req.body.ajaySir;
		permission[47] = req.body.credDebReport;
		permission[48] = req.body.dailyReport;
		permission[49] = req.body.biddingReport;
		permission[50] = req.body.customerBal;
		permission[51] = req.body.allUserBIds;
		permission[52] = req.body.userBidsRatio;
		permission[53] = req.body.starlineBidsRatio;
		permission[54] = req.body.bank;
		permission[55] = req.body.manageEmp;
		permission[56] = req.body.createEmployee;
		permission[57] = req.body.fundReport;
		permission[58] = req.body.delete;
		permission[59] = req.body.upiReport;
		permission[60] = req.body.ocCutting;
		permission[61] = req.body.bookie;
		permission[62] = req.body.gamesRevert;
		permission[63] = req.body.gamesRefund;
		permission[64] = req.body.starlineRevert;
		permission[65] = req.body.abRevert;
		permission[66] = req.body.starlineRefund;
        permission[67] = req.body.abRefund
		permission[68] = req.body.creditrequest
		permission[69] = req.body.pendingDebitReq
		permission[70] = req.body.pendingBankReq
		permission[71] = req.body.pendingPaytmReq
		permission[72] = req.body.withdrawScreen
		permission[73] = req.body.appVersion;
		permission[74] = req.body.upiId
		permission[75] = req.body.addFoundMode
		permission[76] = req.body.deleteUser
		const update = await empInsert.updateOne(
			{ _id: empId },
			{
				$set: {
					username: username,
					col_view_permission: permission,
					loginFor: req.body.loginFor,
				},
			}
		);

		res.json({
			status: 1,
			message: "Updated SuccessFully",
		});
	} catch (error) {
		res.json({
			status: 2,
			messgae: "Server Error",
			error: error,
		});
	}
});

router.post("/updatePaasword", session, async function (req, res) {
	try {
		const password = req.body.password;
		const adminId = req.body.adminId;
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const update = await empInsert.updateOne(
			{ _id: adminId},
			{
				$set: {
					password: hashedPassword,
				},
			}
		);

		res.json({
			status: 1,
			message: "Updated SuccessFully",
		});
	} catch (error) {
		res.json({
			status: 2,
			messgae: "Server Error",
			error: error,
		});
	}
});

router.post("/deleteEmp", session, async (req, res) => {
	try {
		const id = req.body.id;

		await empInsert.deleteOne({ _id: id });

		res.json({
			status: 1,
			message: "Emp Deleted Successfully",
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Server Error",
		});
	}
});

module.exports = router;
