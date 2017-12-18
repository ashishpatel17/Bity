/**
 * Created by nvargas on 11/9/17.
 */
var config = require('./config.js')();
var dbconn = require('./dbconnection.js');
var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var parse = require('csv-parse/lib/sync');
var readline = require('readline');

dbconn.Init(config.url, function() {

    var SroAssetDB = require('./dal/SroAssetDB');
    var DamAssetDB = require('./dal/DamAssetDB');

    var lineReader = readline.createInterface({
        input: fs.createReadStream('./files/update_damassets_test.csv')
    });

    lineReader.on('line', function (line) {
        var data = parse(line)[0];
        SroAssetDB.findByCriteria({DamAssetId: data[0]}, function (err, validAsset) {
            if (err) console.log(err);
            else {
                if (!_.isNull(validAsset)) {
                    var damAssetId = data[1];

                    var insertObj = {
                        "_id": damAssetId,
                        "create_date": new Date(),
                        "last_updated_date": new Date(),
                        "runner_metadata": {
                            "event_type": 'asset_change',
                            "event_data": {
                                "id": damAssetId,
                                "status": "complete"
                            }
                        },
                        "sro_metadata": {
                            "is_deleted": false,
                            "transfer_status": "Completed",
                            "watermark_group_id": _.isUndefined(validAsset.WatermarkGroupId) || _.isNull(validAsset.WatermarkGroupId) ? null : validAsset.WatermarkGroupId,
                            "watermark_status": "Completed"
                        },
                        "updated_by": "script_migration"
                    };

                    DamAssetDB.saveDamAsset(insertObj, function(err) {
                        if (err) console.log('error: ' + data[0]);
                        else console.log('success: ' + damAssetId);
                    });
                }
            }
        });
    });
});