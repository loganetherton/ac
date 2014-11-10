'use strict';

module.exports = function(System, app, auth, database) {

    // Home route
    var fixtures = require('../controllers/fixtures');

    app.route('/clearUsers').post(fixtures.clearUsers);
};
