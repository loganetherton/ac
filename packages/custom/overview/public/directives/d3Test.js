/*global d3:false */
'use strict';

var app = angular.module('mean.overview');

app.directive('d3Test', [function () {

    var svgTest = function () {
        var barData = [],
        height = 400,
        width = 600,
        tempColor;

        for (var i = 0; i < 50; i++) {
            barData.push(Math.round(Math.random() * 100) + 1);
        }

        var colors = d3.scale.linear()
        .domain([0, barData.length * .33, barData.length * .66, barData.length])
        .range(['red', 'blue', 'orange', 'pink']);

        // Set domain to max data point, range to height
        // Domain is x, range is y
        var yScale = d3.scale.linear()
        .domain([0, d3.max(barData)])
        .range([0, height]);

        var xScale = d3.scale.ordinal()
        .domain(d3.range(0, barData.length))
        .rangeBands([0, width]);

        var tooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'white')
        .style('opacity', 0);

        var svgTest = d3.select('#svg_test')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .selectAll('rect').data(barData)
        .enter().append('rect')
        .style('fill', function(d,i) {
            return colors(i);
        })
        .attr('width', xScale.rangeBand())
        .attr('x', function (d, i) {
            return xScale(i);
        })
        .attr('height', 0)
        .attr('y', height)
        .on('mouseover', function (d) {
            tooltip.transition()
            .style('opacity', 0.9);

            tooltip.html(d)
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY) + 'px');

            tempColor = this.style.fill;
            // This refers to the current element
            d3.select(this)
            .style('opacity', 0.5)
            .style('fill', 'yellow');
        })
        .on('mouseleave', function (d) {
            d3.select(this)
            .style('opacity', 1)
            .style('fill', tempColor);
        });

        svgTest.transition()
        .attr('height', function (d) {
            return yScale(d);
        })
        .attr('y', function (d) {
            return height - yScale(d);
        })
        .delay(function (d, i) {
            return i * 10;
        })
        .duration(1000)
        .ease('elastic');
    };














    var treeGraph = function () {
        // m = x1, y1, x2, y2
        var heightWidthModifier = [20, 120, 20, 120],
            // Determine width based on original m
            width = 1280 - heightWidthModifier[1] - heightWidthModifier[3],
            // Determine height based on m
            height = 800 - heightWidthModifier[0] - heightWidthModifier[2],
            i = 0,
            root;

        var tree = d3.layout.tree().size([height, width]);

        var diagonal = d3.svg.diagonal().projection(function (d) {
            //console.log('diagonal');
            //console.log(d);
            return [d.y, d.x];
        });

        var graph = d3.select('#task_graph')
        .append('svg:svg')
        .attr('width', width + heightWidthModifier[1] + heightWidthModifier[3])
        .attr('height', height + heightWidthModifier[0] + heightWidthModifier[2])
        .append('svg:g')
        .attr('transform', 'translate(' + heightWidthModifier[3] + ',' + heightWidthModifier[0] + ')');

        d3.json('d3Data/flare.json', function (json) {
            console.log(json);
            root = json;
            // Start each node in the middle
            root.x0 = height / 2;
            root.y0 = 0;

            // Initialize the display to show a few nodes.
            //root.children.forEach(toggleAll);
            //toggle(root.children[0]);
            //toggle(root.children[1]);
            //toggle(root.children[1].children[0]);
            //toggle(root.children[9]);
            //toggle(root.children[9].children[0]);
            update(root);
        });

        /**
         * Toggle and update on click
         */
        var toggleClick = function (nodeEnter) {
            nodeEnter.on('click', function (d) {
                toggle(d);
                update(d);
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

        /**
         * Update each node with data, draw lines, create text, etc
         * @param source
         */
        function update(source) {
            var duration;

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse();

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

            /**
            * Append each node on top of the parent node for their stating position
            */
            var nodeEnter = node.enter().append('svg:g').attr('class', 'node').attr('transform', function (d) {
                return 'translate(' + source.y0 + ',' + source.x0 + ')';
            });

            /**
            * Append children for each that has them, then style them
            */
            nodeEnter.append('svg:circle').attr('r', 1e-6).style('fill',
            function (d) {
                return d._children ? 'lightsteelblue' : '#fff';
            });

            /**
             * Move the nodes to their proper locations
             */
            duration = d3.event && d3.event.altKey ? 5000 : 500;
            var nodeUpdate = node.transition().duration(duration).attr('transform', function (d) {
                /**
                 * I need to find out where d.x is set for this
                 */
                if (d.title === 'task_3') {
                    d.x = 570;
                }
                return 'translate(' + d.y + ',' + d.x + ')';
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

            /**
             * Append and fill text
             */
            appendText(nodeEnter);
            nodeUpdate.select('text').style('fill-opacity', 1);

            // Toggle each node on click
            toggleClick(nodeEnter);
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

    /**
     * Reworking of original tree graph creation
     */
    var updatedTree = function () {
        var heightWidthModifier = [20, 120, 20, 120],
            // Determine width based on modifier
            width = 1280 - heightWidthModifier[1] - heightWidthModifier[3],
            // Determine height based on modifier
            height = 800 - heightWidthModifier[0] - heightWidthModifier[2],
            i = 0,
            root;

        // Tree
        var tree = d3.layout.tree().size([height, width]);
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
            root = json;
            // Start project parent node in middle left
            root.x0 = height / 2;
            root.y0 = 0;

            // Initialize the display to show a few nodes.
            //root.children.forEach(toggleAll);
            //toggle(root.children[0]);
            //toggle(root.children[1].children[0]);
            createNodes(root);
        });

        /**
         * Toggle and update on click
         */
        var toggleClick = function (nodeEnter) {
            nodeEnter.on('click', function (d) {
                toggle(d);
                update(d);
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
            var nodes = tree.nodes(root).reverse();

            // Clone a node for examination
            _.forEach(nodes, function (node) {
                if (node.title === 'task_3') {
                    cloneAndConsole(node);
                }
            });

            /**
             * Determine x position based on how far down the hierarchy the node resides (0-ordered)
             */
            //nodes.forEach(function (d) {
            //    d.y = d.depth * 180;
            //});

            var mateNodes = function (stationary, moving) {
                stationary = {
                    title: stationary
                };
                moving = {
                    title: moving
                };
                console.log('stationary', stationary);
                console.log('moving', moving);
                _.forEach(nodes, function (node) {
                    if (node.title === stationary.title) {
                        stationary = node;
                    }
                    if (node.title === moving.title) {
                        moving = node;
                    }
                });
                console.log('stationary', stationary);
                console.log('moving', moving);
                if (_.isNumber(moving.x) && _.isNumber(moving.y) && _.isNumber(stationary.x) && _.isNumber(stationary.y)) {
                    moving.x = stationary.x;
                    moving.y = stationary.y;
                }
            };

            mateNodes('task_3', 'task_4');

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
                if (d.title === 'task_3') {
                    cloneAndConsole(d);
                }
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
    };

    return {
        restrict: 'A',
        templateUrl: 'overview/views/directiveTemplates/d3_test.html',
        scope: {
            data: '='
        },
        link: function (scope, element, attrs) {
            //treeGraph();
            updatedTree();
            //svgTest();
        }
    };
}]);