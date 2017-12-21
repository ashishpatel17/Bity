
var userProfileDB = require('../../../dal/userProfileDB');
var userAuthDB = require('../../../dal/userAuthenticationDB');
var userLoginDB = require('../../../dal/userLoginDB');
var ProductDB = require('../../../dal/ProductDB');
var ProductController = new (require('../controllers/index'))(ProductDB,userProfileDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, userLoginDB, userProfileDB);

app.get('/api/getProductDetails/:productId',loginController.validateSession,ProductController.getProductDetails);
app.get('/api/getUserStore/:userId',loginController.validateSession,ProductController.getUserStore);
