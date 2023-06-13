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

const testRegression = async (candles) => {

  // Importação de bibliotecas necessárias
  const regression = require('regression');

  // Preparar os dados para treinamento
  const data = candles.map(candle => [candle.openTime, parseFloat(candle.close)]);
  // Calcular a regressão linear dos preços
  const result = regression.linear(data);
  // Prever o preço para o próximo dia
  const predictedPrice = result.equation[1];
  console.log({predictedPrice});
  // Tomar decisões de compra e venda baseadas nas previsões
  const lastPrice = candles[candles.length - 1].close;
  if (predictedPrice > lastPrice) {
    console.log('Comprar: Preço previsto é maior que o preço atual');
    const price = lastPrice;
    const quantity = 0.001;
    const order = {
      type: 'LIMIT',
      side: 'BUY',
      price,
      quantity
    }
    console.log({order});
    // const result = await createOrder(order);
    // console.log(result);

  } else if (predictedPrice < lastPrice) {
    console.log('Vender: Preço previsto é menor que o preço atual');
    const price = lastPrice; 
    const quantity = 0.001;
    const order = {
      type: 'LIMIT',
      side: 'SELL',
      price,
      quantity
    }
    console.log({order});
    // const result = await createOrder(order);
    // console.log(result);
  } else {
    console.log('Manter: Preço previsto é igual ao preço atual');
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
      await testRegression(candles);

    }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000) 