const router = require("express").Router();
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const requestON = require("../../model/Withdraw_Req_On_Off");
const dateTime = require("node-datetime");
const dt = dateTime.create();

router.get("/", session, permission, async (req, res) => {
	try {
		//const reqdata = await requestON.find({enabled:true}).sort({ _id: 1 });
                const reqdata = await requestON.find({isRequest:false}).sort({ _id: 1 });
		const userInfo = req.session.details;
		const permissionArray = req.view;
		const check = permissionArray["reqONOFF"].showStatus;
		if (check === 1) {
			res.render("./wallet/reqOnOff", {
				reqdata: reqdata,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Req ON/OFF",
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

router.post("/updateReq", async (req, res) => {
	try {
		const id = req.body.rowId;
		const status = req.body.status;
		const message = req.body.reason;
		const date = dt.format("m/d/Y I:M:S");

		const update = await requestON.updateOne(
			{ _id: id },
			{ $set: { message: message, enabled: status, updatedAt: date } }
		);
                let requestList = await requestON.find({isRequest:false});
		// res.json(update);
		res.json(requestList)
	} catch (error) {
		res.json(error);
	}
});

router.get("/getWithdrawReqOnOff", async (req, res) => {
	try {
		let requestONData = await requestON.findOne({ isRequest: true });
		return res.status(200).send({
			statusCode: 200,
			status: "Success",
			data: requestONData
		});
	} catch (error) {
		return res.status(500).send({
			statusCode: 500,
			status: "failure",
			message: "Internal Server Error",
		});
	}
})
router.post("/withdrawReqOnOff", async (req, res) => {
	try {

		const { startDate, endDate, requestCount } = req.body;
		if (!startDate || !endDate || !requestCount) {
			return res.status(400).send({
				statusCode: 400,
				status: "failure",
				message: "data is required in req",
			});
		}
		let requestData = await requestON.findOne({ isRequest: true });
		if (requestData) {
			let obj = {
				startTime: startDate,
				endTime: endDate,
				requestCount: requestCount,
				isRequest: true
			}
			await requestON.findOneAndUpdate({ _id: requestData._id }, obj)
		} else {
			let requestONOff = new requestON({
				dayNumber: null,
				dayName: "",
				message: "",
				enabled: false,
				updatedAt: "",
				startTime: startDate,
				endTime: endDate,
				requestCount: requestCount,
				isRequest: true
			})
			await requestONOff.save();
		}
		return res.status(200).send({
			statusCode: 200,
			status: "Success",
			message: "Withdraw Request On/Off successfully",
		});
	} catch (error) {
		return res.status(500).send({
			statusCode: 500,
			status: "failure",
			message: "Internal Server Error",
		});
	}
})
module.exports = router;
