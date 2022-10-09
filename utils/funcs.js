const axios = require('axios');
const slugify = require('slugify');


const instance = axios.create({
    validateStatus: () => true,
});

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

    response = await instance.get(`${process.env.VOCTOWEB_URL}/public/events`);
    events = response.data.events;
    slugs = events.map((event)=>event.slug);
    let counter = 1;
    while(slug in slugs){
        slug = `${slug}-${counter}`;
        counter++;
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
}