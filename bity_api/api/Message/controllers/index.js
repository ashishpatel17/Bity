var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var genericUtils = new (require('../../../libs/genericFunctions.js'))();
var _ = require('underscore');
var async = require('async');

function MessageController(UserProfileDB,ThreadListDB,ThreadMessageDB) {

  this.getThreads = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
     req.params["userId"] && typeof req.params["userId"] !== 'undefined'){
        UserProfileDB.getUserById(req.params["userId"],function(err,loginRes){
          if(err){
            res.status(500);
            res.send({"Message": "unauthorized to fetch data","statusCode":500});
          }else{
              ThreadListDB.getUserThreads(loginRes._id,function(err,result){
                if(err){
                  res.status(501);
                  res.send({"Message": "unable to get message threads","statusCode":501});
                }else{
                  var totalData = result.length;
                  result = _.sortBy(result,function(rec){ return rec.lastMessage.dateTime }).reverse();
                  if(req.params['pageSize'] && req.params['pageSize']!=null && req.params['pageSize']!="" && req.params['pageNumber'] && req.params['pageNumber']!=null && req.params['pageNumber']!=""){
                    var pageNumber = req.params['pageNumber'];
                    var pageSize = req.params['pageSize'];
                    result = result.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,result.length));
                  }

                  var finalRes = [];
                  var profilePicPath = "http://"+req.headers.host+"/"+config.profilePicturePublicPath;
                  var defaultProfileImg = profilePicPath+config.profileDefaultImage
                  result.forEach(function(rec){
                    var sender = rec.lastMessage.senderId;
                    var senderProfile = _.find(rec.participants,function(rec){if(sender.toString().toLowerCase() == rec.userId.toString().toLowerCase()){ return rec }});

                    finalRes.push({
                      threadId : rec._id,
                      threadName : senderProfile.userName,
                      threadImage : senderProfile.userProfilePic?profilePicPath+senderProfile.userProfilePic:defaultProfileImg,
                      lastMessage : rec.lastMessage.message,
                      lastMessageTime : rec.lastMessage.dateTime
                    })
                  })
                  var pageNumber = parseInt(req.params['pageNumber']);
                  var pageSize = parseInt(req.params['pageSize']);
                  var totalPage = Math.ceil(totalData/pageSize);

                  res.status(200);
                  res.send({totalData:totalData,totalPage:totalPage,curPage:pageNumber,data:finalRes,statusCode:200});
                }
              })
          }
        })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

  this.getMessage = function(req,res){
    if(req && typeof req !== 'undefined' && req.query && typeof req.query !== 'undefined' &&
       req.query["pageSize"] && req.query["pageSize"] !== 'undefined' &&
       req.query["pageNumber"] && req.query["pageNumber"] !== 'undefined'){
       if(req.query["threadId"] && req.query["senderId"] !== 'undefined'){
         ThreadListDB.getThreadById(req.query["threadId"],function(err,tResult){
           if(err){
             res.status(501);
             res.send({"Message": "unable to get thread",statusCode:501});
           }else{
             if(tResult && tResult!=undefined && tResult!=null){
               fetchMessage(tResult,req,res);
             }else{
               res.status(502);
               res.send({"Message": "thread not found",statusCode:502});
             }
           }
         })
       }else if(req.query["senderId"] && req.query["senderId"] !== 'undefined' && req.query["reciverId"] && req.query["reciverId"] !== 'undefined'){
         var sender = req.query["senderId"];
         var reciver = req.query["reciverId"];
         ThreadListDB.getThreadByParticipant([reciver,sender],function(err,tResult){
           if(err){
             res.status(500);
             res.send({"Message": "unable to get participants",statusCode:500});
           }else{
             if(tResult && tResult!=undefined && tResult!=null){
              fetchMessage(tResult,req,res);
            }else{
              res.status(408);
              res.send({"Message": "thread for given participants not found",statusCode:408});
            }
           }
          })
       }
     }else{
       res.status(400);
       res.send({"Message": "invalid request",statusCode:400});
     }
  }

  function fetchMessage(thread,req,res){
    var threadId = thread._id;
    UserProfileDB.getMultipleUser([thread.participants[0].userId,thread.participants[1].userId],function(err,userResult){
      if(err){
        res.status(500);
        res.send({"Message": "unable to get participants",statusCode:500});
      }else{
        if(userResult && userResult.length==2){
          ThreadMessageDB.getThreadMessage(threadId,function(err,result){
            if(err){
              res.status(500);
              res.send({"Message": "unable to get messages",statusCode:500});
            }else{
              var totalData = result.length
              result = _.sortBy(result,function(rec){ return rec.dateTime }).reverse();
              if(req.query['pageSize'] && req.query['pageSize']!=null && req.query['pageSize']!="" && req.query['pageNumber'] && req.query['pageNumber']!=null && req.query['pageNumber']!=""){
                var pageNumber = req.query['pageNumber'];
                var pageSize = req.query['pageSize'];
                result = result.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,result.length));
              }
              var finalRes = [];
              result.forEach(function(msg){
                var profilePicPath = "http://"+req.headers.host+"/"+config.profilePicturePublicPath;
                var defaultProfileImg = profilePicPath+config.profileDefaultImage
                var sender = userResult.filter(function(rec){ if (rec._id.toString().toLowerCase() == msg.sender.userId.toString().toLowerCase()) return rec })[0];

                finalRes.push({
                    senderName : msg.sender.userName
                  , senderEmail : msg.sender.userEmail
                  , senderProfilePic : sender.profilePicture?profilePicPath+sender.profilePicture:defaultProfileImg
                  , message : msg.message
                  , dateTime : msg.dateTime
                 })
              })
              var pageNumber = parseInt(req.query['pageNumber']);
              var pageSize = parseInt(req.query['pageSize']);
              var totalPage = Math.ceil(totalData/pageSize);
              res.status(200);
              res.send({totalData:totalData,totalPage:totalPage,curPage:pageNumber,data:finalRes,statusCode:200});
            }
           })
        }else{
          res.status(500);
          res.send({"Message": "participants not found",statusCode:500});
        }
      }
    })
  }

  this.sendMessage = function(req,res){
    if(req && typeof req !== 'undefined' &&
     req.body && typeof req.body !== 'undefined' &&
     req.body["senderId"] && typeof req.body["senderId"] !== 'undefined' &&
     req.body["reciverId"] && typeof req.body["reciverId"] !== 'undefined' &&
     req.body["messageBody"] && typeof req.body["messageBody"] !== 'undefined'){
       var sender = req.body["senderId"];
       var reciver = req.body["reciverId"];
       async.waterfall([
         function(callback){
          UserProfileDB.getUserById(req.body["senderId"],function(err,loginRes){
             if(err){
               callback({errorCode:500,Message:"unable to fetch data"},null);
             }else{
               if(loginRes!=null && loginRes!=undefined){
                 callback(null,loginRes);
               }else{
                 callback({errorCode:408,Message:"user not found"},null);
               }
             }
            })
          },
          function(loginRes,callback){
            if(req.body["threadId"] != undefined && req.body["threadId"]!=""){
              ThreadListDB.getThreadById(req.body["threadId"],function(err,threadRes){
                if(err){
                    callback({errorCode:501,Message:"unable to find thread"},null);
                }else{
                    callback(null,threadRes)
                }
              })
            }else{
              callback(null,undefined);
            }
          },
          function(threadRes,callback){
            UserProfileDB.getMultipleUser([reciver,sender],function(err,userResult){
              if(err){
                callback({errorCode:503,Message:"unable to get user data"},null);
              }else{
                callback(null,threadRes,userResult)
              }
            })
          },
          function(threadRes,userResult,callback){
            if(threadRes){
              callback(null,threadRes,userResult)
            }else{
              ThreadListDB.getThreadByParticipant([reciver,sender],function(err,tResult){
                if(err){
                  callback({errorCode:502,Message:"unable to get thread"},null);
                }else{
                  if(tResult){
                    callback(null,tResult,userResult)
                  }else{
                        var reciverProfile = _.find(userResult,function(rec){if(rec._id.toString().toLowerCase() == reciver.toLowerCase()){ return rec }})
                        var senderProfile = _.find(userResult,function(rec){if(rec._id.toString().toLowerCase() == sender.toLowerCase()){ return rec }})
                        if(reciverProfile && senderProfile){
                          var insObj = {
                            participants : [{
                              userId : reciverProfile._id,
                              userName : reciverProfile.fullName,
                              userEmail : reciverProfile.email,
                              userProfilePic : reciverProfile.profilePicture
                            },{
                              userId : senderProfile._id,
                              userName : senderProfile.fullName,
                              userEmail : senderProfile.email,
                              userProfilePic : senderProfile.profilePicture
                            }]
                          }
                          ThreadListDB.insertThread(insObj,function(err,insResult){
                            if(err){
                              callback({errorCode:601,Message:"unable to save thread"},null);
                            }else{
                              callback(null,insResult.ops[0],userResult);
                            }
                          })
                        }else{
                          callback({errorCode:408,Message:"user not found"},null);
                        }
                    //   }
                    // })
                  }
                }
              })
            }
          },
          function(threadRes,userResult,callback){
            var reciver = _.find(userResult,function(rec){if(rec._id.toString().toLowerCase() == req.body["reciverId"].toString().toLowerCase()){ return rec }})
            var sender = _.find(userResult,function(rec){if(rec._id.toString().toLowerCase() == req.body["senderId"].toString().toLowerCase()){ return rec }})
            // var sender = _.find(threadRes.participants,function(rec){ if(rec.userId.toString().toLowerCase() == req.body["senderId"].toString()) return rec });
            var insObj = {
              sender: {
                userId : sender._id,
                userName : sender.userName,
                userEmail : sender.email,
                userProfilePic : sender.profilePicture
              }
              , thread : threadRes._id
              , message : req.body["messageBody"]
              , dateTime : new Date()
            }
            ThreadMessageDB.insertMessage(insObj,function(err,result){
              if(err){
                callback({errorCode:601,Message:"unable to save message"},null);
              }else{
                callback(null,result.ops[0],userResult);
              }
            })
          },
          function(messageRes,userResult,callback){
            var reciver = _.find(userResult,function(rec){if(rec._id.toString().toLowerCase() == req.body["reciverId"].toString().toLowerCase()){ return rec }})
            var sender = _.find(userResult,function(rec){if(rec._id.toString().toLowerCase() == req.body["senderId"].toString().toLowerCase()){ return rec }})
            var insObj = {
              participants : [{
                userId : reciver._id,
                userName : reciver.fullName,
                userEmail : reciver.email,
                userProfilePic : reciver.profilePicture
              },{
                userId : sender._id,
                userName : sender.fullName,
                userEmail : sender.email,
                userProfilePic : sender.profilePicture
              }],
              lastMessage:{
                messageId: messageRes._id
                , senderId: messageRes.sender.userId
                , message : messageRes.message
                , dateTime : messageRes.dateTime
              }
            }
            ThreadListDB.updateThread(messageRes.thread,insObj,function(err,result){
              if(err){
                callback({errorCode:601,Message:"unable to send message"},null);
              }else{
                callback(null,"success");
              }
            })
          }
       ],function(err,result){
         if(err){
           res.status(err.errorCode);
           res.send({"Message": err.Message,"statusCode":err.errorCode});
         }else{
           res.status(200);
           res.send({"Message": "Message successfully sent","statusCode":200});
         }
       })
     }else{
       res.status(400);
       res.send({"Message": "invalid request","statusCode":400});
     }
  }

}

module.exports = MessageController;
