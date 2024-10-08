const Binance = require('binance-api-node').default;
require('dotenv').config();

const API_KEY = process.env.API_KEY_BRAVE;
const API_SECRET = process.env.API_SECRET_BRAVE;

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  futures: true // ativa o modo de futuros
});

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