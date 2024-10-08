# Como implementar estratégias de trading em código usando Javascript

Uma estratégia de trading pode ser tão simples ou complexa quanto você desejar. 

## Básico

Primeira coisa que precisamos fazer é testar se existe uma posição aberta, caso não exista aí podemos continuar.
Além disso iremos rodar esse teste a cada X segundos, no caso do código a seguir ele verifica a posição a cada
10 segundos.


> arquivo class-04-a.js

```js

const symbol = 'BTCUSDT';

setInterval( async () => {
  
  try {
    // Verifica se existe uma posição aberta em BTCUSDT
    const positions = await client.futuresPositionRisk({
      symbol: symbol
    });

    const positionBTCUSDT = positions.find(position => position.symbol === symbol);
    console.log(positionBTCUSDT);

    const hasOpenPosition = positionBTCUSDT.positionAmt !== '0';
    console.log(hasOpenPosition);

  } catch (error) {
    console.error(error);
  }

}, 10 * 1000); // 10 segundos
```
Depois disso que analisaremos o cenário(*candles*) para criar uma ordem.

> arquivo: class-04-b.js

```js
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
const createOrder = async (order = {type = "LIMIT", side = "BUY", price = 20000, quantity = 0.001}) => {
  console.log('createOrder');

  if (order.type === 'LIMIT') 
    order.timeInForce = 'GTC';
  if (order.type === 'MARKET') 
    delete order.price;
    
  try {
    const result = await client.futuresOrder(order);
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
  
}

setInterval( async () => {
  
  try {
    const position = await getPosition(symbol);
    const hasOpenPosition = position.positionAmt !== '0';
    console.log(hasOpenPosition);
    
    if (!hasOpenPosition) {

      const candles = await getCandles(symbol);
      const lastCandle = candles[candles.length - 1];
      const prevCandle = candles[candles.length - 2];

      // Verifica condição para criar uma ordem
      if (lastCandle.close > prevCandle.close) {
        const price = lastCandle.close;
        const quantity = 0.001;
        const order = {
          type: 'LIMIT',
          side: 'BUY',
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

}, 10 * 1000); // 10 segundos
```

## Short
Vamos criar uma estratégia simples apenas para mostrar como seria entrar em uma posição de venda.

Uma posição de venda, também conhecida como "*short*", é uma estratégia de negociação na qual você vende ativos que não possui, com a expectativa de que o preço cairá e, posteriormente, comprará os ativos a um preço menor para devolver ao credor, lucrando com a diferença de preço. Essa abordagem é o oposto de uma posição longa, onde você compra ativos na esperança de que o preço suba.

Aqui está um exemplo simples de estratégia *short*:

- Identifique um ativo com tendência de baixa, onde o preço está caindo consistentemente;
- Crie a ordem de venda.
- Compre a mesma quantidade vendida para fechar a posição

> arquivo: class-04-c.js

```js
const Binance = require('binance-api-node').default;
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  futures: true // ativa o modo de futuros
});

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
const analyzeLastThreeCandles = (candles) => {
  const lastThreeCandles = candles.slice(-3);
  return lastThreeCandles.every(isRedCandle);
}


const symbol = 'BTCUSDT';

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
          quantity
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
        const quantity = Math.abs(position.positionAmt);
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

}, 10 * 1000); // 10 segundos
```


## Long

Para a posição de compra *long* vamos utilizar o mesmo código, mudando apenas a parte da análise dos *candles*:

> arquivo class-04-e.js

```js

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
      const lastCandle = candles[candles.length - 1];
      const prevCandle = candles[candles.length - 2];

      // Verifica condição para criar uma ordem

      if (analyzeLastThreeCandles(candles)) {
        const price = lastCandle.close; // pega o último preço
        const quantity = 0.001;
        const order = {
          type: 'LIMIT',
          side: 'BUY',
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
```

## Estratégia Básica

Para uma estratégia básica devemos primeiro entender o conceito de médias móveis simples (SMA). A SMA é uma média aritmética calculada ao longo de um período específico de tempo e, à medida que novos pontos de dados são adicionados, os pontos de dados mais antigos são removidos. A SMA é usada para suavizar flutuações de preços e identificar tendências de mercado.

Neste exemplo, utilizaremos duas médias móveis com diferentes períodos: uma de curto prazo (por exemplo, 20 períodos) e outra de longo prazo (por exemplo, 50 períodos). A estratégia básica consiste em gerar sinais de compra e venda quando essas médias móveis se cruzam.

```js

const getCandles = async (symbol = 'BTCUSDT', interval = "5m", limit = "100") => {

  try {
    const candles = await client.futuresCandles({
      symbol,
      interval,
      limit
    });
    console.log("Last candle: ", candles[candles.length - 1]);
    return candles;
  } catch (error) {
    console.error(error);
  }
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

const generateSignals = (data, shortSMA, longSMA) => {
  const signals = [];

  for (let i = 1; i < data.length; i++) {
    if (shortSMA[i - 1] < longSMA[i - 1] && shortSMA[i] > longSMA[i]) {
      signals.push({ type: 'BUY', date: data[i].date });
    } else if (shortSMA[i - 1] > longSMA[i - 1] && shortSMA[i] < longSMA[i]) {
      signals.push({ type: 'SELL', date: data[i].date });
    }
  }

  return signals;
}


;(async () => {
  const shortPeriod = 50;
  const longPeriod = 200;
  const data = await getCandles("BTCUSDT", "15m", longPeriod);
  const prices = data.map((entry) => parseFloat(entry.close));
  const shortSMA = calculateSMA(prices, shortPeriod);
  const longSMA = calculateSMA(prices, longPeriod);
  const signals = generateSignals(data, shortSMA, longSMA);
  console.log(signals);
})();
```

