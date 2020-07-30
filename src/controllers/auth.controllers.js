const bcrypt = require("bcryptjs");
const { User } = require("../models/");
const { red } = require("chalk");
const {
	sendActivationEmail,
	sendInvalidUserLoginAttempt,
	passwordResetEmail,
} = require("../helpers/nodemailer");
const authHelper = require("../helpers/auth");
const { EMAIL_SECRET, GEOLOCSECRET } = require("../config");
const jwt = require("jsonwebtoken");
const IPGeolocationAPI = require("ip-geolocation-api-javascript-sdk");

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

		//initialize the ipgeolocation api
		const ipgeolocationApi = new IPGeolocationAPI(GEOLOCSECRET, false);

		// Function to handle response from IP Geolocation API
		function handleResponse(json) {
			if (json.message == "Internet is not connected!") {
				return res.status(412).json({
					message: "Oopps! No internet connection. Try again ",
				});
			}

			//grab the location and save to db
			const location = `${json.city}, ${json.country_name}`;
			user.locations.push(location);
		}

		// get location from the incoming IP address
		ipgeolocationApi.getGeolocation(handleResponse);

		//send a confirmation mail to the new user
		await sendActivationEmail(user, req);

		//save user to database after the confirmation has been sent
		await user.save();

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

		if (!user) {
			return res.status(401).json({
				message: "Invalid registration link!",
			});
		}

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
	let { email, password, security_answer, add_location } = req.body;

	//initialize the ipgeolocation api to get the sign in location
	const ipgeolocationApi = new IPGeolocationAPI(GEOLOCSECRET, false);

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

		// get location from the incoming IP address
		ipgeolocationApi.getGeolocation(handleResponse);

		let signInLocation;

		// Function to handle response from IP Geolocation API
		async function handleResponse(json) {
			if (json.message == "Internet is not connected!") {
				return res.status(412).json({
					message: "Oopps! No internet connection. Try again ",
				});
			}
			if (json.ip) {
				signInLocation = `${json.city}, ${json.country_name}`;

				//if no security answer provided, prompt user to include it
				if (!user.locations.includes(signInLocation) && !security_answer) {
					return res.status(401).json({
						message:
							"You cannot login..provide answer to your security question. Note that it is case sensitive",
						signInLocation,
					});
				}

				//security answer provided
				if (!user.locations.includes(signInLocation) && security_answer) {
					security_answer = security_answer;

					//check if security answer is the correct answer to the corresponding user's security question
					if (security_answer !== user.security_answer && !add_location) {
						await sendInvalidUserLoginAttempt(user, signInLocation, req); //if not send a mail
						return res.status(401).json({
							message: "Wrong answer provided",
						});
					}

					//security answer provided but no add_location
					if (security_answer === user.security_answer && !add_location) {
						return res.status(412).json({
							message:
								"Please state if this new location should be addded to your trusted location",
						});
					}

					//update the user's trusted locations if the answer was yes
					if (security_answer === user.security_answer && add_location) {
						add_location = add_location.toLowerCase();

						if (add_location == "yes") {
							//add to user trusted location
							await User.findOneAndUpdate(
								{ email: user.email },
								{ $push: { locations: signInLocation } }
							);
						}
					}
				}
				// create a token with userId encrypted
				const token = authHelper.createJwtToken({ userId: user._id });
				return res.status(200).json({
					message: "You have successfully logged in..",
					token,
				});
			}
		}
	} catch (error) {
		console.log(red(`Error from user sign in >>> ${error.message}`));
		return res
			.status(500)
			.json({ message: "Something went wrong. Try again later" });
	}
};

exports.forgotPassword = async (req, res) => {
	const { email } = req.body;

	try {
		if (!email) {
			return res.status(422).json({
				message: "Please provide a valid email",
			});
		}
		const user = await User.findOne({ email });

		if (!user || !user.confirmed) {
			return res.status(404).json({
				message:
					"The email that you provided is not registered or has not been activated on gatepass ",
			});
		}

		await passwordResetEmail(user, req);

		return res.status(200).json({
			message: "Check your email. A password reset link has been sent to you",
		});
	} catch (error) {
		console.log(red(`Error from user forgot password >>> ${error.message}`));
		return res.status(500).json({
			message: "Something went wrong. Try again later",
		});
	}
};

exports.changePassword = async (req, res) => {
	const { token } = req.query;
	const { new_password } = req.body;

	try {
		const { userId } = await jwt.verify(token, EMAIL_SECRET);

		const hashedPassword = await authHelper.hashPassword(new_password);

		const user = await User.findOneAndUpdate(
			{ _id: userId },
			{ $set: { password: hashedPassword } }
		);

		if (!user) {
			return res.status(404).json({
				message: "User does not exist",
			});
		}

		return res.status(200).json({
			message: "Your password has been successfully changed. Proceed to login",
		});
	} catch (error) {
		console.log(red(`Error from user change password >>> ${error.message}`));
		return res.status(500).json({
			message: "Something went wrong. Try again later",
		});
	}
};
