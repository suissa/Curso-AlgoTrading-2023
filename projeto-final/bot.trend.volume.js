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
      interval: interval,
      limit: 10
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
const getTrend = (candles) => {
  let isUptrend = true;
  let isDowntrend = true;

  for (let i = 1; i < candles.length; i++) {
    const currentCandle = candles[i];
    const previousCandle = candles[i - 1];

    const currentClose = parseFloat(currentCandle[4]); // Preço de fechamento da vela atual
    const previousClose = parseFloat(previousCandle[4]); // Preço de fechamento da vela anterior

    if (currentClose <= previousClose) {
      isUptrend = false; // Se qualquer vela tiver um preço de fechamento menor ou igual à vela anterior, não é uma tendência de alta
    }

    if (currentClose >= previousClose) {
      isDowntrend = false; // Se qualquer vela tiver um preço de fechamento maior ou igual à vela anterior, não é uma tendência de baixa
    }
  }

  if (isUptrend) {
    return 'uptrend';
  } else if (isDowntrend) {
    return 'downtrend';
  } else {
    return 'no trend'; // Se não for uma tendência de alta nem de baixa, podemos considerar como "sem tendência"
  }
};


const checkVolumeAndTrend = async (candles, volumeThreshold, trendConfirmationThreshold) => {
  const firstCandle = candles[candles.length - 3];
  const lastCandle = candles[candles.length - 2];

  const firstVolume = parseFloat(firstCandle.volume); // Volume da primeira vela
  const lastVolume = parseFloat(lastCandle.volume); // Volume da última vela

  console.log(`Volume da primeira vela: ${firstVolume}`);
  console.log(`Volume da última vela: ${lastVolume}`);

  // Verificação de tendência
  const trend = getTrend(candles);

  if (trend === 'uptrend') {
    if (lastVolume >= volumeThreshold && lastVolume > firstVolume && lastVolume >= trendConfirmationThreshold) {
      console.log(`\n\nAlto volume (${lastVolume}) - Continuação de tendência de alta`);
      // Implemente a lógica para continuação de tendência de alta aqui
      console.log("uptrend createOrder BUY");

      const quantity = 0.001;
      const order = {
        quantity,
        symbol,
        type: "MARKET",
        side: "BUY"
      }
      console.log({order});
      const result = await createOrder(order);
      console.log({result});
      return;
    } 
    if (lastVolume < volumeThreshold && lastVolume < firstVolume) {
      
      console.log(`\n\nBaixo volume (${lastVolume}) - Reversão de tendência de alta para baixa`);
      // Implemente a lógica para continuação de tendência de alta aqui
      console.log("uptrend createOrder SELL");

      const quantity = 0.001;
      const order = {
        quantity,
        symbol,
        type: "MARKET",
        side: "SELL"
      }
      console.log({order});
      const result = await createOrder(order);
      console.log({result});
      return;
    }
    console.log('Volume inconclusivo para continuação de tendência de alta');
  } 
  
  if (trend === 'downtrend') {
    if (lastVolume >= volumeThreshold && lastVolume > firstVolume && lastVolume >= trendConfirmationThreshold) {
      console.log(`\n\nAlto volume (${lastVolume}) - Continuação de tendência de alta`);
      // Implemente a lógica para continuação de tendência de alta aqui
      console.log("downtrend createOrder SELL");

      const quantity = 0.001;
      const order = {
        quantity,
        symbol,
        type: "MARKET",
        side: "SELL"
      }
      console.log({order});
      const result = await createOrder(order);
      console.log({result});
      return;
    } 
    if (lastVolume < volumeThreshold && lastVolume < firstVolume) {
      
      console.log(`\n\nBaixo volume (${lastVolume}) - Reversão de tendência de baixa para alta`);
      // Implemente a lógica para continuação de tendência de alta aqui
      console.log("downtrend createOrder BUY");
      const quantity = 0.001;
      const order = {
        quantity,
        symbol,
        type: "MARKET",
        side: "BUY"
      }
      console.log({order});
      const result = await createOrder(order);
      console.log({result});
      return;
    }
    console.log('Volume inconclusivo para continuação de tendência de alta');
    // Implemente a lógica para cenários inconclusivos ou outros casos aqui

  } 

  console.log('Sem tendência');
};


const getBinanceFuturesVolumeAndTrend = async (candles) => {

  try {
    const symbol = 'BTCUSDT';
    const interval = '5m'; // Intervalo das velas (candles), neste exemplo, 1 hora
    const limit = 10; // Número de velas a serem recuperadas
    const volumeThreshold = 12000; // Limite de volume para distinguir alto e baixo (exemplo)
    const trendConfirmationThreshold = 0.02; // Limite de confirmação de tendência (exemplo)

    await checkVolumeAndTrend(candles, volumeThreshold, trendConfirmationThreshold);
  } catch (error) {
    console.error(error);
  }
};



const STRATEGY_DIFF_TO_CLOSE = 30;
const STRATEGY_DIFF_TO_AVERAGE = 50;
const STRATEGY_MAX_AVERAGE_PRICES = 5;
const STRATEGY_VALUE_TO_STOP_LOSS = 100;

let amountOfAveragePrices = 0;

