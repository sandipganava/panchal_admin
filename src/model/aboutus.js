require("dotenv").config();
const mongoose = require("mongoose");


const AboutUsSchema = mongoose.Schema({
 
    title: {
        type: String,
    },
    image: {
        type: String,
    },
    description: {
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

const About = mongoose.model("about", AboutUsSchema);
module.exports = About;
