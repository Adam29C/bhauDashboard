const paymentMode = require("../../model/payment_additional/addPaymentModel");
const router = require("express").Router();
const UPI_ID = require("../../model/upi_ids");
const PaymentModes = require("../../model/payments/pamentModeModel");
//Adding then Payment gateway
router.post("/addGateway", async (req, res) => {
  try {
    const { gatewayName } = req.body;
    const existingPaymentMode = await paymentMode.findOne({
      gatewayName: gatewayName,
    });
    if (existingPaymentMode) {
      return res.status(400).send({
        message: "Payment mode with the same name already exists",
      });
    }
    const newPaymentMode = new paymentMode({
      gatewayName: gatewayName,
    });
    const savedPaymentMode = await newPaymentMode.save();
    if (savedPaymentMode) {
      return res.status(200).send({
        message: "Payment mode added successfully",
        data: savedPaymentMode,
      });
    } else {
      return res.status(500).send({
        message: "Failed to add payment mode",
      });
    }
  } catch (error) {
    return res.status(400).send({
      status: 0,
      error: error.message,
    });
  }
});
//Find the payment gateway by Name
router.get("/findGatewayByName", async (req, res) => {
  try {
    const { gatewayName } = req.body;
    const findGateway = await paymentMode.findOne({ gatewayName: gatewayName });
    if (findGateway) {
      res.status(200).send({
        message: "Payment mode found",
        data: findGateway,
      });
    } else {
      res.status(404).send({
        message: "Payment mode not found",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Failed to find payment mode",
      error: error.message,
    });
  }
});
//Get UpiId
router.get("/getUpiId", async (req, res) => {
  try {
    const findUpi = await UPI_ID.findOne({ is_Active: true });
    if (findUpi) {
      res.status(200).send({
        message: "Upi Id show successfully",
        data: findUpi,
      });
    } else {
      res.status(200).send({
        message: "No Upi Is Active",
        data: [],
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Something went wrong",
      error: error.message,
    });
  }
});
//Add Payment mode
// router.post("/addPaymentMode", async (req, res) => {
//   try {
//     const { paymentMode, paymentStatus } = req.body;
//     if (!paymentMode || !paymentStatus) {
//       res.status(400).send({
//         statusCode: 400,
//         message: "both field required",
//       });
//     }
//     // Check if any UPI ID is already active only when enabling a new one
//     if (paymentStatus == true) {
//       const findActiveUpi = await UPI_ID.findOne({ is_Active: true });
//       if (findActiveUpi) {
//         return res.json({
//           status: 0,
//           message:
//             "Another UPI ID is already active. Please deactivate it first.",
//         });
//       }
//     }
//     const payment = new PaymentModes({
//       paymentMode: paymentMode,
//       status: paymentStatus,
//     });
//     await payment.save();
//     // let payMentDetails = await PaymentModes.find();
//     res.status(200).send({
//       statusCode: 200,
//       message: "payment mode add successfully ",
//       data: payment,
//     });
//   } catch (error) {
//     res.status(500).send({
//       statusCode: 500,
//       message: "Something went wrong",
//       error: error.message,
//     });
//   }
// });
router.post("/addPaymentMode", async (req, res) => {
  try {
    const { paymentMode, paymentStatus } = req.body;
    if (!paymentMode || !paymentStatus) {
      res.status(400).send({
        statusCode: 400,
        message: "both field required",
      });
    }
    // Check if any UPI ID is already active only when enabling a new one
    // if (paymentStatus == "true") {
    //   const findActiveUpi = await UPI_ID.findOne({ is_Active: true });
    //   if (findActiveUpi) {
    //     return res.json({
    //       status: 0,
    //       message:
    //         "Another UPI ID is already active. Please deactivate it first.",
    //     });
    //   }
    // }

    if (paymentStatus == "active") {
      const findActivePaymentMode = await PaymentModes.findOne({
        status: "active",
      });
      if (findActivePaymentMode) {
        return res.json({
          status: 0,
          message:
            "Another PaymentMode is already active. Please disable it first.",
        });
      }
    }
    const payment = new PaymentModes({
      paymentMode: paymentMode,
      status: paymentStatus,
    });
    await payment.save();
    res.status(200).send({
      statusCode: 200,
      message: "payment mode add successfully ",
      data: payment,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
      error: error.message,
    });
  }
});
router.get("/listGateways", async (req, res) => {
  try {
    const paymentModes = await PaymentModes.find();
    if (paymentModes.length > 0) {
      res.status(200).send({
        message: "Payment modes retrieved successfully",
        data: paymentModes,
        status: true,
      });
    } else {
      res.status(404).send({
        message: "No payment modes found",
        status: false,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Failed to retrieve payment modes",
      error: error.message,
      status: false,
    });
  }
});
//Update Payment Mode
router.patch("/updatePaymentMode", async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id) {
      res.status(400).send({
        statusCode: 400,
        message: "id required",
      });
    }
    if (status == "active") {
      const findActiveUpi = await PaymentModes.findOne({ status: "active" });
      if (findActiveUpi) {
        return res.json({
          status: 0,
          message:
            "Another Payment mode is already active. Please deactivate it first.",
        });
      }
    }
    const findMode = await PaymentModes.findOne({ _id: id });
    if (!findMode) {
      res.status(404).send({
        statusCode: 404,
        message: "Payment mode not found",
      });
    }
    const paymentUpdate = await PaymentModes.updateOne(
      { _id: findMode._id },
      { $set: { status: status } }
    );
    res.status(200).send({
      statusCode: 200,
      message: "Payment mode updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
      error: error.message,
    });
  }
});

