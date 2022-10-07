const router = require('express').Router();
const funcs = require("../utils/funcs");
const db = require("../db/db");




router.post('/list', async (req, res, next) => {
    try {
        // const {
          
        // } = req.body;
        videos = await db.Video.findAll();
        funcs.sendSuccess(res,videos,200);
    }
    catch (err) {
        next(err);
    }
})

router.post('/', async (req, res, next) => {
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
        req.body.persons = req.body.persons.join(" ");
        req.body.tags = req.body.tags.join(" ");
        req.body.status = "pending";
        video = await db.Video.create(req.body);
        funcs.sendSuccess(res,"Video submitted successfully !",200);
    }
    catch (err) {
        next(err);
    }
})



module.exports = router; 