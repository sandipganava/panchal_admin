require("dotenv").config();
const mongoose = require("mongoose");


const orderSchema = mongoose.Schema({
    order_id: {
        type: String,
    },
    business_id: {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        ref: 'business'
    },
    amount: {
        type: String,
    },
    receipt: {
        type: String
    },
    notes: {
        application: {
            type: String
        },
        mobileNumber: {
            type: String
        },
        username: {
            type: String
        }
    },
    status: {
        type: String
    },
    payment_id:{
        type: String
    },
    currency: {
        type: String
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

const BusinessOrder = mongoose.model("business_order", orderSchema);
module.exports = BusinessOrder;
