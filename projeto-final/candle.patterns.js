const isGreen = (candle) => candle.close > candle.open;
const isRed = (candle) => candle.close < candle.open;
const isWeakCandle = (candle) => {
  const bodySize = Math.abs(candle.open - candle.close);
  const shadowSize = Math.max(candle.high - Math.max(candle.open, candle.close), Math.min(candle.open, candle.close) - candle.low);
  return bodySize < shadowSize;
};

const isStrongCandle = (candle) => {
  const bodySize = Math.abs(candle.open - candle.close);
  const shadowSize = Math.max(candle.high - Math.max(candle.open, candle.close), Math.min(candle.open, candle.close) - candle.low);
  return bodySize > 2 * shadowSize;
};


// Define uma função para detectar o padrão "Três Corvos Pretos"
const detectThreeBlackCrows = (candles) => {
  if (candles.length < 3) {
    return false;
  }

  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2];
  const secondLastCandle = candles[candles.length - 3];
  const thirdLastCandle = candles[candles.length - 4];

  const lastBodySize = Math.abs(lastCandle.open - lastCandle.close);
  const secondLastBodySize = Math.abs(secondLastCandle.open - secondLastCandle.close);
  const thirdLastBodySize = Math.abs(thirdLastCandle.open - thirdLastCandle.close);


  if (isRed(actualCandle)) {
    if (lastCandle.close < lastCandle.open && secondLastCandle.close < secondLastCandle.open && thirdLastCandle.close < thirdLastCandle.open) {
      if (lastCandle.close < secondLastCandle.close && secondLastCandle.close < thirdLastCandle.close) {
        if (lastBodySize > (lastCandle.high - lastCandle.low) * 0.6 && secondLastBodySize > (secondLastCandle.high - secondLastCandle.low) * 0.6 && thirdLastBodySize > (thirdLastCandle.high - thirdLastCandle.low) * 0.6) {
          return true;
        }
      }
    }
  }

  return false;
};


const detectThreeWhiteSoldiers = (candles) => {
  if (candles.length < 3) {
    return false;
  }

  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2];
  const secondLastCandle = candles[candles.length - 3];
  const thirdLastCandle = candles[candles.length - 4];

  const lastBodySize = Math.abs(lastCandle.open - lastCandle.close);
  const secondLastBodySize = Math.abs(secondLastCandle.open - secondLastCandle.close);
  const thirdLastBodySize = Math.abs(thirdLastCandle.open - thirdLastCandle.close);

  if (isGreen(actualCandle)) {
    if (lastCandle.close > lastCandle.open && secondLastCandle.close > secondLastCandle.open && thirdLastCandle.close > thirdLastCandle.open) {
      if (lastCandle.close > secondLastCandle.close && secondLastCandle.close > thirdLastCandle.close) {
        if (lastBodySize > (lastCandle.high - lastCandle.low) * 0.6 && secondLastBodySize > secondLastCandle.high - secondLastCandle.low * 0.6 && thirdLastBodySize > thirdLastCandle.high - thirdLastCandle.low * 0.6) {
          return true;
        }
      }
    }
  }

  return false;
};


function detectHaramiTop(candles) {
  // Check if there are at least two candles in the series
  if (candles.length < 2) {
    return false;
  }

  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2];
  const prevCandle = candles[candles.length - 3];

  if (isRed(actualCandle)) {
    if (lastCandle.close < lastCandle.open && prevCandle.close > prevCandle.open) {
      if (lastCandle.open > prevCandle.close && lastCandle.close < prevCandle.open) {
        return true;
      }
    }
  }

  return false;
};

function detectHaramiBottom(candles) {
  if (candles.length < 2) {
    return false;
  }
  
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2];
  const secondLastCandle = candles[candles.length - 3];
    
  if (isGreen(actualCandle)) {
    if (lastCandle.close > lastCandle.open && secondLastCandle.close < secondLastCandle.open) {
      if (lastCandle.close < secondLastCandle.open && lastCandle.open > secondLastCandle.close) {
        return true;
      }
    }
  }
  
  return false;
};


function morningStar(candles) {
  const actualCandle = candles[candles.length - 1];
  const len = candles.length;
  const candle = candles[len - 2];
  const prevCandle = candles[len - 3];
  // console.log(candle);
  const bodySize = Math.abs(candle.open - candle.close);
  const lowerShadow = Math.abs(candle.low - Math.min(candle.open, candle.close));
  const upperShadow = Math.abs(candle.high - Math.max(candle.open, candle.close));
  
  if (isRed(prevCandle) 
      && isGreen(actualCandle)
      && candle.close > candle.open 
      && lowerShadow >= 4 * bodySize 
      && upperShadow >= 4 * bodySize) {
    return true;
  } else {
    return false;
  }
};

