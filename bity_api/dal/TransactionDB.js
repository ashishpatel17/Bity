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
                , price: Number
                , TransactionType: String
                , TransactionWith: Schema.ObjectId
                , TransactionDate: Date
                , Status:Boolean
            }, {collection: collection});
            this.UserTransactionModel = con.model(collection, this.UserTransactionSchema);
        }
    }
};

UserTransactionDB.getUserAllTransaction = function (UserId, callback){
    this.UserTransactionModel.find({$or:[{_id: UserId},{TransactionWith: UserId}]}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

module.exports = UserTransactionDB;
