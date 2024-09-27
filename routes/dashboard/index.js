const router = require("express").Router();
const total = require("../../model/API/FundRequest");
const deleteduser = require("../../model/API/Deleted_User");
const session = require("../helpersModule/session");
const users = require("../../model/API/Users");
const walletTrace = require("../../model/Wallet_Bal_trace");
const dateTime = require("node-datetime");
const permission = require("../helpersModule/permission");
const mainPage = require("../../model/MainPage");
const ipTable = require("../../model/manageIP");
const loginRecord = require("../../model/loginRecords");
var ip = require("ip");
const date = require("node-datetime");
const moment = require("moment");

router.get('/', async (req, res) => {
    try {
	
		const data = { message: "" }
        res.render('index', data);
    } catch (e) {
		res.json({ message: e });
    }
});

router.get("/dashboard", session, permission, async (req, res) => {
	try {
		
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const pageData = await mainPage.findOne({});
		const traceBal = await walletTrace.findOne({}).sort({ _id: -1 }).limit(1);
		const countDlt = await deleteduser.find().countDocuments();
		const check = permissionArray["main"].showStatus;
		const username = userInfo.username;
		const usersData  = await users.find();
        const allUsersCount = usersData.length;

		const bannedUsersCount = usersData.filter((elem) => {
			return elem.banned==true;
		}).length;

		pageData.banned_Users = bannedUsersCount;
		pageData.total_user = allUsersCount;
		pageData.active_count = 0;

		for(user of usersData){

           if(!!user.lastLoginDate){
			const  startDate = moment(user.lastLoginDate , "DD.MM.YYYY");
			const  endDate = moment(moment(), "DD.MM.YYYY");
			const days  = endDate.diff(startDate, 'days');
			 if(days <= 30){
				pageData.active_count++;
			 }
		   }
		}




        
		updateIp(username);
		if (check === 1) {
			res.render("dashboard/index", {
				userInfo: userInfo,
				permission: permissionArray,
				data: pageData,
				yesTerday: traceBal,
				countDlt: countDlt,
				title: "Dashboard",
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

router.get("/logout", session, async (req, res) => {
	try {
		req.session.destroy(function (err) {
			res.redirect("/");
		});
	} catch (e) {
		res.json({ message: e });
	}
});

router.get("/getCount", session, async (req, res) => {
	try {
		const dt = dateTime.create();
		const formatted = dt.format("d/m/Y");
		const total_count = await total
			.find({ reqStatus: "Pending", reqType: "Credit", reqDate: formatted })
			.countDocuments();
		res.json(total_count);
	} catch (error) {
		res.json(error);
	}
});

router.get("/getRegisteredUser/:reqType", session, async (req, res) => {
	try {
		const dt = dateTime.create();
		const todayDate = dt.format("d/m/Y");
		const reqType = req.params.reqType;
		let query = "";
		var userFundArr = {};
		let todayRegistered = "";
		if (reqType == 1) {
			query = { wallet_balance: 0, CreatedAt: { $regex: todayDate } };
			todayRegistered = await users.find(query);
			returnJson = todayRegistered;
		} else {
			query = { wallet_balance: { $gt: 0 }, CreatedAt: { $regex: todayDate } };
			todayRegistered = await users.find(query);
			const userIds = todayRegistered.map(
				(todayRegistered) => todayRegistered._id
			);
			var user_funds = await total.find({
				userId: { $in: userIds },
				reqDate: todayDate,
				reqType: "Credit",
				reqStatus: "Approved",
			});
			for (index in user_funds) {
				var userId = user_funds[index]["userId"];
				var reqAmount = user_funds[index]["reqAmount"];
				if (userFundArr[userId] == "" || userFundArr[userId] == undefined) {
					userFundArr[userId] = reqAmount;
				}
			}
			returnJson = {
				todayRegistered: todayRegistered,
				userFundArr: userFundArr,
			};
		}
		res.json(returnJson);
	} catch (error) {
		res.json(error);
	}
});

async function updateIp(username) {
	try {
		const dt = date.create();
		const todayDate = dt.format("m/d/Y");
		const time = dt.format("I:M:S");
		const ipInfo = ip.address();
		await ipTable.updateOne(
			{ ipAddress: ipInfo },
			{
				$set: { ipCount: 0, modified: todayDate + " " + time },
			}
		);

		const filter = { loginAt: todayDate };
		const update = {
			adminName: username,
			loginIp: ipInfo,
			$inc: {
				loginCount: 1,
			},
			loginAt: todayDate,
			loginTime: time,
		};

		await loginRecord.findOneAndUpdate(filter, update, {
			new: true,
			upsert: true,
		});
	} catch (error) {
		console.log(error);
	}
}

module.exports = router;
