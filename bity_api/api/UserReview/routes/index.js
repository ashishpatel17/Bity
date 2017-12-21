
var userProfileDB = require('../../../dal/userProfileDB');
var userAuthDB = require('../../../dal/userAuthenticationDB');
var userLoginDB = require('../../../dal/userLoginDB');
var TransactionDB = require('../../../dal/TransactionDB');

var UserReviewController = new (require('../controllers/index'))(userAuthDB,userProfileDB,userLoginDB,TransactionDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, userLoginDB, userProfileDB);


app.post('/api/publishReview',loginController.validateSession,UserReviewController.publishReview);
