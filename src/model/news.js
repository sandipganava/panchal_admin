require("dotenv").config();
const mongoose = require("mongoose");


const NewsSchema = mongoose.Schema({
    createdBy: {
        type: String,
    },
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
    image: {
        type: String,
        default: "news_defult.png"
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
