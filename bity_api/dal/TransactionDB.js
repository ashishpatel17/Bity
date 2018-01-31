var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'user_transaction';

function UserTransactionDB(){}

UserTransactionDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.UserTransactionModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.UserTransactionSchema = new Schema({
                _id: Schema.ObjectId
                , deliveryMethod : String
                , shippingAddress : {
                  address : String
                  ,city : String
                  ,state : String
                  ,zip : String
                }
                , paymentStatus : String
                , BuyerId: Schema.ObjectId
                , ProductId: Schema.ObjectId
                , Price: Number
                , SellerId: Schema.ObjectId
                , TransactionDate: Date
                , buyerStatus : {
                    status:String,
                    lastUpdateDate : Date
                  }
                , sellerStatus : {
                    status:String,
                    lastUpdateDate : Date
                  }
            }, {collection: collection});
            this.UserTransactionModel = con.model(collection, this.UserTransactionSchema);
        }
    }
};

UserTransactionDB.getUserTransaction = function (userId, orderId, callback){
    this.UserTransactionModel.findOne({_id: orderId,UserId:userId}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserTransactionDB.updateBuyerOrderStatus = function (orderId,status,callback){
    this.UserTransactionModel.findOneAndUpdate({_id: orderId},{buyerStatus:{status:status,lastUpdateDate:new Date()}}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserTransactionDB.updateSellerOrderStatus = function (orderId,status,callback){
    this.UserTransactionModel.findOneAndUpdate({_id: orderId},{sellerStatus:{status:status,lastUpdateDate:new Date()}}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserTransactionDB.getUserAllTransaction = function (UserId, callback){
    this.UserTransactionModel.find({$or:[{_id: UserId},{TransactionWith: UserId}]}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserTransactionDB.getUserTransactionByOrderType = function (UserId,orderType,callback){
    this.UserTransactionModel.find({UserId: UserId,TransactionType: orderType}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserTransactionDB.getOrderById = function (orderId, callback){
    this.UserTransactionModel.findOne({_id: orderId}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserTransactionDB.getUserPurchaseOrder = function(userId,callback){
  this.UserTransactionModel.find({BuyerId: userId}, function (err, result){
      if (err) callback(err);
      else {
          callback(null, result);
      }
  });
}

UserTransactionDB.getUserSalesOrder = function(userId,callback){
  this.UserTransactionModel.find({SellerId: userId}, function (err, result){
      if (err) callback(err);
      else {
          callback(null, result);
      }
  });
}

UserTransactionDB.insertTransacton = function (insObj,callback){
  this.UserTransactionModel.collection.insert(insObj,{setDefaultsOnInsert: true}, function (err,res){
      if (err) callback(err,null);
      else callback(null,res);
  });
}


module.exports = UserTransactionDB;
