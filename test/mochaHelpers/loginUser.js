var q = require('q');
/**
 * Log the user in
 * @param email
 * @param password
 * @param done
 */
module.exports = function (server, email, password, done) {
    var deferred = q.defer();
    server
    .post('/login')
    .send({ email: email, password: password })
    .expect(200)
    .end(function (err, res) {
        if (err) {
            console.log('**************ERROR**********');
            console.log(err);
            return done(err);
        }
        res.body.user._id.should.be.ok;
        deferred.resolve();
        if (typeof done === 'function') {
            return done();
        }
    });
    return deferred.promise;
};