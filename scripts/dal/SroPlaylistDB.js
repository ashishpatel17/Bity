/**
 * Created by nvargas on 8/2/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'sro_playlist';

function SroPlaylistDB() {
}

SroPlaylistDB.Init = function (con) {
    try {
        if (mongoose.model(collection)) {
            this.SroPlaylistModel = mongoose.model(collection);
        }
    } catch (e) {
        this.SroPlaylistSchema = new Schema({
            _id: Schema.ObjectId
            , ExternalPlaylistId: String
            , Name: String
            , CreatedBy: String
            , RecipientInfo: [
                new Schema({
                    EmailId: String,
                    UserName: String,
                    Link: String,
                    Expiry: Date,
                    ClickedFromEmail: Boolean,
                    ThumbnailRequired: Boolean,
                    ReceiptRequired: Boolean
                }, {_id: false})
            ]
            , CreatedOn: Date
            , LastUpdatedDate: Date
            , AssetIds: [Schema.ObjectId]
            , IsDeleted: Boolean
            , UpdatedBy: String
        }, {
            collection: collection,
            versionKey: false
        });
        this.SroPlaylistModel = con.model(collection, this.SroPlaylistSchema);
    }
};

SroPlaylistDB.getPlaylist = function (playlistId, callback){
    this.SroPlaylistModel.find({ExternalPlaylistId: playlistId}).lean().exec(function (err, result){
        if (err) callback(err);
        else callback(null, result);
    });
};

SroPlaylistDB.savePlaylist = function (obj, callback){
    this.SroPlaylistModel.collection.save(obj, function (err, result){
        if (err) callback(err,null);
        else {
            callback(null, result);
        }
    });
};

SroPlaylistDB.insertPlaylist = function (objArr, callback){
    this.SroPlaylistModel.collection.insert(objArr, function (err, result){
        if (err) callback(err,null);
        else {
           console.info( 'potatoes were successfully stored.', result.length);
            callback(null, result);
        }
    });
};


SroPlaylistDB.updatePlaylistAssets = function (externalPlaylistId, assetIds, callback) {
console.log(externalPlaylistId + " SroPlaylistDB.updatePlaylistAssets");
    this.SroPlaylistModel.findOneAndUpdate({
        ExternalPlaylistId: externalPlaylistId,
        IsDeleted: false
    }, {$set: {AssetIds: assetIds, LastUpdatedDate: new Date()}}, {new: true}, function (err, obj) {
        if (err) callback(err, null);
        else callback(null, obj);
    });
}

SroPlaylistDB.updatePlaylistRecipient = function (externalPlaylistId, recipient, callback) {

  /**  this.SroPlaylistModel.findOneAndUpdate({'ExternalPlaylistId': externalPlaylistId.toString()},
    {  $set:{'UpdatedBy': 'kkaushik'}}, function (err, obj) {
          if (err) callback(err, null);
          else{ callback(null, obj)
            console.log(obj);
          };
      });
**/
     //console.log(typeof externalPlaylistId);
     //console.log(typeof recipient);
    this.SroPlaylistModel.collection.update({'ExternalPlaylistId': externalPlaylistId },
        {'$addToSet': {'RecipientInfo':recipient },
        $set: {
          UpdatedBy: "kkaushik"
        }
      }, function (err, obj) {
            if (err) callback(err, null);
            else{ callback(null, obj)
            //  console.log(obj);
            };
        });

   }


module.exports = SroPlaylistDB;
