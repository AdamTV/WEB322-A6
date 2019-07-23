/********************************************************************************************************
*  WEB322 – Assignment 03                                                                               *
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part   *
*  of this assignment has been copied manually or electronically from any other source                  *
*  (including 3rd party web sites) or distributed to other students.                                    *
*                                                                                                       *
*  Name: ADAM STINZIANI                     Student ID: 124521188                     Date: 2019-07-18  *
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
const multer = require("multer");
const fs = require('fs');
const bodyParser = require('body-parser');
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");
const dataServiceAuth = require("./data-service-auth.js");
const dataService = require("./data-service.js");

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

//DIRECT APP TO STATIC FOLDER TO USE
app.use(express.static('public'));

// Setup client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

// An authenticated route that requires the user to be logged in.
// Notice the middleware 'ensureLogin' that comes before the function
// that renders the dashboard page
app.get("/dashboard", ensureLogin, (req, res) => {
    res.render("dashboard", { user: req.session.user, title: "Dashboard" });
});
// This is a helper middleware function that checks if a user is logged in
// we can use it in any route that we want to protect against unauthenticated access.
// A more advanced version of this would include checks for authorization as well after
// checking if the user is authenticated
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

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

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.render("home", { title: "Home" });
});

app.get("/about", (req, res) => {
    res.render("about", { title: "About" });
});

app.get("/employees", ensureLogin, (req, res) => {
    if (req.query.status) {
        let status = req.query.status;
        dataService.getEmployeesByStatus(status)
            .then((data) => {
                if (data.length > 0)
                    res.render("employees", { employees: data, title: "Employees" });
                else
                res.render("employees", { message: "no results", title: "Employees" });
            })
            .catch(() => {
                res.render("employees", { message: "no results", title: "Employees" });
            });
    }
    else if (req.query.department) {
        let department = req.query.department;
        dataService.getEmployeesByDepartment(department)
            .then((data) => {
                if (data.length > 0)
                res.render("employees", { employees: data, title: "Employees" });
                else
                res.render("employees", { message: "no results", title: "Employees" });
            })
            .catch(() => {
                res.render("employees", { message: "no results", title: "Employees" });
            });
    }
    else if (req.query.manager) {
        let manager = req.query.manager;
        dataService.getEmployeesByManager(manager)
            .then((data) => {
                if (data.length > 0)
                res.render("employees", { employees: data, title: "Employees" });
                else
                    res.render("employees", { message: "no results", title: "Employees" });
            })
            .catch(() => {
                res.render("employees", { message: "no results", title: "Employees" });
            });
    }
    else {
        dataService.getAllEmployees()
            .then((data) => {
                if (data.length > 0)
                res.render("employees", { employees: data, title: "Employees" });
                else
                res.render("employees", { message: "no results", title: "Employees" });
            })
            .catch(() => {
                res.render("employees", { message: "no results", title: "Employees" });
            });
    }
});

app.get("/managers", ensureLogin, (req, res) => {
    dataService.getManagers()
        .then((data) => {
            if (data.length > 0)
                res.render("managers", { employees: data, title: "Managers" });
            else
                res.render("managers", { message: "no results", title: "Managers" });
        })
        .catch(() => {
            res.render("managers", { message: "no results", title: "Managers" });
        });
});

app.get("/departments", ensureLogin, (req, res) => {
    dataService.getDepartments()
        .then((data) => {
            if (data.length > 0)
                res.render("departments", { departments: data, title: "Departments" });
            else
                res.render("departments", { message: "no results", title: "Departments" });
        })
        .catch(() => {
            res.render("departments", { message: "no results", title: "Departments" });
        });
});

app.get("/employees/add", ensureLogin, (req, res) => {
    dataService.getDepartments()
        .then((data) => res.render("addEmployee", { departments: data , title: "Add Employee"}))
        .catch(() => res.render("addEmployee", { departments: [], title: "Add Employee" }))
});

app.get('/departments/add', ensureLogin, (req, res) => {
    res.render("addDepartment", { title: "Add Department" });
});

app.get("/images/add", ensureLogin, (req, res) => {
    res.render("addImage", { title: "Add Image" });
});

app.get("/images", ensureLogin, (req, res) => {
    fs.readdir(path.join(__dirname, "/public/images/uploaded"), function (err, data) {
        console.log(data);
        res.render("images", { images: data, title: "Images" });
    });
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    })
        .then(dataService.getDepartments)
        .catch((err) => {
            res.status(500).send("Unable to Get departments");
        })

        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"

            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching 
            // viewData.departments object
            console.log(viewData.employee.isArray);
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee[0].department) {
                    viewData.departments[i].selected = true;
                }
            }

        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                let tmp = JSON.stringify(viewData.employee[0]);
                tmp = JSON.parse(tmp);
                viewData.employee = tmp; // FIX EMPLOYEE BEING ARRAY WHEN RENDERED
                res.render("employee", { viewData: viewData, title: `Employee #${viewData.employee.empNum}`}); // render the "employee" view
            }
        })
        .catch((err) => {
            res.status(500).send("Unable to Render Employee");
        });

});


app.get("/department/:value", ensureLogin, (req, res) => {
    var value = req.params.value;
    dataService.getDepartmentbyId(value)
        .then((data) => {
            if (data != undefined)
                res.render("department", { department: data, title:"Department" });
            else
                res.status(404).send("Department Not Found");
        })
        .catch(() => { res.status(404).send("Department Not Found"); })
});

app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
    dataService.deleteDepartmentById(req.params.departmentId)
        .then(() => res.redirect("/departments"))
        .catch(() => res.status(500).send("Unable to Remove Department / Department not found"))
})

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum)
        .then(() => res.redirect("/employees"))
        .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"))
})

//We must accept a single file with the name of imageFile
app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

// from form post here
app.post("/employees/add", ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.addEmployee(req.body)
        .then(() => { res.redirect("/employees") })
        .catch(() => res.status(500).send("Unable to Add Employee"))
});

app.post("/employee/update", ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.updateEmployee(req.body)
        .then(() => { res.redirect("/employees"); })
        .catch(() => res.status(500).send("Unable to Update Employee / Employee not found"))
});

app.post("/departments/add", ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.addDepartment(req.body)
        .then(() => { res.redirect("/departments") })
        .catch(() => res.status(500).send("Unable to Add Department"))
});

app.post("/department/update", ensureLogin, (req, res) => {
    console.log(req.body);
    dataService.updateDepartment(req.body)
        .then(() => { res.redirect("/departments"); })
        .catch(() => res.status(500).send("Unable to Update Department / Department not found"))
});

app.get("/login", (req, res) => {
    res.render("login", { title: "Login" }); 
});

app.get("/register", (req, res) => {
    res.render("register", { title: "Register" }); 
});

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body)
        .then(res.render("register", { successMessage: "User Created!", title: "Register" }))
        .catch((err) => { res.render("register", { errorMessage: err, userName: req.body.userName, title: "Register" }) });
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            }
            res.redirect('/employees');
        })
        .catch((err) => { res.render("login", { errorMessage: err, userName: req.body.userName, title: "Login" }) });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory", { title: "User History" });
});

app.use((req, res) => {
    res.status(404);
    res.render(path.join(__dirname, "/views/404.hbs"), {title:"404: Page Not Found"});
});

// setup http server to listen on HTTP_PORT if init and auth-init successful
dataService.initialize()
    .then(dataServiceAuth.initialize)
    .then(function () {
        app.listen(HTTP_PORT, () => {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch((err) => {
        console.log("unable to start server: " + err);
    });


