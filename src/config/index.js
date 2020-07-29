require("dotenv").config();
module.exports = {
	DB_URI: process.env.DB_URI || "mongodb://127.0.0.1:27017/gatepass",
	EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
	EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
	EMAIL_SECRET: process.env.EMAIL_SECRET,
	PORT: process.env.PORT || "5000",
	HOST: process.env.HOST || "localhost",
	JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};
