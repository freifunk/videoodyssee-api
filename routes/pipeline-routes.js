require('dotenv').config();
const router = require('express').Router();
const funcs = require("../utils/funcs");
const logger = require("../utils/logger");
const db = require("../db/db");



router.post('/trigger', async (req, res, next) => {
    try {
        logger.debug(`👥 Received persons: ${JSON.stringify(req.body.persons)}`);
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
        req.body.persons = req.body.persons.join(" ");
        req.body.tags = req.body.tags.join(" ");
        req.body.slug = await funcs.generateSlug(title);
        logger.info(`✅ Pipeline trigger processing successful for: ${title}`);
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