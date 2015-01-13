'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Task = mongoose.model('Task'),
    _ = require('lodash'),
    traverse = require('traverse');

var serverCtrlHelpers = require('../../../../system/server/controllers/helpers');

/***********************************************************************
 * PROCESSING
 ***********************************************************************/
    // For array comparison
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length !== array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i = i + 1) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] !== array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

var processAttempt2 = function (tasks) {
    var taskMap = {};
    var graph = {
        title: 'project_name',
        children: []
    };
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

    /*****************************************************************************
     * TESTING ORIGINAL GRAPH
     *****************************************************************************/
    //var originalGraph = _.clone(graph, true);

    var pathsToRemove = [];
    /**
     * Determine which nodes are actually duplicates on a single branch
     * @param pathsArray
     */
    var findPathsToRemove = function (pathsArray) {
        // Normalize the paths array
        pathsArray = pathsArray.map(function (path) {
            return path.filter(function (thisPath) {
                return (thisPath !== 'children');
            });
        });
        pathsToRemove = pathsArray.map(function (path) {
            // Determine if there are any paths that are the same length or longer than this path. If not, it won't be removed
            var potentialPathsToRemove = pathsArray.filter(function (thisPath) {
                // Don't compare against this path
                if (thisPath.equals(path)) {
                    return false;
                }
                return thisPath.length <= path.length;
            });
            // If there are no potential paths, return null
            if (!potentialPathsToRemove.length) {
                return [];
            }
            // Check for common ancestor paths among all paths to a given node
            return potentialPathsToRemove.filter(function (thisPath) {
                var pieceOfPathForComparison = path.slice(0, thisPath.length - 1);
                var otherPathForComparison = thisPath.slice(0, thisPath.length - 1);
                return pieceOfPathForComparison.equals(otherPathForComparison);
            });
        });
        var consolidatedPaths = [];
        // Flatten the array of paths
        pathsToRemove.forEach(function (path) {
            if (path.length) {
                path.forEach(function (thisPath) {
                    consolidatedPaths.push(thisPath);
                });
            }
        });
        var pathsToRemoveFinal = [];
        // Remove duplicate paths set for removal, since they may be found more than once
        consolidatedPaths.forEach(function (path) {
            if (!pathsToRemoveFinal.length) {
                return pathsToRemoveFinal.push(path);
            }
            pathsToRemoveFinal.forEach(function (foundPath) {
                if (!foundPath.equals(path)) {
                    pathsToRemoveFinal.push(path);
                }
            });
        });
        var i = 0;
        // Recreate original path structure
        pathsToRemoveFinal.forEach(function (path) {
            var pathLength = path.length * 2;
            for (i = 0; i < pathLength; i = i + 1) {
                // Paths should end up being like this: ['children', '0', 'children', '1', 'children', '0' ...]
                if (!i || i % 2 === 0) {
                    path.splice(i, 0, 'children');
                }
            }
        });
        return pathsToRemoveFinal;

        //var foundBranches = {};
        //var duplicateBranches = {};
        // For each path, iterate all others. If any are found that are the same path, but longer, remove this one
        //var pathsToRemove = pathsArray.filter(function (thisPath) {
        //    return (thisPath !== 'children');
        //});
        //console.log('**************PATHS TO REMOVE**********');
        //console.log(pathsToRemove);
        //// Create initial array of found branches
        //if (!foundBranches[taskTitle]) {
        //    foundBranches[taskTitle] = [];
        //}
        //// If the branch isn't found, add it
        //if (foundBranches[taskTitle].indexOf(pathsToRemove[0]) === -1) {
        //    foundBranches[taskTitle].push(pathsToRemove[0]);
        //} else {
        //    // Add to the array of duplicates
        //    if (duplicateBranches[taskTitle].indexOf(pathsToRemove[0]) === -1) {
        //        duplicateBranches[taskTitle].push(pathsToRemove[0]);
        //    }
        //}
    };
    //var keepMe;
    //var actualRemovals = {};
    ///**
    // * Create collection of paths of leaves to remove
    // * @param leaf
    // * @param leafToKeep
    // */
    //var findLeavesToRemove = function (leaf, leafToKeep) {
    //    if (typeof leafToKeep === 'undefined') {
    //        var potentialRemoval = [];
    //        leaf.forEach(function (thisLeaf) {
    //            // Get actual paths of duplicates
    //            if (duplicateBranches[taskTitle].indexOf(thisLeaf[1]) !== -1) {
    //                // Keep the ones that may be removed
    //                potentialRemoval.push(thisLeaf);
    //                // Set keep me
    //                if (typeof keepMe === 'undefined' || keepMe === null) {
    //                    keepMe = thisLeaf;
    //                }
    //                // Find the longest leaf
    //                if (thisLeaf.length > keepMe.length) {
    //                    keepMe = thisLeaf;
    //                }
    //            }
    //        });
    //        // iterate again over list of leaves that might be removed, and remove all but one per branch
    //        findLeavesToRemove(potentialRemoval, keepMe);
    //    } else {
    //        // Add to collection of paths for removal
    //        leaf.forEach(function (thisLeaf) {
    //            if (thisLeaf !== keepMe) {
    //                actualRemovals[thisLeaf] = 1;
    //            }
    //        });
    //        keepMe = null;
    //    }
    //};
    //var taskTitle;

    var thisPath;
    var removeMe = false;
    /**
     * Remove paths once they have been determined to be extraneous
     * @param pathsToRemove array
     */
    var removeByPath = function (pathsToRemove) {
        traverse(graph).forEach(function () {
            thisPath = this.path;
            // Search the array of paths to remove to see if this path should be removed
            pathsToRemove.forEach(function (path) {
                if (path.equals(thisPath)) {
                    removeMe = true;
                }
            });
            // Remove if necessary, then prepare for next iteration
            if (removeMe) {
                this.remove();
                removeMe = false;
            }
        });
    };

    /**
     * Handle actual removing of duplicate nodes
     * @param leaf
     *
     * OK, what should be happening here is like this:
     * If all ancestors are the same, remove the shortest. For example:
     * [ '1', '1', '1', '2' ]
     * [ '1', '1' ]  <------ Remove me
     * If not completely common ancestors are kept, keep both
     * [ '1', '0', '1' ]  <---- Keep me
     * [ '1', '1', '0' ]  <---- Keep me
     * If any ancestors are different, keep those. If all are the same, and one is shortest
     * (a mix of the above two), apply both parts of the algorithm
     * [ '1', '0', '1' ] <---- Difference ancestors, keep
     * [ '1', '1', '0' ] <---- Difference ancestors, keep
     * [ '1', '2' ]      <---- Since we only care about ancestors, not the node itself, REMOVE ME
     */
    var removeDuplicateLeaves = function (leaf) {
        // Task object
        if (_.isPlainObject(leaf) && 'paths' in leaf && leaf.paths.length > 1) {
            removeDuplicateLeaves(leaf.paths);
        } else {
            // Array of paths
            if (_.isArray(leaf) && _.isArray(leaf[0])) {
                // Find paths which share all the same ancestors and remove these
                removeByPath(findPathsToRemove(leaf));
            }
        }
    };
    var leafCollection = [];
    var duplicateLeaves = {};
    /**
     * Find duplicate leaves on the tree, so that duplicates on a single branch can be removed
     */
    traverse(graph).forEach(function (node) {
        if (node && node.children && !node.children.length) {
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
     * Find duplicate paths to any particular node, and remove the shorter path
     */
    _.forEach(duplicateLeaves, function (duplicate) {
        removeDuplicateLeaves(duplicate);
    });
    return graph;
    //return originalGraph;
};


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