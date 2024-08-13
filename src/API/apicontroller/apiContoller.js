const user = require('../../model/user')
const Faq = require('../../model/faq')
const admin = require('../../model/admin')
const location = require('../../model/location')
const contact = require('../../model/contact')
const aboutus = require('../../model/aboutus')
const slider = require('../../model/slider')
const payment = require('../../model/payment')
const joinpage = require('../../model/joinpage')
const otp = require('../../model/otp')
const news = require('../../model/news')
const Settings = require("../../model/settings");
const CommitteeMembers = require("../../model/CommitteeMembers");
const fs = require('fs').promises;
const pdf = require('html-pdf');
const ejs = require('ejs');
const { promisify } = require('util');
const firebase_admin = require('firebase-admin');
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");
const validation = require('../../helpers/validation');
const apicontroller = {};
const BSON = require('bson');
const path = require('path')
const { ObjectId } = require('mongodb');
const i18n = require('i18n');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const sendEmail = require("../../utils/send_forget_mail");
const registerEmail = require("../../utils/send_register_mail")
const { json } = require('express')
const { request } = require('http')
const { default: axios } = require('axios')
require("dotenv").config();
const serviceAccount = require('../../utils/serviceAccountKey.json');
const adminEmail = 'codecrew0@gmail.com';
const mongoose = require('mongoose');
const Emailsupport = require('../../model/emailsupport')
const Condition = require('../../model/condition')
const { error } = require('console')
const Plan = require('../../model/plans')
const Subscription = require('../../model/subscription')
const Business = require('../../model/business')
const multer = require('multer')
const { default: puppeteer } = require('puppeteer')
const crypto = require('crypto')
const BusinessOrder = require('../../model/businessOrder')
const { getTargetDate } = require('../../utils/helper')
const moment = require('moment')
const Locations = require('../../model/location')
const sanitizeHtml = require('sanitize-html');
const genarateToken = require('../../utils/genarateToken')

firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
});

const renderTemplateToImage = async (template, data) => {
    const dirPath = __dirname.split('\\src')[0]
    const html = await ejs.renderFile(path.join(dirPath, 'views', `template/${template}.ejs`), data);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.setViewport({
        width: 600,
        height: 1000
    });

    const imageBuffer = await page.screenshot();
    await browser.close();
    return imageBuffer
};

const renderImage = async (templatePath, outputPath, data) => {
    const html = await ejs.renderFile(templatePath, data);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    await page.setViewport({
        width: 600,
        height: 1000
    });

    const imageBuffer = await page.screenshot();
    await browser.close();
    await fs.writeFile(outputPath, imageBuffer, { flag: 'w' });
};

const renderFrontAndBackImage = async (template, data) => {
    const dirPath = __dirname.split('\\src')[0];
    const uploadDir = path.join(dirPath, 'uploads');

    const frontImagePath = path.join(uploadDir, `${data.payload._id}-template-front.png`);
    const backImagePath = path.join(uploadDir, `${data.payload._id}-template-back.png`);

    await renderImage(path.join(dirPath, 'views', `template/card_${template}/front.ejs`), frontImagePath, data);
    await renderImage(path.join(dirPath, 'views', `template/card_${template}/back.ejs`), backImagePath, data);

    return {
        front: `${data.payload._id}-template-front.png`,
        back: `${data.payload._id}-template-back.png`
    };
};

const otpStore = {};

const emailServiceConfig = {
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
};
const transporter = nodemailer.createTransport(emailServiceConfig);

function constructFamilyTree(person, childData) {

    if (!person) {
        return;
    }

    const familyTree = {
        ...person,
        wife: null,
        children: [],
    };
    // Find the wife from the childData
    const wife = childData.find((child) => (child.parent_id === familyTree._id && child.relationship === 'Wife'));

    if (wife) {
        familyTree.wife = wife;
    }

    // Construct the children array
    const children = childData.filter((child) => child.parent_id === person._id && (child.relationship === 'Son' || child.relationship === 'Daughter'));
    familyTree.children = children.map((child) => {
        const childTree = {
            ...child,
            wife: null,
            children: [],
        };

        // Find the wife for the child
        const childWife = childData.find((c) => c.parent_id === child._id && c.relationship === 'Wife');
        if (childWife) {
            childTree.wife = childWife;
        }

        // Find the children for the child
        childTree.children = childData.filter((c) => c.parent_id === child._id && (c.relationship === 'Son' || c.relationship === 'Daughter'));

        // Recursively construct the family tree for the child's children
        childTree.children = childTree.children.map((grandchild) => constructFamilyTree(grandchild, childData));

        return childTree;
    });

    return familyTree;
}




