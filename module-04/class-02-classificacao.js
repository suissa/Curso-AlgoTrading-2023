const Binance = require('binance-api-node').default;
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

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

const getCandles = async (symbol = 'BTCUSDT', interval = "5m") => {
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

const { DecisionTreeClassifier } = require('ml-cart');
const { SMA, RSI } = require('technicalindicators');

const calculateSMA = (prices, period) => SMA.calculate({ period, values: prices });
const calculateRSI = (prices, period) => RSI.calculate({ period, values: prices });

const prepareData = (prices, smaPeriod, rsiPeriod) => {
  const sma = calculateSMA(prices, smaPeriod);
  const rsi = calculateRSI(prices, rsiPeriod);

  const features = [];
  const labels = [];

  for (let i = Math.max(smaPeriod, rsiPeriod); i < prices.length; i++) {
    if (typeof sma[i - 1] !== 'number' || typeof rsi[i - 1] !== 'number') {
      continue;
    }
    features.push([sma[i - 1], rsi[i - 1]]);
    labels.push(prices[i] > prices[i - 1] ? 1 : 0);
  }

  return { features, labels };
}

const testClassification = async (candles) => {

  const prices = candles.map(candle => parseFloat(candle.close)); // Array com os preços históricos de fechamento
  const smaPeriod = 14;
  const rsiPeriod = 14;
  
  const { features, labels } = prepareData(prices, smaPeriod, rsiPeriod);
  console.log({ features, labels });
  const classifier = new DecisionTreeClassifier({ maxDepth: 10 });
  classifier.train(features, labels);
  
  // Testando a previsão do modelo
  const lastIndex = features.length - 1;
  const lastFeature = features[lastIndex];
  const lastLabel = labels[lastIndex];
  const lastPrice = candles[candles.length - 1].close; // pega o último preço
  const prediction = classifier.predict([lastFeature])[0];
  
  console.log("Real:", lastLabel === 1 ? "Alta" : "Baixa");
  console.log("Previsão:", prediction === 1 ? "Alta" : "Baixa");
  if (lastLabel == "Baixa" && prediction == "Alta") {
    const quantity = 0.001;
    const price = lastPrice;
    const order = {
      type: 'LIMIT',
      side: 'BUY',
      price,
      quantity
    }
    console.log({order});
    const result = await createOrder(order);
    console.log(result);
  }
  if (lastLabel == "Alta" && prediction == "Baixa") {
    const quantity = 0.001;
    const price = lastPrice;
    const order = {
      type: 'LIMIT',
      side: 'SELL',
      price,
      quantity
    }
    console.log({order});
    const result = await createOrder(order);
    console.log(result);
  }
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
      await testClassification(candles);

    }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000) 