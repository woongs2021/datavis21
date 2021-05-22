var width = 960, height = 800, radius=10;

//create a canvas to put the force directed graph
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);


// map data to a visual representation
var color = d3.scaleQuantize([1,93957], d3.schemeBlues[9]);

// create layers: map and places
var map = svg.append("g").attr("id", "map"),
    population = svg.append("g").attr("id", "population");

// d3 Projection
var projection = d3.geoMercator()
    .center([126.9895, 37.5651])
    .scale(100000)
    .translate([width/2, height/2]);

// define path generator to convert GeoJSON to SVG paths using the projection
var path = d3.geoPath().projection(projection);

d3.json("data/seoul_municipalities_topo_simple.json").then(function(data) {

    d3.csv("data/population.csv").then(function (popdata) {
        
        var features = topojson.feature(data, data.objects.seoul_municipalities_geo).features;
        var tempPop = 0;

        // create paths per GeoJSON features
        map.selectAll("path")
            .data(features)
            .enter().append("path")
            //.attr("class", function(d) { return "municipality c" + d.properties.code })
            .attr("fill", function(d, i) {
                popdata.forEach(element => {
                    if (element.gu == d.properties.name) {
                        tempPop = element.total;
                    }
                    //console.log(element.gu, d.properties.name, tempPop);
                });
                console.log(d.properties.name, tempPop)
                return color(tempPop);
            })
            .attr("d", path);
        
        // create text per each GeoJSON features
        map.selectAll("text")
            .data(features)
            .enter().append("text")
            .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
            //.attr("class", "municipality-label")
            .attr("dy", "0.5em")
            .text(function(d) { return d.properties.name; })

        // create legend by calling color-legend.js in index.html
        svg.append("g")
            .attr("transform", "translate(480,20)")
            .append(() => legend({color, title: "서울시 자치구별 65세 이상 인구통계", width: 420}))

    });
});
 