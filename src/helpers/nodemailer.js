const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const hbs = require("nodemailer-express-handlebars");
const { blue } = require("chalk");
const { EMAIL_ADDRESS, EMAIL_PASSWORD, EMAIL_SECRET } = require("../config/");

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

const hbsOptions = {
	viewEngine: {
		extName: ".hbs",
		defaultLayout: "",
	},
	viewPath: "./src/views/",
	extName: ".hbs",
};

const transport = configuration();
transport.use("compile", hbs(hbsOptions));

const sendActivationEmail = async (data, req) => {
	const userEmail = data.email;
	const userName = data.fullname;
	const verificationToken = jwt.sign({ userId: data._id }, EMAIL_SECRET, {
		expiresIn: "1d",
	});

	const generateLink = `http:\/\/${req.headers.host}\/api\/v1\/auth\/verify?email=${userEmail}&token=${verificationToken}`;

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

	let info = await transport.sendMail(msg);
	console.log(blue(`mail sent succcessfully >>> ${info.messageId}`));
	return;
};

const sendInvalidUserLoginAttempt = async (data, location, req) => {
	const userEmail = data.email;

	// this link should change depending on what you set as the route to forgotPassword controller
	const forgotPasswordLink = `http:\/\/${req.headers.host}\/api\/v1\/auth\/forgotPassword`;

	const msg = {
		from: EMAIL_ADDRESS,
		to: userEmail,
		subject: "Gatepass account sign in from a new location",
		text: "testing text",
		template: "loginAttempt",
		context: {
			changePasswordLink: forgotPasswordLink,
			location: location,
		},
	};

	let { messageId } = await transport.sendMail(msg);
	console.log(blue(`mail sent succcessfully >>> ${messageId}`));
	return;
};

const passwordResetEmail = async (data, req) => {
	const userEmail = data.email;
	const verificationToken = jwt.sign({ userId: data._id }, EMAIL_SECRET, {
		expiresIn: "1d",
	});

	const resetPasswordLink = `http:\/\/${req.headers.host}\/api\/v1\/auth\/reset-password?token=${verificationToken}`;

	const msg = {
		from: EMAIL_ADDRESS,
		to: userEmail,
		subject: "Password Reset Link",
		text: "testing text",
		template: "passwordReset",
		context: {
			passwordResetLink: resetPasswordLink,
			name: data.fullname,
		},
	};

	let { messageId } = await transport.sendMail(msg);
	console.log(blue(`mail sent succcessfully >>> ${messageId}`));
	return;
};

const sendAppAdminInvite = async (userData, ownerData, appData, req) => {
	const userEmail = userData.email;
	const userName = userData.fullname;
	const invitationToken = jwt.sign({ userId: userData._id, appId: appData._id }, EMAIL_SECRET, {
		expiresIn: "7d",
	});

	const invitationLink = `http:\/\/${req.headers.host}\/api\/v1\/apps\/invitation\/accept?token=${invitationToken}`;

	const msg = {
		from: EMAIL_ADDRESS,
		to: userEmail,
		subject: "Invitation to be an application admin on gatepass",
		text: "testing text",
		template: "adminInviteMail",
		context: {
			name: userName,
			invitationLink,
			userEmail,
			orgName: ownerData.organisation_name,
			appName: appData.app_name,
		},
	};

	let info = await transport.sendMail(msg);
	console.log(blue(`mail sent succcessfully >>> ${info.messageId}`));
	return;
};

const sendInviteNotification = async (data, user, application) => {
	const userEmail = data.email;
	const msg = {
		from: EMAIL_ADDRESS,
		to: userEmail,
		subject: "Admin Invite Acceptance",
		text: "testing text",
		template: "inviteAcceptance",
		context: {
			name: data.fullname,
			userAdded: user.email,
			appName: application,
		},
	};

	let { messageId } = await transport.sendMail(msg);
	console.log(blue(`mail sent succcessfully >>> ${messageId}`));
	return;
};

module.exports = {
	sendActivationEmail,
	sendInvalidUserLoginAttempt,
	passwordResetEmail,
	sendAppAdminInvite,
	sendInviteNotification,
};
