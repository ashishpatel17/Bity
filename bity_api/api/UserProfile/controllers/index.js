var config = require('../../../config')();
var jwt = require('jsonwebtoken');
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var _ = require('underscore');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path = require('path');

function UserProfileController(userAuthDB,userProfileDB,userLoginDB) {
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

  this.editProfile = function(req, res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' && req.body["email"] && typeof req.body["email"] !== 'undefined'){
      userProfileDB.getUserByEmail(req.body['email'],function(err,result){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to identify user"});
        }else{
          if(result){
            result.userName = req.body["user_name"]==undefined ? result.userName : req.body["user_name"]
            result.fullName = req.body["full_name"]==undefined ? result.fullName : req.body["full_name"]

            if(req.body["address"]!=undefined && req.body["address"]!=null){
              result["address"] = req.body["address"];
            }

            if(req.files!=null && req.files["profile_pic"]!=undefined){
              var fileType = req.files.profile_pic.mimetype;
              if(fileType=="image/png" || fileType=="image/jpeg"){
                var oldFileName = "";
                if(result.profilePicture && result.profilePicture!=null && result.profilePicture!=""){
                  oldFileName = result.profilePicture;
                }
                var filePath = path.resolve(__dirname,"../../../../public/profile_picture");
                var date = new Date();
                var fileName = result.fullName.replace(/ /g,'')+"_"+date.getTime()+"."+fileType.split("/")[1];
                result["profilePicture"] = fileName;
                fs.writeFile(filePath+"/"+fileName,req.files.profile_pic.data,"binary",function(err) {
                  if(err){
                    res.status(400);
                    res.send({"Message": "unable to update user profile"});
                  }else{
                    userProfileDB.updateUserProfile(result,function(err){
                      if(err){
                        res.status(500);
                        res.send({"Message": "Failed to update user"});
                      }else{
                        if(oldFileName!=""){
                          fs.unlink(filePath+"/"+oldFileName,function(err){});
                        }
                        res.status(200);
                        res.send({"Message": "User successfully updated"});
                      }
                    })
                  }
                })
              }else{
                res.status(400);
                res.send({"Message": "Invalid image format only supports png or jpeg"});
              }
            }else{
              userProfileDB.updateUserProfile(result,function(err){
                if(err){
                  res.status(500);
                  res.send({"Message": "Failed to update user"});
                }else{
                  res.status(200);
                  res.send({"Message": "User successfully updated"});
                }
              })
            }
          }else{
            res.status(500);
            res.send({"Message": "User not found"});
          }
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
    }
  }

  this.changePassword = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
     req.body["old_password"] && typeof req.body["old_password"] !== 'undefined' &&
     req.body["new_password"] && typeof req.body["new_password"] !== 'undefined'){
       userProfileDB.getUserByEmail(req.body['email'],function(err,userRes){
         if(err){
           res.status(500);
           res.send({"Message": "Unable to find user"});
         }else{
           if(userRes && userRes.email){
              userLoginDB.getLoginByEmail(req.body['email'],function(err,loginRes){
                if(err){
                  res.status(500);
                  res.send({"Message": "Unable to find user"});
                }else{
                  if(loginRes && loginRes.email){
                    if(bcrypt.compareSync(req.body['old_password'], loginRes.password)){
                      var newPassword = bcrypt.hashSync(req.body['new_password'],10);
                      userLoginDB.changeUserpassword(req.body['email'],newPassword,function(err,upRes){
                        if(err){
                          res.status(500);
                          res.send({"Message": "Failed to update password"});
                        }else{
                          res.status(200);
                          res.send({"Message": "Password sucessfully changed"});
                        }
                      })
                    }else{
                      res.status(403);
                      res.send({"Message": "Invalid existing password"});
                    }
                  }else{
                    res.status(500);
                    res.send({"Message": "Unable to find user"});
                  }
                }
              })
           }else{
             res.status(500);
             res.send({"Message": "User not exist"});
           }
         }
       })
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

module.exports = UserProfileController;
