var ProjectServiceMock = function ($q, $rootScope) {
    var data = [];
    // Return some fake tasks
    for (var i = 0; i<12; i++) {
        data.push({
            title: 'Fake title ' + i,
            content: 'Fake content ' + i
        });
    }
    return {
        loadTasks: function (page) {
            var deferred = $q.defer();
            var tasksToReturn = data.slice((page - 1)*5, page * 5);

            // Return a list of tasks
            deferred.resolve(tasksToReturn);
            return deferred.promise;
        }
    };
};