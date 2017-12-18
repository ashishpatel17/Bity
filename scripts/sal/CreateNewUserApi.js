/**
 * Created by nvargas on 10/6/17.
 */
var request = require('request');
var config = require('../config.js')();

var CreateNewUserApi = function(obj, token, callback) {

    var url = config["createNewUserApiEndpoint"];

    var options = {
        body: JSON.stringify({
            "FirstName": obj.FirstName,
            "LastName": obj.LastName,
            "Email": obj.Email,
            "Login": obj.Login,
            "IsExternal": obj.IsExternal,
            "CreatedBy" : obj.CreatedBy,
            "ChannelsAccess" : obj.ChannelsAccess,
            "AppKey" : obj.AppKey
        }),
        headers: {
            "x-access-token": token,
            "Content-Type": "application/json"
        },
        rejectUnauthorized: false
    };

    request.post(
        url,
        options,
        function(err, res, body) {
            if (!err && res.statusCode === 200) {
                callback(null, body);
            }
            else {
                console.log('retrying: ' + obj.Login);
                CreateNewUserApi(obj, token, function(err) {
                    if (err) callback(err, null);
                    else callback(null, body);
                });

            }
        }
    );
};

module.exports = CreateNewUserApi;