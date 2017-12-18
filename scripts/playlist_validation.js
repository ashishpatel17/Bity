/**
 * Created by nvargas on 11/13/17.
 */
var csv = require('fast-csv');
var config = require('./config.js')();
var dbconn = require('./dbconnection.js');
var SroPlaylistDB = require('./dal/SroPlaylistDB');

dbconn.Init(config.url, function () {
    csv
        .fromPath("./files/user_playlist_validation.csv", {headers: true})
        .on("data", function(data){

            var playlistId = data.PLAYLIST_ID;
            SroPlaylistDB.getPlaylist(playlistId.toString(), function (err, playlist) {
                if (playlist.length == 0) {
                    console.log(playlistId);
                }
            });
        });
});