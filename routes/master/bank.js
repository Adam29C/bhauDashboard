const router = require("express").Router();
const Bank = require("../../model/bank");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const revert = require("../../model/revertPayment");
const transaction = require("../../model/transactionON-OFF");
const UPI_ID = require("../../model/upi_ids");
const dateTime = require("node-datetime");
const SendOtp = require("sendotp");
// const sendOtp = new SendOtp("290393AuGCyi6j5d5bfd26");
const sendOtp = new SendOtp("1207171791436302472");
const multer = require('multer');
const multerS3 = require('multer-s3');
// const { S3Client } = require('@aws-sdk/client-s3');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');


const s3 = new S3Client({
	region: process.env.AWS_BUCKET_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
	}
});
const s3Storage = multerS3({
	s3: s3,
	bucket: "bhau777bucket", // change it as per your project requirement
	acl: "public-read", // storage access type
	metadata: (req, file, cb) => {
		cb(null, { fieldname: file.fieldname });
	},
	key: (req, file, cb) => {
		const fileName = `uploads/upi_barcode/${Date.now()}_${file.originalname}`;
		cb(null, fileName);
	},
});
const multerInstanceForUpload = multer({
	storage: s3Storage,
});

router.post("/OTPsend", async (req, res) => {
	const userInfo = req.session.details;
	let mobile = userInfo.mobile;
	
	res.json({
		status: 1,
		message: "success",
		
	});

	// sendOtp.send(`+91${mobile}`, "DGAMES", function (error, data) {
	// 	res.json({
	// 		status: 1,
	// 		message: "success",
	// 		data: data,
	// 	});
	// });
});

