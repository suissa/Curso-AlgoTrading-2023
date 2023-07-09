const mongoose = require('mongoose');
const { Schema } = mongoose;

const mongoDBURL = 'mongodb://localhost/price-indicators';

mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexão com o MongoDB estabelecida com sucesso!');
  })
  .catch((error) => {
    console.error('Erro ao conectar com o MongoDB:', error);
  });

// Evento de erro de conexão
mongoose.connection.on('error', (error) => {
  console.error('Erro na conexão com o MongoDB:', error);
});

// Evento de desconexão
mongoose.connection.on('disconnected', () => {
  console.log('Desconectado do MongoDB');
});

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
    sma5: [Number],
    sma10: [Number],
    sma20: [Number],
    sma50: [Number],
    sma100: [Number],
    sma200: [Number],
    ema5: [Number],
    ema10: [Number],
    ema20: [Number],
    ema50: [Number],
    ema100: [Number],
    ema200: [Number],
    wma: [Number],
    rsi: [Number],
    bollingerBands: {
      upper: Number,
      middle: Number,
      lower: Number
    },
    alligator: { jaw: [Number], teeth: [Number], lips: [Number] },
    adl: [Number],
    adx: [{
      adx: Number,
      pdi: Number,
      mdi: Number
    }],
    atr: [Number],
    cci: [Number],
    forceIndex5: [Number],
    forceIndex10: [Number],
    forceIndex20: [Number],
    forceIndex50: [Number],
    forceIndex100: [Number],
    forceIndex200: [Number],
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
    mfi: [Number],
    averageGain: [Number],
    averageLoss: [Number],
    trix: [Number],
    vwma: Number,
    vwap: [Number],
    ichimokucloud: [{
      "conversion": Number,
      "base": Number,
      "spanA": Number,
      "spanB": Number
    }],
    volumeProfile: [{
      "bearishVolume": Number,
      "bullishVolume": Number,
      "rangeEnd": Number,
      "rangeStart": Number,
      "totalVolume": Number
    }]
  }
});

const Price = mongoose.model('Price', PriceDataSchema);
module.exports = Price;