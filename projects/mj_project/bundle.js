(function (React$1, ReactDOM, d3$1) {
  'use strict';

  var React$1__default = 'default' in React$1 ? React$1['default'] : React$1;
  ReactDOM = ReactDOM && Object.prototype.hasOwnProperty.call(ReactDOM, 'default') ? ReactDOM['default'] : ReactDOM;

  const blur = (data, property, numIterations) => {
    const n = data.length;
    for (let j = 0; j < numIterations; j++) {
      for (let i = 0; i < n; i++) {
        const previous = data[i === 0 ? i : i - 1];
        const current = data[i];
        const next = data[i === n - 1 ? i : i + 1];
        const sum = previous[property] + current[property] + next[property];
        current[property] = sum / 3;
      }
    }

    return data.slice(numIterations, data.length - numIterations);
  };


  const n = 50;


  const numBlurIterations = 15;



  const csvUrl =
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';

  const parseDay = d3$1.timeParse('%m/%d/%y');

  const transform = (rawData) => {

    const countriesData = rawData.filter((d) => !d['Province/State']);


    const days = rawData.columns.slice(4);
    const transformed = countriesData.map((d) => {
      const countryName = d['Country/Region'];

      let previousDayDeathTotal = +d[days[0]];
      const countryTimeseries = days.map((day) => {
        const deathTotal = +d[day];
        const deathDaily = Math.max(0, deathTotal - previousDayDeathTotal);
        previousDayDeathTotal = deathTotal;
        return {
          date: parseDay(day),
          deathTotal,
          deathDaily,
          countryName,
        };
      });

      const countryTimeseriesBlurred = blur(
        countryTimeseries,
        'deathDaily',
        numBlurIterations
      );

      countryTimeseriesBlurred.countryName = countryName;

      return countryTimeseriesBlurred;
    });


    const top = transformed
      .sort((a, b) =>
        d3$1.descending(a[a.length - 1].deathTotal, b[b.length - 1].deathTotal)
      )
      .slice(0, n);

    return top;
  };

  const useData = () => {
    const [data, setData] = React$1.useState();

    React$1.useEffect(() => {
      d3$1.csv(csvUrl).then((rawData) => {
        setData(transform(rawData));
      });
    }, []);

    return data;
  };

  const dateFormat = d3$1.timeFormat("%-m/%-d");
  const XAxis = ({ xScale, innerHeight }) => {
    const ref = React$1.useRef();
    React$1.useEffect(() => {
      const xAxisG = d3$1.select(ref.current);
      const xAxis = d3$1.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(18)
        .ticks(10)
        .tickFormat(dateFormat);
      xAxisG.call(xAxis);
    }, [innerHeight, xScale]);
    return React.createElement( 'g', { transform: `translate(0,${innerHeight})`, ref: ref });
  };

  const YAxis = ({ yScale, innerWidth }) => {
    const ref = React$1.useRef();
    React$1.useEffect(() => {
      const yAxisG = d3$1.select(ref.current);
      const yAxis = d3$1.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(3)
        .ticks(10, "~s");
  
      yAxisG.call(yAxis);
    }, [innerWidth, yScale]);
    return React.createElement( 'g', { ref: ref });
  };

  const VoronoiOverlay = ({
    margin,
    innerWidth,
    innerHeight,
    allData,
    lineGenerator,
    onHover
  }) => {
    return React$1.useMemo(() => {
      const points = allData.map(d => [
        lineGenerator.x()(d),
        lineGenerator.y()(d)
      ]);
      const delaunay = d3.Delaunay.from(points);
      const voronoi = delaunay.voronoi([
        0,
        0,
        innerWidth + margin.right,
        innerHeight
      ]);
      return (
        React.createElement( 'g', { className: "voronoi" },
          points.map((point, i) => (
            React.createElement( 'path', {
              onMouseEnter: () => onHover(allData[i]), d: voronoi.renderCell(i) })
          ))
        )
      );
    }, [allData, lineGenerator, innerWidth, innerHeight, onHover]);
  };

  const xValue = (d) => d.date;
  const yValue = (d) => d.deathDaily;

  const margin = { top: 50, right: 40, bottom: 80, left: 100 };

  const formatDate = d3$1.timeFormat('%b %d, %Y');
  const formatComma = d3$1.format(',');

  const Tooltip = ({ activeRow, className }) => (
    React$1__default.createElement( 'text', { className: className, x: -10, y: -10, 'text-anchor': "end" },
      activeRow.countryName, ": Approximately ", formatComma(activeRow.deathTotal), ' ',
      activeRow.deathTotal > 1 ? 'deaths' : 'death', " on", ' ',
      formatDate(activeRow.date)
    )
  );

  const LineChart = ({ data, width, height }) => {
    const [activeRow, setActiveRow] = React$1.useState();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const allData = React$1.useMemo(
      () =>
        data.reduce(
          (accumulator, countryTimeseries) =>
            accumulator.concat(countryTimeseries),
          []
        ),
      [data]
    );

    const epsilon = 1;

    const xScale = React$1.useMemo(
      () => d3$1.scaleTime().domain(d3$1.extent(allData, xValue)).range([0, innerWidth]),
      [allData, xValue]
    );

    const yScale = React$1.useMemo(
      () =>
        d3$1.scaleLog()
          .domain([epsilon, d3$1.max(allData, yValue)])
          .range([innerHeight, 0]),
      [epsilon, allData, yValue]
    );

    const lineGenerator = React$1.useMemo(
      () =>
        d3$1.line()
          .x((d) => xScale(xValue(d)))
          .y((d) => yScale(epsilon + yValue(d))),
      [xScale, xValue, yScale, yValue, epsilon]
    );

    const mostRecentDate = xScale.domain()[1];

    const handleVoronoiHover = React$1.useCallback(setActiveRow, []);

    return (
      React$1__default.createElement( 'svg', { width: width, height: height },
        React$1__default.createElement( 'g', { transform: `translate(${margin.left},${margin.top})` },
          React$1__default.createElement( XAxis, { xScale: xScale, innerHeight: innerHeight }),
          React$1__default.createElement( YAxis, { yScale: yScale, innerWidth: innerWidth }),
          data.map((countryTimeseries) => {
            return (
              React$1__default.createElement( 'path', {
                className: "marker-line", d: lineGenerator(countryTimeseries) })
            );
          }),
          React$1__default.createElement( 'text', { className: "title" }, "Daily Coronavirus Deaths Over Time by Country (Top ", n, ' ', "countries by cumulative deaths)"),
          React$1__default.createElement( 'text', {
            className: "axis-label", transform: `translate(-40,${innerHeight / 2}) rotate(-90)`, 'text-anchor': "middle" }, "Log of Daily Deaths"),
          React$1__default.createElement( 'text', {
            className: "axis-label", 'text-anchor': "middle", 'alignment-baseline': "hanging", transform: `translate(${innerWidth / 2},${innerHeight + 40})` }, "Time"),
          React$1__default.createElement( VoronoiOverlay, {
            margin: margin, onHover: handleVoronoiHover, innerHeight: innerHeight, innerWidth: innerWidth, allData: allData, lineGenerator: lineGenerator }),
          activeRow ? (
            React$1__default.createElement( React$1__default.Fragment, null,
              React$1__default.createElement( 'path', {
                className: "marker-line active", d: lineGenerator(
                  data.find(
                    (countryTimeseries) =>
                      countryTimeseries.countryName === activeRow.countryName
                  )
                ) }),
              React$1__default.createElement( 'g', {
                transform: `translate(${lineGenerator.x()(
                activeRow
              )},${lineGenerator.y()(activeRow)})` },
                React$1__default.createElement( 'circle', { r: 4 }),
                React$1__default.createElement( Tooltip, { activeRow: activeRow, className: "tooltip-stroke" }),
                React$1__default.createElement( Tooltip, { activeRow: activeRow, className: "tooltip" })
              )
            )
          ) : null
        )
      )
    );
  };

  const width = window.innerWidth;
  const height = window.innerHeight;

  const App = () => {
    const data = useData();
    return data
      ? React$1__default.createElement( LineChart, { data: data, width: width, height: height })
      : React$1__default.createElement( 'div', null, "Loading..." );
  };

  const rootElement = document.getElementById('root');
  ReactDOM.render(React$1__default.createElement( App, null ), rootElement);

}(React, ReactDOM, d3));

