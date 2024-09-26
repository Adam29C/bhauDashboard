const router = require("express").Router();
const news = require("../../model/News");
const notification = require("../../model/notification");
const userDetails = require("../../model/API/Users");
const history = require("../../model/wallet_history");
const gameRates = require("../../model/games/GameList");
const starGameRates = require("../../model/starline/GameList");
const ABgameRates = require("../../model/AndarBahar/ABGameList");
const Useridea = require("../../model/UserSuggestion");
const Mode = require("../../model/transactionON-OFF");
const user = require("../../model/API/Users");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const userTab = require("../../model/API/Users");
const verify = require("./verifyTokens");
const version = require("../../model/dashBoard/AppVersion");
const moment = require('moment');
const dotenv = require("dotenv");
const SendOtp = require("sendotp");
// const sendOtp = new SendOtp("290393AuGCyi6j5d5bfd26");
const sendOtp = new SendOtp("1207171791436302472");
dotenv.config();
const APK_DOMAIN = process.env.APK_DOMAIN;


const chatDomain = process.env.CHAT_DOMAIN;
router.post("/getBal", verify, async (req, res) => {
	try {
		const id = req.body.id;
		const user = await userDetails.findOne({ _id: id }, { wallet_balance: 1, username:1, mobile:1 });
		if (!user) {
			return res.json({
				status: 1,
				message: "User Not Found",
				data: user,
			});
		} else {
			return res.json({
				status: 1,
				message: "Success",
				data: user,
			});
		}
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
			error: error,
		});
	}
});

router.get("/news", verify, async (req, res) => {
	try {
		const NewsData = await news.find({}, { Description: 1 });
		res.json({
			status: 1,
			message: "Success",
			data: NewsData,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
			error: error,
		});
	}
});

router.get("/notification", verify, async (req, res) => {
	try {
		const notificationsData = await notification
			.find({})
			.sort({ _id: -1 })
			.limit(100);
		res.json({
			status: 1,
			message: "No New Notifications!!!",
			data: notificationsData,
		});
	} catch (e) {
		res.json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
			error: e.toString(),
		});
	}
});

router.post("/notiCounter", verify, async (req, res) => {
	try {
		const id = req.body.id;
		let query = { _id: { $gt: id } };
		if (id == "") {
			query = {};
		}
		const notificationsCount = await notification.find(query).countDocuments();
		res.json({
			status: 1,
			message: "Success",
			data: notificationsCount,
		});
	} catch (e) {
		res.json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
			error: e,
		});
	}
});

router.post("/walletHistoryPaginatoion", verify, async (req, res) => {
	try {
		const userId = req.body.id;
		let perPage = 50;
		let page = parseInt(req.body.skipValue);
		history
			.find({ userId: userId })
			.sort({ _id: -1 })
			.skip(perPage * page - perPage)
			.limit(perPage)
			.exec(function (err, hisdata) {
				if (err) throw err;
				if (Object.keys(hisdata).length > 0) {
					history.countDocuments({ userId: userId }).exec((err, count) => {
						res.json({
							status: 1,
							records: hisdata,
							current: page,
							totalBids: count,
							pages: Math.ceil(count / perPage),
						});
					});
				} else {
					res.json({
						status: 0,
						message: "No Account History Found",
					});
				}
			});
	} catch (e) {
		res.json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
			error: e,
		});
	}
});

router.post("/gameRates", verify, async (req, res) => {
	try {
		const gameRatesF = await gameRates
			.find({}, { gameName: 1, gamePrice: 1 })
			.sort({ gamePrice: 1 });
		const starGameRatesF = await starGameRates
			.find({}, { gameName: 1, gamePrice: 1 })
			.sort({ gamePrice: 1 });
		const ABgameRatesF = await ABgameRates.find(
			{},
			{ gameName: 1, gamePrice: 1 }
		).sort({ gamePrice: 1 });
		const data1 = {
			gameRates: gameRatesF,
			starGameRates: starGameRatesF,
			ABgameRates: ABgameRatesF,
		};
		res.json({
			status: 1,
			message: "Success",
			data: data1,
		});
	} catch (e) {
		res.json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
			error: e,
		});
	}
});

