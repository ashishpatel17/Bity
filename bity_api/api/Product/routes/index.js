
var UserProfileDB = require('../../../dal/UserProfileDB');
var userAuthDB = require('../../../dal/UserAuthenticationDB');
var UserLoginDB = require('../../../dal/UserLoginDB');
var ProductDB = require('../../../dal/ProductDB');
var CategoryDB = require('../../../dal/CategoryDB');
var ProductController = new (require('../controllers/index'))(ProductDB,UserProfileDB,CategoryDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);

app.get('/api/deleteProduct/:userId/:productId',loginController.validateSession,ProductController.deleteProduct);
app.get('/api/getProductDetails/:userId/:productId',loginController.validateSession,ProductController.getProductDetails);
app.get('/api/getProducts',loginController.validateSession,ProductController.getProducts);
app.get('/api/getUserStore/:userId/:pageSize?/:pageNumber?',loginController.validateSession,ProductController.getUserStore);
app.post('/api/publishProduct',loginController.validateSession,ProductController.publishProduct);
app.post('/api/makeOffer',loginController.validateSession,ProductController.makeOffer);
app.post('/api/reportProduct',loginController.validateSession,ProductController.reportProduct);
app.post('/api/editProduct',loginController.validateSession,ProductController.editProduct);
