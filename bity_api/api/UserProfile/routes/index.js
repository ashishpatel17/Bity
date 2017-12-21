
var userProfileDB = require('../../../dal/userProfileDB');
var userAuthDB = require('../../../dal/userAuthenticationDB');
var userLoginDB = require('../../../dal/userLoginDB');
var TransactionDB = require('../../../dal/TransactionDB');

var UserProfileController = new (require('../controllers/index'))(userAuthDB,userProfileDB,userLoginDB,TransactionDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, userLoginDB, userProfileDB);

app.post('/api/changepassword',loginController.validateSession,UserProfileController.changePassword);
app.post('/api/editProfile',loginController.validateSession,UserProfileController.editProfile);
app.get('/api/getMyProfile/:userId',loginController.validateSession,UserProfileController.getMyProfile);
app.get('/api/getUserProfile/:userId',loginController.validateSession,UserProfileController.getUserProfile);
app.get('/api/followSeller/:sellerId',UserProfileController.followSeller);
