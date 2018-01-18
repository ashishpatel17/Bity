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
                , address: String
                , price: Number
                , image: [String]
                , location: [Number]
                , isNagotiable: Boolean
                , category: Schema.ObjectId
                , subcateory: Schema.ObjectId
                , sellerId: Schema.ObjectId
                , offers: [{
                  userId:Schema.ObjectId,
                  offerPrice:Number
                }]
                , report: [{
                  userId:Schema.ObjectId,
                  reportMessage:String
                }]
                , lastUpdateDate : Date
                , postedDate : Date
            }, {collection: collection});
            this.ProductSchema.index({ location: '2d' });
            this.ProductModel = con.model(collection, this.ProductSchema);
        }
    }
};

ProductDB.getProductByCondition = function (condition, callback){
    this.ProductModel.find(condition,{},{sort: { postedDate : -1 }},function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
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

ProductDB.addProductOfferByUser = function (productId,userId,offerPrice, callback){
  this.ProductModel.findOneAndUpdate({
          _id: productId
      }, {$addToSet:{offers:{userId:userId,offerPrice:offerPrice}},$set:{ LastUpdatedDate: new Date()}}, {new: true}, function (err, obj) {
          if (err) callback(err, null);
          else callback(null, obj);
  });
}

ProductDB.addProductReport = function (productId,userId,message,callback){
  this.ProductModel.findOneAndUpdate({
          _id: productId
      }, {$addToSet:{report:{userId:userId,reportMessage:message}},$set:{ LastUpdatedDate: new Date()}}, {new: true}, function (err, obj) {
          if (err) callback(err, null);
          else callback(null, obj);
  });
}

ProductDB.updateProduct = function (productId,obj, callback){
    this.ProductModel.findOneAndUpdate({_id:productId},obj,{new: true},function (err){
        if (err) callback(err);
        else callback(null);
    });
};

ProductDB.insertProduct = function (obj, callback){
    this.ProductModel.collection.insert(obj,{setDefaultsOnInsert: true}, function (err){
        if (err) callback(err);
        else callback(null);
    });
};

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
