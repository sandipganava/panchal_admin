require("dotenv").config();
const mongoose = require("mongoose");


const PaymentSchema = mongoose.Schema({
 
    razorpay_payment_id: {
        type: String,
    },
    status_code: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId, // Change the type to ObjectId
        ref: 'User', // Assuming the model name for users is "User"

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

const Payment = mongoose.model("payment", PaymentSchema);
module.exports = Payment;
