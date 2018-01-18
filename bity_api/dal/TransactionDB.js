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
                , UserId: Schema.ObjectId
                , UserEmail: String
                , ProductId: Schema.ObjectId
                , Price: Number
                , TransactionType: String // purchase or sales
                , TransactionWith: Schema.ObjectId
                , TransactionDate: Date
                , Status:String
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

UserTransactionDB.updateOrderStatus = function (orderId,status,callback){
    this.UserTransactionModel.findOneAndUpdate({_id: orderId},{Status:status}, function (err, result){
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



module.exports = UserTransactionDB;
