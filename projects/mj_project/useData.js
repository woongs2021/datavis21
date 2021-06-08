import { useState, useEffect } from 'react';
import { csv, timeParse, descending } from 'd3';
import { blur } from './blur';


export const n = 50;


const numBlurIterations = 15;





const csvUrl =
  'https://gist.githubusercontent.com/MoonjeongKim01/f13bca40487bafcfa337ac8fd25ea1a2/raw/95d08738eb6361ea46eeae4b531576c153102f8b/covid_19_dataset.csv';

const sum = (accumulator, currentValue) => accumulator + currentValue;

const parseDay = timeParse('%m/%d/%y');

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
      descending(a[a.length - 1].deathTotal, b[b.length - 1].deathTotal)
    )
    .slice(0, n);

  return top;
};

export const useData = () => {
  const [data, setData] = useState();

  useEffect(() => {
    csv(csvUrl).then((rawData) => {
      setData(transform(rawData));
    });
  }, []);

  return data;
};
