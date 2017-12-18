/**
 * Created by nvargas on 11/1/17.
 */
var csv = require('fast-csv');
var config = require('./config.js')();
var fs = require('fs');
var json2csv = require('json2csv');
var dbconn = require('./dbconnection.js');

dbconn.Init(config.url, function(){

    var SroAssetDB = require('./dal/SroAssetDB');
    csv
        .fromPath("./files/update_damassets.csv", {headers: true})
        .on("data", function(data){

            var oldDamAssetId = data.OldDamAssetId;
            var newDamAssetId = data.NewDamAssetId;

            SroAssetDB.updateDamAssetId(oldDamAssetId, newDamAssetId, function(err) {
                if (err) console.log('failed for dam asset id: ', oldDamAssetId);
                else console.log('updated dam asset id: ' + newDamAssetId);
            });

        });
});