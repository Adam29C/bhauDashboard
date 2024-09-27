const router = require("express").Router();
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const User = require("../../model/API/Users");
const wallet_history = require("../../model/wallet_history");
const changeHistory = require("../../model/API/Profile");
const fundReq = require("../../model/API/FundRequest");
const bank = require("../../model/bank");
const dateTime = require("node-datetime");
const dotenv = require("dotenv");
const notification = require("../helpersModule/creditDebitNotification");
const moment = require("moment");
dotenv.config();

router.get("/", session, permission, async (req, res) => {
	const banklist = await bank.find({ status: "1" });
	var perPage = 50;
	var page = 1;
	var currentRow = 50 * page;
	var showEntry = currentRow + 50;
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;
		User.find({ banned: false })
			.skip(perPage * page - perPage)
			.limit(perPage)
			.sort({ wallet_balance: -1 })
			.exec(function (err, hisdata) {
				if (err) throw err;
				User.countDocuments({}).exec((err, count) => {
					const check = permissionArray["viewWallet"].showStatus;
					if (check === 1) {
						res.render("./wallet/view_Wallet", {
							status: 1,
							records: hisdata,
							current: page,
							pages: Math.ceil(count / perPage),
							userInfo: userInfo,
							permission: permissionArray,
							count: count,
							showEntry: showEntry,
							data: banklist,
							title: "View Wallet",
						});
					} else {
						res.render("./dashboard/starterPage", {
							userInfo: userInfo,
							permission: permissionArray,
							title: "Dashboard",
						});
					}
				});
			});
	} catch (error) {
		res.json(error);
	}
});

router.get("/search", session, permission, async (req, res) => {
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["viewWallet"].showStatus;
		if (check === 1) {
			res.render("./wallet/searchUser", {
				status: 1,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Search User",
			});
		} else {
			res.render("./dashboard/starterPage", {
				userInfo: userInfo,
				permission: permissionArray,
				title: "Dashboard",
			});
		}
	} catch (error) {
		res.json(error);
	}
});

router.post("/user_ajax", session, async (req, res) => {
	try {
		let order = req.body.order;
		let col = order[0].column;
		if (col == 0) {
			order = [{ column: "4", dir: "desc" }];
		}

		let i = parseInt(req.body.start) + 1;
		User.dataTables({
			limit: req.body.length,
			skip: req.body.start,
			sort: { _id: -1, wallet_balance: -1 },
			order: order,
			columns: req.body.columns,
			search: {
				value: req.body.search.value,
				fields: ["username", "name", "mobile"],
			},
		})
			.then(function (table) {
				let dataTab = table.data;
				let tabelArray = [];
				for (index in dataTab) {
					let id = "'" + dataTab[index]._id + "'";
					let username = "'" + dataTab[index]._id + "152'";
					let usernameonly = "'" + dataTab[index]._id + "'";
					let username1 = "'" + dataTab[index].username + "'";

					let mobileNumber = dataTab[index].mobile;
					let dataJson = {
						_id: i,
						username: dataTab[index].username,
						name: dataTab[index].name,
						mobile: mobileNumber,
						wallet_balance:
							'<span class="badge badge-purple" id=' +
							usernameonly +
							">" +
							dataTab[index].wallet_balance +
							"/- </span>",
						wallet_bal_updated_at:
							"<span id=" +
							username +
							">" +
							dataTab[index].wallet_bal_updated_at +
							"</span>",
						creditDebit: '<button class="btn btn-dark waves-effect waves-light btn-xs" data-toggle="modal" data-target=".bs-example-modal-xl" onclick="getCred(' +
							id +
							", " +
							username1 +
							')"><i class="fa fa-history"></i></button>',
						// fundReq : '<button class="btn btn-dark waves-effect waves-light btn-xs" data-toggle="modal" data-target=".fundReqmodal" onclick="getfundReq(' +id +
						// ", " +
						// username1 +
						// ')"><i class="fa fa-history"></i></button>',
						edit:
							'<button class="btn btn-icon waves-effect waves-light btn-purple btn-xs" data-toggle="modal" data-target=".bs-example-modal-sm" onclick="updateBal(' +
							id +
							')"><i class="fa fa-edit"></i></button>',
						history:
							'<button class="btn btn-icon waves-effect waves-light btn-warning btn-xs" data-toggle="modal" data-target=".bs-example-modal-xl" onclick="history(' +
							id +
							", " +
							username1 +
							')"><i class="fa fa-history"></i></button>',
						profile:
							'<button class="btn btn-purple waves-effect waves-light btn-xs" data-toggle="modal" data-target="#custom-modal-edit" onclick="profile(' +
							id +
							')"><i class="fa fa-user"></i></button>',
					};
					tabelArray.push(dataJson);
					i++;
				}
				res.json({
					data: tabelArray,
					recordsFiltered: table.total,
					recordsTotal: table.total,
				});
			})
			.catch(function (error) {
				res.json({
					status: 0,
					message: "Request To Large",
				});
			});
	} catch (error) {
		res.json(error);
	}
});

