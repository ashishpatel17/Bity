var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var jwt = require('jsonwebtoken');
var Mongoose = require('mongoose').Mongoose;
var mongoose = new Mongoose();
var _ = require('underscore');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path = require('path');

function UserProfileController(productDB,userProfileDB) {
  this.getProductDetails = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' && req.params['productId'] && typeof req.params['productId'] !== 'undefined'){
      productDB.getProductById(req.params['productId'],function(err,result){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to get product details"});
        }else{
          if(result){
            userProfileDB.getUserById(result.sellerId,function(err,usrResult){
              if(err){
                res.status(500);
                res.send({"Message": "Unable to get product seller"});
              }else{
                if(usrResult){
                  var profilePicPath = req.headers.host+"/"+config.profilePicturePublicPath;
                  var productPicPath = req.headers.host+"/"+config.productPicturePublicPath;
                  var productImage = [productPicPath+config.productDefaultImage];
                  if(result.image && result.image!=undefined && result.image!=null && result.image!="" && result.image.length>0){
                    productImage = [];
                    result.image.forEach(function(img){
                      productImage.push(productPicPath+img);
                    })
                  }
                  var responseObj = {
                    productId : result._id,
                    productName : result.productName,
                    price : result.price,
                    image : productImage,
                    isNagotiable : result.isNagotiable,
                    category : result.category,
                    subCategory : result.subcateory,
                    producTitle : result.productTitle,
                    productDescription : result.productTitle,
                    productLocation : result.location,
                    sellerId : result.sellerId,
                    sellerEmail : usrResult.email,
                    sellerName : usrResult.fullName,
                    sellerImage : (usrResult.profilePicture == undefined || usrResult.profilePicture == null)?profilePicPath+config.profileDefaultImage:profilePicPath+usrResult.profilePicture,
                    sellerRatingCount : usrResult.sellerRating,
                    sellerReviewCount : (usrResult.sellerReview!=undefined && usrResult.sellerReview!=null && usrResult.sellerReview!="")?usrResult.sellerReview.length:0,
                    isFollowedByUser : (usrResult.following!=undefined && usrResult.following!=null && usrResult.following!="")?usrResult.following.length:0,
                  }
                  res.status(200);
                  res.send(responseObj);
                }else{
                  res.status(500);
                  res.send({"Message": "Product Seller not found"});
                }
              }
            })
          }else{
            res.status(500);
            res.send({"Message": "product not found"});
          }
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
    }
  }

  this.getUserStore = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' && req.params['userId'] && typeof req.params['userId'] !== 'undefined'){
      UserValidation.getLoginInfo(req,function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "unauthorized request"});
        }else{
          if(loginRes && loginRes.UserId == req.params['userId']){
            productDB.getProductBySeller(loginRes.UserId,function(err,storeRes){
              if(err){
                res.status(500);
                res.send({"Message": "Unable to get user store"});
              }else{
                var resObj = [];
                var productPicPath = req.headers.host+"/"+config.productPicturePublicPath;
                storeRes.forEach(function(product){
                  var productImage = [productPicPath+config.productDefaultImage];
                  if(product.image && product.image!=undefined && product.image!=null && product.image!="" && product.image.length>0){
                    productImage = [];
                    product.image.forEach(function(img){
                      productImage.push(productPicPath+img);
                    })
                  }
                  resObj.push({
                    productId : product._id,
                    productName : product.productName,
                    price : product.price,
                    image : productImage,
                    location : product.location
                  })
                })
                res.status(200);
                res.send(resObj);
              }
            })
          }else{
            res.status(500);
            res.send({"Message": "unauthorized request"});
          }
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid Parameters"});
    }
  }

}

module.exports = UserProfileController;
