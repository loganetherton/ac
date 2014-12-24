'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Task = mongoose.model('Task'),
    _ = require('lodash'),
    t = require('t'),
    traverse = require('traverse');

var serverCtrlHelpers = require('../../../../system/server/controllers/helpers');

/**
 * Create an article
 */
exports.create = function(req, res) {
    var task = new Task(req.body);
    task.user = req.user;
    // Set the team for this task
    task.team = req.user.teams[0];

    task.validate(function (error) {
        if (typeof error !== 'undefined') {
            console.log(error);
        }
    });
    // Save the new task
    task.save(function(err) {
        if (err) {
            console.log('could not save task to database: ' + err);
            return res.status(500).json({
                errorText: 'Cannot save the task',
                error: err
            });
        }
        // Find tasks which are parent to this task and mark the dependency
        Task.find().where('_id').in(task.dependencies).exec(function(err, depTasks) {
            if (err) {
                return res.json(500, {
                    error: 'Unable to retrieve parent tasks'
                });
            }
            // For each parent task, mark the new dependency
            depTasks.forEach(function (parentTask) {
                parentTask.children.push(task.id);
                parentTask.save(function (err, parentSave) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });
        res.json(task);
    });
};

/**
 * Update an task
 */
exports.update = function(req, res) {
    var task = req.task;

    task = _.extend(task, req.body);

    task.save(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot update the task'
            });
        }
        res.json(task);

    });
};

/**
 * Delete an task
 */
exports.destroy = function(req, res) {
    var task = req.task;

    task.remove(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot delete the task'
            });
        }
        res.json(task);

    });
};

/**
 * Get tasks for the current requested user
 */
exports.getTasksByUserId = function(req, res, next) {
    // Make sure a user ID was passed in
    if (!req.params.hasOwnProperty('userId')) {
        return res.status(400).send('A user ID must be passed in to this query');
    }
    // Check for invalid object ID
    if (!serverCtrlHelpers.checkValidObjectId(req.params.userId)) {
        return res.status(400).send('Invalid object ID');
    }
    // Only allow the user to query their own tasks
    if (req.user._id + '' !== req.params.userId + '') {
        return res.status(400).send('Unauthorized');
    }
    Task.loadByUserId(req.params.userId, function (err, task) {
        if (err) {
            return next(err);
        }
        if (!task) {
            return next(new Error('Failed to load tasks for ' + req.params.userId));
        }
        return res.json(task);
    });
};

/**
 * Retrieve tasks for the requested team
 */
exports.getTasksByTeamId = function (req, res, next) {
    // Make sure a user ID was passed in
    if (!req.params.hasOwnProperty('teamId')) {
        return res.status(400).send('A team ID must be passed in to this query');
    }
    // Check for invalid object ID
    if (!serverCtrlHelpers.checkValidObjectId(req.params.teamId)) {
        return res.status(400).send('Invalid object ID');
    }
    // Make sure the requesting user is on the team being requested
    if (!serverCtrlHelpers.checkTeam(req.user.teams, req.params.teamId)) {
        return res.status(401).send('Unauthorized');
    }
    Task.loadByTeamId(req.params.teamId, function (err, tasks) {
        if (err) {
            return next(err);
        }
        if (!tasks) {
            return next(new Error('Failed to load tasks for ' + req.params.teamId));
        }
        return res.json(tasks);
    });
};

/**
 * Retrieve tasks for creation of the graph for this team
 */
exports.getTeamTasksForGraph = function (req, res, next) {
    // Make sure a user ID was passed in
    if (!req.params.hasOwnProperty('teamId')) {
        return res.status(400).send('A team ID must be passed in to this query');
    }
    // Check for invalid object ID
    if (!serverCtrlHelpers.checkValidObjectId(req.params.teamId)) {
        return res.status(400).send('Invalid object ID');
    }
    // Make sure the requesting user is on the team being requested
    if (!serverCtrlHelpers.checkTeam(req.user.teams, req.params.teamId)) {
        return res.status(401).send('Unauthorized');
    }
    Task.loadByTeamIdForGraph(req.params.teamId, function (err, tasks) {
        if (err) {
            return next(err);
        }
        if (!tasks) {
            return next(new Error('Failed to load tasks for ' + req.params.teamId));
        }
        //return res.json(processTasksForGraph(tasks));
        return res.json(processAttempt2(tasks));
    });
};

var processAttempt2 = function (tasks) {
    var taskMap = {};
    var graph = {
        title: 'project_name',
        children: []
    };
    var removedMap = {};
    /**
     * 1) Create map of all tasks so they can be referenced by ID
     * 2) Copy tasks that do not have parents into graph. They will be the top level nodes.
     * 3) Remove top level tasks from tasksMap. As they're being removed, remove parent reference from parents array
     * on remaining tasks
     * 4) Tasks which no longer have any parents are now placed into graph. Remove references to those. Repeat as many
     * times as necessary
     */
    tasks.forEach(function (task) {
        taskMap[task.id] = task.toObject();
        delete taskMap[task.id].id;
    });
    // Add top level nodes
    var createGraph = function (task) {
        _.forEach(task, function (thisTask) {
            if (!thisTask.dependencies.length) {
                graph.children.push(thisTask);
            }
        });
    };
    createGraph(taskMap);
    // Traverse the tree and add each node which is somewhere down the line from the top level node
    traverse(graph).forEach(function (node) {
        if (node instanceof mongoose.Types.ObjectId && this.parent.key === 'children') {
            this.update(taskMap[this.node]);
        }
    });
    return graph;
};

var DataStructures = require('./TreeCreator');

/**
 * Arrange the tasks into a usable format for d3
 * @param tasks
 * @returns {*}
 */
