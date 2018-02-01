var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var genericUtils = new (require('../../../libs/genericFunctions.js'))();
var _ = require('underscore');
var async = require('async');

function OrderController(UserProfileDB,ProductDB,TransactionDB,CategoryDB) {

  this.postOrder = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
      req.body['buyerId'] && typeof req.body['buyerId'] !== 'undefined' &&
      req.body['productId'] && typeof req.body['productId'] !== 'undefined' &&
      req.body['productPrice'] && typeof req.body['productPrice'] !== 'undefined' &&
      req.body['sellerId'] && typeof req.body['sellerId'] !== 'undefined' &&
      req.body['paymentStatus'] && typeof req.body['paymentStatus'] !== 'undefined' &&
      req.body['deliveryMethod'] && typeof req.body['deliveryMethod'] !== 'undefined' &&
      req.body['shippingAddress'] && typeof req.body['shippingAddress'] !== 'undefined' &&
      req.body['shippingCity'] && typeof req.body['shippingCity'] !== 'undefined' &&
      req.body['shippingState'] && typeof req.body['shippingState'] !== 'undefined' &&
      req.body['shippingZipcode'] && typeof req.body['shippingZipcode'] !== 'undefined'){
        async.parallel([
          function(callback){
            UserProfileDB.getUserById(req.body['buyerId'],function(err,loginRes){
              if(err) callback({errCode:408,message:"user not found"},null);
              else callback(null,loginRes);
            })
          },
          function(callback){
            UserProfileDB.getUserById(req.body['sellerId'],function(err,selRes){
              if(err) callback({errCode:408,message:"seller not found"},null);
              else callback(null,selRes);
            })
          },
          function(callback){
            ProductDB.getProductById(req.body['productId'],function(err,proRes){
              if(err) callback({errCode:500,message:"product not found"},null);
              else callback(null,proRes);
            })
          }
        ],function(err,pRes){
          if(err){
            res.status(err.errCode);
            res.send({"Message":err.message});
          }else{
            var insObj = {
              deliveryMethod : req.body['deliveryMethod']
              , shippingAddress : {
                address : req.body['shippingAddress']
                ,city : req.body['shippingCity']
                ,state : req.body['shippingState']
                ,zip : req.body['shippingZipcode']
              }
              , paymentStatus : req.body['paymentStatus']
              , BuyerId: pRes[0]._id
              , ProductId: pRes[2]._id
              , Price: req.body['productPrice']
              , SellerId: pRes[1]._id
              , TransactionDate: new Date()
              , buyerStatus : {
                  status : config.orderStatus.purchase.pendingForLocalDeliveryConfirmation,
                  lastUpdateDate : new Date()
                }
              , sellerStatus : {
                  status : config.orderStatus.sales.pendingForLocalDeliveryConfirmation,
                  lastUpdateDate : new Date()
                }
            }
            TransactionDB.insertTransacton(insObj,function(err,insRes){
              if(err){
                res.status(601);
                res.send({"Message": "Unable to insert data",statusCode:601});
              }else{
                console.log(JSON.stringify(insRes));
                res.status(200);
                res.send({"Message": "Order sucessfully posted",statusCode:200,data:{transactionId:insRes.ops[0]._id}});
              }
            })
          }
        })
      }else{
        res.status(400);
        res.send({"Message": "Invalid request",statusCode:400});
      }
  }

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
            if(req.params['orderType'].toLowerCase()=="p"){
              TransactionDB.getUserPurchaseOrder(loginRes._id,function(err,result){
                if(err){
                  res.status(500);
                  res.send({"Message": "Unable to fetch data",statusCode:500});
                }else{
                  var totalData = result.length;
                  if(req.params['pageSize'] && req.params['pageSize']!=null && req.params['pageSize']!="" && req.params['pageNumber'] && req.params['pageNumber']!=null && req.params['pageNumber']!=""){
                    var pageNumber = req.params['pageNumber'];
                    var pageSize = req.params['pageSize'];
                    var totalPage = Math.ceil(totalData/pageSize);
                    result = result.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,result.length));
                  }
                  getTransactionProductDetails(req,result,function(err,finalRes){
                    if(err){
                      res.status(500);
                      res.send({"Message": "Unable to fetch data",statusCode:500});
                    }else{
                      res.status(200);
                      res.send({totalData:totalData,totalPage:totalPage,curPage:pageNumber,data:finalRes,statusCode : 200});
                    }
                  })
                }
              })
            }else if(req.params['orderType'].toLowerCase()=="s"){
              ProductDB.getUserActiveProducts(loginRes._id,function(err,storeRes){
              if(err){
                res.status(501);
                res.send({"Message": "unable to fetch data","statusCode":501});
              }else{
                var pId = storeRes.map(function(rec){return rec._id});
                TransactionDB.getTransactionByProducts(pId,function(err,tranRes){
                  if(err){
                    res.status(501);
                    res.send({"Message": "unable to fetch data","statusCode":501});
                  }else{
                    if(req.params['pageNumber'] && req.params['pageSize']){
                      var totalData = storeRes.length;
                      var pageNumber = parseInt(req.params['pageNumber']);
                      var pageSize = parseInt(req.params['pageSize']);
                      var totalPage = Math.ceil(totalData/pageSize);
                      storeRes = storeRes.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,storeRes.length));
                    }
                    var resObj = [];
                    var productPicPath = "http://"+req.headers.host+"/"+config.productPicturePublicPath;
                    storeRes.forEach(function(product){
                      var productTransaction = _.find(tranRes,function(rec){return rec.ProductId.toString().toLowerCase() == product._id.toString().toLowerCase()});
                      var productImage = [productPicPath+config.productDefaultImage];
                      if(product.image && product.image!=undefined && product.image!=null && product.image!="" && product.image.length>0){
                        productImage = [];
                        product.image.forEach(function(img){
                          productImage.push(productPicPath+img);
                        })
                      }

                      var expiryDate = new Date(product.expiryDate);
                      var strDate = expiryDate.getDate()+"/"+(expiryDate.getUTCMonth()+1)+"/"+expiryDate.getFullYear();
                      var daysRemaining = Math.floor(( Date.parse(expiryDate) - Date.parse(new Date()) ) / 86400000);

                      var obj = {
                        productId : product._id,
                        productName : product.productName,
                        price : product.price,
                        image : productImage,
                        location : product.location,
                        expiryDate : strDate,
                        daysRemaining : daysRemaining
                      }
                      if(productTransaction){
                        obj.buyerStatus = productTransaction.buyerStatus.status;
                        obj.sellerStatus = productTransaction.sellerStatus.status;
                        obj.orderId = productTransaction.orderId;
                      }
                      resObj.push(obj)
                    })
                    res.status(200);
                    res.send({"totalData":totalData,"totalPage":totalPage,"curPage":pageNumber,"data": resObj,"statusCode":200});
                  }
                })
              }
            })
            }else{
              res.status(400);
              res.send({"Message": "Invalid order type",statusCode:400});
            }
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
      req.body['userId'] && typeof req.body['userId'] !== 'undefined' &&
      req.body['status'] && typeof req.body['status'] !== 'undefined'){
        TransactionDB.getOrderById(req.body['orderId'],function(err,result){
          if(err){
            res.status(500);
            res.send({"Message": "Unable to fetch data",statusCode:500});
          }else{
            if(result){
              if(result.BuyerId.toString().toLowerCase() == req.body['userId'].toString().toLowerCase()){
                TransactionDB.updateBuyerOrderStatus(req.body['orderId'],req.body['status'],function(err,updateRes){
                  if(err){
                    res.status(502);
                    res.send({"Message": "Unable to fetch data",statusCode:502});
                  }else{
                    res.status(200);
                    res.send({"Message": "order status updated",statusCode:200});
                  }
                })
              }else if(result.SellerId.toString().toLowerCase() == req.body['userId'].toString().toLowerCase()){
                TransactionDB.updateSellerOrderStatus(req.body['orderId'],req.body['status'],function(err,updateRes){
                  if(err){
                    res.status(503);
                    res.send({"Message": "Unable to fetch data",statusCode:503});
                  }else{
                    res.status(200);
                    res.send({"Message": "order status updated",statusCode:200});
                  }
                })
              }else{
                res.status(501);
                res.send({"Message": "Order not found",statusCode:501});
              }
            }else{
              res.status(500);
              res.send({"Message": "Order not found",statusCode:500});
            }
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
                var tranDate = new Date(orderDetail.TransactionDate);
                var strDate = tranDate.getDate()+"/"+(tranDate.getUTCMonth()+1)+"/"+tranDate.getFullYear();

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
                  orderDate : strDate,
                  orderStatus : orderDetail.Status,
                  sellerStatus : orderDetail.sellerStatus,
                  buyerStatus : orderDetail.buyerStatus
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

  var getTransactionProductDetails = function(req,result,callback){
        var products = result.map(function(tran){return tran.ProductId});
        ProductDB.getProductByCondition({_id:{$in:products}},function(err,prodResult){
          if(err){
            callback(err,null);
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
                location : transactionProduct.location,
                buyerStatus : tran.buyerStatus.status,
                sellerStatus : tran.sellerStatus.status
              })
            })
            callback(null,finalRes);
          }
        })
  }

}

module.exports = OrderController;