function shootingStar(candles) {
  const actualCandle = candles[candles.length - 1];
  const len = candles.length;
  const candle = candles[len - 2];
  const prevCandle = candles[len - 3];
  // console.log(candle);
  const bodySize = Math.abs(candle.open - candle.close);
  const lowerShadow = Math.abs(candle.low - Math.min(candle.open, candle.close));
  const upperShadow = Math.abs(candle.high - Math.max(candle.open, candle.close));
  
  if (isGreen(prevCandle) 
      && isRed(actualCandle)
      && candle.close < candle.open 
      && lowerShadow >= 4 * bodySize 
      && upperShadow >= 4 * bodySize) {
    return true;
  } else {
    return false;
  }
};

const violinadaEmCima = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2]; // pega o último candle
  const prevCandle = candles[candles.length - 3]; // pega o penúltimo candle
  // console.log({lastCandle});
  // Verifica se o último candle é uma "violinada" (martelo com pavio inferior grande)
  const isViolinada = isGreen(prevCandle)
    && isRed(actualCandle)
    && lastCandle.close < lastCandle.open
    && (lastCandle.high - lastCandle.open) / (lastCandle.open - lastCandle.close) >= 5
    && (lastCandle.open - lastCandle.low) <= (0.1 * (lastCandle.open - lastCandle.close)); // Verificação da sombra inferior

  return isViolinada
};


const violinadaEmbaixo = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2]; // pega o último candle
  const prevCandle = candles[candles.length - 3]; // pega o penúltimo candle

  // Função para verificar se um candle é vermelho
  const isRed = (candle) => candle.open > candle.close;

  // Verifica se o último candle é uma "violinada" (com pavio inferior grande e sombra superior pequena ou inexistente)
  const isViolinada = isRed(prevCandle)
    && lastCandle.close > lastCandle.open
    && (lastCandle.close - lastCandle.low) / (lastCandle.close - lastCandle.open) >= 5
    && (lastCandle.high - lastCandle.close) / (lastCandle.close - lastCandle.open) <= 0.1; // Verificação da sombra superior

  return isViolinada;
};


const hammerUp = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2]; // pega o último candle
  const prevCandle = candles[candles.length - 3]; // pega o penúltimo candle
  const bodySize = Math.abs(lastCandle.open - lastCandle.close);
  const lowerShadow = Math.abs(lastCandle.low - Math.min(lastCandle.open, lastCandle.close));
  const upperShadow = Math.abs(lastCandle.high - Math.max(lastCandle.open, lastCandle.close));
  if (isStrongCandle(prevCandle)
    && isGreen(prevCandle)
    && isRed(actualCandle)
    // && lastCandle.close > lastCandle.open
    && bodySize > 50 
    && lowerShadow < bodySize 
    && upperShadow >= 3 * bodySize) {
    return true;
  } else {
    return false;
  }
};

const hammerDown = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 5]; // pega o último candle
  const prevCandle = candles[candles.length - 3]; // pega o penúltimo candle
  const bodySize = Math.abs(lastCandle.open - lastCandle.close);
  const lowerShadow = Math.abs(lastCandle.low - Math.min(lastCandle.open, lastCandle.close));
  const upperShadow = Math.abs(lastCandle.high - Math.max(lastCandle.open, lastCandle.close));
  if (isStrongCandle(prevCandle)
    && isRed(prevCandle)
    && isGreen(actualCandle)
    // && lastCandle.close < lastCandle.open
    && bodySize > 50 
    && lowerShadow > bodySize * 3 
    && upperShadow < bodySize) {
    return true;
  } else {
    return false;
  }
};

const invertedHammer = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 5]; // gets the last candle
  const prevCandle = candles[candles.length - 3]; // gets the penultimate candle
  const bodySize = Math.abs(lastCandle.open - lastCandle.close);
  const lowerShadow = Math.abs(lastCandle.low - Math.min(lastCandle.open, lastCandle.close));
  const upperShadow = Math.abs(lastCandle.high - Math.max(lastCandle.open, lastCandle.close));
  if (isStrongCandle(prevCandle)
    && isRed(prevCandle)
    && isGreen(actualCandle)
    // && prevCandle.close > prevCandle.open 
    // && lastCandle.close > lastCandle.open
    && bodySize > 50 
    && lowerShadow < bodySize 
    && upperShadow > bodySize * 3) {
    return true;
  } else {
    return false;
  }
};


