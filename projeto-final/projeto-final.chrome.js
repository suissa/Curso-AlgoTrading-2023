require("dotenv").config();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const client = require('./factories/binance-api-node')(API_KEY, API_SECRET);
const binance = require('./factories/node-binance-api')(API_KEY, API_SECRET);

const symbol = "BTCUSDT";
const STRATEGY_DIFF_TO_CLOSE = 50;
const STRATEGY_VALUE_TO_STOP_LOSS = 30;
const STRATEGY_DIFF_TO_AVERAGE = 70;
const STRATEGY_MAX_AVERAGE_PRICES = 6;
const STRATEGY_HAS_AVERAGE_PRICE = false;
const STRATEGY_HAS_STOP_LOSS = true;
const STRATEGY_AMOUNT = 0.015;
const STRATEGY_LEVERAGE = 5;
let amountOfAveragePrices = 0;


const getPosition = async (symbol = "BTCUSDT") => {
  try {
    const positions = await client.futuresPositionRisk({symbol});
    const position = positions.find(position => position.symbol === symbol);
    console.log(position);

    return position;
  } catch (error) {
    console.error(error);
  }
}

const getCandles = async (symbol = "BTCUSDT", interval = "5m") => {
  try {
    const candles = await client.futuresCandles({
      symbol: symbol,
      interval: interval
    });
    // console.log("Last candle: ", candles[candles.length - 1]);
    return candles;
  } catch (error) {
    console.error(error);
  }
}
const cancelFutureOrder = async (symbol = "BTCUSDT", orderId) =>{
  try {
    const response = await client.futuresCancelOrder({
      symbol: symbol,
      orderId: orderId
    });
    return response;
  } catch (error) {
    throw error;
  }
}

const getFutureOpenOrders = async (symbol = "BTCUSDT") => {
  try {
    const orders = await client.futuresOpenOrders({
      symbol: symbol,
    });
    return orders;
  } catch (err) {
    console.error(err);
  }
}

