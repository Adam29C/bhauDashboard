const router = require("express").Router();
const Razorpay = require("razorpay");
const paymantModel = require("../../../model/payments/paymentModel");
const User = require("../../../model/API/Users");
const paymentModel = require("../../../model/payments/paymentModel");
const history = require("../../../model/wallet_history");
const onlineTransaction = require("../../../model/onlineTransaction");
const dateTime = require("node-datetime");
const moment = require("moment");
// This razorpayInstance will be used to
// access any resource from razorpay
const client_url = process.env.RAZORPAY_CLIENT;
const razorpayInstance = new Razorpay({
  // Replace with your key_id
  key_id: process.env.RAZORPAY_KEY_ID_PROD, //Prod
  key_secret: process.env.RAZORPAY_KEY_SECRET_PROD //Prod
});


const createOrderRazor = async (req, res, next) => {
  try {
    const { amount, currency, userId } = req.body;

    if (!userId) {
      return res.send({
        status: false,
        message: "userId is missing!",
      });
    }

    const userData = await User.findOne({ _id: userId });

    if (!userData) {
      return res.json({ status: false, message: "User not found!" });
    }

    if (!amount || !currency) {
      return res.send({
        status: false,
        message: "amount or currency is missing!",
      });
    }

    const promise = new Promise((resolve, reject) => {
      razorpayInstance.orders.create(
        { amount: amount * 100 /*Convert Rupee to Paise*/, currency: currency },
        (err, order) => {
          if (!err) resolve(order);
          else reject(err);
        }
      );
    });

    promise
      .then(async (order) => {
        const orderObj = {
          amount: order.amount / 100,
          amount_due: order.amount_due / 100,
          amount_paid: order.amount_paid,
          attempts: order.attempts,
          created_at: order.created_at,
          currency: order.currency,
          entity: order.entity,
          order_id: order.id,
          notes: order.notes,
          offer_id: order.offer_id,
          receipt: order.receipt,
          status: order.status,
          user_id: userId,
          payment_gateway: "razorpay",
          contact: userData.mobile,
          email: userData.email ? userData.email : "",
          name: userData.name,
        };

        const paymentInstance = new paymantModel(orderObj);

        await paymentInstance.save();

        return res.json({
          status: true,
          data: paymentInstance,
          paymentLink: client_url + order.id,
        });
      })
      .catch((err) => {
        return res.send({
          status: false,
          message: err.message,
        });
      });
  } catch (err) {
    res.send({
      status: false,
      message: err.message,
    });
  }
};

// const getPaymentOrders = async (req, res, next) => {
//   try {
//     const { userId, orderId, paymentMode } = req.body;
//     let amount = req.body.amount;
//     amount = Number(amount);
//     if (!userId || !orderId) {
//       return res.send({
//         status: false,
//         message: "userId or orderId is missing!",
//       });
//     }
//     const userData = await User.findOne({ _id: userId });
//     if (!userData) {
//       res.json({ status: false, message: "User not found!" });
//     }
//     const userPaymentOrders = await paymentModel.find({
//       user_id: userId,
//       order_id: orderId,
//       amount,
//       paymentMode,
//       status: "completed",
//       captured: true,
//     });
//     let wallet_balance = userData.wallet_balance;
//     const dt = dateTime.create();
//     const dateUpdate = dt.format("d/m/Y");
//     const time = dt.format("I:m:S p");
//     await User.updateOne(
//       {
//         _id: userId,
//       },
//       {
//         $set: {
//           wallet_balance: wallet_balance + amount,
//           wallet_bal_updated_at: dateUpdate + " " + time,
//         },
//       }
//     );
//     const point_history = new history({
//       userId: userId,
//       filterType: 4,
//       previous_amount: wallet_balance,
//       current_amount: wallet_balance + amount,
//       transaction_amount: amount,
//       description: 'Amount added to wallet',
//       transaction_date: dateUpdate,
//       transaction_time: time,
//       transaction_status: "Success",
//       transaction_id: orderId || "",
//       particular: paymentMode,
//       reqType: "Credit",
//       username: userData.username,
//       mobile: userData.mobile,
//     });
//     const date1 = moment().format("DD/MM/YYYY");
//     const dateUn = moment(date1, "DD/MM/YYYY").unix();
//     //Update Transactions
//     const transaction = new onlineTransaction({
//       fullname: userData.name,
//       username: userData.username,
//       mobile: userData.mobile,
//       reqAmount: amount,
//       reqType: 'Credit',
//       transaction_id: orderId || "",
//       reqStatus: 'Success',
//       timestamp: dateUn,
//       reqDate: date1 + " " + time,
//       reqDescription: `Paid via ${paymentMode}`,
//       mode: paymentMode,
//       userId: userId,
//       reqStatus: 0
//     })
//     await transaction.save();
//     await point_history.save();
//     return res.json({
//       status: true,
//       data: userPaymentOrders,
//       message:"Amount credit successfully"
//     });
//   } catch (error) {
//     res.send({
//       status: false,
//       message: err.message,
//     });
//   }
// };

