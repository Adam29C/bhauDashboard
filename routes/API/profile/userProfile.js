const router = require("express").Router();
const profile = require("../../../model/API/Profile");
const userFind = require("../../../model/API/Users");
const fundReq = require("../../../model/API/FundRequest");
const history = require("../../../model/wallet_history");
const verify = require("../verifyTokens");
const dateTime = require("node-datetime");
const crypto = require("crypto");
const request = require('request');
const moment = require('moment');

router.post("/bankdetails", async (req, res) => {
	try {
		const dt = dateTime.create();
		const formatted = dt.format("d/m/Y I:m:S p");
		const userName = await userFind.findOne({ _id: req.body.userId });
		const user = await profile.findOne({ userId: req.body.userId });
		if (!user) {
			const name = userName.username;
			const bankDetails = new profile({
				userId: req.body.userId,
				address: null,
				city: null,
				pincode: null,
				username: name,
				account_no: req.body.account_no,
				bank_name: req.body.bank_name,
				ifsc_code: req.body.ifsc_code,
				account_holder_name: req.body.account_holder_name,
				paytm_number: null,
				profileChangeCounter: 0,
				created_at: formatted,
			});
			const savedUser = await bankDetails.save();

			res.status(200).json({
				status: 1,
				message: "Bank Details Added Successfully",
				data: savedUser,
			});
		} else {
			
			let acc_no = user.account_no;
			if (acc_no != null) {
				let arrayOld = user.changeDetails;
				let counter = user.profileChangeCounter;
				let Oldacc_no = user.account_no;
				let oldBankName = user.bank_name;
				let oldIfscCode = user.ifsc_code;
				let oldAcvName = user.account_holder_name;
				let finalString = {
					old_acc_no: Oldacc_no,
					old_bank_name: oldBankName,
					old_ifsc: oldIfscCode,
					old_acc_name: oldAcvName,
					old_paytm_no: null,
					changeDate: formatted,
				};
				arrayOld.push(finalString);
				counter = counter + 1;

				await profile.updateOne(
					{ userId: req.body.userId },
					{
						$set: {
							account_no: req.body.account_no,
							bank_name: req.body.bank_name,
							ifsc_code: req.body.ifsc_code,
							account_holder_name: req.body.account_holder_name,
							changeDetails: arrayOld,
							profileChangeCounter: counter,
							updatedAt: formatted,
						},
					}
				);
			} else {
				await profile.updateOne(
					{ userId: req.body.userId },
					{
						$set: {
							account_no: req.body.account_no,
							bank_name: req.body.bank_name,
							ifsc_code: req.body.ifsc_code,
							account_holder_name: req.body.account_holder_name,
							updatedAt: formatted,
						},
					}
				);
			}
			return res.status(200).json({
				status: 1,
				message: "Updated Successfully",
			});
		}
	} catch (error) {
		res.status(400).json({
			status: 0,
			message: "Something Went Wrong",
			error: error.toString(),
		});
	}
});

router.post("/checkRequest", async (req, res)=>{
	try {
		const userid = req.body.userid;
		const dt = dateTime.create();
		const todayDate = dt.format("d/m/Y");
		const check =  await fundReq.findOne({userId : userid,reqDate : todayDate, reqType : "Debit"});
		if(check){

			const mode = check.withdrawalMode
		
			if(mode === "Bank"){
				return res.json({
					status : 0,
					message : `Hello ${check.username}
	
					Your Cant Change Your Account Details Right Now.
					Please Come Back After 24 Hours.`
				})
			}
			else{
				return res.json({
					status : 1,
					message : "You Can Change Your Account Details"
				})
			}
		}
		return res.json({
			status : 1,
			message : "You Can Change Your Account Details"
		})
	} catch (error) {
		res.json({
			status : 0,
			message : `Server Error ${error}`
		})
	}
})

