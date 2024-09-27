const router = require("express").Router();

router.get("/", async (req, res) => {
	try {
		const data = { message: "" };
		res.render("index", data);
	} catch (e) {
		res.json({ message: e });
	}
});

module.exports = router;
