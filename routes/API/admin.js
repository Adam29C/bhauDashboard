"use strict";
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const admin = require("../../model/dashBoard/AdminModel");
const ipTable = require("../../model/manageIP");
const date = require("node-datetime");
const {
	registerAdminValidation,
	loginValidationadmin,
} = require("../../validation");
dotenv.config();
var ip = require("ip");

router.post("/registerAdmin", async (req, res) => {
	try {
console.log("registerAdmin")
		let data = req.header("x-api-key");
		if (!data)
			return res.status(200).send({
				status: 0,
				message: "Access Denied",
			});

		let buff = Buffer.from(data, "base64");
		let text = buff.toString("ascii");
		const validAPI = await bcrypt.compare(process.env.REGISTER_API_KEY, text);
		if (!validAPI)
			return res.status(200).send({
				status: 0,
				message: "Access Denied",
			});

		const { error } = registerAdminValidation(req.body);
		if (error) return res.status(200).send(error.details[0].message);

		const emailExist = await admin.findOne({
			email: req.body.email,
			username: req.body.username,
			mobile: req.body.mobile,
		});
		if (emailExist)
			return res.status(200).send({
				status: 0,
				message: "User Already Registered",
			});

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		const user = new admin({
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword,
			designation: req.body.designation,
			username: req.body.username.toLowerCase().replace(/\s/g, ""),
			role: req.body.role,
			mobile: req.body.mobile,
			banned: req.body.banned,
			loginStatus: "online",
			last_login: "Null",
			user_counter: req.body.user_counter,
			col_view_permission: req.body.col_view_permission,
		});
		const insert = await user.save();
		res.status(200).send({
			status: 1,
			message: "Admin Registered Successfully",
			data: insert,
		});
	} catch (error) {
		res.json({
			status: 0,
			message: "Something Bad Happened Please Contact Support",
		});
	}
});

router.post("/loginDashboard", async (req, res) => {
	try {
console.log("registerAdmin2")
		const { error } = loginValidationadmin(req.body);
		if (error) {
			const data = { message: error.details[0].message };
			res.render("index", data);
		} else {
			const username = req.body.user_username.toLowerCase().replace(/\s/g, "");
			const password = req.body.user_password;
			const user = await admin.findOne({ username: username });
			if (!user) {
				const data = { message: "User Not Found" };
				res.render("index", data);
			} else {
				if (user.banned == 0) {
					const data = {
						message: "You Are Banned By Admin, Contact Admin To Un-Block",
					};
					res.render("index", data);
				} else {
					const validPass = await bcrypt.compare(password, user.password);
					if (!validPass) {
						// insertIP(ipInfo);
						const data = { message: "Invalid Username or Password" };
						res.render("index", data);
					} else {
						if (user.loginFor == 0 || user.loginFor == 1) {
							await admin.updateOne(
								{ _id: user._id },
								{ $set: { loginStatus: "Online" } }
							);

							const token = jwt.sign(
								{ key: user._id },
								process.env.jsonSecretToken
							);
							req.session.colView = user.col_view_permission;
							let details = {
								name: user.name,
								user_id: user._id,
								username: user.username,
								designation: user.designation,
								mobile: user.mobile,
								role: user.role,
							};
							req.session.details = details;
							req.session.token = token;
							res.redirect("/dashboard");
						} else {
							const data = { message: "Sorry You Are Not Allowed To Login" };
							//res.render("index", data);
						}
					}
				}
			}
		}
	} catch (error) {
console.log(error)
		//  res.render('index', {message : error});
	}
});

router.post("/login", async (req, res) => {
	try {
console.log("registerAdmin3")
		const username = req.body.username.toLowerCase().replace(/\s/g, "");
		const password = req.body.password;
		const user = await admin.findOne({ username: username });
		if (!user)
			return res.status(200).send({
				status: 0,
				message: "Invalid Username Or Password",
			});
		if (user.banned == 0) {
			return res.status(200).send({
				status: 0,
				message: "You Are Not Allowed To Login",
			});
		}

		if (user.loginFor == 1) {
			return res.status(200).send({
				status: 0,
				message: "You Are Not Allowed To Login",
			});
		}

		const validPass = await bcrypt.compare(password, user.password);
		if (!validPass)
			return res.status(200).send({
				status: 0,
				message: "Invalid Uername or Password",
			});

		await admin.updateOne(
			{ _id: user._id },
			{ $set: { loginStatus: "Online" } }
		);

		const token = jwt.sign({ key: user._id }, process.env.jsonSecretToken);

		res.status(200).send({
			status: 1,
			Success: "Success!",
			data: user,
			yeLo: token,
		});
	} catch (error) {
		res.status(400).send({
			status: 0,
			message: "Failed",
			error: error,
		});
	}
});

router.get("/adminId",async(req,res)=>{
	try{
console.log("registerAdmin4")
       let adminDetails = await admin.findOne({username:"admin"});
	   res.status(200).send({
		status: 1,
		Success: "Success!",
		data: adminDetails._id,
	});
	} catch (error) {
		res.status(400).send({
			status: 0,
			message: "Failed",
			error: error.message,
		});
	}
})

async function insertIP(ipInfo) {
	const dt = date.create();
	const todayDate = dt.format("m/d/Y I:M:S p");

	const filter = { ipAddress: ipInfo };
	const update = {
		ipAddress: ipInfo,
		modified: todayDate,
		$inc: {
			ipCount: 1,
		},
	};

	let doc = await ipTable.findOneAndUpdate(filter, update, {
		new: true,
		upsert: true,
	});
}

module.exports = router;
