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

function UserProfileController(userAuthDB,userProfileDB,userLoginDB,TransactionDB) {
  /*
    Controller function to get user profile details
  */
  this.getUserProfile = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' && req.params['userId'] && typeof req.params['userId'] !== 'undefined'){
      getUserProfleDetails(req,false,function(err,profResult){
        if(err){
          res.status(err.errorCode);
          res.send({"Message": err.Message});
        }else{
          res.status(200);
          res.send(profResult);
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
    }
  }

  /*
    Controller function to get user own profile details
  */
  this.getMyProfile = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' && req.params['userId'] && typeof req.params['userId'] !== 'undefined'){
      getUserProfleDetails(req,true,function(err,profResult){
        if(err){
          res.status(err.errorCode);
          res.send({"Message": err.Message});
        }else{
          res.status(200);
          res.send(profResult);
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
    }
  }

  /*
    Controller function to edit user profile
  */
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
                var filePath = path.resolve(__dirname,"../../../../"+config.profilePicturePath);
                var date = new Date();
                var fileName = result.fullName.replace(/ /g,'')+"_"+date.getTime()+"."+fileType.split("/")[1];
                result["profilePicture"] = fileName;
                fs.writeFile(filePath+fileName,req.files.profile_pic.data,"binary",function(err) {
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

  /*
    Controller function to change password
  */
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

  /*
    controller function to add follower of user
  */
  this.followSeller = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' && req.params["sellerId"] && typeof req.params["sellerId"] !== 'undefined'){
      UserValidation.getLoginInfo(req,function(err,loginRes){
        if(err){
          callback({errorCode:500,Message:"unauthorized request"},null);
        }else{
          userProfileDB.getUserById(req.params["sellerId"],function(err,result){
            if(err){
              res.status(500);
              res.send({"Message": "Unable to find user"});
            }else{
              if(result){
                if(result.following.indexOf(loginRes.UserId)==-1){
                  result.following.push(loginRes.UserId);
                  userProfileDB.updateUserProfile(result,function(err){
                    if(err){
                      res.status(500);
                      res.send({"Message": "Fail to follow this seller"});
                    }else{
                      res.status(200);
                      res.send({"Message": "successfully followed"});
                    }
                  })
                }else{
                  res.status(500);
                  res.send({"Message": "You are allready following this User"});
                }
              }else{
                res.status(400);
                res.send({"Message": "User not found"});
              }
            }
          })
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
    }
  }


  var getUserProfleDetails = function(req,IsUserSpecific,callback){
    async.waterfall([
      function(callback){
        UserValidation.getLoginInfo(req,function(err,loginRes){
          if(err){
            callback({errorCode:500,Message:"unauthorized request"},null);
          }else{
            if(!IsUserSpecific && loginRes){
              callback(null,loginRes);
            }else if(IsUserSpecific && loginRes && loginRes.UserId == req.params['userId']){
              callback(null,loginRes);
            }else{
              callback({errorCode:500,Message:"unauthorized request"},null);
            }
          }
        })
      },
      function(loginRes,callback){
        userProfileDB.getUserById(req.params['userId'],function(err,usrResult){
          if(err){
            callback({errorCode:500,Message:"Unable to find user profile details"},null);
          }else{
            if(usrResult){
              callback(null,loginRes,usrResult);
            }else{
              callback({errorCode:500,Message:"User profile details not found"},null);
            }
          }
        })
      },
      function(loginRes,usrResult,callback){
        userProfileDB.getUserFollowers(req.params['userId'],function(err,followResult){
          if(err){
            callback({errorCode:500,Message:"Unable to find user profile details"},null);
          }else{
            callback(null,loginRes,usrResult,followResult);
          }
        })
      },
      function(loginRes,usrResult,followResult,callback){
        TransactionDB.getUserAllTransaction(loginRes.userId,function(err,tranResult){
          if(err){
            callback({errorCode:500,Message:"Unable to find user transaction details"},null);
          }else{
            var profilePicPath = req.headers.host+"/"+config.profilePicturePublicPath;
            var responseObj = {
              fullName: usrResult.fullName
              , userName: usrResult.userName
              , email: usrResult.email
              , googleId: usrResult.googleId
              , facebookId: usrResult.facebookId
              , profilePicture: (usrResult.profilePicture == undefined || usrResult.profilePicture == null)?profilePicPath+config.profileDefaultImage:profilePicPath+usrResult.profilePicture
              , address: usrResult.address
              , phoneNumber: usrResult.phoneNumber
              , activeStatus: usrResult.activeStatus
              , userType: usrResult.userType
              , bitcoinAddress: usrResult.bitcoinAddress
              , sellerRating: usrResult.sellerRating
              , following: usrResult.following.length
              , follower: followResult.length
              , transactions: tranResult.length
            }
            callback(null,responseObj);
          }
        })
      }
    ],function(err, result){
      if(err){
        callback(err,null);
      }else{
        callback(null,result);
      }
    })
  }
}

module.exports = UserProfileController;