router.post("/phoneNumber", async (req, res) => {
	try {
		const dt = dateTime.create();
		const formatted = dt.format("m/d/Y I:M:S p");
		const userName = await userFind.findOne({ _id: req.body.userId });
		const user = await profile.findOne({ userId: req.body.userId });
		if (!user) {
			const name = userName.username;
			const bankDetails = new profile({
				userId: req.body.userId,
				address: null,
				city: null,
				username: name,
				pincode: null,
				account_no: null,
				bank_name: null,
				ifsc_code: null,
				account_holder_name: null,
				paytm_number: req.body.paytm_number,
				created_at: formatted,
				profileChangeCounter: 0,
			});

			const savedUser = await bankDetails.save();
			res.status(200).json({
				status: 1,
				message: "success",
				data: savedUser,
			});
		} else {
			let paytm_number = user.paytm_number;

			if (paytm_number != null) {
				if (paytm_number != req.body.paytm_number) {
					let arrayOld = user.changeDetails;
					let counter = user.profileChangeCounter;
					let finalString = {
						old_acc_no: null,
						old_bank_name: null,
						old_ifsc: null,
						old_acc_name: null,
						old_paytm_no: paytm_number,
						changeDate: formatted,
					};
					arrayOld.push(finalString);
					counter = counter + 1;

					await profile.updateOne(
						{ userId: req.body.userId },
						{
							$set: {
								paytm_number: req.body.paytm_number,
								changeDetails: arrayOld,
								profileChangeCounter: counter,
								updatedAt: formatted,
							},
						}
					);
					res.status(200).json({
						status: 1,
						message: "Updated Successfully",
					});
				} else {
					res.status(200).json({
						status: 1,
						message: "Same Number Cannot Be Updated",
					});
				}
			} else {
				await profile.updateOne(
					{ userId: req.body.userId },
					{
						$set: {
							paytm_number: req.body.paytm_number,
							updatedAt: formatted,
						},
					}
				);
				res.status(200).json({
					status: 1,
					message: "Updated Successfully",
				});
			}
		}
	} catch (error) {
		res.status(400).json({
			status: 0,
			message: "Something Went Wrong",
			error: error,
		});
	}
});

router.post("/userProfile", verify,async (req, res) => {
	try {
		const id = req.body.id;
		const profileDetails = await profile.findOne({ userId: id });
		if(!profileDetails){
			return res.status(400).json({
				status: 0,
				error: "Please add bank details",
			});
		}
		let userDetails = await userFind.findOne({ _id: id }, { wallet_balance: 1, _id: 0 })
		let finalObj = {
			changeDetails:profileDetails.changeDetails,
			_id: profileDetails._id,
			userId: profileDetails.userId,
			address: profileDetails.address,
			city: profileDetails.city,
			pincode: profileDetails.pincode,
			username:profileDetails.username,
			account_no: profileDetails.account_no,
			bank_name:profileDetails.bank_name,
			ifsc_code: profileDetails.ifsc_code,
			account_holder_name:profileDetails.account_holder_name,
			paytm_number: profileDetails.paytm_number,
			profileChangeCounter: profileDetails.profileChangeCounter,
			created_at: profileDetails.created_at,
			wallet_balance:userDetails.wallet_balance
		}
		res.status(200).json({
			status: 1,
			message: "Success",
			data: finalObj,
		});
	} catch (error) {
		res.status(400).json({
			status: 0,
			message: "Something Went Wrong",
			error: error,
		});
	}
});

