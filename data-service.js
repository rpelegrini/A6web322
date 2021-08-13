const { and } = require('sequelize');
const Sequelize = require('sequelize');
var sequelize = new Sequelize('d4a7oi9gslmp4h', 'nkvdvzockohyjm', 'bd55c71fe936887ab239c2886e134883da9c6ae451f648da6a6c17ba6e64274d', {
    host: 'ec2-34-204-128-77.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Employee = sequelize.define('Employee', {
    employeeNum:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING

});

var Department = sequelize.define('Department', {
    departmentId:
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    departmentName: Sequelize.STRING
});


//initialize
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {

        sequelize.sync().then(function () {

            resolve();

        }).catch(function (error) {

            reject("unable to sync the database");

        });
    });
}

//getAllEmployees
module.exports.getAllEmployees = function () {
    return new Promise(function (resolve, reject) {

        Employee.findAll().then(function (data) {

            resolve(data);

        }).catch(function (error) {

            reject("no results returned");

        });
    });
}

//getEmployeesByStatus
module.exports.getEmployeesByStatus = function (status) {
    return new Promise(function (resolve, reject) {

        Employee.findAll({ where: { status: employeeData.status } }).then(function (data) {

            resolve(data);

        }).catch(function (error) {

            reject("no results returned");

        });
    });
}
//getEmployeesByDepartment 
module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {

        Employee.findAll({ where: { department: department } }).then(function (data) {

            resolve(data);

        }).catch(function (error) {

            reject("no results returned");

        });
    });
}

//getEmployeesByManager(manager)
module.exports.getEmployeesByManager = function (manager) {
    return new Promise(function (resolve, reject) {

        Employee.findAll({
            where:
            {
                empManagerNum: manager,
                isManager: true
            }
        }).then(function (data) {

            resolve(data);

        }).catch(function (error) {

            reject("no results returned");

        });
    });
}


//getEmployeeByNum(num)
module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {

        Employee.findAll({ where: { employeeNum: num } }).then(function (data) {

            resolve(data);

        }).catch(function (error) {

            reject("no results returned");

        });
    });
}
//getDepartments
module.exports.getDepartments = function () {
    return new Promise(function (resolve, reject) {

        Department.findAll().then(function (data) {

            resolve(data);

        }).catch(function (error) {

            reject("no results returned");

        });
    });
}

//addEmployee
module.exports.addEmployee = function (employeeData) {
   
    return new Promise(function (resolve, reject) {

        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (const p in employeeData) {//[p]= value, p stands for properties, and p by itself is the proprerty name
            if (employeeData[p] == "") {
                employeeData[p] = null;
            }
        }
        Employee.create(employeeData).then(function () {

            resolve();

        }).catch(function (error) {

            reject("unable to create employee");

        });
    });
}




//updateEmployee
module.exports.updateEmployee = function (employeeData) {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (const p in employeeData) {
            if (employeeData[p] == "") {
                employeeData[p] = null;
            }

        }
        Employee.update(employeeData,
            {
                where: { employeeNUm: employeeData.employeeNum }
            }
        ).then(function () {

            resolve();

        }).catch(function (error) {

            reject("unable to update employee");

        });
    });
}



//addDepartment(departmentData)
module.exports.addDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {

        for (const p in departmentData) {
            if (departmentData[p] == "") {
                departmentData[p] = null;
            }

        }
        Department.create(departmentData).then(function () {


            resolve();

        }).catch(function (error) {

            reject("unable to create department");

        });
    });
}


//UPDATEDEPARTMENT
module.exports.updateDepartment = function (departmentData) {
    return new Promise(function (resolve, reject) {
        for (const p in departmentData) {
            if (departmentData[p] == "") {
                departmentData[p] = null;
            }

        }
        Department.update(departmentData,
            {
                where: {departmentId:departmentData.departmentId}
            }
        ).then(function () {

            resolve();

        }).catch(function (error) {

            reject("unable to update employee");

        });
    });
}


//getDepartmentByNum(id)
module.exports.getDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {

        Department.findAll({ where: { departmentId:id } }).then(function (data) {

            resolve(data[0]);

        }).catch(function (error) {

            reject("no results returned");

        });
    });
}

//EMPLOYEE DESTROY
module.exports.deleteEmployeeByNum=function(empNum){
    return new Promise(function (resolve, reject) {
        console.log(empNum);

        Employee.destroy({where:{employeeNum:empNum}}).then(function (data) {
            console.log(data);
            
            resolve("destroyed");

        }).catch(function (error) {
            console.log(error);
            reject();

        });
    });
}








//module.exports.getManagers = function () {
    //return new Promise(function (resolve, reject) {
        //reject();
    //});
//}


