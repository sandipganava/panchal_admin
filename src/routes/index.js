var express = require('express');
var router = express.Router();
const AdminController = require('../controllers/AdminController');
const flash = require('express-flash');
const session = require('express-session');
const sessions = require("../middleware/session");
const FileStore = require("session-file-store")(session);

var options = {
    path: "/sessions",
    logFn: function () {}
};

router.use(
    session({
      store: new FileStore(options),
      secret: "bajhsgdsaj cat",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
    })
  );

router.use(flash());

router.get('/template/:id/:position' , AdminController.businessTemplates);

//  login and logout rote.
router.get('/',  AdminController.loginPage);
router.post('/' , AdminController.login);
router.get('/logout', AdminController.logoutuser);

//forgotpassword
router.get('/forgotpass',  AdminController.getforgotpass);

//home page
router.get('/admin/index',  AdminController.dashboard);
//  admins page.
router.get('/admins', sessions,  AdminController.admins);


//  users page.
router.get('/users', sessions , AdminController.users);
router.get('/plans', sessions ,  AdminController.plans);
router.get('/createPlans', sessions ,AdminController.createPlans);
router.get('/createUser', sessions ,  AdminController.createUser);
router.post('/createUser', sessions, AdminController.addUser);
router.get('/editUser/:id', sessions , AdminController.editUser);
router.post('/editUser/:id', sessions , AdminController.updateUser);
router.get('/deleteUser/:id', sessions , AdminController.deleteUser);

//tree and user details
router.get('/viewTree/:id', sessions , AdminController.viewTree);
router.get('/node-details/:id', sessions , AdminController.nodeDetails);

//create child
router.get('/create_child/:id', sessions , AdminController.create_child);
router.post('/create_child/:id', sessions , AdminController.addChild);

//  villages page.
router.get('/villages', sessions , AdminController.villages);
router.get('/createVillages', sessions , AdminController.createVillages);
router.post('/createVillages', sessions , AdminController.addVillages);
router.get('/editVillages/:id', sessions , AdminController.editVillages);
router.post('/editVillages/:id', sessions , AdminController.updateVillages);
router.get('/delete/:id', sessions , AdminController.deleteVillages);

//  about us page.
router.get('/abouts', sessions , AdminController.abouts);
router.get('/addAboutPage', sessions , AdminController.addAboutPage);
router.post('/addAboutPage', sessions , AdminController.addAboutUsDetails);
router.get('/editAboutus/:id', sessions , AdminController.editAboutus);
router.post('/editAboutus/:id', sessions , AdminController.updateAboutus);
router.get('/deleteAboutus/:id', sessions , AdminController.deleteAboutus);

//  slider page.
router.get('/slider', sessions , AdminController.slider);
router.get('/createSlider', sessions , AdminController.createSilder);
router.post('/createSlider', sessions , AdminController.addSlider);
router.get('/deleteSlider/:id', sessions , AdminController.deleteSlider);

//  committee page. 
router.get('/committee', sessions , AdminController.committee);
router.get('/createCommitee', sessions , AdminController.createCommitee);
router.post('/createCommitee', sessions , AdminController.postCommitee);
router.get('/editCommitee/:id', sessions , AdminController.editCommitee);
router.post('/editCommitee/:id', sessions , AdminController.updateCommitee);
router.get('/deleteCommitee/:id', sessions , AdminController.deleteCommitee);

//  news page.
router.get('/news', sessions , AdminController.news);
router.get('/createNews', sessions , AdminController.createNews);
router.post('/createNews', sessions , AdminController.addNews);
router.get('/editNews/:id', sessions , AdminController.editNews);
router.post('/editNews/:id', sessions , AdminController.updateNews);
router.get('/deleteNews/:id', sessions , AdminController.deleteNews);

//  password page.
router.get('/changeuserPassword', sessions , AdminController.password); // admin change user password.
router.post('/changeuserPassword', sessions , AdminController.changeuserPassword);

// Faqs page
router.get('/faqs', sessions , AdminController.faqs);
router.get('/createFaqs', sessions , AdminController.createFaqs);
router.post('/createFaqs', sessions , AdminController.addFaqs);
router.get('/editFaqs/:id', sessions , AdminController.editFaqs);
router.post('/editFaqs/:id', sessions , AdminController.updateFaqs);
router.get('/deleteFaqs/:id', sessions , AdminController.deleteFaqs);

// Condition page
router.get('/termsandcondition', sessions , AdminController.termsandcondition);
router.get('/createTermsandcondition', sessions , AdminController.createTermsandcondition);
router.post('/createTermsandcondition', sessions , AdminController.addTermsandcondition);
router.get('/editTermsandcondition/:id', sessions , AdminController.editTermsandcondition);
router.post('/editTermsandcondition/:id', sessions , AdminController.updateTermsandcondition);
router.get('/deleteTermsandcondition/:id', sessions , AdminController.deleteTermsandcondition);

//  settings page.
router.get('/settings', sessions , AdminController.settings);
router.get('/createSetting', sessions , AdminController.settingForm);
router.post('/createSetting', sessions , AdminController.createSetting);
router.get('/editSetting/:id', sessions , AdminController.editSetting);
router.post('/editSetting/:id', sessions , AdminController.updateSetting);
router.get('/deleteSetting/:id', sessions , AdminController.deleteSetting);


//  payments page.
router.get('/payments', sessions , AdminController.payments);


//  contacts page.
router.get('/contacts', sessions , AdminController.contacts);

// for login page
router.get('/joinpage', sessions , AdminController.joinpage);
router.get('/addjoinpage', sessions , AdminController.addjoinpage);
router.post('/addjoinpage', sessions , AdminController.addjoinpageData);
router.get('/joinpage-delete/:id', sessions , AdminController.delete_joinpage);
router.get('/joinpage-edit/:id', sessions , AdminController.edit_joinpage);
router.post('/joinpage-edit/:id', sessions , AdminController.joinpage_update);

router.get('/businessListing', sessions , AdminController.businessListing);

router.get('/addBusinesses', sessions , AdminController.businesses);
router.post('/addBusinesses', sessions , AdminController.addBusinesses);
router.get('/editBusiness/:id', sessions ,AdminController.editBusiness)
router.post('/editBusiness/:id', sessions ,AdminController.updateBusiness)


module.exports = router;
