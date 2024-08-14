require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const UserSchema = mongoose.Schema({

    firstname: {
        type: String,
        required: true
    },
    middlename: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        default: "Panchal",
        required: true
    },
    password: {
        type: String,
    },
    parent_id: {
        type: String,
        default: null
    },
    payment_id: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    locations_id: {
        type: mongoose.ObjectId,
    },
    dob: {
        type: Date,
    },
    mobile_number: {
        type: Number,
    },
    photo: {
        type: String,
        default: 'profile_img.jpg'
    },
    personal_id: {
        type: String,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    pincode: {
        type: String,
    },
    gender: {
        type: String,
        required: true
    },
    education: {
        type: String,
        required: true
    },
    address: {
        type: String,
    },
    relationship: {
        type: String,
        default: null
    },
    job: {
        type: String,
        required: true
    },
    status: {
        type: String,
    },
    marital_status: {
        type: String,
    },
    device_token: {
        type: String,
        default: null
    },
    profile_banner: {
        type: String,
        default: 'profile_banner.png'
    },
    created_at: {
        type: Date, 
        default: Date.now,
    },
    updated_at: {
        type: Date, 
        default: null,
    },
    deleted_at: {
        type: Date, 
        default: null,
    },

});

UserSchema.pre("save", async function (next) {
    if (this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 10);

    next();
});


const Users = mongoose.model("users", UserSchema);
module.exports = Users;
