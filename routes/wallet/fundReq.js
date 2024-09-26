const router = require("express").Router();
const User = require("../../model/API/Users");
const fundReq = require("../../model/API/FundRequest");
const Userprofile = require("../../model/API/Profile");
const wallet_hstry = require("../../model/wallet_history");
const permission = require("../helpersModule/permission");
const session = require("../helpersModule/session");
const bank = require("../../model/bank");
const dateTime = require("node-datetime");
const notification = require("../helpersModule/creditDebitNotification");

router.get("/", session, permission, async (req, res) => {
  const dt = dateTime.create();
  const formatted = dt.format("d/m/Y");
  const pendingCredit = await fundReq
    .find({ reqStatus: "Pending", reqType: "Debit", reqDate: formatted })
    .sort({ _id: -1 });
  const bankList = await bank.find();
  const userInfo = req.session.details;
  const permissionArray = req.view;
  const check = permissionArray["fundRequest"].showStatus;
  if (check === 1) {
    res.render("./wallet/fundRequest", {
      data: pendingCredit,
      userInfo: userInfo,
      permission: permissionArray,
      bankList: bankList,
      title: "Fund Request"
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard"
    });
  }
});

router.get("/pendingBank", session, permission, async (req, res) => {
  const dt = dateTime.create();
  const formatted = dt.format("d/m/Y");
  const pendingCredit = await fundReq
    .find({ reqStatus: "Pending", reqType: "Debit",withdrawalMode: "Bank", reqDate: formatted })
    .sort({ _id: -1 });

  const userInfo = req.session.details;
  const permissionArray = req.view;

  const check = permissionArray["fundRequest"].showStatus;
  if (check === 1) {
    res.render("./wallet/pendingDebit", {
      data: pendingCredit,
      userInfo: userInfo,
      permission: permissionArray,
      title: "Pending Request(Bank)"
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard"
    });
  }
});

router.get("/pendingPaytm", session, permission, async (req, res) => {
  const dt = dateTime.create();
  const formatted = dt.format("d/m/Y");
  const pendingCredit = await fundReq
    .find({ reqStatus: "Pending", reqType: "Debit",withdrawalMode: "Paytm", reqDate: formatted })
    .sort({ _id: -1 });

  const userInfo = req.session.details;
  const permissionArray = req.view;

  const check = permissionArray["fundRequest"].showStatus;
  if (check === 1) {
    res.render("./wallet/pendingPaytm", {
      data: pendingCredit,
      userInfo: userInfo,
      permission: permissionArray,
      title: "Pending Request(Paytm)"
    });
  } else {
    res.render("./dashboard/starterPage", {
      userInfo: userInfo,
      permission: permissionArray,
      title: "Dashboard"
    });
  }
});

router.get("/other", session, async (req, res) => {
  try {
    const data = req.query.data;
    const dt = dateTime.create();
    const formatted = dt.format("d/m/Y");

    //Changes by dev removed { from : 2} from all queries
    if (data == "pendingDebit") {
      const pendingDebit = await fundReq
        .find({ reqStatus: "Pending", reqType: "Debit", reqDate: formatted  })
        .sort({ _id: -1 });
      res.json(pendingDebit);
    } else if (data == "approvedDebit") {
      const approvedDebit = await fundReq
        .find({ reqStatus: "Approved", reqType: "Debit", reqDate: formatted})
        .sort({ _id: -1 });

      res.json(approvedDebit);
    } else if (data == "declinedDebit") {
      const declinedDebit = await fundReq
        .find({ reqStatus: "Declined", reqType: "Debit", reqDate: formatted})
        .sort({ _id: -1 });
      res.json(declinedDebit);
    } else if (data == "completed") {
      const completed = await fundReq
        .find({ reqStatus: "Approved", reqDate: formatted })
        .sort({ _id: -1 })
        .limit(100);
      res.json(completed);
    }
  } catch (error) {
    res.json(error);
  }
});