router.get("/getData", session, async (req, res) => {
	try {
		const userData = await User.find();
		res.json(userData);
	} catch (e) {
		res.json(e);
	}
});

router.post("/updateData", session, async (req, res) => {
	try {
		const id = req.body.id;
		const bal = req.body.amount;
		const type = req.body.type;
		const user = await User.findOne({ _id: id });
		const firebaseToken = user.firebaseId;
		const mobileNum = user.mobile;
		const username = user.username;
		const fullname = user.name;
		const wallet_bal = user.wallet_balance;
		let particular = req.body.particular;
		let update_bal = "";
		let detail = "";
		let reqType = "";
		const userInfo = req.session.details;
		const admin_id = userInfo.user_id;
		const adminName = userInfo.username;

		if (type == 1) {
			update_bal = wallet_bal + parseInt(bal);
			detail = "Amount Added To Wallet By " + adminName;
			reqType = "Credit";
			filter = 4;
		} else {
			update_bal = wallet_bal - parseInt(bal);
			detail = "Amount Withdrawn From Wallet By " + adminName;
			reqType = "Debit";
			particular = "Bank";
			filter = 5;
		}

		const dt = dateTime.create();
		const formatted = dt.format("d/m/Y");
		const time = dt.format("I:M:S p");
		var ts = moment(formatted, "DD/MM/YYYY").unix();

		const addReq = new fundReq({
			userId: id,
			reqAmount: bal,
			fullname: fullname,
			username: username,
			mobile: mobileNum,
			reqType: reqType,
			reqStatus: "Approved",
			reqDate: formatted,
			reqTime: time,
			withdrawalMode: particular,
			UpdatedBy: adminName,
			reqUpdatedAt: formatted + " " + time,
			fromExport: false,
			from: 1,
			timestamp: ts,
		});

		const saveId = await addReq.save();

		await User.updateOne(
			{ _id: id },
			{
				$set: {
					wallet_balance: update_bal,
					wallet_bal_updated_at: formatted + " " + time,
				},
			}
		);

		const date2 = moment().format("DD/MM/YYYY");
        let timestamp = moment(date2, "DD/MM/YYYY").unix();
		const history = new wallet_history({
			userId: id,
			bidId : saveId._id,
			filterType : filter,
			previous_amount: wallet_bal,
			current_amount: update_bal,
			transaction_amount: parseInt(bal),
			description: detail,
			transaction_date: formatted,
			transaction_time: time,
			transaction_status: "Success",
			admin_id: admin_id,
			particular: particular,
			upiId:"null",
            timestamp:timestamp,
			username: username,
			reqType: reqType,
			addedBy_name: adminName,
			mobile: mobileNum,
		});

		await history.save();

		if (type == 1) {
			let userToken = [];
			userToken.push(firebaseToken);
			let title = "Your Credit (Deposit) Request Of Rs. " + bal + "/- is Approved ✔️🤑💰";
			let body = "Hello " + username + " 🤩🤩";
			notification(userToken, title, body);
		}else{
			let userToken = [];
			userToken.push(firebaseToken);
			let title = "Your Debit (Withdrawal) Request Of Rs. " + bal + "/- is Approved ✔️🤑💰";
			let body = "Hello " + username + " 🤩🤩";
			notification(userToken, title, body);
		}
		res.json({
			status: 1,
			username: username,
			transaction_date: formatted + " " + time,
			balance: update_bal,
		});
	} catch (e) {
		res.json({ message: e });
	}
});

