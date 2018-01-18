
var UserProfileDB = require('../../../dal/UserProfileDB');
var userAuthDB = require('../../../dal/UserAuthenticationDB');
var UserLoginDB = require('../../../dal/UserLoginDB');
var ThreadListDB = require('../../../dal/ThreadListDB');
var ThreadMessageDB = require('../../../dal/ThreadMessageDB');
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);
var MessageController = new (require('../controllers/index'))(UserProfileDB,ThreadListDB,ThreadMessageDB);

app.get('/api/getThreads/:userId/:pageSize?/:pageNumber?',loginController.validateSession,MessageController.getThreads);
app.post('/api/sendMessage',loginController.validateSession,MessageController.sendMessage);
app.get('/api/getMessage',loginController.validateSession,MessageController.getMessage);
