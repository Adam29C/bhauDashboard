const jwt = require('jsonwebtoken');

module.exports = function (req,res,next) {
    try
    {
        
        const token = req.header('auth-token');
        if (token == null){
            return res.json({
                status : 0,
                message : "Access Denied"
            });
        }
        else {
            jwt.verify(token, process.env.jsonSecretToken, function (err, decoded) {
                if (err) {
                    return res.json({
                        status : 55,
                        message : "Access Denied",
                        error: err
                    });
                } 
                else {
                    req.auth = decoded 
                    next()                        
                }
            });    
        }
    }
    catch (e) {
        
        res.status(400).json({
            status: 0,
            message: 'Invalid Token'
        });
    }
};