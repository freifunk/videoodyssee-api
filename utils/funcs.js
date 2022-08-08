const axios = require('axios');


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

triggerPipeline = (data) =>{
	const {id,title,subtitle,url,name,email} = data;
    const headers = {
        'Accept': 'application/vnd.go.cd.v1+json',
        'Content-Type': 'application/json',
        'Authorization': `bearer ${process.env.ACCESS_KEY}`
    };
    const body = {
        "environment_variables":[
            {
                "name":"VIDEO_URL",
                "value":url,
            },
            {
                "name":"VIDEO_ID",
                "value":id,
            },
            {
                "name":"TITLE",
                "value":title
            }
        ]
    }
    return instance.post(process.env.PIPELINE_URL,body,{headers});
}

module.exports ={
    sendError,
    sendSuccess,
	triggerPipeline,
}