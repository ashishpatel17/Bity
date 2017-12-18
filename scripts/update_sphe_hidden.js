/**
 * Created by nvargas on 10/26/17.
 */
var config = require('./config')();
var dbconn = require('./dbconnection.js');
var _ = require('underscore');

dbconn.Init(config.url, function(){

    var SroAssetDB = require('./dal/SroAssetDB');

    SroAssetDB.SroAssetModel.find({
            $and: [{
                AppKeyList: {
                    $elemMatch: {
                        AppKey: 'SPT',
                        AssignedChannels: {$in: ['NATPE','WAGPremiere','LatAmSalesExclusive','Non-Finals','SuperDuperHiddenStuff','SalesExclusive']}
                    }
                }}, {AppKeyList: {
                $elemMatch: {
                    AppKey: 'SPHE',
                    Hidden: null
                }
            }}], IsActive: true, IsDeleted: false, AreStreamsAvailable: true})
        .cursor()
        .on('data', function(doc) {
            var sptAppKeyData = _.findWhere(doc.AppKeyList, {AppKey: 'SPT'});
            if (sptAppKeyData && typeof sptAppKeyData !== 'undefined') {

                var hidden = sptAppKeyData.Hidden == 'SPT' ? 'SPHE' : sptAppKeyData.Hidden;

                if (sptAppKeyData.AssignedChannels.indexOf('NATPE') >= 0 ||
                    sptAppKeyData.AssignedChannels.indexOf('WAGPremiere') >= 0 ||
                    sptAppKeyData.AssignedChannels.indexOf('LatAmSalesExclusive') >= 0 ||
                    sptAppKeyData.AssignedChannels.indexOf('Non-Finals') >= 0 ||
                    sptAppKeyData.AssignedChannels.indexOf('SuperDuperHiddenStuff') >= 0 ||
                    sptAppKeyData.AssignedChannels.indexOf('SalesExclusive') >= 0)
                    hidden = 'SPHE';

                var spheAppKeyData = {
                    AppKey: 'SPHE',
                    PublishDate: sptAppKeyData.PublishDate,
                    DefaultCategory: sptAppKeyData.DefaultCategory,
                    AssignedChannels: [ sptAppKeyData.DefaultCategory ],
                    Hidden: hidden
                };

                SroAssetDB.removeSpheAppKeyList(doc._id, function(err) {
                    if (err) console.log('failed for asset id: ', doc._id);
                    else {
                        SroAssetDB.updateSpheAppKeyList(doc._id, spheAppKeyData, function(err) {
                            if (err) console.log('failed for asset id: ', doc._id);
                            else console.log('updated id: ' + doc._id);
                        });
                    }
                });


            } else {
                console.log('no SPT data found for: ' + doc._id);
            }
        });
});