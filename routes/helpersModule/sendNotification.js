const user = require('../../model/API/Users');
const chunks = require('array.chunk');
const messaging = require("../../firebase");
module.exports = async function (req, res, sumDgit, uesrtoken) {
    try {
        const x = req.body.gameId;
        const str = req.body.providerId;
        let data = '';
        let name = '';
        if (str) { data = str.split("|"); name = data[1]; }
        let winningDigit = sumDgit;
        let title = '';
        let body = '';
        let token = uesrtoken;
        let notificationType = '';
        if (x == '1' || x == '2' || x == '3' || x == '4') {
            switch (x) {
                case '1':
                    token = await user.find({ banned: false, andarBaharNotification: true }, { firebaseId: 1, _id: 0 });
                    title = name;
                    body = winningDigit;
                    notificationType = "Result";
                    break;
                case '2':
                    token = await user.find({ banned: false, starLineNotification: true }, { firebaseId: 1, _id: 0 });;
                    title = name;
                    body = winningDigit;
                    notificationType = "Result";
                    break;
                case '3':
                    token = await user.find({ banned: false, gameNotification: true }, { firebaseId: 1, _id: 0 });;
                    title = name;
                    body = winningDigit;
                    notificationType = "Result";

                    break;
                case '4':
                    token = await user.find({ banned: false, mainNotification: true }, { firebaseId: 1, _id: 0 });
                    title = req.body.title;
                    body = req.body.message;
                    notificationType = "Notification";
                    break;
            }
            let length = token.length;
            console.log("if condition execute")
            if (length > 500) {
                let finalArr = token.map(token => token.firebaseId).filter(firebaseId => firebaseId !== "");
                let finalToken = chunks(finalArr, 500);
                let newLength = finalToken.length;
                for (j = 0; j < newLength; j++) {
                    let tokenArr = finalToken[j];
                    sendMutipalNotification(tokenArr, title, body, notificationType)
                }
            }
            else {
                const userToken = token.map(token => token.firebaseId);
                console.log("Else condition execute")
                sendMutipalNotification(userToken, title, body, notificationType)
            }
        } else {
            for (let i = 0; i < token.length; i++) {
                let priority = 'high'
                let message = {
                    android: {
                        priority: priority,
                    },
                    data: {
                        title: `🥳CONGRATS FOR ${winningDigit} GAME WIN 🎉`,
                        body: `${token[i].amount}/-rs Successfully Added To Your Wallet..`,
                        icon: 'ic_launcher',
                        type: 'Wallet',
                    },
                    token: token[i].firebaseId
                };
                try {
                    const response = await messaging.send(message);
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
    catch (e) {
        console.log(e)
        //    return e;
    }
};

const sendMutipalNotification = async (tokenArr, title, body, notificationType) => {
    let message = {
        android: {
            priority: 'high',
        },
        data: {
            title: title,
            body: body,
            icon: 'ic_launcher',
            type: notificationType,
        },
        tokens: tokenArr,
    };
    try {
        const response = await messaging.sendMulticast(message);
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`Failed to send to ${tokenArr[idx]}: ${resp.error}`);
                }
            });
        }
    } catch (error) {
        console.log('Error sending message:', error);
    }
}