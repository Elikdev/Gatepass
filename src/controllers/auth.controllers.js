const bcrypt = require("bcryptjs");
const { User } = require("../models/");
const { red } = require("chalk");
const { sendActivationEmail } = require("../helpers/nodemailer");
const { EMAIL_SECRET } = require("../config/");
const jwt = require("jsonwebtoken");

exports.userSignUp = async (req, res) => {
	const {
		fullname,
		organisation_name,
		email,
		password,
		security_question,
		security_answer,
	} = req.body;
	try {
		//hash password before actually saving to database
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = new User({
			fullname,
			organisation_name,
			email,
			password: hashedPassword,
			security_question,
			security_answer,
		});

		//send a confirmation mail to the new user
		let verify = await sendActivationEmail(user);

		//save user to database after the confirmation has been sent
		const savedUser = await user.save();

		//check savedUser location and update the location in the DB
		//get the ip
		// const forwarded = req.headers["x-forwarded-for"];
		// const ip = forwarded
		// 	? forwarded.split(/, /)[0]
		// 	: req.connection.remoteAddress;

		// //get the location
		// const getLocation = await ipLocation(ip);

		return res.status(201).json({
			message:
				"Your have successfully created a new account with gatepass. Check your email, an activation mail has been sent to you.",
		});
	} catch (error) {
		//catch any error
		console.log(red(`Error from user sign up >>> ${error.message} `));
		return res
			.status(500)
			.json({ message: "Something went wrong. Try again later" });
	}
};

//verify user account
exports.accountVerification = async (req, res) => {
	const { token, email } = req.query;
	try {
		//check the token
		const { userId } = await jwt.verify(token, EMAIL_SECRET);

		//check if user has already been confirmed
		const user = await User.findById(userId);

		if (user.confirmed) {
			return res.status(409).json({
				message: "Your account has already been activated",
			});
		}

		const foundUser = await User.findOneAndUpdate(
			{ _id: userId },
			{ confirmed: true }
		);
		if (!foundUser) {
			return res.status(404).json({
				message: `Account with the email: ${email} does not exist`,
			});
		}

		return res.status(200).json({
			message:
				"Welcome on board, your account has been activated. Proceed to sign in",
		});
	} catch (error) {
		console.log(red(`Error from user verification >>> ${error.message}`));
		return res
			.status(500)
			.json({ message: "Something went wrong. Try again later" });
	}
};
