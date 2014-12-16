/*global d3:false */
'use strict';

var app = angular.module('mean.overview');

app.directive('d3Test', [function () {

    var treeGraph = function () {
        // m = x1, y1, x2, y2
        var m = [20, 120, 20, 120],
            // Determine width based on original m
            w = 1280 - m[1] - m[3],
            // Determine height based on m
            h = 800 - m[0] - m[2],
            i = 0,
            root;

        var tree = d3.layout.cluster().size([h, w]);

        var diagonal = d3.svg.diagonal().projection(function (d) { return [d.y, d.x]; });

        var graph = d3.select('#task_graph')
        .append('svg:svg')
        .attr('width', w + m[1] + m[3])
        .attr('height', h + m[0] + m[2])
        .append('svg:g')
        .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')');

        d3.json('d3Data/flare.json', function (json) {
            root = json;
            // Start each node in the middle
            root.x0 = h / 2;
            root.y0 = 0;

            // Initialize the display to show a few nodes.
            root.children.forEach(toggleAll);
            //toggle(root.children[1]);
            //toggle(root.children[1].children[2]);
            //toggle(root.children[9]);
            //toggle(root.children[9].children[0]);
            update(root);
        });

        function update(source) {
            console.log(source);
            var duration;

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse();

            /**
             * Determine y position based on how far down the hierarchy the node resides (0-ordered)
             */
            nodes.forEach(function (d) {
                d.y = d.depth * 180;
            });

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
             * Append each node on top of the parent node
             */
            var nodeEnter = node.enter().append('svg:g').attr('class', 'node').attr('transform', function (d) {
                return 'translate(' + source.y0 + ',' + source.x0 + ')';
            });

            /**
             * Toggle and update on click
             */
            nodeEnter.on('click', function (d) {
                toggle(d);
                update(d);
            });

            /**
             * Append children for each that has them, then style them
             */
            nodeEnter.append('svg:circle').attr('r', 1e-6).style('fill',
            function (d) {
                return d._children ? 'lightsteelblue' : '#fff';
            });

            /**
             * Append text to each node
             */
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

            /**
             * Move the nodes to their proper locations
             */
            duration = d3.event && d3.event.altKey ? 5000 : 500;
            var nodeUpdate = node.transition().duration(duration).attr('transform',
            function (d) {
                return 'translate(' + d.y + ',' + d.x + ')';
            });

            nodeUpdate.select('circle').attr('r', 4.5).style('fill',
            function (d) { return d._children ? 'lightsteelblue' : '#fff'; });

            nodeUpdate.select('text').style('fill-opacity', 1);

            /**
             * When removing nodes, move them back to the parents position, fade out circle and text
             */
            var nodeExit = node.exit().transition().duration(duration).attr('transform', function (d) {
                return 'translate(' + source.y + ',' + source.x + ')';
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
                if (d.target.title === 'task_3') {
                    task_3 = d;
                }
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
        }

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
            treeGraph();
            //forceGraph();
        }
    };
}]);