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

const isGreen = (candle) => candle.close > candle.open;
const analyzeLastThreeCandles = (candles) => {
  const lastThreeCandles = candles.slice(-3);
  return lastThreeCandles.every(isGreen);
}

setInterval( async () => {
  
  try {
    const position = await getPosition(symbol);
    const hasOpenPosition = position.positionAmt !== '0';
    console.log(hasOpenPosition);
    
    if (!hasOpenPosition) {

      const candles = await getCandles(symbol);
      // Verifica condição para criar uma ordem

      if (analyzeLastThreeCandles(candles)) {
        const quantity = 0.001;
        const order = {
          type: 'MARKET',
          side: 'BUY',
          quantity,
          symbol
        }
        const result = await createOrder(order);
        console.log(result);
      }
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