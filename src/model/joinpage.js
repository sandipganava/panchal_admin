require("dotenv").config();
const mongoose = require("mongoose");

const JoinpageSchema = mongoose.Schema({
 
    image: {
        type: String,
    },
    title: {
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

const joinpage = mongoose.model("joinpage", JoinpageSchema);
module.exports = joinpage;
