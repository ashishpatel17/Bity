module.exports = function(collection) {
    return {
        url : "mongodb://127.0.0.1:27017/bity_mobile_app"
        , collection: collection
        , accessTokenTimeoutInMinutes: 60
        , refreshTokenTimeoutInMinutes: 60 * 12
        , sessionSecretKey: "tokensecret"
        , cookieSessionTimeoutInMinutes: 60
        , profilePicturePath: "public/profile_picture/"
        , productPicturePath: "public/product_image/"
        , profilePicturePublicPath: "profile_picture/"
        , productPicturePublicPath: "product_image/"
        , profileDefaultImage : "defult_profile_picture.png"
        , productDefaultImage : "defult_product_picture.png"
    };
};
