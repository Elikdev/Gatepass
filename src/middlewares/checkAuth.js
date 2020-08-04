const routes = require("../constants/routesGroup");
const { User } = require("../models");
const authHelper = require("../helpers/auth");

// middleware to authenticate users accessing secure routes 
const checkAuth = async (req, res, next) => {
    if (routes.secureRoutes.includes(req.path)) {
        if (!req.headers.authorization) {
            return res.status(412).json({
                message: "Access denied!! Missing authorization credentials",
            });
        }

        let token = req.headers.authorization;

        if (token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
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
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: true,
                    message: 'Token expired.',
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
};
