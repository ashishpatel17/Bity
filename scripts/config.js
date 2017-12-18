/**
 * Created by nvargas on 9/21/17.
 */
module.exports = function() {
    return {
        // QA
        //url : 'mongodb://rootadmin:password@db1-1155819335.us-west-1.elb.amazonaws.com:27017/dbo_dmg?authSource=admin',
        //url : 'mongodb://rootadmin:password@db2-929437898.us-west-1.elb.amazonaws.com:27017/dbo_dmg?authSource=admin',
        //createNewUserApiEndpoint: 'https://adminapi-qa.sonypicturessro.com/admin/CreateNewUser',
        //loginUri: 'https://svc_sro:aKMx=KQ5GN3jvG_E@adminapi-qa.sonypicturessro.com/admin/login'

        //PROD
        url : 'mongodb://dbo_dmg:ej7pww6qmf3j@db1-1222299832.us-west-1.elb.amazonaws.com:27017/dbo_dmg?authSource=dbo_dmg',
        //url : 'mongodb://dbo_dmg:ej7pww6qmf3j@db2-1000609310.us-west-1.elb.amazonaws.com:27017/dbo_dmg?authSource=dbo_dmg',
        createNewUserApiEndpoint: 'https://adminapi.sonypicturessro.com/admin/CreateNewUser',
        loginUri: 'https://svc_sro:kshtZXYBsU-6b!Lt@adminapi.sonypicturessro.com/admin/login'
    };
};
