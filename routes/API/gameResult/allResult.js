const router = require("express").Router();
const verify = require("../verifyTokens");
const starprovider = require("../../../model/starline/Starline_Provider");
const starOCtime = require("../../../model/starline/AddSetting");
const gameProvider = require("../../../model/games/Games_Provider");
const gameOCtime = require("../../../model/games/AddSetting");
const abProvider = require("../../../model/AndarBahar/ABProvider");
const abOCtime = require("../../../model/AndarBahar/ABAddSetting");
const dateTime = require("node-datetime");
const moment = require("moment");

router.get("/gameResultTest", async (req, res) => {
	try {
		const dt4 = dateTime.create();
		let dayName = dt4.format("W");
		const provider = await gameProvider.find(
			{ activeStatus: true },
			{ _id: 1, providerName: 1, providerResult: 1, resultStatus: 1 }
		);

		const ocTime = await gameOCtime.find(
			{ gameDay: dayName },
			{
				gameDay: 1,
				OBT: 1,
				CBT: 1,
				isClosed: 1,
				providerId: 1,
				OBRT: 1,
				CBRT: 1,
			}
		);

		let arrayFinal = {};
		for (index in provider) {
			arrayFinal[provider[index]._id] = {
				providerName: provider[index].providerName,
				providerResult: provider[index].providerResult,
				resultStatus: provider[index].resultStatus,
				OpenBidTime: "",
				CloseBidTime: "",
				OpenBidResultTime: "",
				CloseBidResultTime: "",
				isClosed: "",
				providerId: provider[index]._id,
				gameDay: "",
				displayText: "",
				colorCode: "",
			};
		}

		for (index in ocTime) {
			const dt3 = dateTime.create();
			let time = dt3.format("I:M p");
			let OpenTime = ocTime[index].OBT;
			let CloseTime = ocTime[index].CBT;
			let closed = ocTime[index].isClosed;
			let current = moment(time, "HH:mm a");
			let startTime = moment(OpenTime, "HH:mm a");
			let endTime = moment(CloseTime, "HH:mm a");
			let appDisplayText = "Closed For Today";
			let colorCode = "#ff0000";

			if (closed == 1) {
				if (startTime > current) {
					appDisplayText = "Running For Open";
					colorCode = "#a4c639";
				} else if (endTime > current) {
					appDisplayText = "Running For Close";
					colorCode = "#a4c639";
				}
			} else {
				appDisplayText = "Closed For Today";
				colorCode = "#ff0000";
			}

			let id = ocTime[index].providerId;
			if (arrayFinal[id]) {
				arrayFinal[id]["OpenBidTime"] = ocTime[index].OBT;
				arrayFinal[id]["CloseBidTime"] = ocTime[index].CBT;
				arrayFinal[id]["OpenBidResultTime"] = ocTime[index].OBRT;
				arrayFinal[id]["CloseBidResultTime"] = ocTime[index].CBRT;
				arrayFinal[id]["isClosed"] = ocTime[index].isClosed;
				arrayFinal[id]["gameDay"] = ocTime[index].gameDay;
				arrayFinal[id]["displayText"] = appDisplayText;
				arrayFinal[id]["colorCode"] = colorCode;
			}
		}

		res.status(200).json({
			status: 1,
			message: "Success",
			result: arrayFinal,
		});
	} catch (error) {
		res.status(400).json({
			status: 0,
			message: "Something Went Wrong",
			error: error,
		});
	}
});

