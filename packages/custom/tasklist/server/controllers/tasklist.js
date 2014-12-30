'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Task = mongoose.model('Task'),
    _ = require('lodash'),
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
    /**
     * Get top level nodes, as they're all that's needed for building the initial tree
     */
    _.forEach(taskMap, function (thisTask) {
        if (!thisTask.dependencies.length) {
            graph.children.push(thisTask);
        }
    });
    /**
     * Build tree from top level nodes
     */
    traverse(graph).forEach(function (node) {
        if (node instanceof mongoose.Types.ObjectId && this.parent.key === 'children') {
            this.update(taskMap[this.node]);
        }
    });
    var foundBranches = {};
    var duplicateBranches = {};
    /**
     * Determine which nodes are actually duplicates on a single branch
     * @param pathsArray
     */
    var determineDuplicates = function (pathsArray) {
        // For each path, iterate all others. If any are found that are the same path, but longer, remove this one
        var pathsToRemove = pathsArray.filter(function (thisPath) {
            return (thisPath !== 'children');
        });
        // Create initial array of found branches
        if (!foundBranches[taskTitle]) {
            foundBranches[taskTitle] = [];
        }
        // If the branch isn't found, add it
        if (foundBranches[taskTitle].indexOf(pathsToRemove[0]) === -1) {
            foundBranches[taskTitle].push(pathsToRemove[0]);
        } else {
            // Add to the array of duplicates
            if (duplicateBranches[taskTitle].indexOf(pathsToRemove[0]) === -1) {
                duplicateBranches[taskTitle].push(pathsToRemove[0]);
            }
        }
    };
    var keepMe;
    var actualRemovals = {};
    /**
     * Create collection of paths of leaves to remove
     * @param leaf
     * @param leafToKeep
     */
    var findLeavesToRemove = function (leaf, leafToKeep) {
        if (typeof leafToKeep === 'undefined') {
            var potentialRemoval = [];
            leaf.forEach(function (thisLeaf) {
                // Get actual paths of duplicates
                if (duplicateBranches[taskTitle].indexOf(thisLeaf[1]) !== -1) {
                    // Keep the ones that may be removed
                    potentialRemoval.push(thisLeaf);
                    // Set keep me
                    if (typeof keepMe === 'undefined' || keepMe === null) {
                        keepMe = thisLeaf;
                    }
                    // Find the longest leaf
                    if (thisLeaf.length > keepMe.length) {
                        keepMe = thisLeaf;
                    }
                }
            });
            // iterate again over list of leaves that might be removed, and remove all but one
            findLeavesToRemove(potentialRemoval, keepMe);
        } else {
            // Add to collection of paths for removal
            leaf.forEach(function (thisLeaf) {
                if (thisLeaf !== keepMe) {
                    actualRemovals[thisLeaf] = 1;
                }
            });
            keepMe = null;
        }
    };
    var taskTitle;
    /**
     * Handle actual removing of duplicate nodes
     * @param leaf
     */
    var removeDuplicateLeaves = function (leaf) {
        // Task object
        if (_.isPlainObject(leaf) && 'paths' in leaf && leaf.paths.length > 1) {
            removeDuplicateLeaves(leaf.paths);
        } else {
            // Array of paths
            if (_.isArray(leaf) && _.isArray(leaf[0])) {
                leaf.forEach(function (thisLeaf) {
                    determineDuplicates(thisLeaf);
                });
                // Find leaves which should be removed
                findLeavesToRemove(leaf);
                traverse(graph).forEach(function () {
                    // Remove leaves this should go
                    if (actualRemovals[this.path]) {
                        this.remove();
                    }
                });
            }
        }
    };
    var leafCollection = [];
    var duplicateLeaves = {};
    /**
     * Find duplicate leaves on the tree, so that duplicates on a single branch can be removed
     */
    traverse(graph).forEach(function (node) {
        if (node.children && !node.children.length) {
            // mark duplicates
            if (leafCollection.indexOf(node.title)) {
                if (!duplicateLeaves[node.title]) {
                    duplicateLeaves[node.title] = {
                        paths: []
                    };
                }
                duplicateLeaves[node.title].paths.push(this.path);
            } else {
                // Add to the leaf collection to check for duplicates on next run through
                leafCollection.push(node.title);
            }
        }
    });
    /**
     * Iterate duplicates on a branch and remove all but lowest level
     */
    _.forEach(duplicateLeaves, function (duplicate, thisTaskTitle) {
        taskTitle = thisTaskTitle;
        // Create array for this particular branch
        duplicateBranches[taskTitle] = [];
        removeDuplicateLeaves(duplicate);
    });
    /**
     * This is how to remove duplicate nodes
     */
    //traverse(graph).forEach(function (node) {
    //    var path = this.path;
    //    if (path.length === 4 && path[0] === 'children' && path[1] === '0' && path[2] === 'children' && path[3] === '1') {
    //        this.remove();
    //    }
    //});


    // Remove all but the lowest path
    //_.forEach(duplicateLeaves, function (duplicate, duplicateIndex) {
    //    if (duplicate.paths.length > 1) {
    //        duplicate.stringPaths = [];
    //        console.log('**************DUPLICATE**********');
    //        console.log(duplicate);
    //        console.log('**************DUPLICATE INDEX**********');
    //        console.log(duplicateIndex);
    //        // Find duplicate nodes on the same path
    //        duplicate.paths.forEach(function (path, index) {
    //            // Reduce paths to numbers only for comparison
    //            var numberedPath = path.map(function (thisPath) {
    //                if (thisPath !== 'children') {
    //                    return thisPath;
    //                }
    //            }).filter(function (thisPath) {
    //                return typeof thisPath !== 'undefined';
    //            });
    //            console.log('**************MODIFIED PATH**********');
    //            console.log(numberedPath);
    //            console.log('**************IN ORIGINAL**********');
    //            console.log(duplicateLeaves[duplicateIndex].paths[index]);
    //        });
    //    }
    //});
    return graph;
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