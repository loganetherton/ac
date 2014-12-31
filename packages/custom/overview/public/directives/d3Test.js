/*global d3:false */
'use strict';

var app = angular.module('mean.overview');

app.directive('d3Test', ['TasklistService', 'User', function (TasklistService, User) {

    /**
     * Allow click events to be triggered programmatically
     */
    jQuery.fn.d3Click = function () {
        this.each(function (i, e) {
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

            e.dispatchEvent(evt);
        });
    };
    /**
     * Reworking of original tree graph creation
     *
     * Zooming and panning: http://stackoverflow.com/questions/17405638/d3-js-zooming-and-panning-a-collapsible-tree-diagram
     * Zoomable, panable, scalable tree: http://bl.ocks.org/robschmuecker/7880033
     *
     * Critical Path Method: https://github.com/MilanPecov/critical-path-method
     * .NET CPM: http://www.leniel.net/2007/12/critical-path-method.html#sthash.MFd5MpNB.dpbs
     * Python implementation: https://github.com/dhenderson/criticalpy
     * JS implementation, not sure if it's any good: https://github.com/maxinfang/Cpath
     */
    var updatedTree = function () {
        var heightWidthModifier = [20, 120, 20, 120],
            // Determine width based on modifier
            height = 1280 - heightWidthModifier[1] - heightWidthModifier[3],
            // Determine height based on modifier
            width = 900 - heightWidthModifier[0] - heightWidthModifier[2],
            i = 0,
            root;

        // Tree
        var tree = d3.layout.tree().size([width, height]);
        // Projections based on data points
        var diagonal = d3.svg.diagonal().projection(function (d) {
            return [d.x, d.y];
        });
        // Create SVG element, append g, translate from top left (120, 20)
        var graph = d3.select('#task_graph')
        .append('svg:svg')
        .attr('width', width + heightWidthModifier[1] + heightWidthModifier[3])
        .attr('height', height + heightWidthModifier[0] + heightWidthModifier[2])
        .append('svg:g')
        .attr('transform', 'translate(' + heightWidthModifier[3] + ',' + heightWidthModifier[0] + ')');
        /**
         * Get data, set initial x,y coordinates for project parent node
         */
        d3.json('d3Data/flare.json', function (json) {
        //d3.json('/tasks/team/graph/' + User.getIdentity().teams[0], function (json) {
            console.log('json from d3.json');
            console.log(json);
            //root = json;
            //// Determine the largest number of children to display to do range
            //
            //
            //// Start project parent node in middle left
            //root.x0 = height / 2;
            //root.y0 = 0;
            //
            //// Initialize the display to show a few nodes.
            ////root.children.forEach(toggleAll);
            ////toggle(root.children[0]);
            ////toggle(root.children[1].children[0]);
            //createNodes(root);
        });

        d3.json('/tasks/team/graph/' + User.getIdentity().teams[0], function (json) {
            console.log('json from taskGraph');
            console.log(json);
            root = json;
            root.x0 = height / 2;
            root.y0 = 0;
            createNodes(root);
        });

        /**
         * Toggle and update on click
         */
        var clickInProgress = false,
            opening = null;
        var toggleClick = function (nodeEnter) {
            nodeEnter.on('click', function (d) {
                /**
                 * Ensure that the toggle doesn't get out of sync between multiple nodes which may have been
                 * closed and then opened again when separated
                 */
                if (opening !== null && opening !== !!d.children) {
                    return;
                }
                // Determine whether opening or closing, so we can keep multiples (which may be hidden) in sync
                if (opening === null) {
                    opening = !!d.children;
                }
                // Prevent infinite recursion, and only click if it's a node that can be toggled
                if (!clickInProgress) {
                    clickInProgress = true;
                    $('.' + d.title).not(this).d3Click();
                }
                toggle(d);
                createNodes(d);
                clickInProgress = false;
                opening = null;
            });
        };

        /**
         * Append text to each node
         */
        var appendText = function (nodeEnter) {
            nodeEnter.append('svg:text').attr('x', function (d) {
                // On first iteration
                return d.children || d._children ? -10 : 10;
            })
            .attr('dy', '.35em')
                // If there are children, anchor text at end. Otherwise, at start
            .attr('text-anchor', function (d) {
                return (d.children || d._children) ? 'end' : 'start';
                // Place the name as the text on each node
            }).text(function (d) {
                return d.title;
                // 1e-6 is a workaround for text flicker when transitioning text
            }).style('fill-opacity', 1e-6);
        };


        var cloneAndConsole = function (node) {
            console.log(_.clone(node));
        };

        /**
         * Update data, draw nodes, etc
         */
        var createNodes = function (source) {
            var duration = 500;

            /**
             * This will automatically make the nodes stretch as far x as possible, and close to as far y as possible
             */
            var nodes = tree.nodes(root);

            /**
             * Determine x position based on how far down the hierarchy the node resides (0-ordered)
             */
            //nodes.forEach(function (d) {
            //    d.y = d.depth * 180;
            //});

            /**
             * Assign each node an id, or else return the id already assigned
             */
            var node = graph.selectAll('g.node').data(nodes, function (d) {
                if (d.id) {
                    return d.id;
                }
                d.id = i;
                i = i + 1;
                return d.id;
            });

            var nodeIds = {};

            /**
            * Find repeated nodes and merge
            */
            _.forEach(nodes, function (node, index) {
                // Create an array of everywhere this node is found
                if (node._id) {
                    if (nodeIds[node._id]) {
                        nodeIds[node._id].index.push(index);
                    } else {
                        nodeIds[node._id] = {
                            index: [index]
                        };
                    }
                }
            });
            // Since we're iterating over the nodes themselves, the repeated values will be found multiple times
            var repeatedNodes = [];
            var nodeIter;
            // Iterate nodes and find the ones that have repeated values, based on the number of indexes in nodeIds
            for (nodeIter = 0; nodeIter < nodes.length; nodeIter = nodeIter + 1) {
                if (nodeIds[nodes[nodeIter]._id] && nodeIds[nodes[nodeIter]._id].index && nodeIds[nodes[nodeIter]._id].index.length > 1) {
                    repeatedNodes.push(nodeIds[nodes[nodeIter]._id].index);
                }
            }
            // Remove repeated values
            var removeDuplicateNodeIndexes = function (a) {
                var exists = {};
                return a.filter(function(item) {
                    return exists.hasOwnProperty(item) ? false : (exists[item] = true);
                });
            };
            var repeatedWithoutDuplicates = removeDuplicateNodeIndexes(repeatedNodes);
            // Merge the nodes that are repeated
            for (nodeIter = 0; nodeIter < repeatedWithoutDuplicates.length; nodeIter = nodeIter + 1) {
                var thisX = [];
                var thisY = [];
                // Get an array of all x and y values for repeated nodes
                repeatedWithoutDuplicates[nodeIter].forEach(function (nodeArrayItem) {
                    thisX.push(nodes[nodeArrayItem].x);
                    thisY.push(nodes[nodeArrayItem].y);
                });
                // Determine average
                var avgX = thisX.reduce(function(a, b) { return a + b }) / thisX.length;
                var avgY = thisY.reduce(function(a, b) { return a + b }) / thisY.length;
                // Replace each node's x and y with average
                repeatedWithoutDuplicates[nodeIter].forEach(function (nodeArrayItem) {
                    nodes[nodeArrayItem].x = avgX;
                    nodes[nodeArrayItem].y = avgY;
                });
            }

            /**
            * Append each node on top of the parent node for their stating position
            */
            var nodeEnter = node.enter().append('svg:g').attr('class', 'node').attr('transform', function (d) {
                // Append title to class for triggering click
                var oldClass = $(this).attr('class');
                $(this).attr('class', oldClass + ' ' + d.title);
                return 'translate(' + source.y0 + ',' + source.x0 + ')';
            });

            /**
            * Append children for each that has them, then style them
            */
            nodeEnter.append('svg:circle').attr('r', 1e-6).style('fill', function (d) {
                return d._children ? 'lightsteelblue' : '#fff';
            });

            /**
            * Move the nodes to their proper locations
            */
            var nodeUpdate = node.transition().duration(duration).attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });

            /**
            * Define how big the circles are, and then color them based on whether children exist
            */
            nodeUpdate.select('circle').attr('r', 4.5).style('fill', function (d) {
                return d._children ? 'lightsteelblue' : '#fff';
            });

            /**
            * When removing nodes, move them back to the parents position, fade out circle and text
            */
            var nodeExit = node.exit().transition().duration(duration).attr('transform', function (d) {
                return 'translate(' + source.x + ',' + source.y + ')';
            }).remove();
            nodeExit.select('circle').attr('r', 1e-6);
            nodeExit.select('text').style('fill-opacity', 1e-6);

            /**
            * Stash the old positions for transition.
            */
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            var task_3;


            /**
            * Draw the lines
            */
            var link = graph.selectAll('path.link').data(tree.links(nodes), function (d) {
                return d.target.id;
            });

            // Enter any new links at the parent's previous position.
            link.enter().insert('svg:path', 'g').attr('class', 'link').attr('d', function (d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            }).transition().duration(duration).attr('d', diagonal);

            // Transition links to their new position.
            link.transition().duration(duration).attr('d', diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition().duration(duration).attr('d', function (d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            }).remove();

            /**
            * Append and fill text
            */
            appendText(nodeEnter);
            nodeUpdate.select('text').style('fill-opacity', 1);

            // Toggle each node on click
            toggleClick(nodeEnter);
        };

        function toggleAll(d) {
            if (d.children) {
                d.children.forEach(toggleAll);
                toggle(d);
            }
        }

        // Toggle children.
        function toggle(d) {
            // Remove children nodes that exist
            if (d.children) {
                d._children = d.children;
                d.children = null;
                // Add children nodes back in
            } else {
                d.children = d._children;
                d._children = null;
            }
        }
    };

    return {
        restrict: 'A',
        templateUrl: 'overview/views/directiveTemplates/d3_test.html',
        scope: {
            data: '='
        },
        link: function (scope, element, attrs) {
            //TasklistService.getTasksForGraph().then(function (data) {
            //    //console.log('tasks for graph');
            //    //console.log(data);
            //});
            updatedTree();
        }
    };
}]);