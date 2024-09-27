//validation
const Joi = require('@hapi/joi');

const registerValidation = data =>{
    const schema ={
        name: Joi.string().min(3).required(),
        password: Joi.string().min(5).required(),
        username: Joi.string().min(5).required(),
        mobile: Joi.string().required(),
        firebaseId: Joi.string().required(),
        deviceName: Joi.string().required(),
        deviceId: Joi.string().required(),
        deviceVeriOTP: Joi.string().required(),
        register_via: Joi.string().required(),
        mpin: Joi.string().required()
    };
    return Joi.validate(data, schema);
};

const registerAdminValidation = data =>{
    const schema = {
        name: Joi.string().min(3).required(),
        password: Joi.string().min(5).required(),
        email: Joi.string().min(6).required().email(),
        username: Joi.string().min(5).required(),
        role: Joi.string().required(),
        mobile: Joi.string().required(),
        banned: Joi.number().required(),
        loginStatus: Joi.string().required(),
        last_login: Joi.string().required(),
        designation: Joi.string().required(),
        user_counter: Joi.string().required()
    };
    return Joi.validate(data, schema);
};

const loginValidation = data =>{
    const schema = {
        username: Joi.string().min(5).required(),
        password: Joi.string().min(5).required(),
        deviceId: Joi.string().min(2).required()
    };
    return Joi.validate(data, schema);
};

const loginValidationadmin = data =>{
    const schema ={
        user_username: Joi.string().min(5).required(),
        user_password: Joi.string().min(5).required(),
    };
    return Joi.validate(data, schema);
};

const bidsValidation = data =>{
    const schema = {
        userId: Joi.string().required(),
        providerId: Joi.string().required(),
        gameTypeId: Joi.string().required(),
        providerName: Joi.string().required(),
        gameTypeName: Joi.string().required(),
        gameTypePrice: Joi.string().required(),
        userName: Joi.number().required(),
        bidDigit: Joi.number().required(),
        biddingPoints: Joi.string().allow(''),
        gameSession: Joi.string().allow(''),
        winStatus:  Joi.string().required(),
        gameWinPoints:  Joi.string().required(),
        gameDate: Joi.string().allow(''),
        updatedAt: Joi.string().allow(''),
    };
    return Joi.validate(data, schema);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.bidsValidation = bidsValidation;
module.exports.registerAdminValidation = registerAdminValidation;
module.exports.loginValidationadmin = loginValidationadmin;