const hangingMan = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2]; // pega o último candle
  const prevCandle = candles[candles.length - 3]; // pega o penúltimo candle
  const bodySize = Math.abs(lastCandle.open - lastCandle.close);
  const lowerShadow = Math.abs(lastCandle.low - Math.min(lastCandle.open, lastCandle.close));
  const upperShadow = Math.abs(lastCandle.high - Math.max(lastCandle.open, lastCandle.close));

  if (isRed(actualCandle) &&
    isStrongCandle(prevCandle) &&
    isGreen(prevCandle) && // O penúltimo candle é forte e verde
    isRed(lastCandle) && // O último candle é vermelho
    bodySize < 0.25 * (lastCandle.high - lastCandle.low) && // O corpo é pequeno (menor que 25% da amplitude do candle)
    upperShadow <= 0.1 * bodySize && // A sombra superior é muito pequena ou inexistente (menor ou igual a 10% do tamanho do corpo)
    lowerShadow >= 2 * bodySize // A sombra inferior é longa e pelo menos duas vezes o tamanho do corpo
  ) {
    return true; // Padrão Hanging Man detectado
  } else {
    return false; // Padrão Hanging Man não detectado
  }
};



const pinBarDown = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2]; // pega o último candle
  const prevCandle = candles[candles.length - 3]; // pega o penúltimo candle

  const bodySize = Math.abs(lastCandle.open - lastCandle.close);
  const lowerShadow = Math.abs(lastCandle.low - Math.min(lastCandle.open, lastCandle.close));
  const upperShadow = Math.abs(lastCandle.high - Math.max(lastCandle.open, lastCandle.close));
  
  // isRed(prevCandle) && 
  if (isGreen(actualCandle)
      && isRed(prevCandle) 
      && lowerShadow > bodySize * 2 
      && upperShadow < bodySize 
      && lastCandle.close > lastCandle.open) { // verifica se é um Pin Bar de alta
    if (lastCandle.high - Math.max(lastCandle.open, lastCandle.close) > lowerShadow) { // confirma que é um Pin Bar de alta válido
      return true;
    }
  }
  
  return false;
};


const pinBarUp = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2]; // pega o último candle
  const prevCandle = candles[candles.length - 3]; // pega o penúltimo candle

  const bodySize = Math.abs(lastCandle.open - lastCandle.close);
  const lowerShadow = Math.abs(lastCandle.low - Math.min(lastCandle.open, lastCandle.close));
  const upperShadow = Math.abs(lastCandle.high - Math.max(lastCandle.open, lastCandle.close));
  
  // 
  if (isRed(actualCandle)
      && isGreen(prevCandle) 
      && lowerShadow < bodySize 
      && upperShadow > bodySize * 2
      && lastCandle.open > lastCandle.close) { // verifica se é um Pin Bar de baixa
    if (Math.min(lastCandle.open, lastCandle.close) - lastCandle.low > upperShadow) { // confirma que é um Pin Bar de baixa válido
      return true;
    }
  }
  
  return false;
};

const piercingPattern = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2]; // get the last candle
  const prevCandle = candles[candles.length - 3]; // get the penultimate candle

  const lastBodySize = Math.abs(lastCandle.open - lastCandle.close);
  const prevBodySize = Math.abs(prevCandle.open - prevCandle.close);
  const prevMidpoint = (prevCandle.open + prevCandle.close) / 2;

  if (isGreen(actualCandle)
      && lastCandle.close > lastCandle.open // bullish candle
      && prevCandle.close < prevCandle.open // bearish candle
      && lastCandle.close > prevMidpoint // last close is above the midpoint of the previous candle
      && lastCandle.open < prevCandle.close // last open is below the previous close
  ) {
    return true;
  }

  return false;
};

const darkCloudCover = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2]; // get the last candle
  const prevCandle = candles[candles.length - 3]; // get the penultimate candle

  const lastBodySize = Math.abs(lastCandle.open - lastCandle.close);
  const prevBodySize = Math.abs(prevCandle.open - prevCandle.close);
  const prevMidpoint = (prevCandle.open + prevCandle.close) / 2;

  if (isRed(actualCandle)
      && lastCandle.close < lastCandle.open // bearish candle
      && prevCandle.close > prevCandle.open // bullish candle
      && lastCandle.close < prevMidpoint // last close is below the midpoint of the previous candle
      && lastCandle.open > prevCandle.close // last open is above the previous close
  ) {
    return true;
  }

  return false;
};


