var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var _ = require('underscore');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var guid = require('guid');

function RegistrationController(userAuthDB,UserProfileDB,UserLoginDB,TransactionDB,EmailVerificationDB) {
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
          registerUser(req,userObj,loginObj,function(rep){
              res.status(rep.status);
              res.send({"Message":rep.Message,"Data":rep.data,"statusCode":rep.status});
          });
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
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
            , password: ""
          }
          registerUser(req,userObj,loginObj,function(rep){
              if(rep.status == 200){
                UserValidation.saveLoginObject(req,req.body['email'],function(err,finalObj){
                  if(err){
                    res.status(err.errorCode);
                    res.send({"Message": err.Message,statusCode:err.errorCode});
                  }else{
                    // var sess = req.session;
                    // sess.accessToken = finalObj.accessToken;
                    // sess.refreshToken = finalObj.refreshToken;
                    res.set('x-access-token', finalObj.accessToken);
                    res.set('x-refresh-token', finalObj.refreshToken);
                    res.status(200);
                    var resData = {
                      userId : finalObj.UserId
                      , userName : finalObj.UserName
                      , userFullName : finalObj.UserFullName
                      , email : finalObj.UserEmail
                      , xAccessToken : finalObj.accessToken
                      , xRefreshToken : finalObj.refreshToken
                      , profilePic : finalObj.ProfilePic
                      , loginType : "google"
                      , isEmailVerified : rep.data.isEmailVerified
                    }
                    res.send({data:resData,statusCode:200});
                  }
                })
              }else{
                res.status(rep.status);
                res.send({"Message":rep.Message,"statusCode":rep.status});
              }
          });
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
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
            , password: ""
          }
          registerUser(req,userObj,loginObj,function(rep){
            if(rep.status == 200){
              UserValidation.saveLoginObject(req,req.body['email'],function(err,finalObj){
                if(err){
                  res.status(err.errorCode);
                  res.send({"Message": err.Message});
                }else{
                  // var sess = req.session;
                  // sess.accessToken = finalObj.accessToken;
                  // sess.refreshToken = finalObj.refreshToken;
                  res.set('x-access-token', finalObj.accessToken);
                  res.set('x-refresh-token', finalObj.refreshToken);
                  res.status(200);
                  var resData = {
                    userId : finalObj.UserId
                    , userName : finalObj.UserName
                    , userFullName : finalObj.UserFullName
                    , email : finalObj.UserEmail
                    , xAccessToken : finalObj.accessToken
                    , xRefreshToken : finalObj.refreshToken
                    , profilePic : finalObj.ProfilePic
                    , loginType : "facebook"
                    , isEmailVerified : rep.data.isEmailVerified
                  };
                  res.send({data:resData,statusCode:200});
                }
              })
            }else{
              res.status(rep.status);
              res.send({"Message":rep.Message,"statusCode":rep.status});
            }
          });
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters","statusCode":400});
    }
  }


  this.verifyEmail = function(req,res){
    if(req && typeof req !== 'undefined' &&
      req.params && typeof req.params !== 'undefined' &&
      req.params['verificationId'] && typeof req.params['verificationId'] !== 'undefined'){
        var verificationId = req.params['verificationId'].split("_")[0];
        var userId = req.params['verificationId'].split("_")[1];
        EmailVerificationDB.updateStatus(req.params['verificationId'],userId,function(err,result){
          if(err){
            res.status(500);
            res.send("unable to verify your email");
          }else{
            if(result){
              UserProfileDB.updateEmailVerificationStatus(result.userId,true,function(err,updateRes){
                res.status(200);
                res.send("Email successfully verified");
              })
            }else{
              res.status(500);
              res.send("Invalid request");
            }
          }
        })
    }else{
      res.status(400);
      res.send("Invalid request");
    }
  }

  this.resendVerifyEmail = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
      req.params["userEmail"] && typeof req.params["userEmail"] !== 'undefined'){
        UserProfileDB.getUserByEmail(req.params["userEmail"],function(err,result){
          if(err){
            res.status(500);
            res.send({"Message": "user not found","statusCode":500});
          }else{
            var emailIns = {
                userId : result._id,
                verificationCode : guid.raw() +"_"+ result._id,
                status : false,
                createdDate : new Date()
            }
            EmailVerificationDB.insertEmailVerification(emailIns,function(err,emailVer){
              if(!err){
                var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: config.senderEmail,
                    pass: config.password
                  }
                })
                var verificationUrl = "http://"+req.headers.host+"/verifyEmail?verificationCode="+emailIns.verificationCode;
                var mailOptions = {
                  from: config.senderEmail,
                  to: req.params["userEmail"],
                  subject: 'Email varification from Bityo',
                  html : "<p>Click below URL to verify your email address</p><p><a style='color:rgb(0, 0, 255)' href='"+verificationUrl+"'>"+verificationUrl+"</a></p>"
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
              }else{
                res.status(400);
                res.send({"Message": "unable to send verification mail","statusCode":400});
              }
            })
          }
        })
      }else{
        res.status(400);
        res.send({"Message": "Invalid Parameters","statusCode":400});
      }
  }

  var registerUser = function(req,userObj,loginObj,callback){
    userObj["isEmailVerified"] = false;
    UserProfileDB.getUserByEmail(userObj['email'],function(err,result){
      if(result){
        callback({status:301,Message:"email provided is allready registered"});
      }else{
        UserProfileDB.insertUserProfile(userObj,function(err,userResult){
          if(err){
            callback({status:601,Message:"Unable to save user"});
          }else{
            UserLoginDB.saveUserLoginInfo(loginObj,function(err,loginResult){
              if(err){
                UserProfileDB.deleteUserProfileByEmail(userObj['email'],function(){});
                callback({status:601,Message:"Unable to save user"});
              }else{
                var emailIns = {
                    userId : userResult.ops[0]._id,
                    verificationCode : guid.raw() +"_"+ userResult.ops[0]._id,
                    status : false,
                    createdDate : new Date()
                }
                EmailVerificationDB.insertEmailVerification(emailIns,function(err,emailVer){
                  if(!err){
                    var transporter = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                        user: config.senderEmail,
                        pass: config.password
                      }
                    })
                    var verificationUrl = "http://"+req.headers.host+"/verifyEmail?verificationCode="+emailIns.verificationCode;
                    var mailOptions = {
                      from: config.senderEmail,
                      to: userObj['email'],
                      subject: 'Email varification from Bityo',
                      html : "<p>Click below URL to verify your email address</p><p><a style='color:rgb(0, 0, 255)' href='"+verificationUrl+"'>"+verificationUrl+"</a></p>"
                    };
                    transporter.sendMail(mailOptions, function(error, info){});
                  }
                })
                var data = {
                  "fullName": userObj['fullName']
                  , "userName": userObj['userName']
                  , "email": userObj['email']
                  , "isEmailVerified" : userObj['isEmailVerified']
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
