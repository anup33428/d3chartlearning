var margin = {
        top: 30,
        right: 120,
        bottom: 0,
        left: 120
    },
    width = 1060 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var d1Level = 0;
var d2Level = 0;

var d1Data = {};
var d2Data = {};


var x = d3.scale.linear()
    .range([0, width]);

var barHeight = 40;

var color = d3.scale.ordinal()
    .range(["steelblue", "#ccc"]);

var duration = 750,
    delay = 25;

var partition1 = d3.layout.partition()
    .value(function(d) {
        return d.size1;
    })
    .sort(null);

var partition2 = d3.layout.partition()
    .value(function(d) {
        return d.size2;
    })
    .sort(null); 

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("top");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", up);

svg.append("g")
    .attr("class", "x axis");

svg.append("g")
    .attr("class", "y axis")
    .append("line")
    .attr("y1", "100%");

/*d3.json("readme.json", function(error, root) {
  if (error) throw error;

  partition.nodes(root);
  x.domain([0, root.value]).nice();
  down(root, 0);
});*/

d3.text("visit-sequences.csv", function(text) {
    var csv = d3.csv.parseRows(text);
    json1 = buildHierarchy(csv);
    partition1.nodes(json1);

    json2 = buildHierarchy(csv);
    
    partition2.nodes(json2);
   
    x.domain([0, d3.max([json1.value, json2.value])]).nice();

    d1Data = json1;
    d2Data = json2;
    
    down(json1,0, json2);


    
    
});

function down(d1,i, d2) {

    if(d1Level !== 0){
        
        d1Data = d1Data.children[i];
     }  

     if(d1Level !== 0){
        d2Data = d2Data.children[i];
     } 


    if (!d1Data.children || this.__transition__) return;
    var end = duration + d1Data.children.length * delay;

    // Mark any currently-displayed bars as exiting.
    var exit = svg.selectAll(".enter")
        .attr("class", "exit");

    // Entering nodes immediately obscure the clicked-on bar, so hide it.
    exit.selectAll("rect").filter(function(p) {
            return p === d1Data;
        })
        .style("fill-opacity", 1e-6);

   var temp1 = d3.max(d1Data.children, function(d1Data) {
        return d1Data.value;
    });

    var temp2 = d3.max(d2Data.children, function(d2Data) {
        return d2Data.value;
    });


    x.domain([0, d3.max([temp1, temp2]
    )]).nice();
  

    // Enter the new bars for the clicked-on data.
    // Per above, entering bars are immediately visible.
    var enter = bar(d1Data)
        .attr("transform", stack(i))
        .style("opacity", 1);

    
        
    // Have the text fade-in, even though the bars are visible.
    // Color the bars as parents; they will fade to children if appropriate.
    enter.select("text").style("fill-opacity", 1e-6);
    enter.select("rect").style("fill", "DarkSlateGray");

    // Update the x-scale domain.

 

    // Update the x-axis.
    svg.selectAll(".x.axis").transition()
        .duration(duration)
        .call(xAxis);

    // Transition entering bars to their new position.
    var enterTransition = enter.transition()
        .duration(duration)
        .delay(function(d1Data, i) {
            return i * delay;
        })
        .attr("transform", function(d1Data, i) {
            return "translate(0," + barHeight * i * 3 + ")";
        });
    
    // Transition entering text.
    enterTransition.select("text")
        .style("fill-opacity", 1);

    // Transition entering rects to the new x-scale.
    enterTransition.select("rect")
        .attr("width", function(d1Data) {
            return x(d1Data.value);
        })
        .style("fill", function(d1Data) {
            return "DarkSlateGray";
        });




    enterTransition.select(".label")
        .attr("x", function(d1Data) {
            if ((x(d1Data.value) - 60) < 50) {
                return (x(d1Data.value) + 20);
            } else {
                return (x(d1Data.value) - 60);
            }
        });


    // Transition exiting bars to fade out.
    var exitTransition = exit.transition()
        .duration(duration)
        .style("opacity", 1e-6)
        .remove();

    // Transition exiting bars to the new x-scale.
    exitTransition.selectAll("rect")
        .attr("width", function(d1Data) {
            return x(d1Data.value);
        });

    // Rebind the current node to the background.
    svg.select(".background")
        .datum(d1Data)
        .transition()
        .duration(end);

    d1Data.index = i;


/******************************For Dataset2 *******************************************/

    var enter2 = bar2(d2Data)
        .attr("transform",stackOut(i))
        .style("opacity",1);

    enter2.select("text").style("fill-opacity", 1e-6);
    enter2.select("rect").style("fill", "DarkOliveGreen");

    var enter2Transition = enter2.transition()
        .duration(duration)
        .delay(function(d2Data, i) {
            return i * delay;
        })
        .attr("transform", function(d2Data, i) {
            return "translate(0," + ((barHeight * i * 3 )+barHeight) + ")";
        });

   // Transition entering text.
    enter2Transition.select("text")
        .style("fill-opacity", 1);

    // Transition entering rects to the new x-scale.
    enter2Transition.select("rect")
        .attr("width", function(d2Data) {
            return x(d2Data.value);
        })
        .style("fill", function(d2Data) {
            return "DarkOliveGreen";
        });




    enter2Transition.select(".label")
        .attr("x", function(d2Data) {
            if ((x(d2Data.value) - 60) < 50) {
                return (x(d2Data.value) + 20);
            } else {
                return (x(d2Data.value) - 60);
            }
        });


       
    d1Level++;
    d2Level++; 

}


