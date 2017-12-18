var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'user_authentication';

function UserAuthenticationDB(){}

UserAuthenticationDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.UserAuthenticationModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.UserAuthenticationSchema = new Schema({
                _id: Schema.ObjectId
                , accessToken: String
                , refreshToken: String
                , LoginDate: Date
                , UserEmail: String
                , ExpirationDate: Date
            }, {collection: collection});
            this.UserAuthenticationModel = con.model(collection, this.UserAuthenticationSchema);
        }
    }
};

UserAuthenticationDB.getUserAuthenticationObj = function (search, callback){
    this.UserAuthenticationModel.findOne({_id: search}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserAuthenticationDB.getInfoByAccessToken = function (accessToken, callback){
    this.UserAuthenticationModel.findOne({accessToken: accessToken}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};


UserAuthenticationDB.getUserAuthenticationByAccessToken = function (accessToken, callback){
    this.UserAuthenticationModel.findOne({accessToken: accessToken}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};


UserAuthenticationDB.saveUserAuthenticationObj = function (obj, callback){
    this.UserAuthenticationModel.collection.insert(obj,{setDefaultsOnInsert: true}, function (err,result){
        if (err) callback(err,result);
        else callback(null,result);
    });
};


UserAuthenticationDB.updateUserAuthenticationObj = function (obj, callback){
    this.UserAuthenticationModel.findOneAndUpdate({_id: obj._id}, obj, {new: true}, function (err){
        if (err) callback(err);
        else callback(null);
    });
};

module.exports = UserAuthenticationDB;
