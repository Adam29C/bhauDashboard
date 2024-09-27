const jwt = require('jsonwebtoken');
const user = require('../../model/API/Users');

module.exports = async function (req, res, next) {
    try{
        const token = req.header('auth-token');
        const device_id = req.header('Authorization');
        const findUser = await user.findOne({deviceId : device_id})
        if(findUser){
            if (!token){
                return res.status(200).json({
                    status: 0,
                    message: 'Access Denied'
                });
            }
            try {
                const verified = jwt.verify(token, process.env.jsonSecretToken);
                req.user = verified;
                next();
            }
            catch(e) {
                res.status(200).json({
                    status: 55,
                    message: 'Invalid Token or Token Expire',
                    error  : e
                });
            }
        }else{
            res.status(200).json({
                status: 2,
                message: 'User Or Device Not Found'
            });
        }
    } catch (error) {
        res.status(200).json({
            status: 0,
            message: 'Something Happened Contact Support',
            error  : error
        });
    }
};