const axios = require('axios');
const ti = require('technicalindicators');
const Alligator = require("./modules/alligator");
const PriceModel = require("./modules/model");
const Binance = require("binance-api-node").default;
require("dotenv").config();

const API_KEY = process.env.API_KEY_BRAVE;
const API_SECRET = process.env.API_SECRET_BRAVE;

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  futures: true // ativa o modo de futuros
});

const PERIOD5 = 5;
const PERIOD10 = 10;
const PERIOD20 = 20;
const PERIOD50 = 50;
const PERIOD100 = 100;
const PERIOD200 = 200;

const getCandles = async (symbol = "BTCUSDT", interval = "1m") => {
  try {
    const candles = await client.futuresCandles({
      symbol: symbol,
      interval: interval
    });
    return candles;
  } catch (error) {
    console.error(error);
  }
}


let input = {
  open: [], // preços de abertura
  high: [], // preços altos
  low: [], // preços baixos
  close: [], // preços de fechamento
  volume: [], // volumes de negociação
  period: 14, // período para os indicadores
};

async function fetchCurrentPrice() {
  try {
    const response = await axios.get('https://fapi.binance.com/fapi/v1/ticker/price', {
      params: {
        symbol: 'BTCUSDT',
      }
    });

    const price = parseFloat(response.data.price);
    // console.log(`Current BTCUSDT price: ${price}`);

    return price;
  } catch (error) {
    console.error(`Error fetching price: ${error}`);
  }
}

async function getCandlesticks() {
  try {
    const response = await axios.get('https://fapi.binance.com/fapi/v1/klines', {
      params: {
        symbol: 'BTCUSDT',
        interval: '1m',  // você pode ajustar o intervalo conforme necessário
        limit: 200,       // número de velas que você deseja obter
      },
    });

    const candlesticks = response.data;
    console.log({candlesticks});
    return candlesticks;
  } catch (error) {
    console.error(error);
  }
}


