module.exports = function(collection) {
    return {
        url : "mongodb://127.0.0.1:27017/bity_mobile_app"
        , collection: collection
        , accessTokenTimeoutInMinutes: 60
        , refreshTokenTimeoutInMinutes: 60 * 12
        , sessionSecretKey: "tokensecret"
        , cookieSessionTimeoutInMinutes: 60
    };
};
