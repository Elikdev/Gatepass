const { App, User } = require("../models/index");
const jwt = require("jsonwebtoken");
const { APP_SECRET } = require("../config/index");
const { red } = require("chalk");

exports.registerNewApp = async (req, res) => {
	const { app_name, description, unique_id } = req.body;
	const user = req.user;

	try {
		const app = new App({
			app_name,
			description,
			unique_id,
		});

		const app_token = await jwt.sign({ app_name, unique_id }, APP_SECRET, {
			expiresIn: "1y",
		});

		app.app_token = app_token;

		await User.findOneAndUpdate(
			{ _id: user._id },
			{ $push: { apps: app._id } }
		);

		await app.save();

		return res.status(201).json({
			message:
				"App has been successfully registered. Your token which expires after a year, is shown below",
			app_token,
		});
	} catch (error) {
		console.log(red(`Error in registering application >>> ${error.message}`));
		return res.status(500).json({
			message: "An error occured. Try again later",
		});
	}
};

// Disable and enable application

exports.changeAppStatus = async (req, res) => {
	let { status } = req.query;
	const { app_name } = req.body;
	const user = req.user;

	try {
		//check if app is in the db
		const app = await App.findOne({ app_name });
		if (!app) {
			return res.status(404).json({
				message: "There is no app with such name on gatepass",
			});
		}

		//check if user is the owner of the application
		const owner = await User.findOne({ _id: user._id });
		if (!owner.apps.includes(app._id)) {
			return res.status(401).json({
				message:
					"You do not have access to change the status of this application",
			});
		}

		status = status.toString();

		let appStatus;

		if (status == "enable") {
			if (app.status == "active") {
				return res.status(409).json({
					message: "Application was initially active",
				});
			}
			appStatus = await App.findOneAndUpdate(
				{ _id: app._id },
				{ status: "active" }
			);
			return res.status(200).json({
				message:
					"Your application's status has been successfully set to active",
			});
		}

		if (status == "disable") {
			if (app.status == "disabled") {
				return res.status(409).json({
					message: "Application was initially disabled ",
				});
			}

			appStatus = await App.findOneAndUpdate(
				{ _id: app._id },
				{ status: "disabled" }
			);
			return res.status(200).json({
				message:
					"Your application's status has been successfully set to disabled.",
			});
		}
	} catch (error) {
		console.log(
			red(`Error in changing application's status >>> ${error.message}`)
		);
		return res.status(500).json({
			message: "An error occured. Try again later",
		});
	}
};
