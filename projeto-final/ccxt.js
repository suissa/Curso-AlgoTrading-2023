require("dotenv").config();
const ccxt = require('ccxt');
const chalk = require('chalk');

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const exchange = new ccxt.binance({
  apiKey: API_KEY,
  secret: API_SECRET,
  options: {
    defaultType: 'future'
  }
});

const symbol = "BTC/USDT";
const STRATEGY_DIFF_TO_CLOSE = 70;
const STRATEGY_VALUE_TO_STOP_LOSS = 50;
const STRATEGY_DIFF_TO_AVERAGE = 70;
const STRATEGY_MAX_AVERAGE_PRICES = 6;
const STRATEGY_HAS_AVERAGE_PRICE = false;
const STRATEGY_HAS_STOP_LOSS = true;
const STRATEGY_AMOUNT = 0.001;
const STRATEGY_LEVERAGE = 5;
let amountOfAveragePrices = 0;
let CURRENT_PRICE = 0;

const getPosition = async (symbol = "BTC/USDT") => {
  try {
    const positions = await exchange.fetchPositions([symbol]);
    const position = positions.find(position => position.symbol === symbol);
    console.log(position);
    return position;
  } catch (error) {
    console.error("Erro ao obter a posição: ", error);
  }
};

const getCurrentPrice = async (symbol) => {
  try {
    const ticker = await exchange.fetchTicker(symbol);
    const price = parseFloat(ticker.last);
    console.log(`Preço atual de ${symbol}:`, price);
    return price;
  } catch (error) {
    console.error("Erro ao obter o preço atual: ", error);
    throw error;
  }
};

const getCandles = async (symbol = "BTC/USDT", timeframe = "5m", limit = 50) => {
  try {
    const candles = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
    return candles.map(candle => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5]
    }));
  } catch (error) {
    console.error("Erro ao obter candles: ", error);
  }
};

const cancelFutureOrder = async (symbol, orderId) => {
  try {
    const response = await exchange.cancelOrder(orderId, symbol);
    return response;
  } catch (error) {
    console.error("Erro ao cancelar ordem: ", error);
  }
};

const getFutureOpenOrders = async (symbol) => {
  try {
    const orders = await exchange.fetchOpenOrders(symbol);
    return orders;
  } catch (error) {
    console.error("Erro ao obter ordens abertas: ", error);
  }
};

const createOrder = async (order) => {
  console.log("createOrder", order);
  try {
    const result = await exchange.createOrder(order.symbol, order.type, order.side, order.quantity, order.price, {
      positionSide: order.positionSide,
      leverage: STRATEGY_LEVERAGE
    });
    console.log("Ordem criada: ", result);
    return result;
  } catch (error) {
    console.error("Erro ao criar ordem: ", error);
  }
};

const stopLoss = async (position) => {
  const entryPrice = parseFloat(position.entryPrice);
  const amount = parseFloat(position.positionAmt);
  const side = amount > 0 ? "sell" : "buy";
  const quantity = Math.abs(amount);
  const lastPrice = CURRENT_PRICE;
  const positionSide = position.positionSide;

  console.log("STOP LOSS", { entryPrice, lastPrice });
  if (side === "sell" && entryPrice - STRATEGY_VALUE_TO_STOP_LOSS > lastPrice) {
    const order = {
      symbol,
      quantity,
      type: "market",
      side: "buy",
      positionSide: positionSide
    };
    await createOrder(order);
  }
  if (side === "buy" && entryPrice + STRATEGY_VALUE_TO_STOP_LOSS < lastPrice) {
    const order = {
      symbol,
      quantity,
      type: "market",
      side: "sell",
      positionSide: positionSide
    };
    await createOrder(order);
  }
};

const closeOrder = async (position, symbol = "BTC/USDT", lastPrice) => {
  const { hasOpenPosition, entryPrice, amount, side, quantity } = getDataFromPosition(position);
  console.log("\n\n\n Entrou na estratégia de fechamento - create order\n\n\n", { side });
  if (side === "buy") {
    const order = {
      symbol,
      quantity,
      type: "market",
      side: "sell",
      positionSide: "long"
    };
    const result = await createOrder(order);
    console.log({ result });
  }
  if (side === "sell") {
    const order = {
      symbol,
      quantity,
      type: "market",
      side: "buy",
      positionSide: "short"
    };
    const result = await createOrder(order);
    console.log({ result });
  }
};


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


  const limit = 50; // quantidade de candles a serem recuperados
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
      side: "BUY",
      positionSide: "LONG", 
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
      side: "SELL",
      positionSide: "SHORT", 
    }
    console.log({order});
    const result = await createOrder(order);
    console.log({result});
  }

  return signal;
}


setInterval(async () => {
  console.log("\n\n\nrodando...", new Date());
  try {
    CURRENT_PRICE = await getCurrentPrice(symbol);
    const position = await getPosition(symbol);
    const hasOpenPosition = position && parseFloat(position.positionAmt) !== 0;
    console.log({ hasOpenPosition });

    if (!hasOpenPosition) {

      // Verifica condição para criar uma ordem
      await testToCreatePosition(candles);

    } else { // se tem posição aberta

      if (hasOpenPosition) {
        const openOrders = await getFutureOpenOrders(symbol);
        if (openOrders.length > 0) {
          await closeOrder(position, symbol, CURRENT_PRICE);
        }
        await stopLoss(position);
      }
    }
  } catch (error) {
    console.error("Erro no loop principal: ", error);
  }
}, 10 * 1000);
