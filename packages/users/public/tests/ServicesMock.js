var UserMock = function ($rootScope) {
    var identity = {
        _id: '1',
        name: 'Testy Tester',
        email: 'test@test.com',
        roles: ['authenticated']
    };
    identity.authenticated = true;
    identity.isAdmin = false;

    return {
        isAdmin: function () {
            return identity.roles.indexOf('admin') !== -1;
        },
        getIdentity: function () {
            return identity;
        },
        setIdentity: function (val) {
            identity = val;
            // Make accessible to rootScope (this will eventually be removed)
            $rootScope.user = val;
        }
    };
};