const mongoose = require("mongoose");
const { Types: { ObjectId } } = mongoose;

const checkAppId = (req, res, next) => {
    const { appId } = req.params;
    // check if the mongoose id is valid or not
    const isValidId = ObjectId.isValid(appId) && (new ObjectId(appId)).toString() === appId;
    if (isValidId) {
        return next();
    } else {
        return res.status(422).json({
            errors: {
                message: "Invalid Application ID entered!!",
            },
        });
    }
};

const checkUserId = (req, res, next) => {
    const { userId } = req.params;
    const isValidId = ObjectId.isValid(userId) && (new ObjectId(userId)).toString() === userId;
    if (isValidId) {
        return next();
    } else {
        return res.status(422).json({
            errors: {
                message: "Invalid User ID entered!!",
            },
        });
    }
};

module.exports = {
    checkAppId,
    checkUserId,
};
