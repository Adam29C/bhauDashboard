const router = require("express").Router();
const starProvider = require("../../model/starline/Starline_Provider");
const starSettings = require("../../model/starline/AddSetting");
const dateTime = require("node-datetime");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/", session, permission, async (req, res) => {
  try {
    const id = req.query.userId;
    const userInfo = req.session.details;
    const permissionArray = req.view;
    let finalArr = {};
    const provider = await starProvider.find().sort({ _id: 1 });
    let finalNew = [];

    for (index in provider) {
      let id = provider[index]._id;
      const settings = await starSettings.find({ providerId: id }).sort({ _id: 1 });
      finalArr[id] = {
        _id: id,
        providerName: provider[index].providerName,
        providerResult: provider[index].providerResult,
        modifiedAt: provider[index].modifiedAt,
        resultStatus: provider[index].resultStatus,
        gameDetails: settings
      }
    }

    for (index2 in finalArr) {
      let data = finalArr[index2];
      finalNew.push(data)
    }

    if (id == 123456) {
      return res.json(finalNew);
    }

    const check = permissionArray["starlineSetting"].showStatus;
    if (check === 1) {
      res.render("./starline/starlinegamesetting", {
        data: finalNew,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Starline Game Setting"
      });
    }
    else {
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

router.get("/addSetting", session, permission, async (req, res) => {
  try {
    const provider = await starProvider.find().sort({ _id: 1 });
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["starlineSetting"].showStatus;
    if (check === 1) {
      res.render("./starline/starlineaddsetting", {
        data: provider,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Starline Add Setting"
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

router.post("/updateProviderSettings", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");

    const updateUser = await starSettings.updateMany(
      { providerId: req.body.providerId },
      {
        $set: {
          OBT: req.body.obtTime,
          CBT: req.body.cbtTime,
          OBRT: req.body.obrtTime,
          isClosed: req.body.openClose,
          modifiedAt: formatted
        }
      }
    );
    res.redirect("/starlinegamesetting");
  } catch (e) {
    res.redirect("./starline/starlinemultiedit");
  }
});

router.patch("/", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    const updateUser = await starSettings.updateOne(
      { _id: req.body.id },
      {
        $set: {
          OBT: req.body.obt,
          CBT: req.body.cbt,
          OBRT: req.body.obrt,
          isClosed: req.body.close,
          modifiedAt: formatted
        }
      }
    );
    res.redirect("/starlinegamesetting");
  } catch (e) {
    res.json(e);
  }
});

router.post("/insertSettings", session, async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    const providerId = req.body.gameid;
    const gameDay = req.body.gameDay;
    const find = await starSettings.findOne({
      providerId: providerId,
      gameDay: gameDay
    });
    let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (!find) {
      if (gameDay === "All") {
        let finalArr = []
        let uniqueDays;
        const providerSetting = await starSettings.find({ providerId: providerId }, { gameDay: 1, providerId: 1 });
        if (providerSetting.length > 0) {
          let daysFromArray1 = providerSetting.map(item => item.gameDay);
          let allDays = new Set([...daysFromArray1, ...days]);
          uniqueDays = [...allDays].filter(day => !daysFromArray1.includes(day) || !days.includes(day));
        } else {
          uniqueDays = days
        }
        for (let day of uniqueDays) {
          finalArr.push({
            providerId: providerId,
            gameDay: day,
            OBT: req.body.game1,
            CBT: req.body.game2,
            OBRT: req.body.game3,
            CBRT: req.body.game4,
            isClosed: req.body.status,
            modifiedAt: formatted
          })
        }
        console.log(finalArr)
        await starSettings.insertMany(finalArr)
      } else {
        const settings = new starSettings({
          providerId: providerId,
          gameDay: gameDay,
          OBT: req.body.game1,
          CBT: req.body.game2,
          OBRT: req.body.game3,
          CBRT: req.body.game4,
          isClosed: req.body.status,
          modifiedAt: formatted
        });
        await settings.save();
      }
      res.json({
        status: 1,
        message: "Successfully Inserted Timings For " + gameDay
      });
    } else {
      res.json({
        status: 1,
        message: "Details Already Filled For " + gameDay
      });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/:providerId", session, permission, async (req, res) => {
  try {
    const id = req.params.providerId;
    let findMultiple;
    findMultiple = await starSettings.find({ providerId: id });
    const userInfo = req.session.details;
    const permissionArray = req.view;

    if (Object.keys(findMultiple).length === 0) {
      findMultiple = "Epmty";
    }

    const check = permissionArray["starlineSetting"].showStatus;
    if (check === 1) {
      res.render("./starline/starlinemultiedit", {
        data: findMultiple,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Starline Multi Edit"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (error) {
    res.json({ message: error });
  }
});

module.exports = router;
