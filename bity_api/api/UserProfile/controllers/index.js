var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var _ = require('underscore');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path = require('path');
var async = require('async');
var guid = require('guid');
var nodemailer = require('nodemailer');

function UserProfileController(userAuthDB,UserProfileDB,UserLoginDB,TransactionDB,ForgotPasswordDB,EmailVerificationDB) {
  /*
    Controller function to get user profile details
  */
  this.getUserProfile = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' && req.params['userId'] && typeof req.params['userId'] !== 'undefined'){
      getUserProfleDetails(req,false,function(err,profResult){
        if(err){
          res.status(err.errorCode);
          res.send({"Message": err.Message,statusCode:err.errorCode});
        }else{
          res.status(200);
          res.send({data:profResult,statusCode:200});
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
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
          res.send({"Message": err.Message,statusCode:err.errorCode});
        }else{
          res.status(200);
          res.send({data:profResult,statusCode:200});
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

  /*
    Controller function to edit user profile
  */
  this.editProfile = function(req, res){
    if(req && typeof req !== 'undefined' &&
      req.body && typeof req.body !== 'undefined' &&
      req.params["userId"] && typeof req.params["userId"] !== 'undefined'){
      UserProfileDB.getUserById(req.params["userId"],function(err,result){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch user data","statusCode":500});
        }else{
          if(result){
            result.userName = req.body["userName"]==undefined ? result.userName : req.body["userName"]
            result.fullName = req.body["fullName"]==undefined ? result.fullName : req.body["fullName"]

            if(req.body["address"]!=undefined && req.body["address"]!=null){
              result["address"] = req.body["address"];
            }

            if(req.body["lat"]!=undefined && req.body["lat"]!=null && req.body["long"]!=undefined && req.body["long"]!=null){
              result["location"] = [req.body["lat"],req.body["long"]];
            }

            if(req.body["phoneNumber"]!=undefined && req.body["phoneNumber"]!=null){
              result["phoneNumber"] = req.body["phoneNumber"];
            }

            if(req.files!=null && req.files["profilePic"]!=undefined){
              var fileType = req.files.profilePic.mimetype;
              if(fileType=="image/png" || fileType=="image/jpeg"){
                var oldFileName = "";
                if(result.profilePicture && result.profilePicture!=null && result.profilePicture!=""){
                  oldFileName = result.profilePicture;
                }
                var filePath = path.resolve(__dirname,"../../../../"+config.profilePicturePath);
                var date = new Date();
                var fileName = result.fullName.replace(/ /g,'')+"_"+date.getTime()+"."+fileType.split("/")[1];
                result["profilePicture"] = fileName;
                fs.writeFile(filePath+"/"+fileName,req.files.profilePic.data,"binary",function(err) {
                  if(err){
                    res.status(601);
                    res.send({"Message": "unable to update user profile","statusCode":601});
                  }else{
                    UserProfileDB.updateUserProfile(result,function(err){
                      if(err){
                        res.status(601);
                        res.send({"Message": "Failed to update user profile","statusCode":601});
                      }else{
                        if(oldFileName!=""){
                          fs.unlink(filePath+"/"+oldFileName,function(err){});
                        }
                        var profilePicPath = "http://"+req.headers.host+"/"+config.profilePicturePublicPath;
                        var resData = {
                          userId : result._id
                          , userName : result.userName
                          , userFullName : result.fullName
                          , email : result.email
                          , profilePicture: (result.profilePicture == undefined || result.profilePicture == null)?profilePicPath+config.profileDefaultImage:profilePicPath+result.profilePicture
                          , isEmailVerified : result.isEmailVerified
                        }
                        res.status(200);
                        res.send({"Message": "User successfully updated","statusCode":200,"data":resData});
                      }
                    })
                  }
                })
              }else{
                res.status(601);
                res.send({"Message": "Invalid image format only supports png or jpeg","statusCode":601});
              }
            }else{
              UserProfileDB.updateUserProfile(result,function(err){
                if(err){
                  res.status(601);
                  res.send({"Message": "Failed to update user","statusCode":601});
                }else{
                  var profilePicPath = "http://"+req.headers.host+"/"+config.profilePicturePublicPath;
                  var resData = {
                    userId : result._id
                    , userName : result.userName
                    , userFullName : result.fullName
                    , email : result.email
                    , profilePicture: (result.profilePicture == undefined || result.profilePicture == null)?profilePicPath+config.profileDefaultImage:profilePicPath+result.profilePicture
                    , isEmailVerified : result.isEmailVerified
                  }
                  res.status(200);
                  res.send({"Message": "User successfully updated","statusCode":200,"data":resData});
                }
              })
            }
          }else{
            res.status(408);
            res.send({"Message": "User not found","statusCode":408});
          }
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

  /*
    Controller function to change password
  */
  this.changePassword = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
     req.body["email"] && typeof req.body["email"] !== 'undefined' &&
     req.body["oldPassword"] && typeof req.body["oldPassword"] !== 'undefined' &&
     req.body["newPassword"] && typeof req.body["newPassword"] !== 'undefined'){
       UserProfileDB.getUserById(req.params['userId'],function(err,userRes){
         if(err){
            res.status(500);
            res.send({"Message": "unable to fetch data","statusCode":500});
         }else{
           if(userRes && userRes.email){
              UserLoginDB.getLoginByEmail(userRes.email,function(err,loginRes){
                if(err){
                   res.status(501);
                   res.send({"Message": "unable to find login details","statusCode":501});
                }else{
                  if(loginRes && loginRes.email){
                    if(bcrypt.compareSync(req.body['oldPassword'], loginRes.password)){
                      var newPassword = bcrypt.hashSync(req.body['newPassword'],10);
                      UserLoginDB.changeUserpassword(req.body['email'],newPassword,function(err,upRes){
                        if(err){
                          res.status(601);
                          res.send({"Message": "Failed to update password","statusCode":601});
                        }else{
                          res.status(200);
                          res.send({"Message": "Password sucessfully changed","statusCode":200});
                        }
                      })
                    }else{
                      res.status(405);
                      res.send({"Message": "Invalid existing password","statusCode":405});
                    }
                  }else{
                    res.status(502);
                    res.send({"Message": "Unable to find user login data","statusCode":502});
                  }
                }
              })
           }else{
             res.status(408);
             res.send({"Message": "User not found","statusCode":408});
           }
         }
       })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

  this.forgotPassword = function(req,res){
    if(req && typeof req !== 'undefined' &&
     req.params && typeof req.params !== 'undefined' &&
     req.params["userEmail"] && typeof req.params["userEmail"] !== 'undefined'){
       UserProfileDB.getUserByEmail(req.params['userEmail'],function(err,userResult){
         if(err){
           res.status(500);
           res.send({"Message": "data not found","statusCode":500});
         }else{
           if(userResult){
             var code = guid.raw() +"_"+ userResult._id;
             var insCode = {
               userId: userResult._id
               , requestCode : code
               , status : false
               , createdDate : new Date()
             }
             ForgotPasswordDB.insertForgotPassword(insCode,function(err,result){
               if(err){
                 res.status(601);
                 res.send({"Message": "unable to request to change password","statusCode":601});
               }else{

                     var transporter = nodemailer.createTransport({
                       service: 'gmail',
                       auth: {
                         user: config.senderEmail,
                         pass: config.password
                       }
                     })
                     var verificationUrl = "http://"+req.headers.host+"/resetPasswordRequest?verificationCode="+code;
                     var mailOptions = {
                       from: config.senderEmail,
                       to: userResult['email'],
                       subject: 'Change password request from Bityo',
                       html : "<p>Click below URL to change your password</p><p><a style='color:rgb(0, 0, 255)' href='"+verificationUrl+"'>"+verificationUrl+"</a></p>"
                     };
                     transporter.sendMail(mailOptions, function(error, info){
                       if(err){
                           res.status(601);
                           res.send({"Message": "unable to send verification mail","statusCode":601});
                       }else{
                         res.status(200);
                         res.send({"Message": "email successfully send","statusCode":200});
                       }
                     });

               }
             })
           }else{
             res.status(500);
             res.send({"Message": "email not found","statusCode":500});
           }
         }
       })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

  this.resetPasswordRequest = function(req,res){
    var resetPasswordUrl = "http://"+req.headers.host+"/api/resetPassword";
    res.render('resetPasswordRequest', {apuUrl:resetPasswordUrl});
  }

  this.resetPassword = function(req,res){
    if(req && typeof req !== 'undefined' &&
       req.body && typeof req.body !== 'undefined' &&
       req.body["requestId"] && typeof req.body["requestId"] !== 'undefined' &&
       req.body["newPassword"] && typeof req.body["newPassword"] !== 'undefined'){
         var reqId = req.body["requestId"];
         var userId = req.body["requestId"].split("_")[1];
         UserProfileDB.getUserById(userId,function(err,usrResult){
           if(err){
             res.status(400);
             res.send({Message:"Unable to change password",statusCode:400});
           }else{
             if(usrResult){
               ForgotPasswordDB.updateStatus(reqId,userId,function(err,result){
                 if(err){
                   res.status(400);
                   res.send({Message:"Unable to change password",statusCode:400});
                 }else{
                   if(result){
                     var newPassword = bcrypt.hashSync(req.body['newPassword'],10);
                     UserLoginDB.changeUserpassword(usrResult.email,newPassword,function(err,upRes){
                       if(err){
                         res.status(500);
                         res.send({"Message": "Failed to reset password",statusCode:500});
                       }else{
                         res.status(200);
                         res.send({"Message": "Password sucessfully changed",statusCode:200});
                       }
                     })
                   }else{
                     res.status(400);
                     res.send({Message:"Invalid request to change password",statusCode:400});
                   }
                 }
               })
             }else{
               res.status(400);
               res.send({Message:"Invalid request to change password",statusCode:400});
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
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
      req.params["userId"] && typeof req.params["userId"] !== 'undefined' &&
      req.params["sellerId"] && typeof req.params["sellerId"] !== 'undefined'){
      UserProfileDB.getUserById(req.params['userId'],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to find user","statusCode":500});
        }else{
          UserProfileDB.getUserById(req.params["sellerId"],function(err,result){
            if(err){
              res.status(501);
              res.send({"Message": "Unable to find seller","statusCode":501});
            }else{
              if(result){
                if(loginRes.following.indexOf(result._id)==-1){
                  loginRes.following.push(result._id);
                  UserProfileDB.updateUserProfile(loginRes,function(err){
                    if(err){
                      res.status(601);
                      res.send({"Message": "unable to follow this seller","statusCode":601});
                    }else{
                      res.status(200);
                      res.send({"Message": "successfully followed","statusCode":200});
                    }
                  })
                }else{
                  res.status(602);
                  res.send({"Message": "You are allready following this User","statusCode":602});
                }
              }else{
                res.status(408);
                res.send({"Message": "User not found","statusCode":408});
              }
            }
          })
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters","statusCode":400});
    }
  }

  this.unFollowSeller = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
      req.params["userId"] && typeof req.params["userId"] !== 'undefined' &&
      req.params["sellerId"] && typeof req.params["sellerId"] !== 'undefined'){
      UserProfileDB.getUserById(req.params['userId'],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to find user","statusCode":500});
        }else{
          UserProfileDB.getUserById(req.params["sellerId"],function(err,result){
            if(err){
              res.status(501);
              res.send({"Message": "Unable to find seller","statusCode":501});
            }else{
              if(result){
                loginRes.following.splice(loginRes.following.indexOf(req.params["sellerId"]),1);
                UserProfileDB.updateUserProfile(loginRes,function(err){
                  if(err){
                    res.status(601);
                    res.send({"Message": "unable to unfollow this seller","statusCode":601});
                  }else{
                    res.status(200);
                    res.send({"Message": "successfully unfollowed","statusCode":200});
                  }
                })
              }else{
                res.status(408);
                res.send({"Message": "User not found","statusCode":408});
              }
            }
          })
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters","statusCode":400});
    }
  }

  var getUserProfleDetails = function(req,IsUserSpecific,callback){
    async.waterfall([
      function(callback){
        UserProfileDB.getUserById(req.params['userId'],function(err,usrResult){
          if(err){
            callback({errorCode:500,Message:"Unable to fetch user profile data"},null);
          }else{
            if(usrResult){
              callback(null,usrResult);
            }else{
              callback({errorCode:408,Message:"User profile not found"},null);
            }
          }
        })
      },
      function(usrResult,callback){
        UserProfileDB.getUserFollowers(req.params['userId'],function(err,followResult){
          if(err){
            callback({errorCode:501,Message:"Unable to fetch user followers"},null);
          }else{
            callback(null,usrResult,followResult);
          }
        })
      },
      function(usrResult,followResult,callback){
        TransactionDB.getUserAllTransaction(usrResult._id,function(err,tranResult){
          if(err){
            callback({errorCode:502,Message:"Unable to fetch user transaction"},null);
          }else{
            var profilePicPath = "http://"+req.headers.host+"/"+config.profilePicturePublicPath;
            var responseObj = {
              fullName: usrResult.fullName?usrResult.fullName:""
              , userName: usrResult.userName?usrResult.userName:""
              , email: usrResult.email?usrResult.email:""
              , googleId: usrResult.googleId?usrResult.googleId:""
              , facebookId: usrResult.facebookId?usrResult.facebookId:""
              , profilePicture: (usrResult.profilePicture == undefined || usrResult.profilePicture == null)?profilePicPath+config.profileDefaultImage:profilePicPath+usrResult.profilePicture
              , address: usrResult.address?usrResult.address:""
              , phoneNumber: usrResult.phoneNumber?usrResult.phoneNumber:""
              , activeStatus: usrResult.activeStatus?usrResult.activeStatus:""
              , userType: usrResult.userType?usrResult.userType:""
              , bitcoinAddress: usrResult.bitcoinAddress?usrResult.bitcoinAddress:""
              , sellerRating: (usrResult.sellerRating!=undefined && usrResult.sellerRating!=null)?usrResult.sellerRating.toFixed(1):""
              , following: usrResult.following?usrResult.following.length:0
              , follower: followResult?followResult.length:0
              , transactions: tranResult?tranResult.length:0
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
