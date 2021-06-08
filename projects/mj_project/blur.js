export const blur = (data, property, numIterations) => {
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
