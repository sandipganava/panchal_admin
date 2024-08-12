const mongoose = require("mongoose");
const { ObjectId } = require('bson');
const Users = require("../model/user");

mongoose.set("strictQuery", false);

mongoose
    .connect('mongodb+srv://varmaajay182:e6aiiSDH3xmLaARJ@panchal.zqtypwa.mongodb.net/?retryWrites=true&w=majority&appName=panchal', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("connection  is successfull");
    })
    .catch((e) => {
        console.log("no connection");
    });

async function seedData() {

    var user = await Users.find()
    if (user) {
        console.log('Already seeder file run')
        await mongoose.disconnect();
    } else {
        try {
            const data = new Users({
                firstname: 'Vishw',
                middlename: 'Amitbhai',
                lastname: 'Panchal',
                password: 'Vishw@2103',
                parent_id: null,
                payment_id: 'pay_OFs8h4NO9WO2AG',
                email: 'vishwprajapati66@gmail.com',
                locations_id: new ObjectId('64956f9a074819de3e34ed25'),
                dob: new Date('2002-05-28T09:55:00.000Z'),
                mobile_number: 9173211901,
                personal_id: 'ASGPS0001',
                state: 'gujha',
                city: 'Ahmedabad',
                pincode: '382415',
                gender: 'male',
                education: 'PHD',
                address: 'Ghh or',
                relationship: null,
                job: 'software',
                marital_status: 'married'
            });

            await data.save()
            console.log('Data inserted successfully');
        } catch (err) {
            console.error('Error inserting data:', err);
        } finally {
            await mongoose.disconnect();
        }
    }
}

seedData()
