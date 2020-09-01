const jwt = require("jsonwebtoken");
const { red } = require("chalk");
const { App, User, Organisation } = require("../models");
const { APP_SECRET, EMAIL_SECRET, INVITE_SECRET } = require("../config");
const {
	sendAppAdminInvite,
	sendInviteNotification,
	sendAdminRemovalMail,
	sendAdminRemovalMailToAdmin,
} = require("../helpers/nodemailer");
const { response } = require("../../app");

exports.registerNewApp = async (req, res) => {
	const { app_name, description, unique_id } = req.body;
	const user = req.user;

	try {
		const app = new App({
			app_name,
			description,
			unique_id,
		});

		const app_token = jwt.sign(
			{
				app_name: app_name,
				unique_id: unique_id,
				org_name: user.organisation.name,
			},
			APP_SECRET,
			{
				expiresIn: "1y",
			}
		);

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
				message:
					"Something went wrong, please try again or check back for a fix",
			},
		});
	}
};

exports.changeAppStatus = async (req, res) => {
	let { status } = req.query;
	const { app_name } = req.body;
	const user = req.user;

	try {
		const app = await App.findOne({ app_name });
		if (!app) {
			return res.status(404).json({
				message: "There is no app with such name on gatepass",
			});
		}
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
				message:
					"Something went wrong, please try again or check back for a fix",
			},
		});
	}
};