router.post("/appNotification", verify, async (req, res) => {
	try {
		const userId = req.body.id;
		const x = req.body.notificationId;
		const statusNotification = req.body.notificationOnOff;
		// mainNotification : 1, gameNotification: 2, starLineNotification: 3, andarBaharNotification: 4
		switch (x) {
			case 1:
				await userTab.updateOne(
					{ _id: userId },
					{ $set: { mainNotification: statusNotification } }
				);
				res.json({ status: 1, message: "success" });
				break;
			case 2:
				await userTab.updateOne(
					{ _id: userId },
					{ $set: { gameNotification: statusNotification } }
				);
				res.json({ status: 1, message: "success" });
				break;
			case 3:
				await userTab.updateOne(
					{ _id: userId },
					{ $set: { starLineNotification: statusNotification } }
				);
				res.json({ status: 1, message: "success" });
				break;
			case 4:
				await userTab.updateOne(
					{ _id: userId },
					{ $set: { andarBaharNotification: statusNotification } }
				);
				res.json({ status: 1, message: "success" });
				break;
			default:
				break;
		}
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
			error: error,
		});
	}
});

router.post("/firebaseUpdate", async (req, res) => {
	try {
		const deviceno = req.body.deviceId;
		const tokenFromApp = req.body.token;
		const appVersion = req.body.appVersion;

		const verData = await version.findOne();
		// if (!verData) {

		// }
		const maintainance = verData.maintainence;
		const Currentversion = verData.appVersion;
		const fsatuts = verData.forceUpdate;
		const apk = verData.apkFileName;
		const appLink = `${APK_DOMAIN}/${apk}`//"https://update.yogicactors.co.uk/apk/Dhan_Games.apk",
		// status : 0 : Sing Up
		// status : 1 : Login
		// status : 5 : maintainance
		// status : 4 : App Upodate

		if (maintainance == false) {
			const user = await userTab.findOne(
				{ deviceId: deviceno },
				{ username: 1, mpin: 1 }
			);
			if (user) {
				const userName = user.username;
				const pin = user.mpin;

				let pinStatus = 0;
				if (pin === null) {
					pinStatus = 1;
				}

				//checkAppVersion For Force Update
				if (appVersion == Currentversion) {
					const updatetoken = await userTab.updateOne(
						{ deviceId: deviceno },
						{
							$set: { firebaseId: tokenFromApp },
						}
					);

					const body = {
						userId: user._id,
						firebaseToken: tokenFromApp,
					};

					const authToken = jwt.sign(
						{ key: user.deviceId },
						process.env.jsonSecretToken,
						{ expiresIn: "1h" }
					);
					// { expiresIn: "5min" }
					fetch(
						// "https://chatpanel.rolloutgames.xyz/mappingTableFirebaseToken",
						// "http://162.241.115.39/mappingTableFirebaseToken",
						`${chatDomain}/mappingTableFirebaseToken`,
						{
							method: "POST",
							body: JSON.stringify(body),
							headers: {
								"Content-Type": "application/json",
								"auth-token": authToken,
							},
						}
					)
						.then((res) => res.json())
						.then((json) => json);

					res.status(200).json({
						status: 1,
						message: "Token Updated Successfully",
						data: updatetoken,
						token: tokenFromApp,
						name: userName,
						mpinGen: pinStatus,
					});
				} else {
					res.status(200).json({
						status: 4,
						message: "You Are Using Old App Version Kindly Install Our New App",
						// appLink: "https://update.yogicactors.co.uk/apk/Dhan_Games.apk",
						appLink,
						forceStatus: fsatuts, //Show Close Button
						name: userName,
						mpinGen: pinStatus,
                        newVersion:Currentversion
					});
				}
			} else {
				if (appVersion == Currentversion) {
					res.status(200).json({
						status: 0,
						message: "User Not Found",
					});
				} else {
					res.status(200).json({
						status: 4,
						message: "You Are Using Old App Version Kindly Install Our New App",
						// appLink: "https://update.yogicactors.co.uk/apk/Dhan_Games.apk",
						appLink,
						forceStatus: fsatuts, //Show Close Button
                                                newVersion:Currentversion
					});
				}
			}
		} else {
			return res.json({
				status: 5,
				message: "App is Under Maintainance, Please Try Again After Sometime",
			});
		}
	} catch (error) {
		res.status(400).json({
			status: 0,
			message: "Something bad happend contact support",
			error: error,
		});
	}
});

