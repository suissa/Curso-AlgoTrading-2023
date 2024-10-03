const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const Binance = require('node-binance-api');
const binance = new Binance();
binance.options({
  APIKEY: API_KEY,
  APISECRET: API_SECRET,
  useServerTime: true, // opcional: use o tempo do servidor em vez do tempo local
  timeout: 10000000,
  recWindow: 10000000
});


module.exports = (API_KEY, API_SECRET) => {

  const Binance = require('node-binance-api');
  const binance = new Binance();
  binance.options({
    APIKEY: API_KEY,
    APISECRET: API_SECRET,
    useServerTime: true, // opcional: use o tempo do servidor em vez do tempo local
    timeout: 10000000,
    recWindow: 10000000
  });
  return binance;  
}