router.get("/profileChange", session, permission, async (req, res) => {
	var perPage = 50;
	var page = 1;
	var currentRow = 50 * page;
	var showEntry = currentRow + 50;
	try {
		const userInfo = req.session.details;
		const permissionArray = req.view;
		changeHistory
			.find({ changeDetails: { $exists: true, $ne: [] } })
			.skip(perPage * page - perPage)
			.limit(perPage)
			.exec(function (err, hisdata) {
				if (err) throw err;
				changeHistory
					.countDocuments({ changeDetails: { $exists: true, $ne: [] } })
					.exec((err, count) => {
						const check = permissionArray["viewWallet"].showStatus;
						if (check === 1) {
							res.render("./wallet/invoices", {
								status: 1,
								records: hisdata,
								current: page,
								pages: Math.ceil(count / perPage),
								userInfo: userInfo,
								permission: permissionArray,
								count: count,
								showEntry: showEntry,
								title: "Invoices",
							});
						} else {
							res.render("./dashboard/starterPage", {
								userInfo: userInfo,
								permission: permissionArray,
								title: "Dashboard",
							});
						}
					});
			});
	} catch (error) {
		res.json({
			status: 0,
			message: "Not Ok",
			err: error,
		});
	}
});

router.post("/profileChange_ajax", session, async (req, res) => {
	var perPage = 50;
	var page = parseInt(req.body.skipValue);
	var searchInputTable = req.body.searchInputTable;
	var lastLimit = 50 * page;
	var startEntry = lastLimit - perPage + 1;

	try {
		let serachQuery;
		if (searchInputTable !== "" && searchInputTable != undefined) {
			serachQuery = {
				username: { $regex: searchInputTable },
				changeDetails: { $exists: true, $ne: [] },
			};
		} else {
			serachQuery = { changeDetails: { $exists: true, $ne: [] } };
		}
		changeHistory
			.find(serachQuery)
			.skip(perPage * page - perPage)
			.limit(perPage)
			.exec(function (err, hisdata) {
				if (err) throw err;
				changeHistory
					.countDocuments({ changeDetails: { $exists: true, $ne: [] } })
					.exec((err, count) => {
						res.json({
							status: 1,
							records: hisdata,
							current: page,
							total: count,
							pages: Math.ceil(count / perPage),
							lastLimit: lastLimit,
							startEntry: startEntry,
						});
					});
			});
	} catch (error) {
		res.json({
			status: 0,
			message: "Not Ok",
		});
	}
});
router.post("/getHistory", session, async (req, res) => {
	try {
		const id = req.body.row_id;
		const data = await changeHistory.findOne({ _id: id }, { changeDetails: 1 });
		res.json({
			status: 1,
			data: data,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Contact  Support",
			error: error,
		});
	}
});

router.post("/newHistroy", session, async (req, res) => {
	try {
		let i = parseInt(req.body.start) + 1;
		const id = req.body.id;
		wallet_history
			.dataTables({
				find: { userId: id },
				limit: req.body.length,
				skip: req.body.start,
				columns: req.body.columns,
				search: {
					value: req.body.search.value,
					fields: ["username", "name", "mobile"],
				},
				sort: { _id: -1 },
			})
			.then(function (table) {
				let dataTab = table.data;
				let tabelArray = [];
				for (index in dataTab) {
					let addBy = dataTab[index].addedBy_name;
					if (addBy == undefined) {
						addBy = "Auto";
					}

					let dataJson = {
						sno: i,
						Previous_Amount: dataTab[index].previous_amount,
						Transaction_Amount: dataTab[index].transaction_amount,
						Current_Amount: dataTab[index].current_amount,
						Description: dataTab[index].description,
						Transaction_Date:
							dataTab[index].transaction_date +
							" " +
							dataTab[index].transaction_time,
						Transaction_Status: dataTab[index].transaction_status,
						Added_by: addBy,
					};
					tabelArray.push(dataJson);
					i++;
				}

				res.json({
					data: tabelArray,
					recordsFiltered: table.total,
					recordsTotal: table.total,
				});
			})
			.catch(function (error) {
				res.json({
					status: 0,
					message: "Request To Large",
				});
			});
	} catch (error) {
		console.log(error);
	}
});

