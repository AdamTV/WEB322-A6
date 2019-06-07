/********************************************************************************************************
*  WEB322 – Assignment 03                                                                               *
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part   *
*  of this assignment has been copied manually or electronically from any other source                  *
*  (including 3rd party web sites) or distributed to other students.                                    *
*                                                                                                       *
*  Name: ADAM STINZIANI                     Student ID: 124521188                     Date: 2019-06-05  *
*                                                                                                       *
*  Online (Heroku) Link: https://quiet-wave-56360.herokuapp.com/                                        *
*                                                                                                       *
********************************************************************************************************/
const HTTP_PORT = process.env.PORT || 8080;
//CREATE EXPORTS OBJECT
const express = require("express");
//CREATE EXPRESS OBJECT TO EXPOSE METHODS
const app = express();
const path = require("path");
const dataservice = require("./data-service.js");
const multer = require("multer");
const fs = require('fs');
const bodyParser = require('body-parser');

// use body-parser middleware to handle regular text submissions from html form data
app.use(bodyParser.urlencoded({ extended: true }));

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded/",
    filename: function (req, file, cb) {
        // we write the filename as the current date down to the millisecond
        // in a large web service this would possibly cause a problem if two people
        // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
        // this is a simple example.
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });

//DIRECT APP TO STATIC FOLDER TO USE
app.use(express.static('public'));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/employees", (req, res) => {
    if (req.query.status) {
        let status = req.query.status;
        dataservice.getEmployeesByStatus(status)
            .then((data) => { res.json(data); })
            .catch((err) => { res.json(err); })
    }
    else if (req.query.department) {
        let department = req.query.department;
        dataservice.getEmployeesByDepartment(department)
            .then((data) => { res.json(data); })
            .catch((err) => { res.json(err); })
    }
    else if (req.query.manager) {
        let manager = req.query.manager;
        dataservice.getEmployeesByManager(manager)
            .then((data) => { res.json(data); })
            .catch((err) => { res.json(err); })
    }
    else {
        dataservice.getAllEmployees()
            .then((data) => { res.json(data); })
            .catch((err) => { res.json({ message: err }); })
    }
    });

app.get("/managers", (req, res) => {
    dataservice.getManagers()
        .then((data) => { res.json(data); })
        .catch((err) => { res.json({ message: err }); })
});

app.get("/departments", (req, res) => {
    dataservice.getDepartments()
        .then((data) => { res.json(data); })
        .catch((err) => { res.json({ message: err }); })
});

app.get("/employees/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});

app.get("/images/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.get("/images", (req, res) => {
    fs.readdir(path.join(__dirname, "/public/images/uploaded"), function (err, items) {
        console.log(items);
        res.json({ "images": items });
    });
});

app.get("/employee/:value", (req, res) => {
    var value = req.params.value;
    dataservice.getEmployeeByNum(value)
    .then((data) => { res.json(data); })
    .catch((err) => { res.json(err); })
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.post("/employees/add", (req, res) => {
    dataservice.addEmployee(req.body)
        .then(() => { res.redirect("/employees") });
});

app.use((req, res) => {
    res.status(404);
    res.sendFile(path.join(__dirname, "/views/404.html"));
});

// setup http server to listen on HTTP_PORT if initilization successful
dataservice.initialize()
    .then(() => { app.listen(HTTP_PORT); })
    .then(() => { console.log(`Express http server listening on ${HTTP_PORT}`); })
    .catch((err) => { console.log(`unable to start server: ${err}`); });



