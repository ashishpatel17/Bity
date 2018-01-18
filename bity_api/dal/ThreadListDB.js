var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'thread_list';

function ThreadListDB(){}

ThreadListDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.ThreadListModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.ThreadListSchema = new Schema({
                _id: Schema.ObjectId
                , participants:[{
                  userId : Schema.ObjectId,
                  userName : String,
                  userEmail : String,
                  userProfilePic : String
                }]
                , lastMessage:{
                    messageId: Schema.ObjectId
                    , senderId: Schema.ObjectId
                    , status : String
                    , message : String
                    , dateTime : Date
                }
            }, {collection: collection});
            this.ThreadListModel = con.model(collection, this.ThreadListSchema);
        }
    }
};

ThreadListDB.getThreadById = function (id,callback){
    this.ThreadListModel.findOne({_id:id},function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

ThreadListDB.updateLastMessage = function (id,obj,callback){
    this.ThreadListModel.findOneAndUpdate({_id:id},{lastMessage:obj},function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

ThreadListDB.updateThread = function (id,obj,callback){
    this.ThreadListModel.findOneAndUpdate({_id:id},obj,function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

ThreadListDB.insertThread = function (obj,callback){
    this.ThreadListModel.collection.insert(obj,function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

ThreadListDB.getUserThreads = function (userId,callback){
    this.ThreadListModel.find({"participants.userId":userId},function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

ThreadListDB.getThreadByParticipant = function (particiantArr,callback){
    this.ThreadListModel.findOne({"participants.userId":{"$all":particiantArr}},function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
}

module.exports = ThreadListDB;
