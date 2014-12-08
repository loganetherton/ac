'use strict';

module.exports = function(System, app, auth, database) {

    // Home route
    var index = require('../controllers/index');
    //app.route('/').get(auth.requiresLogin, index.render);
    app.route('/').get(index.render);

    app.route('/logger').post(index.log);
};
