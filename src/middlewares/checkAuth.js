const routes = require("../constants/routesGroup");
const { User, Organisation } = require("../models");
const authHelper = require("../helpers/auth");

// middleware to authenticate users accessing secure routes
const checkAuth = async (req, res, next) => {
	// did this because path with params do not get authenticated by this middleware
	if (
		routes.secureRoutes.includes(req.path) ||
		!routes.unsecureRoutes.includes(req.path)
	) {
		if (!req.headers.authorization) {
			return res.status(412).json({
				message: "Access denied!! Missing authorization credentials",
			});
		}

		let token = req.headers.authorization;

		if (token.startsWith("Bearer ")) {
			token = token.split(" ")[1];
		}

		try {
			const decoded = authHelper.verifyJwtToken(token);
			const user = await User.findById(decoded.userId).populate(
				"organisation apps",
				"name app_name"
			);
			if (!user) {
				return res.status(401).json({
					message: "You are not authorized to access this route.",
				});
			}
			req.user = user;
			return next();
		} catch (error) {
			console.log("Error from user authentication >>>>> ", error);
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({
					error: true,
					message: "Token expired.",
				});
			}
			return next(error);
		}
	} else {
		return next();
	}
};

//middleware that decodes the token assigned to an application using auth-service -- gatepass --> auth-service(applications) communication
const checkAppToken = async (req, res, next) => {
	if (!req.headers["app-token"]) {
		return res.status(412).json({
			message: "Access denied!! Missing authorization credentials",
		});
	}
	let appToken = req.headers["app-token"];

	if (appToken.startsWith("Bearer ")) {
		appToken = appToken.split(" ")[1];
	}

	try {
		const decoded = authHelper.verifyAppToken(appToken);

		if (!decoded) {
			return res.status(401).json({
				message: "You are using an invalid token",
			});
		}
		req.app = decoded;
		return next();
	} catch (error) {
		console.log("Error from user authentication >>>>> ", error);
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				error: true,
				message: "Token expired.",
			});
		}
		return next(error);
	}
};

//middleware that decodes the token generated for auth-service -- gatepass --> auth-service communication
const checkAuthServiceToken = async (req, res, next) => {
	if (!req.headers["auth-service-token"]) {
		return res.status(412).json({
			message: "Access denied. Missing authorization credentials",
		});
	}

	let authServiceToken = req.headers["auth-service-token"];
	if (authServiceToken.startsWith("Bearer ")) {
		authServiceToken = authServiceToken.split(" ")[1];
	}

	try {
		const decoded = authHelper.verifyJwtToken(authServiceToken);
		const organisation = await Organisation.findOne({ name: decoded.org_name });

		if (!organisation) {
			return res.status(401).json({
				message: "You are not authorized to access this route",
			});
		}
		req.org_name = organisation.name;
		return next();
	} catch (error) {
		console.log("Error from user authentication >>>>> ", error.message);
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				error: true,
				message: "Token expired.",
			});
		}
		return next(error);
	}
};

module.exports = {
	checkAuth,
	checkAppToken,
	checkAuthServiceToken,
};
