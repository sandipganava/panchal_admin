require("dotenv").config();
const mongoose = require("mongoose");


const FaqSchema = mongoose.Schema({
    question: {
        type: String,
    },
    answer: {
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

const Faq = mongoose.model("faq", FaqSchema);
module.exports = Faq;