const bearishTrendAndBullishEngulfing = (candles) => {
  // Verifica se há uma tendência de baixa
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2];
  const prevCandle = candles[candles.length - 3];
  const currPrice = lastCandle.close;
  const prevPrice = prevCandle.close;
  const prevLow = prevCandle.low;
  
  if (isGreen(actualCandle) && isRed(lastCandle) && isRed(prevCandle)) {
    if (prevPrice > currPrice && prevLow > currPrice) {
      // Verifica se há um padrão de Engolfo de Alta
      const beforeLastCandle = candles[candles.length - 4];
      const beforeLastPrice = beforeLastCandle.close;
      
      if (lastCandle.open < lastCandle.close && lastCandle.close > prevCandle.open && lastCandle.open < prevCandle.close && lastCandle.close > beforeLastPrice) {
        return true;
      }
    }
  }
  return false;
};

const bullishTrendAndBearishEngulfing = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2];
  const prevCandle = candles[candles.length - 3];
  
  const lastBodySize = Math.abs(lastCandle.open - lastCandle.close);
  const lastMidpoint = (lastCandle.open + lastCandle.close) / 2;
  const lastBodyMidpoint = (lastCandle.open + lastCandle.close) / 2;
  
  const prevBodySize = Math.abs(prevCandle.open - prevCandle.close);
  const prevMidpoint = (prevCandle.open + prevCandle.close) / 2;
  const prevBodyMidpoint = (prevCandle.open + prevCandle.close) / 2;
  
  if (isRed(actualCandle) && isGreen(lastCandle) && isGreen(prevCandle)) {
    if (prevCandle.close > prevCandle.open // bullish candle
        && lastCandle.open > lastCandle.close // bearish candle
        && lastCandle.close < prevCandle.open // last close is below previous open
        && lastCandle.open > prevCandle.close // last open is above previous close
        && lastBodySize > prevBodySize // last body is larger than previous body
        && lastBodyMidpoint < prevBodyMidpoint // last body is engulfed by previous body
        && lastMidpoint > prevMidpoint // last midpoint is below previous midpoint
      ) {
      return true;
    }
  }
  return false;
};

const tweezerBottom = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2];
  const prevCandle = candles[candles.length - 3];
  
  const lastBodySize = Math.abs(lastCandle.open - lastCandle.close);
  const lastMidpoint = (lastCandle.open + lastCandle.close) / 2;
  const lastBodyMidpoint = (lastCandle.open + lastCandle.close) / 2;
  
  const prevBodySize = Math.abs(prevCandle.open - prevCandle.close);
  const prevMidpoint = (prevCandle.open + prevCandle.close) / 2;
  const prevBodyMidpoint = (prevCandle.open + prevCandle.close) / 2;
  
  if (isGreen(actualCandle)) {
    if (prevCandle.close > prevCandle.open // bullish candle
        && lastCandle.open > lastCandle.close // bearish candle
        && lastCandle.low <= prevCandle.low // last low is equal to or below previous low
        && lastBodySize < prevBodySize // last body is smaller than previous body
        && lastBodyMidpoint > prevBodyMidpoint // last body is not engulfed by previous body
        && lastMidpoint < prevMidpoint // last midpoint is above previous midpoint
      ) {
      return true;
    }
  }
  return false;
};

const tweezerTop = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastCandle = candles[candles.length - 2];
  const prevCandle = candles[candles.length - 3];
  
  const lastBodySize = Math.abs(lastCandle.open - lastCandle.close);
  const lastMidpoint = (lastCandle.open + lastCandle.close) / 2;
  const lastBodyMidpoint = (lastCandle.open + lastCandle.close) / 2;
  
  const prevBodySize = Math.abs(prevCandle.open - prevCandle.close);
  const prevMidpoint = (prevCandle.open + prevCandle.close) / 2;
  const prevBodyMidpoint = (prevCandle.open + prevCandle.close) / 2;
    
  if (isRed(actualCandle)) {
    if (prevCandle.close < prevCandle.open // bearish candle
        && lastCandle.open < lastCandle.close // bullish candle
        && lastCandle.high >= prevCandle.high // last high is equal to or above previous high
        && lastBodySize < prevBodySize // last body is smaller than previous body
        && lastBodyMidpoint > prevBodyMidpoint // last body is not engulfed by previous body
        && lastMidpoint > prevMidpoint // last midpoint is above previous midpoint
      ) {
      return true;
    }
  }
  
  return false;
};

const detectTwoBearishOneBullishPattern = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastTwoBearish = candles.slice(-4, -2).every(isRed);
  const currentBullish = candles[candles.length - 2].open < candles[candles.length - 2].close;
  const bodyBiggerThan50 = Math.abs(candles[candles.length - 2].open - candles[candles.length - 2].close) > 50;

  return isGreen(actualCandle) && lastTwoBearish && currentBullish && bodyBiggerThan50;
};

