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

function UserReviewController(userAuthDB,userProfileDB,userLoginDB,TransactionDB) {
  /*
    Controller function to post User Review
  */
  this.publishReview = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
    req.body["userId"] && typeof req.body["userId"] !== 'undefined' &&
    req.body["rating"] && typeof req.body["rating"] !== 'undefined' &&
    req.body["comment"] && typeof req.body["comment"] !== 'undefined'){
      userProfileDB.getUserById(req.body["userId"],function(err,result){
        if(err){
          res.status(400);
          res.send({"Message": "Unable to find user"});
        }else{
          if(result){
            result.sellerReview.push({
              userId : req.body["userId"],
              comment : req.body["comment"],
              rating : parseInt(req.body["rating"])
            })
            result.sellerRating = calculateAverageRating(result.sellerReview);
            userProfileDB.updateUserProfile(result,function(err){
              if(err){
                res.status(500);
                res.send({"Message": "Fail to add user review"});
              }else{
                res.status(200);
                res.send({"Message": "Review successfully posted"});
              }
            })
          }else{
            res.status(400);
            res.send({"Message": "User not found"});
          }
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
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
      totalRating += parseInt(rating);
      denominator =  denominator+(parseInt(rating)*ratingGroup[rating].length);
    })
    var averageRating = denominator/totalRating;
    var float = averageRating - Math.floor(averageRating);
    if(float>=0.5){
      averageRating = Math.ceil(averageRating);
    }else{
      averageRating = Math.floor(averageRating);
    }
    return averageRating;
  }

}

module.exports = UserReviewController;
