var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'user_profile';

function UserProfileDB(){}

UserProfileDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.UserProfileModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.UserProfileSchema = new Schema({
                _id: Schema.ObjectId
                , fullName: String
                , userName: String
                , email: String
                , googleId: String
                , facebookId: String
                , profilePicture: String
                , address: String
                , phoneNumber: String
                , activeStatus: Boolean
                , userType: String
                , bitcoinAddress: String
                , sellerRating: Number
                , sellerReview : [{
                  userId : Schema.ObjectId,
                  review : String
                }]
                , following: [Schema.ObjectId]
                , wishList : [Schema.ObjectId]
                , lastUpdateDate : Date
                , createDate : Date
            }, {collection: collection});
            this.UserProfileModel = con.model(collection, this.UserProfileSchema);
        }
    }
};

UserProfileDB.getUserByEmail = function (email, callback){
    this.UserProfileModel.findOne({email: email}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserProfileDB.insertUserProfile = function (obj, callback){
    this.UserProfileModel.collection.insert(obj,{setDefaultsOnInsert: true}, function (err){
        if (err) callback(err);
        else callback(null);
    });
};

UserProfileDB.updateUserProfile = function (obj, callback){
    this.UserProfileModel.findOneAndUpdate({email: obj.email}, obj, {new: true}, function (err){
        if (err) callback(err);
        else callback(null);
    });
};

UserProfileDB.deleteUserProfileByEmail = function (email, callback){
    this.UserProfileModel.findOneAndRemove({email:email}, function (err){
        if (err) callback(err);
        else callback(null);
    });
};

module.exports = UserProfileDB;
