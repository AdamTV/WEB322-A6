/********************************************************************************************************
*  WEB322 – Assignment 02                                                                               *
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part   *
*  of this assignment has been copied manually or electronically from any other source                  *
*  (including 3rd party web sites) or distributed to other students.                                    *
*                                                                                                       *
*  Name: ADAM STINZIANI                     Student ID: 124521188                     Date: 2019-05-20  *
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
//const regex = /.*/;

//ENABLE SERVICE OF STATIC FILES
app.use(express.static('public')); 

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/home.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/employees", (req, res) => {
    dataservice.getAllEmployees()
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({ message: err });})
});

app.get("/managers", (req, res) => {
    dataservice.getManagers()
    .then((data) => { res.json(data); })
    .catch((err) => { res.json({ message: err });})
});

app.get("/departments", (req, res) => {
    dataservice.getDepartments()
        .then((data) => { res.json(data); })
        .catch((err) => { res.json({ message: err });})
});

app.use((req, res) => {
    res.status(404);
    res.sendFile(path.join(__dirname,"/views/404.html"));
});

// setup http server to listen on HTTP_PORT if initilization successful
dataservice.initialize()
.then(()=>{app.listen(HTTP_PORT);})
.then(()=>{console.log(`Express http server listening on ${HTTP_PORT}`);})
.catch((err)=>{console.log(`unable to start server: ${err}`);});



