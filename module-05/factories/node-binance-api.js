const API_KEY = 'rtZARTdKFWX5JNOQ5dvRUauXHiMtXMS2FhbFXrIhptjI1nbUlacjYuYtCbzT1PmO';
const API_SECRET = 'rqFCESx0J1Aby5BE4LMzh5dggG4Xe3jDQ6QAa6y1DGof8hTWcfW5iCJBVV70bV8d';

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