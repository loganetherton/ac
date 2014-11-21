'use strict';

var app = angular.module('mean.users');

app.directive('acTogglePassword', [function () {
    return {
        template: '<span class="pic password {{passwordInput.iconClass}}">' +
                    '<div class="hide_text_password">{{passwordInput.tooltipText}}</div>' +
                  '</span>',
        scope: true,
        link: function ($scope, element) {
            element.on('click', function () {
                $scope.passwordInput.type = $scope.passwordInput.type === 'text' ? 'password' : 'text';
                $scope.passwordInput.placeholder = $scope.passwordInput.placeholder === 'Password' ? 'Visible Password' : 'Password';
                $scope.passwordInput.iconClass = $scope.passwordInput.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
                $scope.passwordInput.tooltipText = $scope.passwordInput.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
                if ('placeholderConfirmPass' in $scope.passwordInput) {
                    $scope.passwordInput.placeholderConfirmPass =
                        $scope.passwordInput.placeholderConfirmPass === 'Repeat Password' ? 'Visible Password' :
                        'Repeat Password';
                }
            });
        }
    };
}]);