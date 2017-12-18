
var userProfileDB = require('../../../dal/userProfileDB');
var userAuthDB = require('../../../dal/userAuthenticationDB');
var userLoginDB = require('../../../dal/userLoginDB');
var UserProfileController = new (require('../controllers/index'))(userAuthDB,userProfileDB,userLoginDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, userLoginDB, userProfileDB);

app.post('/api/userRegister', UserProfileController.registration);
app.post('/api/changepassword',loginController.validateSession,UserProfileController.changePassword);
app.post('/api/editProfile',loginController.validateSession,UserProfileController.editProfile);
app.post('/api/registerWithGoogle', UserProfileController.googleRegistration);
app.post('/api/registerWithFacebook', UserProfileController.facebookRegistration);
