
require('dotenv').config(); // Carrega as variáveis do arquivo .env

const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: process.env.API_KEY_BRAVE,
  apiSecret: process.env.API_SECRET_BRAVE,
  useServerTime: true,
  timeout: 10000000,
  recWindow: 10000000
});

const WebSocket = require('ws');
const ws = new WebSocket('wss://fstream.binance.com/ws/btcusdt@kline_1m');
const wsTrade = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade');


const MAX_HISTORY = 100; // máximo de velas para manter no histórico
let closes = []; // histórico de preços de fechamento
let tops = []; // histórico de topos
let bottoms = []; // histórico de fundos
let CURRENT_PRICE = 0;

wsTrade.on('message', (data) => {
  const trade = JSON.parse(data);
  // console.log('Último trade:', trade);
  CURRENT_PRICE = parseFloat(trade.p)
  // console.log({CURRENT_PRICE})
});

const getPosition = async (symbol = "BTCUSDT") => (await client.futuresPositionRisk()).find(position => position.symbol === 'BTCUSDT')

const createOrder = async (side = "BUY", quantity = 0.001, price = 27000) => {
  console.log({side, quantity, price})
  const result = await client.futuresOrder({
    symbol: 'BTCUSDT',
    type: 'MARKET',
    side,
    quantity,
    // price
  })
  console.log(result)
  if (side === "BUY") {
    const resultClose = await client.futuresOrder({
      symbol: 'BTCUSDT',
      type: 'LIMIT',
      side: "SELL",
      quantity,
      price: price + 50
    })
  }
  if (side === "SELL") {
    const resultClose = await client.futuresOrder({
      symbol: 'BTCUSDT',
      type: 'LIMIT',
      side: "BUY",
      quantity,
      price: price - 50
    })
  }

  return result
}

ws.on('message', async (data) => {
  const kline = JSON.parse(data);
  const close = parseFloat(kline.k.c);
  // console.log("kline:", kline);
  // Adiciona o preço de fechamento ao histórico
  closes.push(close);


  position = await getPosition("BTCUSDT");
  // Verifica se já temos MAX_HISTORY preços de fechamento no histórico e remove o mais antigo se necessário
  if (closes.length > MAX_HISTORY) {
    closes.shift();
  }

  let has3TopsDescending = false;
  let has2BottomsAscending = false;
  // Identifica topos e fundos
  if (position.positionAmt == 0 && closes.length >= 3) {
    const lastThreeCloses = closes.slice(-3);
    const [minClose, , maxClose] = lastThreeCloses.sort();
    const currentClose = lastThreeCloses[1];

    if (currentClose === maxClose) {
      console.log('Topo detectado em ', currentClose);
      // O último preço de fechamento é um topo
      tops.push(currentClose);

      // Verifica se há 3 ou mais topos descendentes consecutivos
      has3TopsDescending =  tops.length >= 3 && 
                                  tops[tops.length - 1] < tops[tops.length - 2] && 
                                  tops[tops.length - 2] < tops[tops.length - 3]
      if (has3TopsDescending) {
        console.log('Sell signal at ', CURRENT_PRICE);
        // Execute a estratégia de venda aqui
        const result = await createOrder("SELL", 0.001, close);
        console.log(result);
      }
    } else if (currentClose === minClose) {
      console.log('Fundo detectado em ', currentClose);
      // O último preço de fechamento é um fundo
      bottoms.push(currentClose);
      has2BottomsAscending =  bottoms.length >= 2 && 
                              bottoms[bottoms.length - 1] > bottoms[bottoms.length - 2]
      // Verifica se há 2 ou mais fundos ascendentes consecutivos
      if (has3TopsDescending && has2BottomsAscending) {
        console.log('Buy signal at ', CURRENT_PRICE);
        const result = await createOrder("BUY", 0.001, close);
        console.log(result);
        // Execute a estratégia de compra aqui
      }
    }
  }
});
