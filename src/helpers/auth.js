const bcrypt = require("bcryptjs"),
    jwt = require("jsonwebtoken"),
    config = require("../config");

const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
};

const hashPassword = password => {
    return bcrypt.hashSync(password, 10);
};

const createJwtToken = payload => {
    return jwt.sign(
        payload, 
        config.JWT_SECRET_KEY, 
        { 
            expiresIn: '1d', 
        }
    );
};

module.exports = {
    comparePassword,
    hashPassword,
    createJwtToken,
}