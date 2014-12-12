'use strict';

var mean = require('meanio'),
    mongoose = require('mongoose'),
    Log = mongoose.model('Log');

exports.render = function (req, res) {

    var modules = [];
    // Preparing angular modules list with dependencies
    for (var name in mean.modules) {
        modules.push({
            name: name,
            module: 'mean.' + name,
            angularDependencies: mean.modules[name].angularDependencies
        });
    }

    function isAdmin() {
        return req.user && req.user.roles.indexOf('admin') !== -1;
    }

    // Send some basic starting info to the view
    res.render('layouts/default', {
        user: req.user ? {
            name: req.user.name,
            _id: req.user._id,
            username: req.user.username,
            roles: req.user.roles
        } : {},
        modules: modules,
        isAdmin: isAdmin,
        adminEnabled: isAdmin() && mean.moduleEnabled('mean-admin')
    });
};

/**
 * Basic logging function to write frontend exceptions to DB
 *
 * @param req
 * @param res
 */
exports.log = function (req, res) {
    var logger = new Log(req.body);

    logger.save(function(err, log) {
        if (err) {
            return res.json(500, {
                error: 'Cannot save log'
            });
        }
        res.json(logger);
    });
};