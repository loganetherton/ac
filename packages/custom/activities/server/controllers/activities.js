'use strict';

var fs = require('fs-extra'),
    path = require('path');

/**
 * Return
 */
exports.getActivitiesTestJson = function(req, res, next) {
    var activityTestJson = path.resolve(__dirname, '../data/activity.json');
    // Make sure we're dealing with an actual file
    fs.ensureFile(activityTestJson, function (err) {
        if (err) {
            console.log(err);
            return res.send('Activities test JSON file does not exist');
        }
        // Read the JSON file and send results
        fs.readJsonFile(activityTestJson, function (err, data) {
            if (err) {
                return res.send('Could not read JSON file');
            }
            return res.json(data);
        });
    });
};