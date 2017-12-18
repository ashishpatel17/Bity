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
      //for (var i = 1; i <= 40; i++) {
        var dataObj = {};
        for (var r = 0; r < dataArr[i].length; r++) {
            dataObj[fields[r]] = dataArr[i][r]

        }
        //console.log(dataObj);
        objArray.push(dataObj);
    }
    return objArray;
}

dbconn.Init(config.url, function () {
    var sheet = xlsx.parse(fs.readFileSync(__dirname + '/files/up.xlsx'));
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

    function runQueue(id, recp){
      queue.push(
        function(task) {
          //console.log(id +  " here " + recp);
          SroPlaylistDB.updatePlaylistRecipient(id,recp,function(err,res){
            if(err){
              //successUpdate.push(playlistId);
              //callback(null,playlistId);
              console.log("failed " + id + err);
              task.done();

            }else{
              //failedUpdate.push(playlistId);
              //callback(null,playlistId);
              console.log("Success " + id);
              task.done();

            }
          })
        },
        function() {
          console.log('task timeout');
        },
        120000
      );


    }

    playListData.forEach(function(rec){
      console.log(rec.PLAYLIST_ID);
      if(rec.PLAYLIST_ID && rec.USER_NAME){
        var playlistId = rec.PLAYLIST_ID.toString();

        //new code
        var reciObj = {};
        reciObj.ReceiptRequired = Boolean(rec.RECEIPT_REQUIRED);
        reciObj.ThumbnailRequired = Boolean(rec.THUMBNAIL_REQUIRED);
        reciObj.ClickedFromEmail = false;
        reciObj.Expiry = rec.EXPIRE_DATE;
        reciObj.Link = "";
        reciObj.UserName = rec.USER_NAME ? rec.USER_NAME : rec.RECIPIENT_EMAIL;
        reciObj.EmailId = rec.WORK_EMAIL;
        //recipientInfo.push(reciObj);
        console.log(reciObj.toString());
        runQueue(playlistId,reciObj);
        //ends here

      }else{
        console.log("not found");
      }
   });

   /**playListData.forEach(function(rec){
     console.log(rec.PLAYLIST_ID);
     if(rec.PLAYLIST_ID && rec.USER_NAME){
       var playlistId = rec.PLAYLIST_ID.toString();

       //new code
       var reciObj = {};
       reciObj.ReceiptRequired = Boolean(rec.RECEIPT_REQUIRED);
       reciObj.ThumbnailRequired = Boolean(rec.THUMBNAIL_REQUIRED);
       reciObj.ClickedFromEmail = false;
       reciObj.Expiry = rec.EXPIRE_DATE;
       reciObj.Link = "";
       reciObj.UserName = rec.USER_NAME ? rec.USER_NAME : rec.RECIPIENT_EMAIL;
       reciObj.EmailId = rec.WORK_EMAIL;
       //recipientInfo.push(reciObj);
       console.log(reciObj.toString());
       runQueue(playlistId,reciObj);
       //ends here

     }else{
       console.log("not found");
     }
  });**/

  });
