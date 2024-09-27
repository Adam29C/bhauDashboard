const router = require("express").Router();
const dateTime = require("node-datetime");
const gamesProvider = require("../../model/games/Games_Provider");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
	try {
		const provider = await gamesProvider.find().sort({ _id: 1 });
		const userInfo = req.session.details;
		const permissionArray = req.view;

		const check = permissionArray["gamesProvider"].showStatus;
		if (check === 1) {
			res.render("./games/provider", {
				data: provider,
				userInfo: userInfo,
				permission: permissionArray,
				title: "Games Provider",
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

router.get("/specificUser", session, async (req, res) => {
	try {
		const user = await gamesProvider.findOne({ _id: req.query.userId });
		res.json(user);
	} catch (e) {
		res.json({ message: e });
	}
});

router.post("/insertGame", session, async (req, res) => {
	const dt = dateTime.create();
	const formatted = dt.format("Y-m-d H:M:S");

	const games = new gamesProvider({
		providerName: req.body.gamename,
		providerResult: req.body.result,
		activeStatus: req.body.acvtiveStatus,
		modifiedAt: formatted,
		mobile: req.body.mobile,
	});

	try {
		await games.save();
		res.redirect("/games");
	} catch (e) {
		res.status(400).send(e);
	}
});

router.delete("/", session, async (req, res) => {
	try {
		const savedGames = await gamesProvider.deleteOne({ _id: req.body.userId });
		res.json(savedGames);
	} catch (e) {
		res.json(e);
	}
});

router.patch("/", session, async (req, res) => {
	try {
		const dt = dateTime.create();
		const formatted = dt.format("Y-m-d H:M:S");
		await gamesProvider.updateOne(
			{ _id: req.body.userId },
			{
				$set: {
					providerName: req.body.gamename,
					providerResult: req.body.result,
					activeStatus: req.body.acvtiveStatusEdit,
					modifiedAt: formatted,
					mobile: req.body.mobile
				},
			}
		);
		res.redirect("/games");
	} catch (e) {
		res.json(e);
	}
});

module.exports = router;
