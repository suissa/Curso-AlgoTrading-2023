const ti = require('technicalindicators');
const axios = require('axios');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PriceDataSchema = new Schema({
  timestamp: Number,
  symbol: String,
  price: Number,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number,
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
    adx: Number,
    atr: Number,
    cci: Number,
    forceIndex: Number,
    macd: {
      macd: Number,
      signal: Number,
      histogram: Number
    },
    obv: Number,
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
  period: 1, // período para os indicadores
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

async function fetchData() {
  try {
    const response = await axios.get('https://fapi.binance.com/fapi/v1/klines', {
      params: {
        symbol: 'BTCUSDT',
        interval: '1m',  // you can adjust the interval as needed
      }
    });

    const price = await fetchCurrentPrice();

    const data = response.data;
    const latestData = data[data.length - 1];
    console.log(`Latest data: ${latestData}`);
    const open = parseFloat(latestData[1])
    const high = parseFloat(latestData[2])
    const low = parseFloat(latestData[3])
    const close = parseFloat(latestData[4])
    const volume = parseFloat(latestData[5])
    input.open.push(open);
    input.high.push(high);
    input.low.push(low);
    input.close.push(close);
    input.volume.push(volume);

    // Check if we have enough data to start calculating indicators
    if(input.close.length > input.period) {
      const sma = new ti.SMA(input.close).getResult();
      // const ema = new ti.EMA(input.close).getResult();
      // const wma = new ti.WMA(input.close).getResult();
      // const rsi = new ti.RSI(input.close).getResult();
      const bollingerBands = new ti.BollingerBands({...input, period: 20,
        stdDev: 2,
        values: data.slice(-20).map(d => parseFloat(d[4]))
      }).getResult();
      // const adx = new ti.ADX(input).getResult();
      // const atr = new ti.ATR(input).getResult();
      // const cci = new ti.CCI(input).getResult();
      // const forceIndex = new ti.ForceIndex(input).getResult();
      // const macd = new ti.MACD(input).getResult();
      // const obv = new ti.OBV.calculate(input);
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
      
      console.log(`SMA: ${sma}`);
      // console.log(`EMA: ${ema}`);
      console.log(`bollingerBands`, bollingerBands);
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
          sma,
          ema,
          wma,
          rsi,
          bollingerBands: bollingerBands[0],
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