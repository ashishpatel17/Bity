var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var genericUtils = new (require('../../../libs/genericFunctions.js'))();
var _ = require('underscore');
var async = require('async');

function OrderController(UserProfileDB,ProductDB,TransactionDB,CategoryDB) {

  this.getOrderList = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
      req.params['userId'] && typeof req.params['userId'] !== 'undefined' &&
      req.params['orderType'] && typeof req.params['orderType'] !== 'undefined' &&
      req.params['orderType'].toLowerCase()=="p" || req.params['orderType'].toLowerCase()=="s"){
      UserProfileDB.getUserById(req.params["userId"],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch data",statusCode:500});
        }else {
          if(loginRes!=null && loginRes!=undefined){
            var transactionType = req.params['orderType'].toLowerCase()=="p"?"purchase":"sales";
            TransactionDB.getUserTransactionByOrderType(loginRes._id,transactionType,function(err,result){
              if(err){
                res.status(500);
                res.send({"Message": "Unable to fetch data",statusCode:500});
              }else{
                var totalData = result.length;
                if(req.params['pageSize'] && req.params['pageSize']!=null && req.params['pageSize']!="" && req.params['pageNumber'] && req.params['pageNumber']!=null && req.params['pageNumber']!=""){
                  var pageNumber = req.params['pageNumber'];
                  var pageSize = req.params['pageSize'];
                  result = result.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,result.length));
                }
                var products = result.map(function(tran){return tran.ProductId});
                ProductDB.getProductByCondition({_id:{$in:products}},function(err,prodResult){
                  if(err){
                    res.status(500);
                    res.send({"Message": "Unable to fetch data",statusCode:500});
                  }else{
                    var finalRes = [];
                    result.forEach(function(tran){
                      var transactionProduct = _.find(prodResult,function(pro){if(pro._id.toString()==tran.ProductId.toString()){return pro;}})

                      var productPicPath = "http://"+req.headers.host+"/"+config.productPicturePublicPath;
                      var productImage = [productPicPath+config.productDefaultImage];
                      if(transactionProduct.image && transactionProduct.image!=undefined && transactionProduct.image!=null && transactionProduct.image!="" && transactionProduct.image.length>0){
                        productImage = [];
                        transactionProduct.image.forEach(function(img){
                          productImage.push(productPicPath+img);
                        })
                      }
                      finalRes.push({
                        orderId : tran._id,
                        status : tran.status,
                        productId : transactionProduct._id,
                        productName : transactionProduct.productName,
                        price : transactionProduct.price,
                        image : productImage,
                        orderType : tran.TransactionType,
                        location : transactionProduct.location
                      })
                    })
                    var pageNumber = parseInt(req.params['pageNumber']);
                    var pageSize = parseInt(req.params['pageSize']);
                    var totalPage = Math.ceil(totalData/pageSize);
                    res.status(200);
                    res.send({totalData:totalData,totalPage:totalPage,curPage:pageNumber,data:finalRes,statusCode : 200});
                  }
                })
              }
            })
          }else{
            res.status(408);
            res.send({Message:"User not found",statusCode:408});
          }
        }
      })
    }else{
      res.status(400);
      res.send({Message:"Invalid request",statusCode:400});
    }
  }

  this.changeOrderStatus = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
      req.body['orderId'] && typeof req.body['orderId'] !== 'undefined' &&
      req.body['status'] && typeof req.body['status'] !== 'undefined'){
        TransactionDB.updateOrderStatus(req.body['orderId'],req.body['status'],function(err,updateRes){
          if(err){
            res.status(500);
            res.send({"Message": "Unable to fetch data",statusCode:500});
          }else{
            res.status(200);
            res.send({"Message": "order status updated",statusCode:200});
          }
        })
    } else {
      res.status(400);
      res.send({Message:"Invalid request",statusCode:400});
    }
  }

  this.getOrderDetails = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
      req.params['orderId'] && typeof req.params['orderId'] !== 'undefined'){
            async.waterfall([
              function(callback){
                TransactionDB.getOrderById(req.params['orderId'],function(err,result){
                  if(err){
                    callback({errorCode:500,message: "Unable to fetch data"},null);
                  }else{
                    if(result){
                      callback(null,result);
                    }else{
                      callback({errorCode:501,message: "order not found"},null);
                    }
                  }
                })
              },
              function(orderDetail,callback){
                ProductDB.getProductById(orderDetail.ProductId,function(err,result){
                  if(err){
                    callback({errorCode:500,message:"Unable to fetch data"},null);
                  }else{
                    if(result){
                      callback(null,orderDetail,result);
                    }else{
                      callback({errorCode:502,message:"product not found of given order"},null);
                    }
                  }
                })
              },
              function(orderDetail,productDetail,callback){
                CategoryDB.getCategory(productDetail.category,function(err,result){
                  if(err){
                    callback({errorCode:500,message:"Unable to fetch data"},null);
                  }else{
                    if(result){
                      callback(null,orderDetail,productDetail,result);
                    }else{
                      callback({errorCode:503,message:"product category not found"},null);
                    }
                  }
                })
              },
              function(orderDetail,productDetail,category,callback){
                var productPicPath = "http://"+req.headers.host+"/"+config.productPicturePublicPath;
                var productImage = [productPicPath+config.productDefaultImage];
                if(productDetail.image && productDetail.image!=undefined && productDetail.image!=null && productDetail.image!="" && productDetail.image.length>0){
                  productImage = [];
                  productDetail.image.forEach(function(img){
                    productImage.push(productPicPath+img);
                  })
                }
                var responseObj = {
                  productId : productDetail._id,
                  productName : productDetail.productName,
                  price : productDetail.price,
                  image : productImage,
                  isNagotiable : productDetail.isNagotiable,
                  categoryId : productDetail.category,
                  subCategoryId : productDetail.subcateory,
                  category : category.categoryName,
                  subCategory : _.find(category.subCategory, function(subCat){ if(subCat.subCategoryId.toString()==productDetail.subcateory.toString()) return subCat; }).subCategoryName,
                  producTitle : productDetail.productTitle,
                  productDescription : productDetail.productTitle,
                  productLocation : productDetail.location,
                  orderType : orderDetail.TransactionType,
                  orderPrice : orderDetail.Price,
                  orderDate : orderDetail.TransactionDate,
                  orderStatus : orderDetail.Status
                }
                callback(null,responseObj);
              }
            ],function(err,result){
              if(err){
                res.status(err.errorCode);
                res.send({Message: err.message,statusCode:err.errorCode});
              }else{
                res.status(200);
                res.send({data:result,statusCode : 200});
              }
            })
      }else{
        res.status(400);
        res.send({Message:"Invalid request",statusCode:400});
      }
  }

}

module.exports = OrderController;