router.post("/appBanner", async (req, res) => {
	try {
		const imagePath = "/appBanner/banner.jpg";
		res.json({
			status: 1,
			message: "Success",
			imagePath: imagePath,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Server Error",
		});
	}
});

router.post("/walletMinMax", async (req, res) => {
	try {
		const amountAdd = req.body.amount;
		if (parseInt(amountAdd) > 0) {
			res.json({
				status: 1,
				message: "Success",
			});
		} else {
			res.json({
				status: 0,
				message: "You Can Raise Max Amount Request",
			});
		}
	} catch (error) {
		res.json({
			status: 0,
			message: "Server Error",
		});
	}
});

router.post("/sendOTP", async (req, res) => {
	try {
		const userid = req.body.mobile;
		const generateOTP = Math.floor(1000 + Math.random() * 9000);

		const updateOtp = await user.findOneAndUpdate(
			{ mobile: `+91${userid}` },
			{
				$set: {
					deviceVeriOTP: generateOTP,
				},
			},
			{
				returnOriginal: false,
			}
		);

		if (updateOtp) {
			// const firebaseToken = updateOtp.firebaseId;
			// let userToken = [];
			// userToken.push(firebaseToken);
			// let title = "To Recharge your wallet";
			// let body = `OTP : ${generateOTP}`;
			// sendNoti(userToken, title, body);

			return res.json({
				status: 1,
				message: "OTP Succesfully Sent",
				name: updateOtp.name,
				balance: updateOtp.wallet_balance,
				userId: updateOtp._id,
			});
		}

		return res.json({
			status: 0,
			message: "User Not Found, Please Enter Correct Mobile Number",
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Server Error",
			error: error.toString(),
		});
	}
});

router.post("/sendOTPNew", async (req, res) => {
	const userid = req.body.mobile;
	const updateOtp = await user.findOne({ mobile: `+91${userid}` });
	sendOtp.send(`+91${userid}`, "DGAMES", function (error, data) {
		res.json({
			status: 1,
			message: "OTP Succesfully Sent",
			name: updateOtp.name,
			balance: updateOtp.wallet_balance,
			userId: updateOtp._id,
		});
	});
});

router.post("/verifyNew", async (req, res) => {
	try {
		const { otp, userId } = req.body;
		sendOtp.verify(`+91${userId}`, otp, async function (error, data) {
			if (error) {
				return res.json({
					status: 0,
					message: "Invalid OTP",
					err: error.toString(),
				});
			} else {
				return res.json({
					status: 1,
					message: data.message,
					data: data,
				});
			}
		});
	} catch (error) {
		return res.json({
			status: 0,
			message: "Server Error",
			err: error.toString(),
		});
	}
});

router.post("/verifyOtp", async (req, res) => {
	try {
		const { otp, userId } = req.body;

		const findUser = await user.findOne({ _id: userId });
		const databaseOtp = findUser.deviceVeriOTP;
		if (otp == databaseOtp) {
			await user.updateOne(
				{ _id: userId },
				{
					$set: {
						deviceVeriOTP: 0,
					},
				}
			);
			return res.json({
				status: 1,
				message: "OTP Verified Successfully",
			});
		}
		return res.json({
			status: 0,
			message: "Invalid OTP, Please Enter Correct OTP",
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Server Error",
		});
	}
});

router.post("/allMode", async (req, res) => {
	try {
		const list = await Mode.find({ disabled: true });

		return res.json({
			status: 1,
			message: "Success",
			data: list,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Server Error",
			err: error.toString,
		});
	}
});

router.post("/ideas", verify, async (req, res) => {
	try {
		const { userid, username, idea } = req.body;
		const time = moment().format("DD/MM/YYYY hh:mm a");
		const timeStamp = moment(time, "DD/MM/YYYY hh:mm a").unix();

		if (idea == "") {
			return res.json({
				status: 0,
				message: "Cannot Submit Empty Suggestion"
			})
		}

		const ideaData = new Useridea({
			userid: userid,
			username: username,
			idea: idea,
			createdAt: time,
			timestamp: timeStamp,
			approveIdea: false
		})
		const saveIdea = await ideaData.save();
		return res.json({
			status: 1,
			message: "Your Idea is Submitted Successfully, We Will Review Your Idea Soon 🥳🥳"
		})
	} catch (error) {
		return res.json({
			status: 0,
			message: `Server Error : ${error.toString()}`
		})
	}
});

module.exports = router;