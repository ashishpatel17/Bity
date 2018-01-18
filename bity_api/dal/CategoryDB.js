var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'bity_category';

function CategoryDB(){}

CategoryDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.CategoryModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.CategorySchema = new Schema({
                _id: Schema.ObjectId
                , categoryName: String
                , subCategory: [{
                  subCategoryId:Schema.ObjectId,
                  subCategoryName:String
                }]
                , createDate:Date
            }, {collection: collection});
            this.CategoryModel = con.model(collection, this.CategorySchema);
        }
    }
};

CategoryDB.getAllCategories = function (callback){
    this.CategoryModel.find({},{_id:1,categoryName:1},{sort: { categoryName : 1 }},function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

CategoryDB.getCategory = function (categoryId,callback){
    this.CategoryModel.findOne({_id:categoryId},function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

CategoryDB.getCategoryByCondition = function (condition,callback){
    this.CategoryModel.find(condition,function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}


module.exports = CategoryDB;
