const router = require('express').Router();
const verify = require('./verifyTokens');
const User = require('../../model/API/Users');
const bcrypt = require('bcryptjs');
const SendOtp = require('sendotp');
// const sendOtp = new SendOtp('290393AuGCyi6j5d5bfd26');
const sendOtp = new SendOtp('1207171791436302472')

router.get('/', (req, res) => {
    res.json({
        status: 0,
        message: 'Access Denied'
    });
});

router.post('/', verify, async (req, res) => {
    try {
        let mobileNumber = req.body.mobile;
        const user = await User.findOne({ mobile: req.body.mobile });
        if (!user) res.status(200).send({
            status: 0,
            message: 'Invalid Mobile Number'
        });

        res.json(
            {
                status: 1,
                message: "Success",
                data: "data"
            });

        // sendOtp.send( mobileNumber, "DGAMES", function (error, data) {
        //     res.json(
        //         {
        //             status: 1,
        //             message: "Success",
        //             data: data
        //         });
        // });   
    } catch (error) {
        res.json({
            status: 0,
            message: "Something Bad Happened Please Contact Support",
            error: e
        });
    }
});

router.post('/setMpin', verify, async (req, res) => {
    const mobileNumber = req.body.mobile;
    const OTP = req.body.OTP;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.MPIN, salt);
    sendOtp.verify(mobileNumber, OTP, async function (error, data) {
        if (data.type == 'success') {
            try {
                const updateUser = await User.updateOne(
                    { deviceId: req.body.deviceId },
                    { $set: { mpin: hashedPassword, mpinOtp: req.body.OTP } });
                res.json({
                    status: 1,
                    message: 'MPIN Generated Successfully',
                    data: updateUser,
                    mpinGenerated: 1
                });
            }
            catch (e) {
                res.json({
                    status: 0,
                    message: "Something Bad Happened Please Contact Support",
                    error: e
                });;
            }
        }
        if (data.type == 'error') {
            res.json({ status: 0, message: "Failed", error: error, data: data });
        }
    });
});

// router.post('/changeMpin', verify, async (req, res)=>{

//     const user = await User.findOne({ _id: req.body.id });
//     if (!user) {
//         res.status(200).json({
//             status: 0,
//             message : "User Not Found"
//         });
//     }
//     else
//     {
//         const mpin = req.body.oldMpin;
//         const mobileNumber = req.body.mobile;
//         const OTP = req.body.OTP;
//         const validPass = await bcrypt.compare(mpin, user.mpin);
//         if (!validPass)
//         {
//             res.json({
//                 status: 0,
//                 message: "Old Mpin Not Matched", 
//             });
//         }
//         else {
//             const salt =  await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(req.body.newMpin, salt);
//             sendOtp.verify( mobileNumber, OTP, async function (error, data) {
//                 if(data.type == 'success') {
//                     try {

//                         await User.updateOne(
//                             { _id : req.body.id },
//                             { $set: { mpin: hashedPassword, mpinOtp: req.body.OTP } });

//                         res.status(200).json({
//                             status: 1,
//                             message: "MPIN Changed Successfully",
//                             mpinGenerated: 1
//                         });
//                     }
//                     catch (e) {
//                         res.status(400).json({
//                             status: 0,
//                             message: "Something Bad Happened Please Contact Support",
//                             error : e
//                         });
//                     }
//                 }
//                 if(data.type == 'error') res.json({status: 0,message: "Failed",data: data});
//             });
//         }   
//     }    
// });

router.post('/changeMpin', verify,async (req, res) => {
    const user = await User.findOne({ _id: req.body.id });
    if (!user) {
        res.status(200).json({
            status: 0,
            message: "User Not Found"
        });
    }
    const mpin = req.body.oldMpin;
    const mobileNumber = req.body.mobile;
    const validPass = await bcrypt.compare(mpin, user.mpin);
    if (!validPass) {
        res.json({
            status: 0,
            message: "Old Mpin Not Matched",
        });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newMpin, salt);
    await User.updateOne(
        { _id: req.body.id },
        { $set: { mpin: hashedPassword } });
    res.status(200).json({
        status: 1,
        message: "MPIN Changed Successfully",
        mpinGenerated: 1
    });

});

module.exports = router;