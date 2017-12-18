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


function convertCsvToJson(dataArr) {
    var fields = dataArr[0];
    var objArray = [];
    for (var i = 1; i < dataArr.length; i++) {
        var dataObj = {};
        for (var r = 0; r < dataArr[i].length; r++) {
            dataObj[fields[r]] = dataArr[i][r]

        }
        objArray.push(dataObj);
    }
    return objArray;
}

dbconn.Init(config.url, function () {
    var sheet = xlsx.parse(fs.readFileSync(__dirname + '/files/121.xlsx'));
    var playListData = [];
    var successUpdate = [];
    var failedUpdate = [];
    var updateSeriesFunctions = [];
    var playlistAssetMap = [];

    for (var i = 0; i < sheet.length; i++) {
        if (sheet[i].name == "Playlist Asset Details Updated") {
            playListData = convertCsvToJson(sheet[i].data);
        }
    }

    function updatePlayList(playlistId,assetsIds){
      return function(callback){
        SroPlaylistDB.updatePlaylistAssets(playlistId,assetsIds,function(err,res){
          if(res){
            successUpdate.push(playlistId);
            callback(null,playlistId);
          }else{
            failedUpdate.push(playlistId);
            callback(null,playlistId);
          }
        })
      }
    }

    async.each(playListData,function(rec,callback){
      if(rec.PLAYLIST_ID && rec.PLAYLIST_ASSETS_WITH_DMR_ID){
        var playlistId = rec.PLAYLIST_ID;
        var dammAssetid = rec.PLAYLIST_ASSETS_WITH_DMR_ID.split(',');
        SroAssetDB.findByCriteria({DamAssetId:{$in:dammAssetid}}, function (err, res) {
        if(res!=null && res!=undefined && res.length>0){
            var assetIds = [];
            res.forEach(function(asset){
              assetIds.push(asset._id);
            })
            updateSeriesFunctions.push(updatePlayList(playlistId,assetIds))
         }
         callback();
        })
      }else{
        callback();
      }
    },function(err,res){
      async.parallel(updateSeriesFunctions,function(err,results){
        var len = 0;
        if(successUpdate.length>failedUpdate.length){
          len = successUpdate.length;
        }else{
          len = failedUpdate.length;
        }
        var csvString = "Success,Failed\n";
        for(var i=0;i<len;i++){
          csvString += (successUpdate[i]!=undefined?successUpdate[i]:"")+","+(failedUpdate[i]!=undefined?failedUpdate[i]:"")+"\n";
        }

        fs.writeFileSync('successPlaylistUpdate.csv', csvString);
        console.log("Completed");
      })
    })
  });