const createOrder = async (order) => {
  console.log("createOrder");
  if (order.type === "LIMIT") 
    order.timeInForce = "GTC";
  if (order.type === "MARKET") 
    delete order.price;
  
  console.log({order})
  try {
    const result = await client.futuresOrder(order);
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
  
}

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

  const symbol = "BTCUSDT";
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


  const limit = 100; // quantidade de candles a serem recuperados
  const candles5 = await client.futuresCandles({ symbol: 'BTCUSDT', interval: "5m", limit })
  const candles15 = await client.futuresCandles({ symbol: 'BTCUSDT', interval: '15m', limit })
    
  const isMorningStar = morningStar(candles5);
  const isShootingStar = shootingStar(candles5);
  const isMorningStar15 = morningStar(candles15);
  const isShootingStar15 = shootingStar(candles15);
  const isViolinadaEmbaixo = violinadaEmbaixo(candles5);
  const isViolinadaEmCima = violinadaEmCima(candles5);
  const isHammerUp = hammerUp(candles5);
  const isHammerDown = hammerDown(candles5);
  const isInvertedHammer = invertedHammer(candles5);
  const isThreeBlackCrows = detectThreeBlackCrows(candles);
  const isThreeWhiteSoldiers = detectThreeWhiteSoldiers(candles);
  const isHaramiTop = detectHaramiTop(candles5);
  const isHaramiBottom = detectHaramiBottom(candles5);
  const isPinBarUp = pinBarUp(candles5);
  const isPinBarDown = pinBarDown(candles5);
  const isPiercingPattern = piercingPattern(candles5);
  const isDarkCloudCover = darkCloudCover(candles5);
  const isTwoBearishOneBullishPattern = detectTwoBearishOneBullishPattern(candles5);
  const isTwoBullishOneBearishPattern = detectTwoBullishOneBearishPattern(candles5);
  const isBullishTrend = detectBullishTrend(candles);
  const isBearishTrend = detectBearishTrend(candles);
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
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve uma violinada embaixo no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  } 
  if (isViolinadaEmCima) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve uma violinada em cima no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isMorningStar) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve uma ESTRELA DA MANHÃ último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isMorningStar15) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve uma ESTRELA DA MANHÃ último candle de 15min!'));
    hadPreviosCandlePattern = true;
  }
  if (isShootingStar) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve uma ESTRELA CADENTE último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isShootingStar15) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve uma ESTRELA CADENTE último candle de 15min!'));
    hadPreviosCandlePattern = true;
  }
  if (isHammerUp) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um MARTELO UP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isHammerDown) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um MARTELO DOWN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isInvertedHammer) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um INVERTED HAMMER no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isThreeBlackCrows) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um THREE BLACK CROWS no último candle de 5min!'));
    // hadPreviousThreeCandlePattern = true;
  }
  if (isThreeWhiteSoldiers) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um THREE WHITE SOLDIERS no último candle de 5min!'));
    // hadPreviousThreeCandlePattern = true;
  }
  if (isHaramiTop) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um HARAMI TOP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isHaramiBottom) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um HARAMI BOTTOM no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isPinBarUp) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um PIN BAR UP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isPinBarDown) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um PIN BAR DOWN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isPiercingPattern) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um PIERCING PATTERN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isDarkCloudCover) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um DARK CLOUD COVER no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isTwoBearishOneBullishPattern) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um TWO BEARISH ONE BULLISH PATTERN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isTwoBullishOneBearishPattern) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um TWO BULLISH ONE BEARISH PATTERN no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isBullishTrend) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nTendência de alta!'));
    trendUpTestPassCount += 1;
  }
  if (isBearishTrend) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nTendência de baixa!'));
    trendDownTestPassCount += 1;
  }
  if (isLastSevenCandlesAreGreen) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nOs últimos 7 candles foram verdes!'));
  }
  if (isLastSevenCandlesAreRed) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nOs últimos 7 candles foram vermelhos!'));
  }
  if (isTweezerBottom) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um TWEZZER BOTTOM no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isTweezerTop) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um TWEZZER UP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isBearishTrendAndBullishEngulfing) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um BULLISH ENGULFING no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isBullishTrendAndBearishEngulfing) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um BEARISH ENGULFING no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isIslandReversalBottom) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um ISLAND REVERSAL BOTTOM no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }
  if (isIslandReversalTop) {
    console.log("🚀", clc.bgCyanBright.black.bold('\n\n\n\nHouve um ISLAND REVERSAL TOP no último candle de 5min!'));
    hadPreviosCandlePattern = true;
  }

  if (!hadPreviousThreeCandlePattern && 
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
      side: "BUY"
    }
    console.log({order});
    const result = await createOrder(order);
    console.log({result});
  } 
  
  if (!hadPreviousThreeCandlePattern && 
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
      side: "SELL"
    }
    console.log({order});
    const result = await createOrder(order);
    console.log({result});
  }

  return signal;
}