var processTasksForGraph = function (data) {
    ////console.log(data);
    //var tree = DataStructures.Tree.createFromFlatTable(data),
    //simplifiedTree = tree.toSimpleObject(function(objectToDecorate, originalNode) {
    //    objectToDecorate.size = originalNode.size;
    //    if (objectToDecorate.children && objectToDecorate.children.length == 0) {
    //        delete objectToDecorate.children;
    //    }
    //
    //    return objectToDecorate;
    //});
    //console.log(tree);
    //console.log(simplifiedTree);
    //Tree().createTree(tasksInput);
    var tasks = _.clone(data);
    var taskMap = {};
    var depsMap = {
        title: 'project_name',
        children: []
    };
    /**
    * 1) Get all tasks without dependencies, as they will form the top level of graph.
    * Additionally, create map of all of the remaining tasks to prevent unnecessary iteration
    */
    tasks.forEach(function (task) {
        if (!task.dependencies.length) {
            depsMap.children.push(task);
        } else {
            taskMap[task.id] = task;
        }
    });
    //console.log('**************TASKMAP**********');
    //console.log(taskMap);
    console.log('**************DEPSMAP**********');
    console.log(depsMap);
    var outputTree = t.map(depsMap, function (node, parent) {
        console.log('**************NODE**********');
        console.log(node);
        console.log('**************PARENT**********');
        console.log(parent);
    });
    console.log('**************OUTPUT TREE**********');
    console.log(outputTree);



    var level = 0, branch = 0;
    var thisIndex;
    var buildTreeGraph = function (inputMap) {
        console.log('**************INPUT MAP**********');
        console.log(inputMap);
        // If we're dealing with an object, send recurse children
        if (!_.isArray(inputMap)) {
            if (inputMap instanceof mongoose.Types.ObjectId) {
                console.log('**************LEVEL**********');
                console.log(level);
                console.log('**************INDEX**********');
                console.log(thisIndex);
                console.log('**************BRANCH**********');
                console.log(branch);
                //console.log('**************taskmap found**********');
                //console.log(taskMap[inputMap]);
            } else if (inputMap.children.length) {
                level = level + 1;
                buildTreeGraph(inputMap.children);
                level = level - 1;
            }
            // if we're dealing with an array of children, call each child
        } else {
            //console.log('**************INPUT MAP ARRAY**********');
            //console.log(inputMap);
            _.forEach(inputMap, function (child, index) {
                branch = branch + 1;
                thisIndex = index;
                buildTreeGraph(child);
            })
        }
    };
    var outputMap = buildTreeGraph(depsMap);
    console.log('**************OUTPUT MAP**********');
    console.log(outputMap);

    _.forEach(depsMap.children, function (task, depsMapIndex) {
        //console.log('**************TASK**********');
        //console.log(task);
        _.forEach(task.children, function (child, childIndex) {
            //console.log('**************DEPS MAP CHILD**********');
            depsMap.children[depsMapIndex].children[childIndex] = taskMap[child];
        })
    });
    console.log('**************DEPSMAP AT END**********');
    console.log(depsMap);




    //// Remove the tasks without dependencies, as we'll not be working on those anymore
    //tasks = tasks.filter(function (task) {
    //    return task.dependencies.length;
    //});
    ///**
    // * 2) Create object composed of tasks without dependencies
    // */
    //var depsMap = {
    //    title: 'project_name', children: []
    //};
    //noDeps.forEach(function (val) {
    //    if (depsMap.children.indexOf(val.id) === -1) {
    //        depsMap.children.push({
    //            id: val.id,
    //            title: val.title,
    //            children: []
    //        });
    //    }
    //});
    //console.log('**************TASKS**********');
    //console.log(tasks);
    //_.forEach(noDeps, function (task) {
    //    console.log('**************NODEP ITERATION**********');
    //    console.log(task);
    //    // Find all tasks which depend on these top level tasks
    //});
    ///**
    //* 3) Find items which depend on the items that don't themselves have dependencies
    //*/
    //// We'll end up with tasks being an array of all tasks which don't have top level dependencies
    //var tasksWithoutTopLevelDeps = tasks.map(function (task) {
    //    task.dependencies.forEach(function (dep) {
    //        if (depsMap[dep]) {
    //            depsMap[dep].children[task.id] = task;
    //            return null;
    //        }
    //        return task;
    //    });
    //}).filter(function (task) {
    //    return !_.isUndefined(task);
    //});
    //console.log(tasksWithoutTopLevelDeps);
    //console.log('**************DEPSMAP**********');
    //console.log(depsMap);
    return depsMap;
};

/**
 * List of tasks
 */
exports.all = function(req, res) {
    Task.find().sort('-created').populate('user', 'name').exec(function(err, tasks) {
        if (err) {
            return res.status(500).json({
                error: 'Cannot list tasks'
            });
        }
        res.json(tasks);
    });
};

/**
 * Query for task dependency autocomplete
 * @param req
 * @param res
 */
exports.queryList = function(req, res) {
    console.log('queryList');
    // Make sure a user ID was passed in
    if (!req.params.hasOwnProperty('query')) {
        return res.status(400).send('A query must be passed to /queryList/:query');
    }
    Task.find({
        title: new RegExp(req.params.query, 'i')
    }).select('title').sort('-created').populate('user', 'name').exec(function(err, tasks) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list tasks'
            });
        }
        res.json(tasks);
    });
};

/**
 * Query a single task
 * @param req
 * @param res
 */
exports.findOne = function (req, res) {
    Task.find().sort('-created').limit(1).populate('user', 'name username').exec(function(err, tasks) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the tasks'
            });
        }
        res.json(tasks);
    });
};