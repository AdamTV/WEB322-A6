var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
//var data = require("data-service.js");
var employees = require("employees.json");

app.use(express.static('public')); 

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/home.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/employees", (req, res) => {
    //res.send(employees);
    //res.json(employees);
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);
console.log(`Express http server listening on ${HTTP_PORT}`);