apicontroller.register = async (req, res) => {
    try {
        var email = req.body.personal_email
        var checkemail = await admin.find({ personal_email: email })

        if (checkemail.length !== 0) {
            res.json({ emailError: "email already exist" })
        } else {
            const addUser = new admin({
                firstname: req.body.firstname,
                user_name: req.body.user_name,
                password: req.body.password,
                personal_email: req.body.personal_email,
                status: req.body.status,
            });
            const genrate_token = await addUser.genrateToken();
            const Useradd = await addUser.save();
            res.status(200).json(Useradd)
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

apicontroller.login = async (req, res) => {

    try {
        const personal_email = req.body.email;
        const password = req.body.password;
        const users = await admin.findOne({ personal_email: personal_email });

        if (!users) {
            res.json({ emailError: "Invalid email" });
        } else {

            const isMatch = await bcrypt.compare(password, users.password);

            if (isMatch) {
                var token = genarateToken(users)
                const userdetails = await admin.findByIdAndUpdate(users._id, { token });
                res.status(200).json({ login_status: "login success", userdetails });
            } else {
                res.json({ passwordError: "Incorrect password" });
            }
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

apicontroller.userlogin = async (req, res) => {
    console.log(req.body, 'req body')
    try {
        const { email_or_mobile, password, device_token } = req.body;
        const isEmail = typeof email_or_mobile === 'string' && email_or_mobile.includes('@');
        const query = isEmail
            ? { email: email_or_mobile, deleted_at: null, payment_id: { $ne: null } }
            : { mobile_number: parseInt(email_or_mobile), deleted_at: null, payment_id: { $ne: null } };

        const userFound = await user.findOne(query);

        if (!userFound) {
            const errorMessage = isEmail ? "Invalid email address" : "Invalid mobile number";
            console.log(errorMessage);
            return res.status(404).json({ error: errorMessage });
        }

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) {
            console.log("Incorrect password");
            return res.status(401).json({ error: "Incorrect password" });
        }


        if (device_token) {
            await user.findOneAndUpdate(
                query,
                { $set: { device_token: device_token } },
                { new: true }
            );
        }


        const userData = await user.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "locations_id",
                    foreignField: "_id",
                    as: "locationsData"
                }
            }
        ]);


        const parent_id = userFound._id.toString();
        const childData = await user.find({ parent_id: parent_id, deleted_at: null });

        res.status(200).json({
            status: true,
            message: "Login success",
            showMessage: true,
            // token: token,
            user: userData[0],
            children: childData
        });

    } catch (error) {
        console.error("Internal server error", error);
        res.status(500).json({ error: "Internal server error", error });
    }
};

apicontroller.adduser = async (req, res) => {
    try {
        function generateUniqueCode() {
            const prefix = "PANCHAL";
            const randomDigits = Math.floor(10000 + Math.random() * 90000); // Generate random 5-digit number
            const code = prefix + randomDigits.toString();
            return code;
        }

        const uniqueCode = generateUniqueCode();

        const userDataArray = req.body;

        let parent_id = null;
        let isFirstData = true;

        for (const userDataItem of userDataArray) {
            const addUser = new user({
                firstname: userDataItem.firstname,
                middlename: userDataItem.middlename,
                password: isFirstData ? userDataItem.password : null,
                dob: userDataItem.dob,
                photo: isFirstData ? userDataItem.photo : "profile_img.png",
                state: userDataItem.state,
                city: userDataItem.city,
                pincode: userDataItem.pincode,
                gender: userDataItem.gender,
                mobile_number: userDataItem.mobile_number,
                education: userDataItem.education,
                address: userDataItem.address,
                relationship: userDataItem.relationship,
                job: userDataItem.job,
                status: userDataItem.status,
                marital_status: userDataItem.marital_status,
                personal_id: isFirstData ? uniqueCode : null,
                parent_id: isFirstData ? null : parent_id,
                locations_id: isFirstData ? userDataItem.locations_id : null
            });

            const saveuser = await addUser.save();
            // req.json(saveuser)
            if (isFirstData) {
                parent_id = saveuser._id.toString();
                isFirstData = false;
            }
        }
        res.status(200).json(userDataArray);


    } catch (error) {
        console.log("Error", error)
        res.status(500).send(error);
    }
}

function formatDate(date) {

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const formattedDate = `${day} ${monthNames[monthIndex]}, ${year}`;

    return formattedDate;
}
function generateUserCode(lastCode) {
    const prefix = 'ASGPS';
    const lastNumber = parseInt(lastCode.substr(prefix.length), 10);
    const newNumber = lastNumber + 1;
    const newCode = `${prefix}${String(newNumber).padStart(4, '0')}`;
    return newCode;
}

apicontroller.user_register = async (req, res) => {
    const data = req.body.PerentsData;
    //statical data if needed
    // data.payment_id = '64956f9a074819de3e34ed34';
    // data.device_token = '64956f9a074819de3e34ed34ssdas3445';
    // console.log(data, 'user adat')
    const userData = {};
    const { firstname, middlename, lastname, email, password, dob, mobile_number, address, city, state, pincode, education, job, marital_status, gender, locations_id, device_token, payment_id } = data;
    const validationResult = await validation.performBlankValidations({ firstname, middlename, lastname, password, dob, mobile_number, address, city, state, pincode, education, job, marital_status, gender, locations_id, payment_id })

    if (!validationResult.success) {
        console.log(validationResult.message)
        return res.status(400).json({ massage: validationResult.message })
    }

    function generateUserCode(lastCode) {
        const prefix = 'ASGPS';
        const lastNumber = parseInt(lastCode.substr(prefix.length), 10);
        const newNumber = lastNumber + 1;
        const newCode = `${prefix}${String(newNumber).padStart(4, '0')}`;
        return newCode;
    }

    const currentDate = new Date();
    const date = formatDate(currentDate);

    const name = data.firstname + ' ' + data.lastname

    try {
        // await registerEmail(
        //     name,
        //     mobile_number,
        //     password,
        //     email,
        //     date
        // );


        let lastUser = await user.findOne({ deleted_at: null, parent_id: null }).sort({ _id: -1 }).limit(1);
        lastUser = lastUser.personal_id

        const newUserCode = generateUserCode(lastUser);

        try {
            const addUser = new user({
                firstname: data.firstname,
                middlename: data.middlename,
                lastname: data.lastname,
                email: data.email.toLowerCase(),
                password: data.password,
                dob: data.dob,
                mobile_number: data.mobile_number,
                address: data.address,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                education: data.education,
                job: data.job,
                marital_status: data.marital_status,
                gender: data.gender,
                personal_id: newUserCode,
                locations_id: data.locations_id,
                device_token: data.device_token,
                payment_id: data.payment_id,
            });
            const saveuser = await addUser.save();
            if (saveuser) {
                res.status(200).json(saveuser);
            }
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log("Error in user register node js", error)
        res.status(400).json("Error", error);

    }
}

apicontroller.profile_image = async (req, res) => {
    var id = req.params.id;
    try {
        if (!req.files || !req.files.image) {
            console.log("No Image uploaded")
            return res.status(400).json({ status: false, message: "No Image uploaded", showMessage: true });
        }
        console.log(req.files, "req.filesreq.files")
        console.log(req.body, "req.body")
        let file = req.files.image;
        file.mv("uploads/" + file.name, function (err) {
            if (err) {
                console.log("Image upload failed")
                return res.status(500).json({ status: false, message: "Image upload failed", error: err });
            }
        });

        const updateUser = {
            photo: file.name,
            updated_at: new Date(),
        };

        const userData = await user.findByIdAndUpdate(id, updateUser, { new: true });
        res.status(200).json({ userData, status: true, message: "Profile updated successfully", showMessage: true });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}



apicontroller.profile_banner = async (req, res) => {
    var id = req.params.id;
    try {
        if (!req.files || !req.files.profile_banner) {
            console.log("No Image uploaded")
            return res.status(400).json({ status: false, message: "No Image uploaded", showMessage: true });
        }

        let file = req.files.profile_banner;
        file.mv("uploads/" + file.name, function (err) {
            if (err) {
                console.log("Image upload failed")
                return res.status(500).json({ status: false, message: "Image upload failed", error: err });
            }
        });

        const token = req.cookies.jwt;

        const updateUser = {
            profile_banner: file.name,
            updated_at: new Date(),
        };

        const userData = await user.findByIdAndUpdate(id, updateUser, { new: true });
        console.log("Profile banner updated successfully");
        res.status(200).json({ userData, status: true, message: "Profile banner updated successfully", showMessage: true });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}


const cleanSearchValue = (searchValue) => {

    return searchValue.replace(/[^\w]/gi, '');
};

// apicontroller.search = async (req, res) => {
//     try {
//         let searchValue = req.body.searchValue;
//         searchValue = cleanSearchValue(searchValue);
//         if (searchValue.trim() === '') {
//             return res.json({ status: false, message: 'Invalid search query.' });
//         }

//         const searchData = await user.find({
//             deleted_at: null,
//             parent_id: null,
//             payment_id: { $ne: null },
//             $or: [
//                 { firstname: { $regex: searchValue, $options: "i" } },
//                 { middlename: { $regex: searchValue, $options: "i" } },
//                 { lastname: { $regex: searchValue, $options: "i" } },

//             ],
//         });
//         searchData.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));

//         if (searchData.length > 0) {
//             res.status(200).json({ searchData });
//         } else {
//             console.log("No results found")

//             res.json({ status: false, message: 'No results found.' });
//         }
//     } catch (error) {
//         console.error('Error during search:', error);
//         res.status(500).json({ error: error });
//     }
// };

apicontroller.search = async (req, res) => {
    try {
        const searchValue = cleanSearchValue(req.body.searchValue);

        if (!searchValue.trim()) {
            return res.json({ status: false, message: 'Invalid search query.' });
        }

        let searchData = await location.find({
            deleted_at: null,
            $or: [
                { village: { $regex: searchValue, $options: "i" } },
            ],
        });

        if (searchData.length > 0) {
            const villageId = searchData[0]._id;
            console.log(villageId, "village ID")
            const usersData = await user.aggregate([
                {
                    $match: {
                        parent_id: null,
                        deleted_at: null,
                        payment_id: { $ne: null },
                        locations_id: villageId
                    }
                },
                {
                    $lookup: {
                        from: "locations",
                        localField: "locations_id",
                        foreignField: "_id",
                        as: "locationsData",
                    },
                },

            ]);
            console.log(usersData, 'usersData by village')
            usersData.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));
            res.status(200).json(usersData);
        } else {

            const usersData = await user.aggregate([
                {
                    $match: {
                        parent_id: null,
                        deleted_at: null,
                        payment_id: { $ne: null },
                        $or: [
                            { firstname: { $regex: searchValue, $options: "i" } },
                            { middlename: { $regex: searchValue, $options: "i" } },
                            { lastname: { $regex: searchValue, $options: "i" } },
                        ],
                    },
                },
                {
                    $lookup: {
                        from: "locations",
                        localField: "locations_id",
                        foreignField: "_id",
                        as: "locationsData",
                    },
                },
            ]);

            console.log(usersData, 'usersData by search');
            // Sort usersData if needed
            usersData.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));

            res.status(200).json(usersData);
        }

    } catch (error) {
        console.error('Error during search:', error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


apicontroller.villageByUser = async (req, res) => {
    try {
        const searchValue = req.body.searchValue;
        const location_id = new BSON.ObjectId(searchValue)

        const Useradd = await user.aggregate([
            {
                $match: {
                    parent_id: null,
                    deleted_at: null,
                    payment_id: { $ne: null },
                    locations_id: location_id
                }
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "locations_id",
                    foreignField: "_id",
                    as: "locationsData",
                },
            },

        ]);
        Useradd.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));

        function capitalizeFirstLetter(word) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        Useradd.forEach(user => {
            if (user.firstname) {
                user.firstname = capitalizeFirstLetter(user.firstname.trim());
            }
            if (user.middlename) {
                user.middlename = capitalizeFirstLetter(user.middlename.trim());
            }
            if (user.lastname) {
                user.lastname = capitalizeFirstLetter(user.lastname.trim());
            }
        });
        console.log(Useradd, 'user')
        res.status(200).json(Useradd)

        // const searchValue = req.body.searchValue;
        // // const Useradd = await user.find({ parent_id: null, deleted_at: null, payment_id: { $ne: null } });
        // const usersdata = await user.find({ locations_id: searchValue, parent_id: null, deleted_at: null, payment_id: { $ne: null } })
        // usersdata.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));
        // console.log(usersdata, 'usersdata')
        // res.status(200).json(usersdata)

    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: error });
    }
}

// for testing
// apicontroller.villageByUser = async (req, res) => {
//     try {
//         const searchValue = cleanSearchValue(req.body.searchValue);
//         if (!searchValue.trim()) {
//             return res.json({ status: false, message: 'Invalid search query.' });
//         }

//         let searchData = await location.find({
//             deleted_at: null,
//             $or: [
//                 { village: { $regex: searchValue, $options: "i" } },
//             ],
//         });
//         if (searchData.length > 0) {
//             const villageData = searchData.map(element => element._id);
//             const usersData = await user.find({
//                 locations_id: villageData,
//                 parent_id: null,
//                 deleted_at: null,
//                 payment_id: { $ne: null }
//             });
//             console.log(usersData, 'usersData')
//             usersData.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));
//             res.status(200).json(usersData);
//         } else {
//             const usersData = await user.find({
//                 deleted_at: null,
//                 parent_id: null,
//                 payment_id: { $ne: null },
//                 $or: [
//                     { firstname: { $regex: searchValue, $options: "i" } },
//                     { middlename: { $regex: searchValue, $options: "i" } },
//                     { lastname: { $regex: searchValue, $options: "i" } },

//                 ],
//             });

//             usersData.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));
//             res.status(200).json(usersData);

//         }

//     } catch (error) {
//         console.error('Error during search:', error.stack);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

const getParentsdata = async (userId) => {
    const childrenData = await user.find({ parent_id: userId, deleted_at: null, marital_status: "Married", gender: 'male' });

    let descendants = [];
    for (const child of childrenData) {
        const childDescendants = await getParentsdata(child._id);
        descendants = descendants.concat(childDescendants);
    }
    return childrenData.concat(descendants);
};

apicontroller.add_childUser = async (req, res) => {
    var userData = req.session.userdetails
    var id = req.params.id
    try {

        const mainData = await user.findOne({ _id: id })

        const childUser = await getParentsdata(id)

        const parentData = {
            parentData: [
                {
                    _id: mainData._id,
                    firstname: mainData.firstname,
                    middlename: mainData.middlename,
                    lastname: mainData.lastname
                },
                ...childUser.map(child => ({
                    _id: child._id,
                    firstname: child.firstname,
                    middlename: child.middlename,
                    lastname: child.lastname
                }))
            ]
        };

        res.status(200).json({ success: true, userData, parentData: parentData.parentData });

    } catch (error) {
        console.error('Error load child Form :', error);
        res.json({ success: false, error: error.message });
    }

};

