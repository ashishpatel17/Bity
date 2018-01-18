var config = require('../../../config')();
var UserValidation = new (require('../../../libs/userValidation'))();
var genericUtils = new (require('../../../libs/genericFunctions.js'))();
var _ = require('underscore');

function CategoryController(categoryDB,UserProfileDB) {
  this.getCategories = function(req,res){
    if(req && typeof req !== 'undefined'){
      categoryDB.getAllCategories(function(err,result){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch data",statusCode:500});
        }else{
          var totalData = result.length;
          var finalRes = result;
          if(req.params['pageSize'] && req.params['pageSize']!=null && req.params['pageSize']!="" && req.params['pageNumber'] && req.params['pageNumber']!=null && req.params['pageNumber']!=""){
            var pageNumber = req.params['pageNumber'];
            var pageSize = req.params['pageSize'];
            finalRes = finalRes.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,finalRes.length));
          }
          var pageNumber = parseInt(req.params['pageNumber']);
          var pageSize = parseInt(req.params['pageSize']);
          var totalPage = Math.ceil(totalData/pageSize);
          res.status(200);
          res.send({totalData:totalData,totalPage:totalPage,curPage:pageNumber,data:finalRes,statusCode : 200});
        }
      })
    }else{
      res.status(400)
      res.send({Message:"Invalid request",statusCode:400})
    }
  }

  this.getSubCategories = function(req,res){
    if(req && typeof req !== 'undefined' && req.params && typeof req.params !== 'undefined' && req.params['categoryId'] && typeof req.params['categoryId'] !== 'undefined'){
      categoryDB.getCategory(req.params['categoryId'],function(err,result){
        if(err){
          res.status(500);
          res.send({"Message": "Unable to fetch data",statusCode:500});
        }else{
          if(result && result.subCategory){
            var totalData = result.subCategory.length;
            var finalRes = result.subCategory;
            if(req.params['pageSize'] && req.params['pageSize']!=null && req.params['pageSize']!="" && req.params['pageNumber'] && req.params['pageNumber']!=null && req.params['pageNumber']!=""){
              var pageNumber = req.params['pageNumber'];
              var pageSize = req.params['pageSize'];
              finalRes = finalRes.slice(genericUtils.GetStartIndexForPagination(pageSize,pageNumber),genericUtils.GetEndIndexForPagination(pageSize,pageNumber,finalRes.length));
            }
            var pageNumber = parseInt(req.params['pageNumber']);
            var pageSize = parseInt(req.params['pageSize']);
            var totalPage = Math.ceil(totalData/pageSize);
            res.status(200);
            res.send({totalData:totalData,totalPage:totalPage,curPage:pageNumber,data:finalRes,statusCode : 200});
          }else{
            res.status(501);
            res.send({"Message": "Subcategory not found for given category",statusCode:501});
          }
        }
      })
    }else{
      res.status(400)
      res.send({Message:"Invalid request",statusCode:400})
    }
  }

}

module.exports = CategoryController;
