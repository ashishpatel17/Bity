
var UserProfileDB = require('../../../dal/UserProfileDB');
var userAuthDB = require('../../../dal/UserAuthenticationDB');
var UserLoginDB = require('../../../dal/UserLoginDB');
var ProductDB = require('../../../dal/ProductDB');

var WishlistController = new (require('../controllers/index'))(UserProfileDB,ProductDB);
var loginController = new (require('../../Session/controllers/index'))(userAuthDB, UserLoginDB, UserProfileDB);

app.get('/api/addToWishlist/:userId/:productId',loginController.validateSession,WishlistController.addToWishlist);
app.get('/api/deleteFromWishlist/:userId/:productId',loginController.validateSession,WishlistController.deleteWishlist);
app.get('/api/getWishList/:userId/:pageSize?/:pageNumber?',loginController.validateSession,WishlistController.getWishList);
