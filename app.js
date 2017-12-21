/**
 * Module dependencies.
 */
var config = require('./bity_api/config')();
var frameguard = require('frameguard');

var express = require('express');
var cors = require('cors');
const webpack = require('webpack');

var http = require('http');
var server = require('https');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var fileUpload = require('express-fileupload');

var app = module.exports =  express()
  , fs = require('fs')
  , port = 8080
  , path = require('path');

var hsts = require('hsts');
app.use(hsts({
    maxAge: 31536000  // 1 year in seconds
}));

http.globalAgent.maxSockets = 50;
server.globalAgent.maxSockets = 50;
app.set('jsonp callback', true);
app.set('env', 'production');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(frameguard({ action: 'deny' }));
app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

var whitelist = ['http://localhost:8080'];
var corsOptionsDelegate = function(req, callback) {
    var corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1){
        corsOptions = {
            origin: true
            , methods: ['GET', 'PUT', 'POST']
            , exposedHeaders: ['x-access-token', 'x-refresh-token', 'set-cookie', 'X-Powered-By']
            , allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Login', 'Device', 'x-refresh-token', 'set-cookie']
            , credentials: true
        }
    } else {
        corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options Really??
};

app.all('*', function(req, res, next){

    if (!req.get('Origin')) return next();

    res.set('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', req.get('Access-Control-Request-Headers'));

    res.set('Access-Control-Allow-Credentials', 'true');
    if ('OPTIONS' == req.method) return res.sendStatus(200);

    next();
});

app.use(cors(corsOptionsDelegate));

var hsts = require('hsts');
app.use(hsts({
    maxAge: 31536000  // 1 year in seconds
}));

var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var dbconn = require('./bity_api/dbconnection.js');

app.use(session({
    secret: config.sessionSecretKey,
    saveUninitialized: false,
    resave: false,
    rolling: true,
    cookie: {
        maxAge: config.cookieSessionTimeoutInMinutes * 60 * 1000,
        httpOnly: true,
        secure: false,
        samesite: false,
        path:'/'
    },
    store: new mongoStore({
        url: config.url
    })
}));

dbconn.Init(config.url, function(){
    console.log('mobile api v2 db connected');
});

var sessionApi = require('./bity_api/api/Session/index');
app.use(sessionApi);

var UserProfileApi = require('./bity_api/api/UserProfile/index');
app.use(UserProfileApi);

var ProductApi = require('./bity_api/api/Product/index');
app.use(ProductApi);

var RegistrationApi = require('./bity_api/api/Registration/index');
app.use(RegistrationApi);

var UserReviewApi = require('./bity_api/api/UserReview/index');
app.use(UserReviewApi);

app.options('*', cors(corsOptionsDelegate));

http.createServer(app).listen(port);
console.log("[INFO] App - Server is listening on port %d in %s mode.", port, app.settings.env);
