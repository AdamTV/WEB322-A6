const fs = require('fs');
var employees = [];
var departments = [];

module.exports.initialize = function () {
  fs.readFile('/data/employees', 'utf8', (err, data) => {
    if (err) return Promise.reject(new Error('unable to read employee file'));
    else {
      JSON.parse(data);
      employees.push(data);
    }
  });

  fs.readFile('/data/departments', 'utf8', (err, data) => {
    if (err) return Promise.reject(new Error('unable to read departments file'));
    else {
      JSON.parse(data);
      departments.push(data);
    }
  });
  return Promise.resolve();
}