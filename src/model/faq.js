require("dotenv").config();
const mongoose = require("mongoose");


const FaqSchema = mongoose.Schema({
    questionE: {
        type: String,
    },
    answerE: {
        type: String,
    },
    questionG: {
        type: String,
    },
    answerG: {
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
