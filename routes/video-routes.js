const router = require('express').Router();
const funcs = require("../utils/funcs");
const db = require("../db/db");
const video = require('../db/models/video');


router.post('/', async (req, res, next) => {
    try {
        const {
            title,
            subtitle,
            persons,
            tags,
            conference,
            language,
            date,
            url,
            name,
            email,
            link,
            description
        } = req.body;
        if (!title || !conference || !language || !date || !url || !name || !email)
            throw { err_message: "Missing some required fields !", err_code: 406 }
        req.body.persons = req.body.persons.join(" ");
        req.body.tags = req.body.tags.join(" ");
        req.body.status = "pending";
        let video = await db.Video.create(req.body);
        funcs.sendSuccess(res, "Video submitted successfully !", 200);
    }
    catch (err) {
        next(err);
    }
})

router.post('/list', async (req, res, next) => {
    try {
        // const {

        // } = req.body;
        videos = await db.Video.findAll({order: [['updatedAt' ,'DESC']] });
        funcs.sendSuccess(res, videos, 200);
    }
    catch (err) {
        next(err);
    }
})


router.post('/approve', async (req, res, next) => {
    try {
        const id = req.body.id;
        if (!id)
            throw { err_message: "Missing some required fields !", err_code: 404 }
        let video = await db.Video.findOne({ where: { id: id } });
        if (!video)
            throw { err_message: "Video not found", err_code: 404 }
        if (video.status !== "pending")
            throw { err_message: `Cannot approve already ${video.status} video !`, err_code: 406 }
        video.slug = await funcs.generateSlug(video.title);

        let response = await funcs.triggerPipeline(video.dataValues);
        if (response.status != 202)
            throw { err_message: response.data.message, err_code: response.status }
        video.status = "approved";
        await video.save();
        funcs.sendSuccess(res, response.data.message, 202);
    }
    catch (err) {
        next(err);
    }
})


router.post('/reject', async (req, res, next) => {
    try {
        const id = req.body.id;
        if (!id)
            throw { err_message: "Missing some required fields !", err_code: 404 }
        let video = await db.Video.findOne({ where: { id: id } });

        if (!video)
            throw { err_message: "Video not found", err_code: 404 }
        if (video.status !== "pending")
            throw { err_message: `Cannot reject already ${video.status} video !`, err_code: 406 }
        video.status = "rejected";
        await video.save();

        funcs.sendSuccess(res, "Rejected Video Sucessfully", 200);
    }
    catch (err) {
        next(err);
    }
})





module.exports = router; 