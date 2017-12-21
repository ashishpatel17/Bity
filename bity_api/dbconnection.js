var mongoose = require('mongoose');
var UserAuthDB = require('./dal/userAuthenticationDB');
var UserLoginDB = require('./dal/userLoginDB');
var UserProfileDB = require('./dal/userProfileDB');
var ProductDB = require('./dal/ProductDB');
var CategoryDB = require('./dal/CategoryDB');
var TransactionDB = require('./dal/TransactionDB');

function DBConnection() {}

DBConnection.Init = function(url, done) {

    this.connection = mongoose.connect(url, {
        useMongoClient: true,
        socketTimeoutMS: 360000,
        connectTimeoutMS: 360000
    });
    mongoose.Promise = global.Promise;
    mongoose.connection.on('error', function (err) {
        console.error('MongoDB error: %s', err);
    });

    mongoose.connection.once('connected', function () {
        UserAuthDB.Init(DBConnection.connection);
        UserLoginDB.Init(DBConnection.connection);
        UserProfileDB.Init(DBConnection.connection);
        ProductDB.Init(DBConnection.connection);
        CategoryDB.Init(DBConnection.connection);
        TransactionDB.Init(DBConnection.connection);
        done();
    });
};

module.exports = DBConnection;