const getFuturesBalances = async (symbol = "USDT") => {
  try {
    const accountInfo = await binance.futuresBalance();
    const balances = accountInfo.filter(balance => balance.asset === symbol);
    const {balance} = balances[0];
    return parseFloat(balance);
    console.log('Futures Balances:', balances, {balance});
  } catch (error) {
    console.error('Error fetching futures account info:', error);
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

const closeOrder = async (position, symbol = "BTCUSDT", lastPrice) => {
  const {hasOpenPosition, entryPrice, amount, side, quantity} = getDataFromPosition(position);
  console.log("\n\n\n Entrou na estratégia de fechamento - create order\n\n\n", {side});
  if (side === "BUY") {
    const order = {
      symbol,
      price: Number((entryPrice + STRATEGY_DIFF_TO_CLOSE).toFixed(2)),
      quantity,
      type: "LIMIT",
      side: "SELL",
    }
    const result = await createOrder(order);
    console.log({result});
  }
  if (side === "SELL") {
    const order = {
      symbol,
      price: Number((entryPrice - STRATEGY_DIFF_TO_CLOSE).toFixed(2)),
      quantity,
      type: "LIMIT",
      side: "BUY",
    }
    const result = await createOrder(order);
    console.log({result});
  }
}

const stopLoss = async (position, amountOfAveragePrices) => {

  const entryPrice = parseFloat(position.entryPrice);
  const amount = parseFloat(position.positionAmt);
  const side = amount > 0 ? "BUY" : "SELL";
  const quantity = Math.abs(amount);


  amountOfAveragePrices = 0;
  // se o lastPrice for menor que o entryPrice menos o valor do stop loss e side BUY
  console.log("\n\n\n\n\n STOP LOSS", {entryPrice, lastPrice})
  if (side == "BUY" && entryPrice - STRATEGY_VALUE_TO_STOP_LOSS > lastPrice) {
    const order = {
      symbol,
      quantity,
      type: "MARKET",
      side: "SELL"
    }
    const result = await createOrder(order);
    console.log(result);
  }
  // se o lastPrice for maior que o entryPrice mais o valor do stop loss e side SELL
  if (side == "SELL" && entryPrice + STRATEGY_VALUE_TO_STOP_LOSS < lastPrice) {
    const order = {
      symbol,
      quantity,
      type: "MARKET",
      side: "BUY"
    }
    const result = await createOrder(order);
    console.log(result);
  }
}

const isBuyPriceWithinStrategyRange = (entryPrice) => entryPrice + STRATEGY_DIFF_TO_AVERAGE < price
const isSellPriceWithinStrategyRange = (entryPrice) => entryPrice - STRATEGY_DIFF_TO_AVERAGE > price

const averagePrice = async (position, lastPrice) => {
  const {hasOpenPosition, entryPrice, amount, side, quantity} = getDataFromPosition(position);

  const positionPrice = amount * entryPrice / STRATEGY_LEVERAGE
  const orderPrice = calcOrderPrice(CURRENT_PRICE, quantity, 5)
  const balanceTotal = await getFuturesBalances("USDT")

  const balance = parseFloat(Math.abs(balanceTotal - positionPrice).toFixed(2))
  if((isBuyPriceWithinStrategyRange || isSellPriceWithinStrategyRange) 
    && entryPrice > 0 
    && balance > orderPrice) {
    amountOfAveragePrices += 1;
    // PRIMEIRO CANCELA A ORDEM DE FECHAMENTO
    if (openOrders.length > 0) {
      const cancel = await cancelFutureOrder("BTCUSDT", openOrders[0].orderId);
      console.log(cancel);
    }
    // SE a posição for de compra, cria uma ordem de venda
    // type: "LIMIT" para criar a ordem que será executada direto
    if (side === "BUY") {
      console.log("PREÇO MÉDIO - criando ordem de venda", {side});
      const order = {
        symbol,
        quantity,
        type: "LIMIT",
        side: "SELL",
        price: Number((entryPrice + STRATEGY_DIFF_TO_CLOSE).toFixed(2)),
      }
      const result = await createOrder(order);
      console.log(result);
    }
    // SE a posição for de venda, cria uma ordem de compra
    if (side === "SELL") {
      console.log("PREÇO MÉDIO - criando ordem de compra", {side});
      const order = {
        symbol,
        quantity,
        type: "LIMIT",
        side: "SELL",
        price: Number((entryPrice - STRATEGY_DIFF_TO_CLOSE).toFixed(2)),
      }
      const result = await createOrder(order);
      console.log(result);
    }
  }
}

setInterval( async () => {
  console.log("\n\n\nrodando...", new Date());
  try {
    const position = await getPosition(symbol);
    const hasOpenPosition = position.positionAmt != "0.000";
    const entryPrice = parseFloat(position.entryPrice);
    const amount = parseFloat(position.positionAmt);
    const side = amount > 0 ? "BUY" : "SELL";
    const quantity = Math.abs(amount);
    console.log({hasOpenPosition});
    
    const candles = await getCandles(symbol);
    const lastPrice = candles[candles.length - 1].close;

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
      if (STRATEGY_HAS_AVERAGE_PRICE && hasOpenPosition && amountOfAveragePrices < STRATEGY_MAX_AVERAGE_PRICES0 {
        return averagePrice(position, amountOfAveragePrices)
      }

      // STOP LOSS
      
      if (STRATEGY_HAS_STOP_LOSS || amountOfAveragePrices == STRATEGY_MAX_AVERAGE_PRICES) {
        return stopLoss(position, amountOfAveragePrices)
      }
      }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000) // 10 segundos