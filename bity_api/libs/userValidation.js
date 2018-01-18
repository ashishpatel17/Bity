var _ = require('underscore');
var async = require('async');
var config = require('../config')();
var userAuthDB = require('../dal/UserAuthenticationDB');
var userLoginDB = require('../dal/UserLoginDB');
var userProfileDB = require('../dal/UserProfileDB');
var jwt = require('jsonwebtoken');

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

    this.saveLoginObject = function(req,userEmail,callback){

      var accessToken = jwt.sign({user: userEmail}, config.sessionSecretKey, {
          expiresIn: config.accessTokenTimeoutInMinutes * 60
      });

      var refreshToken = jwt.sign({user: userEmail}, config.sessionSecretKey, {
          expiresIn: config.refreshTokenTimeoutInMinutes
      });

      userProfileDB.getUserByEmail(userEmail,function(err,userResult){
        if(userResult){
          var expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + (config.accessTokenTimeoutInMinutes * 60 * 1000));
          var profilePicPath = "http://"+req.headers.host+"/"+config.profilePicturePublicPath;
          var authObj = {
            accessToken : accessToken
           , refreshToken : refreshToken
           , LoginDate : new Date()
           , UserEmail : userResult.email
           , UserId : userResult._id
           , UserName : userResult.userName
           , UserFullName : userResult.fullName
           , ProfilePic : (userResult.profilePicture == undefined || userResult.profilePicture == null)?profilePicPath+config.profileDefaultImage:profilePicPath+userResult.profilePicture
           , ExpirationDate : expirationDate
          }
          userAuthDB.saveUserAuthenticationObj(authObj,function(err,result){
            if(err){
              callback({errorCode:500,Message:"Unable to login"},null);
            }else{
              callback(null,authObj);
            }
          })
        }else{
          callback({errorCode:500,Message:"User not found"},null);
        }
      })
    }
}

module.exports = UserValidation;
