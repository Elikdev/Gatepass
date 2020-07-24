const mongoose = require("mongoose"),
   { Schema }= mongoose;

const userSchema = new Schema(
    {
        fullname: {
            type: String,
            required: true,
        },
        organisation_name: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        security_question: {
            type: String,
            required: true,
        },
        security_answer: {
            type: String,
            required: true,
        },
        confirmed: {
            type: Boolean,
            default: false,
        },
        apps: [
            {
                type: Schema.Types.ObjectId,
                ref: 'App',
            },
        ],
        role: {
            type: String,
            default: "OWNER",
        },
        locations: [String],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);