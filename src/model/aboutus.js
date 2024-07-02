require("dotenv").config();
const mongoose = require("mongoose");


const AboutUsSchema = mongoose.Schema({
 
    titleE: {
        type: String,
    },
    titleG: {
        type: String,
    },
    descriptionE: {
        type: String,
    },
    descriptionG: {
        type: String,
    },
    image: {
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
