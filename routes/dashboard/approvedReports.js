const router = require("express").Router();
const fundReq = require("../../model/API/FundRequest");
const UPIlist = require("../../model/API/upiPayments");
const userProfile = require("../../model/API/Profile");
const dateTime = require("node-datetime");
const moment = require("moment");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");
const mongoose = require("mongoose");

router.get("/bank", session, permission, async (req, res) => {
  try {
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["bankReq"].showStatus;
    if (check === 1) {
      res.render("approvedReports/bankAccount", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Approved Report"
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

router.get("/paytm", session, permission, async (req, res) => {
  try {
    const dt = dateTime.create();
    let date = dt.format("d/m/Y");
    const report = await fundReq.find({
      reqDate: date,
      reqStatus: "Approved",
      withdrawalMode: "Paytm",
      reqType: "Debit",
      from : 2
    });
    const userInfo = req.session.details;
    const permissionArray = req.view;

    const check = permissionArray["paytmReq"].showStatus;
    if (check === 1) {
      res.render("approvedReports/paytm", {
        data: report,
        total: 0,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Approved Report"
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

router.get("/bankManual", session, permission, async (req, res) => {
    try {
      const dt = dateTime.create();
      let date = dt.format("d/m/Y");
      const report = await fundReq.find({
          reqDate: date,
          reqStatus: "Approved",
          reqType: "Debit",
          withdrawalMode: "Bank",
          fromExport : false,
          from : 2
      });
      const userInfo = req.session.details;
      const permissionArray = req.view;
      const check = permissionArray["bankReq"].showStatus;
      if (check === 1) {
        res.render("approvedReports/bankManual", {
          data: report,
          total: 0,
          userInfo: userInfo,
          permission: permissionArray,
          title: "Approved Report"
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

router.get("/creditUPI", session, permission, async (req, res) => {
  try {
    const dt = dateTime.create();
    let date = dt.format("d/m/Y");
    const report = await UPIlist.find({
      reqDate: date,
      $and : [ { $or : [ { reqStatus : "submitted" }, { reqStatus : "pending" } ] }]
    });
        
    const userInfo = req.session.details;
    const permissionArray = req.view;

    const check = permissionArray["paytmReq"].showStatus;
    if (check === 1) {
      res.render("dashboard/approvedCredit", {
        data: report,
        total: 0,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Approved Report"
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

router.get("/creditUPI_ajax", session, permission, async (req, res) => {
  try 
  {
    const date_cust = req.query.date_cust;
    const dateFormat = moment(date_cust, "MM/DD/YYYY").format("DD/MM/YYYY");

    const report = await UPIlist.find({
      reqDate: dateFormat,
      $and : [ { $or : [ { reqStatus : "submitted" }, { reqStatus : "pending" } ] }]
    });

    res.json({ approvedData: report });
  }
  catch (e) {
    res.json({ message: e });
  }
});

router.get("/paytm_ajax", session, async (req, res) => {
  try {
    const date_cust = req.query.date_cust;
    const dateFormat = moment(date_cust, "MM/DD/YYYY").format("DD/MM/YYYY");

    const report = await fundReq.find({
        reqDate: dateFormat,
        reqStatus: "Approved",
        withdrawalMode: "Paytm",
        reqType: "Debit",
        // from : 2
    });
    res.json({ approvedData: report });
  } catch (e) {
    res.json({ message: e });
  }
});

router.get("/bank_ajax", session, async (req, res) => {
  try {
      const date_cust = req.query.date_cust;
      const dateFormat = moment(date_cust, "MM/DD/YYYY").format("DD/MM/YYYY");
      const userBebitReq = await fundReq.find({
          reqDate: dateFormat,
          reqStatus: "Approved",
          reqType: "Debit",
          $and: [{ $or: [{ withdrawalMode: "Bank" }, { withdrawalMode: "Paytm" }] }],
          fromExport : true
      });

      let userIdArray = [];
      let debitArray = {};
      for (index in userBebitReq) {
        let reqAmount = userBebitReq[index].reqAmount;
        let withdrawalMode = userBebitReq[index].withdrawalMode;
        let reqDate = userBebitReq[index].reqDate;
        let user = userBebitReq[index].userId;
        let rowId = userBebitReq[index]._id;
        let userKi = mongoose.mongo.ObjectId(user);

        userIdArray.push(userKi);
        debitArray[userKi] = {
          username : userBebitReq[index].username,
          rowId: rowId,
          userId: userKi,
          reqAmount: reqAmount,
          withdrawalMode: withdrawalMode,
          reqDate: reqDate,
          mobile: userBebitReq[index].mobile,
          reqTime: userBebitReq[index].reqTime,
          reqUpdatedAt: userBebitReq[index].reqUpdatedAt
        };
      }

      let user_Profile = await userProfile.find({ userId: { $in: userIdArray } });

      for (index in user_Profile) {
        let id = user_Profile[index].userId;
        if (debitArray[id]) {
          debitArray[id].address = user_Profile[index].address;
          debitArray[id].city = user_Profile[index].city;
          debitArray[id].pincode = user_Profile[index].pincode;
          debitArray[id].name = user_Profile[index].account_holder_name;
          debitArray[id].account_no = user_Profile[index].account_no;
          debitArray[id].bank_name = user_Profile[index].bank_name;
          debitArray[id].ifsc = user_Profile[index].ifsc_code;
          debitArray[id].paytm_number = user_Profile[index].paytm_number;
        }
      }

      res.json({ approvedData: debitArray });
  } catch (e) {
    res.json({ message: e });
  }
});

router.get("/bankManual_ajax", session, permission, async (req, res) => {
    try {
        const date_cust = req.query.date_cust;
        const dateFormat = moment(date_cust, "MM/DD/YYYY").format("DD/MM/YYYY");
        const report = await fundReq.find({
              reqDate: dateFormat,
              reqStatus: "Approved",
              reqType: "Debit",
              withdrawalMode: "Bank",
              fromExport : false,
              from : 2
        });
        res.json({ approvedData: report });
    } catch (e) {
      res.json({ message: e });
    }
});

//Declined Reports Route
router.get("/declined", session, permission, async (req, res) => {
  try {
    const dt = dateTime.create();
    let date = dt.format("d/m/Y");
    const report = await fundReq.find({
      reqDate: date,
      reqType: "Debit",
      reqStatus: "Declined"
    });
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["decDebit"].showStatus;
    if (check === 1) {
      res.render("dashboard/declinedReports", {
        data: report,
        userInfo: userInfo,
        permission: permissionArray,
        title: "Declined Report"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/declined_ajax", session, async (req, res) => {
  try {
    const date_cust = req.query.date_cust;
    const dateFormat = moment(date_cust, "MM/DD/YYYY").format("DD/MM/YYYY");

    const report = await fundReq.find({
      reqStatus: "Declined",
      reqType: "Debit",
      reqDate: dateFormat
    });
    res.json({ approvedData: report });
  } catch (e) {
    res.json({ message: e });
  }
});

router.post("/updateUpi", session, async (req, res) => {
  try {
    const rowId = req.query.rowId;
    const dt = dateTime.create();
    let date = dt.format("d/m/Y I:M:S");

    const udpate = await UPIlist.updateOne({_id : rowId},{
      $set  :{
        updateAt : date,
        reqStatus  :"Approved"
      }
    })

    res.json({
      status : 1,
      message : "Req Updated Successfully",
      id : rowId
     });

  }catch (e) {
    res.json({ 
      status : 0,
      message : "Something Bad Happened, Contact Support"
    });
  }
});

module.exports = router;