
var userAuthDB = require('../../../dal/userAuthenticationDB'),
    userLoginDB = require('../../../dal/userLoginDB'),
    userProfileDB = require('../../../dal/userProfileDB');

var loginController = new (require('../controllers/index'))(userAuthDB, userLoginDB, userProfileDB);

app.post('/api/login', loginController.login);
// app.get('/api/logout', loginController.logout);
// app.use('/api', loginController.validateSession);
// app.get('/api/refreshToken', loginController.refreshToken);
