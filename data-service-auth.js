const bcrypt = require('bcryptjs');

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://web322:Seneca2021@senecawev.s01v0.mongodb.net/web322_week8?retryWrites=true&w=majority");

var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory":
        [{
            "dateTime": Date,
            "userAgent": String
        }]
});

let User = mongoose.model("web322_week8", userSchema);

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {

        let db = mongoose.createConnection("mongodb+srv://web322:Seneca2021@senecawev.s01v0.mongodb.net/web322_week8?retryWrites=true&w=majority");
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    //console.log(">>>>>>>>>%%%%%%%%%%%registeruser" + JSON.stringify(userData));
    return new Promise(function (resolve, reject) {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        }
        else {
            let newUser = new User(userData);
            bcrypt.genSalt(10, function (err, salt) { // Generate a "salt" using 10 rounds
                bcrypt.hash(newUser.password, salt, function (err, hash) { // encrypt the password: "myPassword123"
                    // TODO: Store the resulting "hash" value in the DB
                    if (err) {
                        reject("There was an error encrypting the password");
                    }
                    else {
                        newUser.password = hash;
                        newUser.save((err) => {
                            if (err) {
                                if (err === 11000) {
                                    reject("User Name already taken");
                                }
                                else {
                                    reject(`There was an error creating the user: ${err}`);
                                }
                            } else {
                                resolve();
                            }

                        });
                    }
                });

            });
        };

    });
}

//checkUser(userData)
module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })
            //User = database , user= data that the db sends back
            .exec()
            .then((user) => {

                if (user.length == 0) {
                    reject("Unable to find user: " + userData.userName);
                }
                else if (user.length == 1) {
                    bcrypt.compare(userData.password, user[0].password).then((res) => {
                        if (res) {

                            user[0].loginHistory.push({
                                dateTime: (new
                                    Date()).toString(), userAgent: userData.userAgent
                            });
                            User.updateOne({ userName: user[0].userName },
                                {
                                    $set: { loginHistory: user[0].loginHistory }
                                }
                            )
                                .exec()
                                .then(() => {
                                    console.log("###########RESOLVE" + user[0]);
                                    resolve(user[0]);
                                })
                                .catch((err) => {

                                    reject("there was an error verifying the uses:" + err);
                                    //reject("There was an error verifying the user:" + err); <<<<<<<<<<<<<<<==================== " + err
                                });


                        }
                        else {
                            reject("Incorrect Password for user: " + userData.userName);
                        }

                    });
                }
            })
            .catch((err) => {

                reject("Error: Unable to find user:" +
                    userData.userName);

            }
            )
    });
}


module.exports.getAllUsers = function () {
    return new Promise(function (resolve, reject) {
        //console.log(">>>>>>>>ALLUSERS");
        User.find({})
            //User = database , user= data that the db sends back
            .exec()
            .then((data) =>
            //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<========================= change user to data
            {
                // console.log(">>>>>>>>ALLUSERS");
                //console.log(data);
                resolve(data);
            }
            ).catch(function (error) {

                reject("no all users results returned");

            });
    });
}





//module.exports.checkUser = function (userData) {
    //return new Promise(function (resolve, reject) {
    //     console.log("checkUser >>>>>>>>>>>>>>"+JSON.stringify(userData));
    //     User.find({ user: userData.userName })
    //         //User = database , user= data that the db sends back 
    //         .exec()
    //         .then((user) => 
    //             {
    //                 console.log("#########%%%%%%%%%%%USEEEER"+ JSON.stringify(user));
    //             if (user.length == 0) {
    //                 reject("Unable to find user:" + userData.userName);
    //             }
    //             else if (user.length == 1) {
    //                 if (user[0].password == userData.password) {
    //                     resolve();
    //                 }
    //                 else {
    //                     reject("Incorrect Password for user:" + userData.userName);
    //                 }
    //             }
    //             else {

    //                 user[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });

    //                 User.updateOne({ userName: users[0].userName },
    //                     {
    //                         $set: { loginHistory: users[0].loginHistory }
    //                     }
    //                 )
    //                 .exec()
    //                     .then(() => {
    //                         resolve(users[0]);
    //                     })
    //                     .catch((err) => {
    //                         reject("There was an error verifying the user:" + err);

    //                     });

    //             }
    //         }
    //         )
    //         .catch(() => {

    //             reject("Error: Unable to find user:" + userData.user);
    //         }
    //         )       
    // });
    // }

    // module.exports.getAllUsers = function () {
    //     return new Promise(function (resolve, reject) {
    // console.log(">>>>>>>>ALLUSERS");
    //         User.find({} )
    //         //User = database , user= data that the db sends back 
    //         .exec()
    //         .then((user) => 
    //             {
    //  console.log(">>>>>>>>ALLUSERS");
    // console.log(data);
    //             resolve(data);
    //         }
    //         ).catch(function (error) {

    //             reject("no all users results returned");

    //         });
    //     });
    // }

