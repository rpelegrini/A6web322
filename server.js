/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Rafaela Pelegrini Student ID: rpelegrinideoliveira Date: 2021-08-12
*
* Online (Heroku) Link: ________________________________________________________
*
********************************************************************************/
const dataServiceAuth = require('./data-service-auth.js');
const express = require("express");
const path = require("path");
const dataService = require("./data-service.js");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require("multer");
const exphbs = require('express-handlebars');
const { Console } = require("console");
const app = express();
const clientSessions = require("client-sessions");
const { request } = require('https');

const HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: "main",
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

app.set('view engine', '.hbs');

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        // we write the filename as the current date down to the millisecond
        // in a large web service this would possibly cause a problem if two people
        // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
        // this is a simple example.
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

//client session
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

//ENSURE LOGIN
function ensureLogin(req, res, next) {
    if (!req.session) {
        res.redirect("/login");
    } else {
        next();
    }
}


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/images/add", ensureLogin, (req, res) => {
    res.render("addImage");
});

app.get("/employees/add", ensureLogin, (req, res) => {

    dataService.getDepartments(req.query.status).then((departmentData) => {
        console.log(departmentData);
        res.render("addEmployee", { departments: departmentData });

        //res.addEmployee("employees", {departments:data});

    }).catch((err) => {
        res.render("employees", { departments: [] });
    });

});


app.get("/images", ensureLogin, (req, res) => {
    fs.readdir("./public/images/uploaded", function (err, items) {
        res.render("images", { images: items });
    });
});




app.get("/employees", ensureLogin, (req, res) => {

    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status).then((statusData) => {
            if (statusData.length > 0) {
                res.render("employees", { employees: statusData });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    }
    else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department).then((departmentData) => {
            if (departmentData.length > 0) {
                res.render("employees", { employees: departmentData });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    }
    else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager).then((employeeData) => {
            if (employeeData.length > 0) {
                res.render("employees", { employees: emloyeeData });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    }
    else {
        dataService.getAllEmployees().then((employeesData) => {
            if (employeesData.length > 0) {
                res.render("employees", { employees: employeesData });
            }
            else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    }
});


//CHANGED
//"/employee/:empNum" route
app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values

    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum).then((employeeData) => {

        if (employeeData) {//RETURN ONE OBJ ONLY FROM ARRAY
            viewData.employee = employeeData[0]; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
        //how fix it: convert empnum  array to single object

    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error

    }).then(dataService.getDepartments)
        .then((departmentData) => {

            viewData.departments = departmentData;
            // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error

        }).then(() => {

            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
});

// app.get("/employee/:empNum", (req, res) => {
//   data.getEmployeeByNum(req.params.empNum).then((data) => {
//        res.render("employee", {employee: data});
//     }).catch((err) => {
//        res.render("employee",{message:"no results"});
//     });
// });



app.get("/departments", ensureLogin, (req, res) => {
    dataService.getDepartments().then((departmentData) => {
        if (departmentData.length > 0) { //added
            res.render("departments", { departments: departmentData });
        }
        else {
            res.render("departments", { message: "no results" });
        };
    });
});


app.post("/employees/add", ensureLogin, (req, res) => {
    dataService.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    });
});

app.post("/images/add", upload.single("imageFile"), ensureLogin, (req, res) => {
    res.redirect("/images");
});


app.post("/employee/update", ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body).then(() => {
        res.redirect("/employees");
    });

});

//departments/add GET

app.get("/departments/add", ensureLogin, (req, res) => {
    res.render("addDepartment");
});



//departments/add POST
app.post("/departments/add", ensureLogin, (req, res) => {
    dataService.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    });
});



//department/update POST
app.post("/department/update", ensureLogin, (req, res) => {
    dataService.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    });

});

// /department/:departmentId

app.get("/department/:departmentId", ensureLogin, (req, res) => {
    dataService.getDepartmentById(req.params.departmentId).then((departmentData) => {
        if (departmentData === undefined) {
            res.status(404).send("Department Not Found");
        }
        console.log(">>>>>>>>>***departmentDATA" + departmentData);
        console.log(">>>>>>>>>***departmentDATA" + JSON.stringify(departmentData));
        res.render("department", { employee: departmentData });


    }).catch((err) => {
        res.status(404).send("Department Not Found");
    });
});

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    console.log(req.params.empNum);

    dataService.deleteEmployeeByNum(req.params.empNum).then((deleteEmployee) => {
        console.log(deleteEmployee);
        if (deleteEmployee === undefined) {

            res.status(500).send("Employee Not Found");
        }
        res.redirect("/employees");


    }).catch((err) => {
        res.status(500).send("Unable to Remove Employee / Employee not found)");
    });
});


//A6<<<START>>>
// DATA.INITIALIZE();

// dataService.initialize()
// .then(function(){
//  app.listen(HTTP_PORT, function(){
//  console.log("app listening on: " + HTTP_PORT)
//  });
// }).catch(function(err){
//  console.log("unable to start server: " + err);
// });





//GET REGISTER
app.get("/register", (req, res) => {
    res.render("register");
});

//app.get /LOGIN
app.get("/login", (req, res) => {
    res.render("login");
});

//POST REGISTER
app.post("/register", (req, res) => {
    //app.post("/register",ensureLogin, (req, res) => {
    dataServiceAuth.registerUser(req.body).then(() => {

        res.render("register", { successMessage: "User created" });

    })
        .catch(function (err) {

            res.render("register", { errorMessage: err, userName: req.body.userName }
            )
        });
})

app.get("/users", (req, res) => {
    dataServiceAuth.getAllUsers().then((data) => {
        res.send(data);
    });
});

//POST .LOGIN
app.post("/login", (req, res) => {
    //app.post("/login",ensureLogin, (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName, // authenticated user's userName
            email: user.email, // authenticated user's email
            loginHistory: user.loginHistory // authenticated user's loginHistory
        }
        res.redirect('/employees');
    })
        .catch(function (err) {

            res.render("login", { errorMessage: err, userName: req.body.userAgent });
        })
});


//GET /LOGOUT
app.get("/logout", (req, res) => {
    req.session.destroy();

    res.redirect('/');
});


//GET userHistory
app.get("/userHistory", ensureLogin, (req, res) => {
    res.render('userHIstory', { sessionData: req.session.user });
});



//DO NOT ADD ANYTHING AFTER THIS POINT  



//data.initialize().then(function () {
//app.listen(HTTP_PORT, function () {
//  console.log("app listening on: " + HTTP_PORT)
//});
//}).catch(function (err) {
//  console.log("unable to start server: " + err);
//});

//});

//dataService.initialize()
dataService.initialize()
    .then(dataServiceAuth.initialize)
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function (err) {
        console.log("unable to start server: " + err);
    });


app.use((req, res) => {
    res.status(404).send("Page Not Found");
});