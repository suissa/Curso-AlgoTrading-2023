const Binance = require("binance-api-node").default;
require("dotenv").config();
// ta funcionando
const API_KEY = process.env.API_KEY_BRAVE;
const API_SECRET = process.env.API_SECRET_BRAVE;

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  futures: true // ativa o modo de futuros
});

const symbol = "BTCUSDT";
const STRATEGY_DIFF_TO_CLOSE = 30;
const STRATEGY_VALUE_TO_STOP_LOSS = 90;
const STRATEGY_DIFF_TO_AVERAGE = 70;
const STRATEGY_MAX_AVERAGE_PRICES = 6;
const STRATEGY_HAS_AVERAGE_PRICE = false;
const STRATEGY_HAS_STOP_LOSS = true;
const STRATEGY_AMOUNT = 0.01;

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
    return null;
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

const testToCreatePosition = async (data) => {
  console.log("testToCreatePosition");
  amountOfAveragePrices = 0;
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

  let logStrategy = {
    isRsiOverSold,    
    isMacdCrossOver,    
    isLastThreeGreens,    
    isSmaCrossUnder,    
    isRsiOverBought,    
    isMacdCrossUnder,    
    isLastThreeReds
  }
  if ((isSmaCrossOver && isRsiOverSold && isMacdCrossOver) || isLastThreeGreens) {
    console.log("\n\n\n Entrou na estratégia BUY - create order", {isSmaCrossOver, isRsiOverSold, isMacdCrossOver, isLastThreeGreens});
    const price = data[lastIndex].close; // pega o último preço
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
  } else if ((isSmaCrossUnder && isRsiOverBought && isMacdCrossUnder) || isLastThreeReds) {
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
  console.log({logStrategy});
  return signal;
}


const runBot = async (symbol = "BTCUSDT") => {
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
      if (STRATEGY_HAS_AVERAGE_PRICE && amountOfAveragePrices < STRATEGY_MAX_AVERAGE_PRICES) {
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
      if (STRATEGY_HAS_STOP_LOSS && amountOfAveragePrices == STRATEGY_MAX_AVERAGE_PRICES) {
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
}

setInterval( async () => {
  console.log("\n\n\nrodando...", new Date());
  await runBot();

}, 10 * 1000)