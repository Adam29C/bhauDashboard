const router = require("express").Router();
const dateTime = require("node-datetime");
const gameList = require("../../model/games/GameList");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
  try {
    // Need to test
    // return res.json({ message: 'Not found' });
    const provider = await gameList.find().sort({ _id: 1 });;
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["gamesRates"].showStatus;
    if (check === 1) {
      return res.render("./games/gameList", {
        data: provider,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Game Rates"
      });
    } else {
      return res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (e) {
    return res.json({ message: e });
  }
});

router.get("/specificUser", session, async (req, res) => {
  try {
    const user = await gameList.findOne({ _id: req.query.userId });
    res.json(user);
  } catch (e) {
    res.json({ message: e });
  }
});

router.post("/insertGame", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    const games = new gameList({
      gameName: req.body.gamename,
      gamePrice: req.body.price,
      modifiedAt: formatted
    });
    await games.save();
    res.redirect("/gameList");
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/", session, async (req, res) => {
  try {
    const savedGames = await gameList.deleteOne({ _id: req.body.userId });
    return res.json(savedGames);
  } catch (e) {
    return res.json(e);
  }
});

router.patch("/", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    await gameList.updateOne(
      { _id: req.body.userId },
      {
        $set: {
          gameName: req.body.gamename,
          gamePrice: req.body.price,
          modifiedAt: formatted
        }
      }
    );
    res.redirect("/gameList");
  } catch (e) {
    res.json(e);
  }
});

module.exports = router;
