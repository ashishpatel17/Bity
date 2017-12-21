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
            }, {collection: collection});
            this.CategoryModel = con.model(collection, this.CategorySchema);
        }
    }
};

module.exports = CategoryDB;
