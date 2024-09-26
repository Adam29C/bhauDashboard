const router = require("express").Router();
const news = require("../../model/News");
const notification = require("../../model/notification");
const dateTime = require("node-datetime");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const sendnotification = require("../helpersModule/sendNotification");
const userIdea = require("../../model/UserSuggestion");
const timeHistory = require("../../model/timeHistory")

router.get("/news", session, permission, async (req, res) => {
  const find = await news.find();
  const userInfo = req.session.details;
  const permissionArray = req.view;
  const check = permissionArray["news"].showStatus;
  if (check === 1) {
    res.render("./dashboard/news", {
      data: find,
      userInfo: userInfo,
      permission: permissionArray,
      title: "News"
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard"
    });
  }
});
router.post("/news", async (req, res) => {
  try {
    const dt = dateTime.create();
    const formatted = dt.format("Y-m-d H:M:S");
    let data = await news.findOne({_id:req.body.id});
    await news.updateOne(
      { _id: req.body.id },
      { $set: { Description: req.body.note, modified: formatted } }
    );
    const newsNew = await news.find({ _id: req.body.id });
    res.status(200).json(newsNew);
  } catch (e) {
    res.json(e);
  }
});

router.get("/notification", session, permission, async (req, res) => {
  try {
    const find = await notification
      .find()
      .sort({ _id: -1 })
      .limit(200);
    const userInfo = req.session.details;
    const permissionArray = req.view;

    const check = permissionArray["notification"].showStatus;
    if (check === 1) {
      res.render("./dashboard/notification", {
        data: find,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Notification"
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

router.post("/notification", session, async (req, res) => {
  try {

    const dt = dateTime.create();
    const formatted = dt.format("d/m/Y I:m p");

    const noti = new notification({
      title: req.body.title,
      message: req.body.message,
      modified: formatted
    });

    await noti.save();
    const notiData = await notification
      .find()
      .sort({ _id: -1 })
      .limit(200);
    let token = [];
    sendnotification(req, res, "sumDgit", token);
    res.json(notiData);
  } catch (e) {
    res.json(e);
  }
});

router.post("/notification/:id", session, async (req, res) => {
  try {
    await notification.deleteOne({ _id: req.body.id });
    const notiData = await notification.find().sort({ _id: -1 });
    res.json(notiData);
  } catch (e) {
    res.json(e);
  }
});

router.get("/userIdea", session, permission, async (req, res) => {
  try {
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["notification"].showStatus;
    if (check === 1) {
      res.render("./dashboard/userSuggestion", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "User Notification"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (e) {
    res.json(e.toString());
  }
});


router.post("/userIdea", session, async (req, res) => {
  try {

    let i = parseInt(req.body.start) + 1;
    userIdea.dataTables({
      limit: req.body.length,
      skip: req.body.start,
      order: req.body.order,
      columns: req.body.columns,
      search: {
        value: req.body.search.value,
        fields: ["username"],
      },
      sort: { _id: -1 },
    })
      .then(function (table) {
        let dataTab = table.data;
        let tabelArray = [];
        for (index in dataTab) {
          let ideaUser = dataTab[index].idea
          ideaUser = ideaUser.replace(/\n/g, "<br />");
          let dataJson = {
            _id: i,
            idea: ideaUser,
            username: dataTab[index].username,
            createdAt: dataTab[index].createdAt,
          };
          tabelArray.push(dataJson);
          i++;
        }
        res.json({
          data: tabelArray,
          recordsFiltered: table.total,
          recordsTotal: table.total,
        });
      })
      .catch(function (error) {
        res.json({
          status: 0,
          message: "Request To Large",
        });
      });
  } catch (error) {
    res.json({
      status: 0,
      message: "Server Error"
    })
  }
})

router.get("/getTimeHistory", async (req, res) => {
  try {
    let timeHistoryList = await timeHistory.find({}, { collectionName: 0 });
    return res.status(200).json({
      statusCode: 200,
      status: "Success",
      data: timeHistoryList,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      status: "Failure",
      message: "Internal Server Error"
    });
  }
});

router.post("/timeHistory", async (req, res) => {
  try {
    const { timeList } = req.body;
    if (timeList.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        status: "Failure",
        message: "data is require in req"
      });
    }
    for (let timeDetails of timeList) {
      await timeHistory.findOneAndUpdate({ _id: timeDetails._id }, { isActive: timeDetails.isActive, deleteTime: timeDetails.deleteTime,name:timeDetails.name })
    }
    return res.status(200).json({
      statusCode: 200,
      status: "Success",
      message: "Update All Data Successfully"
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      status: "Failure",
      message: "Internal Server Error"
    });
  }
});
module.exports = router;
