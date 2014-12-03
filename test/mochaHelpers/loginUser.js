/**
 * Log the user in
 * @param email
 * @param password
 * @param done
 */
module.exports = function (server, email, password, done) {
    server
    .post('/login')
    .send({ email: email, password: password })
    .expect(200)
    .end(function (err, res) {
        if (err) {
            return done(err);
        }
        res.body.user._id.should.be.ok;
        return done();
    });
};