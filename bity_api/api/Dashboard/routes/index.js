
var UserProfileDB = require('../../../dal/UserProfileDB');
var userAuthDB = require('../../../dal/UserAuthenticationDB');
var UserLoginDB = require('../../../dal/UserLoginDB');
var CategoryDB = require('../../../dal/CategoryDB');
var ProductDB = require('../../../dal/ProductDB');
var TransactionDB = require('../../../dal/TransactionDB');
var DashboardController = new (require('../controllers/index'))(CategoryDB,ProductDB,UserProfileDB,TransactionDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);


app.get('/api/getDashboardDetail/:userId',loginController.validateSession,DashboardController.getDashboardDetail);
