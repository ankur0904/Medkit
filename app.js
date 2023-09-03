const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
var nodemailer = require('nodemailer');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
PDFDocument = require("pdfkit");
require('dotenv').config()
const saltRounds = 10;

app.use(express.static("public"));
app.set("view engine", "ejs");
// using the body parser
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(`mongodb+srv://admin-ankur:${process.env.PASSWORD}@cluster0.4zksoll.mongodb.net/userDB`);
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);

const patientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String,
    doctor: String,
    date: Date,
    uniqueID: String,
    problem: String,
    diagnosis: String,
    labExamination: String,
    medicines: String
});

const Patient = mongoose.model("Patient", patientSchema);

const registeredPatientSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String,
    doctor: String,
    uniqueID: Number,
})
const RegisteredUser = mongoose.model("RegisteredUser", registeredPatientSchema);

app.get("/", function (req, res) {
    // res.sendFile(__dirname+"/index.html")
    res.render("index");
});

app.get("/book-appointment", function (req, res) {
    // res.sendFile(__dirname+"/appointment.html")
    res.render("appointment");
});



app.get("/:customListName", function (req, res) {
    let customRequest = req.params.customListName;
    let serviceData = customRequest;
    res.render(customRequest, { services: serviceData });
});

app.get("/appointment", function (req, res) {
    res.render("login");
});

app.post("/appointment", function (req, res) {

    const name = req.body.name;
    const age = req.body.age;
    const gender = req.body.gender;
    const doctor = req.body.doctor;
    const uniqueID = req.body.uniqueID;
    // const date = ;

    const newRegisteredUser = new RegisteredUser({
        name: name,
        age: age,
        gender: gender,
        doctor: doctor,
        uniqueID: uniqueID,
        date: new Date(),
    })

    const newPatient = new Patient({
        name: name,
        age: age,
        gender: gender,
        doctor: doctor,
        uniqueID: uniqueID,
        date: new Date(),
    })

    newRegisteredUser.save(function (err) {
        if (err) {
            console.log(err);
        }
    });

    newPatient.save(function (err) {
        if (err) {
            console.log(err);
        }
    });

    let condition = "Registered";
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "hospital.manage.bot@gmail.com",
            pass: process.env.SECRET_PASSWORD
        }
    });

    let mail1 = {
        from: 'hospital.manage.bot@gmail.com',
        to: req.body.email,
        subject: 'Appointment Confirmation',
        text: "Dear Sir/Madam, thank you for booking appointment with us. Schedule will be shared with you soon. For other query call plese call at 123456789"
    };

    transporter.sendMail(mail1, function (error) {
        if (error) {
            console.log(error);
        } else {
            const condition = "Email - send"
            res.render("success", { condition: condition })
        }
    });

    // transporter.sendMail(mail2, function (error) {
    //     if (error) {
    //         console.log(error);
    //     }else{
    //         
    //     }
    // });
});


// login for the admin only
app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/loginReceptionist", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result === true) {
                        res.render("manageLogin/loginReceptionist")
                    }
                });
            }
        }
    });
});

app.post("/loginLabDoctor", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result === true) {
                        res.render("manageLogin/loginLabDoctor")
                    }
                });
            }
        }
    });
});

app.post("/loginLabDoctorPost", (req, res) => {

    const uniqueID = req.body.uniqueID;
    const labExamination = req.body.labExamination;
    const query = req.body.uniqueID;
    const condition = "Updated";

    var myquery = { uniqueID: query };
    var newvalues = { $set: { labExamination: labExamination } };
    Patient.updateOne(myquery, newvalues, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render("success", { condition: condition });
        }
    });
})

app.post("/loginDoctor", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result === true) {
                        // 
                        res.render("manageLogin/loginDoctor")
                    }
                });
            }
        }
    });
});

app.post("/loginDoctorPost", (req, res) => {
    const uniqueID = req.body.uniqueID;
    const diagnosis = req.body.diagnosis;
    const labExamination = req.body.labExamination;
    const medicines = req.body.medicines;
    const problem = req.body.problem;
    const query = req.body.uniqueID;
    const condition = "Updated";
    var myquery = { uniqueID: query };
    var newvalues = { $set: { diagnosis: diagnosis, labExamination: labExamination, medicines: medicines, problem: problem } };
    Patient.updateOne(myquery, newvalues, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render("success", { condition: condition });
        }
    });
})

app.post("/loginPharmaceutical", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err)
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result === true) {
                        res.sendFile(__dirname + "/loginPharmaceutical.html")
                    }
                });
            }
        }
    });
});


// This is only for the development purpose 
app.get("/register-user", function (req, res) {
    res.render("register-user")
});

app.post("/register-user", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save(function (err) {
            if (err) {
                console.log(err)
            }
        });
    });
});

app.post("/doctor", (req, res) => {
    const query = req.body.searchQuery;
    console.log(query);
    Patient.find({ uniqueID: query }, function (err, patientData) {
        res.render("manageLogin/loginPharmaceutical", { patientDataAll: patientData });
    });
})

app.post("/addNewPatient", function (req, res) {
    const name = req.body.name;
    const age = req.body.age;
    const gender = req.body.gender;
    const doctor = req.body.doctor;
    const uniqueID = req.body.uniqueID;
    const date = req.body.date;

    const newPatient = new Patient({
        name: name,
        age: age,
        gender: gender,
        doctor: doctor,
        uniqueID: uniqueID,
        date: date,
        problem: "",
        diagnosis: "",
        labExamination: "",
        medicines: "",
    })

    newPatient.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            condition = "Added"
            res.render("success", { condition: condition })
        }
    });
})

app.post("/add", function (req, res) {
    res.render("admin/add");
})

app.post("/search", function (req, res) {
    const query = req.body.searchQuery;

    Patient.find({ uniqueID: query }, function (err, patientData) {
        res.render("admin/search", { patientDataAll: patientData });
    });

})

app.post("/delete", function (req, res) {
    const query = req.body.searchQuery;
    Patient.deleteMany({ uniqueID: query }, function (err) {
        condition = "Deleted"
        console.log(err);
        res.render("success", { condition: condition })
    });
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server started at 3000");
});