apicontroller.addfamily = async (req, res) => {
    const parentId = req.params.id;
    const childData = req.body;
    console.log(childData, "childData from api")
    try {

        const newUser = new user({
            parent_id: childData.parent_id,
            firstname: childData.firstname,
            middlename: childData.middlename,
            lastname: childData.lastname,
            email: childData.email || null,
            dob: childData.dob,
            gender: childData.gender,
            mobile_number: childData.mobile_number || null,
            address: childData.address,
            education: childData.education,
            relationship: childData.relationship,
            job: childData.job,
            marital_status: childData.marital_status,
        });

        const savedUser = await newUser.save();
        // console.log(savedUser, "savedUser")
        res.status(200).json({ success: true, savedUser, parentId, showMessage: true, message: "Family member added successfully" });
    } catch (error) {
        console.error('Error saving users:', error);
        res.json({ success: false, error: error.message });
    }
}
apicontroller.addchildUser = async (req, res) => {
    const parentId = req.params.id;
    const childData = req.body;
    try {
        const savedUsers = [];
        for (const child of childData) {
            const newUser = new user({
                parent_id: parentId,
                firstname: child.firstname,
                middlename: child.middlename,
                dob: child.dob,
                gender: child.gender,
                education: child.education,
                relationship: child.relationship,
                job: child.job,
                status: child.status,
                marital_status: child.maritalStatus
            });

            const savedUser = await newUser.save();
            savedUsers.push(savedUser);
        }

        const familyData = await user.find({ parent_id: parentId, deleted_at: null });
        res.status(200).json({ success: true, data: savedUsers, familyData: familyData, showMessage: true, message: "Family member added successfully" });
    } catch (error) {
        console.error('Error saving users:', error);
        res.json({ success: false, error: error.message });
    }
}


apicontroller.user_list = async (req, res) => {

    try {
        const { search } = req.query;

        // Build the match condition dynamically based on search parameters
        const matchConditions = {
            parent_id: null,
            deleted_at: null,
            payment_id: { $ne: null }
        };

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            matchConditions.$or = [
                { firstname: searchRegex },
                { middlename: searchRegex },
                { lastname: searchRegex }
            ];
        }

        const userData = await user.aggregate([
            {
                $match: matchConditions
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "locations_id",
                    foreignField: "_id",
                    as: "locationsData",
                },
            },
        ]);

        // Sort by first name
        userData.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));

        // Capitalize first letter of names
        function capitalizeFirstLetter(word) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        userData.forEach(user => {
            if (user.firstname) {
                user.firstname = capitalizeFirstLetter(user.firstname.trim());
            }
            if (user.middlename) {
                user.middlename = capitalizeFirstLetter(user.middlename.trim());
            }
            if (user.lastname) {
                user.lastname = capitalizeFirstLetter(user.lastname.trim());
            }
        });

        // console.log(userData, 'userData');
        res.status(200).json(userData);

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

apicontroller.user_listing = async (req, res) => {


    try {
        const Useradd = await user.find({ parent_id: null, deleted_at: null })
        Useradd.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));

        function capitalizeFirstLetter(word) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        Useradd.forEach(user => {
            if (user.firstname) {
                user.firstname = capitalizeFirstLetter(user.firstname.trim());
            }
            if (user.middlename) {
                user.middlename = capitalizeFirstLetter(user.middlename.trim());
            }
            if (user.lastname) {
                user.lastname = capitalizeFirstLetter(user.lastname.trim());
            }
        });
        res.status(200).json(Useradd)

    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
}

apicontroller.all_user = async (req, res) => {
    try {
        const userData = await user.find({ parent_id: null, payment_id: { $ne: null } });
        // userData.sort((a, b) => a.firstname.localeCompare(b.firstname, 'en', { sensitivity: 'base' }));
        res.status(200).json({ userData })
    } catch (error) {

    }
}

