require('dotenv').config()
const express = require("express");
var morgan = require('morgan')
const cors  = require('cors');
const bodyParser = require('body-parser');
const funcs = require("./utils/funcs");

const app = express();

app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());

app.use('/pipeline',require('./routes/pipeline.js'));


app.use((req, res) => {
	throw { err_message: "Route not found!", err_code: 404 };
});

app.use((err, req, res, next) => {
	if (err instanceof SyntaxError) return funcs.sendError(res, "JSON parse error!", 400);
	else return funcs.sendError(res, err.err_message || err, err.err_code);
});

app.listen(process.env.PORT,()=>{
    console.log(`Listening at port ${process.env.PORT}`);
})