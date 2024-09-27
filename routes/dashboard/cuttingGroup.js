const router = require("express").Router();
const mongodb = require("mongodb");
const provider = require("../../model/games/Games_Provider");
const gameBids = require("../../model/games/gameBids");
const session = require("../helpersModule/session");
const mongoose = require("mongoose");
const digits = require("../../model/digits");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
  const find = await provider.find().sort({ _id: 1 });
  const userInfo = req.session.details;
  const permissionArray = req.view;
  const check = permissionArray["cg"].showStatus;
  if (check === 1) {
    res.render("./dashboard/cuttinggroup", {
      data: find,
      userInfo: userInfo,
      permission: permissionArray,
      title: "Cutting Group",
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard",
    });
  }
});

// Old

// router.post("/getCutting", async (req, res) => {
//   try {
//     const gameDate = req.body.gameDate;
//     const gameSession = req.body.gameSession;
//     const providerId = req.body.providerId;

//     const data1 = await gameBids.aggregate([
//       {
//         $match: {
//           gameDate: gameDate,
//           providerId: mongoose.Types.ObjectId(providerId),
//           gameTypeName: gameSession,
//         },
//       },
//       {
//         $group: {
//           _id: "$gameTypeId",
//           sumdigit: { $sum: "$biddingPoints" },
//           countBid: { $sum: 1 },
//           gameType: { $first: "$gameSession" },
//           gameTypeName: { $first: "$gameTypeName" },
//         },
//       },
//     ]);

//     if (Object.keys(data1).length != 0) {
//       var data2 = await gameBids.aggregate([
//         {
//           $match: {
//             gameDate: gameDate,
//             providerId: mongoose.Types.ObjectId(providerId),
//             gameTypeName: gameSession,
//           },
//         },
//         {
//           $group: {
//             _id: "$bidDigit",
//             sumdigit: { $sum: "$biddingPoints" },
//             countBid: { $sum: 1 },
//             date: { $first: "$gameDate" },
//             gamePrice: { $first: "$gameTypePrice" },
//           },
//         },
//       ]);

//       return res.status(200).json({ data1, data2, providerId });
//     }
//     return res.status(200).json({ status: 0 });
//   } catch (error) {
//     return res.status(400).json(error);
//   }
// });

router.post("/getCutting", async (req, res) => {
  try {
    const gameDate = req.body.gameDate;
    const gameSession = req.body.gameSession;
    const providerId = req.body.providerId;
    const bidDigit = req.body.bidDigit;

    let QUERY = {};
    if (gameSession == "Jodi Digit") {
      QUERY = {
        providerId: mongoose.Types.ObjectId(providerId),
        bidDigit: { $in: bidDigit },
        gameSession: "Close",
        gameDate: gameDate,
      };
    } else {
      QUERY = {
        gameTypeName: gameSession,
        providerId: mongoose.Types.ObjectId(providerId),
        gameSession: "Close",
        gameDate: gameDate,
      };
    }

    const data1 = await gameBids.aggregate([
      {
        $match: QUERY,
      },
      {
        $group: {
          _id: "$gameTypeId",
          sumdigit: { $sum: "$biddingPoints" },
          countBid: { $sum: 1 },
          gameType: { $first: "$gameSession" },
          gameTypeName: { $first: "$gameTypeName" },
        },
      },
    ]);

    if (Object.keys(data1).length != 0) {
      if (gameSession == "Jodi Digit") {

        data1[0].gameTypeName="Jodi Digit"
        
        var data2 = await gameBids.aggregate([
          {
            $match: {
              providerId: mongoose.Types.ObjectId(providerId),
              bidDigit: { $in: bidDigit },
              gameSession: "Close",
              gameDate: gameDate,
            },
          },
          {
            $group: {
              _id: "$bidDigit",
              sumdigit: { $sum: "$biddingPoints" },
              countBid: { $sum: 1 },
              date: { $first: "$gameDate" },
              gamePrice: { $first: "$gameTypePrice" },
            },
          },
        ]);
      } else {
        var data2 = await gameBids.aggregate([
          {
            $match: {
              gameDate: gameDate,
              providerId: mongoose.Types.ObjectId(providerId),
              gameTypeName: gameSession,
            },
          },
          {
            $group: {
              _id: "$bidDigit",
              sumdigit: { $sum: "$biddingPoints" },
              countBid: { $sum: 1 },
              date: { $first: "$gameDate" },
              gamePrice: { $first: "$gameTypePrice" },
            },
          },
        ]);
      }

      return res.status(200).json({ data1, data2, providerId });
    }
    return res.status(200).json({ status: 0 });
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.post("/getOC", async (req, res) => {
  try {
    const gameDate = req.body.gameDate;
    const gameSession = req.body.gameSession;
    const providerId = req.body.providerId;
    const data1 = await gameBids.aggregate([
      {
        $match: {
          gameDate: gameDate,
          providerId: mongoose.Types.ObjectId(providerId),
          gameSession: gameSession,
        },
      },
      {
        $group: {
          _id: "$gameTypeId",
          sumdigit: { $sum: "$biddingPoints" },
          countBid: { $sum: 1 },
          gameType: { $first: "$gameSession" },
          gameTypeName: { $first: "$gameTypeName" },
          bidDigit: { $first: "$bidDigit" },
        },
      },
    ]);

    if (Object.keys(data1).length != 0) {
      const data2 = await gameBids.aggregate([
        {
          $match: {
            gameDate: gameDate,
            providerId: mongoose.Types.ObjectId(providerId),
            gameSession: gameSession,
          },
        },
        {
          $group: {
            _id: "$bidDigit",
            sumdigit: { $sum: "$biddingPoints" },
            countBid: { $sum: 1 },
            date: { $first: "$gameDate" },
            gamePrice: { $first: "$gameTypePrice" },
            gameSession: { $first: "$gameSession" },
          },
        },
      ]);
      const pana = await digits.find();
      return res.status(200).json({ data1, data2, pana });
    }
    return res.status(200).json({ status: 0 });
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.post("/getBidData", session, async (req, res) => {
  const date = req.body.date;
  const digit = req.body.bidDigit;
  const gameId = req.body.id;
  const gameSession = req.body.gameSession;

  try {
    const bidData = await gameBids.find({
      gameDate: date,
      providerId: gameId,
      bidDigit: digit,
      gameSession: gameSession,
    });
    res.json(bidData);
  } catch (e) {
    res.json(e);
  }
});

module.exports = router;
