const router = require("express").Router();
const ABbids = require("../../model/AndarBahar/ABbids");
const abPorvider = require("../../model/AndarBahar/ABProvider");
const abGameType = require("../../model/AndarBahar/ABGameList");
const starBIds = require("../../model/starline/StarlineBids");
const gameBids = require("../../model/games/gameBids");
const gameResult = require("../../model/games/GameResult");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/mainWinner", session, permission, async (req, res) => {
  try {
    const resultDigit = req.query.providerId;
    let data = resultDigit.split("|");
    const digit = data[0];
    const provider = data[1];
    const gamedate = data[2];
    const resultId = data[3];
    const resultStatus = data[4];
    const digitFamily = data[5];
    const session = data[6];
    const providerName = data[7];
    const userInfo = req.session.details;
    const permissionArray = req.view;
    let jodiDigit = "";
    let halfSangam1 = "";
    let halfSangam2 = "";
    let fullSangam = "";

    let finalArray = {
      "Single Pana": [],
      "Double Pana": [],
      "Triple Pana": [],
      "Single Digit": [],
    };

    if (session === "Close") {
      finalArray = {
        "Single Pana": [],
        "Double Pana": [],
        "Triple Pana": [],
        "Single Digit": [],
        "Jodi Digit": [],
        "Red Brackets": [],
        "Half Sangam Digits": [],
        "Full Sangam Digits": []
      };
    }

    const winnerList = await gameBids
      .find({
        $and: [{ $or: [{ bidDigit: digit }, { bidDigit: digitFamily }] }],
        providerId: provider,
        gameDate: gamedate,
        gameSession: session
      })
      .sort({ bidDigit: -1 });
    let gameType = "";
    for (index in winnerList) {
      gameType = winnerList[index].gameTypeName;
      finalArray[gameType].push(winnerList[index]);
    }
    if (session === "Close") {
      const openResult = await gameResult.findOne({
        providerId: provider,
        resultDate: gamedate,
        session: "Open"
      });
      if (openResult) {
        const openFamily = openResult.winningDigitFamily;
        const openPana = openResult.winningDigit;
        jodiDigit = openFamily + digitFamily;
        halfSangam1 = openFamily + "-" + digit;
        halfSangam2 = openPana + "-" + digitFamily;
        fullSangam = openPana + "-" + digit;
        const winnerListClose = await gameBids
          .find({
            $and: [
              {
                $or: [
                  { bidDigit: jodiDigit },
                  { bidDigit: halfSangam1 },
                  { bidDigit: halfSangam2 },
                  { bidDigit: fullSangam }
                ]
              }
            ],
            providerId: provider,
            gameDate: gamedate,
            gameSession: session
          })
          .sort({ bidDigit: -1 });

        for (index in winnerListClose) {
          gameType = winnerListClose[index].gameTypeName;
          finalArray[gameType].push(winnerListClose[index]);
        }
      }
    }

    const pageData = {
      winnerList: finalArray,
      resultId: resultId,
      resultStatus: parseInt(resultStatus),
      winDigit: digit,
      digitFamily: digitFamily,
      gameDate: gamedate,
      provider: provider,
      session: session,
      jodiDigit: jodiDigit,
      halfSangam1: halfSangam1,
      halfSangam2: halfSangam2,
      fullSangam: fullSangam,
      name: providerName
    };

    const check = permissionArray["gamesResult"].showStatus;
    if (check === 1) {
      res.render("./games/winnerList", {
        data: pageData,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Game Winners"
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
      message: "Contact Support",
      error: error
    });
  }
});

router.get("/starWinner", session, permission, async (req, res) => {
  try {
    const resultDigit = req.query.providerId;
    let data = resultDigit.split("|");
    const digit = data[0];
    const provider = data[1];
    const date = data[2];
    const resultId = data[3];
    const resultStatus = data[4];
    const digitFamily = data[5];

    const winnerList = await starBIds
      .find({
        providerId: provider,
        gameDate: date,
        $and: [{ $or: [{ bidDigit: digit }, { bidDigit: digitFamily }] }]
      })
      .sort({ _id: -1 });

    const pageData = {
      winnerList: winnerList,
      resultId: resultId,
      resultStatus: parseInt(resultStatus),
      winDigit: digit,
      digitFamily: digitFamily,
      gameDate: date,
      provider: provider
    };
    const userInfo = req.session.details;
    const permissionArray = req.view;

    const check = permissionArray["starlineResult"].showStatus;
    if (check === 1) {
      res.render("./starline/starWinner", {
        data: pageData,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Star Game Winner"
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
      message: "Contact Support",
      error: error
    });
  }
});

router.get("/abWinner", session, permission, async (req, res) => {
  try {
    const resultDigit = req.query.providerId;
    let data = resultDigit.split("|");
    const digit = data[0];
    const provider = data[1];
    const date = data[2];
    const resultId = data[3];
    const resultStatus = data[4];

    const resultList = await ABbids.find({
      providerId: provider,
      gameDate: date,
      bidDigit: digit
    }).sort({ _id: -1 });

    const ABProvider = await abPorvider.findOne({ _id: provider });

    const gameType = await abGameType.find();

    const pageData = {
      dispData: ABProvider,
      gametype: gameType,
      resultId: resultId,
      resultStatus: parseInt(resultStatus)
    };

    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["abResult"].showStatus;
    if (check === 1) {
      res.render("./andarbahar/AbwinnerList", {
        data: pageData,
        resultData: resultList,
        gameDate: date,
        userInfo: userInfo,
        permission: permissionArray,
        title: "AB Game Winner"
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
      message: "Contact Support",
      error: error
    });
  }
});

module.exports = router;
