var config = require('./config')();
var dbconn = require('./dbconnection.js');
var SroAssetDB = require('./dal/SroAssetDB');
var csv = require('fast-csv');
var json2csv = require('json2csv');
var fs = require('fs');

dbconn.Init(config.url, function () {

    var promiseFunctions = [];
    var func = function (assetData) {
        return new Promise(function (resolve) {
            SroAssetDB.updateSingleAsset({
                DamAssetId: assetData.ASSETID,
                "AppKeyList.AppKey": "SPT"
            }, { $set: { "AppKeyList.$.Description": assetData.SRO_CUSTOM_DESCRIPTION } }, function (updateErr) {
                if (updateErr) {
                    resolve(assetData.DamAssetId + " - error");
                } else {
                    resolve(assetData.DamAssetId);
                }
            })
        })
    };

    csv
        .fromPath("./files/asset_description.csv", {headers: true})
        .on("data", function (data) {
            promiseFunctions.push(func(data))
        })
        .on("end", function () {
            Promise.all(promiseFunctions).then(function (result) {
                var failed = [];
                var updated = [];
                result.forEach(function (rec) {
                    if (result.indexOf("error") == -1) {
                        updated.push(rec);
                    } else {
                        failed.push({"asset_id": rec.substr(0, rec.indexOf(" - error"))});
                    }
                });
                console.log("--------------------Completed------------------------");
                if (failed.length > 0) {
                    var result = json2csv({data: failed, fields: ["asset_id"]});
                    fs.appendFile('./files/failed_asset_add_description.csv', result, function () {
                        console.log('find user asset to update in failed_asset_add_description.csv file');
                    });
                }
            })
        });
});
