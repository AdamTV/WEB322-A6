var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
//var data = require("data-service.js");
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
    res.send("This is not the page you are looking for!");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);
console.log(`Express http server listening on ${HTTP_PORT}`);
