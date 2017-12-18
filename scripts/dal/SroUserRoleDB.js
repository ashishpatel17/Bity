/**
 * Created by nvargas on 2/10/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var collection = 'sro_user_role';

function SroUserRoleDB(){}

SroUserRoleDB.Init = function(con) {
    try {
        if (mongoose.model(collection)) {
            this.SroUserRoleModel = mongoose.model(collection);
        }
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            this.SroUserRoleSchema = new Schema({
                _id: String
                , Pilot: Boolean
                , Feature: Boolean
                , Admin: Boolean
                , FirstName: String
                , LastName: String
                , Email: String
                , Login: String
                , Mobile: Boolean
                , International: Boolean
                , ChannelAccess: [{
                    AppKey: String,
                    Channels: [String],
                    Disabled: Boolean
                }]
                , ChannelAccessExternal: [{
                    AppKey: String,
                    Channels: [{
                        CategoryName: "String",
                        GroupName: "String",
                        Type: "String"
                    }]
                }]
                , SroExpiryDate: Date
                , IdmExpiryDate: Date
                , RemainLoginAttempt: Number
                , LockedFlag: Boolean
                , DownloadPrivilegeFlag: Boolean
                , DisableFlag: Boolean
                , OverlayRequired: Boolean
                , AllowAirPlay: Boolean
                , AllowVideoDevice: Boolean
                , LastLoginDate: Date
                , Rules: String
                , LastSynchDate: Date
                , AccountLockedDate: Date
                , Lob: String
                , Opacity: Number
                , OverlayInitialDelay: Number
                , OverlayDelay: Number
                , OverlayDisplayTime: Number
                , OverlayFontSize: Number
                , DaysToExpire: Number
                , IsSptAccess: Boolean
                , IsHeAcess: Boolean
                , TermOfUseDate: Date
                , UserVoteDate: Date
                , IsInternal: Boolean
                , TerritoryRights: {
                    Territories: [{
                        TerritoryIds: Number,
                        TerritoryName: String
                    }],
                    Formats: [String],
                    Roles: [{
                        RoleName: String,
                        IsEnabled: Boolean,
                        OnFirstAvail: Boolean,
                        DaysFromAnnounce: Number
                    }]
                }
            }, {collection: collection});
            this.SroUserRoleModel = con.model(collection, this.SroUserRoleSchema);
        }
    }
};

SroUserRoleDB.findSROUsers = function(searchObj, callback){
    this.SroUserRoleModel.find(searchObj, function(err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

SroUserRoleDB.saveUserAdminObj = function (obj, callback){
    this.SroUserRoleModel.collection.save(obj, function (err, result){
        if (err) callback(err);
        else {
            callback(null, result);
        }
    });
};

SroUserRoleDB.removeUser = function (criteria, callback) {
    this.SroUserRoleModel.remove(criteria, function (err, doc) {
        if (err)
            callback(err);
        else
            callback(null,doc);
    });
};

module.exports = SroUserRoleDB;
