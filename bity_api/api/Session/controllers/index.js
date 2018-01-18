var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var jwt = require('jsonwebtoken');
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var _ = require('underscore');
var bcrypt = require('bcrypt');

function SessionController(userAuthDB, UserLoginDB, UserProfileDB) {

  this.validateSession = function (req, res, next) {
    	if(config.validateToken){
    		var sess = req.session;
    		if (typeof req.headers['x-access-token'] !== 'undefined') {
    		    jwt.verify(req.headers['x-access-token'], config.sessionSecretKey, function (err) {
    		        if (err) {
    		            regeneratSession(req, function (err, newAccessToken) {
    		                if (err) {
    		                    res.status(403);
    		                    res.send({"Message": "unable to get token","statusCode":403});
    		                } else {
    		                    res.set('x-access-token', newAccessToken);
    		                    next();
    		                }
    		            });
    		        } else {
    		            next();
    		        }
    		    });
    		}
    		else {
    		    res.status(400);
    		    res.send({"Message": "Invalid request","statusCode":400});
    		}
    	}else{
    		 next();
    	}
    };

    var regeneratSession = function (req, callback) {
        var sess = req.session;
        if (req.headers['x-refresh-token']) {
          jwt.verify(req.headers['x-refresh-token'], config.sessionSecretKey, function(err) {
              if (err) {
                  callback('Invalid request');
              } else {
                  // if (sess.refreshToken === req.headers['x-refresh-token']) {
                      userAuthDB.getInfoByAccessToken(req.headers['x-access-token'], function(err,loginInfo) {
                          if (loginInfo && loginInfo.UserEmail) {

                              var newAccessToken = jwt.sign({user: loginInfo.UserEmail}, config.sessionSecretKey, {
                                  expiresIn: config.accessTokenTimeoutInMinutes * 60
                              });

                              // sess.accessToken = newAccessToken;

                              var today = new Date();

                              var expirationDate = new Date();
                              expirationDate.setTime(expirationDate.getTime() + (config.accessTokenTimeoutInMinutes * 60 * 1000));

                              var authObj = {
                                accessToken : newAccessToken
                               , refreshToken : req.headers['x-refresh-token']
                               , LoginDate : today
                               , UserEmail : loginInfo.UserEmail
                               , ExpirationDate : expirationDate
                              }
                              userAuthDB.saveUserAuthenticationObj(authObj,function(err,result){})
                              callback(null, newAccessToken);
                          } else {
                              callback('Session not found');
                          }
                      });
                  // } else {
                  //     callback('Invalid Request');
                  // }
              }
          })
        } else {
            callback('Invalid Request');
        }
    };

    this.loginWithFacebook = function(req, res){
      if (req && typeof req !== 'undefined' &&
          req.body && typeof req.body !== 'undefined' &&
          req.body['facebookId'] && typeof req.body['facebookId'] !== 'undefined') {
          UserProfileDB.getUserByFacebookId(req.body['facebookId'],function(err,result){
            if(err){
              res.status(402);
              res.send({"Message": "Login Failed","statusCode":402});
            }else{
              if(result){

                UserProfileDB.getUserByEmail(result.email,function(err,userProf){
                  if(err){
                    res.status(500);
                    res.send({"Message": "unable to fetch user","statusCode":500});
                  }else {
                    if(userProf){
                      UserValidation.saveLoginObject(req,result.email,function(err,finalObj){
                        if(err){
                          res.status(err.errorCode);
                          res.send({"Message": err.Message});
                        }else{
                          // var sess = req.session;
                          // sess.accessToken = finalObj.accessToken;
                          // sess.refreshToken = finalObj.refreshToken;
                          res.set('x-access-token', finalObj.accessToken);
                          res.set('x-refresh-token', finalObj.refreshToken);
                          var resData = {
                            userId : finalObj.UserId
                            , userName : finalObj.UserName
                            , userFullName : finalObj.UserFullName
                            , email : finalObj.UserEmail
                            , xAccessToken : finalObj.accessToken
                            , xRefreshToken : finalObj.refreshToken
                            , profilePic : finalObj.ProfilePic
                            , loginType : "facebook"
                            , isEmailVerified : result.isEmailVerified
                          }
                          res.status(200);
                          res.send({data:resData,statusCode:200});
                        }
                      })
                    }else{
                      res.status(408);
                      res.send({"Message": "User not found","statusCode":408});
                    }
                  }
                })
              }else{
                res.status(408);
                res.send({"Message": "User not found","statusCode":408});
              }
            }
          })
      } else {
          res.status(400);
          res.send({"Message": "Invalid request","statusCode":408});
      }
    }

    this.loginWithGoogle = function(req, res){
      if (req && typeof req !== 'undefined' &&
          req.body && typeof req.body !== 'undefined' &&
          req.body['googleId'] && typeof req.body['googleId'] !== 'undefined') {
          UserProfileDB.getUserByGoogleId(req.body['googleId'],function(err,result){
            if(err){
              res.status(402);
              res.send({"Message": "Login Failed","statusCode":402});
            }else{
              if(result){
                  UserProfileDB.getUserByEmail(result.email,function(err,userProf){
                    if(err){
                      res.status(500);
                      res.send({"Message": "unable to fetch user","statusCode":500});
                    }else {
                      if(userProf){
                        UserValidation.saveLoginObject(req,result.email,function(err,finalObj){
                          if(err){
                            res.status(err.errorCode);
                            res.send({"Message": err.Message});
                          }else{
                            // var sess = req.session;
                            // sess.accessToken = finalObj.accessToken;
                            // sess.refreshToken = finalObj.refreshToken;
                            res.set('x-access-token', finalObj.accessToken);
                            res.set('x-refresh-token', finalObj.refreshToken);
                            var resData = {
                              userId : finalObj.UserId
                              , userName : finalObj.UserName
                              , userFullName : finalObj.UserFullName
                              , email : finalObj.UserEmail
                              , xAccessToken : finalObj.accessToken
                              , xRefreshToken : finalObj.refreshToken
                              , profilePic : finalObj.ProfilePic
                              , loginType : "google"
                              , isEmailVerified : userProf.isEmailVerified
                            };
                            res.status(200);
                            res.send({data:resData,statusCode:200});
                          }
                        })
                      }else{
                        res.status(408);
                        res.send({"Message": "User not found","statusCode":408});
                      }
                    }
                    })
              }else{
                res.status(408);
                res.send({"Message": "User not found","statusCode":408});
              }
            }
          })
      } else {
          res.status(400);
          res.send({"Message": "Invalid request","statusCode":408});
      }
    }

    this.login = function (req, res) {

        if (req && typeof req !== 'undefined' &&
            req.body && typeof req.body !== 'undefined' &&
            req.body['email'] && typeof req.body['email'] !== 'undefined' &&
            req.body['password'] && typeof req.body['password'] !== 'undefined') {
            UserLoginDB.getLoginByEmail(req.body['email'],function(err,result){
              if(err){
                res.status(402);
                res.send({"Message": "Login Failed","statusCode":402});
              }else{
                if(result){
                  UserProfileDB.getUserByEmail(req.body['email'],function(err,userProf){
                    if(err){
                      res.status(500);
                      res.send({"Message": "unable to fetch user","statusCode":500});
                    }else {
                      if(userProf){
                        if(bcrypt.compareSync(req.body['password'], result.password)){
                          UserValidation.saveLoginObject(req,result.email,function(err,finalObj){
                            if(err){
                              res.status(err.errorCode);
                              res.send({"Message": err.Message});
                            }else{
                              // var sess = req.session;
                              // sess.accessToken = finalObj.accessToken;
                              // sess.refreshToken = finalObj.refreshToken;
                              res.set('x-access-token', finalObj.accessToken);
                              res.set('x-refresh-token', finalObj.refreshToken);
                              var resData = {
                                userId : finalObj.UserId
                                , userName : finalObj.UserName
                                , userFullName : finalObj.UserFullName
                                , email : finalObj.UserEmail
                                , xAccessToken : finalObj.accessToken
                                , xRefreshToken : finalObj.refreshToken
                                , profilePic : finalObj.ProfilePic
                                , loginType : "email"
                                , isEmailVerified : userProf.isEmailVerified
                              };
                              res.status(200);
                              res.send({data:resData,statusCode:200});
                            }
                          })

                        }else{
                          res.status(405);
                          res.send({"Message": "Invalid Userid or password","statusCode": 405});
                        }
                      }else{
                        res.status(408);
                        res.send({"Message": "user not found","statusCode":408});
                      }
                    }
                  })
                }else{
                  res.status(408);
                  res.send({"Message": "User not found","statusCode": 408});
                }
              }
            })
        } else {
            res.status(400);
            res.send({"Message": "Invalid request","statusCode": 400});
        }
    };


    this.logout = function (req, res) {
        var refreshToken = req.body.refreshToken;
        var accessToken = req.body.accessToken;
        req.session.destroy(function () {
            res.status(200);
            res.send({"Message": "successfully logout","statusCode":200});
        });
    };



}

module.exports = SessionController;
