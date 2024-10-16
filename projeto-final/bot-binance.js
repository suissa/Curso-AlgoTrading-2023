require("dotenv").config();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const chalk = require('chalk');


const client = require('./binance.api')(API_KEY, API_SECRET);
// const binance = require('./factories/node-binance-api')(API_KEY, API_SECRET);


const symbol = "BTCUSDC";
const STRATEGY_DIFF_TO_CLOSE = 70;
const STRATEGY_VALUE_TO_STOP_LOSS = 50;
const STRATEGY_DIFF_TO_AVERAGE = 70;
const STRATEGY_MAX_AVERAGE_PRICES = 3;
const STRATEGY_HAS_AVERAGE_PRICE = false;
const STRATEGY_HAS_STOP_LOSS = true;
const STRATEGY_AMOUNT = 0.005;
const STRATEGY_LEVERAGE = 5;
let amountOfAveragePrices = 0;
let CURRENT_PRICE = 0;

const getFirstNonZeroPosition = (positions) => {
  console.log("getFirstNonZeroPosition positions: ", positions);
  
  // Verificar se todas as posições têm positionAmt igual a 0
  const allZero = positions.every(position => parseFloat(position.positionAmt) === 0);
  
  if (allZero) {
    console.log("Todas as posições são zero, retornando a primeira posição:", positions[0]);
    return positions[0];
  }
  
  // Encontrar a primeira posição cujo positionAmt não seja 0
  const position = positions.find(position => parseFloat(position.positionAmt) !== 0);
  console.log("getFirstNonZeroPosition position (não zero): ", position);
  
  return position;
};

const getPosition = async (symbol = "BTCUSDC") => {
  try {
    const positions = await client.getPositionRisk(symbol);
    console.log("positions: ", positions);
    const firstNonZeroPosition = getFirstNonZeroPosition(positions);

    return firstNonZeroPosition;
  } catch (error) {
    console.error(error);
  }
};


const getCurrentPrice = async (symbol) => {
  try {
    const ticker = await client.getCurrentPrice(symbol);
    console.log(`Preço atual de ${symbol}:`, ticker);
    return ticker[symbol];
  } catch (error) {
    console.error("Erro ao obter o preço atual: ", error);
    throw error;
  }
};

const getCandles = async (symbol = "BTCUSDC", interval = "5m") => {
  try {
    const candles = await client.getCandles("BTCUSDC");
    // console.log("Last candle: ", candles[candles.length - 1]);
    return candles;
  } catch (error) {
    console.error("Erro ao obter candles: ", error);
  }
}

const cancelFutureOrder = async (symbol = "BTCUSDC", orderId) => {
  try {
    const response = await client.futuresCancelOrder(symbol, orderId);
    return response;
  } catch (error) {
    console.error("Erro ao cancelar a ordem: ", error);
    throw error;
  }
}

const getFutureOpenOrders = async (symbol = "BTCUSDC") => {
  try {
    const orders = await client.futuresOpenOrders(symbol);
    return orders;
  } catch (err) {
    console.error("Erro ao obter ordens abertas: ", err);
  }
}

const createOrder = async (order) => {
  console.log("createOrder", order);
  if (order.type === "LIMIT") order.timeInForce = "GTC";
  if (order.type === "MARKET") delete order.price;

  // Adiciona o positionSide, obrigatório em ordens de futuros
  if (!order.positionSide) {
    console.error("Erro: `positionSide` não especificado para a ordem.");
    return;
  }

  try {
    const result = await client.futuresOrder(order);
    console.log("Ordem criada: ", result);
    return result;
  } catch (error) {
    console.error("Erro ao criar ordem: ", error);
  }
};


const isRedCandle = (candle) => candle.close < candle.open;
const analyzeIfLastThreeCandlesAreRed = (candles) => {
  const lastThreeCandles = candles.slice(-4, -1);
  return lastThreeCandles.every(isRedCandle);
}

const isGreen = (candle) => candle.close > candle.open;
const analyzeIfLastThreeCandlesAreGreen = (candles) => {
  const lastThreeCandles = candles.slice(-4, -1);
  return lastThreeCandles.every(isGreen);
}

const calculateSMA = (data, period) => {
  const sum = data.slice(0, period).reduce((total, value) => total + value, 0);
  const sma = [sum / period];

  for (let i = period; i < data.length; i++) {
    const newValue = data[i];
    const oldValue = data[i - period];
    const previousSMA = sma[sma.length - 1];
    const newSMA = previousSMA + (newValue - oldValue) / period;
    sma.push(newSMA);
  }

  return sma;
}
const RSI = require("technicalindicators").RSI;

