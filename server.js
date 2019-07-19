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
            .then((data) => {
                if (data.length > 0)
                    res.render("employees", { employees: data });
                else
                    res.render("employees", { message: "no results" });
            })
            .catch(() => {
                res.render("employees", { message: "no results" });
            });
    }
    else if (req.query.department) {
        let department = req.query.department;
        dataservice.getEmployeesByDepartment(department)
            .then((data) => {
                if (data.length > 0)
                    res.render("employees", { employees: data });
                else
                    res.render("employees", { message: "no results" });
            })
            .catch(() => {
                res.render("employees", { message: "no results" });
            });
    }
    else if (req.query.manager) {
        let manager = req.query.manager;
        dataservice.getEmployeesByManager(manager)
            .then((data) => {
                if (data.length > 0)
                    res.render("employees", { employees: data });
                else
                    res.render("employees", { message: "no results" });
            })
            .catch(() => {
                res.render("employees", { message: "no results" });
            });
    }
    else {
        dataservice.getAllEmployees()
            .then((data) => {
                if (data.length > 0)
                    res.render("employees", { employees: data });
                else
                    res.render("employees", { message: "no results" });
            })
            .catch(() => {
                res.render("employees", { message: "no results" });
            });
    }
});

app.get("/managers", (req, res) => {
    dataservice.getManagers()
    .then((data) => {
        if (data.length > 0)
            res.render("managers", { employees: data });
        else
            res.render("managers", { message: "no results" });
    })
    .catch(() => {
        res.render("managers", { message: "no results" });
    });
});

app.get("/departments", (req, res) => {
    dataservice.getDepartments()
        .then((data) => {
            if (data.length > 0)
                res.render("departments", { departments: data });
            else
                res.render("departments", { message: "no results" });
        })
        .catch(() => {
            res.render("departments", { message: "no results" });
        });
});

app.get("/employees/add", (req, res) => {
    dataservice.getDepartments()
        .then((data) => res.render("addEmployee", { departments: data }))
        .catch(() => res.render("addEmployee", { departments: [] }))
});

app.get('/departments/add', (req, res) => {
    res.render("addDepartment", { title: "Add Department" });
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

app.get("/employee/:empNum", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    dataservice.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    })
        .then(dataservice.getDepartments)
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
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        })
        .catch((err) => {
            res.status(500).send("Unable to Render Employee");
        });

});


app.get("/department/:value", (req, res) => {
    var value = req.params.value;
    dataservice.getDepartmentbyId(value)
        .then((data) => {
            if (data != undefined)
                res.render("department", { department: data });
            else
                res.status(404).send("Department Not Found");
        })
        .catch(() => { res.status(404).send("Department Not Found"); })
});

app.get("/departments/delete/:departmentId", (req, res) => {
    dataservice.deleteDepartmentById(req.params.departmentId)
        .then(() => res.redirect("/departments"))
        .catch(() => res.status(500).send("Unable to Remove Department / Department not found"))
})

app.get("/employees/delete/:empNum", (req, res) => {
    dataservice.deleteEmployeeByNum(req.params.empNum)
        .then(() => res.redirect("/employees"))
        .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"))
})

//We must accept a single file with the name of imageFile
app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

// from form post here
app.post("/employees/add", (req, res) => {
    console.log(req.body);
    dataservice.addEmployee(req.body)
        .then(() => { res.redirect("/employees") })
        .catch(() => res.status(500).send("Unable to Add Employee"))
});

app.post("/employee/update", (req, res) => {
    console.log(req.body);
    dataservice.updateEmployee(req.body)
        .then(() => { res.redirect("/employees"); })
        .catch(() => res.status(500).send("Unable to Update Employee / Employee not found"))
});

app.post("/departments/add", (req, res) => {
    console.log(req.body);
    dataservice.addDepartment(req.body)
        .then(() => { res.redirect("/departments") })
        .catch(() => res.status(500).send("Unable to Add Department"))
});

app.post("/department/update", (req, res) => {
    console.log(req.body);
    dataservice.updateDepartment(req.body)
        .then(() => { res.redirect("/departments"); })
        .catch(() => res.status(500).send("Unable to Update Department / Department not found"))
});

app.use((req, res) => {
    res.status(404);
    res.render(path.join(__dirname, "/views/404.hbs"));
});

// setup http server to listen on HTTP_PORT if initilization successful
dataservice.initialize()
    .then(() => {
        console.log(`Express http server listening on ${HTTP_PORT}`);
        app.listen(HTTP_PORT);
    })
    .catch((err) => { console.log(`unable to start server: ${err}`); });