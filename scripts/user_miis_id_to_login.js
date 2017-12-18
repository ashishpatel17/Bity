var dbconn = require('./dbconnection.js');
var config = require('./config')();
var SroUserRoleDB = require('./dal/SroUserRoleDB');
var mongoose = require('mongoose');
var async = require('async');
var csv = require('fast-csv');
var json2csv = require('json2csv');
var fs = require('fs');

dbconn.Init(config.url, function () {
    SroUserRoleDB.findSROUsers({}, function (err, userList) {

        var promiseFunctions = [];

        var func = function (userObj) {
            return new Promise(function (resolve, reject) {
                var userId = userObj._id;
                userObj._id = userObj.Login;
                SroUserRoleDB.saveUserAdminObj(userObj, function (updateErr, UpdateRes) {
                    if (updateErr) {
                        resolve(userId + " - error");
                    } else {
                        resolve(userId);
                    }
                })
            })
        };

        for (var u = 0; u < userList.length; u++) {
            if (userList[u]._id != userList[u].Login) {
                promiseFunctions.push(func(userList[u]));
            }
        }

        Promise.all(promiseFunctions).then(function (result) {
            var failed = [];
            var success = [];
            var delData = result.filter(function (v) {
                if (v.indexOf("error") == -1) {
                    success.push(v);
                } else {
                    failed.push({"user_id": v.substr(0, v.indexOf(" - error"))});
                }
            });
            SroUserRoleDB.removeUser({_id: {$in: success}}, function (err, res) {
                console.log("--------------------Completed------------------------");
                var result = json2csv({ data: failed, fields: ["user_id"]});
                fs.appendFile('./files/failed_user_login_update.csv', result , function () {
                    console.log('find user failed to update in failed_user_login_update.csv file');
                });
            });

        }).catch(function (err) {
            console.log(err)
        })

    });
});
