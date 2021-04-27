// bar graph를 위한 dataset
var dataSet = [300, 130, 5, 60, 240]

// visualization code
d3.select("#myGraph")
	.selectAll("rect")
	.data(dataSet)
	.enter()
	.append("rect")
	.attr("x", 0)
	.attr("y", function(d, i) { return i * 25 + 30 })
	.attr("height", 20)
	.attr("width", 0)
	.transition()
	.delay(function(d, i){ return i * 500; })	// 0.5초마다 그리도록 대기 시간을 설정
	.duration(2500)								// 2.5초에 걸쳐 애니메이션화 함
	.attr("width", function(d, i) { return d })