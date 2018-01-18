var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var genericUtils = new (require('../../../libs/genericFunctions.js'))();
var _ = require('underscore');
var async = require('async');

function DashboardController(CategoryDB,ProductDB,UserProfileDB,TransactionDB) {
  this.getDashboardDetail = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' &&
     req.params["userId"] && typeof req.params["userId"] !== 'undefined'){
      UserProfileDB.getUserById(req.params["userId"],function(err,loginRes){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch data",statusCode:500});
        }else{
          if(loginRes!=null && loginRes!=undefined){
             getUserProductAndTransaction(loginRes,function(err,result){
              if(err){
                res.status(err.errorCode);
                res.send({Message:err.Message});
              }else{
                var part1Counts = countsOfDashboard(result);
                var finalRes = {
                  newLocalProductCount : part1Counts.newProductsCount,
                  totalSalesCount : part1Counts.totalSalesCount,
                  totalReviews : part1Counts.totalReviewsCount,
                  categoryList : categoryWiseProduct(result.userProducts),
                  dailyActivity : dailySalesReport(result.userSales),
                }
                res.status(200);
                res.send({data:finalRes,statusCode : 200});
              }
            })
          }else{
            res.status(408)
            res.send({Message:"User not found",statusCode:408})
          }
        }
      })
    }else{
      res.status(400)
      res.send({Message:"Invalid request",statusCode:400})
    }
  }

  var countsOfDashboard = function(result){
    var date = new Date();
    var dateOffset = (24*60*60*1000) * 30;
    var prevMonthDate = new Date(date.setTime(date.getTime() - dateOffset));
    var newProducts = result.userProducts.length>0?result.userProducts.map(function(uPro){ if(new Date(uPro.postedDate) > prevMonthDate) return uPro; }):0;
    var totalSalesCount = result.userSales.length;
    var totalReviewsCount = result.userProfile.sellerReview.length;
    var newProductsCount = newProducts.length;
    return {totalSalesCount:totalSalesCount , totalReviewsCount:totalReviewsCount , newProductsCount:newProductsCount}
  }

  var categoryWiseProduct = function(userProducts){
    var categoryGroupedProducts = _.groupBy(userProducts,function(prod){ return prod.category});
    var categoryWiseProductPercentage = [];
    Object.keys(categoryGroupedProducts).forEach(function(cat){
      categoryWiseProductPercentage.push({
        categoryId : cat,
        category : categoryGroupedProducts[cat][0].categoryName,
        percentage : Math.round(categoryGroupedProducts[cat].length / userProducts.length * 100),
      })
    })
    return categoryWiseProductPercentage;
  }

  var dailySalesReport = function(userSales){
    var date = new Date();
    var dateOffset = (24*60*60*1000) * 30;
    var prevMonthDate = new Date(date.setTime(date.getTime() - dateOffset));
    var user30DaysSales = [];
    for(var i=0 ; i<userSales.length ; i++){
      var tDate = new Date(userSales[i].TransactionDate);
      tDate = tDate.getMonth()+1 +"/"+ tDate.getDate() + "/" + tDate.getFullYear();
      userSales[i].TransactionDate = new Date(tDate);
      userSales[i].StringDate = tDate;
      if(new Date(userSales[i].TransactionDate) > prevMonthDate){
        user30DaysSales.push(userSales[i]);
      }
    }

    var dayWiseGroupedSales = _.groupBy(user30DaysSales,function(sel){ return sel.StringDate});
    var dayWiseSalesReport = [];
    Object.keys(dayWiseGroupedSales).forEach(function(sel){
      dayWiseSalesReport.push({
        date : sel,
        numberOfSales : dayWiseGroupedSales[sel].length,
        totalAmount : dayWiseGroupedSales[sel].map(function(gSel){ return gSel.Price }).reduce((a, b) => a + b, 0)
      });
    })
    return dayWiseSalesReport
  }


  var getUserProductAndTransaction = function(loginRes,callback){
      async.parallel([
        function(callback){
          ProductDB.getProductBySeller(loginRes._id,function(err,result){
            if(err){
              callback({errorCode:500,Message:"unable to find user products"});
            }else{
              callback(null,result);
            }
          })
        },
        function(callback){
          TransactionDB.getUserTransactionByOrderType(loginRes._id,"sales",function(err,result){
            if(err){
              callback({errorCode:500,Message:"unable to find user sales"});
            }else{
              callback(null,result);
            }
          })
        },function(callback){
          UserProfileDB.getUserByEmail(loginRes.email,function(err,result){
            if(err){
              callback({errorCode:500,Message:"unable to find user profile"});
            }else{
              callback(null,loginRes);
            }
          })
        }
      ],function(err,result){
        if(err){
          callback(err,null);
        }else{
          var categoryIds = [];
          if(result[0].length>0){
            categoryIds = result[0].map(function(pro){ return pro.category });
            CategoryDB.getCategoryByCondition({_id:{$in:categoryIds}},function(catErr,carRes){
              if(err){
                callback({errorCode:500,Message:"unable to find product category"});
              }else{
                 for(var i=0 ; i<result[0].length ; i++){
                   result[0][i]["categoryName"] = _.find(carRes,function(cat){ return cat._id.toString().toLowerCase() == result[0][i].category.toString().toLowerCase() }).categoryName;
                 }
                 callback(null,{
                   userProducts : result[0],
                   userSales : result[1],
                   userProfile : result[2]
                 });
              }
            })
          }else{
            callback(null,{
              userProducts : result[0],
              userSales : result[1],
              userProfile : result[2]
            });
          }
        }
      })
  }

}

module.exports = DashboardController;
