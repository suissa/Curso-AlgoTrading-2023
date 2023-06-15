require("dotenv").config();
const Binance = require('binance-api-node').default;
const TechnicalIndicators = require('technicalindicators');

const API_KEY = process.env.API_KEY_BRAVE;
const API_SECRET = process.env.API_SECRET_BRAVE;
// Configuração inicial
const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
});

// Função para obter dados históricos
async function getHistoricalData(symbol, interval, limit) {
  const candles = await client.futuresCandles({
    symbol: symbol,
    interval: interval,
    limit: limit,
  });

  return candles;
}

// Função para calcular o indicador OBV
function calculateOBV(candles) {
  const obvInput = {
    close: candles.map(candle => parseFloat(candle.close)),
    volume: candles.map(candle => parseFloat(candle.volume)),
  };

  const obv = TechnicalIndicators.OBV.calculate(obvInput);
  return obv;
}


const symbol = "BTCUSDT";

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
    return null;
  }
  
}

function testToCreatePosition(trendPeriods) {

  // Calcular o indicador OBV
  const obv = calculateOBV(trendPeriods);
  let trendSum = 0;

  // Calcular a soma acumulada da tendência do OBV
  for (let i = obv.length - trendPeriods; i < obv.length - 1; i++) {
    const diff = obv[i + 1] - obv[i];
    trendSum += diff;
  }

  // Sinal de compra
  if (trendSum > 0) {
    console.log('Sinal de compra! \n\n\n');
    // Coloque sua lógica de execução de compra aqui
  }

  // Sinal de venda
  if (trendSum < 0) {
    console.log('Sinal de venda! \n\n\n');
    // Coloque sua lógica de execução de venda aqui
  }
}

// Função principal
// async function runStrategy() {
//   try {
//     const symbol = 'BTCUSDT';
//     const interval = '5m';
//     const limit = 100;
//     const shortPeriod = 9;

//     // Obter dados históricos
//     const candles = await getHistoricalData(symbol, interval, limit);

//     // Calcular o indicador OBV
//     const obv = calculateOBV(candles);

//     // Verificar os sinais de compra/venda
//     checkSignals(obv, shortPeriod);
//   } catch (error) {
//     console.error('Erro:', error);
//   }
// }

// setInterval (async () => {
//   console.log('\nExecutando estratégia...', new Date());
//   // Executar a estratégia
//   await runStrategy();
// }, 1000 * 10); 


const STRATEGY_DIFF_TO_CLOSE = 30;
const STRATEGY_DIFF_TO_AVERAGE = 50;
const STRATEGY_MAX_AVERAGE_PRICES = 5;
const STRATEGY_VALUE_TO_STOP_LOSS = 100;

let amountOfAveragePrices = 0;

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

      // // Obter dados históricos
      // const candles = await getHistoricalData(symbol, interval, limit);
      // Verifica condição para criar uma ordem
      await testToCreatePosition(candles);

    } else { // se tem posição aberta
      const openOrders = await getFutureOpenOrders(symbol);
      const lastCandle = candles[candles.length - 1];
      const price = lastPrice; // pega o último preço
      // cria ordem de fechamento
      console.log("Teste para entrar na ordem de fechamento: ", openOrders.length, openOrders.length == 0)
      if (openOrders.length == 0) {
        console.log("\n\n\n Entrou na estratégia de fechamento - create order\n\n\n", {side});
        if (side === "BUY") {
          const order = {
            symbol,
            price:  Math.floor(Number((entryPrice + STRATEGY_DIFF_TO_CLOSE).toFixed(2))),
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
            price:  Math.floor(Number((entryPrice - STRATEGY_DIFF_TO_CLOSE).toFixed(2))),
            quantity,
            type: "LIMIT",
            side: "BUY",
          }
          const result = await createOrder(order);
          console.log({result});
        }
      }
      // preço médio
      if (amountOfAveragePrices < STRATEGY_MAX_AVERAGE_PRICES) {
        // SE a posição for de compra, cria uma ordem de compra
        // type: "MARKET" para criar a ordem que será executada direto
        console.log("Teste de preço médio", {entryPrice, price, STRATEGY_DIFF_TO_AVERAGE})
        console.log("Teste de preço médio BUY", entryPrice - STRATEGY_DIFF_TO_AVERAGE, entryPrice - STRATEGY_DIFF_TO_AVERAGE > price)
        console.log("Teste de preço médio SELL", entryPrice + STRATEGY_DIFF_TO_AVERAGE, entryPrice + STRATEGY_DIFF_TO_AVERAGE < price)
        if (side === "BUY" && entryPrice - STRATEGY_DIFF_TO_AVERAGE > price) {
          // PRIMEIRO CANCELA A ORDEM DE FECHAMENTO
          if (openOrders.length > 0) {
            const cancel = await cancelFutureOrder("BTCUSDT", openOrders[0].orderId);
            console.log(cancel);
          }
          amountOfAveragePrices += 1;
          console.log("PREÇO MÉDIO - criando ordem de compra", {side, amountOfAveragePrices});
          const order = {
            symbol,
            quantity,
            type: "MARKET",
            side: "BUY",
          }
          const result = await createOrder(order);
          console.log(result);
        }
        // SE a posição for de venda, cria uma ordem de venda
        if (side === "SELL" && entryPrice + STRATEGY_DIFF_TO_AVERAGE < price) {
          // PRIMEIRO CANCELA A ORDEM DE FECHAMENTO
          if (openOrders.length > 0) {
            const cancel = await cancelFutureOrder("BTCUSDT", openOrders[0].orderId);
            console.log(cancel);
          }
          amountOfAveragePrices += 1;
          console.log("PREÇO MÉDIO - criando ordem de venda", {side, amountOfAveragePrices});
          const order = {
            symbol,
            quantity,
            type: "MARKET",
            side: "SELL",
          }
          const result = await createOrder(order);
          console.log(result);
        }
      }


      // STOP LOSS
      if (amountOfAveragePrices == STRATEGY_MAX_AVERAGE_PRICES) {
        console.log("Teste de stop loss", {STRATEGY_MAX_AVERAGE_PRICES, amountOfAveragePrices, price}, entryPrice + STRATEGY_VALUE_TO_STOP_LOSS)

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
    }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000)