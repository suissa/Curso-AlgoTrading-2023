const axios = require('axios');
const ti = require('technicalindicators');
const Alligator = require("./modules/alligator");

const Binance = require("binance-api-node").default;
require("dotenv").config();

const API_KEY = process.env.API_KEY_BRAVE;
const API_SECRET = process.env.API_SECRET_BRAVE;

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  futures: true // ativa o modo de futuros
});

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

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PriceDataSchema = new Schema({
  timestamp: Number,
  symbol: String,
  price: Number,
  kline: {
    timestampOpen: Number,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number,
    timestampClose: Number,
    quoteAssetVolume: Number,
    numberOfTrades: Number,
    takerBuyVolume: Number,
    makerBuyVolume: Number,

  },
  indicators: {
    sma: Number,
    ema: Number,
    wma: Number,
    rsi: Number,
    bollingerBands: {
      upper: Number,
      middle: Number,
      lower: Number
    },
    alligator: { jaw: Number, teeth: Number, lips: Number },
    adx: {
      adx: Number,
      pdi: Number,
      mdi: Number
    },
    atr: Number,
    cci: Number,
    forceIndex5: Number,
    forceIndex10: Number,
    forceIndex20: Number,
    forceIndex50: Number,
    forceIndex100: Number,
    forceIndex200: Number,
    macd3: [{
      macd: Number,
      MACD: Number,
      signal: Number,
      histogram: Number
    }],
    macd9: [{
      macd: Number,
      MACD: Number,
      signal: Number,
      histogram: Number
    }],
    macd14: [{
      macd: Number,
      MACD: Number,
      signal: Number,
      histogram: Number
    }],
    obv: [Number],
    t3: Number,
    wema: Number,
    roc: Number,
    stoch: {
      k: Number,
      d: Number
    },
    williamsR: Number,
    ad: Number,
    awesomeOscillator: Number,
    kst: Number,
    psar: [Number],
    truerange: Number,
    mfi: Number,
    averageGain: Number,
    averageLoss: Number,
    sd: Number,
    pdi: Number,
    mdi: Number,
    dx: Number,
    ao: Number,
    trix: Number,
    vwma: Number,
    vwap: [Number],
    vosc: Number,
    apo: Number,
    linregslope: Number,
    linregintercept: Number,
    linreg: Number,
    stddev: Number,
    variance: Number,
    smma: Number,
    truestrength: Number,
  }
});

const PriceData = mongoose.model('PriceData', PriceDataSchema);


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
    console.log(`Current BTCUSDT price: ${price}`);

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
        limit: 10,       // número de velas que você deseja obter
      },
    });

    const candlesticks = response.data;
    console.log(candlesticks);
  } catch (error) {
    console.error(error);
  }
}


