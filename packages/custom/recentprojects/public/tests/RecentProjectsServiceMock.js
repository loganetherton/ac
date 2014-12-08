var ProjectServiceMock = function ($q) {
    var data = [];
    _.range(0, 12).map(function (curVal) {
        data.push({
            title: 'Fake title ' + curVal,
            content: 'Fake content ' + curVal
        });
    });
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