const axios = require("axios");
require("dotenv").config();


exports.axiosdata = function (method, url, token, data) {
    const apiKey = process.env.API_KEY;
    return axios({
        method: method,
        url: process.env.BASE_URL + url,
        headers: {
            "x-access-token": token,
            "x-api-key": apiKey,
            "isadmin": true,
        },
        
        data: data
    })
};