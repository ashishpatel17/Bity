
var userProfileDB = require('../../../dal/userProfileDB');
var userAuthDB = require('../../../dal/userAuthenticationDB');
var userLoginDB = require('../../../dal/userLoginDB');
var TransactionDB = require('../../../dal/TransactionDB');

var RegistrationController = new (require('../controllers/index'))(userAuthDB,userProfileDB,userLoginDB,TransactionDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, userLoginDB, userProfileDB);

app.post('/api/userRegister', RegistrationController.registration);
app.post('/api/registerWithGoogle', RegistrationController.googleRegistration);
app.post('/api/registerWithFacebook', RegistrationController.facebookRegistration);
