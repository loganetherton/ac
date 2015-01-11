describe('TaskdetailsController', function () {
    var scope, controller, taskService, fakeId;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.taskdetails', function ($provide) {
            $provide.factory('User', UserMock);
            $provide.factory('TaskService', TaskServiceMock);
        });
    });

    beforeEach(inject(function ($rootScope, $controller, TaskService) {
        scope = $rootScope.$new();
        taskService = TaskService;

        var possible = 'abcdef0123456789';
        fakeId = Array.apply(null, Array(24)).map(function () {
            return possible.charAt(Math.floor(Math.random() * possible.length));
        }).join('');

        spyOn(taskService, 'getTask').andCallThrough();

        controller = $controller('TaskdetailsController', {$scope: scope, $stateParams: {taskId: fakeId}});
    }));

    it('should have a taskId defined in the stateParams', function () {
        expect(controller.taskId).toBe(fakeId);
    });

    it('should call TaskService.getTask() immediately and populate the task', function () {
        scope.$digest();
        expect(angular.equals(controller.task, {
            title: 'Task Title',
            content: 'Task Content'
        })).toBe(true);
    });

    it('should display an error message if the task is not found', inject(function ($controller) {
        controller = $controller('TaskdetailsController', {$scope: scope, $stateParams: {taskId: 'badId'}});
        scope.$digest();
        expect(controller.error).toBe('Could not find task');
    }));
});