var Promise = require('bluebird');
/**
 * Log the user in
 * @param server
 * @param email
 * @param password
 */
module.exports = function (server, email, password) {
    return new Promise(function (resolve, reject) {
        server
        .post('/login')
        .send({ email: email, password: password })
        .expect(200)
        .end(function (err, res) {
            if (err) {
                new Error(err);
            }
            res.body.user._id.should.be.ok;
            resolve(res.body.user);
        });
    });
};