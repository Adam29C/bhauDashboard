const { MongoClient, ObjectId } = require("mongodb");
const users = require("../../model/API/Users");
const dltUser = require("../../model/API/Deleted_User");
const bids = require("../../model/games/gameBids");
const fundReq = require("../../model/API/FundRequest");
const profile = require("../../model/API/Profile");
const cron = require("node-cron");
const dateTime = require("node-datetime");
const moment = require("moment");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const dashboard = require("../../model/MainPage");
const Starlineresult = require("../../model/starline/Starline_Provider");
const abProvider = require("../../model/AndarBahar/ABProvider");
const Pusher = require("pusher");
const path = require("path");
const timeHistory = require("../../model/timeHistory");

const fs = require('fs');
const uri = process.env.DB_CONNECT;
//const certPath = path.join(__dirname, '../../global-bundle.pem');
// const client = new MongoClient(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     tls: true,
//     tlsCAFile: certPath
// });

const client = new MongoClient(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const chatDomain = process.env.CHAT_DOMAIN;
module.exports = async function () {
	cron.schedule("45 23 * * *", async () => {
		try {
			const dt = dateTime.create();
			const todayDate = dt.format("d/m/Y");
			let todayRegistered = await users.find(
				{ wallet_balance: 0, CreatedAt: { $regex: todayDate } },
				{ mobile: 1, username: 1 }
			);

			var vCard = require("vcards-js");
			var vContact;
			var formattedString = "";
			let i = 1;
			todayRegistered.forEach(function (contact) {
				let number = contact.mobile;
				vContact = vCard();
				vContact.firstName = contact.username + " Zero Bal";
				vContact.workPhone = number;
				formattedString += vContact.getFormattedString();
				i++;
			});

			var fs = require("fs");
			fs.writeFileSync("zeroBalance.vcf", formattedString, {
				encoding: "utf8",
			});
			sendMail(i);
		} catch (error) {
			console.log(error);
		}
	});

	cron.schedule("10 0 * * *", async () => {
		if (process.env.pm_id == "1") {
			try {
				const findUser = await users.find({ wallet_bal_updated_at: null });
				let deleteArr = [];
				let idArray = [];
				let mobileNumber = [];
				const dt = dateTime.create();
				const formatted = dt.format("d/m/Y I:M:S");
				var endDate = moment(formatted, "DD/MM/YYYY");
				for (index in findUser) {
					let CreatedAt = findUser[index].CreatedAt;
					let mobile = findUser[index].mobile;
					let startDate = moment(CreatedAt, "DD/MM/YYYY");
					let result = endDate.diff(startDate, "days");
					let days = 7;
					if (parseInt(result) >= parseInt(days)) {
						const user = {
							userId: findUser[index]._id,
							name: findUser[index].name,
							email: findUser[index].email,
							password: findUser[index].password,
							username: findUser[index].username,
							mobile: mobile,
							firebaseId: findUser[index].firebaseId,
							deviceName: findUser[index].deviceName,
							deviceId: findUser[index].deviceId,
							deviceVeriOTP: findUser[index].deviceVeriOTP,
							register_via: findUser[index].register_via,
							wallet_bal_updated_at: findUser[index].wallet_bal_updated_at,
							wallet_balance: findUser[index].wallet_balance,
							role: index,
							mpin: findUser[index].mpin,
							mpinOtp: findUser[index].mpinOtp,
							Deleted_At: formatted,
							CreatedAt: findUser[index].CreatedAt,
							deleteRsn: "Wallet Balance 0 Since Last 7 Days",
							mainNotification: findUser[index].mainNotification,
							gameNotification: findUser[index].gameNotification,
							starLineNotification: findUser[index].starLineNotification,
							andarBaharNotification: findUser[index].andarBaharNotification,
						};
						deleteArr.push(user);
						mobileNumber.push(mobile.substring(3));
						idArray.push(findUser[index]._id);
					}
				}

				await users.deleteMany({ _id: { $in: idArray } });
				//await profile.deleteMany({ userId: { $in: idArray } });
				await dltUser.insertMany(deleteArr);

				var request = require("request");
				var options = {
					method: "POST",
					// url: "https://chatpanel.rolloutgames.xyz/deleteZeroBalanceUsers",
					// url: "http://162.241.115.39/deleteZeroBalanceUsers",
					url: `${chatDomain}/deleteZeroBalanceUsers`,
					headers: {
						"postman-token": "a10d4b83-7ff5-aad7-162c-b586d639b191",
						"cache-control": "no-cache",
						"content-type": "application/json",
					},
					body: { userIds: idArray },
					json: true,
				};

				request(options, function (error, response, body) {
					if (error) throw new Error(error);
				});

				let customeMessage =
					"Alert:-\n\nSince You Have Not Buyed Any Points\nIn Your Khatri Game App Wallet\n\nWe Have Deleted Your Khatri Game App Registration\n\nHence You Have To Reinstall Our App And\nRegister Again To Play Matka Online\n\nFor Any Type Of Enquiry\n\nCall Us\n09929143143\n\nOffice Timing\n(10AM TO 10PM)\n\nWatch Video:-\nhttps://youtu.be/tRUtnsQBF3s\n\nWebsite:-\nhttps://dhangame.com";

				let body = {
					sender: "DGAMES",
					route: "4",
					country: "91",
					unicode: "1",
					sms: [
						{
							message: customeMessage,
							to: mobileNumber,
						},
					],
				};

				fetch("https://api.msg91.com/api/v2/sendsms", {
					method: "POST",
					body: JSON.stringify(body),
					headers: {
						"Content-Type": "application/json",
						authkey: "407097AwSzYk8hvZC6519cb42P1",
					},
				})
					.then((res) => res.json())
					.then((json) => json);
			} catch (error) {
				console.log(error);
			}
		}
	});

	cron.schedule("*/5 * * * *", async () => {
		let dataUpdate = await dashboard.find();
		if (dataUpdate.length) {
			let lastUpdate = dataUpdate[0].lastUpdatedAt;
			let split = lastUpdate.split(" ");
			let compareDate = split[0];

			const dst = dateTime.create();
			const todayDate = dst.format("d/m/Y");
			const todayDate1 = dst.format("m/d/Y");
			const datetime = dst.format("d/m/Y I:M:S");
			if (todayDate === compareDate) {
				executeQuery(todayDate, todayDate1, datetime);
			} else {
				const stattime = "12:30 AM";
				const currentTime = dst.format("I:M:S");
				const beginningTime = moment(currentTime, "h:mm a");
				const endTime = moment(stattime, "h:mm a");

				if (beginningTime < endTime) {
					const dateBefore = moment().subtract(1, "days").format("DD/MM/YYYY");
					const dateBefore2 = moment().subtract(1, "days").format("MM/DD/YYYY");
					const timeDate = dateBefore + currentTime;
					executeQuery(dateBefore, dateBefore2, timeDate);
				} else {
					executeQuery(todayDate, todayDate1, datetime);
				}
			}
		}
	});

	cron.schedule("*/5 * * * * *", async () => {
		let dataUpdate = await dashboard.find();
		if (dataUpdate.length) {
			let lastUpdate = dataUpdate[0].lastUpdatedAt;
			let split = lastUpdate && lastUpdate.split(" ");
			let compareDate = split && split.length && split[0];

			const dst = dateTime.create();
			const todayDate = dst.format("d/m/Y");
			const todayDate1 = dst.format("m/d/Y");
			const datetime = dst.format("d/m/Y I:M:S");
			if (todayDate === compareDate) {
				executeQuery5sec(todayDate, todayDate1, datetime);
			} else {
				const stattime = "12:30 AM";
				const currentTime = dst.format("I:M:S");
				const beginningTime = moment(currentTime, "h:mm a");
				const endTime = moment(stattime, "h:mm a");

				if (beginningTime < endTime) {
					const dateBefore = moment().subtract(1, "days").format("DD/MM/YYYY");
					const dateBefore2 = moment().subtract(1, "days").format("MM/DD/YYYY");
					const timeDate = dateBefore + currentTime;
					executeQuery5sec(dateBefore, dateBefore2, timeDate);
				} else {
					executeQuery5sec(todayDate, todayDate1, datetime);
				}
			}
		}
	});

	cron.schedule("0 8 * * *", async () => {
		try {
			const dt = dateTime.create();
			const formatted = dt.format("m/d/Y I:M:S p");
			await Starlineresult.updateMany({
				$set: {
					providerResult: "***-**",
					modifiedAt: formatted,
					resultStatus: 0,
				},
			});
			await abProvider.updateMany({
				$set: { providerResult: "**", modifiedAt: formatted, resultStatus: 0 },
			});
		} catch (error) {
			console.log(error);
		}
	});

	cron.schedule("1 0 * * *", async () => {
		if (process.env.pm_id == "1") {
			try {
				var lastweekEnd = moment().subtract(1, "days").format("DD/MM/YYYY");
				let lastweekStart1 = moment(lastweekEnd, "DD/MM/YYYY").unix();
				const yesterdayRegistered = await users
					.find({ timestamp: lastweekStart1 })
					.count();
				let dataUpdate = await dashboard.find();
				const update_id = dataUpdate[0]._id;
				await dashboard.updateOne(
					{ _id: update_id },
					{
						$set: {
							yesterdayRegistered: parseInt(yesterdayRegistered),
						},
					}
				);
			} catch (error) {
				console.log(error);
			}
		}
	});

	async function executeQuery(todayDate0, datetime) {
		if (process.env.pm_id == "1" || true) {
			try {
				const todayDate = todayDate0;

				let balance = await users.aggregate([
					{ $match: { banned: false } },
					{ $group: { _id: null, sumdigit: { $sum: "$wallet_balance" } } },
				]);

				let active_Wallet_Balance = 0;
				if (Object.keys(balance).length > 0) {
					active_Wallet_Balance = balance[0].sumdigit;
				}

				const banned_Users = await users
					.find({ banned: true })
					.count();
				const Active_users = await users
					.find({
						loginStatus: {
							$in: [true, 'true']
						}
					})
					.count();
				const all_user = await users.find().count();

				const total_zero_bal_users = await users
					.find({ wallet_balance: 0 })
					.count();

				const today_total_zero_bal_users = await users
					.find({ wallet_balance: 0, CreatedAt: todayDate })
					.count();

				const todayRegistered = await users
					.find({ CreatedAt: { $regex: todayDate } })
					.count();

				//user registered in this week
				const last7datetest = moment().diff(moment().startOf("week"), "days");
				const last7date = moment()
					.subtract(last7datetest, "d")
					.format("DD/MM/YYYY");
				let last7date2 = moment(last7date, "DD/MM/YYYY").unix();
				const weekRegistered = await users
					.find({
						timestamp: {
							$gte: last7date2,
						},
					})
					.count();

				//user registered in month
				const monthStart = new moment().startOf("month").format("DD/MM/YYYY");
				let monthStart1 = moment(monthStart, "DD/MM/YYYY").unix();
				const monthRegistered = await users
					.find({
						timestamp: {
							$gte: monthStart1,
						},
					})
					.count();

				//user Registered Last Month;
				var endDateFrom = moment()
					.subtract(1, "months")
					.endOf("month")
					.format("DD/MM/YYYY");
				var startDate = moment()
					.subtract(1, "months")
					.startOf("month")
					.format("DD/MM/YYYY");
				let startDate1 = moment(startDate, "DD/MM/YYYY").unix();
				let endDateFrom1 = moment(endDateFrom, "DD/MM/YYYY").unix();
				const lastmonthRegistered = await users
					.find({
						timestamp: {
							$gte: startDate1,
							$lte: endDateFrom1,
						},
					})
					.count();

				//user Registered Last Week;
				var lastweekEnd = moment()
					.subtract(1, "weeks")
					.endOf("week")
					.format("DD/MM/YYYY");
				var lastweekStart = moment()
					.subtract(1, "weeks")
					.startOf("week")
					.format("DD/MM/YYYY");
				let lastweekStart1 = moment(lastweekStart, "DD/MM/YYYY").unix();
				let lastweekEnd1 = moment(lastweekEnd, "DD/MM/YYYY").unix();
				const lastweekRegistered = await users
					.find({
						timestamp: {
							$gte: lastweekStart1,
							$lte: lastweekEnd1,
						},
					})
					.count();

				let dataUpdate = await dashboard.find();
				const update_id = dataUpdate[0]._id;

				const currentTime = datetime;

				const updateFinal = await dashboard.updateOne(
					{ _id: update_id },
					{
						$set: {
							total_wallet_balance: parseInt(active_Wallet_Balance),
							total_user: parseInt(all_user),
							banned_Users: parseInt(banned_Users),
							Active_users: parseInt(Active_users),
							total_zero_bal_users: parseInt(total_zero_bal_users),
							today_total_zero_bal_users: parseInt(today_total_zero_bal_users),
							todayRegistered: parseInt(todayRegistered),
							current_Week_regis_user: parseInt(weekRegistered),
							current_month_Registered: parseInt(monthRegistered),
							lastmonthRegistered: parseInt(lastmonthRegistered),
							lastweekRegistered: parseInt(lastweekRegistered),
							lastUpdatedAt: currentTime,
						},
					}
				);
			} catch (error) {
				console.log(error.message);
			}
		}
	}

	async function executeQuery5sec(todayDate0, todayDate1, datetime) {
		if (process.env.pm_id == "1" || true) {
			try {
				const formattssssed = todayDate1;
				const todayDate = todayDate0;

				// const total_paid = await bids.aggregate([
				// 	{ $match: { gameDate: formattssssed } },
				// 	{
				// 		$group: {
				// 			_id: null,
				// 			Total_paid_sum: { $sum: "$gameWinPoints" },
				// 			Total_bid_sum: { $sum: "$biddingPoints" },
				// 		},
				// 	},
				// ]);

				const total_paid = await bids.aggregate([
					{ $match: { gameDate: formattssssed } },
					{
						$group: {
							_id: null,
							Total_paid_sum: { $sum: "$gameWinPoints" },
							Total_bid_sum: { $sum: "$biddingPoints" },
						},
					},
				]);

				let totalBidwin = 0;
				let totol_bids = 0;
				if (Object.keys(total_paid).length > 0) {
					totalBidwin = total_paid[0].Total_paid_sum;
					totol_bids = total_paid[0].Total_bid_sum;
				}
				const total_deposit = await fundReq.aggregate([
					{
						$match: {
							reqDate: todayDate,
							reqStatus: "Approved",
							reqType: "Credit",
						},
					},
					{ $group: { _id: "$reqType", sum: { $sum: "$reqAmount" } } },
				]);
				let totalDeposite = 0;
				if (Object.keys(total_deposit).length > 0) {
					let total = total_deposit[0].sum;
					totalDeposite = total;
				}

				const total_withdraw = await fundReq.aggregate([
					{
						$match: {
							reqDate: todayDate,
							reqStatus: "Approved",
							reqType: "Debit",
							// $and: [{ $or: [{ from: 0 }, { from: 2 }] }],
						},
					},
					{ $group: { _id: "$reqType", sum: { $sum: "$reqAmount" } } },
				]);
				let totalwithdraw = 0;
				if (Object.keys(total_withdraw).length > 0) {
					let total = total_withdraw[0].sum;
					totalwithdraw = total;
				}

				let dataUpdate = await dashboard.find();
				const update_id = dataUpdate[0]._id;
				const currentTime = datetime;
				const updateFinal = await dashboard.findOneAndUpdate(
					{ _id: update_id },
					{
						$set: {
							totol_bids: parseInt(totol_bids),
							total_paid_today: parseInt(totalBidwin),
							total_withdraw_amount: parseInt(totalwithdraw),
							total_deposit_amount: parseInt(totalDeposite),
							lastUpdatedAt: currentTime,
						},
					},
					{ returnOriginal: false }
				);


				const channels_client = new Pusher({
					appId: "1024162",
					key: "c5324b557c7f3a56788a",
					secret: "c75c293b0250419f6161",
					cluster: "ap2",
				});

				channels_client.trigger("my-channel", "my-event", {
					message: updateFinal,
					toast: "Updated Balance",
					type: 1,
					from: "local",
				});
			} catch (error) {
				console.log(error);
			}
		}
	}

	function sendMail(total) {
		const todayDate = moment().format("DD/MM/YYYY hh:mm:ss A");
		var totalContact = total;
		var mail = nodemailer.createTransport({
			service: "gmail",
			port: 587,
			use_authentication: true,
			auth: {
				user: "dhangame123@gmail.com",
				pass: "dhan@123#*",
			},
		});

		var mailOptions = {
			from: "dhangame123@gmail.com",
			to: "synetal1.synetalsolutions@gmail.com, matkayou@gmail.com",
			subject: "Daily Zero Balance User Contact File",
			html:
				'<!DOCTYPE html><html lang="en"> <head> <link rel="shortcut icon" href="https://coderthemes.com/adminto/layouts/vertical/assets/images/favicon.ico"> <link href="https://coderthemes.com/adminto/layouts/vertical/assets/css/bootstrap.min.css" id="bootstrap-stylesheet" rel="stylesheet" type="text/css"/> <link href="https://coderthemes.com/adminto/layouts/vertical/assets/css/icons.min.css" rel="stylesheet" type="text/css"/> <link href="https://coderthemes.com/adminto/layouts/vertical/assets/css/app.min.css" id="app-stylesheet" rel="stylesheet" type="text/css"/> </head> <body> <div class="content" style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;"> <table class="main" width="100%" cellpadding="0" cellspacing="0" style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; display: inline-block; font-size: 14px; overflow: hidden; border-radius: 7px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff"> <tr style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="alert alert-warning" style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; color: #fff; font-weight: 500; text-align: center; border-radius: 3px 3px 0 0; background-color: #041336; margin: 0; padding: 20px;" align="center" bgcolor="#71b6f9" valign="top"> <a href="#"> <img src="https://dhangames143.com//assets/images/logo.png" height="100" alt="logo"/></a> <span style="margin-top: 20px;display: block;">Daily Zero Balance User Contact List</span> </td></tr><tr style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="content-wrap" style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top"> <table width="100%" class="text-center" style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <tr style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="content-block" style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> You have Total <strong style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">' +
				totalContact +
				' Contacts </strong>in VCF file provided below. </td></tr><tr style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="content-block" style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> Download VCF file to import contacts to your Mobile Phone<br>Contact File Generated For Date ' +
				todayDate +
				' </td></tr><tr style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="content-block" style="font-family: Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> Thanks & Regards<br><b>Team Khatri Games</b> </td></tr></table> </td></tr></table> </div></body></html>',
			attachments: [
				{
					filename: "zeroBalance.vcf",
					path: path.join(__dirname, "../../zeroBalance.vcf"),
					content: "User Contacts File",
				},
			],
		};

		mail.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
			} else {
				console.log("Email sent: " + info.response);
				fs.unlink("zeroBalance.vcf", function (error, info) { });
			}
		});
	}

	async function cleanupOldEntries(database, timeHistoryDetails) {
		if (timeHistoryDetails.isActive) {
			const dateThreshold = moment().subtract(timeHistoryDetails.deleteTime, 'days').toDate();
			let filter = { updatedTime: { $lt: dateThreshold } };
			if(timeHistoryDetails.collectionName){
				filter= {createTime:{ $lt: dateThreshold }}
			}
			try {
				const collection = database.collection(timeHistoryDetails.collectionName);
				const result = await collection.deleteMany(filter);
				console.log(`Deleted ${result.deletedCount} documents from ${timeHistoryDetails.collectionName}`);
			} catch (error) {
				console.error(`Error cleaning up collection ${timeHistoryDetails.collectionName}:`, error.toString());
			}
		}
	}
	async function runCleanupTasks() {
		try {
			await client.connect();
			const database = client.db("dhandb");
			let timeHistoryList = await timeHistory.find();
			const cleanupPromises = timeHistoryList.map(details => cleanupOldEntries(database, details));
			await Promise.all(cleanupPromises);
		} catch (error) {
			console.error('Error running cleanup tasks:', error.toString());
		} finally {
			await client.close();
		}
	}
	cron.schedule("05 03 * * *", async () => {
		runCleanupTasks().catch(error => {
			console.error('Failed to run cleanup tasks:', error.toString());
		});
	});
};
