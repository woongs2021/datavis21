
d3.selectAll("button").on("click", function(){

	var csvFile = this.getAttribute("data-src")
	var barElements

	d3.csv(csvFile).then(function(data){

		// svg 요소의 크기를 구한다
		var svgEle = document.getElementById("myGraph")
		var svgWidth = window.getComputedStyle(svgEle, null).getPropertyValue("width")
		var svgHeight = window.getComputedStyle(svgEle, null).getPropertyValue("height")
		svgWidth = parseFloat(svgWidth) // remove px
		svgHeight = parseFloat(svgHeight) // remove px
		
		// 바 그래프의 폭과 그래프 간의 간격을 설정
		var barWidth = 25
		var barGap = 5
		
		// 바 그래프 요소
		var barElements
		
		// 그래프를 이동하기 위한 offset 변수 
		var offsetX = 30
		var offsetY = 10

		// 데이터 로딩
		var dataSet = []  // empty array to store data
		var dataLabel = []  // empty array to store label
		for(var i = 0; i < data.length; i++) {
			dataSet.push(data[i].Data)
			dataLabel.push(data[i].City)
		}

		// 요소 추가
		barElements = d3.select("#myGraph")
			.append("g")
			.attr("transform", "translate(" + offsetX + ", " + -offsetY + ")")
			.selectAll("rect")
			.data(dataSet)
		
		// 데이터 추가
		barElements.enter()
		.append("rect")
			.attr("class", "bar")
			.attr("height", 0) // 애니메이션 시작시 바의 크기
			.attr("width", barWidth)
			.attr("x", function(d, i) { return i * (barWidth + barGap) })
			.attr("y", svgHeight)
			// 마우스 이벤트 처리
			.on("mouseover", function() { 
				d3.select(this)
					.style("fill", "orange")
			})
			.on("mouseout", function() { 
				d3.select(this)
					.transition()
					.duration(1000)
					.style("fill", "#ccc")
			})
			.transition()
			.delay(function(d, i) { return i * 100 })
			.duration(1000)
			.attr("y", function(d, i) { return svgHeight - d*3 })
			.attr("height", function(d, i) { return d*3 })
		

		// 텍스트 요소 추가
		barElements.enter()
			.append("text")
			.attr("class", "barNum")
			.attr("x", function(d, i) { return i * (barWidth + barGap) + barWidth/2 })
			.attr("y", function(d, i) { return svgHeight - d*3 - 5 })
			.text(function(d, i) { return d })


		// y축을 표시하기 위한 스케일 설정
		var yScale = d3.scaleLinear()	// 직선의 스케일 사용
			.domain([0, 100])			// 현재 데이터가 300 미만임
			.range([300, 0])			// 그래프가 아래에서 위로 그려지기 때문에 range를 역으로 써주어야 함.

		// Axis 생성
		var yAxis = d3.axisLeft()
			.scale(yScale)

		// y-axis 표시
		d3.select("#myGraph")
			.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + offsetX + ", " + ((svgHeight-300)-offsetY) + ")")
			.call(yAxis)
		
		// x축을 표시
		d3.select("#myGraph")
			.append("rect")
			.attr("class", "axis_x")
			.attr("width", 560)
			.attr("height", 1)
			.attr("transform", "translate(" + offsetX + ", " + (svgHeight - offsetY) + ")")
			
		// x축 레이블 표시
		barElements.enter()
			.append("text")
			.attr("class", "barName")
			.attr("x", function(d, i) { return i * (barWidth + barGap) + barWidth/2 })
			.attr("y", svgHeight + offsetY - 15)
			.text(function(d, i) { return dataLabel[i] })
			
		// 데이터갱신
		barElements.attr("y", svgHeight).attr("height", 0)
			.transition()
			.delay(function(d, i) { return i * 100 })
			.duration(1000)
			.attr("y", function(d, i) { return svgHeight - d*3 })
			.attr("height", function(d, i) { return d*3 })

		
	});
});








