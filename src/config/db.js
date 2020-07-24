const mongoose = require("mongoose"),
    { red, blue } = require("chalk"),
    { DB_URI } = require("./");
    
const dbConnect = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log(blue('Database connected successfully.'));
    } catch (err) {
        console.log(red(`Mongoose connection was not succesful due to: ${err}`));
    }
};

module.exports = dbConnect;