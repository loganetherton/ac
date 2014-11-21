'use strict';

var app = angular.module('mean.users');

app.directive('acTogglePassword', [function () {
    return {
        template: '<span class="pic password {{toggleCtrl.passwordInput.iconClass}}">' +
                    '<div class="hide_text_password">{{toggleCtrl.passwordInput.tooltipText}}</div>' +
                  '</span>',
        controller: 'togglePasswordDirCtrl',
        controllerAs: 'toggleCtrl',
        link: function ($scope, element, attr, controller) {
            element.on('click', function () {
                $scope.passwordInput.type = $scope.passwordInput.type === 'text' ? 'password' : 'text';
                $scope.passwordInput.placeholder = $scope.passwordInput.placeholder === 'Password' ? 'Visible Password' : 'Password';
                controller.passwordInput.iconClass = controller.passwordInput.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
                controller.passwordInput.tooltipText = controller.passwordInput.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
            });
        }
    };
}]);