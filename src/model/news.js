require("dotenv").config();
const mongoose = require("mongoose");


const NewsSchema = mongoose.Schema({
    createdBy: {
        type: String,
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
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

const News = mongoose.model("news", NewsSchema);
module.exports = News;
