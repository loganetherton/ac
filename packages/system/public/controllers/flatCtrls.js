(function() {
    'use strict';
    angular.module('app.ui.ctrls', []).controller('LoaderCtrl', [
        '$scope', 'cfpLoadingBar', function($scope, cfpLoadingBar) {
            $scope.start = function() {
                return cfpLoadingBar.start();
            };
            $scope.inc = function() {
                return cfpLoadingBar.inc();
            };
            $scope.set = function() {
                return cfpLoadingBar.set(0.3);
            };
            $scope.complete = function() {
                return cfpLoadingBar.complete();
            };
        }
    ]).controller('NotifyCtrl', [
        '$scope', 'logger', function($scope, logger) {
            $scope.notify = function(type) {
                switch (type) {
                    case 'info':
                        return logger.log('Heads up! This alert needs your attention, but it\'s not super important.');
                    case 'success':
                        return logger.logSuccess('Well done! You successfully read this important alert message.');
                    case 'warning':
                        return logger.logWarning('Warning! Best check yo self, you\'re not looking too good.');
                    case 'error':
                        return logger.logError('Oh snap! Change a few things up and try submitting again.');
                }
            };
        }
    ]).controller('AlertDemoCtrl', [
        '$scope', function($scope) {
            $scope.alerts = [
                {
                    type: 'success',
                    msg: 'Well done! You successfully read this important alert message.'
                }, {
                    type: 'info',
                    msg: 'Heads up! This alert needs your attention, but it is not super important.'
                }, {
                    type: 'warning',
                    msg: 'Warning! Best check yo self, you\'re not looking too good.'
                }, {
                    type: 'danger',
                    msg: 'Oh snap! Change a few things up and try submitting again.'
                }
            ];
            $scope.addAlert = function() {
                var num, type;
                num = Math.ceil(Math.random() * 4);
                type = void 0;
                switch (num) {
                    case 0:
                        type = 'info';
                        break;
                    case 1:
                        type = 'success';
                        break;
                    case 2:
                        type = 'info';
                        break;
                    case 3:
                        type = 'warning';
                        break;
                    case 4:
                        type = 'danger';
                }
                return $scope.alerts.push({
                    type: type,
                    msg: 'Another alert!'
                });
            };
            $scope.closeAlert = function(index) {
                return $scope.alerts.splice(index, 1);
            };
        }
    ]).controller('ProgressDemoCtrl', [
        '$scope', function($scope) {
            $scope.max = 200;
            $scope.random = function() {
                var type, value;
                value = Math.floor((Math.random() * 100) + 10);
                type = void 0;
                if (value < 25) {
                    type = 'success';
                } else if (value < 50) {
                    type = 'info';
                } else if (value < 75) {
                    type = 'warning';
                } else {
                    type = 'danger';
                }
                $scope.showWarning = type === 'danger' || type === 'warning';
                $scope.dynamic = value;
                $scope.type = type;
            };
            return $scope.random();
        }
    ]).controller('AccordionDemoCtrl', [
        '$scope', function($scope) {
            $scope.oneAtATime = true;
            $scope.groups = [
                {
                    title: 'Dynamic Group Header - 1',
                    content: 'Dynamic Group Body - 1'
                }, {
                    title: 'Dynamic Group Header - 2',
                    content: 'Dynamic Group Body - 2'
                }, {
                    title: 'Dynamic Group Header - 3',
                    content: 'Dynamic Group Body - 3'
                }
            ];
            $scope.items = ['Item 1', 'Item 2', 'Item 3'];
            $scope.addItem = function() {
                var newItemNo;
                newItemNo = $scope.items.length + 1;
                $scope.items.push('Item ' + newItemNo);
            };
        }
    ]).controller('CollapseDemoCtrl', [
        '$scope', function($scope) {
            $scope.isCollapsed = false;
        }
    ]).controller('ModalDemoCtrl', [
        '$scope', '$modal', '$log', function($scope, $modal, $log) {
            $scope.items = ['item1', 'item2', 'item3'];
            $scope.open = function() {
                var modalInstance;
                modalInstance = $modal.open({
                    templateUrl: 'myModalContent.html',
                    controller: 'ModalInstanceCtrl',
                    resolve: {
                        items: function() {
                            return $scope.items;
                        }
                    }
                });
                modalInstance.result.then(function(selectedItem) {
                    $scope.selected = selectedItem;
                }, function() {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };
        }
    ]).controller('ModalInstanceCtrl', [
        '$scope', '$modalInstance', 'items', function($scope, $modalInstance, items) {
            $scope.items = items;
            $scope.selected = {
                item: $scope.items[0]
            };
            $scope.ok = function() {
                $modalInstance.close($scope.selected.item);
            };
            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }
    ]).controller('PaginationDemoCtrl', [
        '$scope', function($scope) {
            $scope.totalItems = 64;
            $scope.currentPage = 4;
            $scope.maxSize = 5;
            $scope.setPage = function(pageNo) {
                $scope.currentPage = pageNo;
            };
            $scope.bigTotalItems = 175;
            $scope.bigCurrentPage = 1;
        }
    ]).controller('TabsDemoCtrl', [
        '$scope', function($scope) {
            $scope.tabs = [
                {
                    title: 'Dynamic Title 1',
                    content: 'Dynamic content 1.  Consectetur adipisicing elit. Nihil, quidem, officiis, et ex laudantium sed cupiditate voluptatum libero nobis sit illum voluptates beatae ab. Ad, repellendus non sequi et at.'
                }, {
                    title: 'Disabled',
                    content: 'Dynamic content 2.  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil, quidem, officiis, et ex laudantium sed cupiditate voluptatum libero nobis sit illum voluptates beatae ab. Ad, repellendus non sequi et at.',
                    disabled: true
                }
            ];
            $scope.navType = 'pills';
        }
    ]);

}).call(this);