const getPaymentOrders = async (req, res, next) => {
  try {
    const { userId, orderId, paymentMode, amount } = req.body;
    if (!userId || !orderId) {
      return res.send({
        status: false,
        message: "userId or orderId is missing!",
      });
    }
    const userData = await User.findOne({ _id: userId });
    if (!userData) {
      res.json({ status: false, message: "User not found!" });
    }
    // const userPaymentOrders = await paymentModel.find({
    //   user_id: userId,
    //   order_id: orderId,
    //   amount,
    //   paymentMode,
    //   status: "completed",
    //   captured: true,
    // });
    let wallet_balance = userData.wallet_balance;
    const dt = dateTime.create();
    const dateUpdate = dt.format("d/m/Y");
    const time = dt.format("I:m:S p");
    await User.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          wallet_balance: wallet_balance + amount,
          wallet_bal_updated_at: dateUpdate + " " + time,
        },
      }
    );
    let upiNumber=null;
    if(paymentMode.toUpperCase()==="UPI"){
      let upiDetails = await upiId.findOne({is_Active:true},{UPI_ID:1});
      upiNumber = upiDetails.UPI_ID;
    }
    const date2 = moment().format("DD/MM/YYYY");
    let timestamp = moment(date2, "DD/MM/YYYY").unix();
    const point_history = new history({
      userId: userId,
      filterType: 4,
      previous_amount: wallet_balance,
      current_amount: wallet_balance + amount,
      transaction_amount: amount,
      description: 'Amount added to wallet',
      transaction_date: dateUpdate,
      transaction_time: time,
      transaction_status: "Success",
      transaction_id: orderId || "",
      particular: paymentMode,
      upiId:upiNumber,
      timestamp:timestamp,
      reqType: "Credit",
      username: userData.username,
      mobile: userData.mobile,
      fullname:userData.name,
      addedBy_name:"By self"
    });
    const date1 = moment().format("DD/MM/YYYY");
    const dateUn = moment(date1, "DD/MM/YYYY").unix();
    //Update Transactions
    const transaction = new onlineTransaction({
      fullname: userData.name,
      username: userData.username,
      mobile: userData.mobile,
      reqAmount: amount,
      reqType: 'Credit',
      transaction_id: orderId || "",
      reqStatus: 'Success',
      timestamp: dateUn,
      reqDate: date1 + " " + time,
      reqDescription: `Paid via ${paymentMode}`,
      mode: paymentMode,
      userId: userId,
      reqStatus: 0
    })
    await transaction.save();
    await point_history.save();
    return res.json({
      status: true,
      data: "Payment successfully add",
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const updatePaymentOrder = async (req, res, next) => {
  try {
    const { razorpay_order_id, ...keys } = req.body;
    const userPaymentOrders = await paymentModel.findOne({
      order_id: razorpay_order_id,
    });
    if (!userPaymentOrders) {
      return res.json({
        status: false,
        message: "order_id is missing!",
      });
    }

    if(userPaymentOrders.captured){
      return res.json({
        status: false,
        message: "order already captured!",
      });
    }
    // update order
    await paymentModel.updateOne(
      {
        order_id: razorpay_order_id,
      },
      {
        $set: {
          status: "completed",
          captured: true,
          amount_paid: userPaymentOrders.amount,
          ...keys,
        },
      }
    );

  
    const dt = dateTime.create();
    const dateUpdate = dt.format("d/m/Y");
    const time = dt.format("I:M:S p");

    //Update user wallet
    let wallet_balance;
    const user = await User.findOne({ _id: userPaymentOrders.user_id });
    if (user) {
       wallet_balance = user.wallet_balance;
      await User.updateOne(
        {
          _id: userPaymentOrders.user_id,
        },
        {
          $set: {
            wallet_balance: user.wallet_balance + userPaymentOrders.amount,
            wallet_bal_updated_at: dateUpdate + " " + time,
          },
        }
      );
    }

    // update wallet history
    const point_history = new history({
      userId: userPaymentOrders.user_id,
      // bidId : "",
      filterType : 4,
      previous_amount: wallet_balance,
      current_amount:  user.wallet_balance + userPaymentOrders.amount,
      transaction_amount:  userPaymentOrders.amount,
      description: 'Amount added to wallet',
      transaction_date: dateUpdate,
      transaction_time: time,
      transaction_status: "Success",
      transaction_id: req.body.razorpay_payment_id || "",
      // admin_id: "",
      // addedBy_name: "",
      particular: "razorpay",
      reqType: "Credit",
      username: user.username,
      mobile: user.mobile,
    });


    const date1 = moment().format("DD/MM/YYYY");
		const dateUn = moment(date1, "DD/MM/YYYY").unix();

    //Update Transactions
    const transaction = new onlineTransaction({
      fullname:user.name,
      username: user.username,
      mobile: user.mobile,
      reqAmount: userPaymentOrders.amount,
      reqType:'Credit',
      transaction_id: req.body.razorpay_payment_id || "",
      reqStatus:'Success',
      timestamp:dateUn,
      reqDate:date1+" "+time,
      reqDescription:'Paid via Razorpay',
      mode:'razorpay',
      userId:userPaymentOrders.user_id,
      reqStatus:0
    })
    await transaction.save();
    await point_history.save();
 
    return res.json({
      status: true,
      message: "order updated!",
    });
  } catch (err) {
    return res.json({
      status: false,
      message: err.message,
    });
  }
};

const getPaymentOrderDetails = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.send({
        status: false,
        message: "orderId is missing!",
      });
    }

    const userPaymentOrders = await paymentModel.findOne(
      { order_id: order_id },
      {
        contact: 1,
        email: 1,
        name: 1,
      }
    );

    if (!userPaymentOrders) {
      return res.send({
        status: false,
        message: "order not found!",
      });
    }

    return res.json({
      status: true,
      data: userPaymentOrders,
    });
  } catch (err) {
    return res.json({
      status: false,
      message: err.message,
    });
  }
};

router.post("/createPaymentOrder", createOrderRazor);
router.post("/getPaymentOrders", getPaymentOrders);
router.post("/updatePaymentOrder", updatePaymentOrder);
router.post("/getPaymentOrderDetails", getPaymentOrderDetails);

module.exports = router;