const DATA1 = require('./klines.json')
async function fetchData() {
  try {

    // const response = await getCandlesticks();

    // const price = await fetchCurrentPrice();

    const data = DATA1;
    const latestData = data[data.length - 1];
    // console.log(` data`, data);
    // return false;
    // console.log(`Latest data: ${latestData}`);

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

    // Check if we have enough data to start calculating indicators
    if(input.close.length > input.period) {
      const sma10 = new ti.SMA({period : 10, values : input.close}).getResult()[0];
      const sma20 = new ti.SMA({period : 20, values : input.close}).getResult()[0];
      const sma50 = new ti.SMA({period : 50, values : input.close}).getResult()[0];
      const sma100 = new ti.SMA({period : 100, values : input.close}).getResult()[0];
      const sma200 = new ti.SMA({period : 200, values : input.close}).getResult()[0];

      // const ema = new ti.EMA(input.close).getResult();
      // const wma = new ti.WMA(input.close).getResult();
      // const rsi = new ti.RSI(input.close).getResult();
      const bollingerBands = new ti.BollingerBands({...input, period: 20,
        stdDev: 2,
        values: data.slice(-20).map(d => parseFloat(d[4]))
      }).getResult();

      // const { jaw, teeth, lips } = Alligator(input.close);

      const adx = (new ti.ADX(input).getResult())[0];
      const atr = (new ti.ATR(input).getResult())[0];
      const cci = (new ti.CCI({...input, period: 20}).getResult())[0];
      const forceIndex5 = new ti.ForceIndex({...input, period: 5}).getResult()[0];
      const forceIndex10 = new ti.ForceIndex({...input, period: 10}).getResult()[0];
      const forceIndex20 = new ti.ForceIndex({...input, period: 20}).getResult()[0];
      const forceIndex50 = new ti.ForceIndex({...input, period: 50}).getResult()[0];
      const forceIndex100 = new ti.ForceIndex({...input, period: 100}).getResult()[0];
      const forceIndex200 = new ti.ForceIndex({...input, period: 200}).getResult()[0];
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
      // const t3 = new ti.T3(input).getResult();
      // const wema = new ti.WEMA(input).getResult();
      // const roc = new ti.ROC(input).getResult();
      // const stoch = new ti.Stochastic.calculate(input);
      // const williamsR = new ti.WilliamsR.calculate(input);
      // const ad = new ti.AD.calculate(input);
      // const awesomeOscillator = new ti.AwesomeOscillator.calculate(input);
      // const kst = new ti.KST.calculate(input);
      // const psar = new ti.PSAR.calculate({...input, step: 0.02, max: 0.2});
      // const truerange = new ti.TrueRange.calculate(input);
      // const mfi = new ti.MFI.calculate(input);
      // const averageGain = new ti.AverageGain.calculate(input);
      // const averageLoss = new ti.AverageLoss.calculate(input);
      // const sd = new ti.SD.calculate(input);
      // const pdi = new ti.PDI.calculate(input);
      // const mdi = new ti.MDI.calculate(input);
      // const dx = new ti.DX.calculate(input);
      // const ao = new ti.AbsoluteOscillator.calculate(input);
      // const trix = new ti.TRIX.calculate(input);
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
      
      console.log(`SMA10: ${sma10}`);
      console.log(`SMA20: ${sma20}`);
      console.log(`SMA50: ${sma50}`);
      console.log(`SMA100: ${sma100}`);
      console.log(`SMA200: ${sma200}`);
      // console.log(`EMA: ${ema}`);
      console.log(`bollingerBands`, bollingerBands);
      // console.log(`Alligator:`, { jaw, teeth, lips });
      console.log(`adx: `, adx);
      console.log(`atr: `, atr);
      console.log(`cci: `, cci);
      console.log(`forceIndex5: `, forceIndex5);
      console.log(`forceIndex50: `, forceIndex50);
      
      console.log(`macd3: `, macd3);
      console.log(`macd9: `, macd9);
      console.log(`macd14: `, macd14);
      console.log(`obv`, obv);
      return false;
      PriceData.create({
        timestamp: Date.now(),
        symbol: "BTCUSDT",
        price,
        open,
        high,
        low,
        close,
        volume,
        indicators: {
          sma10,
          sma20,
          sma50,
          sma100,
          sma200,
          ema,
          wma,
          rsi,
          bollingerBands: bollingerBands[0],
          alligator: { jaw, teeth, lips },
          adx,
          atr,
          cci,
          forceIndex,
          macd: {
            macd: Number,
            signal: Number,
            histogram: Number
          },
          obv,
          t3,
          wema,
          roc,
          stoch: {
            k: Number,
            d: Number
          },
          williamsR,
          ad,
          awesomeOscillator,
          kst,
          psar,
          truerange,
          mfi,
          averageGain,
          averageLoss,
          sd,
          pdi,
          mdi,
          dx,
          ao,
          trix,
          vwma,
          vwap,
          vosc,
          apo,
          linregslope,
          linregintercept,
          linreg,
          stddev,
          variance,
          smma,
          truestrength,
        }
      });
    }
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
  }
}

// Fetch data every 10 seconds
setInterval(fetchData, 1 * 1000);