// router.delete("/deleteUpi", async (req, res) => {
//   try {
//     const { id } = req.body;
//     if (!id) {
//       return res.status(400).send({
//         statusCode: 400,
//         message: "id required",
//         status: 0,
//       });
//     }
//     let upiDetails = await UPI_ID.findOne({ _id: id });
//     if (!upiDetails) {
//       return res.status(400).send({
//         statusCode: 400,
//         message: "Upi details not found",
//         status: 0,
//       });
//     }
//     await UPI_ID.deleteOne({ _id: id });
//     let upiDetailsAfterDelete = await UPI_ID.find();
//     res.status(200).send({
//       statusCode: 200,
//       message: "Upi details delete successfully",
//       data: upiDetailsAfterDelete,
//       status: 1,
//     });
//   } catch (error) {
//     res.status(500).send({
//       statusCode: 500,
//       message: "Something went wrong",
//       error: error.message,
//       status: 0,
//     });
//   }
// });


//Get all payment Mode
// router.get("/getPaymentMode", async (req, res) => {
//     try {
//         let payMentDetails = await PaymentModes.findOne({ status: "active" });
//         if(!payMentDetails){
//             return res.status(400).send({
//                 statusCode: 400,
//                 message: 'Any Payment mode not active',
//                 data: {}
//             });
//         }
//         let data = {
//             payMentDetails
//         }
//         if (payMentDetails.paymentMode?.toUpperCase() === "UPI") {
//             let marchangeDetails = await UPI_ID.findOne({ is_Active: true });
//             data.marchangeDetails = marchangeDetails
//         }
//         res.status(200).send({
//             statusCode: 200,
//             message: "payment mode details show successfully",
//             data,
//         });
//     } catch (error) {
//         return res.status(500).send({
//             statusCode: 500,
//             message: 'Something went wrong',
//             error: error.message
//         });
//     }
// });

router.get("/getPaymentMode", async (req, res) => {
  try {
    let payMentDetails = await PaymentModes.findOne({ status: "active" });
    if (!payMentDetails) {
      return res.status(400).send({
        statusCode: 400,
        message: "Any Payment mode not active",
        data: {},
      });
    }
    let data = {
      payMentDetails,
    };
    if (payMentDetails.paymentMode?.toUpperCase() === "UPI") {
      let marchangeDetails = await UPI_ID.findOne({ is_Active: true });
      data.marchangeDetails = marchangeDetails;
    }
    res.status(200).send({
      statusCode: 200,
      message: "payment mode details show successfully",
      data,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
      error: error.message,
    });
  }
});
//Delete payment mode
router.delete("/deletePaymentMode/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).send({
        statusCode: 400,
        message: "id required",
      });
    }
    let paymentDelete = await PaymentModes.deleteOne({ _id: id });
    if (paymentDelete) {
      res.status(200).send({
        statusCode: 200,
        message: "Payment Mode Delete successfully!",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Something went wrong",
      error: error.message,
    });
  }
});
// router.delete("/deleteUpi", async (req, res) => {
//   try {
//     const { id } = req.body;
//     if (!id) {
//       return res.status(400).send({
//         statusCode: 400,
//         message: "id required",
//         status: 0,
//       });
//     }
//     let upiDetails = await UPI_ID.findOne({ _id: id });
//     if (!upiDetails) {
//       return res.status(400).send({
//         statusCode: 400,
//         message: "Upi details not found",
//         status: 0,
//       });
//     }
//     await UPI_ID.deleteOne({ _id: id });
//     let upiList = await UPI_ID.find();
//     res.status(200).send({
//       statusCode: 200,
//       message: "Upi details delete successfully",
//       data: upiList,
//       status: 1,
//     });
//   } catch (error) {
//     res.status(500).send({
//       statusCode: 500,
//       message: "Something went wrong",
//       error: error.message,
//       status: 0,
//     });
//   }
// });

router.delete("/deleteUpi", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({
        statusCode: 400,
        message: "id required",
        status: 0,
      });
    }
    let upiDetails = await UPI_ID.findOne({ _id: id });
    if (!upiDetails) {
      return res.status(400).send({
        statusCode: 400,
        message: "Upi details not found",
        status: 0,
      });
    }
    await UPI_ID.deleteOne({ _id: id });
    let upiDetailsAfterDelete = await UPI_ID.find();
    res.status(200).send({
      statusCode: 200,
      message: "Upi details delete successfully",
      data:upiDetailsAfterDelete,
      status: 1,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Something went wrong",
      error: error.message,
      status: 0,
    });
  }
});
module.exports = router;
