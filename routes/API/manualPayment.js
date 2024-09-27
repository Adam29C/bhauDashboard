const Users = require("../../model/API/Users");
const manualPayment = require("../../model/manualPayment");
const router = require("express").Router();
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

router.post("/addManualPayment", async (req, res) => {
  try {
    const { userId, upiId, amount, utrNumber, base64Image } = req.body;
    if (!userId) {
      return res.status(200).send({
        statusCode: 200,
        code:1,
         status: "Failure",
        msg: "Id's required",
      });
    }
    let userDetails = await Users.findOne({ _id: userId });
    if (!userDetails) {
      return res.status(200).send({
        statusCode: 200, 
        code:1,
         status: "Failure",
        msg: "User Details Not Found",
      });
    }
    let paymentManual= await manualPayment.findOne({userId,status:"pending"});
    if(paymentManual){
      return res.status(200).send({
        statusCode: 200,
        code:1,
         status: "Failure",
        msg: "Your Previous Request Already Pending",
      });
    }

    let baseUrl = "";
    if (base64Image) {
      const buffer = Buffer.from(base64Image, "base64");
      const params = {
        Bucket: "bhau777bucket",
        Key: `uploads/manualPayment/${Date.now()}.jpg`,
        Body: buffer,
        ContentEncoding: "base64",
        ContentType: "image/jpeg",
      };
      let s3 = new S3Client({
        region: process.env.AWS_BUCKET_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
      const upload = new Upload({
        client: s3,
        params: params,
      });
      const data = await upload.done();
      baseUrl = data.Location;
    }
    let manual = await new manualPayment({
      userId: userId,
      status: "pending",
      upiId,
      amount,
      utrNumber,
      userName:userDetails.username,
      mobileNumber:userDetails.mobile,
      imageUrl: baseUrl,
    });
    await manual.save();
    res.status(200).json({
      statusCode: 200,
      code:0,
      status: "Success",
      message: "Request Add Successfully Wait for 30 Mins. We Will Verify Your Payment And Update",
    });
  } catch (error) {
console.log(error)
    return res.status(500).send({
      statusCode: 500,
      status: "Failure",
      msg: error.toString(),
    });
  }
});

router.get("/getManualPaymentList/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).send({
        statusCode: 400,
        status: "Failure",
        msg: "User Id is required",
      });
    }
    let userDetails = await Users.findOne({ _id: userId });
    if (!userDetails) {
      return res.status(500).send({
        statusCode: 500,
        status: "Failure",
        msg: "User Details Not Found",
      });
    }
    let manualPaymentList = await manualPayment.find({ userId });
    res.status(200).json({
      statusCode: 200,
      status: "Success",
      message: manualPaymentList,
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
