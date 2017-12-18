/**
 * Created by nvargas on 10/6/17.
 */
var csv = require('fast-csv');
var config = require('./config.js')();
var fs = require('fs');
var json2csv = require('json2csv');
var dbconn = require('./dbconnection.js');
var SroUserRoleDB = require('./dal/SroUserRoleDB');

dbconn.Init(config.url, function () {
    csv
    .fromPath("./files/sphe_user_validation.csv", {headers: true})
    .on("data", function(data){

        var login = data.USER_NAME;
        if (login.trim().length > 0) {
            SroUserRoleDB.findSROUsers({Login: { $regex : new RegExp("^"+login+"$", "i") }}, function (err, userList) {
                if(userList.length == 0) {
                    console.log('User not found: ' + login);
                }
            });
        }
    });
});