
var UserProfileDB = require('../../../dal/UserProfileDB');
var userAuthDB = require('../../../dal/UserAuthenticationDB');
var UserLoginDB = require('../../../dal/UserLoginDB');
var CategoryDB = require('../../../dal/CategoryDB');
var CategoryController = new (require('../controllers/index'))(CategoryDB,UserProfileDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);

app.get('/api/getCategories/:pageSize?/:pageNumber?',loginController.validateSession,CategoryController.getCategories);
app.get('/api/getSubCategories/:categoryId/:pageSize?/:pageNumber?',loginController.validateSession,CategoryController.getSubCategories);
