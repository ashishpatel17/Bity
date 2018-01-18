var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'thread_message';

function ThreadMessageDB(){}

ThreadMessageDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.ThreadMessageModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.ThreadMessageSchema = new Schema({
                _id: Schema.ObjectId
                , sender: {
                  userId : Schema.ObjectId,
                  userName : String,
                  userEmail : String,
                  userProfilePic : String
                }
                , thread : Schema.ObjectId
                , status : String
                , message : String
                , dateTime : Date
            }, {collection: collection});
            this.ThreadMessageModel = con.model(collection, this.ThreadMessageSchema);
        }
    }
};

ThreadMessageDB.insertMessage = function (obj,callback){
    this.ThreadMessageModel.collection.insert(obj,function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

ThreadMessageDB.getThreadMessage = function (threadId,callback){
    this.ThreadMessageModel.find({thread:threadId},function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

module.exports = ThreadMessageDB;
