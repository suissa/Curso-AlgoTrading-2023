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

const tf = require('@tensorflow/tfjs-node');
const { SMA } = require('technicalindicators');

function calculateSMA(prices, period) {
  return SMA.calculate({ period, values: prices });
}

function prepareData(prices, smaPeriod) {
  const sma = calculateSMA(prices, smaPeriod);
  const features = [];
  const labels = [];

  for (let i = smaPeriod; i < prices.length; i++) {
    features.push([prices[i - 1], sma[i - 1]]);
    labels.push(prices[i] > prices[i - 1] ? 1 : 0);
  }

  return { features, labels };
}

async function trainModel(model, features, labels) {
  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(labels.map(l => [l]));

  const history = await model.fit(xs, ys, {
    batchSize: 32,
    epochs: 100,
    shuffle: true,
    verbose: 1
  });

  return history;
}


const testRNA = async (candles) => {

  
  const prices = candles.map(candle => candle.close) // Array com os preços históricos de fechamento
  const smaPeriod = 14;

  const { features, labels } = prepareData(prices, smaPeriod);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, inputShape: [2], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: tf.losses.logLoss
  });

  trainModel(model, features, labels).then(history => {
    console.log('Treinamento concluído!');

    const lastIndex = features.length - 1;
    const lastFeature = tf.tensor2d([features[lastIndex]]);
    const lastLabel = labels[lastIndex];

    const prediction = model.predict(lastFeature).arraySync()[0][0] > 0.5 ? 1 : 0;

    console.log('Real:', lastLabel === 1 ? 'Alta' : 'Baixa');
    console.log('Previsão:', prediction === 1 ? 'Alta' : 'Baixa');
  });

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
      await testRNA(candles);

    }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000) 