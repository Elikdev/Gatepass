const bcrypt = require("bcryptjs");
const { User } = require("../models/");
const { red } = require("chalk");
const { sendActivationEmail, 
	sendInvalidUserLoginAttempt, 
} = require("../helpers/nodemailer");
const authHelper = require("../helpers/auth");
const { EMAIL_SECRET } = require("../config");
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
		const hashedPassword = authHelper.hashPassword(password);

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
		console.log(red(`Error from user sign up >>> ${error.message} `));
		return res
			.status(500)
			.json({ message: "Something went wrong. Try again later" });
	}
};

exports.accountVerification = async (req, res) => {
	const { token, email } = req.query;
	try {
		const { userId } = jwt.verify(token, EMAIL_SECRET);
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

exports.userSignIn = async (req, res) => {
	const {
		email,
		password,
		security_answer,
		add_location,
	} = req.body;
	// Get the user's sign in location
	// const signInLocation = req.ip; // trial
	try {
		// check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({
				message: "You Entered an incorrect Email or Password",
			});
		}

		// check if user is verified/activated
		if (!user.confirmed) {
			return res.status(401).json({
				message: "You have to verify your account",
			});
		}

		// check if password coressponds with the saved one
		const isPasswordValid = authHelper.comparePassword(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({
				message: "You Entered an incorrect Email or Password",
			});
		}

		// check if the sign in location is not in the locations array
		// const isNewLocation = !user.locations.includes(signInLocation);
		// if (isNewLocation) {
		// 	// asks for the answer to the security question
		// 	if (security_answer === user.security_answer.toString()) {
		// 		// user decides if the new location should be added or not
		// 		// if user selects yes
		// 		if (add_location === 'yes') {
		// 			// add the location and save
		// 			user.locations.push(signInLocation);
		// 			await user.save();
		// 		}
		// 	} else {
		// 		// if security answer is incorrect
		// 		// send mail to user that some one tried to login 
		// 		await sendInvalidUserLoginAttempt(user, signInLocation);
		// 		return res.status(401).json({
		// 			message: "Incorrect answer",
		// 		});
		// 	}
		// }

		// create a token with userId encrypted
		const token = authHelper.createJwtToken({ userId: user._id });
		return res.status(200).json({
			message:
				"You have successfully logged in..",
			token,
		});
	} catch (error) {
		console.log(red(`Error from user sign in >>> ${error.message}`));
		return res
			.status(500)
			.json({ message: "Something went wrong. Try again later" });
	}
};