apicontroller.admin_list = async (req, res) => {
    try {
        const Useradd = await admin.find({ deleted_at: null });
        res.status(200).json(Useradd)

    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.admin_delete = async (req, res) => {
    var id = req.params.id

    try {
        const deleteadmin = {
            deleted_at: Date(),
        };
        const newsave = await admin.findByIdAndUpdate(id, deleteadmin);
        res.status(200).json(newsave)

    } catch (error) {
        res.status(500).send(error);
    }
}
apicontroller.user_delete = async (req, res) => {
    var id = req.params.id
    try {
        const deleteuser = {
            deleted_at: Date(),
        };
        const newsave = await user.findByIdAndUpdate(id, deleteuser);
        if (newsave) {
            const parent_id = newsave.parent_id
            const familyData = await user.find({ parent_id: parent_id, deleted_at: null });
            res.status(200).json({ familyData: familyData, showMessage: true, message: "User Deleted Successfully" });
        }

    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}
apicontroller.admin_edit = async (req, res) => {
    var id = req.params.id
    try {
        const admin_edit = await admin.findOne({ _id: id });
        res.status(200).json(admin_edit)
    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.location_edit = async (req, res) => {
    var id = req.params.id
    try {
        const location_edit = await location.findOne({ _id: id });
        res.status(200).json(location_edit)
    } catch (error) {
        res.status(500).send(error);
    }
}
apicontroller.user_edit = async (req, res) => {
    var id = req.params.id
    try {
        const user_edit = await user.findOne({ _id: id });
        res.status(200).json(user_edit)
    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.childuser_edit = async (req, res) => {
    var id = req.params.id
    try {
        const user_edit = await user.findOne({ _id: id });
        res.status(200).json(user_edit)
    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.admin_update = async (req, res) => {
    var id = req.params.id

    try {
        var email = req.body.personal_email
        var checkemail = await admin.find({ personal_email: email })

        if (checkemail.length !== 0) {
            res.json("email already exist")
        } else {

            const updateAdmin = {
                firstname: req.body.firstname,
                user_name: req.body.user_name,
                personal_email: req.body.personal_email,
                updated_at: Date(),
            };

            const newsave = await admin.findByIdAndUpdate(id, updateAdmin, { new: true });
            res.status(200).json(newsave);


        }
    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.location_update = async (req, res) => {
    var id = req.params.id
    console.log(req.body, 'req.body')
    try {
        const updateLocation = {
            city: req.body.city,
            village: req.body.village,
            pincode: req.body.pincode,
            image: req.body.image,
            updated_at: Date(),
        };
        const newsave = await location.findByIdAndUpdate(id, updateLocation, { new: true });

        res.status(200).json(newsave);

    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.user_update = async (req, res) => {
    var id = req.params.id
    try {
        const updateUser = {
            firstname: req.body.firstname,
            middlename: req.body.middlename,
            lastname: req.body.lastname,
            dob: req.body.dob,
            photo: req.body?.photo,
            state: req.body.state,
            city: req.body.city,
            pincode: req.body.pincode,
            mobile_number: req.body.mobile_number,
            locations_id: req.body.locations_id,
            education: req.body.education,
            gender: req.body.gender,
            address: req.body.address,
            relationship: req.body.relationship,
            payment_id: req.body.payment_id,
            job: req.body.job,
            marital_status: req.body.marital_status,
            status: req.body.status,
            email: req.body.email
        };

        const newsave = await user.findByIdAndUpdate(id, updateUser, { new: true });
        const location = await Locations.findById(newsave.locations_id).exec();
        const userData = { ...JSON.parse(JSON.stringify(newsave)), location };
        res.status(200).json({ userData, showMessage: true, status: true, message: "User Updated Successfully" });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

apicontroller.update_email = async (req, res) => {
    const id = req.params.id
    const email = req.body.email
    try {

        const updetedData = await user.findByIdAndUpdate(id, { email: email });
        const mainData = await user.findOne({ _id: updetedData.id });
        console.log(mainData, 'mainData')
        res.status(200).json({ status: true, userData: mainData, message: "Email Update Successfully" });

    } catch (error) {
        console.log(error, 'error');
    }
}
apicontroller.child_update = async (req, res) => {
    var id = req.params.id
    try {
        const updateUser = {
            firstname: req.body.firstname,
            middlename: req.body.middlename,
            lastname: req.body.lastname,
            email: req.body.email,
            mobile_number: req.body.mobile_number,
            dob: req.body.dob,
            education: req.body.education,
            gender: req.body.gender,
            relationship: req.body.relationship,
            address: req.body.address,
            job: req.body.job,
            marital_status: req.body.marital_status,
        };

        const newsave = await user.findByIdAndUpdate(id, updateUser, { new: true });

        const findmain = await user.findOne({ _id: id });
        const parent_id = findmain.parent_id
        const childData = await user.find({ parent_id: parent_id, deleted_at: null });
        res.status(200).json({ newsave, childData, showMessage: true, message: "User Updated Successfully" });

    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}



apicontroller.location_delete = async (req, res) => {
    var id = req.params.id

    try {
        const deletelocation = {
            deleted_at: Date(),
        };
        const newsave = await location.findByIdAndUpdate(id, deletelocation);
        res.status(200).json(newsave)

    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.viewUser = async (req, res) => {
    var id = req.params.id
    try {

        const User = await user.findOne({ deleted_at: null, _id: id });
        const locations_id = User.locations_id

        const villageData = await location.find({ deleted_at: null, _id: locations_id });
        // console.log(villageData, 'villageData')
        const allUser = await user.find({ deleted_at: null, parent_id: id });
        // console.log(User, 'allUser')
        res.status(200).json({ allUser, User, villageData });

    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}

apicontroller.viewchildUser = async (req, res) => {
    var id = req.params.id
    try {
        const User = await user.find({ deleted_at: null, parent_id: id });
        res.status(200).json({ User })

    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}
apicontroller.forgetpass = async (req, res) => {
    try {
        const email = req.body.email
        const emailExists = await user.findOne({ email: email });
        if (emailExists) {

            function generateOTP() {
                return Math.floor(1000 + Math.random() * 9000);
            }
            const Otp = generateOTP();

            const currentDate = new Date();
            const date = formatDate(currentDate);

            const otpDocument = new otp({
                otp: Otp,
                user_id: emailExists._id
            });

            await otpDocument.save();
            const name = emailExists.firstname + ' ' + emailExists.lastname

            await sendEmail(
                emailExists.email && emailExists.email.toLowerCase(),
                name,
                emailExists._id,
                Otp,
                date
            );
            res.status(200).json({ status: true, showMessage: true, message: "Email Sent Successfully" });
        } else {
            console.log("Email Not found")
            res.status(400).json({ status: false, error: "Email Not found" });
        }
    } catch (error) {
        console.log("error", error)
        res.status(500).send({ error: error.message });
    }
}

apicontroller.checkOtp = async (req, res) => {
    try {

        const otpByUser = req.body.otp;
        // console.log(otpByUser,'otp')

        const savedOTP = await otp.findOne({ otp: otpByUser });
        // console.log(savedOTP,'savedOTP')

        if (savedOTP) {
            res.status(200).json({
                status: true, user_id: savedOTP.user_id, showMessage: true, message: "Otp Match Successfully"
            });
        } else {
            res.status(400).json({ error: "Otp is Mismatch or Expiry" });
        }

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

apicontroller.updatePassword = async (req, res) => {
    try {

        const newPassword = req.body.newPassword;
        const cfmPassword = req.body.confirmPassword;
        const userId = req.params.id;
        console.log(req.body, "dsdsdsdsds")
        if (!userId) return res.status(401).json({ error: "Oops! Something went wrong. Please try again." })
        if (newPassword !== cfmPassword) throw new Error("Passwords do not match");

        const userData = await user.findById(userId);
        if (!userData) throw new Error("User not found")

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.findByIdAndUpdate(userId, { password: hashedPassword });

        res.status(200).json({ status: true, message: "Password updated successfully", showMessage: true });

    } catch (error) {
        res.status(500).json({ error: error.message, status: false });
    }
}

apicontroller.postpassword = async (req, res) => {

    try {
        const newPassword = req.body.password;
        const id = req.params.id;

        const userData = await user.find({ _id: id });
        bcrypt.hash(newPassword, 10, (error, hashedPassword) => {

            if (error) {
                console.log("Error hashing password:", error);
            } else {
                user.findOneAndUpdate(
                    { _id: id },
                    { password: hashedPassword },
                    { new: true }
                )
                    .then(updatedUser => {
                        if (updatedUser) {
                            res.status(200).json({ showMessage: true, message: "Password updated successfully" })
                        } else {
                            res.json({ showMessage: true, message: "no user found" })
                        }
                    })
                    .catch(error => {
                        console.log("Error updating password:", error);
                    });
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.change_password = async (req, res) => {
    sess = req.session;
    try {
        const _id = req.body.id;
        const password = req.body.old_password;
        const newpwd = req.body.password;
        const cpassword = req.body.cpassword;
        const bcryptpass = await bcrypt.hash(newpwd, 10);
        const newpassword = {
            password: bcryptpass,
            updated_at: Date(),
        };

        const userData = await user.find({ _id: new ObjectId(_id) });
        const isMatch = await bcrypt.compare(password, userData[0].password);
        if (!isMatch) {
            res.json({
                changePassStatus: false,
                message: "incorrect current password",
            });
        } else if (!(newpwd == cpassword)) {
            res.json({
                changePassStatus: false,
                message: "confirm password not matched",
            });
        } else {
            const newsave = await user.findByIdAndUpdate(_id, newpassword);

            res.status(200).json({ changePassStatus: true, message: "Your Password  Updated successfully" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

apicontroller.change_user_password = async (req, res) => {
    sess = req.session;
    try {
        const _id = req.body.id;
        const password = req.body.old_password;
        const newpwd = req.body.password;
        const cpassword = req.body.cpassword;
        const bcryptpass = await bcrypt.hash(newpwd, 10);
        const newpassword = {
            password: bcryptpass,
            updated_at: Date(),
        };

        const userData = await user.find({ _id: new ObjectId(_id) });
        const isMatch = await bcrypt.compare(password, userData[0].password);
        if (!isMatch) {
            res.status(400).json({
                changePassStatus: false,
                error: "incorrect current password",
            });
        } else if (!(newpwd == cpassword)) {
            res.status(400).json({
                changePassStatus: false,
                error: "confirm password not matched",
            });
        } else {
            const newsave = await user.findByIdAndUpdate(_id, newpassword);

            res.status(200).json({ changePassStatus: true, showMessage: true, message: "Your Password Updated successfully" });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
}

apicontroller.order = async (req, res) => {
    try {
        const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
        const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });
        const razorpay = new Razorpay({
            key_id: razorpay_key_id.value,
            key_secret: razorpay_key_secret.value,
        });

        const amount = await Settings.findOne({ deleted_at: null, key: "amount" });
        const username = req.body.firstname;
        const application = req.body.personal_id;
        const mobileNo = req.body.mobile_number;
        const receipt = `order_${username}_${Date.now()}`;
        const options = {
            amount: amount.value * 100,
            currency: 'INR',
            receipt: receipt,
            payment_capture: 1,
            notes: {
                username: username,
                mobileNumber: mobileNo,
                application: application,
            },
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ order, razorpay_key_id: razorpay_key_id.value });
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: error.message });
    }
}

apicontroller.location = async (req, res) => {

    try {
        const addLocation = new location({
            city: req.body.city,
            village: req.body.village,
            pincode: req.body.pincode,
            image: req.body.image
        });
        const Locationadd = await addLocation.save();
        res.status(200).json(Locationadd)


    } catch (error) {
        res.status(500).send(error);
    }
}



apicontroller.locationdata = async (req, res) => {
    try {

        let locationData = await location.find({ deleted_at: null });
        locationData.sort((a, b) => {
            if (a.village && b.village) {
                return a.village.localeCompare(b.village, 'en', { sensitivity: 'base' });
            }
            if (!a.village && b.village) {
                return 1;
            } else if (a.village && !b.village) {
                return -1;
            } else {
                return 0;
            }
        });

        return res.status(200).json(locationData);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}
apicontroller.listlocation = async (req, res) => {
    try {
        let locationData;
        if (req.query.searchValue) {
            locationData = await location.find({ deleted_at: null, village: { $regex: req.query.searchValue, $options: "i" } });
        } else {

            locationData = await location.find({ deleted_at: null });
            locationData.sort((a, b) => {
                if (a.village && b.village) {
                    return a.village.localeCompare(b.village, 'en', { sensitivity: 'base' });
                }
                if (!a.village && b.village) {
                    return 1;
                } else if (a.village && !b.village) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }

        const transformedData = locationData.map(location => {
            const villageParts = location.village ? location.village.split(' / ') : ['', ''];
            return {
                _id: location._id,
                city: location.city,
                village: location.village,
                image: location.image,
                villageE: villageParts[0],
                villageG: villageParts[1]
            };
        });

        return res.status(200).json({ village: transformedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


apicontroller.Contactus = async (req, res) => {

    try {
        const addContact = new contact({
            name: req.body.name,
            email: req.body.email,
            massage: req.body.massage,
        });
        const ContactUs = await addContact.save();
        res.status(200).json(ContactUs)

    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.listcontact = async (req, res) => {

    try {
        const ContactData = await contact.find({ deleted_at: null });
        console.log(ContactData, "contact::::::")
        res.status(200).json(ContactData)

    } catch (error) {
        res.status(500).send(error);
    }

}



apicontroller.CommitteeMembers = async (req, res) => {
    try {

        const addCommitteeMembers = new CommitteeMembers({
            fullnameG: req.body.fullnameG,
            fullnameE: req.body.fullnameE,
            roleG: req.body.roleG,
            roleE: req.body.roleE,
            mobile_number: req.body.mobile_number,
            villageG: req.body.villageG,
            villageE: req.body.villageE,
            image: req.body?.image || "profile_img.jpg"
        });
        const CommitteeMembersData = await addCommitteeMembers.save();

        res.status(200).json(CommitteeMembersData)

    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.listCommitteeMembers = async (req, res) => {
    try {
        let CommitteeMembersData = await CommitteeMembers.find({ deleted_at: null });

        return res.status(200).json(CommitteeMembersData);

    } catch (error) {
        res.status(500).send(error);
    }

}

apicontroller.delete_CommitteeMembers = async (req, res) => {

    var id = req.params.id
    try {
        const delete_Committee = {
            deleted_at: Date(),
        };
        const newsave = await CommitteeMembers.findByIdAndUpdate(id, delete_Committee);
        res.status(200).json(newsave)

    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.CommitteeMembers_edit = async (req, res) => {
    var id = req.params.id
    try {
        const Committee_edit = await CommitteeMembers.findOne({ _id: id });
        res.status(200).json(Committee_edit)
    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.CommitteeMembers_update = async (req, res) => {
    var id = req.params.id

    try {
        const updateCommitteeMembers = {
            fullnameG: req.body.fullnameG,
            fullnameE: req.body.fullnameE,
            roleG: req.body.roleG,
            roleE: req.body.roleE,
            mobile_number: req.body.mobile_number,
            villageG: req.body.villageG,
            villageE: req.body.villageE,
            image: req.body.image,
            updated_at: Date(),
        };
        const newsave = await CommitteeMembers.findByIdAndUpdate(id, updateCommitteeMembers, { new: true });
        res.status(200).json(newsave);

    } catch (error) {
        res.status(500).send(error);
    }
}


apicontroller.aboutus = async (req, res) => {
    console.log(req.body, 'req.body')
    try {
        const addAboutus = new aboutus({
            titleE: req.body.titleE,
            descriptionE: req.body.descriptionE,
            titleG: req.body.titleG,
            descriptionG: req.body.descriptionG,
            image: req.body.image
        });
        const Aboutus = await addAboutus.save();
        res.status(200).json(Aboutus)

    } catch (error) {
        res.status(500).send(error);
    }
}


apicontroller.listaboutus = async (req, res) => {
    try {
        let AboutusData;
        const isadmin = req.headers.isadmin;
        if (isadmin) {
            AboutusData = await aboutus.find({ deleted_at: null }).sort({ created_at: -1 });
            // console.log(object)
            return res.status(200).json({ AboutusData });
        } else {

            AboutusData = await aboutus.findOne({ deleted_at: null }).sort({ created_at: -1 });
            console.log(AboutusData, 'AboutusData')
            return res.status(200).json({ AboutusData });
        }


    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
};

apicontroller.delete_aboutus = async (req, res) => {

    var id = req.params.id
    try {
        const delete_Aboutus = {
            deleted_at: Date(),
        };
        const newsave = await aboutus.findByIdAndUpdate(id, delete_Aboutus);
        res.status(200).json(newsave)

    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.aboutus_edit = async (req, res) => {
    var id = req.params.id
    try {
        const aboutus_edit = await aboutus.findOne({ _id: id });
        res.status(200).json(aboutus_edit)
    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.aboutus_update = async (req, res) => {
    var id = req.params.id

    try {
        const updateAboutus = {
            titleE: req.body.titleE,
            descriptionE: req.body.descriptionE,
            titleG: req.body.titleG,
            descriptionG: req.body.descriptionG,
            image: req.body.image,
            updated_at: Date(),
        };
        const newsave = await aboutus.findByIdAndUpdate(id, updateAboutus, { new: true });
        res.status(200).json(newsave);

    } catch (error) {
        res.status(500).send(error);
    }
}


apicontroller.slider = async (req, res) => {

    try {

        const sliderData = new slider({
            image: req.body.image,
            title: req.body.title
        });

        const Slider = await sliderData.save();
        res.status(200).json(Slider);

    } catch (error) {
        res.status(400).send(error);
    }

}

apicontroller.listslider = async (req, res) => {
    try {

        let sliderData = await slider.find({ deleted_at: null }).sort({ created_at: -1 });
        return res.status(200).json(sliderData);

    } catch (error) {
        res.status(500).send(error);
    }

}

apicontroller.listsettings = async (req, res) => {
    try {
        const amount = req.query.amount;
        let payload = {
            deleted_at: null
        }
        let SettingsData;
        if (amount) {
            payload.key = "amount"
            SettingsData = await Settings.findOne(payload)
        } else {
            SettingsData = await Settings.find(payload)
        }
        res.status(200).json(SettingsData)

    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}
apicontroller.createSetting = async (req, res) => {
    try {
        const addSetting = new Settings({
            key: req.body.key,
            value: req.body.value,
            type: req.body.type
        });
        const Setting = await addSetting.save();
        res.status(200).json(Setting)

    } catch (error) {
        res.status(500).send(error);
    }
}
apicontroller.editSetting = async (req, res) => {
    var id = req.params.id
    try {
        const Setting_edit = await Settings.findOne({ _id: id });
        res.status(200).json(Setting_edit)
    } catch (error) {
        res.status(500).send(error);
    }

}
apicontroller.updateSetting = async (req, res) => {
    var id = req.params.id
    try {
        const updateSetting = {
            key: req.body.key,
            value: req.body.value,
            type: req.body.type,
            updated_at: Date(),
        };
        const newsave = await Settings.findByIdAndUpdate(id, updateSetting, { new: true });
        res.status(200).json(newsave);

    } catch (error) {
        res.status(500).send(error);
    }

}
apicontroller.deleteSetting = async (req, res) => {
    var id = req.params.id
    try {
        const deleteSetting = {
            deleted_at: Date(),
        };
        const newsave = await Settings.findByIdAndUpdate(id, deleteSetting);
        res.status(200).json(newsave)

    } catch (error) {
        res.status(500).send(error);
    }

}


apicontroller.delete_slider = async (req, res) => {

    var id = req.params.id
    try {
        const delete_slider = {
            deleted_at: Date(),
        };

        const newsave = await slider.findByIdAndUpdate(id, delete_slider);
        res.status(200).json(newsave)

    } catch (error) {
        res.status(500).send(error);
    }

}

apicontroller.payment = async (req, res) => {

    try {
        const addPayment = new payment({
            razorpay_payment_id: req.body.razorpay_payment_id,
            status_code: req.body.status_code,
            user_id: req.body.user_id,
        });
        const updateUser = {
            payment_id: req.body.razorpay_payment_id,
            updated_at: Date(),
        };
        const id = req.body.user_id
        const newsave = await user.findByIdAndUpdate(id, updateUser, { new: true });

        const Payment = await addPayment.save();
        if (Payment) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmail,
                subject: 'New User Registered',
                text: `A new user with the first name ${newsave} has registered.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        }

        res.status(200).json(Payment)

    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.getpayment = async (req, res) => {
    try {
        const paymentData = await payment.aggregate([
            { $match: { deleted_at: null } },
            {
                $lookup: {
                    from: "users", // Assuming the collection name for users is "users"
                    localField: "user_id",
                    foreignField: "_id",
                    as: "userData",
                },
            },
        ]);

        res.status(200).json(paymentData);
    } catch (error) {
        console.error('Error during payment retrieval:', error);
        res.status(500).json({ error: 'An error occurred during payment retrieval' });
    }
};
apicontroller.getpaymentreceipt = async (req, res) => {
    try {
        const payment_id = 'pay_NHfxZHPhUI3Lwz';
        razorpay.payments.fetch(payment_id)
            .then((payment) => {
                console.log("Payment Details:");
                console.log(payment);
                res.json(payment)
            })
            .catch((error) => {
                console.error("Error:", error);
                res, json(error)
            });

        // res.json(paymentData);
    } catch (error) {
        console.error('Error during payment retrieval:', error);
        res.status(500).json({ error: 'An error occurred during payment retrieval' });
    }
};

const generateReceiptPDF = async (payment) => {
    // Load the ejs template
    try {
        const template = await fs.readFile('./receipt.ejs', 'utf-8');
        // Render the ejs template with payment details
        const htmlContent = ejs.render(template, { payment });
        const pdfFilePath = path.join('/uploads', 'Receipt.pdf');
        // Set up PDF options
        const pdfOptions = {
            format: 'Letter',
        };

        return new Promise((resolve, reject) => {
            // Use the toFile method to directly write the PDF to a file
            pdf.create(htmlContent, pdfOptions).toFile(pdfFilePath, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    // Read the PDF file contents
                    resolve(fs.readFile(res.filename));
                }
            });
        });
    } catch (error) {
        console.log(error, "error")
    }

};


apicontroller.paymentReceipt = async (req, res) => {
    try {
        const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
        const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });
        const userDatas = await user.findOne({ deleted_at: null, _id: req.params.id });
        const paymentId = userDatas.payment_id;
        const response = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
            auth: {
                username: razorpay_key_id.value,
                password: razorpay_key_secret.value,
            },
        });
        const payment = response.data;
        // res.render('receipt', { payment });
        console.log("payment", payment)
        const pdfBuffer = await generateReceiptPDF(payment);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Receipt.pdf');
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during payment retrieval', error: error.message });
    }
}

apicontroller.AllpaymentData = async (req, res) => {


    try {
        const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
        const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });
        let skip = 0;
        const countPerPage = 100;
        const response = await axios.get(`https://api.razorpay.com/v1/payments`, {
            auth: {
                username: razorpay_key_id.value,
                password: razorpay_key_secret.value,
            },
            params: {
                skip,
                count: countPerPage,
            },
        });
        const paymentData = response.data;
        res.status(200).json(paymentData)
    } catch (error) {
        console.error('Error fetching payment details:', error.message);
        res.json(error.message)
    }
}

apicontroller.download = async (req, res) => {
    const filePath = path.join(__dirname, 'receipt.pdf');

    res.download(filePath, 'downloaded-file.pdf', (err) => {
        if (err) {
            console.error('Error downloading PDF:', err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}

apicontroller.test = async (req, res) => {
    try {
        const userData = await user.find()
        res.status(200).json(userData)
    } catch (error) {
        res.status(500).json(error)
    }
}

apicontroller.changePassword = async (req, res) => {
    try {
        const MobileNumber = req.body.mobile_number
        const newpwd = req.body.password

        const bcryptpass = await bcrypt.hash(newpwd, 10);
        const newpassword = {
            password: bcryptpass,
            updated_at: Date(),
        };

        const userData = await user.findOne({ mobile_number: MobileNumber });
        if (userData == null) {
            res.json({
                changePassStatus: false,
                message: "Mobile Number not found",
            });
        } else {
            const newsave = await user.findByIdAndUpdate(userData._id, newpassword);
            res.status(200).json({ changePassStatus: true, message: "Your Password  Updated successfully" });
        }

    } catch (error) {
        console.log(error.message, "error")
        res.status(500).json(error)
    }
}

apicontroller.relationship = async (req, res) => {
    try {
        const data = require('../../utils/data.json');
        console.log(data, 'relationship')
        res.status(200).json(data.relationship)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.checkMobileNo = async (req, res) => {
    try {
        const { mobile_number, email } = req.body;

        let response = {};


        if (!mobile_number) {
            response.mobileError = "Mobile number is required";
        }
        if (!email) {
            response.emailError = "Email is required";
        }


        if (response.mobileError || response.emailError) {
            return res.status(400).json(response);
        }


        const [isMatchMobile, isMatchEmail] = await Promise.all([
            user.countDocuments({ mobile_number: mobile_number, parent_id: null, deleted_at: null, payment_id: { $ne: null } }),
            user.countDocuments({ email: email, parent_id: null, deleted_at: null, payment_id: { $ne: null } })
        ]);

        if (isMatchMobile !== 0) {
            response.mobileError = "Mobile number already registered";
        }
        if (isMatchEmail !== 0) {
            response.emailError = "Email already registered";
        }


        if (response.mobileError === "Mobile number not registered" && response.emailError === "Email not registered") {
            return res.json({ success: true });
        }

        res.json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

apicontroller.news = async (req, res) => {
    try {

        let newsdata = await news.find({ deleted_at: null }).sort({ created_at: -1 })
        return res.status(200).json(newsdata);
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.newsPost = async (req, res) => {

    const descriptionE = sanitizeHtml(req.body.descriptionE);
    const descriptionG = sanitizeHtml(req.body.descriptionG);
    try {
        const newNews = new news({
            titleE: req.body.titleE,
            descriptionE: descriptionE,
            titleG: req.body.titleG,
            descriptionG: descriptionG,
            image: req.body?.image || "news_defult.png",
            createdBy: req.body.created_by
        });
        const registrationTokens = await user.find({ deleted_at: null, parent_id: null, });
        const registrationToken = registrationTokens.map((element) => element.device_token);
        const filteredTokens = registrationToken.filter(token => token !== null && token !== undefined);
        const uniqueTokens = [...new Set(filteredTokens)];
        const newsData = await newNews.save();

        return res.status(200).json(newsData);

    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}
apicontroller.news_edit = async (req, res) => {

    var id = req.params.id
    try {
        const news_edit = await news.findOne({ _id: id });
        res.status(200).json(news_edit)
    } catch (error) {
        res.status(500).send(error);
    }
}


apicontroller.news_update = async (req, res) => {
    var id = req.params.id
    try {
        const updateNews = {
            titleE: req.body.titleE,
            descriptionE: req.body.descriptionE,
            titleG: req.body.titleG,
            descriptionG: req.body.descriptionG,
            image: req.body.image,
            createdBy: req.body.created_by,
            updated_at: Date(),
        };
        const newsave = await news.findByIdAndUpdate(id, updateNews, { new: true });
        res.status(200).json(newsave);

    } catch (error) {
        res.status(500).send(error);
    }
}

apicontroller.news_delete = async (req, res) => {

    var id = req.params.id
    try {
        const news_delete = {
            deleted_at: Date(),
        };

        const newsave = await news.findByIdAndUpdate(id, news_delete);
        res.status(200).json(newsave)

    } catch (error) {
        res.status(500).send(error);
    }

}


// apicontroller.notification = async (req, res) => {
//     var id = req.params.id
//     try {
//         const news_edit = await news.findOne({ _id: id });
//         if (!news_edit) {
//             return res.status(404).json({ message: "News item not found" });
//         }

//         const registrationTokens = await user.find({ deleted_at: null, parent_id: null });
//         const registrationToken = registrationTokens.map((element) => element.device_token);
//         const filteredTokens = registrationToken.filter(token => token !== null && token !== undefined);
//         const uniqueTokens = [...new Set(filteredTokens)];
//         console.log(filteredTokens, "filteredTokens")

//         if (uniqueTokens.length === 0) {
//             return res.status(400).json({ message: "No valid device tokens found" });
//         }

//         try {
//             const message = {
//                 notification: {
//                     title: news_edit.title ? String(news_edit.title) : "New Notification",
//                     // body: news_edit.description ? String(news_edit.description) : "",
//                     imageUrl: 'https://codecrewinfotech.com/images/logos/logo-cc.png',
//                 },
//                 data: {
//                     newsId: news_edit._id.toString(),
//                 },
//             };

//             const response = await firebase_admin.messaging().sendToDevice(uniqueTokens, message);

//             let successCount = 0;
//             let failureCount = 0;

//             response.results.forEach((result, index) => {
//                 const error = result.error;
//                 if (error) {
//                     failureCount++;
//                     console.error(`Error sending message to ${uniqueTokens[index]}:`, error);
//                 } else {
//                     successCount++;
//                     console.log(`Successfully sent message to ${uniqueTokens[index]}`);
//                 }
//             });

//             res.status(200).json({
//                 message: "Notification process completed",
//                 successCount,
//                 failureCount
//             });
//         } catch (error) {
//             console.error('Error sending message:', error);
//             res.status(500).json({ error: error.message });
//         }

//     } catch (error) {
//         console.error('Error in notification function:', error);
//         res.status(500).json({ error: error.message });
//     }
// }

apicontroller.notification = async (req, res) => {
    const id = req.params.id;
    try {
        const news_edit = await news.findOne({ _id: id });
        if (!news_edit) {
            return res.status(404).json({ message: "News item not found" });
        }

        const users = await user.find({ deleted_at: null, parent_id: null });
        const registrationTokens = users.map(user => user.device_token).filter(token => token);

        const uniqueTokens = [...new Set(registrationTokens)];

        if (uniqueTokens.length === 0) {
            return res.status(400).json({ message: "No valid device tokens found" });
        }

        const message = {
            notification: {
                title: news_edit.title ? String(news_edit.title) : "New Notification",
                imageUrl: 'https://codecrewinfotech.com/images/logos/logo-cc.png',
            },
            data: {
                newsId: news_edit._id.toString(),
            },
        };

        const response = await firebase_admin.messaging().sendToDevice(uniqueTokens, message);

        let successCount = 0;
        let failureCount = 0;

        response.results.forEach((result, index) => {
            if (result.error) {
                failureCount++;
                console.error(`Error sending message to ${uniqueTokens[index]}:`, result.error);
            } else {
                successCount++;
                console.log(`Successfully sent message to ${uniqueTokens[index]}`);
            }
        });

        res.status(200).json({
            message: "Notification process completed",
            successCount,
            failureCount
        });
    } catch (error) {
        console.error('Error in notification function:', error);
        res.status(500).json({ error: error.message });
    }
};




apicontroller.reset_password_otp = async (req, res) => {
    // const { email } = req.body.email;
    const email = "varmaajay182@gmail.com"

    if (!email) {
        return res.status(400).json({ error: 'undefined email' });
    }
}

apicontroller.userroot = async (req, res) => {
    try {

        const userFound = await user.findOne({ _id: '6626293f0fa0bc22b25f337b', deleted_at: null, payment_id: { $ne: null } });

        const childData = await user.find({ parent_id: '6585538eef8a533587fb004c', deleted_at: null });

        console.log(userFound, 'userFound')
        res.status(200).json({ userFound, childData })
    } catch (error) {
        console.log(error)
    }
}

// Recursive function to fetch all descendants
const getAllDescendants = async (userId) => {
    const childrenData = await user.find({ parent_id: userId, deleted_at: null }, '_id firstname middlename lastname relationship parent_id photo marital_status');
    const mainUser = await user.findOne(
        { _id: userId, deleted_at: null },
        '_id firstname middlename lastname'
    );
    let descendants = [];
    for (const child of childrenData) {
        const childDescendants = await getAllDescendants(child._id);
        descendants = descendants.concat(childDescendants);
    }
    return childrenData.concat(descendants);
};

function trimObjectStrings(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].trim();
        }
    }
}

apicontroller.childData = async (req, res) => {
    // console.log(req.params.id ,'idddddd;')
    try {
        const userId = req.params.id;
        const mainUser = await user.findOne(
            { _id: userId, deleted_at: null },
            '_id firstname middlename lastname parent_id photo'
        );
        if (!mainUser) {
            return res.status(404).send('Main user not found.');
        }

        const userResponse = {
            _id: mainUser._id,
            firstname: mainUser.firstname,
            middlename: mainUser.middlename,
            lastname: mainUser.lastname,
            photo: mainUser.photo,
            marital_status: mainUser.marital_status
        };

        const objectMainUser = JSON.parse(JSON.stringify(userResponse));
        if (!objectMainUser) {
            return res.status(404).send('Main user not found.');
        }

        const childData = await getAllDescendants(userId);
        const response = {
            mainUser: objectMainUser,
            childData: childData.map(child => JSON.parse(JSON.stringify(child)))
        };

        // console.log(response.childData, "childData")
        const familyData = constructFamilyTree(response.mainUser, response.childData);
        res.status(200).json(familyData);
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).send('An error occurred while fetching user data.');
    }
};

apicontroller.userList = async (req, res) => {
    try {
        const id = req.params.id;
        const userData = await user.findOne({ deleted_at: null, _id: id },);
        console.log(userData, "userData")
        res.status(200).json(userData)
    } catch (error) {
        console.log(error)
    }
}



apicontroller.updateDatatypes = async (req, res) => {
    try {
        await user.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );
        await Settings.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );
        await admin.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );
        await aboutus.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );
        await CommitteeMembers.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );
        await contact.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );
        await slider.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );
        await payment.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );
        await otp.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );
        await location.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );

        await news.updateMany(
            { deleted_at: "null", updated_at: "null" },
            { $set: { deleted_at: null, updated_at: null } }
        );

        console.log('Migration completed.');
    } catch (error) {
        console.log(error)
    }
}


apicontroller.getfaq = async (req, res) => {
    try {
        const searchValue = req.query.searchValue;
        let searchData;
        if (searchValue) {
            searchData = await Faq.find({ deleted_at: null, question: { $regex: searchValue, $options: "i" } }, { question: 1, answer: 1 });
        } else {
            searchData = await Faq.find({ deleted_at: null });
        }

        res.status(200).json(searchData);

        // const faqData = await Faq.find({ deleted_at: null }, { question: 1, answer: 1 });
        // res.status(200).json(faqData)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }

}

apicontroller.createfaq = async (req, res) => {
    try {
        const { questionE, answerG, questionG, answerE } = req.body
        const newFaq = new Faq({
            questionE, answerG, questionG, answerE
        });
        const faqData = await newFaq.save();
        res.status(200).json(faqData)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}
apicontroller.editfaq = async (req, res) => {
    try {
        const id = req.params.id;
        const faqData = await Faq.findOne({ _id: id });
        res.status(200).json(faqData)
    }
    catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}
apicontroller.updatefaq = async (req, res) => {
    try {
        const id = req.params.id;
        const { questionE, answerG, questionG, answerE } = req.body
        const updateFaq = {
            questionE, answerG, questionG, answerE
        };
        const newsave = await Faq.findByIdAndUpdate(id, updateFaq, { new: true });
        res.status(200).json(newsave);
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}
apicontroller.deletefaq = async (req, res) => {
    try {
        const id = req.params.id;
        const deletefaq = {
            deleted_at: Date(),
        };
        const deletedData = await Faq.findByIdAndUpdate(id, deletefaq);
        res.status(200).json(deletedData);
    }
    catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}




apicontroller.email_support = async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        const newEmailsupport = new Emailsupport({
            email,
            subject,
            message
        });
        await newEmailsupport.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text: message,
        };

        const EmailsupportData = await newEmailsupport.save();
        if (EmailsupportData) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject,
                text: message,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        }

        res.status(200).json({ EmailsupportData, message: "Email sent successfully", showMessage: true });

    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.getemail_support = async (req, res) => {
    try {
        const emailsupportData = await Emailsupport.find({ deleted_at: null });
        res.status(200).json(emailsupportData)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.deleteEmailSupport = async (req, res) => {

    var id = req.params.id
    try {
        const delete_email = {
            deleted_at: Date(),
        };
        const EmailsupportData = await Emailsupport.findByIdAndUpdate(id, delete_email);
        res.status(200).json(Emailsupport)

    } catch (error) {
        res.status(500).send(error);
    }

}

apicontroller.joinpage = async (req, res) => {
    try {
        const isadmin = req.headers.isadmin;
        let joinData
        if (isadmin) {
            joinData = await joinpage.find({ deleted_at: null }).sort({ created_at: -1 });
        } else {
            joinData = await joinpage.findOne({ deleted_at: null }).sort({ created_at: -1 });
        }
        res.status(200).json(joinData)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.createjoinpage = async (req, res) => {
    try {
        const { image, title, description } = req.body
        const newJoinpage = new joinpage({
            image,
            title,
            description
        });
        const joinData = await newJoinpage.save();
        res.status(200).json(joinData)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.editjoinpage = async (req, res) => {
    try {
        const id = req.params.id;
        const joinData = await joinpage.findOne({ _id: id });
        res.status(200).json(joinData)
    }
    catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.updatejoinpage = async (req, res) => {
    try {
        const id = req.params.id;
        const { image, title, description } = req.body
        const updateJoinpage = {
            image,
            title,
            description
        };
        const newsave = await joinpage.findByIdAndUpdate(id, updateJoinpage, { new: true });
        res.status(200).json(newsave);
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.deletejoinpage = async (req, res) => {
    try {
        const id = req.params.id;
        const deletejoinpage = {
            deleted_at: Date(),
        };
        const newsave = await joinpage.findByIdAndUpdate(id, deletejoinpage);
    }
    catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.termsandcondition = async (req, res) => {
    try {
        const termsData = await Condition.find({ deleted_at: null }).sort({ created_at: -1 });
        // console.log(termsData, 'termsData')
        res.status(200).json(termsData)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.createTermsandcondition = async (req, res) => {
    try {
        const { titleE, descriptionE, titleG, descriptionG } = req.body
        const newTerms = new Condition({
            titleE,
            descriptionE,
            titleG,
            descriptionG
        });
        const termsData = await newTerms.save();
        console.log(termsData, 'termsData')
        res.status(200).json(termsData)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.editcreateTermsandcondition = async (req, res) => {
    try {
        const id = req.params.id;
        const termsData = await Condition.findOne({ _id: id });
        res.status(200).json(termsData)

    } catch (error) {
        console.log(error)
        res.status(500).json(error)

    }
}

apicontroller.updatecreateTermsandcondition = async (req, res) => {
    try {
        const id = req.params.id;
        const { titleE, descriptionE, titleG, descriptionG } = req.body
        const updateTerms = {
            titleE,
            descriptionE,
            titleG,
            descriptionG
        };
        const newsave = await Condition.findByIdAndUpdate(id, updateTerms, { new: true });
        res.status(200).json(newsave);
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.deletecreateTermsandcondition = async (req, res) => {
    try {
        const id = req.params.id;
        const deleteTerms = {
            deleted_at: Date(),
        };
        const newsave = await Condition.findByIdAndUpdate(id, deleteTerms);
        res.status(200).json(newsave);
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

apicontroller.createPlans = async (req, res) => {
    try {
        const { interval, period, name, amount, currency, description, is_recurring = true } = req.body;
        let data;
        console.log(is_recurring, "is_recurring")
        if (is_recurring) {
            if (!interval || !period || !name || !amount || !currency) {
                throw new Error('Missing required fields');
            }
            const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
            const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });

            if (!razorpay_key_id || !razorpay_key_secret) {
                throw new Error('Razorpay credentials not found');
            }
            const razorpay = new Razorpay({
                key_id: razorpay_key_id.value,
                key_secret: razorpay_key_secret.value,
            });

            const item = { name, amount: amount * 100, currency, description: description || null }
            const payload = { interval, period, item }

            const plan = await razorpay.plans.create(payload)
            const planItem = {
                name: plan.item.name,
                amount: plan.item.amount,
                currency: plan.item.currency,
                description: plan.item?.description
            }
            data = {
                razorpay_plan_id: plan.id,
                entity: plan.entity,
                period: plan.period,
                interval: plan.interval,
                item: planItem,
                created_at: plan.created_at
            }
        } else {
            const planItem = {
                name,
                amount: amount * 100,
                currency: currency || "INR",
                description
            }
            data = {
                razorpay_plan_id: null,
                entity: "plan",
                period: 'one_time',
                interval: 0,
                item: planItem,
                created_at: Date.now()
            }
        }
        await Plan.create(data)

        res.status(200).json({ message: 'Plan created successfully' })
    } catch (error) {
        console.log(error, "Error")
        res.status(400).json({ error: error?.error?.description || error?.message })
    }
}

apicontroller.getPlans = async (req, res) => {
    try {
        const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
        const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });
        const razorpay = new Razorpay({
            key_id: razorpay_key_id.value,
            key_secret: razorpay_key_secret.value,
        });
        console.log(await razorpay.plans.all())
        let plans = await Plan.aggregate([
            { $match: { deleted_at: null } },
            {
                $project: {
                    name: '$item.name',
                    plan_id: '$razorpay_plan_id',
                    is_recurring: 1,
                    interval: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$is_recurring", false] },
                                    then: "$$REMOVE"
                                },
                                {
                                    case: { $eq: ["$is_recurring", true] },
                                    then: "$interval"
                                }
                            ],
                            default: "Unknown interval"
                        }
                    },
                    period: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$period", "monthly"] },
                                    then: "months"
                                },
                                {
                                    case: { $eq: ["$period", "yearly"] },
                                    then: "years"
                                },
                                {
                                    case: { $eq: ["$period", "daily"] },
                                    then: "days"
                                },
                                {
                                    case: { $eq: ["$period", "weekly"] },
                                    then: "weeks"
                                },
                                {
                                    case: { $eq: ["$period", "one_time"] },
                                    then: "Life time"
                                }
                            ],
                            default: "Unknown period"
                        }
                    },
                    price: { $divide: [{ $toDouble: "$item.amount" }, 100] }
                }
            }])
        res.status(200).json({ plans })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

apicontroller.createSubscription = async (req, res) => {
    try {
        const planId = req.body.plan_id
        const userId = req.body.user_id
        const businessId = req.body.business_id

        const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
        const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });

        if (!razorpay_key_id || !razorpay_key_secret) {
            throw new Error('Razorpay credentials not found');
        }

        const razorpay = new Razorpay({
            key_id: razorpay_key_id.value,
            key_secret: razorpay_key_secret.value,
        });

        const payload = { plan_id: planId, total_count: 12, customer_notify: true, }
        const subscription = await razorpay.subscriptions.create(payload)
        const businessData = await Business.findById(businessId).select('name businessName businessEmail businessWebsite')
        console.log(businessData, "businessData")
        let planDetail = await Plan.aggregate([
            { $match: { deleted_at: null } },
            { $match: { razorpay_plan_id: planId } },
            {
                $project: {
                    name: '$item.name',
                    plan_id: '$razorpay_plan_id',
                    interval: 1,
                    price: { $divide: [{ $toDouble: "$item.amount" }, 100] }
                }
            }])
        // const data = {
        //     razorpay_subscription_id: planId,
        //     razorpay_plan_id: planId,
        //     total_count: payload.total_count,
        //     user_id: userId,
        //     business_id: businessId,
        //     customer_notify: payload.customer_notify,
        //     created_at: new Date()
        // }
        const data = {
            razorpay_subscription_id: subscription.id,
            razorpay_plan_id: subscription.plan_id,
            total_count: subscription.total_count,
            user_id: userId,
            business_id: businessId,
            customer_notify: subscription.customer_notify,
            created_at: subscription.created_at
        }
        await Subscription.create(data)
        res.status(200).json({
            subscription_id: subscription.id,
            razorpay_id: razorpay_key_id.value,
            plan_id: subscription.plan_id,
            userId,
            businessData,
            planDetail
        })
    } catch (error) {
        console.log(error, "error")
        res.status(400).json({ error: error.message })
    }
}

apicontroller.registerBusiness = async (req, res) => {
    try {
        const requiredFields = [
            "user_id",
            "name",
            "role",
            "address",
            "businessContactNumber",
            "businessEmail",
            "businessName",
            "businessShortDetail",
            "businessType",
            "dateOfOpeningJob",
        ];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        if (req.files && req.files?.businessLogo) {
            let file = req.files.businessLogo;
            const fileName = Date.now() + file.name
            file.mv("uploads/" + fileName, function (err) {
                if (err) {
                    console.log("Image upload failed")
                    return res.status(500).json({ status: false, message: "Image upload failed", error: err });
                }
            });
            req.body['businessLogo'] = fileName
        } else {
            throw new Error("Logo is required")
        }
        const dataExist = await Business.countDocuments({ user_id: req.body.user_id, deleted_at: null })
        if (dataExist) throw new Error('Business card already exists for this user')
        const businessDetail = await Business.create(req.body)
        res.status(200).json({ businessDetail, status: true, message: "Business created", showMessage: true })
    } catch (error) {
        console.log(error?.message, "error?.message")
        let errorMessage;
        let field;
        errorMessage = error?.message || ""
        if (error.code && error.code === 11000) {
            // Handle duplicate key error
            field = Object.keys(error.keyPattern)[0];
            switch (field) {
                case "user_id":
                    errorMessage = `A business with this user is already exists.`;
                    break;
                case "businessEmail":
                    errorMessage = `Business email is already registered.`;
                    break;

                default:
                    errorMessage = error?.message || ""
                    break;
            }
        }
        return res.status(400).json({ error: errorMessage, status: false });
    }
}

apicontroller.updateBusiness = async (req, res) => {
    try {
        const businessId = req.params.id;
        const updateFields = [
            "name",
            "role",
            "address",
            "businessContactNumber",
            "businessEmail",
            "businessName",
            "businessShortDetail",
            "businessType",
            "dateOfOpeningJob",
        ];

        for (const field of updateFields) {
            if (!req.body[field]) {
                throw new Error(`${field} is required`)
            }
        }
        let updateData = req.body;
        if (req.files && req.files?.businessLogo) {
            let file = req.files.businessLogo;
            file.mv("uploads/" + file.name, function (err) {
                if (err) {
                    console.log("Image upload failed")
                    return res.status(500).json({ status: false, message: "Image upload failed", error: err });
                }
            });
            updateData['businessLogo'] = file.name;
        }

        const updatedBusiness = await Business.findByIdAndUpdate(businessId, updateData, { new: true });
        if (!updatedBusiness) {
            return res.status(404).json({ error: "Business not found", status: false });
        }
        res.status(200).json({
            updatedBusiness,
            status: true,
            message: "Business updated",
            showMessage: true,
        });
    } catch (error) {
        console.log(error, "ERRORS");
        let errorMessage = error?.message || "";
        let field;

        if (error.code && error.code === 11000) {
            field = Object.keys(error.keyPattern)[0];
            switch (field) {
                case "businessEmail":
                    errorMessage = `Business email is already registered`;
                    break;

                case "name":
                    errorMessage = `Business name is already registered`;
                    break;

                default:
                    errorMessage = error?.message || "";
                    break;
            }
        }

        return res.status(400).json({ error: errorMessage, status: false });
    }
};

apicontroller.activeBusiness = async (req, res) => {
    try {
        let paymentId = req.body.payment_id
        let businessId = req.body.business_id
        let is_recurring = Boolean(req.body.is_recurring)
        if (is_recurring) {
            await Subscription.findOneAndUpdate({ business_id: businessId }, { payment_id: paymentId })
        } else {
            await BusinessOrder.findOneAndUpdate({ business_id: businessId }, { payment_id: paymentId, status: 'paid' })
        }
        await Business.findByIdAndUpdate(businessId, { status: "completed", created_at: Date.now(), is_recurring: !!is_recurring })

        res.status(200).json({ message: "Business registered successfully", showMessage: true })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

apicontroller.getBusiness = async (req, res) => {
    try {
        const id = req.params.id
        const businessData = await Business.findOne({ deleted_at: null, _id: id })
        res.status(200).json({ businessData })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
apicontroller.allBusinesses = async (req, res) => {
    try {
        const today = new Date()
        const payload = req.query?.pending ?
            { deleted_at: null } :
            {
                deleted_at: null,
                status: { $in: ['completed', 'cancelled'] },
                $or: [
                    { expired_at: null },
                    { expired_at: { $lt: today } }
                ]
            }
        const businesses = await Business.find(payload)

        console.log(businesses, 'businesses')

        res.status(200).json({ businesses })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

apicontroller.userBusinesses = async (req, res) => {
    try {
        const userId = req.params.user_id
        const businesses = await Business.findOne({ user_id: userId, deleted_at: null })
        res.status(200).json({ businesses })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

apicontroller.businessTemplate = async (req, res) => {
    try {
        const payload = {
            name: "Demo name",
            role: "Demo",
            address: "Demo",
            businessContactNumber: 1234567890,
            businessEmail: "panchalsamaj@gmail.com",
            businessLogo: "https://play-lh.googleusercontent.com/1p2yNXDfrUZF6QKbvQv_0fMp-Y4QwvvylNh7bb9rfpuFYGZOmZl0Gur1WVo5h-UFKo-m=w240-h480-rw",
            businessName: "Panchal samaj",
            businessShortDetail: "This is panchal samaj",
            businessLongDetail: "This is long description",
            businessType: "Community",
            dateOfOpeningJob: "16/12/2003",
            businessWebsite: "www.samajapp.codecrewinfotech.com",
            facebook: "www.facebook.com",
            instagram: "www.facebook.com",
            linkedIn: "www.facebook.com",
            twitter: "www.facebook.com",
            phoneNumber2: 1234567890
        }
        const renderTemplateToImage = async (template, data) => {
            const dirPath = __dirname.split('\\src')[0]
            const html = await ejs.renderFile(path.join(dirPath, 'views', `template/${template}.ejs`), data);

            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(html);
            await page.setViewport({
                width: 600,
                height: 1200
            });

            const imageBuffer = await page.screenshot();
            await browser.close();
            await fs.writeFile(`uploads/${template.replaceAll('/', '-')}.png`, imageBuffer);
        };
        await renderTemplateToImage('card_1/front', { payload });
        await renderTemplateToImage('card_1/back', { payload });
        await renderTemplateToImage('card_2/front', { payload });
        await renderTemplateToImage('card_2/back', { payload });

        res.status(200).json({ message: "Templates created successfully" })
    } catch (error) {
        console.log(error, "Errorrs")
        res.status(400).json({ error: error.message })
    }
}

apicontroller.templateListing = async (req, res) => {
    try {
        const templates = [
            { id: 1, name: `BusinessTemplate1` },
            { id: 2, name: `BusinessTemplate2` },
            { id: 3, name: `BusinessTemplate3` }
        ]
        res.status(200).json({ templates })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

apicontroller.businessPreview = async (req, res) => {
    try {
        const { id } = req.params
        let businessDetail = await Business.findById(id);
        const cleanedBusinessDetail = businessDetail.toObject();
        let data = { ...cleanedBusinessDetail, businessLogo: `${process.env.IMAGE_URL}${cleanedBusinessDetail.businessLogo}` }
        const images = await renderFrontAndBackImage(data.template_id, { payload: data })
        res.json({ images })
    } catch (error) {
        console.log(error, "Errorrs")
        res.status(400).json({ error: error.message })
    }
}

apicontroller.deleteBusiness = async (req, res) => {
    try {
        const id = req.params.id
        const businessData = await Business.findOne({ _id: id, deleted_at: null })
        console.log(businessData, "businessData && businessData.is_recurring")
        if (businessData && businessData.is_recurring) {
            const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
            const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });
            const razorpay = new Razorpay({
                key_id: razorpay_key_id.value,
                key_secret: razorpay_key_secret.value,
            });

            const subscriptionDetail = await Subscription.findOne({ deleted_at: null, business_id: id });
            console.log(subscriptionDetail, "subscriptionDetail")
            const data = await razorpay.subscriptions.cancel(subscriptionDetail.razorpay_subscription_id);
            console.log(data, "data")
        } else {
            await BusinessOrder.findOneAndUpdate({ business_id: id, deleted_at: null, payment_id: { $ne: null } }, { deleted_at: null })
        }
        const data = await Business.findOneAndUpdate(
            { _id: id, status: { $in: ['completed', 'payment_failed'] } },
            { deleted_at: Date.now() },
            { new: true }
        );
        if (!data) throw new Error("Unable to delete this business card")
        res.status(200).json({ message: "Business card deleted successfully", showMessage: true })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

apicontroller.cancelSubscription = async (req, res) => {
    try {
        const id = req.params.id;
        const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
        const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });
        const razorpay = new Razorpay({
            key_id: razorpay_key_id.value,
            key_secret: razorpay_key_secret.value,
        });

        const subscriptionDetail = await Subscription.findOne({ business_id: id, deleted_at: null });
        const getPlanDetails = await Plan.findOne({ razorpay_plan_id: subscriptionDetail.razorpay_plan_id })

        const getExpiredDate = getTargetDate(getPlanDetails.period, subscriptionDetail.created_at, getPlanDetails.interval);
        await razorpay.subscriptions.cancel(subscriptionDetail.razorpay_subscription_id);
        await Business.findOneAndUpdate({ _id: id, deleted_at: null }, { status: "cancelled", expired_at: getExpiredDate.toLocaleString() });

        subscriptionDetail.deleted_at = new Date();
        subscriptionDetail.save();

        res.status(200).json({ message: 'Business subscription cancelled successfully', showMessage: true })
    } catch (err) {
        if (Object.keys(err).find(item => item == "statusCode")) {
            res.status(400).json({ error: err.error.description })
        } else {
            res.status(400).json({ error: err.message })
        }
    }
}

apicontroller.businessOrder = async (req, res) => {
    try {
        const planId = req.params.id
        const businessId = req.body.business_id
        const userId = req.body.user_id
        const planDetails = await Plan.findById(planId)

        await BusinessOrder.findOneAndDelete({
            business_id: businessId,
            status: { $ne: "paid" },
            payment_id: null,
            deleted_at: null
        });

        // const isExistingOrder = 
        const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
        const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });
        const razorpay = new Razorpay({
            key_id: razorpay_key_id.value,
            key_secret: razorpay_key_secret.value,
        });
        const userData = await user.findById(userId).select('firstname personal_id mobile_number')

        const amount = planDetails.item.amount;
        const username = userData.firstname;
        const application = userData.personal_id;
        const mobileNo = userData.mobile_number;

        const receipt = `order_${username}_${Date.now()}_business`;
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: receipt,
            payment_capture: 1,
            notes: {
                username: username,
                mobileNumber: mobileNo,
                application: application,
            },
        };

        const businessData = await Business.findById(businessId).select('name businessName businessEmail businessWebsite')
        const order = await razorpay.orders.create(options);
        const orderPayload = {
            order_id: order.id,
            business_id: businessId,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
            status: order.status,
            created_at: order.created_at
        }
        await BusinessOrder.create(orderPayload)
        res.status(200).json({ order, razorpay_key_id: razorpay_key_id.value, businessData });
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: error.message });
    }

}

/* apicontroller.businessOrder = async (req, res) => {
    try {
        const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
        const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });
        const razorpay = new Razorpay({
            key_id: razorpay_key_id.value,
            key_secret: razorpay_key_secret.value,
        });
        const order = await razorpay.orders.create(options);
        res.status(200).json({ order, razorpay_key_id: razorpay_key_id.value });
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: error.message });
    }
} */

apicontroller.webhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        const razorpay_key_id = await Settings.findOne({ deleted_at: null, key: "razorpay_key_id" });
        const razorpay_key_secret = await Settings.findOne({ deleted_at: null, key: "razorpay_key_secret" });

        const razorpay = new Razorpay({
            key_id: razorpay_key_id.value,
            key_secret: razorpay_key_secret.value,
        });

        const receivedSignature = req.headers['x-razorpay-signature'];

        if (digest === receivedSignature) {
            const event = req.body.event;
            switch (event) {
                case "payment.failed":
                    const payload = req.body.payload.payment.entity
                    const payment = await razorpay.payments.fetch(payload.id);
                    const getBusiness = await Business.findOne({ businessEmail: payment.notes.email })
                    const subscriptions = await Subscription.findOne({ business_id: getBusiness._id });
                    if (subscriptions.payment_id) {
                        getBusiness.status = 'payment_failed'
                        getBusiness.save()
                    }
                    break;
                // case "payment.captured":

                //     break;
                // case "subscription.cancelled":

                //     break;
                // case "subscription.activated":

                //     break;

                default:
                    break;
            }
            res.status(200).send('Webhook verified');
        } else {
            console.log('Request is not legitimate.');
            res.status(400).send('Webhook verification failed');
        }
    } catch (error) {
        console.log(error, "ErrorInWebhook")
        res.status(400).send('Webhook verification failed');

    }




}

module.exports = apicontroller;