router.post("/updateWallet/:id", session, async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findOne({ _id: userId });

    const id = req.params.id;
    const rowId = req.body.rowId;
    const bal = req.body.amount;

    const userInfo = req.session.details;
    const admin_id = userInfo.user_id;
    const adminName = userInfo.username;

    const username = user.username;
    const wallet_bal = user.wallet_balance;
    const firebaseToken = user.firebaseId;
    const mobile = user.mobile;

    let update_bal = 0;
    let detail;
    let particular = req.body.particular;
    let reqType;

    const dt = dateTime.create();
    const formatted = dt.format("d/m/Y");
    const dt56 = dateTime.create();
    const time = dt56.format("I:M:S p");
    const updateTime = formatted + " " + time;
    let title;
    let body;
    if (id == 1) {
      update_bal = wallet_bal + parseInt(bal);
      detail = "Amount Added To Wallet By " + adminName;
      particular = particular;
      reqType = "Credit";
      filter = 4
      title = `Your Credit Request Of Rs. ${bal} is Approved`;
      body = "Wallet Notification";
    }
    if (id == 2) {
      update_bal = wallet_bal - parseInt(bal);
      detail = "Amount Withdrawn From Wallet By " + adminName;
      particular = particular;
      reqType = "Debit";
      filter = 5
      title = `Your Debit (Withdrawal) Request Of Rs.${parseInt(bal)}/- is Approved ✔️🤑💰`;
	    body = `Hello ${username} 🤩🤩`;
    }
    await User.updateOne(
      { _id: userId },
      {
        $set: { wallet_balance: update_bal, wallet_bal_updated_at: updateTime }
      }
    );

    await fundReq.updateOne(
      { _id: rowId },
      {
        $set: {
          reqStatus: "Approved",
          reqUpdatedAt: updateTime,
          UpdatedBy: adminName,
          adminId: admin_id,
          fromExport : false,
          from: 2
        }
      }
    );

    const history = new wallet_hstry({
      userId: userId,
      bidId: rowId,
      filterType: filter,
      previous_amount: wallet_bal,
      current_amount: update_bal,
      transaction_amount: parseInt(bal),
      transaction_time: time,
      description: detail,
      transaction_date: formatted,
      transaction_status: "Success",
      admin_id: admin_id,
      addedBy_name: adminName,
      particular: particular,
      reqType: reqType,
      username: username,
      mobile: mobile
    });

    await history.save();
    let userToken = [];
    userToken.push(firebaseToken);
    notification(userToken, title, body);

    res.json({
      status: 1,
      message: "Points Added Successfully"
    });
  } catch (e) {
    res.json({ message: e });
  }
});

router.patch("/decline", session, async (req, res) => {
  const dt = dateTime.create();
  const formatted = dt.format("d/m/Y I:M:S");
  const rowId = req.body.rowId;
  const userInfo = req.session.details;
  const adminId = userInfo.user_id;
  const adminName = userInfo.username;
  try {
    const updateDecline = await fundReq.findOneAndUpdate(
      { _id: rowId },
      {
        $set: {
          reqStatus: "Declined",
          reqUpdatedAt: formatted,
          UpdatedBy: adminName,
          adminId: adminId
        }
      },
      { returnOriginal: false }
    );
    res.json(updateDecline);
  } catch (e) {
    res.json({ message: e });
  }
});

router.get("/getProfile", session, async (req, res) => {
  try {
    const id = req.query.userId;
    const userprofile = await Userprofile.findOne({ userId: id });
    if (userprofile) {
      const user = await User.findOne({ _id: id });
      const userData = {
        userData1: user,
        userData2: userprofile
      };
      res.json({
        status: 1,
        data: userData
      });
    } else {
      res.json({
        status: 0,
        message: "Profile Not Filled By User"
      });
    }
  } catch (e) {
    res.json(e);
  }
});

router.post("/getBal", session, async (req, res) => {
  try {
    const user_id = req.body.id;
    const userbal = await User.findOne({ _id: user_id }, { username: 1, wallet_balance: 1, _id: 0 })
    // const paytmNumebr = await Userprofile.findOne({ userId: user_id },{paytm_number : 1});
    let data = {
      username: userbal.username,
      wallet_balance: userbal.wallet_balance
    }
    res.json({
      data,
      number: "9876543210"
    });
  }
  catch (e) {
    res.json({ message: e });
  }
});

module.exports = router;