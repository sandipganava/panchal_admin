require("dotenv").config();
const mongoose = require("mongoose");


const condition = mongoose.Schema({
    titleE: {
        type: String,
    },
    descriptionE: {
        type: String,
    },
    titleG: {
        type: String,
    },
    descriptionG: {
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

const Condition = mongoose.model("condition", condition);
module.exports = Condition;
