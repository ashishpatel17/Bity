var _ = require('underscore');
var async = require('async');
var userAuthDB = require('../dal/userAuthenticationDB');
var userLoginDB = require('../dal/userLoginDB');
var userProfileDB = require('../dal/userProfileDB');

function UserValidation() {

    this.getLoginInfo = function(req, callback) {
        userAuthDB.getInfoByAccessToken(req.headers['x-access-token'], function(err, loginInfo) {
            if (err) {
                callback(new Error('unauthorized'));
            } else {
                if (!_.isUndefined(loginInfo) && !_.isNull(loginInfo)) {
                    callback(null, loginInfo);
                } else {
                    callback(new Error('unauthorized'));
                }
            }
        })
    };

    this.getUserInfoByToken = function(req, callback) {
        userAuthDB.getInfoByAccessToken(req.headers['x-access-token'], function(err, loginInfo) {
            if (err) {
                callback(new Error('unauthorized'));
            } else {
                if (!_.isUndefined(loginInfo) && !_.isNull(loginInfo)) {
                    userProfileDB.getUserByEmail(loginInfo.UserEmail, function(err, userInfo) {
                        if (err) {
                            callback(new Error('unauthorized'));
                        } else {
                            if (!_.isUndefined(userInfo) && !_.isNull(userInfo)) {
                                callback(null, userInfo);
                            } else {
                                callback(new Error('unauthorized'));
                            }
                        }
                    })
                } else {
                    callback(new Error('unauthorized'));
                }
            }
        })
    };
}

module.exports = UserValidation;
