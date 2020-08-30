require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const dbConnect = require("./src/config/db");
const {
	checkAuth,
	checkAppToken,
	checkAuthServiceToken,
} = require("./src/middlewares/checkAuth");

const { authRouter, appRouter, serviceRouter } = require("./src/routes/");

const isProduction = process.env.NODE_ENV === "production";
dbConnect();

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.get("/", (req, res) => {
	res.status(200).json({
		message: "welcome to gatepass",
	});
});

app.use(checkAuth);
app.use("/api/v1/auth", authRouter);

app.use("/api/v1/apps", appRouter);
app.use("/api/v1/services", checkAuthServiceToken, serviceRouter);

app.use((req, res, next) => {
	const error = new Error("Not found");
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	if (error.status === 404) {
		return res.status(404).json({
			errors: { 
				message: "Invalid Request, Resource not found", 
			},
		});
	}
	if (!isProduction) {
		return res.status(error.status || 500).json({
			errors: {
				message: error.message,
				error: error,
			},
		});
	}
	return res.status(error.status || 500).json({
		errors: {
			message: 
				"Something went wrong, please try again or check back for a fix",
		},
	});
});

module.exports = app;
