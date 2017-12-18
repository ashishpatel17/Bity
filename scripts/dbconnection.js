/**
 * Created by nvargas on 9/21/17.
 */
var mongoose = require('mongoose');
var SroAssetDB = require('./dal/SroAssetDB');
var SroUserRoleDB = require('./dal/SroUserRoleDB');
var SroPlaylistDB = require('./dal/SroPlaylistDB');
var DamAssetDB = require('./dal/DamAssetDB');

function DBConnection() {}

DBConnection.Init = function(url, done) {

    this.connection = mongoose.connect(url, {
        useMongoClient: true
    });
    mongoose.Promise = global.Promise;
    mongoose.connection.on('error', function(err) {
        console.error('MongoDB error: %s', err);
    });

    mongoose.connection.once('connected',function(){
        SroAssetDB.Init(DBConnection.connection);
        SroUserRoleDB.Init(DBConnection.connection);
        SroPlaylistDB.Init(DBConnection.connection);
        DamAssetDB.Init(DBConnection.connection);
        done();
    });
};

module.exports = DBConnection;