Também podemos criar uma utilizando o indicador **RSI**.

> RSI é a sigla para Relative Strength Index, que em português pode ser traduzido como Índice de Força Relativa. O RSI é um indicador técnico utilizado no mercado financeiro para analisar a força e a direção da tendência de um ativo financeiro.

O RSI compara a magnitude dos ganhos recentes com a magnitude das perdas recentes, com base nos preços de fechamento. Ele é calculado através de uma fórmula matemática que utiliza uma escala de 0 a 100. Quando o RSI está acima de 70, é considerado que o ativo está sobrecomprado, o que pode indicar uma possível reversão da tendência de alta. Quando o RSI está abaixo de 30, é considerado que o ativo está sobrevendido, o que pode indicar uma possível reversão da tendência de baixa.

```js
const RSI = require('technicalindicators').RSI;

const calcularRSI = (values, period) => {
  const input = {
    values, // prices
    period,
  };
  return RSI.calculate(input);
}
```

E/ou com o indicador **MACD**.

> MACD é a sigla para Moving Average Convergence Divergence, que em português pode ser traduzido como Convergência e Divergência de Médias Móveis. O MACD é outro indicador técnico utilizado no mercado financeiro para analisar a direção e a força da tendência de um ativo financeiro.

O MACD é calculado subtraindo a média móvel exponencial de 26 dias da média móvel exponencial de 12 dias. Em seguida, é plotada uma linha de sinal (média móvel exponencial de 9 dias) sobre o resultado. Quando o MACD cruza acima da linha de sinal, é considerado um sinal de compra, indicando uma possível tendência de alta. Quando o MACD cruza abaixo da linha de sinal, é considerado um sinal de venda, indicando uma possível tendência de baixa.


```js
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
```
Você pode combinar os indicadores técnicos mencionados acima com a estratégia baseada em médias móveis simples. Por exemplo essa função gera sinais de compra quando o SMA de curto prazo cruza o SMA de longo prazo, o RSI está abaixo de 30 (sobrevenda) e o histograma MACD cruza zero (sinal de alta). Ele gera sinais de venda quando o SMA de curto prazo cruza sob o SMA de longo prazo, o RSI está acima de 70 (sobrecompra) e o histograma MACD cruza abaixo de zero (sinal de baixa).

```js
const generateAdvancedSignals = (data, shortSMA, longSMA, rsi, macd) => {
  const signals = [];

  for (let i = 1; i < data.length; i++) {
    const isSmaCrossOver = shortSMA[i - 1] < longSMA[i - 1] && shortSMA[i] > longSMA[i];
    const isSmaCrossUnder = shortSMA[i - 1] > longSMA[i - 1] && shortSMA[i] < longSMA[i];
    const isRsiOverSold = rsi[i] < 30;
    const isRsiOverBought = rsi[i] > 70;
    const isMacdCrossOver = macd[i].histogram < 0 && macd[i - 1].histogram > 0;
    const isMacdCrossUnder = macd[i].histogram > 0 && macd[i - 1].histogram < 0;

    if (isSmaCrossOver && isRsiOverSold && isMacdCrossOver) {
      signals.push({ type: 'BUY', date: data[i].date });
    } else if (isSmaCrossUnder && isRsiOverBought && isMacdCrossUnder) {
      signals.push({ type: 'SELL', date: data[i].date });
    }
  }

  return signals;
}
```

Agora a versão que usaremos analisando apenas o último *candle*:

```js
const generateAdvancedSignal = (data, shortSMA, longSMA, rsi, macd) => {
  const lastIndex = data.length - 1;
  const signal = {};

  const isSmaCrossOver = shortSMA[lastIndex - 1] < longSMA[lastIndex - 1] && shortSMA[lastIndex] > longSMA[lastIndex];
  const isSmaCrossUnder = shortSMA[lastIndex - 1] > longSMA[lastIndex - 1] && shortSMA[lastIndex] < longSMA[lastIndex];
  const isRsiOverSold = rsi[lastIndex] < 30;
  const isRsiOverBought = rsi[lastIndex] > 70;
  const isMacdCrossOver = macd[lastIndex].histogram < 0 && macd[lastIndex - 1].histogram > 0;
  const isMacdCrossUnder = macd[lastIndex].histogram > 0 && macd[lastIndex - 1].histogram < 0;

  if (isSmaCrossOver && isRsiOverSold && isMacdCrossOver) {
    signal.type = 'BUY';
  } else if (isSmaCrossUnder && isRsiOverBought && isMacdCrossUnder) {
    signal.type = 'SELL';
  } else {
    signal.type = 'NO_ACTION';
  }

  return signal;
}

```

Juntando tudo teremos o seguinte código:

> arquivo: class-04-e.js

```js
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
  console.log({rsi, macd}, macd[0], rsi[0])
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
```


## Estratégia Avançada

Agora vamos aprender a criar o preço médio e stop loss dinâmicos. Essa abordagem pode ajudar a otimizar os lucros e minimizar os riscos.

### Preço Médio Dinâmico

O preço médio dinâmico refere-se ao cálculo do preço médio de entrada de uma posição conforme novas ordens são executadas. Isso pode ser útil para rastrear seu preço médio de entrada, especialmente ao negociar em mercados voláteis.
Com o preço médio, você aproxima o seu preço de entrada do preço atual 
Essa técnica é muito utilizada antes do *stop loss* para que dê uma oportunidade do preço executar sua ordem de saída.

*Como o código ficou muito grande não coloquei o código aqui.*

> arquivo: class-04-f.js
