require('dotenv').config();
const router = require('express').Router();
const funcs = require("../utils/funcs");



router.post('/trigger', async (req, res, next) => {
    try {
        const response = await funcs.triggerPipeline(req.body);
        console.log(response.status);
        if (response.status != 202)
            throw {err_message:response.data.message,err_code:response.status}
        funcs.sendSuccess(res, response.data.message,202);
    }
    catch (err) {
        next(err);
    }
})


module.exports = router;
