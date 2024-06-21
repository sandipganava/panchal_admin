require("dotenv").config();
const mongoose = require("mongoose");

const OtpSchema = mongoose.Schema({
  otp: {
    type: Number,
  },
  user_id: {
    type: mongoose.ObjectId,
  },
  created_at: {
    type: Date, 
    default: Date.now, 
    expires: 600  
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

const Otps = mongoose.model("otp", OtpSchema);
module.exports = Otps;
