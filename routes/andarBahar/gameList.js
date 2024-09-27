const router = require("express").Router();
const ABgameList = require("../../model/AndarBahar/ABGameList");
const dateTime = require("node-datetime");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
  try {
    const provider = await ABgameList.find().sort({_id : 1});;
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["abRates"].showStatus;
    if (check === 1) {
      res.render("./andarbahar/ABgamerates", {
        data: provider,
        userInfo: userInfo,
        permission: permissionArray,
        title: "AB Game Rates"
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

router.post("/insertGame", session, async (req, res) => {
  const dt = dateTime.create();
  const formatted = dt.format("Y-m-d H:M:S");
  const games = new ABgameList({
    gameName: req.body.gameName,
    gamePrice: req.body.gamePrice,
    modifiedAt: formatted
  });
  try {
    await games.save();
    const provider = await ABgameList.find();
    res.status(200).send(provider);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/", session, async (req, res) => {
  try {
    const savedGames = await ABgameList.deleteOne({ _id: req.body.userId });
    res.json(savedGames);
  } catch (e) {
    res.json(e);
  }
});

router.post("/update", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");

    await ABgameList.updateOne(
      { _id: req.body.userId },
      {
        $set: {
          gameName: req.body.gameName,
          gamePrice: req.body.gamePrice,
          modifiedAt: formatted
        }
      }
    );

    const provider = await ABgameList.find();
    res.status(200).send(provider);
  } catch (e) {
    res.json(e);
  }
});

module.exports = router;
