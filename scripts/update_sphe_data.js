/**
 * Created by nvargas on 9/21/17.
 */
var config = require('./config')();
var dbconn = require('./dbconnection.js');
var _ = require('underscore');

dbconn.Init(config.url, function(){

    var SroAssetDB = require('./dal/SroAssetDB');

    SroAssetDB.SroAssetModel.find({IsActive: true, IsDeleted: false, AreStreamsAvailable: true})
    .cursor()
    .on('data', function(doc) {
        var sptAppKeyData = _.findWhere(doc.AppKeyList, {AppKey: 'SPT'});
        var exists = _.findWhere(doc.AppKeyList, {AppKey: 'SPHE'});
        if (sptAppKeyData && typeof sptAppKeyData !== 'undefined' && !exists) {

            var spheAppKeyData = {
                AppKey: 'SPHE',
                PublishDate: sptAppKeyData.PublishDate,
                DefaultCategory: sptAppKeyData.DefaultCategory,
                AssignedChannels: [ sptAppKeyData.DefaultCategory ],
                Hidden: sptAppKeyData.Hidden == 'SPT' ? 'SPHE' : sptAppKeyData.Hidden
            };

            SroAssetDB.updateSpheAppKeyList(doc._id, spheAppKeyData, function(err) {
                if (err) console.log('failed for asset id: ', doc._id);
                else console.log('updated id: ' + doc._id);
            })
        } else {
            console.log('already exists: ' + doc._id);
        }
    });
});