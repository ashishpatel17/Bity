/**
 * Created by nvargas on 11/9/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'sr_spt_dam_asset';

// constructor
function DamAssetDB() {}

// public function
DamAssetDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.SroAssetModel = mongoose.model(collection);
        }
    } catch (e) {
        if (e.name === 'MissingSchemaError') {
            this.DamAssetSchema = new Schema({
                _id: Number,
                create_date: Date,
                last_updated_date: Date
            }, { collection: collection });
            this.DamAssetModel = con.model(collection, this.DamAssetSchema);
        }
    }
};

// public function
DamAssetDB.saveDamAsset = function (obj, callback){
    this.DamAssetModel.collection.updateOne({_id: obj._id}, obj, { upsert: true }, function (err, result){
        if (err) callback(err);
        else callback(null, result.value);
    });
};

module.exports = DamAssetDB;