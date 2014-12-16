/*global d3:false */
'use strict';

var app = angular.module('mean.overview');

app.directive('d3Test', [function () {

    var visualize = function () {
        var m = [20, 120, 20, 120], w = 1280 - m[1] - m[3], h = 800 - m[0] - m[2], i = 0, root;

        var tree = d3.layout.cluster().size([h, w]);

        var diagonal = d3.svg.diagonal().projection(function (d) { return [d.y, d.x]; });

        var vis = d3.select("#task_graph")
        .append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        //scope.$on('graphData', function (event, data) {
        //    //console.log(data);
        //});

        d3.json("d3Data/flare.json", function (json) {
            root = json;
            root.x0 = h / 2;
            root.y0 = 0;

            // Initialize the display to show a few nodes.
            //root.children.forEach(toggleAll);
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
            var node = vis.selectAll("g.node").data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("svg:g").attr("class", "node").attr("transform",
            function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });

            nodeEnter.on("click", function (d) {
                toggle(d);
                update(d);
            });

            nodeEnter.append("svg:circle").attr("r", 1e-6).style("fill",
            function (d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeEnter.append("svg:text").attr("x",
            function (d) { return d.children || d._children ? -10 : 10; }).attr("dy",
            ".35em").attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            }).text(function (d) { return d.name; }).style("fill-opacity", 1e-6);

            /**
             * Move the nodes to their proper locations
             */
            duration = d3.event && d3.event.altKey ? 5000 : 500;
            var nodeUpdate = node.transition().duration(duration).attr("transform",
            function (d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle").attr("r", 4.5).style("fill",
            function (d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeUpdate.select("text").style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition().duration(duration).attr("transform",
            function (d) { return "translate(" + source.y + "," + source.x + ")"; }).remove();

            nodeExit.select("circle").attr("r", 1e-6);

            nodeExit.select("text").style("fill-opacity", 1e-6);

            /**
             * Draw the lines
             */
            var link = vis.selectAll("path.link").data(tree.links(nodes), function (d) {
                return d.target.id;
            });

            // Enter any new links at the parent's previous position.
            link.enter().insert("svg:path", "g").attr("class", "link").attr("d", function (d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            }).transition().duration(duration).attr("d", diagonal);

            // Transition links to their new position.
            link.transition().duration(duration).attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition().duration(duration).attr("d", function (d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            }).remove();

            /**
             * Stash the old positions for transition.
             */
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        function toggleAll(d) {
            if (d.children) {
                d.children.forEach(toggleAll);
                toggle(d);
            }
        }

        // Toggle children.
        function toggle(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
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
            visualize();
        }
    };
}]);