const DATA1 = require('./klines.json')
async function fetchData() {
  try {

    const response = await getCandlesticks();
    const price = await fetchCurrentPrice();

    const data = response;
    const latestData = data[data.length - 1];
    console.log(` price`, price);
    console.log(` data`, data);
    console.log(` data.length`, data.length);
    // return false;
    console.log(`Latest data: ${latestData}`);

    const open = data.map(d => parseFloat(d[1]))
    const high = data.map(d => parseFloat(d[2]))
    const low = data.map(d => parseFloat(d[3]))
    const close = data.map(d => parseFloat(d[4]))
    const volume = data.map(d => parseFloat(d[5]))
    input.open = open;
    input.high = high;
    input.low = low;
    input.close = close;
    input.volume = volume;
    input.values = close;

    // Check if we have enough data to start calculating indicators
    if(input.close.length > input.period) {
      const sma10 = new ti.SMA({period : 10, values : input.close}).getResult();
      const sma20 = new ti.SMA({period : 20, values : input.close}).getResult();
      const sma50 = new ti.SMA({period : 50, values : input.close}).getResult();
      const sma100 = new ti.SMA({period : 100, values : input.close}).getResult();
      const sma200 = new ti.SMA({period : 200, values : input.close}).getResult();

      const ema5 = new ti.EMA({...input, period: PERIOD5}).getResult();
      const ema10 = new ti.EMA({...input, period: PERIOD10}).getResult();
      const ema20 = new ti.EMA({...input, period: PERIOD20}).getResult();
      const ema50 = new ti.EMA({...input, period: PERIOD50}).getResult();
      const ema100 = new ti.EMA({...input, period: PERIOD100}).getResult();
      const ema200 = new ti.EMA({...input, period: PERIOD200}).getResult();
      // const wma = new ti.WMA(input.close).getResult();
      // const rsi = new ti.RSI(input.close).getResult();
      const bollingerBands = new ti.BollingerBands({...input, period: 20,
        stdDev: 2,
        values: data.slice(-20).map(d => parseFloat(d[4]))
      }).getResult();

      // const { jaw, teeth, lips } = Alligator(input.close);

      const adx = new ti.ADX(input).getResult();
      const atr = new ti.ATR(input).getResult();
      const cci = new ti.CCI({...input, period: 20}).getResult();
      const forceIndex5 = new ti.ForceIndex({...input, period: PERIOD5}).getResult();
      const forceIndex10 = new ti.ForceIndex({...input, period: PERIOD10}).getResult();
      const forceIndex20 = new ti.ForceIndex({...input, period: PERIOD20}).getResult();
      const forceIndex50 = new ti.ForceIndex({...input, period: PERIOD50}).getResult();
      const forceIndex100 = new ti.ForceIndex({...input, period: PERIOD100}).getResult();
      const forceIndex200 = new ti.ForceIndex({...input, period: PERIOD200}).getResult();
      const macd3 = new ti.MACD({values: input.close,
        fastPeriod        : 5,
        slowPeriod        : 8,
        signalPeriod      : 3,
        SimpleMAOscillator: false,
        SimpleMASignal    : false}).getResult();
      const macd9 = new ti.MACD({values: input.close,
        fastPeriod        : 12,
        slowPeriod        : 26,
        signalPeriod      : 9,
        SimpleMAOscillator: false,
        SimpleMASignal    : false}).getResult();
      const macd14 = new ti.MACD({values: input.close,
        fastPeriod        : 20,
        slowPeriod        : 50,
        signalPeriod      : 14,
        SimpleMAOscillator: false,
        SimpleMASignal    : false}).getResult();
      const obv = new ti.OBV.calculate(input);
      const roc5 = new ti.ROC({period: PERIOD5, values: input.close}).getResult();
      const roc10 = new ti.ROC({period: PERIOD10, values: input.close}).getResult();
      const roc20 = new ti.ROC({period: PERIOD20, values: input.close}).getResult();
      const roc50 = new ti.ROC({period: PERIOD50, values: input.close}).getResult();
      const roc100 = new ti.ROC({period: PERIOD100, values: input.close}).getResult();
      const roc200 = new ti.ROC({period: PERIOD200, values: input.close}).getResult();
      const stoch = new ti.Stochastic.calculate({...input, stochasticPeriod: 14, signalPeriod: 3});
      const williamsR = new ti.WilliamsR.calculate(input);
      const awesomeOscillator = new ti.AwesomeOscillator.calculate({
        ...input, 
        fastPeriod : 5,
        slowPeriod : 34});
      const kst = new ti.KST.calculate({
        values      : input.close,
        ROCPer1     : 10,
        ROCPer2     : 15,
        ROCPer3     : 20,
        ROCPer4     : 30,
        SMAROCPer1  : 10,
        SMAROCPer2  : 10,
        SMAROCPer3  : 10,
        SMAROCPer4  : 15,
        signalPeriod: 3
      });
      const psar = new ti.PSAR.calculate({...input, step: 0.02, max: 0.2});
      const truerange = new ti.TrueRange.calculate(input);
      const mfi = new ti.MFI.calculate(input);
      const averageGain = new ti.AverageGain.calculate({...input, values: input.close});
      const averageLoss = new ti.AverageLoss.calculate({...input, values: input.close});
      const trix = new ti.TRIX.calculate({...input, period: 18, values: input.close});
      // const vwma = new ti.VWMA.calculate(input);
      // const vwap = new ti.VWAP.calculate(input);
      // const smma = new ti.SMMA.calculate(input);
      // const vosc = new ti.VOSC.calculate(input);
      // const apo = new ti.APO.calculate(input);
      // const linregslope = new ti.LinRegSlope.calculate(input);
      // const linregintercept = new ti.LinRegIntercept.calculate(input);
      // const linreg = new ti.LinReg.calculate(input);
      // const stddev = new ti.StdDev.calculate(input);
      // const variance = new ti.Variance.calculate(input);
      // const truestrength = new ti.TrueStrength.calculate(input);
      
      // console.log(`SMA10: ${sma10}`);
      // console.log(`SMA20: ${sma20}`);
      // console.log(`SMA50: ${sma50}`);
      // console.log(`SMA100: ${sma100}`);
      // console.log(`SMA200: ${sma200}`);
      // // console.log(`EMA: ${ema}`);
      // console.log(`bollingerBands`, bollingerBands);
      // console.log(`Alligator:`, { jaw, teeth, lips });
      // console.log(`adx: `, adx);
      // console.log(`atr: `, atr);
      // console.log(`ema5: `, ema5);
      // console.log(`ema50: `, ema50);
      // console.log(`forceIndex5: `, forceIndex5);
      // console.log(`forceIndex50: `, forceIndex50);
      
      // console.log(`macd3: `, macd3);
      // console.log(`macd9: `, macd9);
      // console.log(`macd14: `, macd14);
      // console.log(`obv`, obv);
      // console.log(`roc5`, roc5);
      // console.log(`roc10`, roc10);
      // console.log(`roc20`, roc20);
      // console.log(`roc50`, roc50);
      // console.log(`roc100`, roc100);
      // console.log(`roc200`, roc200);
      console.log(`trix`, trix);

      return false;
      PriceModel.create({
        timestamp: Date.now(),
        symbol: "BTCUSDT",
        price,
        kline: {
          timestampOpen: latestData[0],
          open: latestData[1],
          high: latestData[2],
          low: latestData[3],
          close: latestData[4],
          volume: latestData[5],
          timestampClose: latestData[6],
          quoteAssetVolume: latestData[7],
          numberOfTrades: latestData[8],
          takerBuyVolume: latestData[9],
          makerBuyVolume: latestData[10],
        },
        indicators: {
          sma10,
          sma20,
          sma50,
          sma100,
          sma200,
          ema5,
          ema10,
          ema20,
          ema50,
          ema100,
          ema200,
          // wma,
          // rsi,
          bollingerBands: bollingerBands[0],
          // alligator: { jaw, teeth, lips },
          adx,
          atr,
          cci,
          forceIndex5,
          forceIndex10,
          forceIndex20,
          forceIndex50,
          forceIndex100,
          forceIndex200,
          macd3,
          macd9,
          macd14,
          obv,
          roc5,
          roc10,
          roc20,
          roc50,
          roc100,
          roc200,
          stoch,
          williamsR,
          // ad,
          awesomeOscillator,
          kst,
          psar,
          mfi,
          averageGain,
          averageLoss,
          // sd,
          // pdi,
          // mdi,
          // dx,
          // ao,
          // trix,
          // vwma,
          // vwap,
          // vosc,
          // apo,
          // linregslope,
          // linregintercept,
          // linreg,
          // stddev,
          // variance,
          // smma,
          // truestrength,
        }
      });
    }
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
  }
}

// Fetch data every 10 seconds
setInterval(fetchData, 10 * 1000);