const FundRequest = require("../../model/API/FundRequest");
const Users = require("../../model/API/Users");
const manualPayment = require("../../model/manualPayment");
const router = require("express").Router();
const dateTime = require("node-datetime");
const wallet_history = require("../../model/wallet_history");
const moment = require("moment");
const notification = require("../helpersModule/creditDebitNotification");

router.get("/getManualPaymentList", async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).send({
        statusCode: 400,
        status: "Failure",
        msg: "Status is required",
      });
    }
    let manualPaymentList = await manualPayment.find({
      status: status.toLowerCase(),
    });
    let finalArr = [];
    for (let manualDetails of manualPaymentList) {
      let createDate = moment(manualDetails.createTime).format(
        "DD-MM-YYYY, h:mm:ss a"
      );
      let updateDate = moment(manualDetails.updatedTime).format(
        "DD-MM-YYYY, h:mm:ss a"
      );
      finalArr.push({
        _id:manualDetails._id,
        status:manualDetails.status,
        userId:manualDetails.userId,
        upiId:manualDetails.upiId,
        amount:manualDetails.amount,
        utrNumber:manualDetails.utrNumber,
        imageUrl:manualDetails.imageUrl,
        userName:manualDetails.userName,
        mobileNumber:manualDetails.mobileNumber,
        createdAt:createDate,
        updatedAt:updateDate,
      });
    }
    res.status(200).json({
      statusCode: 200,
      status: "Success",
      data: finalArr,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      status: "Failure",
      msg: error.toString(),
    });
  }
});

router.patch("/approveManualPayment", async (req, res) => {
  try {
    const { id } = req.body;
    let manualPaymentDetails = await manualPayment.findById(id);
    if (!manualPaymentDetails) {
      return res.status(404).json({
        statusCode: 404,
        status: "Failure",
        msg: "Manual Payment Details Not Found",
      });
    }
    let userDetails = await Users.findById(manualPaymentDetails.userId);
    if (!userDetails) {
      return res.status(404).json({
        statusCode: 404,
        status: "Failure",
        msg: "User Details Not Found",
      });
    }

    const dt = dateTime.create();
    const formatted = dt.format("d/m/Y");
    const time = dt.format("I:M:S p");
    const ts = moment(formatted, "DD/MM/YYYY").unix();

    const addReq = new FundRequest({
      userId: manualPaymentDetails.userId,
      reqAmount: manualPaymentDetails.amount,
      fullname: userDetails.name,
      username: userDetails.username,
      mobile: userDetails.mobile,
      reqType: "Credit",
      reqStatus: "Approved",
      reqDate: formatted,
      reqTime: time,
      withdrawalMode: "manualPayment",
      reqUpdatedAt: `${formatted} ${time}`,
      fromExport: false,
      from: 1,
      timestamp: ts,
    });

    const saveId = await addReq.save();

    const update_bal =
      userDetails.wallet_balance + parseInt(manualPaymentDetails.amount);
    await Users.updateOne(
      { _id: manualPaymentDetails.userId },
      {
        $set: {
          wallet_balance: update_bal,
          wallet_bal_updated_at: `${formatted} ${time}`,
        },
      }
    );

    const timestamp = moment(formatted, "DD/MM/YYYY").unix();

    const history = new wallet_history({
      userId: manualPaymentDetails.userId,
      bidId: saveId._id,
      filterType: 4,
      previous_amount: userDetails.wallet_balance,
      current_amount: update_bal,
      transaction_amount: parseInt(manualPaymentDetails.amount),
      description: `${manualPaymentDetails.amount}/rs Approve By Manual Deposit Slip🥳`,
      transaction_date: formatted,
      transaction_time: time,
      transaction_status: "Success",
      particular: "paymentManual",
      upiId: "null",
      timestamp,
      username: userDetails.username,
      reqType: "Credit",
      addedBy_name: "admin",
      mobile: userDetails.mobile,
      transaction_id:manualPaymentDetails.utrNumber
    });

    await history.save();

    await manualPayment.findByIdAndUpdate(id, { status: "approve" });

    const userToken = [userDetails.firebaseId];
    const body = `Hello ${userDetails.username}`;
    const title = `${manualPaymentDetails.amount} rs deposit request is approved ✅`;
    notification(userToken, title, body);

    res.status(200).json({
      statusCode: 200,
      status: "Success",
      message: "Manual Payment successfully updated",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      status: "Failure",
      msg: error.message || "Internal Server Error",
    });
  }
});

router.patch("/declineManualPayment", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({
        statusCode: 400,
        status: "Failure",
        msg: "id's Required",
      });
    }
    let manualPaymentDetails = await manualPayment.findOne({ _id: id });
    if (!manualPaymentDetails) {
      return res.status(400).send({
        statusCode: 400,
        status: "Failure",
        msg: "Manual Payment Details Not Found",
      });
    }
    let userDetails = await Users.findOne({ _id: manualPaymentDetails.userId });
    if (!userDetails) {
      return res.status(400).send({
        statusCode: 400,
        status: "Failure",
        msg: "User Details Not Found",
      });
    }
    await manualPayment.findOneAndUpdate({ _id: id }, { status: "decline" });
    let userToken = [];
    userToken.push(userDetails.firebaseId);
    let body = `Hello ${userDetails.username}`;
    let title = `Your deposit request is cancelled due to invalid details ❎`;
    notification(userToken, title, body);

    res.status(200).json({
      statusCode: 200,
      status: "Success",
      message: "Manual Payment successfully update",
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      status: "Failure",
      msg: error.toString(),
    });
  }
});

module.exports = router;
