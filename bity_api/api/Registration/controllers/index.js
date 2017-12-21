var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var jwt = require('jsonwebtoken');
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var _ = require('underscore');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path = require('path');
var async = require('async');

function RegistrationController(userAuthDB,userProfileDB,userLoginDB,TransactionDB) {
  /*
    Registration Controller function
  */
  this.registration = function(req, res){
    if(req && typeof req !== 'undefined' &&
        req.body && typeof req.body !== 'undefined' &&
        req.body['full_name'] && typeof req.body['full_name'] !== 'undefined' &&
        req.body['user_name'] && typeof req.body['user_name'] !== 'undefined' &&
        req.body['email'] && typeof req.body['email'] !== 'undefined' &&
        req.body['password'] && typeof req.body['password'] !== 'undefined'){
          var userObj = {
            fullName: req.body['full_name']
            , userName: req.body['user_name']
            , email: req.body['email']
            , createDate: new Date()
          }
          var loginObj = {
            email: req.body['email']
            , userName: req.body['user_name']
            , password: bcrypt.hashSync(req.body['password'],10)
          }
          registerUser(userObj,loginObj,function(rep){
              res.status(rep.status);
              res.send({"Message":rep.Message,"Data":rep.data});
          });
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
    }
  }

  /*
    Controller function to register user with googleId
  */
  this.googleRegistration = function(req, res){
    if(req && typeof req !== 'undefined' &&
        req.body && typeof req.body !== 'undefined' &&
        req.body['full_name'] && typeof req.body['full_name'] !== 'undefined' &&
        req.body['user_name'] && typeof req.body['user_name'] !== 'undefined' &&
        req.body['email'] && typeof req.body['email'] !== 'undefined' &&
        req.body['password'] && typeof req.body['password'] !== 'undefined' &&
        req.body['google_id'] && typeof req.body['google_id'] !== 'undefined'){
          var userObj = {
            fullName: req.body['full_name']
            , userName: req.body['user_name']
            , email: req.body['email']
            , googleId: req.body['google_id']
            , createDate: new Date()
          }
          var loginObj = {
            email: req.body['email']
            , userName: req.body['user_name']
            , password: bcrypt.hashSync(req.body['password'],10)
          }
          registerUser(userObj,loginObj,function(rep){
              res.status(rep.status);
              res.send({"Message":rep.Message,"Data":rep.data});
          });
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
    }
  }

  /*
    Controller function to register user with facebookId
  */
  this.facebookRegistration = function(req, res){
    if(req && typeof req !== 'undefined' &&
        req.body && typeof req.body !== 'undefined' &&
        req.body['full_name'] && typeof req.body['full_name'] !== 'undefined' &&
        req.body['user_name'] && typeof req.body['user_name'] !== 'undefined' &&
        req.body['email'] && typeof req.body['email'] !== 'undefined' &&
        req.body['password'] && typeof req.body['password'] !== 'undefined' &&
        req.body['facebook_id'] && typeof req.body['facebook_id'] !== 'undefined'){
          var userObj = {
            fullName: req.body['full_name']
            , userName: req.body['user_name']
            , email: req.body['email']
            , facebookId: req.body['facebook_id']
            , createDate: new Date()
          }
          var loginObj = {
            email: req.body['email']
            , userName: req.body['user_name']
            , password: bcrypt.hashSync(req.body['password'],10)
          }
          registerUser(req,function(rep){
              res.status(rep.status);
              res.send({"Message":rep.Message,"Data":rep.data});
          });
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
    }
  }

  var registerUser = function(userObj,loginObj,callback){
    userProfileDB.getUserByEmail(userObj['email'],function(err,result){
      if(result){
        callback({status:500,Message:"email provided is allready registered"});
      }else{
        userProfileDB.insertUserProfile(userObj,function(err,userResult){
          if(err){
            callback({status:500,Message:"Unable to save user"});
          }else{
            userLoginDB.saveUserLoginInfo(loginObj,function(err,loginResult){
              if(err){
                userProfileDB.deleteUserProfileByEmail(userObj['email'],function(){});
                callback({status:500,Message:"Unable to save user"});
              }else{
                var data = {
                  "fullName": userObj['fullName']
                  , "userName": userObj['userName']
                  , "email": userObj['email']
                }
                callback({status:200,Message:"User successfully created",data:data});
              }
            })
          }
        })
      }
    })
  }

}

module.exports = RegistrationController;
