/**
 * Created by nvargas on 10/6/17.
 */
var request = require('request');
var config = require('../config.js')();

var UpdatePlaylist = function(id, aids, callback) {

    var url = "https://adminapi.sonypicturessro.com/playlist/updateAssetsToPlaylist";

console.log(aids);
    var options = {
        body: JSON.stringify({
            "playlistId": id,
            "assetIds": aids
        }),
        headers: {
            "x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoic3ZjX3NybyIsImlhdCI6MTUxMDI3ODA3NSwiZXhwIjoxNTEwMjgxNjc1fQ._zPVeOUZlWQ1rQPyGc8TRxAXQKtgrNJYqaOW_4oi3OU",
            "Content-Type": "application/json"
        },
        rejectUnauthorized: false
    };

    request.post(
        url,
        options,
        function(err, res, body) {
          console.log(res.statusCode);
            if (!err && res.statusCode === 200) {
                callback(null, body);
                console.log();
            }
            else {
                console.log( err + ' retrying: ' + id);
                UpdatePlaylist(id, aids, function(err) {
                    if (err) callback(err, null);
                    else callback(null, body);
                });

            }
        }
    );
};

module.exports = UpdatePlaylist;
