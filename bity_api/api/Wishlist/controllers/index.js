var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var genericUtils = new (require('../../../libs/genericFunctions.js'))();

function WishlistController(UserProfileDB,productDB) {

  this.addToWishlist = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
      req.params['userId'] && typeof req.params['userId'] !== 'undefined' &&
      req.params['productId'] && typeof req.params['productId'] !== 'undefined'){
        UserProfileDB.getUserById(req.params["userId"],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch data","statusCode":500});
        }else{
          if(loginRes){
            UserProfileDB.addUserWishList(loginRes._id,req.params['productId'],function(err,result){
              if(err){
                res.status(601);
                res.send({"Message": "Unable to add wish list","statusCode":601});
              }else{
                res.status(200);
                res.send({"Message": "Product added to wishlist","statusCode":200});
              }
            })
          }else{
            res.status(408);
            res.send({"Message": "user not found","statusCode":408});
          }
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

  this.deleteWishlist = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
      req.params['userId'] && typeof req.params['userId'] !== 'undefined' &&
      req.params['productId'] && typeof req.params['productId'] !== 'undefined'){
      UserProfileDB.getUserById(req.params["userId"],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch data","statusCode":500});
        }else{
          if(loginRes){
            UserProfileDB.deleteFromWishList(loginRes._id,req.params['productId'],function(err,result){
              if(err){
                res.status(601);
                res.send({"Message": "Unable to delete from  wishlist","statusCode":601});
              }else{
                res.status(200);
                res.send({"Message": "Product deleted from wishlist","statusCode":200});
              }
            })
          }else{
            res.status(408);
            res.send({"Message": "user not found","statusCode":408});
          }
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

  this.getWishList = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
      req.params['userId'] && typeof req.params['userId'] !== 'undefined'){
      UserProfileDB.getUserById(req.params["userId"],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch data","statusCode":500});
        }else{
            if(loginRes){
              var result = loginRes;
              var wishlistProducts = result.wishList;
              var totalData = wishlistProducts.length;
              productDB.getProductByCondition({_id:{$in:wishlistProducts}},function(err,proRes){
                if(err){
                  res.status(502);
                  res.send({"Message": "Unable to get wishlist product","statusCode":502});
                }else{
                  if(req.params['pageSize'] && req.params['pageSize']!=null && req.params['pageSize']!="" && req.params['pageNumber'] && req.params['pageNumber']!=null && req.params['pageNumber']!=""){
                    var pageNumber = req.params['pageNumber'];
                    var pageSize = req.params['pageSize'];
                    proRes = proRes.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,proRes.length));
                  }
                  var responseObj = [];
                  for(var i=0 ; i<proRes.length ; i++){
                    var productPicPath = "http://"+req.headers.host+"/"+config.productPicturePublicPath;
                    var productImage = [productPicPath+config.productDefaultImage];
                    if(proRes[i].image && proRes[i].image!=undefined && proRes[i].image!=null && proRes[i].image!="" && proRes[i].image.length>0){
                      productImage = [];
                      proRes[i].image.forEach(function(img){
                        productImage.push(productPicPath+img);
                      })
                    }
                    responseObj.push({
                      productId : proRes[i]._id,
                      productName : proRes[i].productName,
                      price : proRes[i].price?proRes[i].price:"",
                      image : productImage,
                      location : proRes[i].location?proRes[i].location:"",
                      address : proRes[i].address?proRes[i].address:""
                    })
                  }
                  var pageNumber = parseInt(req.params['pageNumber']);
                  var pageSize = parseInt(req.params['pageSize']);
                  var totalPage = Math.ceil(totalData/pageSize);
                  res.status(200);
                  res.send({totalData:totalData,totalPage:totalPage,curPage:pageNumber,data:responseObj,statusCode:200});
                }
              })
            }else{
              res.status(408);
              res.send({"Message": "user not found","statusCode":408});
            }
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

}

module.exports = WishlistController;
