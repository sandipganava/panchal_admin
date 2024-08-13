
// const user = require('../model/user')
// const bcrypt = require('bcryptjs')

const axios = require('axios');
const jwt = require("jsonwebtoken");
// var helpers = require("../helpers");
// const sessions = require("../middleware/session");
const path = require('path');
const joinpage = require('../model/joinpage')
const user = require('../model/user')
const location = require('../model/location')
const payment = require('../model/payment')
const CommitteeMember = require('../model/CommitteeMembers')
var helpers = require("../helpers");
const fs = require('fs');
const Condition = require('../model/condition');
const { Readable } = require('stream');

require("dotenv").config();
const baseURL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;
// AdminController.js
const AdminController = {};

/**
 * Renders the dashboard view.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */

AdminController.loginPage = async (req, res) => {
    if (req.cookies?.token !== "" && req.cookies?.token !== undefined) {
        res.redirect('/admin/index')
    } else {
        res.render('login', { failEmail: '', failPass: '' })
    }
};

AdminController.login = async (req, res) => {
    // console.log(req.cookies,'cookies')
    try {
        // const token = req.cookies.jwt;
        const Logindata = {
            email: req.body.email,
            password: req.body.password,
        };

        const response = await axios.post(`${baseURL}/api/login`, Logindata, { headers: { 'x-api-key': API_KEY } });
        if (response.data.emailError === "Invalid email") {
            req.flash("failEmail", "Invalid email");
            return res.redirect("/");
        }

        if (response.data.login_status === "login success") {
            // req.session.userdetails = response.data.userdetails;
            // res.cookie("jwt", response.data.token, {
            //     maxAge: 1000 * 60 * 60 * 24, // 1 day
            //     httpOnly: true,
            // });

            var token = response.data.userdetails.token;
            res.cookie('token', token)
            return res.redirect("/admin/index");
        }

        req.flash("failPass", "Invalid password");
        return res.redirect("/");
    } catch (e) {
        console.log(e.response.data.passwordError, "Errorororororo")
        res.status(400).send(e.response.data.passwordError || e);
    }
};

AdminController.logoutuser = (req, res) => {
    // if (req.session) {
    //     req.session.destroy((err) => {
    //         if (err) {
    //             res.status(400).send(err);
    //         } else {
    //             res.clearCookie('cookieName');
    //             res.redirect("/");
    //         }
    //     });
    // }
    try {
        res.cookie('token', "")
        res.redirect("/");

    } catch (err) {
        console.log("Somthing went wrong while logout:" + err.message)
    }
};

AdminController.getforgotpass = async (req, res) => {
    res.render('forgot')
};