router.get("/", session, permission, async (req, res) => {
	try {
		const bank = await Bank.find();
		const userInfo = req.session.details;
		const permissionArray = req.view;

		const check = permissionArray["bank"].showStatus;
		if (check === 1) {
			res.render("./masters/bank", {
				data: bank,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Bank",
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

router.get("/UPI", session, permission, async (req, res) => {
	try {
		const bank = await UPI_ID.find();

		const userInfo = req.session.details;
		const permissionArray = req.view;

		res.render("./masters/upi_links", {
			data: bank,
			userInfo: userInfo,
			permission: permissionArray,
			title: "UPI ID",
		});
	} catch (e) {
		res.json({ message: e });
	}
});

router.get("/fundMode", session, permission, async (req, res) => {
	try {
		const list = await transaction.find();

		const userInfo = req.session.details;
		const permissionArray = req.view;

		res.render("./masters/transactionMaintain", {
			data: list,
			userInfo: userInfo,
			permission: permissionArray,
			title: "ON-OFF Fund Mode",
		});
	} catch (e) {
		res.json({ message: e });
	}
});

router.post("/registerbank", session, async (req, res) => {
	// 0 == Active || 1 == Disabled
	try {
		const BankDetails = new Bank({
			bankName: req.body.bankName,
			status: req.body.status,
		});
		const data = await BankDetails.save();
		res.json({
			status: 1,
			message: "Inserted Succfully",
			data: data,
		});
	} catch (e) {
		res.json({ message: e });
	}
});

router.post("/blockUnblock", session, async (req, res) => {
	try {
		const id = req.body.id;
		const status = req.body.status;
		const bank = await Bank.findOneAndUpdate(
			{ _id: id },
			{
				$set: {
					status: status,
				},
			},
			{ returnOriginal: false }
		);
		res.json({
			status: 1,
			message: "Updated Succesfully",
			data: bank,
		});
	} catch (e) {
		res.json({
			status: 0,
			message: "Server Error Contact Support",
			err: JSON.stringify(e),
		});
	}
});

router.post("/upiAdd", session, multerInstanceForUpload.single('upibarCode'), async (req, res) => {
	try {
		const userInfo = req.session.details;
		let mobile = userInfo.mobile;
		let { bankName, status, merchantName } = req.body
		let images = ""
		if (req.file) {
			images = req?.file?.location
		}
		if (status == "true") {
			const findActiveUpi = await UPI_ID.findOne({ is_Active: true });
			if (findActiveUpi) {
				return res.json({
					status: 0,
					message: "Another UPI ID is already active. Please deactivate it first.",
				});
			}
		}
		const dt = dateTime.create();
		const reqDate = dt.format("d/m/Y I:M:S");
		const upiDetails = new UPI_ID({
			UPI_ID: bankName,
			is_Active: status,
			updated_at: reqDate,
			merchantName: merchantName,
			upiBarCode: images
		});
		const updatedData = await upiDetails.save();
		res.json({
			status: 1,
			message: "UPI ID ADDED SUCCESSFULLY",
			data: updatedData,
		});
	} catch (e) {
		res.json({ statusCode: 500, status: "failure", message: e.toString() });
	}
});

//old code
// router.post("/disable_upi", session, async (req, res) => {
// 	try {
// 		const id = req.body.id;
// 		const status = req.body.status;
// 		const updateCol = req.body.stat;

// 		let query = {is_Active: status}

// 		if(updateCol == 2){
// 			query = {is_Active_chat: status}
// 		}

// 		const bank = await UPI_ID.findOneAndUpdate(
// 			{ _id: id },
// 			{
// 				$set: query,
// 			},
// 			{ returnOriginal: false }
// 		);
// 		res.json({
// 			status: 1,
// 			message: "UPI ID Disabled Succesfully",
// 			data: bank,
// 		});
// 	} catch (e) {
// 		res.json({
// 			status: 0,
// 			message: "Server Error Contact Support",
// 			err: JSON.stringify(e),
// 		});
// 	}
// });

router.post("/disable_upi", session, async (req, res) => {
	try {
		const id = req.body.id;
		const status = req.body.status;
		const updateCol = req.body.stat;
		let query = { is_Active: status };

		// Check if any UPI ID is already active only when enabling a new one
		if (status == "true") {
			const findActiveUpi = await UPI_ID.findOne({ is_Active: true });
			if (findActiveUpi) {
				return res.json({
					status: 0,
					message: "Another UPI ID is already active. Please deactivate it first.",
				});
			}
		}

		if (updateCol == 2) {
			query = { is_Active_chat: status };
		}

		const bank = await UPI_ID.findOneAndUpdate(
			{ _id: id },
			{
				$set: query,
			},
			{ returnOriginal: false }
		);
		res.json({
			status: 1,
			message: status ? "UPI ID Activated Successfully" : "UPI ID Deactivated Successfully",
			data: bank,
		});
	} catch (e) {
		res.json({
			status: 0,
			message: "Server Error Contact Support",
			err: JSON.stringify(e),
		});
	}
});


router.post("/dlt_upi", async (req, res) => {
	try {
		const id = req.body.id;
		let upiDetails = await UPI_ID.findOne({ _id: id });
		if (!upiDetails) {
			return res.json({
				status: 0,
				message: "given upi details is not found",
			});
		}
		let barCodeUrl = upiDetails.upiBarCode
		let objectKey = barCodeUrl.split('com/')[1];
		const params = {
			Bucket: "bhau777bucket",
			Key: objectKey
		};
		const command = new DeleteObjectCommand(params);
		const data = await s3.send(command);
		const bank = await UPI_ID.deleteOne({ _id: id });
		res.json({
			status: 1,
			message: "UPI ID Deleted Succesfully",
			data: bank,
		});
	} catch (e) {
console.log(e)
		res.json({
			status: 0,
			message: "Server Error Contact Support",
			err: JSON.stringify(e),
		});
	}
});

router.post("/dltBank", session, async (req, res) => {
	try {
		const id = req.body.id;
		const bank = await Bank.deleteOne({ _id: id });
		res.json({
			status: 1,
			message: "Bank Deleted Succesfully",
			data: bank,
		});
	} catch (e) {
		res.json({
			status: 0,
			message: "Server Error Contact Support",
			err: JSON.stringify(e),
		});
	}
});

router.post("/modeAdd", session, async (req, res) => {
	try {
		let { mode, status, urlWeb } = req.body;

		if (urlWeb == "") {
			urlWeb = null;
		}

		const data = new transaction({
			mode: mode,
			disabled: status,
			redirectURL: urlWeb,
		});

		await data.save();

		res.json({
			status: 1,
			message: "Added",
		});
	} catch (e) {
		res.json({ status: o, message: e.toString() });
	}
});

router.post("/disable_mode", session, async (req, res) => {
	try {
		const id = req.body.id;
		const status = req.body.status;
		await transaction.updateOne(
			{ _id: id },
			{
				$set: {
					disabled: status,
				},
			}
		);
		res.json({
			status: 1,
			message: "Add Fund Mode Disabled Succesfully",
		});
	} catch (e) {
		res.json({
			status: 0,
			message: "Server Error Contact Support",
			err: JSON.stringify(e),
		});
	}
});

router.post("/dlt_mode", session, async (req, res) => {
	try {
		const id = req.body.id;
		await transaction.deleteOne({ _id: id });
		res.json({
			status: 1,
			message: "Mode Deleted Succesfully",
		});
	} catch (e) {
		res.json({
			status: 0,
			message: "Server Error Contact Support",
			err: JSON.stringify(e),
		});
	}
});

router.get("/upiList", async (req, res) => {
	try {
		const upiList = await UPI_ID.find();
		let upiLists=[]
		if(upiList.length>0){
			upiLists = upiList
		}
		res.json({
			status: 1,
			message: "Mode Deleted Succesfully",
			data:upiLists
		});
	} catch (e) {
		res.json({ message: e });
	}
});

module.exports = router;