setInterval( async () => {
  console.log("\n\n\n\n\nrodando...", new Date());
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

    if (hasOpenPosition) {

      // // Obter dados históricos
      // const candles = await getHistoricalData(symbol, interval, limit);
      // Verifica condição para criar uma ordem
      await getBinanceFuturesVolumeAndTrend(candles);

      return false;
    } 
    // else { // se tem posição aberta
    //   const openOrders = await getFutureOpenOrders(symbol);
    //   const lastCandle = candles[candles.length - 1];
    //   const price = lastPrice; // pega o último preço
    //   // cria ordem de fechamento
    //   console.log("Teste para entrar na ordem de fechamento: ", openOrders.length, openOrders.length == 0)
    //   if (openOrders.length == 0) {
    //     console.log("\n\n\n Entrou na estratégia de fechamento - create order\n\n\n", {side});
    //     if (side === "BUY") {
    //       const order = {
    //         symbol,
    //         price:  Math.floor(Number((entryPrice + STRATEGY_DIFF_TO_CLOSE).toFixed(2))),
    //         quantity,
    //         type: "LIMIT",
    //         side: "SELL",
    //       }
    //       const result = await createOrder(order);
    //       console.log({result});
    //     }
    //     if (side === "SELL") {
    //       const order = {
    //         symbol,
    //         price:  Math.floor(Number((entryPrice - STRATEGY_DIFF_TO_CLOSE).toFixed(2))),
    //         quantity,
    //         type: "LIMIT",
    //         side: "BUY",
    //       }
    //       const result = await createOrder(order);
    //       console.log({result});
    //     }
    //   }
    //   // preço médio
    //   if (amountOfAveragePrices < STRATEGY_MAX_AVERAGE_PRICES) {
    //     // SE a posição for de compra, cria uma ordem de compra
    //     // type: "MARKET" para criar a ordem que será executada direto
    //     console.log("Teste de preço médio", {entryPrice, price, STRATEGY_DIFF_TO_AVERAGE})
    //     console.log("Teste de preço médio BUY", entryPrice - STRATEGY_DIFF_TO_AVERAGE, entryPrice - STRATEGY_DIFF_TO_AVERAGE > price)
    //     console.log("Teste de preço médio SELL", entryPrice + STRATEGY_DIFF_TO_AVERAGE, entryPrice + STRATEGY_DIFF_TO_AVERAGE < price)
    //     if (side === "BUY" && entryPrice - STRATEGY_DIFF_TO_AVERAGE > price) {
    //       // PRIMEIRO CANCELA A ORDEM DE FECHAMENTO
    //       if (openOrders.length > 0) {
    //         const cancel = await cancelFutureOrder("BTCUSDT", openOrders[0].orderId);
    //         console.log(cancel);
    //       }
    //       amountOfAveragePrices += 1;
    //       console.log("PREÇO MÉDIO - criando ordem de compra", {side, amountOfAveragePrices});
    //       const order = {
    //         symbol,
    //         quantity,
    //         type: "MARKET",
    //         side: "BUY",
    //       }
    //       const result = await createOrder(order);
    //       console.log(result);
    //     }
    //     // SE a posição for de venda, cria uma ordem de venda
    //     if (side === "SELL" && entryPrice + STRATEGY_DIFF_TO_AVERAGE < price) {
    //       // PRIMEIRO CANCELA A ORDEM DE FECHAMENTO
    //       if (openOrders.length > 0) {
    //         const cancel = await cancelFutureOrder("BTCUSDT", openOrders[0].orderId);
    //         console.log(cancel);
    //       }
    //       amountOfAveragePrices += 1;
    //       console.log("PREÇO MÉDIO - criando ordem de venda", {side, amountOfAveragePrices});
    //       const order = {
    //         symbol,
    //         quantity,
    //         type: "MARKET",
    //         side: "SELL",
    //       }
    //       const result = await createOrder(order);
    //       console.log(result);
    //     }
    //   }


    //   // STOP LOSS
    //   if (amountOfAveragePrices == STRATEGY_MAX_AVERAGE_PRICES) {
    //     console.log("Teste de stop loss", {STRATEGY_MAX_AVERAGE_PRICES, amountOfAveragePrices, price}, entryPrice + STRATEGY_VALUE_TO_STOP_LOSS)

    //     amountOfAveragePrices = 0;
    //     // se o lastPrice for menor que o entryPrice menos o valor do stop loss e side BUY
    //     console.log("\n\n\n\n\n STOP LOSS", {entryPrice, lastPrice})
    //     if (side == "BUY" && entryPrice - STRATEGY_VALUE_TO_STOP_LOSS > lastPrice) {
    //       const order = {
    //         symbol,
    //         quantity,
    //         type: "MARKET",
    //         side: "SELL"
    //       }
    //       const result = await createOrder(order);
    //       console.log(result);
    //     }
    //     // se o lastPrice for maior que o entryPrice mais o valor do stop loss e side SELL
    //     if (side == "SELL" && entryPrice + STRATEGY_VALUE_TO_STOP_LOSS < lastPrice) {
    //       const order = {
    //         symbol,
    //         quantity,
    //         type: "MARKET",
    //         side: "BUY"
    //       }
    //       const result = await createOrder(order);
    //       console.log(result);
    //     }
    //   }
    // }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000)