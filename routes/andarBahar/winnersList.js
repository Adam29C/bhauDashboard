const router = require('express').Router();
const session = require('../session');

router.get('/:resultData', session, async (req, res) => {

    const resultDigit = req.query.digit;


    
});
module.exports = router;