exports.viewAllUserApps = async (req, res) => {
	const { page = 1, limit = 10, filter } = req.query;
	const { _id } = req.user;
	try {
		let apps;
		let count;
		if (filter) {
			if (filter.toString() == "active") {
				apps = await App.find({
					app_admins: _id,
					status: "active",
				})
					.select("-__v -app_token")
					.limit(limit * 1)
					.skip((page - 1) * limit)
					.exec();
				count = await App.countDocuments({ app_admins: _id, status: "active" });
			} else if (filter.toString() == "disabled") {
				apps = await App.find({
					app_admins: _id,
					status: "disabled",
				})
					.select("-__v -app_token")
					.limit(limit * 1)
					.skip((page - 1) * limit)
					.exec();
				count = await App.countDocuments({
					app_admins: _id,
					status: "disabled",
				});
			}
		} else {
			apps = await App.find({
				app_admins: _id,
			})
				.select("-__v -app_token")
				.limit(limit * 1)
				.skip((page - 1) * limit)
				.exec();
			count = await App.countDocuments({ app_admins: _id });
		}
		if (count === 0) {
			return res.status(404).json({
				message:
					"No registered applications available for this organisation on Gatepass",
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
		console.log(
			red(`Error from getting all registered apps >>> ${error.message}`)
		);
		return res.status(500).json({
			errors: {
				message:
					"Something went wrong, please try again or check back for a fix",
			},
		});
	}
};

exports.updateApplication = async (req, res) => {
	const { appId } = req.params;
	const { _id } = req.user;
	try {
		const app = await App.findOneAndUpdate(
			{
				_id: appId,
				app_admins: _id,
			},
			req.body,
			{ new: true }
		);

		if (!app) {
			return res.status(404).json({
				message: "App doesn't exist or has been deleted",
			});
		}
		if (app.status === "disabled") {
			return res.status(401).json({
				message: "App is disabled. You need to enable it before you can use it",
			});
		}
		return res.status(200).json({
			message: "Application has been updated successfully",
		});
	} catch (error) {
		console.log(red(`Error from updating application >>> ${error.message}`));
		return res.status(500).json({
			errors: {
				message:
					"Something went wrong, please try again or check back for a fix",
			},
		});
	}
};

exports.addAdminToApp = async (req, res) => {
	const { email } = req.body,
		{ appId } = req.params,
		{ _id } = req.user;
	try {
		const app = await App.findById(appId);
		if (!app) {
			return res.status(404).json({
				message: "App does not exist on Gatepass",
			});
		}
		const owner = await User.findOne({ _id: _id, role: "OWNER" }).populate(
			"organisation",
			"name"
		);
		if (!owner.apps.includes(app._id)) {
			return res.status(401).json({
				message:
					"You do not have write access to add an administrator to this application",
			});
		}
		let newAdmin = await User.findOne({ email });
		if (!newAdmin) {
			newAdmin = {
				email: email, // a new object is created for invitee so that the mail is sent regardlessly
			};
		}
		const userAlreadyAdded = app.app_admins.includes(newAdmin._id);
		if (userAlreadyAdded) {
			return res.status(409).json({
				message: "User already added as an admin to the application",
			});
		}
		await sendAppAdminInvite(newAdmin, owner, app, req);
		return res.status(200).json({
			message:
				"An invitation mail has been sent to the invitee's email address.",
		});
	} catch (error) {
		console.log(
			red(`Error in adding an admin to an application >>> ${error.message}`)
		);
		return res.status(500).json({
			errors: {
				message:
					"Something went wrong, please try again or check back for a fix",
			},
		});
	}
};

exports.acceptAppAdminInvite = async (req, res) => {
	const { token, e } = req.query;

	try {
		const { userId, appId, orgName } = jwt.verify(token, EMAIL_SECRET);
		const user = await User.findOne({ _id: userId });
		const inviteToken = jwt.sign(
			{ email: e, appId: appId, orgName: orgName },
			INVITE_SECRET,
			{
				expiresIn: "1hr",
			}
		);
		if (!user) {
			return res.status(401).json({
				message:
					"You do not have an account on gatepass. So you need to register with this link",
				link: `http:\/\/${req.headers.host}\/api\/v1\/auth\/register-by-invite?t=${inviteToken}`,
			});
		}
		const app = await App.findById(appId);
		if (!app) {
			return res.status(401).json({
				message: "Invalid registration link!",
			});
		}
		const userAlreadyAnAdmin = app.app_admins.includes(userId);
		if (userAlreadyAnAdmin) {
			return res.status(409).json({
				message: "You already accepted to be an admin on the application",
			});
		}
		app.app_admins.push(userId);
		await app.save();
		//  you can comment out this if it's not necessary when testing
		for (const appAdmin of app.app_admins) {
			const eachAdmin = await User.findById(appAdmin);
			// send mail to all the application admins that sososo user has been added as an admin
			await sendInviteNotification(eachAdmin, user, app.app_name);
			console.log("====sent====");
		}
		return res.status(200).json({
			message: "Invitation accepted successfully.",
		});
	} catch (error) {
		console.log(
			red(
				`Error from user accepting admin invitation to an app >>> ${error.stack}`
			)
		);
		return res.status(500).json({
			errors: {
				message:
					"Something went wrong, please try again or check back for a fix",
			},
		});
	}
};

exports.catchApp = async (req, res) => {
	try {
		const app = req.app;
		if (!app) {
			return res.status(404).json({
				message: "Error in getting app",
			});
		}
		//check if app is still enabled
		const appEnabled = await App.findOne({ app_name: app.app_name });

		if (!appEnabled) {
			return res.status(404).json({
				message: "Error in getting app",
			});
		}

		if (appEnabled.status == "disabled") {
			return res.status(401).json({
				message: "Application can not use auth-service. It has been disabled",
			});
		}

		return res.status(200).json({
			message: "Worked!",
			app: app,
		});
	} catch (error) {
		console.log(red(`Error in getting application >>> ${error.message}`));
		return res.status(500).json({
			errors: {
				message:
					"Something went wrong, please try again or check back for a fix",
			},
		});
	}
};

exports.removeAdminFromApp = async (req, res) => {
	const { appId, userId } = req.params,
		{ role, apps } = req.user;
	try {
		const app = await App.findById(appId);
		if (!app) {
			return res.status(404).json({
				message: "App does not exist on Gatepass or has been deleted",
			});
		}
		if (role !== "OWNER" && !apps.includes(app._id)) {
			return res.status(401).json({
				message:
					"You do not have write access to remove an administrator from this application",
			});
		}
		const user = await User.findOne({ _id: userId });
		if (!user) {
			return res.status(404).json({
				message: "User does not exist on this application",
			});
		}
		//if (!user.apps.includes(appId)) or
		const userNotAnAdmin = !app.app_admins.includes(userId);
		if (userNotAnAdmin) {
			return res.status(409).json({
				message: "User has already been removed from the application",
			});
		}
		const deleteUserFromApp = await App.findByIdAndUpdate(
			appId,
			{
				$pull: {
					app_admins: user._id,
				},
			},
			{
				new: true,
			}
		);
		const deleteAppFromUser = await User.findByIdAndUpdate(
			userId,
			{
				$pull: {
					apps: app._id,
				},
			},
			{
				new: true,
			}
		);
		//send message that to the user that he has been removed
		await sendAdminRemovalMail(user, app.app_name);
		// send message to the admin that the user has been removed
		await sendAdminRemovalMailToAdmin(user, app.app_name, req);
		return res.status(200).json({
			message: "User removed as an admin successfully!",
			app: deleteUserFromApp,
			user: deleteAppFromUser,
		});
	} catch (error) {
		console.log(red(`Error from removing app admin >>> ${error.message}`));
		return res.status(500).json({
			errors: {
				message:
					"Something went wrong, please try again or check back for a fix",
			},
		});
	}
};
