const routes = require("../constants/routesGroup");
const { User, App } = require("../models");
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
			const user = await User.findById(decoded.userId);
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

//handle all requests from auth-service
const checkAppToken = async (req, res, next) => {
	if (
		routes.authServiceRoutes.includes(req.path) &&
		!routes.secureRoutes.includes(req.path)
	) {
		if (!req.headers["app-token"]) {
			return res.status(412).json({
				message: "Access denied!! Missing authorization credentials",
			});
		}
		const appToken = req.headers["app-token"];
		let decodedToken;

		separateBearer = appToken.split(" ");
		if (separateBearer.includes("Bearer")) {
			decodedToken = separateBearer[1];
		} else {
			decodedToken = appToken;
		}

		try {
			const decoded = authHelper.verifyAppToken(decodedToken);

			if (!decoded) {
				return res.status(404).json({
					nessage: "You are using an invalid token",
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
	} else {
		return next();
	}
};

//middleware to handle all requests going to auth-service
const checkAuthServiceToken = (req, res, next) => {
	if (
		routes.authRoutes.includes(req.path) &&
		!routes.secureRoutes.includes(req.path)
	) {
		if (!req.headers["auth-service-token"]) {
			return res.status(412).json({
				message: "Access denied. Missing authorization credentials",
			});
		}

		const authServiceToken = req.headers["auth-service-token"];

		let decodedToken;

		separateBearer = authServiceToken.split(" ");
		if (separateBearer.includes("Bearer")) {
			decodedToken = separateBearer[1];
		} else {
			decodedToken = authServiceToken;
		}
		try {
			const decoded = authHelper.verifyJwtToken(decodedToken);

			if (!decoded) {
				return res.status(404).json({
					nessage: "You are using an invalid token",
				});
			}
			req.org_name = decoded;
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
	} else {
		return next();
	}
};

module.exports = {
	checkAuth,
	checkAppToken,
	checkAuthServiceToken,
};
