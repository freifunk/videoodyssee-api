require('dotenv').config();
const router = require('express').Router();
const funcs = require("../utils/funcs");
const db = require("../db/db");



router.post('/trigger', async (req, res, next) => {
    try {
        const {
            title,
            subtitle,
            persons,
            tags,
            event,
            language,
            date,
            url,
            name,
            email,
            link,
            description
        } = req.body;

        if (!title || !event || !language || !date || !url || !name || !email)
            throw { err_message: "Missing some required fields !", err_code: 406 }
        req.body.status = "pending";
        video = await db.Video.create(req.body);
        const response = await funcs.triggerPipeline(video.dataValues);
        if (response.status != 202)
            throw { err_message: response.data.message, err_code: response.status }
        funcs.sendSuccess(res, response.data.message, 202);
    }
    catch (err) {
        next(err);
    }
})


module.exports = router; 