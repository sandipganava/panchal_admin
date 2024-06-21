require("dotenv").config();
const mongoose = require("mongoose");


const SliderSchema = mongoose.Schema({
 
    title: {
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

const Slider = mongoose.model("slider", SliderSchema);
module.exports = Slider;