const detectTwoBullishOneBearishPattern = (candles) => {
  const actualCandle = candles[candles.length - 1];
  const lastTwoBullish = candles.slice(-4, -2).every(isGreen);
  const currentBearish = candles[candles.length - 2].open > candles[candles.length - 2].close;
  const bodyBiggerThan50 = Math.abs(candles[candles.length - 2].open - candles[candles.length - 2].close) > 50;

  return isRed(actualCandle) && lastTwoBullish && currentBearish && bodyBiggerThan50;
};


const detectBullishTrend = (candles) => {
  return candles.slice(-4).every(isGreen);
};

const detectBearishTrend = (candles) => {
  return candles.slice(-4).every(isRed);
};

function lastSevenCandlesAreGreen(candles, amount = 7) {
  if (candles.length < amount) {
    return false;
  }

  const lastSevenCandles = candles.slice(-amount);
  return lastSevenCandles.every(isGreen);
};

function lastSevenCandlesAreRed(candles, amount = 7) {
  if (candles.length < amount) {
    return false;
  }

  const lastSevenCandles = candles.slice(-amount);
  return lastSevenCandles.every(isRed);
};

const islandReversalBottom = (candles) => {
  if (candles.length < 5) {
    return false;
  }

  const actualCandle = candles[candles.length - 1];
  const firstCandle = candles[candles.length - 5];
  const secondCandle = candles[candles.length - 4];
  const thirdCandle = candles[candles.length - 3];
  const fourthCandle = candles[candles.length - 2];
  const lastCandle = candles[candles.length - 1];

  if (isGreen(actualCandle)
    && firstCandle.close < firstCandle.open // first candle is bearish
    && secondCandle.close < secondCandle.open // second candle is bearish
    && secondCandle.low > firstCandle.low // second candle has a lower low than the first candle
    && thirdCandle.close < thirdCandle.open // third candle is bearish
    && thirdCandle.low > secondCandle.high // third candle has a gap down from the second candle
    && fourthCandle.close > fourthCandle.open // fourth candle is bullish
    && fourthCandle.high < thirdCandle.low // fourth candle has a gap up from the third candle
    && lastCandle.close > lastCandle.open // last candle is bullish
    && lastCandle.high > fourthCandle.high // last candle has a higher high than the fourth candle
  ) {
    return true;
  }

  return false;
};

const islandReversalTop = (candles) => {
  if (candles.length < 5) {
    return false;
  }

  const actualCandle = candles[candles.length - 1];
  const firstCandle = candles[candles.length - 5];
  const secondCandle = candles[candles.length - 4];
  const thirdCandle = candles[candles.length - 3];
  const fourthCandle = candles[candles.length - 2];
  const lastCandle = candles[candles.length - 1];

  if (isGreen(actualCandle)
    && firstCandle.close > firstCandle.open // first candle is bullish
    && secondCandle.close > secondCandle.open // second candle is bullish
    && secondCandle.high < firstCandle.high // second candle has a lower high than the first candle
    && thirdCandle.close > thirdCandle.open // third candle is bullish
    && thirdCandle.high < secondCandle.low // third candle has a gap up from the second candle
    && fourthCandle.close < fourthCandle.open // fourth candle is bearish
    && fourthCandle.low > thirdCandle.high // fourth candle has a gap down from the third candle
    && lastCandle.close < lastCandle.open // last candle is bearish
    && lastCandle.low < fourthCandle.low // last candle has a lower low than the fourth candle
  ) {
    return true;
  }

  return false;
};


module.exports = {
  detectThreeBlackCrows,
  detectThreeWhiteSoldiers,
  detectHaramiTop,
  detectHaramiBottom,
  morningStar,
  shootingStar,
  violinadaEmCima,
  violinadaEmbaixo,
  hammerUp,
  hammerDown,
  invertedHammer,
  pinBarUp,
  pinBarDown,
  piercingPattern,
  darkCloudCover,
  bearishTrendAndBullishEngulfing,
  bullishTrendAndBearishEngulfing,
  detectTwoBearishOneBullishPattern,
  detectTwoBullishOneBearishPattern,
  detectBullishTrend,
  detectBearishTrend,
  lastSevenCandlesAreGreen,
  lastSevenCandlesAreRed,
  tweezerBottom,
  tweezerTop,
  hangingMan,
  islandReversalBottom,
  islandReversalTop

}
