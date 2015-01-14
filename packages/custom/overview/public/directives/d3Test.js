/*global d3, $:false */
'use strict';

var app = angular.module('mean.overview');

app.directive('d3Test', ['TasklistService', 'User', function (TasklistService, User) {

    // The amount to move down y for each level of depth
    var levelDepth = 180;

    ///**
    // * Allow click events to be triggered programmatically
    // */
    //$.fn.d3Click = function () {
    //    this.each(function (i, e) {
    //        var evt = document.createEvent('MouseEvents');
    //        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    //
    //        e.dispatchEvent(evt);
    //    });
    //};
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
        var heightWidthModifierObj = {
            h1: 20,
            h2: 120,
            w1: 20,
            w2: 120
        };
        //var heightWidthModifier = [20, 120, 20, 120],
        // Determine width based on modifier
        var height = 1280,
            // Determine height based on modifier
            width = $('#task_graph').width(),
            i = 0,
            root;

        // Create SVG element, append g, translate from top left (120, 20)
        var graph = d3.select('#task_graph')
        .append('svg:svg')
        .attr('width', width)
        .attr('height', height)
        .append('svg:g')
        .attr('transform', 'translate(' + 0 + ',' + heightWidthModifierObj.h1 + ')');

        // Tree
        var tree = d3.layout.tree().size([width, height]);
        // Projections based on data points
        var diagonal = d3.svg.diagonal().projection(function (d) {
            return [d.x, d.y];
        });

        d3.json('/tasks/team/graph/' + User.getIdentity().teams[0], function (json) {
            root = json;
            //root.x0 = width / 2;
            root.x0 = 0;
            root.y0 = 0;
            createNodes(root);
            // Reposition nodes based on estimate
            repositionNodes();
        });

        /**
         * Get the original coordinates a node to be repositioned
         * @param originalTransform
         * @returns {Array}
         */
        var getOriginalCoordinates = function (originalTransform) {
            var subT = originalTransform.substr(originalTransform.indexOf('(') + 1);
            var coordinatesOnly = subT.substr(0, subT.indexOf(')'));
            return coordinatesOnly.split(',');
        };

        /**
         * Reposition nodes based on time estimates
         */
        var repositionNodes = function () {
            // Variables for moving the nodes themselves
            var gParent, transitionY, originalTransform, coordinatesSplit, xCoordinate, yCoordinate,
                newYCoordinate;
            // Variables for moving the paths
            var extendLength, pathD, pathDSplit, pathLastDrawInstruction, pathXCoordinate, pathYCoordinate;

            /**
             * Reposition individual nodes based on estimate or based on parent's estimate
             * @param d
             * @param nodeDomElement
             * @param amount
             */
            var repositionIndividualNode = function (d, nodeDomElement, amount) {
                // Get the grouping parent
                gParent = $(nodeDomElement).parent().get(0);
                // Move the node down based on the estimate, or else based on the parent node's estimate, if that moved
                transitionY = amount || (d.estimate - 1) * levelDepth;
                // Get the original transform property of the node
                originalTransform = gParent.getAttribute('transform');
                // Get the coordinates of the original transform property
                coordinatesSplit = getOriginalCoordinates(originalTransform);
                xCoordinate = coordinatesSplit[0];
                yCoordinate = coordinatesSplit[1];
                newYCoordinate = (parseInt(yCoordinate) + transitionY);
                // Move the node to its new position
                gParent.setAttribute('transform', 'translate(' + xCoordinate + ',' + newYCoordinate + ')');
                // Move all children an equal amount
                _.each(d.children, function (nodeChild) {
                    repositionIndividualNode(nodeChild, $('#' + nodeChild.title).find('circle'), transitionY);
                });
            };

            /**
             * Redraw paths when nodes are repositioned
             * @param d
             * @param thisPath
             * @param amount
             */
            var redrawPathsBasedOnReposition = function (d, thisPath, amount) {
                // Get the length of redraw based on estimate, or amount parent moves
                extendLength = amount || (d.target.estimate - 1) * levelDepth;
                // If this is a child node, then perform a translate, rather extending the path
                if (amount) {
                    $(thisPath).attr('transform', 'translate(0, 180)');
                } else {
                    // Get original svg path d attribute
                    pathD = thisPath.getAttribute('d');
                    // Split coordinates
                    pathDSplit = pathD.split(' ');
                    // Split the last coordinate instructions, so we can get coordinates to extend from
                    pathLastDrawInstruction = pathDSplit[pathDSplit.length -1].split(',');
                    // Get original x and y
                    pathXCoordinate = pathLastDrawInstruction[0];
                    pathYCoordinate = pathLastDrawInstruction[1];
                    // Keep x the same, extend y as far down as necessary
                    thisPath.setAttribute('d', pathD + ' L' + pathXCoordinate + ',' + (parseInt(pathYCoordinate) + extendLength));
                }
                // If there's a target, iterate children to find those that need to move as well
                if (d.target) {
                    _.each(d.target.children, function (nodeChild) {
                        // Translate the path of each child node
                        d3.select('#' + d.target.title + '_' + nodeChild.title).each(function (childData) {
                            redrawPathsBasedOnReposition(childData, $('#' + d.target.title + '_' + nodeChild.title).get(0), extendLength);
                        });
                    });
                }
            };

            // @todo Not sure why, but I need to set a timeout or the lines never finish drawing.
            // It seems as though this if this runs before everything is drawn initially, it interrupts the drawing
            // This might be a clue: http://stackoverflow.com/questions/10692100/invoke-a-callback-at-the-end-of-a-transition
            setTimeout(function () {
                d3.selectAll('circle').transition().each('end', function (d) {
                    if (typeof d.estimate !== 'undefined' && d.estimate > 1) {
                        repositionIndividualNode(d, this);
                    }
                });
                // Lengthen the path when necessary
                d3.selectAll('path').transition().each('end', function (d) {
                    if (d.target.estimate > 1) {
                        redrawPathsBasedOnReposition(d, this);
                    }
                });
            }, 500);
        };

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
                //if (opening !== null && opening !== Boolean(d.children)) {
                //    return;
                //}
                //// Determine whether opening or closing, so we can keep multiples (which may be hidden) in sync
                //if (opening === null) {
                //    opening = !!d.children;
                //}
                // Prevent infinite recursion, and only click if it's a node that can be toggled
                //if (!clickInProgress) {
                //    clickInProgress = true;
                //    $('.' + d.title).not(this).d3Click();
                //}
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

        //var cloneAndConsole = function (node) {
        //    console.log(_.clone(node));
        //};

        var depthModifierByEstimate = 1;

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
            nodes.forEach(function (d) {
                //console.log(depthModifier);
                //depthModifier = depthModifier + 10;
                depthModifierByEstimate = 1;
                d.y = d.depth * levelDepth;
                if (d.estimate && d.estimate > 1) {
                    depthModifierByEstimate = d.estimate;
                }
                //if (d.title === 'Task13') {
                //    console.log('**************DEPTH BEFORE MODIFICATION**********');
                //    console.log((d.depth * 180));
                //    console.log('**************DEPTH AFTER MODIFICATION**********');
                //    console.log((d.depth * 180) * depthModifierByEstimate);
                //}
                //d.y = d.y + (180 * depthModifierByEstimate);
            });

            // M117.55555555555556,720C117.55555555555556,945 176.33333333333334,945 176.33333333333334,1170

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

            /**
            * Append each node on top of the parent node for their stating position
            */
            var nodeEnter = node.enter().append('svg:g').attr('class', 'node').attr('transform', function (d) {
                // Set id as task title, so that it can be found later for repositioning
                $(this).attr('id', d.title);
                return 'translate(0,0)';
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


            /**
            * Draw the lines
            */
            var link = graph.selectAll('path.link').data(tree.links(nodes), function (d) {
                return d.target.id;
            });

            // Enter any new links at the parent's previous position.
            link.enter().insert('svg:path', 'g').attr('class', 'link').attr('d', function (d) {
                // Add ID for the path for finding during repositioning
                $(this).attr('id', d.source.title + '_' + d.target.title);
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
            repositionNodes();
        }
    };

    return {
        restrict: 'A',
        templateUrl: 'overview/views/directiveTemplates/d3_test.html',
        scope: {
            data: '='
        },
        link: function (scope, element, attrs) {
            updatedTree();
        }
    };
}]);