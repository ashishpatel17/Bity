var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'forgot_password_request';

function ForgotPasswordDB(){}

ForgotPasswordDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.ForgotPasswordModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.ForgotPasswordSchema = new Schema({
                _id: Schema.ObjectId
                , userId: Schema.ObjectId
                , requestCode : String
                , status : Boolean
                , createdDate : Date
            }, {collection: collection});
            this.ForgotPasswordModel = con.model(collection, this.ForgotPasswordSchema);
        }
    }
};

ForgotPasswordDB.insertForgotPassword = function (insObj,callback){
  this.ForgotPasswordModel.collection.insert(insObj,{setDefaultsOnInsert: true}, function (err,res){
      if (err) callback(err,null);
      else callback(null,res);
  });
}

ForgotPasswordDB.getByVerificationCode = function (verificationCode,callback){
  this.ForgotPasswordModel.findOne({verificationCode : verificationCode}, function (err,res){
      if (err) callback(err,null);
      else callback(null,res);
  });
}

ForgotPasswordDB.updateStatus = function (verificationCode,userId,callback){
  this.ForgotPasswordModel.findOneAndUpdate({
      requestCode : verificationCode,
      userId : userId,
      status : false
    },{$set:{status:true}}, function (err,res){
      if (err) callback(err,null);
      else callback(null,res);
  });
}



module.exports = ForgotPasswordDB;
