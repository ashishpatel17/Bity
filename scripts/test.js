var dbconn = require('./dbconnection.js');
var config = require('./config')();
var SroPlaylistDB = require('./dal/SroPlaylistDB');
var SroAssetDB = require('./dal/SroAssetDB');
var mongoose = require('mongoose');
var async = require('async');
var _ = require('underscore');
var xlsx = require('node-xlsx');
var fs = require("fs");
var updatePlaylistApi = require('./sal/UpdatePlaylist');

var seqqueue = require('seq-queue');

var queue = seqqueue.createQueue(10000);

function convertCsvToJson(dataArr) {
    var fields = dataArr[0];
    var objArray = [];
    for (var i = 1; i < dataArr.length; i++) {
        //for (var i = 1; i <= 2; i++) {
        var dataObj = {};
        for (var r = 0; r < dataArr[i].length; r++) {
            dataObj[fields[r]] = dataArr[i][r]
        }
        console.log(dataObj);
        objArray.push(dataObj);
    }
    return objArray;
}

dbconn.Init(config.url, function () {
    var sheet = xlsx.parse(fs.readFileSync(__dirname + '/files/playlist_assets_111417.xlsx'));
    var playListData = [];
    var successUpdate = [];
    var failedUpdate = [];
    var updateSeriesFunctions = [];
    var playlistAssetMap = [];

    for (var i = 0; i < sheet.length; i++) {
        if (sheet[i].name == "Sheet1") {
            playListData = convertCsvToJson(sheet[i].data);
        }
    }

    function runQueue(id, lsAsset) {
        queue.push(
            function (task) {
                console.log(id + " here " + lsAsset);
                SroPlaylistDB.updatePlaylistAssets(id, lsAsset, function (err, res) {
                    if (err) {
                        //successUpdate.push(playlistId);
                        //callback(null,playlistId);
                        console.log("failed " + id + ' ' + lsAsset);
                        task.done();

                    } else {
                        //failedUpdate.push(playlistId);
                        //callback(null,playlistId);
                        console.log("Success " + id + ' ' + lsAsset);
                        task.done();

                    }
                })
            },
            function () {
                console.log('task timeout');
            },
            120000
        );
    }

    playListData.forEach(function (rec) {
        console.log(rec.PLAYLIST_ID);
        if (rec.PLAYLIST_ID && rec.RUNNER_ID) {
            var playlistId = rec.PLAYLIST_ID.toString();
            var dammAssetids = rec.RUNNER_ID.split(',');
            dammAssetids.forEach(function(value, index){ dammAssetids[index] = value + 'rid'; });
            SroAssetDB.findByCriteria({DamAssetId: {$in: dammAssetids}}, function (err, res) {
                if (res != null && res != undefined && res.length > 0) {
                    var assetIds = [];
                    res.forEach(function (asset) {
                        assetIds.push(asset._id);
                    });
                    //updatePlayList(playlistId,assetIds)
                    runQueue(playlistId, assetIds);
                }
            })
        } else {
            console.log("not found");
        }
    });
});
