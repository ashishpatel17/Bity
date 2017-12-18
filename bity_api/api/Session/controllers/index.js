var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var jwt = require('jsonwebtoken');
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var _ = require('underscore');
var bcrypt = require('bcrypt');

function SessionController(userAuthDB, userLoginDB, userProfileDB) {

    this.validateSession = function (req, res, next) {
        var sess = req.session;
        if (typeof sess !== 'undefined' && typeof sess.accessToken !== 'undefined') {

            jwt.verify(sess.accessToken, config.sessionSecretKey, function (err) {
                if (err) {
                    regeneratSession(req, function (err, newAccessToken) {
                        if (err) {
                            res.status(403);
                            res.send({"Message": err});
                        } else {
                            res.set('x-access-token', newAccessToken);
                            next();
                        }
                    });
                } else {
                    if (sess.accessToken === req.headers['x-access-token']) {
                        next();
                    } else {
                        regeneratSession(req, function (err, newAccessToken) {
                            if (err) {
                                res.status(403);
                                res.send({"Message": err});
                            } else {
                                res.set('x-access-token', newAccessToken);
                                next();
                            }
                        });
                    }
                }
            });
        }
        else {
            res.status(403);
            res.send({"Message": "Invalid request"});
        }
    };

    var regeneratSession = function (req, callback) {
        var sess = req.session;
        if (req.headers['x-refresh-token']) {
          jwt.verify(sess.refreshToken, config.sessionSecretKey, function(err) {
              if (err) {
                  callback('Invalid request');
              } else {
                  if (sess.refreshToken === req.headers['x-refresh-token']) {
                      userAuthDB.getInfoByAccessToken(req.headers['x-access-token'], function(loginInfo) {
                          if (loginInfo && loginInfo.UserEmail) {

                              var newAccessToken = jwt.sign({user: loginInfo.UserEmail}, config.sessionSecretKey, {
                                  expiresIn: config.accessTokenTimeoutInMinutes * 60
                              });

                              sess.accessToken = newAccessToken;

                              var today = new Date();

                              var expirationDate = new Date();
                              expirationDate.setTime(expirationDate.getTime() + (config.accessTokenTimeoutInMinutes * 60 * 1000));

                              var authObj = {
                                accessToken : newAccessToken
                               , refreshToken : sess.refreshToken
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
                  } else {
                      callback('Invalid Request');
                  }
              }
          })
        } else {
            callback('Invalid Request');
        }
    };


    this.login = function (req, res) {

        if (req && typeof req !== 'undefined' &&
            req.body && typeof req.body !== 'undefined' &&
            req.body['email'] && typeof req.body['email'] !== 'undefined' &&
            req.body['password'] && typeof req.body['password'] !== 'undefined') {
            userLoginDB.getLoginByEmail(req.body['email'],function(err,result){
              if(err){
                res.status(403);
                res.send({"Message": "Login Failed"});
              }else{
                if(result){
                  if(bcrypt.compareSync(req.body['password'], result.password)){
                    var accessToken = jwt.sign({user: result.email}, config.sessionSecretKey, {
                        expiresIn: config.accessTokenTimeoutInMinutes * 60
                    });

                    var refreshToken = jwt.sign({user: result.email}, config.sessionSecretKey, {
                        expiresIn: config.refreshTokenTimeoutInMinutes * 60
                    });

                    userProfileDB.getUserByEmail(result.email,function(err,userResult){
                      if(userResult){
                        var expirationDate = new Date();
                        expirationDate.setTime(expirationDate.getTime() + (config.accessTokenTimeoutInMinutes * 60 * 1000));
                        var authObj = {
                          accessToken : accessToken
                         , refreshToken : refreshToken
                         , LoginDate : new Date()
                         , UserEmail : userResult.email
                         , ExpirationDate : expirationDate
                        }
                        userAuthDB.saveUserAuthenticationObj(authObj,function(err,result){
                          if(err){
                            res.status(500);
                            res.send({"Message": "Unable to login"});
                          }else{
                            var sess = req.session;
                            sess.accessToken = accessToken;
                            sess.refreshToken = refreshToken;
                            res.set('x-access-token', accessToken);
                            res.set('x-refresh-token', refreshToken);
                            res.status(200);
                            res.send({
                              userId : userResult._id
                              , userName : userResult.userName
                              , userFullName : userResult.fullName
                              , email : userResult.email
                            });
                          }
                        })
                      }else{
                        res.status(500);
                        res.send({"Message": "User not found"});
                      }
                    })
                  }else{
                    res.status(500);
                    res.send({"Message": "Invalid Userid or password"});
                  }
                }else{
                  res.status(500);
                  res.send({"Message": "User not found"});
                }
              }
            })
        } else {
            res.status(400);
            res.send({"Message": "bad request"});
        }
    };


    // this.refreshToken = function (req, res) {
    //     if (req && typeof req !== 'undefined' &&
    //         req.headers && typeof req.headers !== 'undefined' &&
    //         req.headers['x-refresh-token'] && typeof req.headers['x-refresh-token'] !== 'undefined') {
    //
    //         validateSession(req, function (err, newAccessToken) {
    //             if (err) {
    //                 res.status(403);
    //                 res.send({ErrorMessage: err});
    //             } else {
    //                 res.set('x-access-token', newAccessToken);
    //                 res.status(200);
    //                 res.send({Message: 'success'});
    //             }
    //         });
    //
    //     } else {
    //         res.status(400);
    //         res.send({"ErrorMessage": "bad request"});
    //     }
    // };
    //
    // this.logout = function (req, res) {
    //     req.session.destroy(function () {
    //         res.status(200);
    //         res.send({"Message": "success"});
    //     });
    // };



}

module.exports = SessionController;