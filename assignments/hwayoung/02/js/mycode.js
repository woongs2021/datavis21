var width = 960, height = 800

//create a canvas to put the force directed graph
var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
    
var color = d3.scaleOrdinal(d3.schemeCategory10)

d3.json("hwayoung/02/data/gameofthrones.json").then(function(graph) {
  var nodes_data = graph.nodes
  var links_data = graph.links

  //set up the simulation 
  var simulation = d3.forceSimulation()
    //add nodes
    .nodes(nodes_data);

  //add the link force (use id accessor to use named sources and targets)
  var link_force =  d3.forceLink(links_data)
    .id(function(d, i) { return i; });

  simulation
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("links", link_force);

  //add tick instructions: 
  simulation.on("tick", tickActions );

  //draw circles for the links 
  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes_data)
    .enter().append("circle")
    .attr("r", 10)
    .attr("fill", function(d) { return color(d.zone); })

  //draw lines for the links 
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links_data)
    .enter().append("line") //링크의 개수만큼 선을 추가
    .style("stroke-width", function(d) { return Math.sqrt(d.weight) });

  //add label text 
  var text = svg.append("g")
    .attr("class", "label")
    .selectAll("text")
    .data(nodes_data)
    .enter().append("text")
    .text(function(d) { return d.character; });

  //setup a drag_handler
  var drag_handler = d3.drag()
    .on("start", drag_start)
    .on("drag", drag_drag)
    .on("end", drag_end);

  //call drag_handler
  drag_handler(node)

  //drag handler (d = node)
  function drag_start(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function drag_drag(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function drag_end(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  //tick instruction
  function tickActions() {
    //update circle positions each tick of the simulation 
    node
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })

    //update label for each node
    text
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    //update link positions
    link
      .attr("x1", function(d) { return d.source.x; }) //각 링크의 소스와 타겟값 변경
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });
  } 
});