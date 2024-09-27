const fundReq = require('../../model/API/FundRequest');
const users = require('../../model/API/Users');
const dateTime = require('node-datetime');
const messaging = require("../../firebase")
module.exports = async function (data) {
    try {
        if (process.env.pm_id == '0') {
            const dt = dateTime.create();
            const reqDate = dt.format('d/m/Y');
            const userId = await fundReq.find({ reqStatus: "Declined", reqDate: reqDate }, { userId: 1, reqStatus: 1, reqType: 1, reqAmount: 1, username: 1 });

            if (userId) {
                for (index in userId) {
                    let id = userId[index].userId
                    let userFirebase = await users.findOne({ _id: id, mainNotification: true }, { firebaseId: 1 });
                    let token = userFirebase.firebaseId;

                    let body = `Your ${userId[index].reqType} Request Of Rs ${userId[index].reqAmount}/- Is Auto Expired`;
                    let message = {
                        android: {
                            priority: 'high',
                        },
                        data: {
                            title: "Credit/Debit Request Notification",
                            body: body,
                            icon: 'ic_launcher',
                            type: 'Wallet',
                        },
                        token: token,
                    };
                    try {
                        const response = await messaging.send(message);
                        console.log('Successfully sent message:', response);
                    } catch (error) {
                        if (error.code === 'messaging/registration-token-not-registered') {
                            console.error('Token is not registered. Removing from database.');
                        } else {
                            console.error('Error sending message:', error);
                        }
                    }
                }
            }
        }
    }
    catch (e) {
        return e;
    }
};