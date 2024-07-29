var express = require('express');
var apirouter = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

var user = require('../apicontroller/apiContoller')
require("dotenv").config();
const apiKey = process.env.API_KEY;

const checkApiKey = (req, res, next) => {
  const apiKeyHeader = req.headers["x-api-key"];
  if (!apiKeyHeader || apiKeyHeader !== apiKey) {
    res.status(403).json({ Error: "Forbidden" });
  } else {
    next();
  }
};

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the destination directory for file uploads
    cb(null, '../../uploads/');
  },
  filename: function (req, file, cb) {
    console.log(file.originalname, "file.originalname")
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });
/* login && register.  new changes*/
// admin login
apirouter.post('/register', user.register);
apirouter.post('/login', user.login);
// user login 
apirouter.post('/userlogin', user.userlogin);
apirouter.post('/adduser', upload.array('photo', 1), user.adduser);
apirouter.post('/user_register', user.user_register);
apirouter.post('/profile_image/:id', user.profile_image);
apirouter.post('/profile_banner/:id', user.profile_banner);

apirouter.post('/search', checkApiKey, user.search);
apirouter.post('/villagebyuser', checkApiKey, user.villageByUser);
apirouter.post('/addchildUser/:id', user.addchildUser);
apirouter.post('/addfamily/:id', user.addfamily);
apirouter.get('/user-list', user.user_list); // for app site listing
apirouter.get('/user_listing', user.user_listing); // for admin site listing
apirouter.get('/all-user', user.all_user);
apirouter.get('/admin-list', user.admin_list);
apirouter.post('/admin-delete/:id', user.admin_delete);
apirouter.get('/admin-edit/:id', user.admin_edit);

//child maintain 
apirouter.get('/add_childUser/:id', user.add_childUser);

apirouter.post('/admin-update/:id', user.admin_update);
apirouter.get('/user-edit/:id', user.user_edit);
apirouter.get('/childuser-edit/:id', user.childuser_edit);
apirouter.post('/child_update/:id', user.child_update);
apirouter.post('/user-update/:id', user.user_update);
apirouter.post('/update-email/:id', user.update_email);
apirouter.post('/user-delete/:id', user.user_delete);
apirouter.get('/viewUser/:id', user.viewUser);
apirouter.get('/viewchildUser/:id', user.viewchildUser);

apirouter.post('/send-otp', user.forgetpass);
apirouter.post('/check-otp', user.checkOtp);
apirouter.post('/forgetpassword/:id', user.updatePassword);

apirouter.post('/postpassword/:id', user.postpassword);
apirouter.post('/change_password', user.change_password);
apirouter.post('/password_change', user.change_user_password);

apirouter.post('/contactus', user.Contactus);
apirouter.get('/contactus', user.listcontact);
apirouter.get('/contact-delete', user.deleteContact);

apirouter.get('/locationdata', user.locationdata);
apirouter.post('/location', user.location);
apirouter.get('/location', user.listlocation);
apirouter.get('/location-edit/:id', user.location_edit);
apirouter.post('/location-edit/:id', user.location_update);
apirouter.post('/location-delete/:id', user.location_delete);

apirouter.post('/aboutus', user.aboutus);
apirouter.get('/aboutus', user.listaboutus);
apirouter.post('/delete_aboutus/:id', user.delete_aboutus);
apirouter.get('/aboutus-edit/:id', user.aboutus_edit);
apirouter.post('/aboutus-edit/:id', user.aboutus_update);


apirouter.post('/committee_members', user.CommitteeMembers);
apirouter.get('/committee_members', user.listCommitteeMembers);
apirouter.post('/delete_committee_members/:id', user.delete_CommitteeMembers);
apirouter.get('/committee_members-edit/:id', user.CommitteeMembers_edit);
apirouter.post('/committeemembers-edit/:id', user.CommitteeMembers_update);

