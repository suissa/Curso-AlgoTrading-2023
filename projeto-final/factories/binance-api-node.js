const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

module.exports = (API_KEY, API_SECRET) => {
  const Binance2 = require('binance-api-node').default;
  const client2 = Binance2({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    useServerTime: true, // opcional: use o tempo do servidor em vez do tempo local
    timeout: 10000000,
    recWindow: 10000000
  });
  return client2
}