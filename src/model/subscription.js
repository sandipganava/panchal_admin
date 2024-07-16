require("dotenv").config();
const mongoose = require("mongoose");


const SubscriptionSchema = mongoose.Schema({
    razorpay_subscription_id: {
        type: String,
    },
    razorpay_plan_id: {
        type: String,
    },
    total_count: {
        type: Number
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    business_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'business'
    },
    customer_notify: {
        type: Boolean,
    },
    payment_id: {
        type: String,
        default: null
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
    },

});

const Subscription = mongoose.model("subscription", SubscriptionSchema);
module.exports = Subscription;