router.get("/ABgameResultTest", async (req, res) => {
	try {
		const dt4 = dateTime.create();
		let dayName = dt4.format("W");

		const provider = await abProvider.find(
			{},
			{ _id: 1, providerName: 1, providerResult: 1, resultStatus: 1 }
		);

		const ocTime = await abOCtime.find(
			{ gameDay: dayName },
			{ gameDay: 1, OBT: 1, CBT: 1, OBRT: 1, isClosed: 1, providerId: 1 }
		);

		const todayDate = dateTime.create();
		const date = todayDate.format("m/d/Y");

		let arrayFinal = {};
		for (index in provider) {
			arrayFinal[provider[index]._id] = {
				providerName: provider[index].providerName,
				providerResult: provider[index].providerResult,
				resultStatus: provider[index].resultStatus,
				OpenBidTime: "",
				CloseBidTime: "",
				isClosed: "",
				providerId: provider[index]._id,
				gameDay: "",
				displayText: "",
				colorCode: "",
				gameDate: date,
			};
		}

		for (index in ocTime) {
			const dt3 = dateTime.create();
			let time = dt3.format("I:M p");
			let OpenTime = ocTime[index].OBT;
			let CloseTime = ocTime[index].CBT;
			let closed = ocTime[index].isClosed;
			let current = moment(time, "HH:mm a");
			// let startTime = moment(OpenTime, "HH:mm a");
			let endTime = moment(CloseTime, "HH:mm a");
			let appDisplayText = "Betting Is Closed For Today";
			let colorCode = "#ff0000";

			if (closed == 1) {
				if (current < endTime) {
					appDisplayText = "Betting Is Running Now";
					colorCode = "#a4c639";
				}
			} else {
				appDisplayText = "Betting Is Closed For Today";
				colorCode = "#ff0000";
			}

			let id = ocTime[index].providerId;
			if (arrayFinal[id]) {
				arrayFinal[id]["OpenBidTime"] = ocTime[index].OBT;
				arrayFinal[id]["CloseBidTime"] = ocTime[index].CBT;
				arrayFinal[id]["isClosed"] = ocTime[index].isClosed;
				arrayFinal[id]["gameDay"] = ocTime[index].gameDay;
				arrayFinal[id]["displayText"] = appDisplayText;
				arrayFinal[id]["colorCode"] = colorCode;
			}
		}

		res.status(200).json({
			status: 1,
			message: "Success",
			result: arrayFinal,
		});
	} catch (error) {
		res.status(400).json({
			status: 0,
			message: "Something Went Wrong",
			error: error,
		});
	}
});

router.get("/starLineResultTest", async (req, res) => {
	try {
		const dt4 = dateTime.create();
		let dayName = dt4.format("W");
		const provider = await starprovider.find(
			{},
			{ _id: 1, providerName: 1, providerResult: 1, resultStatus: 1 }
		);
		const ocTime = await starOCtime.find(
			{ gameDay: dayName },
			{ gameDay: 1, OBT: 1, CBT: 1, OBRT: 1, isClosed: 1, providerId: 1 }
		);

		const todayDate = dateTime.create();
		const date = todayDate.format("m/d/Y");

		let arrayFinal = {};
		for (index in provider) {
			arrayFinal[provider[index]._id] = {
				providerName: provider[index].providerName,
				providerResult: provider[index].providerResult,
				resultStatus: provider[index].resultStatus,
				OpenBidTime: "",
				CloseBidTime: "",
				isClosed: "",
				providerId: provider[index]._id,
				gameDay: "",
				displayText: "",
				colorCode: "",
				gameDate: date,
			};
		}

		for (index in ocTime) {
			const dt3 = dateTime.create();
			let time = dt3.format("I:M p");
			// let OpenTime = ocTime[index].OBT;
			let CloseTime = ocTime[index].CBT;
			let closed = ocTime[index].isClosed;
			let current = moment(time, "HH:mm a");
			// let startTime = moment(OpenTime, "HH:mm a");
			let endTime = moment(CloseTime, "HH:mm a");
			let appDisplayText = "Betting Is Closed For Today";
			let colorCode = "#ff0000";

			if (closed == 1) {
				if (current < endTime) {
					appDisplayText = "Betting Is Running Now";
					colorCode = "#a4c639";
				}
			} else {
				appDisplayText = "Betting Is Closed For Today";
				colorCode = "#ff0000";
			}

			let id = ocTime[index].providerId;
			if (arrayFinal[id]) {
				arrayFinal[id]["OpenBidTime"] = ocTime[index].OBT;
				arrayFinal[id]["CloseBidTime"] = ocTime[index].CBT;
				arrayFinal[id]["isClosed"] = ocTime[index].isClosed;
				arrayFinal[id]["gameDay"] = ocTime[index].gameDay;
				arrayFinal[id]["displayText"] = appDisplayText;
				arrayFinal[id]["colorCode"] = colorCode;
			}
		}

		res.status(200).json({
			status: 1,
			message: "Success",
			result: arrayFinal,
		});
	} catch (error) {
		res.status(400).json({
			status: 0,
			message: "Something Went Wrong",
			error: error,
		});
	}
});

