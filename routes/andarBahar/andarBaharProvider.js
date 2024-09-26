const router = require("express").Router();
const ABProvider = require("../../model/AndarBahar/ABProvider");
const dateTime = require("node-datetime");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
  try {
    const provider = await ABProvider.find().sort({_id : 1});
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["abProvider"].showStatus;
    if (check === 1) {
      res.render("./andarbahar/ABprovider", {
        data: provider,
        userInfo: userInfo,
        permission: permissionArray,
        title: "AB Provider"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (e) {
    res.json({ message: e });
  }
});

router.get("/specificUser", session, async (req, res) => {
  try {
    const user = await ABProvider.findOne({ _id: req.query.userId });
    res.json(user);
  } catch (e) {
    res.json({ message: e });
  }
});

router.post("/insertGame", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    const games = new ABProvider({
      providerName: req.body.gamename,
      providerResult: req.body.result,
      modifiedAt: formatted
    });
    await games.save();
    res.redirect("/providerAB");
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/", session, async (req, res) => {
  try {
    const savedGames = await ABProvider.deleteOne({ _id: req.body.userId });
    res.json(savedGames);
  } catch (e) {
    res.json(e);
  }
});

router.patch("/", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    await ABProvider.updateOne(
      { _id: req.body.userId },
      {
        $set: {
          providerName: req.body.gamename,
          providerResult: req.body.result,
          modifiedAt: formatted
        }
      }
    );
    res.redirect("/providerAB");
  } catch (e) {
    res.json(e);
  }
});
module.exports = router;
