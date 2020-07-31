const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const dbConnect = require("./src/config/db");

//routes
const { authRouter } = require("./src/routes/");

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

app.use("/api/v1/auth", authRouter);

module.exports = app;