router.post("/checkAccountNumber",  async(req, res)=>{
	try {
		const hash = crypto.createHash("sha512");
		const { account_name, account_number, bank_name, ifsc_code, userid, firstTime } = req.body;
		const checkUser = await userFind.findOne({_id : userid});
		const accountNumberRegex = /^\d{9,18}$/;
		const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
		
		if(checkUser === null){
			return res.json({
				status : 0,
				message : "Sorry You are not a valid Khatri User"
			})
		}

		if (!accountNumberRegex.test(account_number)){
			return res.json({
				status : 0,
				message : "Invalid Bank Account Number",
			});
		}

		if (!ifscRegex.test(ifsc_code)){
			return res.json({
				status : 0,
				message : "Invalid IFSC Code",
			});
		}
		
		const dateUpdate = moment().format("DD/MM/YYYY");
		const time = moment().format("hh:mm:ss a");
		
		if(firstTime == true){
			const ts = moment(dateUpdate, "DD/MM/YYYY").unix();
			const {name, username, mobile} = checkUser;
			const userCheck = await userFind.findOneAndUpdate(
				{ _id: userid },
				{
					$inc: {
						wallet_balance: parseInt(-5),
					}
				},
				{
					returnOriginal: false,
				}
			);

			const addReq = new fundReq({
				userId: userid,
				reqAmount: 5,
				fullname: name,
				username: username,
				mobile: mobile,
				reqType: "Debit",
				reqStatus: "Approved",
				toAccount : {
					accNumber : account_number,
					ifscCode : ifsc_code,
					bankName : bank_name,
					accName : `${account_name}`
				},
				reqDate: dateUpdate,
				reqTime: time,
				withdrawalMode: "Auto/Self",
				UpdatedBy: "Auto/Self",
				reqUpdatedAt: dateUpdate + " " + time,
				fromExport: false,
				from: 1,
				timestamp: ts,
			});
			const saveId = await addReq.save();
			
			const point_history = new history({
				userId: userid,
				bidId : saveId._id,
				filterType : 7,
				previous_amount: userCheck.wallet_balance + 5,
				current_amount: userCheck.wallet_balance,
				transaction_amount: 5,
				description: "Bank Account Changing Charges",
				transaction_date: dateUpdate,
				transaction_time: time,
				transaction_status: "Success",
				particular: "Auto/Self",
				reqType: "Debit",
				username: username,
				mobile: mobile,
			});
			await point_history.save();
			return res.json({
				status : 1,
				message : "API Response",
				resp: {
					data: {
						beneficiary_name: bank_name,
						accNumber : account_number,
						ifscCode : ifsc_code,
						bankName : bank_name,
						accName : `${account_name}`
					}
				}
			})
		} else {
			return res.json({
				status : 1,
				message : "API Response",
				resp: {
					data: {
						beneficiary_name: bank_name,
						accNumber : account_number,
						ifscCode : ifsc_code,
						bankName : bank_name,
						accName : `${account_name}`
					}
				}
			})
		}
		// const api_key = "35c70f0e-4019-4541-ac09-9dacd2e986dc";
		// const salt = "c9edf82837d44c35a8bff0b161bfaae1b6f56334";
		// const pipe = `${salt}|${account_name}|${account_number}|${api_key}|${bank_name}|${ifsc_code}`;

		// data = hash.update(pipe, "utf-8");
		// gen_hash = data.digest("hex");
		// const hash_op = gen_hash.toUpperCase();

		// var options = {
		// 	'method': 'POST',
		// 	'url': 'https://biz.traknpay.in/v2/fundtransfer/validateaccount',
		// 	'headers': {
		// 		'Content-Type': 'application/json',
		// 		'Cookie': 'XSRF-TOKEN=eyJpdiI6ImtSejBOODZtUDFXUkorRmVXNnUyZVE9PSIsInZhbHVlIjoiNXZrVXlLU0tsOUJrcWxINEVTTUZDcDU3XC9oUGFyeEpobGJcL0NOTEtPTGF0V2d5b2RKWjJ1bFJpS1FEN0xLbmZwaHlvM0ZUWWpKcDBJRSt4M01tdDJGdz09IiwibWFjIjoiNzhlZDQ5YzNkYjE5OThjZmI3MmJkYWYzN2ZmZThhMjdmODRiMzllZmZmZmE0Yzc5MzBkYzQ4ODc4Yjc0MjJlNiJ9'
		// },
		// body: JSON.stringify({"account_name": account_name,"account_number":account_number,"api_key":api_key,"bank_name":bank_name,"hash":hash_op,"ifsc_code":ifsc_code})
		// };
	
		// request(options, async function (error, response) {
		// 	if (error) return res.json({status : 0, message : "Api Error", err : error.toString()});
		// 	let resp = JSON.parse(response.body);
		// 	let stat = resp.data.status;
		// 	if(stat == "SUCCESS")
		// 	{
				
		// 	}
		// 	return res.json({
		// 		status : 0,
		// 		message : "Invalid Bank Details",
		// 		resp
		// 	})
		// });
	} catch (error) {
		res.json({
			status : 0,
			message : `Server Error ${error.toString()}`
		})
	}
});

module.exports = router;