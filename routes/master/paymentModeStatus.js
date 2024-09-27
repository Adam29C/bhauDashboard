const paymentModeStatus = require("../../model/paymentModeStatus");
const router = require("express").Router();

router.post("/addPaymentModeStatus", async (req, res) => {
    try {
        const { modeName, status } = req.body;
        if (!modeName || !status) {
            return res.status(400).send({
                statusCode: 400,
                code: 1,
                status: "Failure",
                msg: "Details Is Require",
            });
        }
        let modeDetails = await paymentModeStatus.findOne({ modeName });
        if (modeDetails) {
            return res.status(400).send({
                statusCode: 400,
                code: 1,
                status: "Failure",
                msg: "Payment Status Mode Already add",
            });
        }
        const paymentMode = new paymentModeStatus({
            modeName, status
        })
        await paymentMode.save();
        return res.status(200).json({
            statusCode: 200,
            status: "Success",
            message: "Payment Status Mode Successfuly Add",
        });
    } catch (error) {
        return res.status(500).send({
            statusCode: 500,
            status: "Failure",
            msg: error.toString(),
        });
    }
})

router.patch("/updatePaymentModeStatus", async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).send({
                statusCode: 400,
                code: 1,
                status: "Failure",
                msg: "Details Is Require",
            });
        }
        let modeDetails = await paymentModeStatus.findOne({ _id: id });
        if (!modeDetails) {
            return res.status(400).send({
                statusCode: 400,
                code: 1,
                status: "Failure",
                msg: "Payment Status Mode Already add",
            });
        }
        await paymentModeStatus.updateOne({ _id: id }, {
            status
        });
        let modeUodateList = await paymentModeStatus.find();
        return res.status(200).json({
            statusCode: 200,
            status: "Success",
            message: modeUodateList,
        });
    } catch (error) {
        return res.status(500).send({
            statusCode: 500,
            status: "Failure",
            msg: error.toString(),
        });
    }
})


router.get("/getPaymentModeStatus", async (req, res) => {
    try {
        let modeUodateList = await paymentModeStatus.find();
        return res.status(200).json({
            statusCode: 200,
            status: "Success",
            data: modeUodateList,

        });
    } catch (error) {
        return res.status(500).send({
            statusCode: 500,
            status: "Failure",
            msg: error.toString(),
        });
    }
})

module.exports = router;