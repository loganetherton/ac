var TaskServiceMock = function ($q, $http) {
    var task = {
        title: 'Task Title',
        content: 'Task Content'
    };
    return {
        getTask: function (id) {
            var deferred = $q.defer();
            if (id === 'badId') {
                deferred.reject('Could not find task');
            }
            deferred.resolve(task);
            return deferred.promise;
        }
    }
};