var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'user_login';

function UserLoginDB(){}

UserLoginDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.UserLoginModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.UserLoginSchema = new Schema({
                _id: Schema.ObjectId
                , email: String
                , userName: String
                , password: String
            }, {collection: collection});
            this.UserLoginModel = con.model(collection, this.UserLoginSchema);
        }
    }
};

UserLoginDB.getLoginByEmail = function (email, callback){
    this.UserLoginModel.findOne({email: email}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserLoginDB.changeUserpassword = function (email, newPassword, callback){
    this.UserLoginModel.findOneAndUpdate({email: email}, {$set:{password:newPassword}}, {new: true}, function (err){
        if (err) callback(err);
        else {
            callback(null, err);
        }
    });
};

UserLoginDB.saveUserLoginInfo = function (obj, callback){
    this.UserLoginModel.collection.insert(obj,{setDefaultsOnInsert: true}, function (err){
        if (err) callback(err);
        else callback(null);
    });
};



module.exports = UserLoginDB;
