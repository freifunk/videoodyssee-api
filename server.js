require('dotenv').config()
const express = require("express");
var morgan = require('morgan')
const cors  = require('cors');
const bodyParser = require('body-parser');
const funcs = require("./utils/funcs");
const logger = require("./utils/logger");
const PORT = process.env.PORT || 8000;

const app = express();

app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());

// Health check endpoint for Kubernetes/monitoring
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: process.env.NODE_ENV || 'development'
	});
});

app.use('/pipeline',require('./routes/pipeline-routes.js'));
app.use('/video',require('./routes/video-routes.js'));
app.use('/auth',require('./routes/auth-routes.js'));

app.use((req, res) => {
	throw { err_message: "Route not found!", err_code: 404 };
});

app.use((err, req, res, next) => {
	if (err instanceof SyntaxError) return funcs.sendError(res, "JSON parse error!", 400);
	else return funcs.sendError(res, err.err_message || err, err.err_code);
});

// Only start server if not in test environment
let server;
if (process.env.NODE_ENV !== 'test') {
	server = app.listen(PORT,()=>{
		logger.info(`🚀 Server listening on port ${PORT}`);
	});
}

module.exports = {
	app,
	server,
}