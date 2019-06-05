const fs = require('fs');
var employees = [];
var departments = [];

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    fs.readFile('data/employees.json', 'utf8', (err, data) => {
      if (err) reject("unable to read employee file");
      let obj = JSON.parse(data);
      for (let i = 0; i < obj.length; i++)
        employees.push(obj[i]);
      fs.readFile('data/departments.json', 'utf8', (err, data) => {
        if (err) reject("unable to read departments file");
        obj = JSON.parse(data);
        for (let i = 0; i < obj.length; i++)
          departments.push(obj[i]);
        resolve();
      });
    });
  });
};

module.exports.getAllEmployees = () => {
  return new Promise(function (resolve, reject) {
    if (employees.length == 0)
      reject("no employees returned");
    else
      resolve(employees);
  });
}

module.exports.getManagers = () => {
  return new Promise(function (resolve, reject) {
    let managers = [];
    for (let i = 0; i < employees.length; i++) {
      if (employees[i].isManager)
        managers.push(employees[i]);
    }
    if (managers.length == 0)
      reject("no managers returned");
    else
      resolve(managers);
  });
}

module.exports.getDepartments = () => {
  return new Promise(function (resolve, reject) {
    if (departments.length == 0)
      reject("no departments returned");
    else
      resolve(departments);
  });
}

module.exports.addEmployee = (employeeData) => {
  return new Promise((resolve, reject) => {
    if (employeeData.isManager == undefined)
      employeeData.isManager = false;
    else
      employeeData.isManager = true;
    employeeData.employeeNum = employees.length + 1;
    employees.push(employeeData);
    resolve();
  });
}