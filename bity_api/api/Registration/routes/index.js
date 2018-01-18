
var UserProfileDB = require('../../../dal/UserProfileDB');
var userAuthDB = require('../../../dal/UserAuthenticationDB');
var UserLoginDB = require('../../../dal/UserLoginDB');
var TransactionDB = require('../../../dal/TransactionDB');
var EmailVerificationDB = require('../../../dal/EmailVerificationDB');

var RegistrationController = new (require('../controllers/index'))(userAuthDB,UserProfileDB,UserLoginDB,TransactionDB,EmailVerificationDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);

app.post('/api/userRegister', RegistrationController.registration);
app.post('/api/registerWithGoogle', RegistrationController.googleRegistration);
app.post('/api/registerWithFacebook', RegistrationController.facebookRegistration);
app.get('/api/verifyEmail/:userEmail',RegistrationController.resendVerifyEmail);
app.get('/bityo/verifyEmail/:verificationId',RegistrationController.verifyEmail);
