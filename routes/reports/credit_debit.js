const router = require("express").Router();
const fundreq = require("../../model/API/FundRequest");
const adminDetails = require("../../model/dashBoard/AdminModel");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const momemt = require("moment");

router.get("/", session, permission, async (req, res) => {
  try {
    const admin = await adminDetails.find({}, { _id: 1, username: 1 });
    const userInfo = req.session.details;
    const permissionArray = req.view;

    const check = permissionArray["credDebReport"].showStatus;
    if (check === 1) {
      res.render("./reports/creditDebit", {
        userInfo: userInfo,
        permission: permissionArray,
        adminDetail: admin,
        title: "Credit Debit Report"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (e) {
    res.json({
      status: 0,
      message: "contact Support",
      data: e
    });
  }
});

router.post("/report", session, async (req, res) => {
  try {
    const adminId = req.body.adminName;
    const date = req.body.date;
    const reqType = req.body.reqType;
    const NewDate = momemt(date, "MM/DD/YYYY").format("DD/MM/YYYY");
    let query = { reqDate: NewDate, reqType: reqType, adminId: adminId };

    if (adminId == 0) {
      query = { reqDate: NewDate, reqType: reqType };
    }

    const reportData = await fundreq.find(query);
    res.json(reportData);
  } catch (error) {
    res.json({
      status: 0,
      message: "contact Support",
      data: error
    });
  }
});

module.exports = router;
