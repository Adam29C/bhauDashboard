const router = require("express").Router();
const abProvider = require("../../model/AndarBahar/ABProvider");
const abGame = require("../../model/AndarBahar/ABGameList");
const abBids = require("../../model/AndarBahar/ABbids");
const gameBids = require("../../model/games/gameBids");
const gamesProvider = require("../../model/games/Games_Provider");
const gamesList = require("../../model/games/GameList");
const starBids = require("../../model/starline/StarlineBids");
const { ObjectId } = require("mongodb");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/andarBaharBids", session, permission, async (req, res) => {
  try {
    const providerData = await abProvider.find().sort({_id : 1});;
    const gameData = await abGame.find();
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["abTotalBids"].showStatus;
    if (check === 1) {
      res.render("./reports/andarBaharBids", {
        data: providerData,
        data1: gameData,
        userInfo: userInfo,
        permission: permissionArray,
        title: "AB Total Bids"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (e) {
    res.json(e);
  }
});

router.post("/andarBaharBidsData", session, async (req, res) => {
  try {
    const date = req.body.startDate;
    const providerId = req.body.gameId;
    const bidsData = await abBids.find({
      providerId: providerId,
      gameDate: date
    });
    res.json(bidsData);
  } catch (error) {
    res.json({
      status: 0,
      message: "contact Support",
      data: e
    });
  }
});

router.get("/games", session, permission, async (req, res) => {
  try {
    const array = [gamesProvider.find().sort({_id : 1}).exec(), gamesList.find().sort({_id : 1}).exec()];

    const userInfo = req.session.details;
    const permissionArray = req.view;

    Promise.all(array).then(([provider, list]) => {
      const check = permissionArray["totalBids"].showStatus;
      if (check === 1) {
        res.render("./reports/totalBids", {
          provider: provider,
          list: list,
          userInfo: userInfo,
          permission: permissionArray,
          title: "Games Bid Report"
        });
      } else {
        res.render("./dashboard/starterPage", {
          userInfo: userInfo,
          permission: permissionArray,
          title: "Dashboard"
        });
      }
    });
  } catch (e) {
    res.json({ message: e });
  }
});

router.get("/gameBidsData", session, async (req, res) => {
  const providerName = req.query.providerName;
  const gameType = req.query.gameType;
  const session = req.query.session;
  const date = req.query.date;
  try {
    const bidsData = await gameBids.find({
      providerId: providerName,
      gameTypeId: gameType,
      gameSession: session,
      gameDate: date
    });
    res.json(bidsData);
  } catch (error) {
    res.json({
      status: 0,
      message: "contact Support",
      data: e
    });
  }
});

router.get("/biddingReport", session, permission, async (req, res) => {
  try {
    const array = [gamesProvider.find().sort({_id : 1}).exec(), gamesList.find().sort({_id : 1}).exec()];
    const userInfo = req.session.details;
    const permissionArray = req.view;
    Promise.all(array).then(([provider, list]) => {
      const check = permissionArray["biddingReport"].showStatus;
      if (check === 1) {
        res.render("./reports/biddingReport", {
          provider: provider,
          list: list,
          userInfo: userInfo,
          permission: permissionArray,
          title: "Bidding Report"
        });
      } else {
        res.render("./dashboard/starterPage", {
          userInfo: userInfo,
          permission: permissionArray,
          title: "Dashboard"
        });
      }
    });
  } catch (error) {
    res.json({
      status: 0,
      message: "contact Support",
      data: e
    });
  }
});

router.post("/biddingDay", session, async (req, res) => {
  const provider = req.body.provider;
  const date = req.body.date;
  const gameType = req.body.gameType;
  const session = req.body.session;
  try {
    await gameBids.aggregate(
      [
        {
          $match: {
            providerId: new ObjectId(provider),
            gameTypeId: new ObjectId(gameType),
            gameDate: date,
            gameSession: session
          }
        },
        {
          $group: {
            _id: "$bidDigit",
            sumdigit: { $sum: "$biddingPoints" },
            gameDate: { $first: "$gameDate" },
            winningDigit: { $first: "$gameWinPoints" },
            bidDigit: { $first: "$bidDigit" }
          }
        }
      ],
      function(error, group) {
        if (error) throw error;
        else res.json(group);
      }
    );
  } catch (error) {
    res.json({
      status: 0,
      message: "contact Support",
      data: error.message
    });
  }
});

router.get("/allUserBids", session, permission, async (req, res) => {
  try {
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["allUserBIds"].showStatus;
    if (check === 1) {
      res.render("./reports/allUserBids", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "All User Bids"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (error) {
    res.json({
      status: 0,
      message: "contact Support",
      data: e
    });
  }
});

router.post("/getUserBidData", session, async (req, res) => {
  try {
    const market = req.body.marketType;
    const username = req.body.username;
    let marketType = gameBids;
    let alldata;
    if (market == 2) {
      marketType = starBids;
      alldata = await starBids.find({ userName: username });
    } else if (market == 1) {
      alldata = await gameBids.find({ userName: username });
    } else {
      marketType = abBids;
      alldata = await abBids.find({ userName: username });
    }

    const groupData = await marketType.aggregate([
      {
        $match: {
          userName: username
        }
      },
      {
        $group: {
          _id: "$providerId",
          sumdigit: { $sum: "$biddingPoints" },
          countBid: { $sum: 1 },
          providerName: { $first: "$providerName" },
          gameTypeName: { $first: "$gameTypeName" }
        }
      }
    ]);

    res.json({ group: groupData, data: alldata });
  } catch (error) {
    res.json({
      status: 0,
      message: "contact Support",
      data: e
    });
  }
});

module.exports = router;
