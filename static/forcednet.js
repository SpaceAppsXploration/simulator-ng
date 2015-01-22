/**
 * Created by lorenzo on 20/01/15.
 */
//Constants for the SVG
//Constants for the SVG
var width = 700,
    height = 500;

//Set up the colour scale
var color = d3.scale.category20();

function zoom() {
    //console.log("here", d3.event.translate, d3.event.scale);
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

//d3.behavior.zoom().translate([50,150]).scale(.1);

//Set up the force layout
var force = d3.layout.force()
    .linkDistance(200)
    .linkStrength(0.3)
    .size([width, height]);

//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var svg = d3.select("#diagram-1").append("svg")
    .attr("width", width)
    .attr("height", height)
    //.append("g")
    .call(d3.behavior.zoom().on("zoom", zoom))
        .on("dblclick.zoom", null)
        .append("g");


//Creates the graph data structure out of the json data
force.nodes(graph.nodes)
    .links(graph.links)
    .start();

//Create all the line svgs but without locations yet
var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    .style("opacity", 0)
    .style("stroke-width", function (d) {
        return Math.sqrt(1);
    });


//Do the same with the circles for the nodes - no
var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 8)
    .style("fill", function (d) {
        return color(d.type);
    })
    .call(force.drag)
    .style("fill", function(d) { return color(d.type); })
    //.on('click', connectedNodes) //Added code
    .on('click', connectedNodes); //Added code


    node.append("title")
        .text(function(d) { return d["name"]; });
        force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    });


//Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements
force.on("tick", function () {
    link.attr("x1", function (d) {
        return d.source.x;
    })
        .attr("y1", function (d) {
        return d.source.y;
    })
        .attr("x2", function (d) {
        return d.target.x;
    })
        .attr("y2", function (d) {
        return d.target.y;
    });

    node.attr("cx", function (d) {
        return d.x;
    })
        .attr("cy", function (d) {
        return d.y;
    })
        .each(collide(.5));

});

//---Insert-------

//Toggle stores whether the highlighting is on
var toggle = 0;

//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < graph.nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
}

graph.links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
});

console.log(linkedByIndex)

var mapped = null;
//This function looks up whether a pair are neighbours
function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];


}

function connectedNodes() {
    if (d3.event.defaultPrevented) return;
    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        d = d3.select(this).node().__data__;
        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });

        link.style("opacity", function (o) {
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        });

        //Reduce the op

        var a = '<a>go to link</a>';
        var elem = $('#infos')
        var infos = '<ul><li>On the Graph you can see all the nodes linked to the clicked node</li>' +
            '<li>Click to visit the selected node >>> <a href="/get/'+ d._id +'/" target="_blank">"'+ d.name +'" </a></li>'+
            '<li>or click the graph again to select another node</li></ul>'
        elem.append(infos);
        elem.fadeIn( "slow");
        toggle = 1;
    } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 0);

        $('#infos').text('');
        toggle = 0;
    }

};

// Resolves collisions between d and all other circles.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(node);
  return function(d) {
    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}

