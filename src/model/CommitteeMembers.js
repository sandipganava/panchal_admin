require("dotenv").config();
const mongoose = require("mongoose");


const CommitteeMembersSchema = mongoose.Schema({
 
    fullnameG: {
        type: String,
    },
    fullnameE: {
        type: String,
    },
    mobile_number: {
        type: String,
    },
    villageG: {
        type: String,
    },
    villageE: {
        type: String,
    },
    roleG: {
        type: String,
    },
    roleE: {
        type: String,
    },
    image: {
        type: String,
        default: "profile_img.jpg"
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
