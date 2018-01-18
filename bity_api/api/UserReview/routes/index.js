
var UserProfileDB = require('../../../dal/UserProfileDB');
var userAuthDB = require('../../../dal/UserAuthenticationDB');
var UserLoginDB = require('../../../dal/UserLoginDB');
var TransactionDB = require('../../../dal/TransactionDB');

var UserReviewController = new (require('../controllers/index'))(userAuthDB,UserProfileDB,UserLoginDB,TransactionDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);


app.post('/api/publishReview',loginController.validateSession,UserReviewController.publishReview);
app.get('/api/getUserReview/:userId/:pageSize?/:pageNumber?',loginController.validateSession,UserReviewController.getUserReview);
