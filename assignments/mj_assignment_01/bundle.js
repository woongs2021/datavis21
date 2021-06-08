(function (React$1, ReactDOM, d3) {
  'use strict';

  var React$1__default = 'default' in React$1 ? React$1['default'] : React$1;
  ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;

  const csvUrl =
  'https://gist.githubusercontent.com/curran/0ac4077c7fc6390f5dd33bf5c06cb5ff/raw/605c54080c7a93a417a3cea93fd52e7550e76500/UN_Population_2019.csv';

  const useData = () => {
    const [data, setData] = React$1.useState(null);

    React$1.useEffect(() => {
      const row = d => {
        d.Population = +d['2020'] * 1000;
        return d;
      };
      d3.csv(csvUrl, row).then(data => {
        setData(data.slice(0, 10));
      });
    }, []);
    
    return data;
  };

  const AxisBottom = ({ xScale, innerHeight, tickFormat }) =>
    xScale.ticks().map(tickValue => (
      React.createElement( 'g', { className: "tick", key: tickValue, transform: `translate(${xScale(tickValue)},0)` },
        React.createElement( 'line', { y2: innerHeight }),
        React.createElement( 'text', { style: { textAnchor: 'middle' }, dy: ".71em", y: innerHeight + 3 },
          tickFormat(tickValue)
        )
      )
    ));

  const AxisLeft = ({ yScale }) =>
    yScale.domain().map(tickValue => (
      React.createElement( 'g', { className: "tick" },
        React.createElement( 'text', {
          key: tickValue, style: { textAnchor: 'end' }, x: -3, dy: ".32em", y: yScale(tickValue) + yScale.bandwidth() / 2 },
          tickValue
        )
      )
    ));

  const Marks = ({
    data,
    xScale,
    yScale,
    xValue,
    yValue,
    tooltipFormat
  }) =>
    data.map(d => (
      React.createElement( 'rect', {
        className: "mark", key: yValue(d), x: 0, y: yScale(yValue(d)), width: xScale(xValue(d)), height: yScale.bandwidth() },
        React.createElement( 'title', null, tooltipFormat(xValue(d)) )
      )
    ));

  const width = 960;
  const height = 500;
  const margin = { top: 20, right: 30, bottom: 65, left: 220 };
  const xAxisLabelOffset = 50;

  const App = () => {
    const data = useData();

    if (!data) {
      return React$1__default.createElement( 'pre', null, "wait a moment please :)" );
    }

    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    const yValue = d => d.Country;
    const xValue = d => d.Population;

    const siFormat = d3.format('.2s');
    const xAxisTickFormat = tickValue => siFormat(tickValue).replace('G', 'B');

    const yScale = d3.scaleBand()
      .domain(data.map(yValue))
      .range([0, innerHeight])
      .paddingInner(0.15);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, xValue)])
      .range([0, innerWidth]);

    return (
      React$1__default.createElement( 'svg', { width: width, height: height },
        React$1__default.createElement( 'g', { transform: `translate(${margin.left},${margin.top})` },
          React$1__default.createElement( AxisBottom, {
            xScale: xScale, innerHeight: innerHeight, tickFormat: xAxisTickFormat }),
          React$1__default.createElement( AxisLeft, { yScale: yScale }),
          React$1__default.createElement( 'text', {
            className: "axis-label", x: innerWidth / 2, y: innerHeight + xAxisLabelOffset, textAnchor: "middle" }, "Ranked by most populous countries"),
          React$1__default.createElement( Marks, {
            data: data, xScale: xScale, yScale: yScale, xValue: xValue, yValue: yValue, tooltipFormat: xAxisTickFormat })
        )
      )
    );
  };
  const rootElement = document.getElementById('root');
  ReactDOM.render(React$1__default.createElement( App, null ), rootElement);

}(React, ReactDOM, d3));