router.post("/fundHis", session, async (req, res) => {
	try {
		let i = parseInt(req.body.start) + 1;
		const id = req.body.id;
		fundReq
			.dataTables({
				find: { userId: id },
				limit: req.body.length,
				skip: req.body.start,
				columns: req.body.columns,
				search: {
					value: req.body.search.value,
					fields: ["username", "reqAmount", "reqType", "reqStatus"],
				},
				sort: { _id: -1, reqAmount :1, reqType : 1,reqStatus : 1  },
			})
			.then(function (table) {
				let dataTab = table.data;
				let tabelArray = [];
				for (index in dataTab) {
					let addBy = dataTab[index].addedBy_name;
					if (addBy == undefined) {
						addBy = "Auto";
					}

					let date = dataTab[index].reqUpdatedAt;
					// let format = moment(date, 'MM/DD/YYYY hh:mm:ss a').format("DD/MM/YYYY hh:mm:ss a")
					// if(format == "Invalid date"){
					// 	format = date
					// }

					let dataJson = {
						sno: i,
						_id: dataTab[index]._id,
						username: dataTab[index].username,
						reqAmount: dataTab[index].reqAmount,
						reqType: dataTab[index].reqType,
						reqStatus: dataTab[index].reqStatus,
						reqUpdatedAt: date,
						withdrawalMode: dataTab[index].withdrawalMode,
						UpdatedBy: dataTab[index].UpdatedBy,
					};
					tabelArray.push(dataJson);
					i++;
				}

				res.json({
					data: tabelArray,
					recordsFiltered: table.total,
					recordsTotal: table.total,
				});
			})
			.catch(function (error) {
				res.json({
					status: 0,
					message: "Request To Large",
				});
			});
	} catch (error) {
		console.log(error);
	}
});

router.post("/newCredit", session, async (req, res) => {
	try {
		let i = parseInt(req.body.start) + 1;
		const id = req.body.id;
		wallet_history
			.dataTables({
				find: { userId: id, reqType: { $in: ["Credit", "Debit"] } },
				limit: req.body.length,
				skip: req.body.start,
				columns: req.body.columns,
				search: {
					value: req.body.search.value,
					fields: ["username", "name", "mobile"],
				},
				sort: { _id: -1 },
			})
			.then(function (table) {
				let dataTab = table.data;
				let tabelArray = [];
				for (index in dataTab) {
					let addBy = dataTab[index].addedBy_name;
					if (addBy == undefined) {
						addBy = "Auto";
					}

					let dataJson = {
						sno: i,
						Previous_Amount: dataTab[index].previous_amount,
						Transaction_Amount: dataTab[index].transaction_amount,
						Current_Amount: dataTab[index].current_amount,
						Description: dataTab[index].description,
						Transaction_Date:
							dataTab[index].transaction_date +
							" " +
							dataTab[index].transaction_time,
						Transaction_Status: dataTab[index].transaction_status,
						Added_by: addBy,
					};
					tabelArray.push(dataJson);
					i++;
				}

				res.json({
					data: tabelArray,
					recordsFiltered: table.total,
					recordsTotal: table.total,
				});
			})
			.catch(function (error) {
				res.json({
					status: 0,
					message: "Request To Large",
					err: error.toString(),
				});
			});
	} catch (error) {
		console.log(error);
	}
});

router.post("/accountDetails", session, async (req, res) => {
	try {
		var searchInputTable = req.body.term;
		serachQuery = { account_no: { $regex: searchInputTable } };
		const userData = await changeHistory.find(serachQuery);
		res.json(userData);
	} catch (error) {
		res.json({
			status: 0,
			message: "Not Ok",
		});
	}
});

module.exports = router;
