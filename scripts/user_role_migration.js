/**
 * Created by nvargas on 10/6/17.
 */
var csv = require('fast-csv');
var createNewUserApi = require('./sal/CreateNewUserApi');
var config = require('./config.js')();
var fs = require('fs');
var request = require('request');
var json2csv = require('json2csv');

var options = {
    method: 'GET',
    uri: config.loginUri,
    rejectUnauthorized: false
};

request(options, function (error, response, body) {
    if (!error) {
        if (response.statusCode === 200) {

            var token = JSON.parse(body).token;

            csv
                .fromPath("./files/user_detail_export_3.csv", {headers: true})
                .on("data", function(data){

                    var obj = {
                        "FirstName": data.FIRST_NAME
                        , "LastName": data.LAST_NAME
                        , "Email": data.EMAIL
                        , "Login": data.USER_NAME
                        , "IsExternal": data.IS_INTERNAL_USER != 1
                        , "CreatedBy": data.CREATED_BY
                        , "AppKey": "SPT"
                    };

                    var CategoryAccess = data.CATEGORIES;

                    if (CategoryAccess.indexOf("Non-Finals") >= 0 &&
                        CategoryAccess.indexOf("Super Duper Hidden Stuff") >= 0)
                        obj.ChannelsAccess = ["MASTER"];
                    else if (CategoryAccess.indexOf("Non-Finals") == -1 &&
                        CategoryAccess.indexOf("Super Duper Hidden Stuff") == -1 &&
                        CategoryAccess.indexOf("Recently Added") >= 0 &&
                        CategoryAccess.indexOf("Sales Exclusive") >= 0 &&
                        CategoryAccess.indexOf("Pilots") >= 0 &&
                        CategoryAccess.indexOf("Features (Current Theatrical)") >= 0 &&
                        CategoryAccess.indexOf("LATAM Sales Exclusive") >= 0 &&
                        CategoryAccess.indexOf("International Productions Sales Exclusive") >= 0)
                        obj.ChannelsAccess = ["SALES EXCLUSIVE"];
                    else if (CategoryAccess.indexOf("Sales Exclusive") == -1 &&
                        CategoryAccess.indexOf("LATAM Sales Exclusive") == -1 &&
                        CategoryAccess.indexOf("International Productions Sales Exclusive") == -1 &&
                        CategoryAccess.indexOf("Non-Finals") == -1 &&
                        CategoryAccess.indexOf("Super Duper Hidden Stuff") == -1 &&
                        CategoryAccess.indexOf("Recently Added") >= 0 &&
                        CategoryAccess.indexOf("Pilots") >= 0 &&
                        CategoryAccess.indexOf("Features (Current Theatrical)") >= 0)
                        obj.ChannelsAccess = ["SONY EMPLOYEE"];
                    else if (CategoryAccess.indexOf("Recently Added") == -1 &&
                        CategoryAccess.indexOf("Sales Exclusive") == -1 &&
                        CategoryAccess.indexOf("Pilots") == -1 &&
                        CategoryAccess.indexOf("Features (Current Theatrical)") == -1 &&
                        CategoryAccess.indexOf("LATAM Sales Exclusive") == -1 &&
                        CategoryAccess.indexOf("International Productions Sales Exclusive") == -1 &&
                        CategoryAccess.indexOf("Non-Finals") == -1 &&
                        CategoryAccess.indexOf("Super Duper Hidden Stuff") == -1 &&
                        CategoryAccess.length > 0)
                        obj.ChannelsAccess = ["CLIENT FULL"];
                    else if (CategoryAccess.indexOf("Sales Exclusive") >= 0)
                        obj.ChannelsAccess = ["SALES EXCLUSIVE"];
                    else if (data.EMAIL.toLowerCase().indexOf("spe.sony.com") >= 0 &&
                        CategoryAccess.indexOf("Sales Exclusive") == -1)
                        obj.ChannelsAccess = ["SONY EMPLOYEE"];
                    else if (CategoryAccess.length == 0)
                        obj.ChannelsAccess = null;
                    else
                        obj.ChannelsAccess = ["CLIENT FULL"];

                    createNewUserApi(obj, token, function(err) {
                        if (err) {
                            console.log('failed to create user: ' + obj.Login);
                            var fields = ['FirstName', 'LastName', 'Email', 'Login', 'IsExternal', 'CreatedBy', 'AppKey'];
                            var result = json2csv({ data: obj, fields: fields, hasCSVColumnTitle: false });
                            fs.appendFile('./files/failed_user_insert.csv', result + ',\"' + CategoryAccess + '\"\n', function () {
                                console.log('failed to insert: ' + obj.Login);
                            });
                        }
                    });

                });

        } else {
            console.log('error in requesting token');
        }
    } else {
        console.log(error);
    }
});