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
    roc5: [Number],
    roc10: [Number],
    roc20: [Number],
    roc50: [Number],
    roc100: [Number],
    roc200: [Number],
    stoch: [{
      k: Number,
      d: Number
    }],
    williamsR: [Number],
    awesomeOscillator: [Number],
    kst: [{
      kst: Number,
      signal: Number,
    }],
    psar: [Number],
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

const Price = mongoose.model('Price', PriceDataSchema);
module.exports = Price;