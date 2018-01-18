var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'email_verification_request';

function EmailVerificationDB(){}

EmailVerificationDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.EmailVerificationModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.EmailVerificationSchema = new Schema({
                _id: Schema.ObjectId
                , userId: Schema.ObjectId
                , verificationCode : String
                , status : Boolean
                , createdDate : Date
            }, {collection: collection});
            this.EmailVerificationModel = con.model(collection, this.EmailVerificationSchema);
        }
    }
};

EmailVerificationDB.insertEmailVerification = function (insObj,callback){
  this.EmailVerificationModel.collection.insert(insObj,{setDefaultsOnInsert: true}, function (err,res){
      if (err) callback(err,null);
      else callback(null,res);
  });
}

EmailVerificationDB.getByVerificationCode = function (verificationCode,callback){
  this.EmailVerificationModel.findOne({verificationCode : verificationCode}, function (err,res){
      if (err) callback(err,null);
      else callback(null,res);
  });
}

EmailVerificationDB.updateStatus = function (verificationCode,userId,callback){
  this.EmailVerificationModel.findOneAndUpdate({
      verificationCode : verificationCode,
      userId : userId,
      status : false
    },{$set:{status:true}}, function (err,res){
      if (err) callback(err,null);
      else callback(null,res);
  });
}



module.exports = EmailVerificationDB;
