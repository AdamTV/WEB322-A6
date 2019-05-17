var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
const dataservice = require("./data-service.js");
var employees = require("./data/employees.json");
var departments = require("./data/departments");
var managers = [];
var regex = /.*/;

for (let i = 0; i < employees.length; i++){
    if(employees[i].isManager)
    managers.push(employees[i]);
}

app.use(express.static('public')); 

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/home.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/employees", (req, res) => {
    res.json(employees);
});

app.get("/managers", (req, res) => {
    res.json(managers);
});

app.get("/departments", (req, res) => {
    res.json(departments);
});

app.get(regex, (req, res) => {
    res.status(404);
    res.sendFile(path.join(__dirname,"/views/404.html"));
});

// setup http server to listen on HTTP_PORT if initilization successful
dataservice.initialize()
.then(()=>{app.listen(HTTP_PORT);})
.then(()=>{console.log(`Express http server listening on ${HTTP_PORT}`);})
.catch((err)=>{console.log(`unable to start server: ${err}`);});



