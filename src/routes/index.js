var express = require('express');
var router = express.Router();
const AdminController = require('../controllers/AdminController');
const flash = require('express-flash');
const session = require('express-session');
// const = require("../middleware/session");
const FileStore = require("session-file-store")(session);



router.get('/template/:id/:position', AdminController.businessTemplates);

//  login and logout rote.
router.get('/', AdminController.loginPage);
router.post('/', AdminController.login);
router.get('/logout', AdminController.logoutuser);

//forgotpassword
router.get('/forgotpass', AdminController.getforgotpass);

//home page
router.get('/admin/index', AdminController.dashboard);
//  admins page.
router.get('/admins', AdminController.admins);


//  users page.
router.get('/users', AdminController.users);
router.get('/plans', AdminController.plans);
router.get('/createPlans', AdminController.createPlans);
router.get('/createUser', AdminController.createUser);
router.post('/createUser', AdminController.addUser);
router.get('/editUser/:id', AdminController.editUser);
router.post('/editUser/:id', AdminController.updateUser);
router.get('/deleteUser/:id', AdminController.deleteUser);

//tree and user details
router.get('/viewTree/:id', AdminController.viewTree);
router.get('/node-details/:id', AdminController.nodeDetails);

//create child
router.get('/create_child/:id', AdminController.create_child);
router.post('/create_child/:id', AdminController.addChild);

//  villages page.
router.get('/villages', AdminController.villages);
router.get('/createVillages', AdminController.createVillages);
router.post('/createVillages', AdminController.addVillages);
router.get('/editVillages/:id', AdminController.editVillages);
router.post('/editVillages/:id', AdminController.updateVillages);
router.get('/delete/:id', AdminController.deleteVillages);

//  about us page.
router.get('/abouts', AdminController.abouts);
router.get('/addAboutPage', AdminController.addAboutPage);
router.post('/addAboutPage', AdminController.addAboutUsDetails);
router.get('/editAboutus/:id', AdminController.editAboutus);
router.post('/editAboutus/:id', AdminController.updateAboutus);
router.get('/deleteAboutus/:id', AdminController.deleteAboutus);

//  slider page.
router.get('/slider', AdminController.slider);
router.get('/createSlider', AdminController.createSilder);
router.post('/createSlider', AdminController.addSlider);
router.get('/deleteSlider/:id', AdminController.deleteSlider);

//  committee page. 
router.get('/committee', AdminController.committee);
router.get('/createCommitee', AdminController.createCommitee);
router.post('/createCommitee', AdminController.postCommitee);
router.get('/editCommitee/:id', AdminController.editCommitee);
router.post('/editCommitee/:id', AdminController.updateCommitee);
router.get('/deleteCommitee/:id', AdminController.deleteCommitee);

//  news page.
router.get('/news', AdminController.news);
router.get('/createNews', AdminController.createNews);
router.post('/createNews', AdminController.addNews);
router.get('/editNews/:id', AdminController.editNews);
router.post('/editNews/:id', AdminController.updateNews);
router.get('/deleteNews/:id', AdminController.deleteNews);

//  password page.
router.get('/changeuserPassword', AdminController.password); // admin change user password.
router.post('/changeuserPassword', AdminController.changeuserPassword);

// Faqs page
router.get('/faqs', AdminController.faqs);
router.get('/createFaqs', AdminController.createFaqs);
router.post('/createFaqs', AdminController.addFaqs);
router.get('/editFaqs/:id', AdminController.editFaqs);
router.post('/editFaqs/:id', AdminController.updateFaqs);
router.get('/deleteFaqs/:id', AdminController.deleteFaqs);

// Condition page
router.get('/termsandcondition', AdminController.termsandcondition);
router.get('/createTermsandcondition', AdminController.createTermsandcondition);
router.post('/createTermsandcondition', AdminController.addTermsandcondition);
router.get('/editTermsandcondition/:id', AdminController.editTermsandcondition);
router.post('/editTermsandcondition/:id', AdminController.updateTermsandcondition);
router.get('/deleteTermsandcondition/:id', AdminController.deleteTermsandcondition);

//  settings page.
router.get('/settings', AdminController.settings);
router.get('/createSetting', AdminController.settingForm);
router.post('/createSetting', AdminController.createSetting);
router.get('/editSetting/:id', AdminController.editSetting);
router.post('/editSetting/:id', AdminController.updateSetting);
router.get('/deleteSetting/:id', AdminController.deleteSetting);


//  payments page.
router.get('/payments', AdminController.payments);


//  contacts page.
router.get('/contacts', AdminController.contacts);

// for login page
router.get('/joinpage', AdminController.joinpage);
router.get('/addjoinpage', AdminController.addjoinpage);
router.post('/addjoinpage', AdminController.addjoinpageData);
router.get('/joinpage-delete/:id', AdminController.delete_joinpage);
router.get('/joinpage-edit/:id', AdminController.edit_joinpage);
router.post('/joinpage-edit/:id', AdminController.joinpage_update);

router.get('/businessListing', AdminController.businessListing);

router.get('/addBusinesses', AdminController.businesses);
router.post('/addBusinesses', AdminController.addBusinesses);
router.get('/editBusiness/:id',AdminController.editBusiness)
router.post('/editBusiness/:id',AdminController.updateBusiness)


module.exports = router;
