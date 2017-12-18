/**
 * Created by nvargas on 9/21/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'sro_asset';

function SroAssetDB() {}

SroAssetDB.Init = function (con) {
    try {
        if (mongoose.model(collection)) {
            this.SroAssetModel = mongoose.model(collection);
        }
    } catch (e) {
        if (e.name === 'MissingSchemaError') {
            this.SroAssetSchema = new Schema({
                _id: Schema.ObjectId
                , DamAssetId: String
                , AirDate: Date
                , AssetRev: Number
                , AssetType: String
                , Cast: String
                , Chapter: String
                , Country: String
                , CreatedOn: Date
                , Directors: String
                , EpisodeName: String
                , EpisodeNumber: Number
                , EncodedThumbnail: String
                , Genre: String
                , GpmsId: Number
                , SeriesGpmsId: Number
                , SeasonGpmsId: Number
                , GroupGpmsId: Number
                , GuestStars: String
                , IsActive: Boolean
                , IsDeleted: Boolean
                , IsEvent: Boolean
                , IsInternational: Boolean
                , IsMobile: Boolean
                , IsPilot: Boolean
                , IsScripted: Boolean
                , LastModifiedOn: Date
                , MobilePublishedDate: Date
                , Producers: String
                , Rating: String
                , ReleasingStudio: String
                , Runtime: String
                , Season: Number
                , SeriesSynopsis: String
                , Subtitle: String
                , Synopsis: String
                , Thumbnail: String
                , Title: String
                , AlphaSortTitle: String
                , TotalSeasons: Number
                , Type: String
                , UsTheatricalReleaseDate: String
                , Channels: [String]
                , AppKeys: [String]
                , WatermarkGroupId: String
                , AreStreamsAvailable: Boolean
                , ErrorWatermarking: Boolean
                , Smartembedding: Boolean
                , UiCategory: String
                , IsWatermarkingRequired: Boolean
                , AppKeyList: [{
                    AppKey: String
                    , PublishDate: Date
                    , DefaultCategory: String
                    , AssignedChannels: [String]
                    , Hidden: String
                    , Description: String
                    , IsInternal: {type: Boolean, default: false}
                    , IsAvailableForPlaylist: {type: Boolean, default: false}
                    , CustomObject: Object
                }]
                , Streams: [{
                    Key: String
                    , DrmId: Number
                }]
                , UpdatedBy: String
            }, {collection: collection});
            this.SroAssetModel = con.model(collection, this.SroAssetSchema);
        }
    }
};

SroAssetDB.findByCriteria = function (criteria, callback) {
    this.SroAssetModel
        .find(criteria)
        //.sort(sortOrder)
        //.limit(carouselCount)
        .lean()
        .exec(function (err, doc) {
            if (err) callback(err);
            else {
                doc[0] instanceof mongoose.Document;// false
                callback(null, doc);
            }
        });
};

SroAssetDB.removeSpheAppKeyList = function(id, callback) {
    this.SroAssetModel.collection.update({ _id: id },
        { $pull: { AppKeyList: { AppKey: 'SPHE' } } },
        { multi: true },
        function(err) {
            if (err) callback(err);
            else callback(null);
        });
};

SroAssetDB.updateSpheAppKeyList = function(id, spheAppKeyData, callback) {
    this.SroAssetModel.collection.update({ _id: id },
    { $push: { "AppKeyList": spheAppKeyData } },
    { upsert: false },
    function(err) {
        if (err) callback(err);
        else callback(null);
    });
};

SroAssetDB.updateSingleAsset = function(condition ,dataObj ,callback){
    this.SroAssetModel.collection.update(condition, dataObj, { }, function (err){
        if (err) callback(err);
        else callback(null);
    });
};

SroAssetDB.updateDamAssetId = function(oldDamAssetId, newDamAssetId, callback) {
    this.SroAssetModel.findOneAndUpdate({DamAssetId: oldDamAssetId}, {$set: {DamAssetId: newDamAssetId, UpdatedBy: "script_migration"}}, function(err) {
        if (err) callback(err);
        else callback(null);
    });
};

module.exports = SroAssetDB;