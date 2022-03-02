'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const generator = require('generate-password');

// make webpage availible
const PORT = 8080;
const HOST = '0.0.0.0';
const app = express();


// importing the user models
const Employee = require('./models/employee');
const Manager = require('./models/manager');
const Owner = require('./models/owner');

// Access to database
// DO NOT TOUCH!
const mongoDB = "mongodb+srv://group10:CMPT370@project.yb52a.mongodb.net/CMPT370Project?retryWrites=true&w=majority"
mongoose.connect(mongoDB)
    .then((result) => {
        console.log("Connected to DB")
    })
    .catch((err) => {
        console.log(err)
    })

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile('views/logIn.html', { root: __dirname });
});

app.get('/addManager', (req, res) => {
    res.sendFile('views/addManager.html', { root: __dirname });
});

app.get('/addEmployee', (req, res) => {
    res.sendFile('views/addEmployee.html', { root: __dirname });
});

app.get('/removeManager', (req, res) => {
    res.sendFile('views/removeManager.html', { root: __dirname });
});

app.get('/removeEmployee', (req, res) => {
    res.sendFile('views/removeEmployee.html', { root: __dirname });
});


app.post("/", function (req, res) {
    let id = req.body.userID;
    let password = req.body.password;
    let role = "";

    Owner.findOne({ ownerID: id, password: password })
        .then((result) => {
            role = result.role;
            console.log("Owner logged in")
        })
        .catch((err) => {
            Manager.findOne({ managerID: id, password: password })
                .then((result) => {
                    role = result.role;
                    console.log("Manager logged in")
                })
                .catch((err) => {
                    Employee.findOne({ employeeID: id, password: password })
                        .then((result) => {
                            role = result.role;
                            console.log("Employee logged in")
                        })
                        .catch((err) => {
                            console.log("Oops! User doesn't exists!");
                        })
                })
        })
});



app.post('/addEmployee', function (req, res) {
    const password = getPassword();
    const employeeID = getEmployeeId();
    const role = "Employee";
    const insertEmployee = new Employee({
        firstName: req.body.fName,
        lastName: req.body.lName,
        address: req.body.address,
        phoneNumber: req.body.phoneInput,
        dob: req.body.dob,
        email: req.body.emailInput,
        bankAccountNumber: req.body.bankAccount,
        sin: req.body.SinNumber,
        employeeID: employeeID,
        password: password,
        availability: req.body.avail,
        wage: req.body.wage,
        role: role
    });

    Manager.find({ $or: [{ phoneNumber: req.body.phoneInput }, { email: req.body.emailInput }, { sin: req.body.SinNumber }] }, function (err, result) {
        if (err) throw err;
        if (result.length === 0) {
            insertEmployee.save()
                .then((result) => {
                    let responseData = {
                        userID: result.employeeID,
                        password: result.password
                    };
                    res.send(responseData)
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        else {
            if (result[0].phoneNumber == req.body.phoneInput && result[0].email == req.body.emailInput && result[0].sin == req.body.SinNumber) {
                console.log("A manager with similar phone number, email and SIN number already exists in the system.")
            }
            else if (result[0].phoneNumber == req.body.phoneInput && result[0].email == req.body.emailInput) {
                console.log("A manager with similar phone number and email already exists in the system.")
            }
            else if (result[0].phoneNumber == req.body.phoneInput && result[0].sin == req.body.SinNumber) {
                console.log("A manager with similar phone number and SIN number already exists in the system.")
            }
            else if (result[0].email == req.body.emailInput && result[0].sin == req.body.SinNumber) {
                console.log("A manager with similar email and SIN number already exists in the system.")
            }
            else if (result[0].phoneNumber == req.body.phoneInput) {
                console.log("A manager with similar phone number already exists in the system.")
            }
            else if (result[0].email == req.body.emailInput) {
                console.log("A manager with similar email already exists in the system.")
            }
            else if (result[0].sin == req.body.SinNumber) {
                console.log("A manager with similar SIN number already exists in the system.")
            }
        }
    })
})

app.post('/removeEmployee', function (req, res) {
    var myquery = { firstName: req.body.fName, lastName: req.body.lName, employeeID: req.body.id };
    Employee.deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        console.log("Employee removed from the system.");
    });
})

app.post('/addManager', function (req, res) {
    const password = getPassword();
    const managerID = getManagerId();
    const role = "Manager";
    const insertManager = new Manager({
        firstName: req.body.fName,
        lastName: req.body.lName,
        address: req.body.address,
        phoneNumber: req.body.phoneInput,
        dob: req.body.dob,
        email: req.body.emailInput,
        bankAccountNumber: req.body.bankAccount,
        sin: req.body.SinNumber,
        managerID: managerID,
        password: password,
        availability: req.body.avail,
        role: role
    });

    Employee.find({ $or: [{ phoneNumber: req.body.phoneInput }, { email: req.body.emailInput }, { sin: req.body.SinNumber }] }, function (err, result) {
        if (err) throw err;
        if (result.length === 0) {
            insertManager.save()
                .then((result) => {
                    let responseData = {
                        userID: result.managerID,
                        password: result.password
                    };
                    res.send(responseData)
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        else {
            if (result[0].phoneNumber == req.body.phoneInput && result[0].email == req.body.emailInput && result[0].sin == req.body.SinNumber) {
                console.log("An employee with similar phone number, email and SIN number already exists in the system.")
            }
            else if (result[0].phoneNumber == req.body.phoneInput && result[0].email == req.body.emailInput) {
                console.log("An employee with similar phone number and email already exists in the system.")
            }
            else if (result[0].phoneNumber == req.body.phoneInput && result[0].sin == req.body.SinNumber) {
                console.log("An employee with similar phone number and SIN number already exists in the system.")
            }
            else if (result[0].email == req.body.emailInput && result[0].sin == req.body.SinNumber) {
                console.log("An employee with similar email and SIN number already exists in the system.")
            }
            else if (result[0].phoneNumber == req.body.phoneInput) {
                console.log("An employee with similar phone number already exists in the system.")
            }
            else if (result[0].email == req.body.emailInput) {
                console.log("An employee with similar email already exists in the system.")
            }
            else if (result[0].sin == req.body.SinNumber) {
                console.log("An employee with similar SIN number already exists in the system.")
            }
        }
    })
})

app.post('/removeManager', function (req, res) {
    var myquery = { firstName: req.body.fName, lastName: req.body.lName, managerID: req.body.id };
    Manager.deleteOne(myquery)
        .then((res) => {
            console.log("Manager removed from the system")
        })
        .catch((err) => {
            console.log(err)
        })
})

function getManagerId() {
    var id = generator.generate({
        length: 7,
        numbers: true,
        uppercase: false,
        lowercase: false,
        symbols: false,
        excludeSimilarCharacters: true,
    });
    return id;
}

function getEmployeeId() {
    var id = generator.generate({
        length: 6,
        numbers: true,
        uppercase: false,
        lowercase: false,
        symbols: false,
        excludeSimilarCharacters: true,
    });
    return id;
}

function getPassword() {
    var min = Math.ceil(6);
    var max = Math.floor(9);
    var randNumber = Math.floor(Math.random() * (max - min + 1) + min);
    var password = generator.generate({
        length: randNumber,
        numbers: true,
        uppercase: true,
        lowercase: true,
        symbols: false,
        excludeSimilarCharacters: true,
        strict: true
    });
    return password;
}

app.use('/', express.static('views'));

app.listen(PORT, HOST);

console.log("Server running");