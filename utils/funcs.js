const axios = require('axios');
const jwt = require("jsonwebtoken");
const { response } = require('express');
const slugify = require('slugify');

const JWT_SECRET = process.env.JWT_SECRET || "temporary secret";


const instance = axios.create({
    validateStatus: () => true,
});


genJWT = (data, secret = JWT_SECRET) => {
	return jwt.sign(data, secret, {
		expiresIn: "28d",
	});
};

verifyJWT = (req, res, next) => {	
	baseUrl = req.baseUrl.split("/").reverse()[0];
    auth_token = req.headers["x-token"] || "";
	if (!auth_token) return sendError(res, "Authentication token not provided!", 401);
	jwt.verify(auth_token, JWT_SECRET, (err, data) => {
		if (err) {
			if (err.name === "TokenExpiredError") throw { err_message: "Authentication token expired!", err_code: 401 };
			throw { err_message: "Invalid authentication token!", err_code: 401 };
		}
		delete data["exp"];
		delete data["iat"];
		req.email = data['email'];
		next();
	});
};

sendError = (res, err, resCode) => {
    err = err || "Internal server error !";
    resCode = resCode || 500;
    console.log(err)
    if (typeof err !== "string") err = "Internal server error!";
    let message = {
        code: resCode,
        message: err,
    };
    res.status(resCode);
    res.json(message);
    res.end();
};

sendSuccess = (res, data, resCode) => {
    resCode = resCode || 200;
    data = data === undefined ? {} : data;
    let message = {
        code: resCode,
        data: data,
    };
    res.status(resCode);
    res.json(message);
    res.end();
};

generateSlug = async (title) => {
    slug = slugify(title, {
        strict: true,
        lower: true,
    });

    // Check if VOCTOWEB_URL is configured, if not return the slug directly
    if (!process.env.VOCTOWEB_URL) {
        console.warn('VOCTOWEB_URL environment variable not set, skipping duplicate slug check');
        return slug;
    }

    try {
        let response = await instance.get(`${process.env.VOCTOWEB_URL}/public/events`);
        console.log(response);
        
        if (response.data && response.data.events) {
            events = response.data.events;
            slugs = events.map((event)=>event.slug);
            let counter = 1;
            while(slug in slugs){
                slug = `${slug}-${counter}`;
                counter++;
            }
        }
    } catch (error) {
        console.warn('Failed to fetch events for slug validation:', error.message);
        // Continue with original slug if external service is unavailable
    }
    
    return slug;
}

triggerPipeline = (data) => {
    console.log(data);
    const { id,
        title,
        subtitle,
        persons,
        tags,
        conference,
        language,
        slug,
        date,
        url,
        name,
        email,
        link,
        description } = data;
    const headers = {
        'Accept': 'application/vnd.go.cd.v1+json',
        'Content-Type': 'application/json',
        'Authorization': `bearer ${process.env.ACCESS_KEY}`
    };
    const body = {
        "environment_variables": [
            {
                "name": "VIDEO_ID",
                "value": id,
            },
            {
                "name": "TITLE",
                "value": title
            },
            {
                "name": "SUBTITLE",
                "value": subtitle
            },
            {
                "name": "PERSONS",
                "value": persons
            },
            {
                "name": "TAGS",
                "value": tags
            },
            {
                "name": "ACRONYM",
                "value": conference
            },
            {
                "name": "SLUG",
                "value": slug
            },
            {
                "name": "LANGUAGE",
                "value": language
            },
            {
                "name": "DATE",
                "value": date
            },
            {
                "name": "RELEASE_DATE",
                "value": date
            },
            {
                "name": "VIDEO_URL",
                "value": url,
            },
            {
                "name": "NAME",
                "value": name
            },
            {
                "name": "EMAIL",
                "value": email
            },
            {
                "name": "LINK",
                "value": link
            },
            {
                "name": "DESCRIPTION",
                "value": description
            },
            {
                "name": "API_KEY",
                "value":process.env.API_KEY
            }
           
        ]
    }
    return instance.post(process.env.PIPELINE_URL, body, { headers });
}

module.exports = {
    sendError,
    sendSuccess,
    generateSlug,
    triggerPipeline,
    instance,
    genJWT,
    verifyJWT,
}