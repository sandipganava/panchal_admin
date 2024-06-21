require("dotenv").config();
const mongoose = require("mongoose");


const emailSupportSchema = mongoose.Schema({
    email: {
        type: String,
    },
    subject: {
        type: String,
    },
    message: {
        type: String,
    },
    created_at: {
        type: String,
        default: Date.now,
    },
    updated_at: {
        type: String,
        default: null,
    },
    deleted_at: {
        type: String,
        default: null,
    },

});

const Emailsupport = mongoose.model("emailsupport", emailSupportSchema);
module.exports = Emailsupport;
