require("dotenv").config();
const mongoose = require("mongoose");


const LocationSchema = mongoose.Schema({
 
    city: {
        type: String,
    },
    village: {
        type: String,
    },
    pincode: {
        type: String,
    },
    image: {
        type: String,
        default: 'defaultVillage.jpg'
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

const Locations = mongoose.model("locations", LocationSchema);
module.exports = Locations;
