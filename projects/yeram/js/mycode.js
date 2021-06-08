    var dataset = [ {x : '마켓컬리', y : 126}
                        , {x : '이마트 저탄소 인증상품', y : 48}
                        , {x : 'GS리테일', y : 250}
                        , {x : 'CU', y : 90}
                        , {x : 'SSG닷컴', y : 130}];
 
    var svg = d3.select("svg");
    var width  = parseInt(svg.style("width"), 10) -30;
    var height = parseInt(svg.style("height"), 10)-20;
    var svgG = svg.append("g")
        .attr("transform", "translate(30, 0)");
    var xScale = d3.scaleBand()
        .domain(dataset.map(function(d) { return d.x;} ))
        .range([0, width]).padding(0.2);
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d){ return d.y; })])
        .range([height, 0]);
 
    svgG.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)
            .tickSize(-height)
        );
 
    svgG.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-width)
        );
 
    var barG = svgG.append("g");
 
    barG.selectAll("rect")
        .data(dataset)
        .enter().append("rect")
            .attr("class", "bar")
            .attr("height", function(d, i) {return height-yScale(d.y)})
            .attr("width", xScale.bandwidth())
            .attr("x", function(d, i) {return xScale(d.x)})
            .attr("y", function(d, i) {return yScale(d.y)})
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout",  function() { tooltip.style("display", "none"); })
            .on("mousemove", function(d) {
                tooltip.style("left", (d3.event.pageX + 10) + "px");
                tooltip.style("top", (d3.event.pageY - 10) + "px");
                tooltip.text(d.y); 
            });
 
    barG.selectAll("text")
        .data(dataset)
        .enter().append("text")
        .text(function(d) {return d.y})
            .attr("class", "text")
            .attr("x", function(d, i) {return xScale(d.x)+xScale.bandwidth()/2})
            .style("text-anchor", "middle")
            .attr("y", function(d, i) {return yScale(d.y) + 15});
 
    var tooltip = d3.select("body").append("div")
        .attr("class", "toolTip")
        .style("display", "none");
 