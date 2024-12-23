const Sequelize = require('sequelize');
var sequelize = new Sequelize('d84kpprkfvl7tq', 'fknjdvgcrveyss', 'b587aebca6d57b6919c2c652b9f43187f54ea404ccacfbffe2c754e6bb77f841', {
  host: 'ec2-54-83-192-245.compute-1.amazonaws.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: true
  }
});

// Define an "Employees" model
var Employees = sequelize.define('Employees', {
  empNum: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "empNum" as a primary key
    autoIncrement: true // automatically increment the value
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  hireDate: Sequelize.STRING
});

// Define a "Departments" model
var Departments = sequelize.define('Departments', {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "departmentId" as a primary key
    autoIncrement: true // automatically increment the value
  },
  departmentName: Sequelize.STRING
});

/*This will ensure that our Employee model gets a "department" column that will act as a foreign key to the Department model.
When a Department is deleted, any associated Employee's will have a "null" value set to their "department" foreign key.*/
Departments.hasMany(Employees, { foreignKey: 'department' });

module.exports.initialize = () => {
  return new Promise(function (resolve, reject) {
    sequelize.sync().then(() => {
      console.log("employee database sync success!");
      resolve();
    }).catch(function () {
      reject("unable to sync the employee database");
    });
  });
}

module.exports.getAllEmployees = () => {
  return new Promise((resolve, reject) => {
    Employees.findAll({
      order: sequelize.col('empNum')
    })
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

let getEmployeesByOption = (key, value) => {
  return new Promise((resolve, reject) => {
    Employees.findAll({
      where: { [key] : value }
    })
      .then(data => resolve(data))
      .catch(err => reject(err));
  });
}

module.exports.getManagers = () => {
  return getEmployeesByOption("isManager", true);
}

module.exports.getDepartments = () => {
  return new Promise((resolve, reject) => {
    Departments.findAll()
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

prepData = (data) => {
  for (let values in data) {
    if (data[values] == "")
      data[values] = null;
  }
  data.isManager = (data.isManager) ? true : false;
  return data;
}

module.exports.addEmployee = (employeeData) => {
  return new Promise((resolve, reject) => {
    employeeData = prepData(employeeData);
    console.log(employeeData);
    Employees.create(employeeData)
      .then(employee => {
        console.log(employee.firstName)
        resolve(`creation success: ${employee}`)
      })
      .catch(err => reject(err));
  });
}

module.exports.addDepartment = (data) => {
  return new Promise((resolve, reject) => {
    data = prepData(data);
    Departments.create(data)
      .then(() => resolve("success!"))
      .catch(() => reject("unable to create department"));
  });
}

module.exports.getEmployeesByStatus = (status) => {
  return getEmployeesByOption("status", status);
}

module.exports.getEmployeesByDepartment = (department) => {
  return getEmployeesByOption("department", department);
}

module.exports.getEmployeesByManager = (manager) => {
  return getEmployeesByOption("employeeManagerNum", manager);
}

module.exports.getEmployeeByNum = (num) => {
  return getEmployeesByOption("empNum", num);
}

module.exports.updateEmployee = (data) => {
  return new Promise((resolve, reject) => {
    data = prepData(data);
    Employees.updateOne(data, {
      where: { empNum: data.empNum }
    }).then(() => resolve("success!"))
      .catch((err) => reject(err));
  });
}

module.exports.updateDepartment = (data) => {
  return new Promise((resolve, reject) => {
    data = prepData(data);
    Departments.updateOne({
      departmentId: data.departmentId,
      departmentName: data.departmentName
    }, {
        where: { departmentId: data.departmentId }
      })
      .then(() => resolve(Departments))
      .catch(() => reject("unable to update department"));
  });
}

module.exports.getDepartmentbyId = (id) => {
  return new Promise((resolve, reject) => {
    Departments.findAll({
      where: { departmentId: id }
    })
      .then((data) => { resolve(data[0]) })
      .catch((err) => reject("no results returned"));
  });
}

module.exports.deleteDepartmentById = (id) => {
  return new Promise((resolve, reject) => {
    Departments.destroy({
      where: { departmentId: id }
    })
      .then(() => resolve())
      .catch(() => reject("error deleting department"))
  });
}

module.exports.deleteEmployeeByNum = (empNum) => {
  return new Promise((resolve, reject) => {
    Employees.destroy({
      where: { empNum: empNum }
    })
      .then(() => resolve("Destroyed"))
      .catch((err) => reject(err))
  });
}