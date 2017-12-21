var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'bity_product';

function ProductDB(){}

ProductDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.ProductModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.ProductSchema = new Schema({
                _id: Schema.ObjectId
                , productTitle: String
                , productName: String
                , productDescription: String
                , price: Number
                , image: [String]
                , location: String
                , isNagotiable: Boolean
                , category: String
                , subcateory: String
                , sellerId: Schema.ObjectId
                , offers: [{
                  userId:Schema.ObjectId,
                  offerPrice:Number
                }]
                , report: [{
                  userId:Schema.ObjectId,
                  reportMessage:Number
                }]
                , lastUpdateDate : Date
                , createDate : Date
            }, {collection: collection});
            this.ProductModel = con.model(collection, this.ProductSchema);
        }
    }
};

ProductDB.getProductById = function (productId, callback){
    this.ProductModel.findOne({_id: productId}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

ProductDB.getProductBySeller = function (sellerId, callback){
    this.ProductModel.find({sellerId: sellerId}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

// ProductDB.insertProduct = function (obj, callback){
//     this.ProductModel.collection.insert(obj,{setDefaultsOnInsert: true}, function (err){
//         if (err) callback(err);
//         else callback(null);
//     });
// };
//
// ProductDB.updateProduct = function (obj, callback){
//     this.ProductModel.findOneAndUpdate({email: obj.email}, obj, {new: true}, function (err){
//         if (err) callback(err);
//         else callback(null);
//     });
// };
//
// ProductDB.deleteProductByEmail = function (email, callback){
//     this.ProductModel.findOneAndRemove({email:email}, function (err){
//         if (err) callback(err);
//         else callback(null);
//     });
// };

module.exports = ProductDB;
