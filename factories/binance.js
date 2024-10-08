const API_KEY = 'rtZARTdKFWX5JNOQ5dvRUauXHiMtXMS2FhbFXrIhptjI1nbUlacjYuYtCbzT1PmO';
const API_SECRET = 'rqFCESx0J1Aby5BE4LMzh5dggG4Xe3jDQ6QAa6y1DGof8hTWcfW5iCJBVV70bV8d';

const { USDMClient, NewSpotOrderParams, OrderResponseFull, MainClient, SymbolPrice } = require('binance');
const futuresClient = new USDMClient({
  api_key: API_KEY,
  api_secret: API_SECRET,
  timeout: 10000000,
  useServerTime: true, // opcional: use o tempo do servidor em vez do tempo local
  recWindow: 10000000
});


module.exports = (API_KEY, API_SECRET) => {

  const { USDMClient, NewSpotOrderParams, OrderResponseFull, MainClient, SymbolPrice } = require('binance');
  const futuresClient = new USDMClient({
    api_key: API_KEY,
    api_secret: API_SECRET,
    timeout: 10000000,
    useServerTime: true, // opcional: use o tempo do servidor em vez do tempo local
    recWindow: 10000000
  });
  return futuresClient;
}