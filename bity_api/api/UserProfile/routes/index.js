
var UserProfileDB = require('../../../dal/UserProfileDB');
var userAuthDB = require('../../../dal/UserAuthenticationDB');
var UserLoginDB = require('../../../dal/UserLoginDB');
var TransactionDB = require('../../../dal/TransactionDB');
var ForgotPasswordDB = require('../../../dal/ForgotPasswordDB');
var EmailVerificationDB = require('../../../dal/EmailVerificationDB');

var UserProfileController = new (require('../controllers/index'))(userAuthDB,UserProfileDB,UserLoginDB,TransactionDB,ForgotPasswordDB,EmailVerificationDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);

app.post('/api/changepassword/:userId',loginController.validateSession,UserProfileController.changePassword);
// app.post('/api/resetPassword',UserProfileController.resetPassword);
app.get('/resetPasswordRequest',UserProfileController.resetPasswordRequest);
app.get('/api/forgotPassword/:userEmail',UserProfileController.forgotPassword);
app.post('/api/editProfile/:userId',loginController.validateSession,UserProfileController.editProfile);
app.get('/api/getMyProfile/:userId',loginController.validateSession,UserProfileController.getMyProfile);
app.get('/api/getUserProfile/:userId',loginController.validateSession,UserProfileController.getUserProfile);
app.get('/api/followSeller/:userId/:sellerId',UserProfileController.followSeller);