apirouter.post('/slider', user.slider);
apirouter.get('/slider', user.listslider);
apirouter.post('/delete_slider/:id', user.delete_slider);

apirouter.get('/listsettings', user.listsettings);
apirouter.post('/createSetting', user.createSetting);
apirouter.get('/editSetting/:id', user.editSetting);
apirouter.post('/editSetting/:id', user.updateSetting);
apirouter.post('/deleteSetting/:id', user.deleteSetting);

apirouter.post('/payment', user.payment);
apirouter.get('/payment', user.getpayment);
// apirouter.get('/paymentreceipt', user.getpaymentreceipt);


apirouter.post('/order', user.order);

apirouter.get('/paymentReceipt/:id', user.paymentReceipt);
apirouter.get('/Allpayment', user.AllpaymentData);
apirouter.get('/download', user.download);
apirouter.get('/test', user.test);
apirouter.post('/changePassword', user.changePassword);
apirouter.get('/relationship-data', user.relationship);
apirouter.post('/check_mobile', user.checkMobileNo);

//  news API
apirouter.get('/news', user.news);
apirouter.post('/news', user.newsPost);
apirouter.get('/news-edit/:id', user.news_edit);
apirouter.post('/news-edit/:id', user.news_update);
apirouter.post('/news-delete/:id', user.news_delete);
apirouter.get('/notification/:id', user.notification);
// apirouter.post('/send-otp', user.send_otp)
// apirouter.post('/verify-otp', user.verify_otp)

apirouter.get('/userroot', user.userroot);
// family free
apirouter.get('/familyData/:id', user.childData);
apirouter.get('/userList/:id', user.userList);

apirouter.get('/updateDatatypes', user.updateDatatypes);

apirouter.get('/faq', user.getfaq);
apirouter.post('/faq', user.createfaq);
apirouter.get('/faq-edit/:id', user.editfaq);
apirouter.post('/faq-edit/:id', user.updatefaq);
apirouter.post('/faq-delete/:id', user.deletefaq);

apirouter.post('/email_support', user.email_support);
apirouter.get('/email_support', user.getemail_support);


// joinpage data for app
apirouter.get('/joinpage', user.joinpage);
apirouter.post('/createjoinpage', user.createjoinpage);
apirouter.get('/editjoinpage/:id', user.editjoinpage);
apirouter.post('/editjoinpage/:id', user.updatejoinpage);
apirouter.post('/deletejoinpage/:id', user.deletejoinpage);

// terms and condition
apirouter.get('/termsandcondition', user.termsandcondition);
apirouter.post('/createTermsandcondition', user.createTermsandcondition);
apirouter.get('/editTermsandcondition/:id', user.editcreateTermsandcondition);
apirouter.post('/editTermsandcondition/:id', user.updatecreateTermsandcondition);
apirouter.get('/deleteTermsandcondition/:id', user.deletecreateTermsandcondition);

apirouter.get('/getPlans', user.getPlans);
apirouter.post('/createPlans', user.createPlans);
apirouter.post('/createSubscriptions', user.createSubscription);
apirouter.post('/registerBusiness', user.registerBusiness);
apirouter.get('/getBusiness/:id', user.getBusiness);
apirouter.post('/editBusiness/:id', user.updateBusiness);
apirouter.post('/activeBusiness', user.activeBusiness);

apirouter.get('/userBusinesses/:user_id', user.userBusinesses);
apirouter.get('/allBusinesses', user.allBusinesses);
apirouter.get('/businessTemplate', user.businessTemplate);
apirouter.get('/businessPreview/:id', user.businessPreview);

apirouter.get('/templateListing', user.templateListing);
apirouter.delete('/deleteBusiness/:id', user.deleteBusiness);
apirouter.delete('/cancelSubscription/:id', user.cancelSubscription);
apirouter.post('/businessOrder/:id', user.businessOrder);

// apirouter.get('/')

apirouter.post('/webhook', user.webhook);


module.exports = apirouter;