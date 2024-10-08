function calculateAlligator(closePrices) {
  const jawPeriod = 13;
  const teethPeriod = 8;
  const lipsPeriod = 5;

  const jaw = [];
  const teeth = [];
  const lips = [];

  for (let i = 0; i < closePrices.length; i++) {
    const jawStartIndex = i - jawPeriod + 1;
    const teethStartIndex = i - teethPeriod + 1;
    const lipsStartIndex = i - lipsPeriod + 1;

    if (jawStartIndex < 0 || teethStartIndex < 0 || lipsStartIndex < 0) {
      jaw.push(null);
      teeth.push(null);
      lips.push(null);
      continue;
    }

    const jawValues = closePrices.slice(jawStartIndex, i + 1);
    const teethValues = closePrices.slice(teethStartIndex, i + 1);
    const lipsValues = closePrices.slice(lipsStartIndex, i + 1);

    const jawSMA = jawValues.reduce((acc, val) => acc + val, 0) / jawPeriod;
    const teethSMA = teethValues.reduce((acc, val) => acc + val, 0) / teethPeriod;
    const lipsSMA = lipsValues.reduce((acc, val) => acc + val, 0) / lipsPeriod;

    jaw.push(jawSMA);
    teeth.push(teethSMA);
    lips.push(lipsSMA);
  }

  return { jaw, teeth, lips };
}

module.exports = calculateAlligator;