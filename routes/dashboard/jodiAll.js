const router = require("express").Router();
const provider = require("../../model/games/Games_Provider");
const gameBids = require("../../model/games/gameBids");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
  try {
    const providerList = await provider.find().sort({_id : 1});;
    const userInfo = req.session.details;
    const permissionArray = req.view;

    const check = permissionArray["jodiAll"].showStatus;
    if (check === 1) {
      res.render("dashboard/jodiAll", {
        data: providerList,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Jodi All"
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

router.post("/", session, async (req, res) => {
  try {
    // Need to Test
    return res.json({
      status: 0,
      message: "Ooopss No Data Found!!!!"
    });

    const gameSession = req.body.gameSession;
    const gameid = req.body.gameid;
    const sDate = req.body.sDate;
    const eDate = req.body.eDate;
    let bidsData = null;
    if (gameid == 0) {
      bidsData = await gameBids.find(
        {
          gameDate: {
            $gte: sDate,
            $lte: eDate
          },
          gameSession: gameSession,
          $expr: { $eq: [{ $strLenCP: "$bidDigit" }, 2] }
        },
        { biddingPoints: 1, gameWinPoints: 1, bidDigit: 1 }
      );
    } else {
      bidsData = await gameBids.find(
        {
          providerId: gameid,
          gameDate: {
            $gte: sDate,
            $lte: eDate
          },
          gameSession: gameSession,
          $expr: { $eq: [{ $strLenCP: "$bidDigit" }, 2] }
        },
        { biddingPoints: 1, gameWinPoints: 1, bidDigit: 1 }
      );
    }

    if (Object.keys(bidsData).length > 0) {
      let biddingSum = 0;
      let winSum = 0;
      let i = 1;
      bidsData.forEach(e => {
        biddingSum = biddingSum + e.biddingPoints;
        winSum = winSum + e.gameWinPoints;
        i++;
      });
      let loss = biddingSum - winSum;
      let color = "green";
      if (loss <= 0) {
        color = "red";
      }
      res.json({
        status: 1,
        bidSum: biddingSum,
        winSum: winSum,
        color: color,
        totalBids: i,
        profit: loss
      });
    } else {
      res.json({
        status: 0,
        message: "Ooopss No Data Found!!!!"
      });
    }
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
