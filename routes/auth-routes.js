const express = require("express");
const router = express.Router();
const funcs = require("../utils/funcs");




router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            throw { err_message: "Missing some required fields", err_code: 404 }

        if (email == process.env.EMAIL && password == process.env.PASSWORD) {
            jwt = funcs.genJWT({email:email});
            return funcs.sendSuccess(res,jwt);
        }
        throw { err_message: "Authentication Failed", err_code: 500};
       
    }
    catch (err) {
        next(err)
    }
});

module.exports = router;