const calcularRSI = (values, period) => {
  const input = {
    values, // prices
    period,
  };
  return RSI.calculate(input);
}

const MACD = require("technicalindicators").MACD;

const calcularMACD = (precos, periodoCurto, periodoLongo, sinalPeriodo) => {
  const input = {
    values: precos,
    fastPeriod: periodoCurto,
    slowPeriod: periodoLongo,
    signalPeriod: sinalPeriodo,
  };
  return MACD.calculate(input);
}

const {
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
  detectTwoBearishOneBullishPattern,
  detectTwoBullishOneBearishPattern,
  detectBullishTrend,
  detectBearishTrend,
  lastSevenCandlesAreGreen,
  lastSevenCandlesAreRed,
  tweezerBottom,
  tweezerTop,
  bearishTrendAndBullishEngulfing,
  bullishTrendAndBearishEngulfing,
  islandReversalBottom,
  islandReversalTop
} = require('./candle.patterns')

const testToCreatePosition = async (data) => {
  console.log("testToCreatePosition");
  const lastIndex = data.length - 1;
  const signal = {};

  const symbol = "BTCUSDC";
  const shortPeriod = 50;
  const longPeriod = 200;
  const prices = data.map((entry) => parseFloat(entry.close));
  const shortSMA = calculateSMA(prices, shortPeriod);
  const longSMA = calculateSMA(prices, longPeriod);
  const rsi = (calcularRSI(prices, 14)).reverse();
  const macd = (calcularMACD(prices, 12, 26, 9)).reverse();

  const isSmaCrossOver = shortSMA[lastIndex - 1] < longSMA[lastIndex - 1] && shortSMA[lastIndex] > longSMA[lastIndex];
  const isSmaCrossUnder = shortSMA[lastIndex - 1] > longSMA[lastIndex - 1] && shortSMA[lastIndex] < longSMA[lastIndex];
  const isRsiOverSold = rsi[0] < 30;
  const isRsiOverBought = rsi[0] > 70;
  const isMacdCrossOver = macd[0].histogram < 0 && macd[1].histogram > 0;
  const isMacdCrossUnder = macd[0].histogram > 0 && macd[1].histogram < 0;
  const isLastThreeReds = analyzeIfLastThreeCandlesAreRed(data);
  const isLastThreeGreens = analyzeIfLastThreeCandlesAreGreen(data);


  const limit = 50; // quantidade de candles a serem recuperados
  const candles5 = await client.getCandles({ symbol: 'BTCUSDC', interval: "5m", limit })
  const candles15 = await client.getCandles({ symbol: 'BTCUSDC', interval: '15m', limit })
    
  const isMorningStar = morningStar(candles5);
  const isShootingStar = shootingStar(candles5);
  const isMorningStar15 = morningStar(candles15);
  const isShootingStar15 = shootingStar(candles15);
  const isViolinadaEmbaixo = violinadaEmbaixo(candles5);
  const isViolinadaEmCima = violinadaEmCima(candles5);
  const isHammerUp = hammerUp(candles5);
  const isHammerDown = hammerDown(candles5);
  const isInvertedHammer = invertedHammer(candles5);
  const isThreeBlackCrows = detectThreeBlackCrows(candles5);
  const isThreeWhiteSoldiers = detectThreeWhiteSoldiers(candles5);
  const isHaramiTop = detectHaramiTop(candles5);
  const isHaramiBottom = detectHaramiBottom(candles5);
  const isPinBarUp = pinBarUp(candles5);
  const isPinBarDown = pinBarDown(candles5);
  const isPiercingPattern = piercingPattern(candles5);
  const isDarkCloudCover = darkCloudCover(candles5);
  const isTwoBearishOneBullishPattern = detectTwoBearishOneBullishPattern(candles5);
  const isTwoBullishOneBearishPattern = detectTwoBullishOneBearishPattern(candles5);
  const isBullishTrend = detectBullishTrend(candles5);
  const isBearishTrend = detectBearishTrend(candles5);
  const isLastSevenCandlesAreGreen = lastSevenCandlesAreGreen(candles5);
  const isLastSevenCandlesAreRed = lastSevenCandlesAreRed(candles5);
  const isTweezerBottom = tweezerBottom(candles5);
  const isTweezerTop = tweezerTop(candles5);
  const isBearishTrendAndBullishEngulfing = bearishTrendAndBullishEngulfing(candles5);
  const isBullishTrendAndBearishEngulfing = bullishTrendAndBearishEngulfing(candles5);
  const isIslandReversalBottom = islandReversalBottom(candles5);
  const isIslandReversalTop = islandReversalTop(candles5);

  let hadPreviousThreeCandlePattern = false;
  let hadPreviosCandlePattern = false;
  let trendUpTestPassCount = 0
  let trendDownTestPassCount = 0

  
  if (isViolinadaEmbaixo) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve uma violinada embaixo no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  } 
  if (isViolinadaEmCima) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve uma violinada em cima no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isMorningStar) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve uma ESTRELA DA MANHÃ último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isMorningStar15) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve uma ESTRELA DA MANHÃ último candle de 15min!'));
    hadPreviosCandlePattern = true;
  }
  if (isShootingStar) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve uma ESTRELA CADENTE último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isShootingStar15) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve uma ESTRELA CADENTE último candle de 15min!'));
    hadPreviosCandlePattern = true;
  }
  if (isHammerUp) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um MARTELO UP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isHammerDown) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um MARTELO DOWN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isInvertedHammer) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um INVERTED HAMMER no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isThreeBlackCrows) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um THREE BLACK CROWS no último candle de 5min!'));
    // hadPreviousThreeCandlePattern = true;
  }
  if (isThreeWhiteSoldiers) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um THREE WHITE SOLDIERS no último candle de 5min!'));
    // hadPreviousThreeCandlePattern = true;
  }
  if (isHaramiTop) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um HARAMI TOP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isHaramiBottom) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um HARAMI BOTTOM no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isPinBarUp) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um PIN BAR UP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isPinBarDown) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um PIN BAR DOWN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isPiercingPattern) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um PIERCING PATTERN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isDarkCloudCover) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um DARK CLOUD COVER no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isTwoBearishOneBullishPattern) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um TWO BEARISH ONE BULLISH PATTERN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isTwoBullishOneBearishPattern) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um TWO BULLISH ONE BEARISH PATTERN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isBullishTrend) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nTendência de alta!'));
    trendUpTestPassCount += 1;
  }
  if (isBearishTrend) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nTendência de baixa!'));
    trendDownTestPassCount += 1;
  }
  if (isLastSevenCandlesAreGreen) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nOs últimos 7 candles foram verdes!'));
  }
  if (isLastSevenCandlesAreRed) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nOs últimos 7 candles foram vermelhos!'));
  }
  if (isTweezerBottom) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um TWEZZER BOTTOM no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isTweezerTop) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um TWEZZER UP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isBearishTrendAndBullishEngulfing) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um BULLISH ENGULFING no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isBullishTrendAndBearishEngulfing) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um BEARISH ENGULFING no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isIslandReversalBottom) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um ISLAND REVERSAL BOTTOM no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isIslandReversalTop) {
    console.log("🚀", chalk.bgCyanBright.black.bold('\n\n\n\nHouve um ISLAND REVERSAL TOP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }

  if (
    // isBullishTrend ||
    !hadPreviousThreeCandlePattern && 
    trendUpTestPassCount < 2 && 
    !isLastSevenCandlesAreGreen && 
    ( 
      isViolinadaEmbaixo|| 
      isLastSevenCandlesAreRed || 
      isMorningStar|| 
      isMorningStar15|| 
      isHammerDown|| 
      isThreeBlackCrows|| 
      isHaramiBottom|| 
      isPinBarDown|| 
      isTwoBearishOneBullishPattern|| 
      isTweezerBottom ||
      isPiercingPattern ||
      isIslandReversalBottom
    )
  ) {
    hadPreviousThreeCandlePattern = false;
    const quantity = STRATEGY_AMOUNT;
    const order = {
      symbol,
      quantity,
      type: "MARKET",
      side: "BUY",
      positionSide: "LONG", 
    }
    console.log({order});
    const result = await createOrder(order);
    console.log({result});
  } 
  
  if (
    // isBearishTrend ||
    !hadPreviousThreeCandlePattern && 
    trendDownTestPassCount < 2 && 
    !isLastSevenCandlesAreRed && 
    ( 
      isViolinadaEmCima || 
      isLastSevenCandlesAreGreen|| 
      isShootingStar|| 
      isShootingStar15|| 
      isHammerUp|| 
      isThreeWhiteSoldiers|| 
      isHaramiTop|| 
      isPinBarUp|| 
      isTwoBullishOneBearishPattern|| 
      isTweezerTop ||
      isDarkCloudCover ||
      isIslandReversalTop
    )) {
    console.log("\n\n\n Entrou na estratégia SELL - create order", {isSmaCrossOver, isRsiOverSold, isMacdCrossOver, isLastThreeReds});
    const price = data[lastIndex].close; // pega o último preço
    const quantity = STRATEGY_AMOUNT;
    const order = {
      quantity,
      symbol,
      type: "MARKET",
      side: "SELL",
      positionSide: "SHORT", 
    }
    console.log({order});
    const result = await createOrder(order);
    console.log({result});
  }

  return signal;
}

const getFuturesBalances = async (symbol = "USDC") => {
  try {
    const accountInfo = await client.futuresBalance();
    const balances = accountInfo.filter(balance => balance.asset === symbol);
    const { balance } = balances[0];
    console.log('Futures Balances:', balances, { balance });
    return parseFloat(balance);
  } catch (error) {
    console.error('Erro ao obter saldo de futuros: ', error);
  }
}


const calcOrderPrice = (price, quantity = 0.002, leverage = 5) => {
  if (price < 27000) return false;
  const orderPrice = price * quantity / STRATEGY_LEVERAGE;
  // console.log({orderPrice})
  return parseFloat(orderPrice.toFixed(2));
}

const getDataFromPosition = (position) => {
  const hasOpenPosition = position.positionAmt != "0.000";
  const entryPrice = parseFloat(position.entryPrice);
  const amount = parseFloat(position.positionAmt);
  const side = amount > 0 ? "BUY" : "SELL";
  const quantity = Math.abs(amount);

  return {hasOpenPosition, entryPrice, amount, side, quantity};
}

const getFuturesAccountBalance = async () => {
  try {
    const balances = await client.futuresBalance();
    // console.log("Saldo disponível de futuros: ", balances);
    return balances;
  } catch (error) {
    console.error("Erro ao obter o saldo de futuros: ", error);
    throw error;
  }
};

const closeOrder = async (position, symbol = "BTCUSDC", lastPrice) => {
  const {hasOpenPosition, entryPrice, amount, side, quantity} = getDataFromPosition(position);
  console.log("\n\n\n Entrou na estratégia de fechamento - create order\n\n\n", {side});
  if (side === "BUY") {
    const order = {
      symbol,
      price: Number((entryPrice + STRATEGY_DIFF_TO_CLOSE).toFixed(2)),
      quantity,
      type: "MARKET",
      side: "SELL",
      positionSide: "LONG",
    }
    const result = await createOrder(order);
    console.log({result});
  }
  if (side === "SELL") {
    const order = {
      symbol,
      price: Number((entryPrice - STRATEGY_DIFF_TO_CLOSE).toFixed(2)),
      quantity,
      type: "MARKET",
      side: "BUY",
      positionSide: "SHORT",
    }
    const result = await createOrder(order);
    console.log({result});
  }
}

const stopLoss = async (position) => {
  const entryPrice = parseFloat(position.entryPrice);
  const amount = parseFloat(position.positionAmt);
  const side = amount > 0 ? "BUY" : "SELL";
  const quantity = Math.abs(amount);
  const lastPrice = CURRENT_PRICE;
  const positionSide = position.positionSide; // Pega o lado da posição: LONG ou SHORT

  console.log("STOP LOSS", { entryPrice, lastPrice });
  if (side === "BUY" && entryPrice - STRATEGY_VALUE_TO_STOP_LOSS > lastPrice) {
    const order = {
      symbol,
      quantity,
      type: "MARKET",
      side: "SELL",
      positionSide: positionSide // Necessário para corresponder ao lado da posição aberta
    };
    await createOrder(order);
  }
  if (side === "SELL" && entryPrice + STRATEGY_VALUE_TO_STOP_LOSS < lastPrice) {
    const order = {
      symbol,
      quantity,
      type: "MARKET",
      side: "BUY",
      positionSide: positionSide // Necessário para corresponder ao lado da posição aberta
    };
    await createOrder(order);
  }
};

const isBuyPriceWithinStrategyRange = (entryPrice) => entryPrice + STRATEGY_DIFF_TO_AVERAGE < price
const isSellPriceWithinStrategyRange = (entryPrice) => entryPrice - STRATEGY_DIFF_TO_AVERAGE > price

// const averagePrice = async (position, lastPrice) => {
//   const {hasOpenPosition, entryPrice, amount, side, quantity} = getDataFromPosition(position);

//   const positionPrice = amount * entryPrice / STRATEGY_LEVERAGE
//   const orderPrice = calcOrderPrice(CURRENT_PRICE, quantity, 5)
//   const balanceTotal = await getFuturesBalances("USDC")

//   const balance = parseFloat(Math.abs(balanceTotal - positionPrice).toFixed(2))
//   if((isBuyPriceWithinStrategyRange || isSellPriceWithinStrategyRange) 
//     && entryPrice > 0 
//     && balance > orderPrice) {
//     amountOfAveragePrices += 1;
//     // PRIMEIRO CANCELA A ORDEM DE FECHAMENTO
//     if (openOrders.length > 0) {
//       const cancel = await cancelFutureOrder("BTCUSDC", openOrders[0].orderId);
//       console.log(cancel);
//     }
//     // SE a posição for de compra, cria uma ordem de venda
//     // type: "LIMIT" para criar a ordem que será executada direto
//     if (side === "BUY") {
//       console.log("PREÇO MÉDIO - criando ordem de venda", {side});
//       const order = {
//         symbol,
//         quantity,
//         type: "LIMIT",
//         side: "SELL",
//         price: Number((entryPrice + STRATEGY_DIFF_TO_CLOSE).toFixed(2)),
//       }
//       const result = await createOrder(order);
//       console.log(result);
//     }
//     // SE a posição for de venda, cria uma ordem de compra
//     if (side === "SELL") {
//       console.log("PREÇO MÉDIO - criando ordem de compra", {side});
//       const order = {
//         symbol,
//         quantity,
//         type: "LIMIT",
//         side: "SELL",
//         price: Number((entryPrice - STRATEGY_DIFF_TO_CLOSE).toFixed(2)),
//       }
//       const result = await createOrder(order);
//       console.log(result);
//     }
//   }
// }

const adjustLeverage = async (symbol, leverage) => {
  try {
    const response = await client.futuresLeverage(symbol, leverage);
    console.log(`Alavancagem ajustada para ${leverage}x`, response);
  } catch (error) {
    console.error("Erro ao ajustar alavancagem: ", error);
  }
};


// ;(async () => {
  
//   const quantity = STRATEGY_AMOUNT;
//   const order = {
//     symbol,
//     quantity,
//     type: "MARKET",
//     side: "BUY",
//     positionSide: "LONG", 
//   }
//   console.log({order});
//   const result = await createOrder(order);
//   console.log({result});
// })();
// Ajustar a alavancagem para 5x
adjustLeverage(symbol, STRATEGY_LEVERAGE);

setInterval( async () => {
  console.log("\n\n\nrodando...", new Date());
  try {

    const price = await getCurrentPrice("BTCUSDC")
    console.log("")
    return false;

    CURRENT_PRICE = await getCurrentPrice(symbol);
    const position = await getPosition(symbol);
    const hasOpenPosition = position.positionAmt != "0.000";
    const entryPrice = parseFloat(position.entryPrice);
    const amount = parseFloat(position.positionAmt);
    const side = amount > 0 ? "BUY" : "SELL";
    const quantity = Math.abs(amount);
    console.log({hasOpenPosition});
    console.log({position});
    console.log("symbol aqui ",{symbol});
    
    const candles = await getCandles(symbol);
    // console.log({candles});
    const lastPrice = candles[candles.length - 1].close;
    console.log({lastPrice});

    const balances = await getFuturesAccountBalance();
    const {balance} = balances[0];
    // console.log({balances});

    // return false;
    if (!hasOpenPosition) {

      // Verifica condição para criar uma ordem
      await testToCreatePosition(candles);

    } else { // se tem posição aberta

      const openOrders = await getFutureOpenOrders(symbol);
      // cria ordem de fechamento
      if (openOrders.length === 0) {
          closeOrder(position, symbol, lastPrice);
      }

      // preço médio
      // if (STRATEGY_HAS_AVERAGE_PRICE && hasOpenPosition && amountOfAveragePrices < STRATEGY_MAX_AVERAGE_PRICES0) {
      //   return averagePrice(position, amountOfAveragePrices)
      // }

      // STOP LOSS
      
      if (STRATEGY_HAS_STOP_LOSS || amountOfAveragePrices == STRATEGY_MAX_AVERAGE_PRICES) {
        return stopLoss(position, amountOfAveragePrices)
      }
      }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000) // 10 segundos