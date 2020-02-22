const bcrypt = require('bcryptjs');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        dateTime: Date,
        userAgent: String
    // }],
    // "cartItems": [{
    //     quantity: Number,
    //     item: String
    }]
});

let User = {}; // to be defined on new connection (see initialize)
// let db = mongoose.createConnection("mongodb+srv://AdamTV:thepassword@a6-iiyjw.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true });
// db.once('open', () => {
//     User = db.model("users", userSchema);
// });
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        // let db = mongoose.createConnection("mongodb+srv://test:test123@a6-iiyjw.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true });
        let db = mongoose.createConnection("mongodb://adamtv13:thepassword1@ds255107.mlab.com:55107/heroku_3fz7trkw", { useNewUrlParser: true });
        console.log(`Mongoose connection created`);
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            console.log(`user database modeled`);
            resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }

        // bcrypt.genSalt(10, function(err, salt) { // Generate a "salt" using 10 rounds
        //     if (err) {
        //         reject(`There was an error salting the password`);
        //     }
        //     bcrypt.hash(userData.password, salt, function (err, hash) { // encrypt the password
        //         if (err) {
        //             reject(`There was an error encrypting the password`);
        //         }
        //         userData.password = hash;
        //     });
        // });

        // bcrypt.genSalt(10, function (err, salt) { // Generate a "salt" using 10 rounds
        //     bcrypt.hash(userData.password, salt, function (err, hash) { // encrypt the password
        //         userData.password = hash;
        //     });
        // });

        userData.password = bcrypt.hashSync(userData.password, 10);

        var newUser = new User(userData);
        newUser.save((err) => {
            if (err) {
                reject("There was an error creating the user:" + err);
            }
            resolve();
        });
    });
}

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then((user) => {
                if (user.length == 0)
                    reject(`Unable to find user: ${userData.userName}`);
                if (bcrypt.compareSync(userData.password, user[0].password)) {
                    user[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                    User.update({ userName: user[0].userName }, { $set: { loginHistory: user[0].loginHistory } })
                        .exec()
                        .then(resolve(user[0]))
                        .catch((err) => { reject(`There was an error verifying the user: ${err}`) });
                    //reject(`Incorrect Password for user: ${userData.userName}`);
                }
            }).catch((err) => {
                reject(err);
            });
    });
    // .catch((err) => {
    //     reject(`Unable to find user: ${userData.userName}\n ${err}`);
    // });
}