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
                , location: [Number]
                , phoneNumber: String
                , activeStatus: Boolean
                , userType: String
                , bitcoinAddress: String
                , sellerRating: Number
                , sellerReview : [{
                  userId : Schema.ObjectId,
                  userName : String,
                  comment : String,
                  rating : Number,
                  postDate : Date
                }]
                , following: [Schema.ObjectId]
                , wishList : [Schema.ObjectId]
                , lastUpdateDate : Date
                , createDate : Date
                , isEmailVerified : Boolean
            }, {collection: collection});
            this.UserProfileSchema.index({ location: '2d' });
            this.UserProfileModel = con.model(collection, this.UserProfileSchema);
        }
    }
};

UserProfileDB.getMultipleUser = function (userId, callback){
    this.UserProfileModel.find({_id:{$in:userId}}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserProfileDB.getUserFollowers = function (userId, callback){
    this.UserProfileModel.find({following: userId}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserProfileDB.getUserByEmail = function (email, callback){
    this.UserProfileModel.findOne({email: email}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserProfileDB.getUserByGoogleId = function (googleId, callback){
    this.UserProfileModel.findOne({googleId: googleId}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

UserProfileDB.getUserByFacebookId = function (facebookId, callback){
    this.UserProfileModel.findOne({facebookId: facebookId}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

UserProfileDB.getUserById = function (id, callback){
    this.UserProfileModel.findOne({_id: id}, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

UserProfileDB.insertUserProfile = function (obj, callback){
    this.UserProfileModel.collection.insert(obj,{setDefaultsOnInsert: true}, function (err,res){
        if (err) callback(err,null);
        else callback(null,res);
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

UserProfileDB.addUserWishList = function (userId, productId, callback){
  this.UserProfileModel.findOneAndUpdate({
          _id: userId
      }, {$addToSet:{wishList:productId},$set:{ LastUpdatedDate: new Date()}}, {new: true}, function (err, obj) {
          if (err) callback(err, null);
          else callback(null, obj);
  });
}

UserProfileDB.deleteFromWishList = function (userId, productId, callback){
  this.UserProfileModel.findOneAndUpdate({
          _id: userId
      }, {$pull:{wishList:productId},$set:{ LastUpdatedDate: new Date()}}, {new: true}, function (err, obj) {
          if (err) callback(err, null);
          else callback(null, obj);
  });
}

UserProfileDB.updateEmailVerificationStatus = function (userId, status, callback){
  this.UserProfileModel.findOneAndUpdate({
          _id: userId
      }, {isEmailVerified : status}, {new: true}, function (err, obj) {
          if (err) callback(err, null);
          else callback(null, obj);
  });
}

module.exports = UserProfileDB;
