
var UserProfileDB = require('../../../dal/UserProfileDB');
var userAuthDB = require('../../../dal/UserAuthenticationDB');
var UserLoginDB = require('../../../dal/UserLoginDB');
var ProductDB = require('../../../dal/ProductDB');
var TransactionDB = require('../../../dal/TransactionDB');
var CategoryDB = require('../../../dal/CategoryDB');

var OrderController = new (require('../controllers/index'))(UserProfileDB,ProductDB,TransactionDB,CategoryDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);

app.get('/api/getOrderList/:userId/:orderType/:pageSize?/:pageNumber?',loginController.validateSession,OrderController.getOrderList);
app.get('/api/getOrderDetails/:orderId',loginController.validateSession,OrderController.getOrderDetails);
app.post('/api/changeOrderStatus',loginController.validateSession,OrderController.changeOrderStatus);
