
var userAuthDB = require('../../../dal/UserAuthenticationDB'),
    UserLoginDB = require('../../../dal/UserLoginDB'),
    UserProfileDB = require('../../../dal/UserProfileDB');

var loginController = new (require('../controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);

app.post('/api/login', loginController.login);
app.post('/api/loginWithGoogle', loginController.loginWithGoogle);
app.post('/api/loginWithFacebook', loginController.loginWithFacebook);
app.post('/api/logout', loginController.logout);
// app.use('/api', loginController.validateSession);
