var mongoose = require('mongoose');
var UserAuthDB = require('./dal/UserAuthenticationDB.js');
var UserLoginDB = require('./dal/UserLoginDB');
var UserProfileDB = require('./dal/UserProfileDB');
var ProductDB = require('./dal/ProductDB');
var CategoryDB = require('./dal/CategoryDB');
var TransactionDB = require('./dal/TransactionDB');
var ThreadListDB = require('./dal/ThreadListDB');
var ThreadMessageDB = require('./dal/ThreadMessageDB');
var EmailVerificationDB = require('./dal/EmailVerificationDB');
var ForgotPasswordDB = require('./dal/ForgotPasswordDB');

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
        ThreadListDB.Init(DBConnection.connection);
        ThreadMessageDB.Init(DBConnection.connection);
        EmailVerificationDB.Init(DBConnection.connection);
        ForgotPasswordDB.Init(DBConnection.connection);
        done();
    });
};

module.exports = DBConnection;