AdminController.users = async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/user_listing/`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/users', { users: data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.dashboard = async (req, res) => {

    try {
        const users = await user.find({ deleted_at: null, payment_id: { $ne: null } })
        const locations = await location.find({ deleted_at: null })
        const CommitteeMembers = await CommitteeMember.find({ deleted_at: null })

        let paymentData;
        let totalCapturedAmount = 0;
        const response = await helpers.axiosdata("get", "/api/Allpayment");
        paymentData = response.data.items;

        for (let i = 0; i < paymentData.length; i++) {
            const element = paymentData[i];


            if (element.status === 'captured') {
                const amount = element.amount / 100;
                totalCapturedAmount += amount;
            }
        }
        res.render('index', { users: users.length, locations: locations.length, payments: totalCapturedAmount, CommitteeMembers: CommitteeMembers.length });
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

};
AdminController.admins = async (req, res) => {
    try {
        res.render('pages/admins');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};
AdminController.users = async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/user_listing/`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/users', { users: data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};
AdminController.createUser = async (req, res) => {
    try {
        const location = await axios.get(`${baseURL}/api/locationdata`, { headers: { 'x-api-key': API_KEY } });
        // const meritalStatus = await axios.get(`${baseURL}/api/data`);
        // console.log(location, 'location')
        res.render('pages/createUser', { village: location.data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};



AdminController.addUser = async (req, res) => {
    console.log(req.body, 'sdd')
    try {
        const response = await axios.post(`${baseURL}/api/user_register/`, { PerentsData: req.body }, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.redirect('/users');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.editUser = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${baseURL}/api/user-edit/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;

        const location = await axios.get(`${baseURL}/api/locationdata`);
        // console.log(data, 'user data')
        res.render('pages/editUser', { userData: data, village: location.data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/user-update/${id}`, req.body, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.redirect('/users');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/user-delete/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.redirect('/users');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.viewTree = async (req, res) => {
    // console.log(req.params.id,'req.params.id')
    try {
        const id = req.params.id;
        const response = await axios.get(`${baseURL}/api/familyData/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/userTree', { familyData: JSON.stringify(data) });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}

AdminController.nodeDetails = async (req, res) => {

    try {
        const id = req.params.id;
        var village;
        var userDetails;
        const response = await axios.get(`${baseURL}/api/viewUser/${id}`,{ headers: { 'x-api-key': API_KEY } });
        const data = response.data;

        const formattedDate = new Date(data.User.dob).toISOString().split('T')[0];

        if (data.User.parent_id != null) {
            const parentData = await user.findOne(
                { deleted_at: null, _id: data.User.parent_id },

            );
            console.log(parentData, 'parentData')
            var locationId = parentData.locations_id.toString();

            const villageData = await location.findOne({ deleted_at: null, _id: locationId });
            village = villageData.village;
            userDetails = { ...data.User, dob: formattedDate, city: villageData.city, state: parentData.state, address: parentData.address }

            if (data.User.dob == null) {
                userDetails = { ...data.User, dob: null, city: villageData.city, state: parentData.state, address: parentData.address }
            }
        } else {

            userDetails = { ...data.User, dob: formattedDate };
            village = data.villageData[0].village;
        }

        res.render('pages/userView', { userDetails, village });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}


AdminController.create_child = async (req, res) => {

    try {
        const id = req.params.id;
        const parentData = await axios.get(`${baseURL}/api/add_childUser/${id}`, { headers: { 'x-api-key': API_KEY } });
        const relationshipData = await axios.get(`${baseURL}/api/relationship-data`, { headers: { 'x-api-key': API_KEY } });
        res.render('pages/createChild', { parentData: parentData.data.parentData, relationship: relationshipData.data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.addChild = async (req, res) => {
    const id = req.params.id;
    let childData;

    try {

        if (!req.files || !req.files.photo) {
            console.log('No image uploaded');
            childData = req.body;
        } else {
            let file = req.files.photo;
            const uploadPath = path.join(__dirname, '../../uploads', file.name);

            // Ensure the directory exists
            fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

            // Save the file
            await new Promise((resolve, reject) => {
                file.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });

            console.log('Image uploaded:', file.name);
            childData = {
                ...req.body,
                photo: file.name
            };
        }
        console.log(childData, 'childData')
        const response = await axios.post(`${baseURL}/api/addfamily/${id}`, childData, { headers: { 'x-api-key': API_KEY } });
        res.redirect(`/viewTree/${response.data.parentId}`);
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};


//aboutus

AdminController.abouts = async (req, res) => {
    try {
        const response = await helpers.axiosdata("get", "/api/aboutus", { headers: { 'x-api-key': API_KEY } })
        // const response = await axios.get(`${baseURL}/api/aboutus/`, headers = {
        //     "isadmin": true,
        // },)

        const data = response.data;
        res.render('pages/abouts', { aboutusData: data.AboutusData });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.addAboutPage = async (req, res) => {
    try {
        res.render('pages/createAboutusPage');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.addAboutUsDetails = async (req, res) => {
    try {

        console.log(req.files.image, 'image')
        if (!req.files || !req.files.image) {
            throw new Error("No image file uploaded");
        }

        let file = req.files.image;
        const uploadPath = path.join(__dirname, '../../uploads', file.name);

        // Ensure directory exists
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

        // Save the file
        await new Promise((resolve, reject) => {
            file.mv(uploadPath, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });

        const aboutusData = {
            titleE: req.body.titleE,
            descriptionE: req.body.descriptionE,
            titleG: req.body.titleG,
            descriptionG: req.body.descriptionG,
            image: file.name
        };

        await axios.post(`${baseURL}/api/aboutus/`, aboutusData, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/abouts');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.editAboutus = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${baseURL}/api/aboutus-edit/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/editAboutus', { aboutusData: data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.updateAboutus = async (req, res) => {
    try {
        const id = req.params.id;
        const { titleE, descriptionE, titleG, descriptionG } = req.body;
        let image = null;
        if (req.files && req.files.image) {
            image = req.files.image;
            const uploadDir = path.join(__dirname, '../../uploads');
            const uploadPath = path.join(uploadDir, image.name);

            // Ensure directory exists
            fs.mkdirSync(uploadDir, { recursive: true });

            // Save the file
            await new Promise((resolve, reject) => {
                image.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }

        // Prepare data to be sent in the request
        const aboutusData = {
            titleE, descriptionE, titleG, descriptionG,
        }

        if (image) {
            aboutusData.image = image.name;
        }

        const response = await axios.post(`${baseURL}/api/aboutus-edit/${id}`, aboutusData, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.redirect('/abouts');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.deleteAboutus = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/delete_aboutus/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.redirect('/abouts');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};



AdminController.villages = async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/location/`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/villages', { locations: data.village });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};
AdminController.createVillages = async (req, res) => {
    try {
        res.render('pages/createVillages');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.addVillages = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            throw new Error("No image file uploaded");
        }

        let file = req.files.image;
        const uploadPath = path.join(__dirname, '../../uploads', file.name);

        // Ensure directory exists
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

        // Save the file
        await new Promise((resolve, reject) => {
            file.mv(uploadPath, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });

        const villageData = {
            ...req.body,
            image: file.name
        };

        const response = await axios.post(`${baseURL}/api/location/`, villageData, { headers: { 'x-api-key': API_KEY } });
        //    console.log(response,'es')
        res.redirect('/villages');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.editVillages = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${baseURL}/api/location-edit/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/editVillages', { vlilage: data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.updateVillages = async (req, res) => {
    try {
        const id = req.params.id;

        let image = null;
        if (req.files && req.files.image) {
            image = req.files.image;
            const uploadDir = path.join(__dirname, '../../uploads');
            const uploadPath = path.join(uploadDir, image.name);

            // Ensure directory exists
            fs.mkdirSync(uploadDir, { recursive: true });

            // Save the file
            await new Promise((resolve, reject) => {
                image.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }

        const villageData = {
            ...req.body
        }

        if (image) {
            villageData.image = image.name;
        }

        const response = await axios.post(`${baseURL}/api/location-edit/${id}`, villageData, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.redirect('/villages');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};
AdminController.deleteVillages = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/location-delete/${id}`, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/villages');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.slider = async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/slider`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/slider', { sliders: data });

    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.createSilder = async (req, res) => {
    try {
        res.render('pages/createSilder');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.addSlider = async (req, res) => {
    // console.log(req.body, 'req.body');

    try {
        if (!req.files || !req.files.image) {
            throw new Error("No image file uploaded");
        }

        let file = req.files.image;
        const uploadPath = path.join(__dirname, '../../uploads', file.name);

        // Ensure directory exists
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

        // Save the file
        await new Promise((resolve, reject) => {
            file.mv(uploadPath, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });

        const sliderData = {
            title: req.body.title,
            image: file.name
        };


        const response = await axios.post(`${baseURL}/api/slider/`, sliderData, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        console.log(data);

        res.redirect('/slider');
    } catch (error) {
        // Handle rendering errors
        console.error("Error adding slider:", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.deleteSlider = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/delete_slider/${id}`, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/slider');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.committee = async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/committee_members/`, { headers: { 'x-api-key': API_KEY } });
        const committeeMembers = response.data;
        res.render('pages/committee', { committeeMembers: committeeMembers });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};
AdminController.createCommitee = async (req, res) => {
    try {
        res.render('pages/createCommitee');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};
AdminController.postCommitee = async (req, res) => {
    try {
        var committeeMembers;
        if (!req.files || !req.files.image) {
            committeeMembers = {
                fullnameG: req.body.fullnameG,
                fullnameE: req.body.fullnameE,
                roleG: req.body.roleG,
                roleE: req.body.roleE,
                mobile_number: req.body.mobile_number,
                villageG: req.body.villageG,
                villageE: req.body.villageE,
            };
        } else {



            let file = req.files.image;
            const uploadPath = path.join(__dirname, '../../uploads', file.name);

            // Ensure directory exists
            fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

            // Save the file
            await new Promise((resolve, reject) => {
                file.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });

            committeeMembers = {
                fullnameG: req.body.fullnameG,
                fullnameE: req.body.fullnameE,
                roleG: req.body.roleG,
                roleE: req.body.roleE,
                mobile_number: req.body.mobile_number,
                villageG: req.body.villageG,
                villageE: req.body.villageE,
                image: file.name
            };

        }
        const response = await axios.post(`${baseURL}/api/committee_members/`, committeeMembers, { headers: { 'x-api-key': API_KEY } });
        console.log(response, "response")
        const data = response.data;
        console.log(data);

        res.redirect('/committee');
    } catch (error) {
        // Handle rendering errors
        console.error("Error adding CommitteMemmber:", error);
        res.status(500).send("Internal Server Error");
    }
}
AdminController.editCommitee = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${baseURL}/api/committee_members-edit/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/editCommitee', { committeeMembers: data });
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}
AdminController.updateCommitee = async (req, res) => {
    try {
        const id = req.params.id;
        const { fullnameG, fullnameE, roleG, roleE, mobile_number, villageG, villageE } = req.body;

        let image = null;
        if (req.files && req.files.image) {
            image = req.files.image;
            const uploadDir = path.join(__dirname, '../../uploads'); // Adjusted path
            const uploadPath = path.join(uploadDir, image.name);

            // Ensure directory exists
            fs.mkdirSync(uploadDir, { recursive: true });

            // Save the file
            await new Promise((resolve, reject) => {
                image.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }

        // Prepare data to be sent in the request
        const commiteeData = {
            fullnameG,
            fullnameE,
            roleG,
            roleE,
            mobile_number,
            villageE,
            villageG,
        };

        // Add image to the request data only if it exists
        if (image) {
            commiteeData.image = image.name;
        }

        const response = await axios.post(`${baseURL}/api/committeemembers-edit/${id}`, commiteeData, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        console.log(data);
        res.redirect('/committee');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}
AdminController.deleteCommitee = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/delete_committee_members/${id}`, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/committee');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
}

//News

AdminController.news = async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/news`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;

        res.render('pages/news', { newsData: data });

    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.createNews = async (req, res) => {
    try {
        res.render('pages/createNews');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.addNews = async (req, res) => {
    try {
        var newsData;
        if (!req.files || !req.files.image) {
            newsData = {
                titleE: req.body.titleE,
                titleG: req.body.titleG,
                descriptionE: req.body.descriptionE,
                descriptionG: req.body.descriptionG,
                created_by: req.body.created_by
            };
        } else {
            let file = req.files.image;
            const uploadPath = path.join(__dirname, '../../uploads', file.name);

            // Ensure directory exists
            fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

            // Save the file
            await new Promise((resolve, reject) => {
                file.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });

            newsData = {
                titleE: req.body.titleE,
                titleG: req.body.titleG,
                image: file.name,
                descriptionE: req.body.descriptionE,
                descriptionG: req.body.descriptionG,
                created_by: req.body.created_by
            };

        }



        axios.post(`${baseURL}/api/news/`, newsData, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/news');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.editNews = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${baseURL}/api/news-edit/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/editNews', { newsData: data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.updateNews = async (req, res) => {
    try {
        const id = req.params.id;
        const { titleE, titleG, descriptionE, descriptionG, created_by } = req.body;

        let image = null;
        if (req.files && req.files.image) {
            image = req.files.image;
            const uploadDir = path.join(__dirname, '../../uploads');
            const uploadPath = path.join(uploadDir, image.name);

            // Ensure directory exists
            fs.mkdirSync(uploadDir, { recursive: true });

            // Save the file
            await new Promise((resolve, reject) => {
                image.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }

        const newsData = {
            titleE,
            titleG,
            descriptionE,
            descriptionG,
            created_by

        };

        if (image) {
            newsData.image = image.name;
        }

        const response = await axios.post(`${baseURL}/api/news-edit/${id}`, newsData, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        console.log(data);
        res.redirect('/news');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.deleteNews = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/news-delete/${id}`, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/news');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
}

AdminController.password = async (req, res) => {
    try {
        res.render('pages/password');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};
AdminController.changeuserPassword = async (req, res) => {
    try {
        const response = await axios.post(`${baseURL}/api/changePassword`, req.body, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        console.log(data, 'data')
        res.redirect('/changeuserPassword');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}

// Faqs api

AdminController.faqs = async (req, res) => {

    try {
        const response = await axios.get(`${baseURL}/api/faq`, { headers: { 'x-api-key': API_KEY } });
        const faqsData = response.data;
        // console.log(settingsData, 'settingsData')
        res.render('pages/faqs', { faqsData: faqsData });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.createFaqs = async (req, res) => {
    try {
        res.render('pages/createFaqs');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.addFaqs = async (req, res) => {
    try {
        axios.post(`${baseURL}/api/faq/`, req.body, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/faqs');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.editFaqs = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${baseURL}/api/faq-edit/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/editFaqs', { faqsData: data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.updateFaqs = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/faq-edit/${id}`, req.body, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.redirect('/faqs');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.deleteFaqs = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/faq-delete/${id}`, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/faqs');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}

AdminController.settings = async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/listsettings`, { headers: { 'x-api-key': API_KEY } });
        const settingsData = response.data;
        res.render('pages/settings', { SettingsData: settingsData });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};
AdminController.settingForm = async (req, res) => {
    try {
        res.render('pages/createSetting');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}
AdminController.createSetting = async (req, res) => {
    try {
        const { key, type, value } = req.body;
        let settingData = {
            key,
            type,
        };

        if (type === 'image' && req.files && req.files.value) {
            const image = req.files.value;
            const uploadDir = path.join(__dirname, '../../uploads'); // Adjust path as needed
            const uploadPath = path.join(uploadDir, image.name);

            // Ensure directory exists
            fs.mkdirSync(uploadDir, { recursive: true });

            // Save the file
            await new Promise((resolve, reject) => {
                image.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });

            settingData.value = image.name;
        } else {
            settingData.value = value;
        }

        const response = await axios.post(`${baseURL}/api/createSetting`, settingData, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        console.log(data, 'data');
        res.redirect('/settings');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}
AdminController.editSetting = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${baseURL}/api/editSetting/${id}`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/editSetting', { settingData: data });
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
}
AdminController.updateSetting = async (req, res) => {
    try {
        const id = req.params.id;
        const { key, type, value } = req.body;

        let settingData = {
            key,
            type,
        };

        if (type === 'image' && req.files && req.files.value) {
            const image = req.files.value;
            const uploadDir = path.join(__dirname, '../../uploads');
            const uploadPath = path.join(uploadDir, image.name);

            // Ensure directory exists
            fs.mkdirSync(uploadDir, { recursive: true });

            // Save the file
            await new Promise((resolve, reject) => {
                image.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });

            settingData.value = image.name;
        } else {
            settingData.value = value;
        }

        const response = await axios.post(`${baseURL}/api/editSetting/${id}`, settingData, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        console.log(data, 'data');
        res.redirect('/settings');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
}

AdminController.deleteSetting = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/deleteSetting/${id}`, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/settings');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}

AdminController.payments = async (req, res) => {
    try {
        res.render('pages/payments');
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};
AdminController.contacts = async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/email_support`, { headers: { 'x-api-key': API_KEY } });
        const data = response.data;
        res.render('pages/contacts', { contactData: data });
    } catch (error) {
        // Handle rendering errors
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }
};

AdminController.deletContacts = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.post(`${baseURL}/api/deleteEmailSupport/${id}`, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/contacts');
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("Internal Server Error");
    }

}



AdminController.joinpage = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        const response = await helpers.axiosdata("get", "/api/joinpage");
        const joinpage = response.data;
        res.render('pages/joinpage', { joinpage })
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
}
AdminController.addjoinpage = async (req, res) => {
    try {
        res.render('pages/createJoinpage')
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
}
AdminController.addjoinpageData = async (req, res) => {
    try {

        let file = req.files.image;
        file.mv("uploads/" + file.name);
        const token = req.cookies.jwt;
        const joinpageData = {
            title: req.body.title,
            description: req.body.description,
            image: file.name,
        };
        helpers
            .axiosdata("post", "/api/createjoinpage", token, joinpageData)
            .then(async function (response) {
                res.redirect('/joinpage')
            })
            .catch(function (response) {
                console.log(response);
            });
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
}

AdminController.edit_joinpage = async (req, res) => {
    var userData = req.session.userdetails
    var id = req.params.id
    try {
        const token = req.cookies.jwt;

        helpers
            .axiosdata("get", "/api/editjoinpage/" + id, token)
            .then(async function (response) {
                var joinpage = response.data
                res.render('pages/editJoinpage', { joinpage, userData })
            })
            .catch(function (response) {
                console.log(response);
            });
    } catch (e) {
        res.status(400).send(e);
    }
}

AdminController.joinpage_update = async (req, res) => {
    var id = req.params.id
    if (!req.files) {
        try {
            const token = req.cookies.jwt;
            const joinpageData = {
                title: req.body.title,
                description: req.body.description,
            };
            helpers
                .axiosdata("post", "/api/editjoinpage/" + id, token, joinpageData)
                .then(async function (response) {
                    res.redirect('/joinpage')
                })
                .catch(function (response) {
                    console.log("error", response);
                });
        } catch (e) {
            res.status(400).send(e);
        }
    } else {
        try {
            const token = req.cookies.jwt;
            let file = req.files.image;
            file.mv("uploads/" + file.name);

            const joinpageData = {
                title: req.body.title,
                description: req.body.description,
                image: file.name,
            };
            helpers
                .axiosdata("post", "/api/editjoinpage/" + id, token, joinpageData)
                .then(async function (response) {
                    res.redirect('/joinpage')
                })
                .catch(function (response) {
                    console.log("error", response);
                });
        } catch (e) {
            console.log(e, "error2")
            res.status(400).send(e);
        }
    }
}

AdminController.delete_joinpage = async (req, res) => {
    var id = req.params.id
    try {
        const delete_joinpage = {
            deleted_at: Date(),
        };

        await joinpage.findByIdAndUpdate(id, delete_joinpage);
        res.redirect('/joinpage')
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
}

AdminController.termsandcondition = async (req, res) => {
    try {
        const response = await axios.get(`${baseURL}/api/termsandcondition`, { headers: { 'x-api-key': API_KEY } });
        const termsandcondition = response.data;
        res.render('pages/termsandcondition', { termsandcondition })
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
}

AdminController.createTermsandcondition = async (req, res) => {
    try {
        res.render('pages/createTermsandcondition')
    } catch (error) {
        console.log(error)
    }
}

AdminController.addTermsandcondition = async (req, res) => {
    try {
        const termsandconditionData = {
            titleE: req.body.titleE,
            titleG: req.body.titleG,
            descriptionE: req.body.descriptionE,
            descriptionG: req.body.descriptionG,
        };
        axios.post(`${baseURL}/api/createTermsandcondition`, termsandconditionData,{ headers: { 'x-api-key': API_KEY } } );
        res.redirect('/termsandcondition')
    } catch (error) {
        console.log(error)
    }
}

AdminController.editTermsandcondition = async (req, res) => {
    var id = req.params.id
    try {
        const response = await axios.get(`${baseURL}/api/editTermsandcondition/${id}`, { headers: { 'x-api-key': API_KEY } });
        const termsandcondition = response.data;
        res.render('pages/editTermsandcondition', { termsandcondition })
    } catch (error) {
        console.log(error)
    }
}

AdminController.updateTermsandcondition = async (req, res) => {
    var id = req.params.id
    try {
        const termsandconditionData = {
            titleE: req.body.titleE,
            titleG: req.body.titleG,
            descriptionE: req.body.descriptionE,
            descriptionG: req.body.descriptionG,
        };
        axios.post(`${baseURL}/api/editTermsandcondition/${id}`, termsandconditionData, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/termsandcondition')
    } catch (error) {
        console.log(error)
    }
}

AdminController.deleteTermsandcondition = async (req, res) => {
    var id = req.params.id
    try {
        const delete_termsandcondition = {
            deleted_at: Date(),
        };
        await Condition.findByIdAndUpdate(id, delete_termsandcondition, { headers: { 'x-api-key': API_KEY } });
        res.redirect('/termsandcondition')
    } catch (error) {
        console.log(error)
    }
}

AdminController.plans = async (req, res) => {
    const response = await axios.get(`${baseURL}/api/getPlans/`, { headers: { 'x-api-key': API_KEY } });
    res.render("pages/plans", { plans: response.data.plans })
}

AdminController.businessListing = async (req, res) => {
    const response = await axios.get(`${baseURL}/api/allBusinesses?pending=1`, { headers: { 'x-api-key': API_KEY } });
    res.render("pages/business", { businesses: response.data.businesses })
}

AdminController.businessTemplates = async (req, res) => {
    const { id, position } = req.params;
    const payload = {
        name: "Demo name",
        role: "Demo",
        address: "Demo",
        businessContactNumber: 1234567890,
        businessEmail: "panchalsamaj@gmail.com",
        businessLogo: "https://play-lh.googleusercontent.com/1p2yNXDfrUZF6QKbvQv_0fMp-Y4QwvvylNh7bb9rfpuFYGZOmZl0Gur1WVo5h-UFKo-m=w240-h480-rw",
        businessName: "Panchal samaj",
        businessShortDetail: "This is panchal samaj",
        businessLongDetail: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Recusandae labore atque quasi doloribus vel magnam suscipit eos, odio modi veniam reiciendis excepturi corrupti maiores molestiae ex debitis tempora reprehenderit laudantium sapiente beatae accusamus libero. Nisi omnis minus rem? Porro aut na",
        businessType: "Community",
        dateOfOpeningJob: "16/12/2003",
        businessWebsite: "www.samajapp.codecrewinfotech.com",
        facebook: "www.facebook.com",
        instagram: "www.facebook.com",
        linkedIn: "www.facebook.com",
        twitter: "www.facebook.com",
        phoneNumber2: 1234567890
    }
    res.render(`template/card_${id}/${position}`, { payload })
}

AdminController.businesses = async (req, res) => {
    const users = await axios.get(`${baseURL}/api/user_listing`, { headers: { 'x-api-key': API_KEY } })
    const errorMessage = req.flash('errorBusiness')
    res.render(`pages/addBusiness`, { users: users.data, errorMessage })
}

AdminController.addBusinesses = async (req, res) => {
    try {
        if (req.files && req.files?.businessLogo) {
            let file = req.files.businessLogo;
            file.mv("uploads/" + file.name, function (err) {
                if (err) {
                    console.log("Image upload failed")
                    return res.status(500).json({ status: false, message: "Image upload failed", error: err });
                }
            });
            req.body['businessLogo'] = file.name
        }

        await axios.post(`${baseURL}/api/registerBusiness`, req.body, {
            headers: {
                contentType: "multipart/form-data",
                'x-api-key': API_KEY,
            },
            
        })
        res.redirect('/businessListing')
    } catch (error) {
        req.flash('errorBusiness', error?.message);
        res.redirect('/addBusinesses')
    }
}

AdminController.editBusiness = async (req, res) => {
    try {
        const id = req.params.id
        const business = await axios.get(`${baseURL}/api/getBusiness/${id}`, { headers: { 'x-api-key': API_KEY } })
        const users = await axios.get(`${baseURL}/api/user_listing`, { headers: { 'x-api-key': API_KEY } })
        const errorMessage = req.flash('businessEditError')
        res.status(200).render('pages/editBusiness', {
            business: business.data.businessData,
            users: users.data,
            errorMessage
        })
    } catch (error) {
        res.status(400).send(error.message)
    }
}

AdminController.updateBusiness = async (req, res) => {
    try {
        const id = req.params.id
        const data = req.body
        if (req.files && req.files?.businessLogo) {
            let file = req.files.businessLogo;
            file.mv("uploads/" + file.name, function (err) {
                if (err) {
                    console.log("Image upload failed")
                    return res.status(500).json({ status: false, message: "Image upload failed", error: err });
                }
            });
            req.body['businessLogo'] = file.name
        }

        await axios.post(`${baseURL}/api/editBusiness/${id}`, data, { headers: { 'x-api-key': API_KEY } })
        res.redirect('/businessListing')
    } catch (error) {
        req.flash('businessEditError', error.message)
        res.redirect('/editBusiness')
    }
}

AdminController.createPlans = async (req, res) => {
    res.render('pages/createPlans')
}

module.exports = AdminController;
