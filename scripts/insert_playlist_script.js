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
    var sheet = xlsx.parse(fs.readFileSync(__dirname + '/files/Playlist_11092017.xlsx'));
    var playListData = [];
    var playListRecipientData = [];

    for (var i = 0; i < sheet.length; i++) {
        if (sheet[i].name == "Playlist Asset Details Updated") {
            playListData = convertCsvToJson(sheet[i].data);
        } else if (sheet[i].name == "Playlist Share Detail") {
            playListRecipientData = convertCsvToJson(sheet[i].data);
        }
    }

var dammAssetid = [];

    for (var i = 0; i <2 ; i++) {

         var tempData=[];
        if (playListData[i].PLAYLIST_ASSETS_WITH_DMR_ID) {
            var strToArr = playListData[i].PLAYLIST_ASSETS_WITH_DMR_ID.split(',');
            tempData = tempData.concat(strToArr);
            dammAssetid = dammAssetid.concat(strToArr);
        }
        if(playListData[i].PLAYLIST_ASSETS_WITH_RUNNER_ID) {
            var strToArr1 = playListData[i].PLAYLIST_ASSETS_WITH_RUNNER_ID.split(',');

            var addRid = strToArr1.map(function(id){return id+'rid'})
            tempData = tempData.concat(addRid);
            dammAssetid = dammAssetid.concat(addRid);

        }
        console.log(tempData);
        playListData[i]["dammAssetid"] = tempData;

    }





console.log(dammAssetid);
    SroAssetDB.findByCriteria({DamAssetId: {$in: [dammAssetid]}}, function (err, res) {
        if (err) {
            console.log("Unable to get asset details");
        } else {
          //  console.log("got the asset details");
            var assetData = res;
            var promiseFunctions = [];
            for (var i =0; i < 2; i++) {
                var recipientInfo = [];
                playListRecipientData.forEach(function (rec) {
                    if (rec.PLAYLIST_ID == playListData[i].PLAYLIST_ID) {
                        var reciObj = {};
                        reciObj.ReceiptRequired = Boolean(rec.RECEIPT_REQUIRED);
                        reciObj.ThumbnailRequired = Boolean(rec.THUMBNAIL_REQUIRED);
                        reciObj.ClickedFromEmail = false;
                        reciObj.Expiry = new Date(rec.EXPIRE_DT.replace(/\./g, ":"));
                        reciObj.Link = "";
                        reciObj.UserName = rec.USER_NAME ? rec.USER_NAME : rec.RECIPIENT_EMAIL;
                        reciObj.EmailId = rec.RECIPIENT_EMAIL;
                        recipientInfo.push(reciObj);
                    }

                });


                var playlistAssets = [];
                console.log(assetData);
                dammAssetid.forEach(function (aid) {

                    if (playListData[i].dammAssetid && playListData[i].dammAssetid.indexOf(aid) > -1) {
                    console.log("asset match");
                        playlistAssets.push(aid);
                    }
                });

                updatePlaylistApi(playListData[i].PLAYLIST_ID.toString(), playlistAssets, function(err) {
                    if (err) {
                        console.log('failed to add assets to playlist : ' + playListData[i].PLAYLIST_ID.toString() + ' '+ playlistAssets);

                      }else{
                          console.log('success in adding assets to playlist : ' + playListData[i].PLAYLIST_ID.toString() + ' '+ playlistAssets);
                      }
                    });
                };
            }

      });

  });
                  /**  var insertDataObj = {};
                    insertDataObj.ExternalPlaylistId = playListData[i].PLAYLIST_ID.toString();
                    insertDataObj.Name = playListData[i].PLAYLIST_NAME;
                    insertDataObj.CreatedBy = playListData[i].CREATED_BY;
                    insertDataObj.CreateDate = playListData[i].CREATED_DT;
                    insertDataObj.IsDeleted = false;
                    insertDataObj.LastUpdatedDate = playListData[i].CREATED_DT;
                    insertDataObj.RecipientInfo = recipientInfo;
                    insertDataObj.AssetIds = playlistAssets;
                    //console.log('insertDataObj', insertDataObj)
                    promiseFunctions.push(insertDataObj);
                    console.log(i)**/
                    //func(insertDataObj);
