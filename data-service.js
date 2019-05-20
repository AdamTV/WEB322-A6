const fs = require('fs');
var employees = [];
var departments = [];

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    fs.readFile('/data/employees', 'utf8', (err, data) => {
      if (err) reject("unable to read file");
      JSON.parse(data);
      employees.push(data);
      fs.readFile('/data/departments', 'utf8', (err, data) => {
        if (err) reject("unable to read file");
        JSON.parse(data);
        departments.push(data);
        resolve();
      });
    });
  });
}
