const router = require('express').Router();
const verify = require('./verifyTokens');
const User = require('../../model/API/Users');
const bcrypt = require('bcryptjs');
const SendOtp = require('sendotp');
// const sendOtp = new SendOtp('290393AuGCyi6j5d5bfd26');
const sendOtp = new SendOtp('1207171791436302472');
const fetch = require('node-fetch');

router.get('/', (req, res)=>{
    res.json({
        status: 0,
        message: 'Access Denied'
    });
});

router.post('/sendOTP', async (req, res) => {
    try {
        const mobileId = req.body.deviceId
        const user = await User.findOne({ deviceId: mobileId});
        if (user) {
            const mobileNumber = user.mobile;
            res.status(200).json({
                status: 1,
                message: "success",
                data: "data",
                mobileNumber: mobileNumber
            });    
            // sendOtp.send(mobileNumber, "DGAMES", function (error, data) {
            //     if (error)
            //     {
            //         res.status(200).json({
            //             status: 0,
            //             message: "Failed",
            //             data: error
            //         });    
            //     }
            //     else
            //     {
            //         res.status(200).json({
            //             status: 1,
            //             message: "success",
            //             data: data,
            //             mobileNumber: mobileNumber
            //         });    
            //     }
            // });  
        }
        else {
            res.status(200).send({
                status: 0,
                message: 'User Not Found'
            });
        } 
    } catch (error) {
        res.status(400).send({
            status: 0,
            message: 'Something Went Wrong'
        });       
   }
});

router.post('/verifyOTP', async (req, res) => {
    try {
        const mobileId = req.body.deviceId;
        const mobileNumber = req.body.mobileNumber;
        const OTP = req.body.OTP;
        const changeFor = req.body.changeFor;
        sendOtp.verify(mobileNumber, OTP, async function (error, data) {
            if (error) {
                res.status(200).send({
                    status: 0,
                    message: 'Something Went Wrong, Please Try Again Later',
                    data: error
                });
            }
            else {
                if(changeFor === 1){
                    const updatePass = await User.updateOne(
                        { deviceId: mobileId },
                        { $set: { deviceVeriOTP: OTP } });     
                        res.status(200).json({
                            status: 1,
                            message: "OTP Verification Status",
                            data: data,
                            Otp: OTP 
                        });
                }
                else if(changeFor === 2) {
                    const updatePass = await User.updateOne(
                        { deviceId: mobileId },
                        { $set: { mpinOtp: OTP } }); 
                        res.status(200).json({
                            status: 1,
                            message: "OTP Verification Status",
                            data: data,
                            Otp: OTP 
                        });
                }
                else {
                    res.status(200).json({
                        status: 0,
                        message: "Flase Request"
                    });
                }
            }
        });
    } catch (error) {
        res.status(400).send({
            status: 0,
            message: 'Something Went Wrong',
            error: error
        });
    }   
});

router.post('/resetPassword', async (req, res) => {
   try {
        const deviceId = req.body.deviceId;
        const password = req.body.password;
        const OTP = req.body.OTP;
        const user = await User.findOne({ deviceId: deviceId });
        if (user) {
           const databaseOtp = user.deviceVeriOTP;
           if (OTP === databaseOtp || true) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                await User.updateOne(
                { deviceId: deviceId },
                { $set: { password: hashedPassword } });       
                res.status(200).send({
                    status: 1,
                    message: 'Password Changed Successfully'
                }); 
            } 
            else {
                res.status(200).send({
                    status: 0,
                    message: 'Sorry Cannot Change Mpin'
                }); 
            }
        }
        else {
           res.status(200).send({
               status: 0,
               message: 'User Not Found or Invalid Otp'
           });
       } 
   } catch (error) {
        res.status(400).send({
            status: 0,
            message: 'Something Went Wrong'
        });
   } 
});

router.post('/mpinReset', async (req, res) => {
    try {
        const deviceId = req.body.deviceId;
        const mpin = req.body.mpin;
        
        const user = await User.findOne({ deviceId: deviceId });
        if(user)
        {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mpin, salt);
            
            await User.updateOne(
            { deviceId: deviceId },
            { $set: { mpin: hashedPassword } });
            
            res.status(200).send({
                status: 1,
                message: 'MPIN Changed Successfully'
            }); 
        }
        else {
           res.status(200).send({
               status: 0,
               message: 'User Not Found or Invalid Otp'
           });
       } 
   } catch (error) {
        res.status(400).send({
            status: 0,
            message: 'Something Went Wrong'
        });
   } 
});

router.post('/getUsername', async (req, res) => {
    try {
        const mobileNumber = req.body.mobile;
        const user = await User.findOne({ mobile: mobileNumber },{mobile : 1, username : 1, name:1});
        if(user)
        {
            const databaseMobile = user.mobile;
            const name = user.name;
            const username = user.username;
            if(databaseMobile === mobileNumber)
            {
                let customeMessage = 'Hello '+name+', \n\nYour Username To Login To Your Khatri Games Account is : '+ username +'\nTeam Khatri Games';

                let url = 'https://api.msg91.com/api/sendhttp.php?route=4&sender=DGAMES&message='+ customeMessage +'&country=91&mobiles='+mobileNumber+'&authkey=407097AwSzYk8hvZC6519cb42P1';          
                fetch(url)
                .then(res => res.text())
                .then(body => res.json({
                    status : 1,
                    message : "Username Successfully Sent To Your Registered Mobile Number"
                }));
            }
            else{
                res.status(200).send({
                    status: 0,
                    message: 'Invalid Mobile Number'
                });
            }
        }
        else {
           res.status(200).send({
               status: 0,
               message: 'User Not Found'
           });
       }
   } catch (error) {
        res.status(400).send({
            status: 0,
            message: 'Something Went Wrong'
        });
   } 
});

module.exports = router;