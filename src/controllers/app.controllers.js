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

		const app_token = jwt.sign({ app_name, unique_id }, APP_SECRET, {
			expiresIn: "1y",
		});

		app.app_token = app_token;
		app.app_admins.push(user._id);

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
			errors: {
				message: "Something went wrong, please try again or check back for a fix",
			},
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
			errors: {
				message: "Something went wrong, please try again or check back for a fix",
			},
		});
	}
};

exports.viewAllUserApps = async (req, res) => {
	// set default simple pagination if no limit or page is passed
	const { page = 1, limit = 10, filter } = req.query;
	const { _id } = req.user;
	try {
		let apps;
		// see only apps that you own or you're an organization admin added by the owner
		if (filter) {
			// check if filter by active
			if (filter.toString() == "active") {
				apps = await App.find({
					app_admins: _id,
					status: "active",
				})
				.limit(limit * 1)
				.skip((page - 1) * limit)
				.exec();
				// if filter by desabled
			} else if (filter.toString() == "disabled") {
				apps = await App.find({
					app_admins: _id,
					status: "disabled",
				})
				.limit(limit * 1)
				.skip((page - 1) * limit)
				.exec();
	
			}	
		} else {
			apps = await App.find({
				app_admins: _id,
			})
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();
		}
		const count = apps.length;

		if (count === 0) {
			return res.status(404).json({
				message: "No registered applications available for this organisation on Gatepass",
			});
		}
		return res.status(200).json({
			message: "Apps found",
			count,
			apps,
			totalPages: Math.ceil(count / limit),
            currentPage: page,
		});

	} catch (error) {
		console.log(red(`Error from getting all registered apps >>> ${error.message}`));
		return res.status(500).json({
			errors: {
				message: "Something went wrong, please try again or check back for a fix",
			},
		});
	}
};
