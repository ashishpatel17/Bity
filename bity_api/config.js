module.exports = function(collection) {
    return {
        url : "mongodb://127.0.0.1:27017/bity_mobile_app"
        , collection: collection
        , accessTokenTimeoutInMinutes: 60 * 12 //access token valid for 1 day
        , refreshTokenTimeoutInMinutes: "15 days" //refresh token valid for 15 days
        , sessionSecretKey: "tokensecret"
        , cookieSessionTimeoutInMinutes: 60
        , profilePicturePath: "public/profile_picture/"
        , productPicturePath: "public/product_image/"
        , profilePicturePublicPath: "profile_picture/"
        , productPicturePublicPath: "product_image/"
        , profileDefaultImage : "defult_profile_picture.png"
        , productDefaultImage : "defult_product_picture.png"
	      , validateToken : false
        , senderEmail : "ashish17dummy@gmail.com"
        , password : "patel123"
        , productPublishingDays : 30
        , fireBaseServerKey : "AAAA0OE0qE8:APA91bESIO5lRfXlaIfnQZVDKXpJfbuk0xJGbDAPxQg-AOJ9lFtDsxIbch3quwev9Ti-DimqXFwtsOxylEgYV5haH8gleqTaaASjJqilP0SipmWtbMgxovoG3DH1iewjfhf5YjNK3pSS"
        , orderStatus:{
          purchase:{
            pendingForLocalDeliveryConfirmation : "P",
            itemInMyPosetionPossession : "PI"
          },
          sales:{
            pendingForLocalDeliveryConfirmation : "P",
            itemInMyBuyerPossession : "I"
          }
        }
    };
};
