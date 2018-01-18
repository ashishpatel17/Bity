var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var _ = require('underscore');
var path = require('path');
var genericUtils = new (require('../../../libs/genericFunctions.js'))();
var async = require('async');
var fs = require('fs');

function UserProfileController(productDB,UserProfileDB,categoryDB) {
  this.getProductDetails = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' && req.params['productId'] && typeof req.params['productId'] !== 'undefined'){
      async.waterfall([
        function(callback){
          productDB.getProductById(req.params['productId'],function(err,result){
            if(err){
              callback({errorCode:500,message:"Unable to get fetch data"},null);
            }else{
              if(result){
                callback(null,result);
              }else{
                callback({errorCode:501,message:"product not found"},null);
              }
            }
          })
        },
        function(productDetail,callback){
          UserProfileDB.getUserById(productDetail.sellerId,function(err,usrResult){
            if(err){
              callback({errorCode:500,message:"Unable to get fetch data"},null);
            }else{
              if(usrResult){
                callback(null,productDetail,usrResult);
              }else{
                callback({errorCode:502,message:"Product Seller not found"},null);
              }
            }
          })
        },
        function(productDetail,sellerDetail,callback){
          categoryDB.getCategory(productDetail.category,function(err,result){
            if(err){
              callback({errorCode:500,message:"Unable to get fetch data"},null);
            }else{
              if(result){
                callback(null,productDetail,sellerDetail,result);
              }else{
                callback({errorCode:503,message:"product category not found"},null);
              }
            }
          })
        },
        function(productDetail,sellerDetail,category,callback){
          var profilePicPath = "http://"+req.headers.host+"/"+config.profilePicturePublicPath;
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
            sellerId : productDetail.sellerId,
            sellerEmail : sellerDetail.email,
            sellerName : sellerDetail.fullName,
            sellerImage : (sellerDetail.profilePicture == undefined || sellerDetail.profilePicture == null)?profilePicPath+config.profileDefaultImage:profilePicPath+sellerDetail.profilePicture,
            sellerRatingCount : sellerDetail.sellerRating.toFixed(1),
            sellerReviewCount : (sellerDetail.sellerReview!=undefined && sellerDetail.sellerReview!=null && sellerDetail.sellerReview!="")?sellerDetail.sellerReview.length:0,
            isFollowedByUser : (sellerDetail.following!=undefined && sellerDetail.following!=null && sellerDetail.following!="")?sellerDetail.following.length:0,
          }
          callback(null,responseObj);
        }
      ],function(err,result){
        if(err){
          res.status(err.errorCode);
          res.send({Message: err.message,statusCode:err.errorCode});
        }else{
          res.status(200);
          res.send({data:result,statusCode:200});
        }
      })
    }else{
      res.status(400);
      res.send({Message:"Invalid request",statusCode:400});
    }
  }

  this.getUserStore = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' && req.params['userId'] && typeof req.params['userId'] !== 'undefined'){
      UserProfileDB.getUserById(req.params["userId"],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "unable to fetch data","statusCode":500});
        }else{
          if(loginRes!=undefined && loginRes!=undefined){
            productDB.getProductBySeller(loginRes._id,function(err,storeRes){
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
                    location : product.location,
                    address : product.address
                  })
                })
                res.status(200);
                res.send({"totalData":totalData,"totalPage":totalPage,"curPage":pageNumber,"data": resObj,"statusCode":200});
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

  this.editProduct = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
    req.body['productId'] && typeof req.body['productId'] !== 'undefined'){
      productDB.getProductById(req.body['productId'],function(err,resProduct){
        if(err){
          res.status(500);
          res.send({Message:"Unable to find product",statusCode:500});
        }else{
          if(resProduct!=undefined && resProduct!=null){
            if(req.body['title'] && typeof req.body['title'] !== 'undefined'){
              resProduct["productTitle"]=req.body['title'];
            }
            if(req.body['description'] && typeof req.body['description'] !== 'undefined'){
              resProduct["productDescription"]=resProduct["productDescription"];
            }
            if(req.body['price'] && typeof req.body['price'] !== 'undefined'){
              resProduct["price"]=req.body['price'];
            }
            if(req.body['lat'] && typeof req.body['lat'] !== 'undefined' && req.body['long'] && typeof req.body['long'] !== 'undefined'){
              resProduct["location"]=[req.body['lat'],req.body['long']];
            }
            if(req.body['address'] && typeof req.body['address'] !== 'undefined'){
              resProduct["address"]=req.body['address'];
            }
            if(req.body['isNagotiable'] && typeof req.body['isNagotiable'] !== 'undefined'){
              resProduct["isNagotiable"]=req.body['isNagotiable'];
            }
            if(req.body['category'] && typeof req.body['category'] !== 'undefined'){
              resProduct["category"]=req.body['category'];
            }
            if(req.body['subcateory'] && typeof req.body['subcateory'] !== 'undefined'){
              resProduct["subcateory"]=req.body['subcateory'];
            }
            if(req.body['address'] && typeof req.body['address'] !== 'undefined'){
              resProduct["address"]=req.body['address'];
            }
            var productImg = [];
            if(req.files!=null && req.files["productImage"]!=undefined){
              productImg = req.files["productImage"];
              if(productImg.length == undefined){
                productImg = [req.files["productImage"]];
              }
            }

            var parallelFunction = [];
            productImg.forEach(function(img){
              var saveFile = function(callback) {
                var filePath = path.resolve(__dirname,"../../../../"+config.productPicturePath);
                var date = new Date();
                var fileType = img.mimetype;
                var fileName = req.body['name'].replace(/ /g,'')+"_"+date.getTime()+"."+fileType.split("/")[1];
                fs.writeFile(filePath+"/"+fileName,img.data,"binary",function(err) {
                  if(err){
                    callback(null,{fileName:fileName,diskStatus:false});
                  }else{
                    callback(null,{fileName:fileName,diskStatus:true});
                  }
                })
              }
              parallelFunction.push(saveFile)
            })

            async.parallel(parallelFunction,function(err,finalRes){
              var imageToSave = [];
              var oldImages = [];
              finalRes.forEach(function(obj){
                if(obj.diskStatus){
                  imageToSave.push(obj.fileName)
                }
              })
              if(imageToSave.length>0){
                oldImages = resProduct["image"];
                resProduct["image"] = imageToSave;
              }
              productDB.updateProduct(req.body['productId'],resProduct,function(updateErr,updateRes){
                if(updateErr){
                  res.status(601);
                  res.send({Message:"Unable to update product",statusCode:601});
                }else{
                  if(oldImages.length>0){
                    var filePath = path.resolve(__dirname,"../../../../"+config.productPicturePath);
                    oldImages.forEach(function(e){
                      fs.unlink(filePath+"/"+e,function(err){});
                    })
                  }
                  res.status(200);
                  res.send({Message:"Product successfully updated",statusCode:200});
                }
              })
            })
          }else{
            res.status(501);
            res.send({Message:"Product not found",statusCode:501});
          }
        }
      })
    }else{
      res.status(400);
      res.send({Message:"Invalid request",statusCode:400});
    }
  }

  this.publishProduct = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
    req.body['title'] && typeof req.body['title'] !== 'undefined' &&
    req.body['name'] && typeof req.body['name'] !== 'undefined' &&
    req.body['description'] && typeof req.body['description'] !== 'undefined' &&
    req.body['price'] && typeof req.body['price'] !== 'undefined' &&
    req.body['lat'] && typeof req.body['lat'] !== 'undefined' &&
    req.body['long'] && typeof req.body['long'] !== 'undefined' &&
    req.body['address'] && typeof req.body['address'] !== 'undefined' &&
    req.body['isNagotiable'] && typeof req.body['isNagotiable'] !== 'undefined' &&
    req.body['category'] && typeof req.body['category'] !== 'undefined' &&
    req.body['subcateory'] && typeof req.body['subcateory'] !== 'undefined' &&
    req.body['sellerId'] && typeof req.body['sellerId'] !== 'undefined'){
      UserProfileDB.getUserById(req.body['sellerId'],function(err,sellerRec){
        if(err){
          res.status(500);
          res.send({"Message": "unable to fetch seller","statusCode":500});
        }else{
          if(sellerRec!=undefined && sellerRec!=null){
            var productImg = [];
            if(req.files!=null && req.files["productImage"]!=undefined){
              productImg = req.files["productImage"];
              if(productImg.length == undefined){
                productImg = [req.files["productImage"]];
              }
            }

            var parallelFunction = [];
            productImg.forEach(function(img){
              var saveFile = function(callback) {
                var filePath = path.resolve(__dirname,"../../../../"+config.productPicturePath);
                var date = new Date();
                var fileType = img.mimetype;
                var fileName = req.body['name'].replace(/ /g,'')+"_"+date.getTime()+"."+fileType.split("/")[1];
                fs.writeFile(filePath+"/"+fileName,img.data,"binary",function(err) {
                  if(err){
                    callback(null,{fileName:fileName,diskStatus:false});
                  }else{
                    callback(null,{fileName:fileName,diskStatus:true});
                  }
                })
              }
              parallelFunction.push(saveFile)
            })


            async.parallel(parallelFunction,function(err,finalRes){
              var imageToSave = [];
              finalRes.forEach(function(obj){
                if(obj.diskStatus){
                  imageToSave.push(obj.fileName)
                }
              })
              var insertObj = {
                productTitle: req.body['title']
                , productName: req.body['name']
                , productDescription: req.body['description']
                , price: parseInt(req.body['price'])
                , image: imageToSave
                , location: [parseFloat(req.body['lat']),parseFloat(req.body['long'])]
                , isNagotiable: req.body['isNagotiable']=="yes"?true:false
                , category: req.body['category']
                , subcateory: req.body['subcateory']
                , sellerId: sellerRec._id
                , postedDate : new Date()
                , address : req.body['address']
              }
              productDB.insertProduct(insertObj,function(err,result){
                if(err){
                  res.status(601);
                  res.send({"Message": "Failed to insert product","statusCode":601});
                }else{
                  res.status(200);
                  res.send({"Message": "Product successfully published","statusCode":200});
                }
              })
            });
          }else{
            res.status(501);
            res.send({"Message": "seller not found","statusCode":500});
          }
        }
      })
    }else{
      res.status(400);
      res.send({Message:"Invalid request",statusCode:400});
    }
  }

  this.makeOffer = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
    req.body['userId'] && typeof req.body['userId'] !== 'undefined' &&
    req.body['productId'] && typeof req.body['productId'] !== 'undefined' &&
    req.body['offerPrice'] && typeof req.body['offerPrice'] !== 'undefined'){
      UserProfileDB.getUserById(req.body["userId"],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "unable to fetch data","statusCode":500});
        }else{
          if(loginRes!=undefined && loginRes!=null){
            productDB.addProductOfferByUser(req.body['productId'],req.body['userId'],req.body['offerPrice'],function(err,result){
              if(err){
                res.status(601);
                res.send({"Message": "Unable to add offers of product from user","statusCode":601});
              }else{
                if(result){
                  res.status(200);
                  res.send({"Message": "Offer added for the product","statusCode":200});
                }else{
                  res.status(501);
                  res.send({"Message": "Product not found","statusCode":500});
                }
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

  this.getProducts = function(req,res){
    if(req && typeof req !== 'undefined' &&
    req.query && typeof req.query !== 'undefined' &&
    req.query['userId'] && typeof req.query['userId'] !== 'undefined' &&
    req.query['pageNumber'] && typeof req.query['pageSize'] !== 'undefined'){
      var customCondition = {sellerId:{$ne:req.query['userId']}};
      if(req.query['lat'] && req.query['lat']!="" && req.query['lat']!='null' && req.query['long'] && req.query['long']!="" && req.query['long']!='null' && req.query['distance'] && req.query['distance']!="" && req.query['distance']!='null'){
        var coords = [req.query['lat'],req.query['long']];
        var distance = req.query['distance'] / 111.12; //convert the distance to radius
        customCondition.location = {
          $near: coords,
          $maxDistance: distance
        }
      }
      if(req.query['priceFrom'] && req.query['priceFrom']!='null' && (req.query['priceTo'] == undefined || req.query['priceTo']=='null')){
        customCondition.price={$gte:parseInt(req.query['priceFrom'])}
      }else if(req.query['priceTo'] && req.query['priceTo']!='null' && (req.query['priceFrom'] == undefined || req.query['priceFrom']=='null')){
        customCondition.price={$lte:parseInt(req.query['priceTo'])}
      }else if(req.query['priceFrom'] && req.query['priceFrom']!='null' && req.query['priceTo'] && req.query['priceTo']!='null'){
        customCondition.price={$gte:parseInt(req.query['priceFrom']),$lte:parseInt(req.query['priceTo'])};
      }
      if(req.query['keyword'] && req.query['keyword']!="" && req.query['keyword']!='null'){
        customCondition.$or =[{productTitle:new RegExp(req.query['keyword'],'i')},{productName:new RegExp(req.query['keyword'],'i')}];
      }
      if(req.query['categoryId'] && req.query['categoryId']!="" && req.query['categoryId']!='null'){
        customCondition.category = {$in:req.query['categoryId'].split(",")};
      }
      if(req.query['subCategoryId'] && req.query['subCategoryId']!="" && req.query['subCategoryId']!='null'){
        customCondition.subcateory = {$in:req.query['subCategoryId'].split(",")};
      }

      productDB.getProductByCondition(customCondition,function(err,result){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch data","statusCode":500});
        }else{

          var pageNumber = parseInt(req.query['pageNumber']);
          var pageSize = parseInt(req.query['pageSize']);
          var totalData = result.length;
          var totalPage = Math.ceil(totalData/pageSize);
          result = result.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,result.length));
          var productPicPath = "http://"+req.headers.host+"/"+config.productPicturePublicPath;
          var finalRes=[];
          for(var i=0 ; i<result.length ; i++){
            var productImg = [productPicPath+config.productDefaultImage];
            if(result[i].image.length>0){
              productImg = result[i].image.map(function(img){return productPicPath+img;})
            }
            finalRes.push({
              productId : result[i]._id,
              productTitle : result[i].productTitle,
              productName : result[i].productName,
              price : result[i].price,
              image : productImg,
              location : result[i].location,
              address : result[i].address
            });
          }
          res.status(200);
          res.send({totalData:totalData,totalPage:totalPage,curPage:pageNumber,data:finalRes,statusCode:200});
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

  this.reportProduct = function(req,res){
    if(req && typeof req !== 'undefined' && req.body && typeof req.body !== 'undefined' &&
    req.body['userId'] && typeof req.body['userId'] !== 'undefined' &&
    req.body['productId'] && typeof req.body['productId'] !== 'undefined'){
      UserProfileDB.getUserById(req.body["userId"],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "unable to fetch data","statusCode":500});
        }else{
          var reportMessage = (req.body['reportMessage']!=undefined && req.body['reportMessage']!=null)?req.body['reportMessage']:"";
          productDB.addProductReport(req.body['productId'],loginRes.UserId,reportMessage,function(err,result){
            if(err){
              res.status(601);
              res.send({"Message": "Failed to add report of the product","statusCode":601});
            }else{
              if(result){
                res.status(200);
                res.send({"Message": "Report posted for this product","statusCode":200});
              }else{
                res.status(501);
                res.send({"Message": "Product not found","statusCode":501});
              }
            }
          })
        }
      })
    }else{
      res.status(400);
      res.send({"Message": "Invalid request","statusCode":400});
    }
  }

}

module.exports = UserProfileController;
