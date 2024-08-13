// var session = async (req, res, next) => {
//     sess = req.session;
//     sess.redirectUrl = req.originalUrl
//     if (!(sess.userdetails)) {
//         res.redirect('/')
//     } else {
//         next();
//     }
// }
// module.exports = session;


const jwt = require('jsonwebtoken')
require('dotenv').config();

let isLogin = (req, res, next) => {

    try {
        const token = req.cookies?.token;
        if (!token || token == undefined) {
            console.log('sadsadadsad')
            return res.redirect("/");
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json('Invalid token, Please login again');
            }
            req.user = decoded;
            next();
        });
    } catch (err) {
        console.log("While login middlware error: "+ err.message)
    }

}

module.exports= isLogin