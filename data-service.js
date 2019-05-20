const fs = require('fs');
var employees = [];
var departments = [];

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    fs.readFile('data/employees.json', 'utf8', (err, data) => {
      if (err) reject("unable to read employee file");
      obj = JSON.parse(data);
      employees = obj;
      fs.readFile('data/departments.json', 'utf8', (err, data) => {
        if (err) reject("unable to read departments file");
        console.log(data);
        obj = JSON.parse(data);
        departments = obj;
        resolve();
      });
    });
  });
}
