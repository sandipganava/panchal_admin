require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const AdminSchema = mongoose.Schema({
 
    firstname: {
        type: String,
    },
    user_name: {
        type: String,
    },
    password: {
        type: String,
    },
  
    personal_email: {
        type: String,
    },
    status: {
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
    token: {
        type: String,
        // required: true,
    },
});

AdminSchema.methods.genrateToken = async function () {
    try {
        const token = jwt.sign(
            { _id: this._id.toString() },
            process.env.JWT_SECRET
        );
        this.token = token;
        await this.save();
        return token;
        console.log(token);
    } catch (e) {
        console.log(e);
    }
};

AdminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // const passsword\Hash=await bcrypt.hash(password,10);
        // console.log(`the password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        // console.log(`tha password is ${this.password}`);
        // this.cnf_password = undefined;
    }
    next();
});

const Users = mongoose.model("admins", AdminSchema);
module.exports = Users;
