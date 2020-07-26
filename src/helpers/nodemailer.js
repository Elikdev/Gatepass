const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const hbs = require("nodemailer-express-handlebars");
const { blue } = require("chalk");
const {
	EMAIL_ADDRESS,
	EMAIL_PASSWORD,
	EMAIL_SECRET,
	HOST,
	PORT,
} = require("../config/");

//mail-setup
const configuration = () => {
	return nodemailer.createTransport({
		service: "Gmail",
		port: 465,
		auth: {
			user: EMAIL_ADDRESS,
			pass: EMAIL_PASSWORD,
		},
	});
};

const sendActivationEmail = async (data) => {
	const transport = configuration();
	const userEmail = data.email;
	const userName = data.fullname;
	const verificationToken = jwt.sign({ userId: data._id }, EMAIL_SECRET, {
		expiresIn: "1d",
	});

	const generateLink = `http://${HOST}:${PORT}/api/v1/auth/verify?email=${userEmail}&token=${verificationToken}`;

	const hbsOptions = {
		viewEngine: {
			extName: ".hbs",
			defaultLayout: "",
		},
		viewPath: "./src/views/",
		extName: ".hbs",
	};

	transport.use("compile", hbs(hbsOptions));

	const msg = {
		from: EMAIL_ADDRESS,
		to: userEmail,
		subject: "Confirm email to start using gatepass",
		text: "testing text",
		template: "confirmEmail",
		context: {
			name: userName,
			activationLink: generateLink,
		},
	};

	//send mail
	let info = await transport.sendMail(msg);
	console.log(blue(`mail sent succcessfully >>> ${info.messageId}`));
	return;
};

module.exports = {
	sendActivationEmail,
};
