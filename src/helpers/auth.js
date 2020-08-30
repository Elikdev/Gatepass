const bcrypt = require("bcryptjs"),
	jwt = require("jsonwebtoken"),
	config = require("../config");

const comparePassword = (password, hashedPassword) => {
	return bcrypt.compareSync(password, hashedPassword);
};

const hashPassword = password => {
	return bcrypt.hashSync(password, 10);
};

const createJwtToken = (payload, expIn) => {
	return jwt.sign(payload, config.JWT_SECRET_KEY, {
		expiresIn: expIn,
	});
};

const verifyJwtToken = token => {
	return jwt.verify(token, config.JWT_SECRET_KEY);
};
const verifyAppToken = token => {
	return jwt.verify(token, config.APP_SECRET);
};

module.exports = {
	comparePassword,
	hashPassword,
	createJwtToken,
	verifyJwtToken,
	verifyAppToken,
};
