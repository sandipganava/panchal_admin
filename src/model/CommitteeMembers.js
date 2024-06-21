require("dotenv").config();
const mongoose = require("mongoose");


const CommitteeMembersSchema = mongoose.Schema({
 
    fullname: {
        type: String,
    },
    mobile_number: {
        type: String,
    },
    village: {
        type: String,
    },
    role: {
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

const CommitteeMembers = mongoose.model("committeemembers", CommitteeMembersSchema);

module.exports = CommitteeMembers;
