require("dotenv").config();
const mongoose = require("mongoose");


const BusinessSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        // unique: true,
        ref: 'users'
    },
    name: {
        type: String
    },
    role: {
        type: String,
    },
    address: {
        type: String,
    },
    businessContactNumber: {
        type: Number,
    },
    businessEmail: {
        type: String,
        unique: true
    },
    businessLogo: {
        type: String,
        required: true
    },
    businessName: {
        type: String,
    },
    businessShortDetail: {
        type: String,
    },
    businessType: {
        type: String,
    },
    dateOfOpeningJob: {
        type: String,
    },
    businessLongDetail: {
        type: String,
        required: false
    },
    businessWebsite: {
        type: String,
        required: false
    },
    facebook: {
        type: String,
        required: false
    },
    instagram: {
        type: String,
        required: false
    },
    linkedIn: {
        type: String,
        required: false
    },
    phoneNumber2: {
        type: String,
        required: false
    },
    twitter: {
        type: String,
        required: false
    },
    template_id: {
        type: Number
    },
    status: {
        type: String,
        enum: ["payment_pending", "payment_failed", "cancelled", "completed"],
        default: "payment_pending"
    },
    images: {
        front: {
            type: String,
        },
        back: {
            type: String,
        }
    },
    template_id: {
        type: Number,
        default: 1
    },
    is_recurring: {
        type: Boolean,
        default: true
    },
    expired_at: {
        type: String,
        default: null,
    },
    created_at: {
        type: String,
        default: null,
    },
    updated_at: {
        type: String,
        default: null,
    },
    deleted_at: {
        type: String,
        default: null,
    }
});

const Business = mongoose.model("business", BusinessSchema);
module.exports = Business;