function up(d1) {

      if (!d1.parent || this.__transition__) return;
    var end = duration + d1.children.length * delay;

    // Mark any currently-displayed bars as exiting.
    var exit = svg.selectAll(".enter")
        .attr("class", "exit");

     var temp1 = d3.max(d1Data.parent.children, function(d1Data) {
        return d1Data.value;
    });

    var temp2 = d3.max(d2Data.parent.children, function(d2Data) {
        return d2Data.value;
    });

    x.domain([0, d3.max([temp1, temp2])]).nice();
    

    // Enter the new bars for the clicked-on data's parent.
    var enter = bar(d1Data.parent)
        .attr("transform", function(d1, i) {
            return "translate(0," + barHeight * i * 3 + ")";
        })
        .style("opacity", 1e-6);

    // Color the bars as appropriate.
    // Exiting nodes will obscure the parent bar, so hide it.
    enter.select("rect")
        .style("fill", function(d1) {
            return "DarkSlateGray";
        })

    .filter(function(p) {
            return p === d1;
        })
        .style("fill-opacity", 1e-6);

    // Update the x-scale domain.

   
    // Update the x-axis.
    svg.selectAll(".x.axis").transition()
        .duration(duration)
        .call(xAxis);

    // Transition entering bars to fade in over the full duration.
    var enterTransition = enter.transition()
        .duration(end)
        .style("opacity", 1);

    // Transition entering rects to the new x-scale.
    // When the entering parent rect is done, make it visible!
    enterTransition.select("rect")
        .attr("width", function(d1) {
            return x(d1.value);
        })
        .each("end", function(p) {
            if (p === d1) d3.select(this).style("fill-opacity", null);
        });

    enterTransition.select(".label")
        .attr("x", function(d1) {
            if ((x(d1.value) - 60) < 50) {
                return (x(d1.value) + 20);
            } else {
                return (x(d1.value) - 60);
            }
        });

    // Transition exiting bars to the parent's position.
    var exitTransition = exit.selectAll("g").transition()
        .duration(duration)
        .delay(function(d1, i) {
            return i * delay;
        })
        .attr("transform", stack(d1.index));

    // Transition exiting text to fade out.
    exitTransition.select("text")
        .style("fill-opacity", 1e-6);

    // Transition exiting rects to the new scale and fade to parent color.
    exitTransition.select("rect")
        .attr("width", function(d1) {
            return x(d1.value);
        })
        .style("fill", "DarkSlateGray");

    // Remove exiting nodes when the last child has finished transitioning.
    exit.transition()
        .duration(end)
        .remove();

    // Rebind the current parent to the background.
    svg.select(".background")
        .datum(d1.parent)
        .transition()
        .duration(end);


/***************************for Bar2************************************/


    var enter2 = bar2(d2Data.parent)
        .attr("transform", function(d2Data, i) {
            return "translate(0," + ((barHeight * i * 3 )+barHeight) + ")";
        });


        enter2.select("rect")
        .style("fill", "DarkOliveGreen")
 
        var enterTransition2 = enter2.transition()
        .duration(end)
        .style("opacity", 1);


    enterTransition2.select(".label")
        .attr("x", function(d2Data) {
            if ((x(d2Data.value) - 60) < 50) {
                return (x(d2Data.value) + 20);
            } else {
                return (x(d2Data.value) - 60);
            }
        }); 

        enter2.select("rect")
        .style("fill", function(d1) {
            return "DarkOliveGreen";
        })

    /*
    enter2.select("text").style("fill-opacity", 1e-6);
    enter2.select("rect").style("fill", color(true));

    var enter2Transition = enter2.transition()
        .duration(duration)
        .delay(function(d2Data, i) {
            return i * delay;
        })
        .attr("transform", function(d2Data, i) {
            return "translate(0," + ((barHeight * i * 3 )+barHeight) + ")";
        });

   // Transition entering text.
    enter2Transition.select("text")
        .style("fill-opacity", 1);

    // Transition entering rects to the new x-scale.
    enter2Transition.select("rect")
        .attr("width", function(d2Data) {
            return x(d2Data.value);
        })
        .style("fill", function(d2Data) {
            return color(!!d2Data.children);
        });




    enter2Transition.select(".label")
        .attr("x", function(d2Data) {
            if ((x(d2Data.value) - 60) < 50) {
                return (x(d2Data.value) + 20);
            } else {
                return (x(d2Data.value) - 60);
            }
        });



*/

    if(d1Level !== 0){
        
        d1Data = d1Data.parent;
     }  

     if(d1Level !== 0){
        d2Data = d2Data.parent;
     } 

    d1Level--;
    d2Level--;  
}

