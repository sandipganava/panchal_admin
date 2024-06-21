const nodemailer = require("nodemailer");
const user = require("../model/user")
var ejs = require('ejs');
const path = require('path');
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const registerEmail = async (name, number, password, personal_email, date) => {

    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: 'codecrew0@gmail.com',
              pass: 'khngacrqkjwarhid',
            },
          });

          const viewsDir = path.join(__dirname, '..', 'views');

const ejsFilePath = path.join(viewsDir, 'partials', 'registermail.ejs');
          
ejs.renderFile(ejsFilePath, { name: name, number: number, password: password, personal_email:personal_email, date:date }, (err, data) => {
            if (err) {
                console.log(err);
            } else {
             
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: personal_email,
                    subject: "SuccessFully Register",
                    text: "text hiiiii",
                    html: data

                })
                console.log("email sent sucessfully");
            }
        });
    } catch (error) {
        console.log(error, "email not sent");
    }
};
module.exports = registerEmail;