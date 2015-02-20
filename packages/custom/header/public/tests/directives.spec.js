describe('Header directives', function () {
    var scope, element, httpBackend;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.templates');
        module('mean.header', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    describe('user-dropdown', function () {
        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            element = $compile('<user-dropdown></user-dropdown>')(scope);

            scope.$digest();
        }));

        it('should display the user\'s name', function () {
            expect(element.scope().headerCtrl.user.name).toEqual('Testy Tester');
        });
    });

    describe('addToTeam', function () {
        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            element = $compile('<add-to-team></add-to-team>')(scope);
            
            scope.$digest();
        }));

        describe('display', function () {
            it('should have all of the right text in the directive', function () {
                expect($(element).text()).toMatch(/Add users to team/);
                expect($(element).text()).toMatch(/Search for an existing user by name or email/);
                expect($(element).text()).toMatch(/Email an invite to a new user to join your team/);
            });

            it('should have a typeahead input', function () {
                expect($(element).html()).toMatch(/input class="typeahead/);
            });
        });

        describe('controller', function () {
            it('should expose the right properties on the directive controller', function () {
                expect(element.scope().addToTeamCtrl.selectedUser).toBeDefined();
                expect(element.scope().addToTeamCtrl.existingUsers).toBeDefined();
            });

            it('should add the selected user to the selectedUser property on typing', function () {
                var searchUserInput = $(element).find('#searchUserInput');
                searchUserInput.val('Test').trigger('input');
                scope.$apply();
                expect(element.scope().addToTeamCtrl.selectedUser).toBe('Test');
            });

            it('should replace the instructions with a send button on a valid selection only', function () {
                element.scope().addToTeamCtrl.selectedUser = {_id: 1, email: 'test@test.com', name: 'Test'};
                scope.$apply();
                expect($(element).html()).toMatch(/<button class="btn btn-info" id="searchUser">Send invite<\/button>/);
                element.scope().addToTeamCtrl.selectedUser = 'INVALID';
                scope.$apply();
                expect($(element).html()).not.toMatch(/<button class="btn btn-info" id="searchUser">Send invite<\/button>/);
            });
        });
    });
});