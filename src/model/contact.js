require("dotenv").config();
const mongoose = require("mongoose");


const ContactSchema = mongoose.Schema({
 
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    massage: {
        type: String,
    },
    created_at: {
        type: String,
        default: new Date(),
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

const Contact = mongoose.model("contact", ContactSchema);
module.exports = Contact;