// Creates a set of bars for the given data node, at the specified index.
function bar(d) {

    var bar = svg.insert("g", ".y.axis")
        .attr("class", "enter")
        .attr("transform", "translate(0,5)")
        .selectAll("g")
        .data(d.children)
        .enter().append("g")
        .style("cursor", function(d) {
            return !d.children ? null : "pointer";
        })
        .on("click", down);

    /*var groups = plottingArea.selectAll("g.groups")
                .data(d1);   */ 

    bar.append("text")
        .attr("x", -6)
        .attr("y", barHeight / 2)
        .attr("dy", "1.5em")
        .style("text-anchor", "end")
        .text(function(d) {
            return d.name;
        });



    bar.append("rect")
        .attr("width", function(d) {
            return x(d.value);
        })
        .attr("height", barHeight);

    bar.append("text")
        .attr("class", "label")
        .attr("x", function(d) {
            return x(d.value);
        })
        .attr("y", barHeight / 2)
        .attr("fill", "black")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.value;
        });
    return bar;
}

function bar2(d) {
    var bar = svg.insert("g", ".y.axis")
        .attr("class", "enter")
        .attr("transform", "translate(0,5)")
        .selectAll("g")
        .data(d.children)
        .enter().append("g")
        .style("cursor", function(d) {
            return !d.children ? null : "pointer";
        })
        .on("click", down);

        
    bar.append("rect")
        .attr("width", function(d) {
            return x(d.value);
        })
        .attr("height", barHeight);

    bar.append("text")
        .attr("class", "label")
        .attr("x", function(d) {
            return x(d.value);
        })
        .attr("y", barHeight / 2)
        .attr("fill", "black")
        .attr("dy", ".35em")
        .text(function(d) {
            return d.value;
        });
    return bar;
}

// A stateful closure for stacking bars horizontally.
function stack(i) {
    var x0 = 0;
    return function(d) {
        var tx = "translate(" + x0 + "," + barHeight * i * 1.2 + ")";
        x0 += x(d.value);
        return tx;
    };
}
function stackOut(i) {
    var x0 = 0;
    return function(d) {
        var tx = "translate(" + x0 + "," + ((barHeight * i * 1.2 )+ barHeight )+ ")";
        x0 += x(d.value);
        return tx;
    };
}

function buildHierarchy(csv) {
    var root = {
        "name": "root",
        "children": []
    };
    for (var i = 0; i < csv.length; i++) {
        var sequence = csv[i][0];
        var size1 = +csv[i][1];
        var size2 = +csv[i][2];
        if (isNaN(size1) || (isNaN(size2))) { // e.g. if this is a header row
            continue;
        }
        var parts = sequence.split("-");
        var currentNode = root;
        for (var j = 0; j < parts.length; j++) {
            var children = currentNode["children"];
            var nodeName = parts[j];
            var childNode;
            if (j + 1 < parts.length) {
                // Not yet at the end of the sequence; move down the tree.
                var foundChild = false;
                for (var k = 0; k < children.length; k++) {
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                // If we don't already have a child node for this branch, create it.
                if (!foundChild) {
                    childNode = {
                        "name": nodeName,
                        "children": []
                    };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                // Reached the end of the sequence; create a leaf node.
                childNode = {
                    "name": nodeName,
                    "size1": size1,
                    "size2": size2
                };
                children.push(childNode);
            }
        }
    }
    return root;
}