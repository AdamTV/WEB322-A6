const fs = require('fs');
var employees = [];
var departments = [];

module.exports.initialize = function() {
fs.readFile('/data/employees','utf8', (err, data) => {
    if (err) Promise.reject(new Error('unable to read file')).then(function() {
        // not called
      }, function(error) {
        console.log(error); // Stacktrace
      });
      else{
    JSON.parse(data);
    employees.push(data);
    Promise.resolve();
      }
  });

  fs.readFile('/data/departments','utf8', (err, data) => {
    if (err){
        Promise.reject(new Error('unable to read file')).then(function() {
            // not called
          }, function(error) {
            console.log(error); // Stacktrace
          });
    }
    else{
    JSON.parse(data);
    departments.push(data);
    Promise.resolve();
    }
  });
}