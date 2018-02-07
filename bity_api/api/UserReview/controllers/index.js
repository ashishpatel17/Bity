var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var _ = require('underscore');
var genericUtils = new (require('../../../libs/genericFunctions.js'))();

function UserReviewController(userAuthDB,UserProfileDB,UserLoginDB,TransactionDB) {
  /*
    Controller function to post User Review
  */
  this.publishReview = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
    req.body["userId"] && typeof req.body["userId"] !== 'undefined' &&
    req.body["rating"] && typeof req.body["rating"] !== 'undefined' &&
    req.body["comment"] && typeof req.body["comment"] !== 'undefined' ){
      if(parseInt(req.body["rating"])<0 || parseInt(req.body["rating"])>5){
        res.status(504);
        res.send({"Message": "Invalid rating it should be between 0 to 5","statusCode":504});
      }else{
        UserProfileDB.getUserById(req.body["userId"],function(err,result){
          if(err){
            res.status(500);
            res.send({"Message": "Unable to fetch data","statusCode":500});
          }else{
            if(result){
              result.sellerReview.push({
                userId : "",
                userName : "",
                comment : req.body["comment"],
                rating : parseInt(req.body["rating"]),
                postDate : new Date()
              })
              result.sellerRating = calculateAverageRating(result.sellerReview);
              UserProfileDB.updateUserProfile(result,function(err){
                if(err){
                  res.status(601);
                  res.send({"Message": "Fail to add user review","statusCode":601});
                }else{
                  res.status(200);
                  res.send({"Message": "Review successfully posted","statusCode":200});
                }
              })
            }else{
              res.status(408);
              res.send({"Message": "User not found","statusCode":408});
            }
          }
        })
      }
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

  this.getUserReview = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
    req.params["userId"] && typeof req.params["userId"] !== 'undefined'){
      UserProfileDB.getUserById(req.params["userId"],function(err,result){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch data","statusCode":500});
        }else{
          if(result){
            var totalData = result.sellerReview.length;
            var userReview = _.sortBy(result.sellerReview,'postDate').reverse();
            if(req.params['pageSize'] && req.params['pageSize']!=null && req.params['pageSize']!="" && req.params['pageNumber'] && req.params['pageNumber']!=null && req.params['pageNumber']!=""){
              var pageNumber = req.params['pageNumber'];
              var pageSize = req.params['pageSize'];
              userReview = userReview.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,userReview.length));
            }
            var finalResponse = [];
            userReview.forEach(function(urev){
              var rDate = new Date(urev.postDate);
              rDate = rDate.getDate()+"/"+parseInt(rDate.getUTCMonth()+1)+"/"+rDate.getFullYear()
              finalResponse.push({
                date : rDate
                ,message : urev.comment
                ,rating : (urev.rating!=undefined && urev.rating!=null)?urev.rating.toFixed(1):""
              })
            })
            var pageNumber = parseInt(req.params['pageNumber']);
            var pageSize = parseInt(req.params['pageSize']);
            var totalPage = Math.ceil(totalData/pageSize);
            res.status(200);
            res.send({totalData:totalData,totalPage:totalPage,curPage:pageNumber,data:finalResponse,statusCode:200});
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

  var calculateAverageRating = function(reviews){
    var ratingGroup = _.groupBy(reviews,function(rec){
      return rec.rating
    })
    var denominator = 0;
    var totalRating = 0;
    var distRating = Object.keys(ratingGroup);
    distRating.forEach(function(rating){
      totalRating += ratingGroup[rating].length;
      denominator =  denominator+(parseFloat(rating)*ratingGroup[rating].length);
    })
    console.log(totalRating);
    var averageRating = parseFloat((denominator/totalRating).toFixed(1));
    // if(float>=0.5){
    //   averageRating = Math.ceil(averageRating);
    // }else{
    //   averageRating = Math.floor(averageRating);
    // }
    return averageRating;
  }
}

module.exports = UserReviewController;
