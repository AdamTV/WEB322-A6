/********************************************************************************************************
*  WEB322 – Assignment 03                                                                               *
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part   *
*  of this assignment has been copied manually or electronically from any other source                  *
*  (including 3rd party web sites) or distributed to other students.                                    *
*                                                                                                       *
*  Name: ADAM STINZIANI                     Student ID: 124521188                     Date: 2019-06-19  *
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
const exphbs = require("express-handlebars");
app.set('view engine', '.hbs');
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

// this adds property "activeRoute" to "app.locals"
app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

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
    res.render("home", { title: "Home" });
});

app.get("/about", (req, res) => {
    res.render("about", { title: "About" });
});

app.get("/employees", (req, res) => {
    if (req.query.status) {
        let status = req.query.status;
        dataservice.getEmployeesByStatus(status)
            .then((data) => { res.render("employees", { employees: data, title: "Employees" }); })
            .catch((err) => { res.render({ message: "no results" }); })
    }
    else if (req.query.department) {
        let department = req.query.department;
        dataservice.getEmployeesByDepartment(department)
            .then((data) => { res.render("employees", { employees: data, title: "Employees" }); })
            .catch((err) => { res.render({ message: "no results" }); })
    }
    else if (req.query.manager) {
        let manager = req.query.manager;
        dataservice.getEmployeesByManager(manager)
            .then((data) => { res.render("employees", { employees: data, title: "Employees" }); })
            .catch((err) => { res.render({ message: "no results" }); })
    }
    else {
        dataservice.getAllEmployees()
            .then((data) => { res.render("employees", { employees: data, title: "Employees" }); })
            .catch((err) => { res.render({ message: "no results" }); })
    }
});

app.get("/managers", (req, res) => {
    dataservice.getManagers()
        .then((data) => { res.json(data); })
        .catch((err) => { res.json({ message: err }); })
});

app.get("/departments", (req, res) => {
    dataservice.getDepartments()
        .then((data) => { res.render("departments", { departments: data, title: "Departments" }); })
        .catch((err) => { res.render({ message: "no results" }); })
});

app.get("/employees/add", (req, res) => {
    res.render("addEmployee", { title: "Add Employee" });
});

app.get("/images/add", (req, res) => {
    res.render("addImage", { title: "Add Image" });
});

app.get("/images", (req, res) => {
    fs.readdir(path.join(__dirname, "/public/images/uploaded"), function (err, data) {
        console.log(data);
        res.render("images", { images: data, title: "Images" });
    });
});

app.get("/employee/:value", (req, res) => {
    var value = req.params.value;
    dataservice.getEmployeeByNum(value)
        .then((data) => { res.render("employee", { employee: data }); })
        .catch((err) => { res.render("employee", { message: "no results" }); })
});

//We must accept a single file with the name of imageFile
app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.post("/employees/add", (req, res) => {
    dataservice.addEmployee(req.body)
        .then(() => { res.redirect("/employees") });
});

app.post("/employee/update", (req, res) => {
    console.log(req.body);
    dataservice.updateEmployee(req.body)
        .then(() => { res.redirect("/employees"); })
});

app.use((req, res) => {
    res.status(404);
    res.render(path.join(__dirname, "/views/404.hbs"));
});

// setup http server to listen on HTTP_PORT if initilization successful
dataservice.initialize()
    .then(() => { app.listen(HTTP_PORT); })
    .then(() => { console.log(`Express http server listening on ${HTTP_PORT}`); })
    .catch((err) => { console.log(`unable to start server: ${err}`); });



