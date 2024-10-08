const Binance = require('binance-api-node').default;
require('dotenv').config();

const API_KEY = process.env.API_KEY_BRAVE;
const API_SECRET = process.env.API_SECRET_BRAVE;

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  futures: true // ativa o modo de futuros
});

const symbol = 'BTCUSDT';
const getPosition = async (symbol = 'BTCUSDT') => {
  try {
    const positions = await client.futuresPositionRisk({symbol});
    const position = positions.find(position => position.symbol === symbol);
    console.log(position);

    return position;
  } catch (error) {
    console.error(error);
  }
}

const getFutureOpenOrders = async (symbol = 'BTCUSDT') => {
  try {
    const orders = await client.futuresOpenOrders({
      symbol: symbol,
    });
    return orders;
  } catch (err) {
    console.error(err);
  }
}

const getCandles = async (symbol = 'BTCUSDT', interval = "5m") => {
  try {
    const candles = await client.futuresCandles({
      symbol: symbol,
      interval: interval
    });
    console.log("Last candle: ", candles[candles.length - 1]);
    return candles;
  } catch (error) {
    console.error(error);
  }
}

const createOrder = async (order) => {
  console.log('createOrder');
  if (order.type === 'LIMIT') 
    order.timeInForce = 'GTC';
  if (order.type === 'MARKET') 
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
  const lastThreeCandles = candles.slice(-3);
  return lastThreeCandles.every(isRedCandle);
}

const isGreen = (candle) => candle.close > candle.open;
const analyzeIfLastThreeCandlesAreGreen = (candles) => {
  const lastThreeCandles = candles.slice(-3);
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
const RSI = require('technicalindicators').RSI;

const calcularRSI = (values, period) => {
  const input = {
    values, // prices
    period,
  };
  return RSI.calculate(input);
}

const MACD = require('technicalindicators').MACD;

const calcularMACD = (precos, periodoCurto, periodoLongo, sinalPeriodo) => {
  const input = {
    values: precos,
    fastPeriod: periodoCurto,
    slowPeriod: periodoLongo,
    signalPeriod: sinalPeriodo,
  };
  return MACD.calculate(input);
}

const testToCreatePosition = async (data) => {
  const lastIndex = data.length - 1;
  const signal = {};

  const shortPeriod = 50;
  const longPeriod = 200;
  const prices = data.map((entry) => parseFloat(entry.close));
  const shortSMA = calculateSMA(prices, shortPeriod);
  const longSMA = calculateSMA(prices, longPeriod);
  const rsi = (calcularRSI(prices, 14)).reverse();
  const macd = (calcularMACD(prices, 12, 26, 9)).reverse();
  
  console.log(macd[0], rsi[0])

  const isSmaCrossOver = shortSMA[lastIndex - 1] < longSMA[lastIndex - 1] && shortSMA[lastIndex] > longSMA[lastIndex];
  const isSmaCrossUnder = shortSMA[lastIndex - 1] > longSMA[lastIndex - 1] && shortSMA[lastIndex] < longSMA[lastIndex];
  const isRsiOverSold = rsi[0] < 30;
  const isRsiOverBought = rsi[0] > 70;
  const isMacdCrossOver = macd[0].histogram < 0 && macd[1].histogram > 0;
  const isMacdCrossUnder = macd[0].histogram > 0 && macd[1].histogram < 0;
  const isLastThreeReds = analyzeIfLastThreeCandlesAreRed(data);
  const isLastThreeGreens = analyzeIfLastThreeCandlesAreGreen(data);

  if ((isSmaCrossOver && isRsiOverSold && isMacdCrossOver) || isLastThreeGreens) {
    const price = data[lastIndex].close; // pega o último preço
    const quantity = 0.001;
    const order = {
      type: 'MARKET',
      side: 'BUY',
      quantity,
      symbol
    }
    console.log({order});
    const result = await createOrder(order);
    console.log(result);
  } else if ((isSmaCrossUnder && isRsiOverBought && isMacdCrossUnder) || isLastThreeReds) {
    const price = data[lastIndex].close; // pega o último preço
    const quantity = 0.001;
    const order = {
      type: 'MARKET',
      side: 'SELL',
      quantity,
      symbol
    }
    console.log({order});
    const result = await createOrder(order);
    console.log(result);
  }

  return signal;
}

setInterval( async () => {
  console.log("rodando...", new Date());
  try {
    const position = await getPosition(symbol);
    const hasOpenPosition = position.positionAmt != '0.000';
    console.log(hasOpenPosition);
    
    if (!hasOpenPosition) {
      const candles = await getCandles(symbol);

      // Verifica condição para criar uma ordem
      await testToCreatePosition(candles);

    } else {
      const openOrders = await getFutureOpenOrders(symbol);
      const lastCandle = candles[candles.length - 1];
      const price = lastCandle.close; // pega o último preço
      
      if (openOrders.length === 0) {
        const position = await getPosition(symbol);
        const quantity = position.positionAmt;
        const order = {
          type: 'LIMIT',
          side: 'SELL',
          price,
          quantity,
          symbol
        }
        const result = await createOrder(order);
        console.log(result);
      }
    }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000)