router.post("/daysGameBids", async (req, res) => {
	try {
		let id = req.body.providerId;
		const getSetting = await gameOCtime.find({ providerId: id });
		let dateArray = {};
		const dt = dateTime.create();
		const startdate = dt.format("m/d/Y");
		for (let index = 0; index < 4; index++) {
			let new_date = moment(startdate, "MM/DD/YYYY").add(index, "days");
			let day = new_date.format("DD");
			let month = new_date.format("MM");
			let year = new_date.format("YYYY");
			let dayName = moment(new_date).format("dddd");
			let nextDate = month + "/" + day + "/" + year;
			dateArray[dayName] = {
				date: nextDate,
				dayname: dayName,
				bidClosed: "",
				status: "",
				gameSession: "",
			};
		}
		let dt2 = dateTime.create();
		let todayDay = dt2.format("W");
		for (index in getSetting) {
			let dayname = getSetting[index].gameDay;
			let OpenTime = getSetting[index].OBT;
			let CloseTime = getSetting[index].CBT;
			let closed = getSetting[index].isClosed;
			if (dateArray[dayname]) {
				if (closed == 1) {
					if (dayname == todayDay) {
						let dt3 = dateTime.create();
						let time = dt3.format("I:M p");
						let current = moment(time, "HH:mm a");
						let openTime = moment(OpenTime, "HH:mm a");
						let endTime = moment(CloseTime, "HH:mm a");
						let text = "Bid Open";
						let status = 1;
						let gameSession = "Open";
						if (current > openTime) {
							text = "Bid Close";
							status = 2;
							gameSession = "Close";
						}

						if (current > endTime) {
							text = "Bid Close";
							status = 3;
							gameSession = "null";
						}

						dateArray[dayname]["bidClosed"] = text;
						dateArray[dayname]["status"] = status;
						dateArray[dayname]["gameSession"] = gameSession;
					} else {
						dateArray[dayname]["bidClosed"] = "Bid Open";
						dateArray[dayname]["status"] = 1;
						dateArray[dayname]["gameSession"] = "Open";
					}
				} else {
					dateArray[dayname]["bidClosed"] = "Bid Close";
					dateArray[dayname]["status"] = 3;
					dateArray[dayname]["gameSession"] = "null";
				}
			}
		}

		const arrayFinal = [];

		for (index in dateArray) {
			let putData = dateArray[index];
			arrayFinal.push(putData);
		}

		res.json({
			status: 1,
			message: "Success",
			date: arrayFinal,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happend Contact Support",
			error: error,
		});
	}
});

router.post("/daySession", async (req, res) => {
	try {
		let id = req.body.providerId;
		let todayDay = req.body.gameDay;
		let dt2 = dateTime.create();
		let currentDay = dt2.format("W");
		const getSetting = await gameOCtime.findOne({
			providerId: id,
			gameDay: todayDay,
		});

		if (currentDay === todayDay) {
			let CloseTime = getSetting.CBT;
			let OpenTime = getSetting.OBT;

			let dt3 = dateTime.create();
			let time = dt3.format("I:M p");
			let current = moment(time, "HH:mm a");
			let endTime = moment(CloseTime, "HH:mm a");
			let startTime = moment(OpenTime, "HH:mm a");

			let gameTypeOpen = "Open";
			let gameTypeClose = "Open";

			if (current > startTime) {
				gameTypeOpen = "Close";
			}

			if (current > endTime) {
				gameTypeClose = "Close";
			}

			const jsonData = {
				OpenSession: gameTypeOpen,
				CloseSession: gameTypeClose,
			};

			res.json({
				status: 1,
				message: "Success",
				data: jsonData,
			});
		} else {
			const jsonData = {
				OpenSession: "Open",
				CloseSession: "Open",
			};

			res.json({
				status: 1,
				message: "Success",
				data: jsonData,
			});
		}
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happend Contact Support",
			error: error,
		});
	}
});

router.post("/gameProviderDG", async (req, res) => {
	try {
		let providerList;
		const type = req.body.type;
		if (type == 1) {
			providerList = await gameProvider.find().sort({ _id: 1 });
		} else if (type == 2) {
			providerList = await starprovider.find().sort({ _id: 1 });
		} else {
			providerList = await abProvider.find().sort({ _id: 1 });
		}

		res.json({
			status: 1,
			message: "Success",
			data: providerList,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Server error",
		});
	}
});

module.exports = router;
