/**
 * Mocking global strings
 * @returns {{data: {user: string, authenticated: boolean, isAdmin: boolean}, tasklist: {strings: {name: string, project: string}}}}
 * @constructor
 */
var GlobalMock = function () {
    return {
        data: {
            user: 'logan',
            authenticated: true,
            isAdmin: true
        },
        tasklist: {
            strings: {
                name: 'Mock Task list',
                project: 'Mock Setting up'
            }
        }
    };
};

