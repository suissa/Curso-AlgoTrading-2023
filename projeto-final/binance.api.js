const axios = require('axios');
const crypto = require('crypto');

const getPriceBySymbol = (data, symbol) => {
  console.log({data, symbol});
  const item = data.find(entry => entry.symbol === symbol);
  console.log({item});
  return item ? item.price : null;
};

const formatCandle = (candleArray) => {
  return {
    openTime: candleArray[0],
    open: parseFloat(candleArray[1]),
    high: parseFloat(candleArray[2]),
    low: parseFloat(candleArray[3]),
    close: parseFloat(candleArray[4]),
    volume: parseFloat(candleArray[5]),
    closeTime: candleArray[6],
    quoteAssetVolume: parseFloat(candleArray[7]),
    numberOfTrades: candleArray[8],
    takerBuyBaseAssetVolume: parseFloat(candleArray[9]),
    takerBuyQuoteAssetVolume: parseFloat(candleArray[10]),
    ignore: candleArray[11] // Este campo pode ser ignorado, mas inclui para ser fiel aos dados
  };
};

class BinanceAPI {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseURL = 'https://fapi.binance.com';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
      },
    });
  }

  async getCurrentPrice(symbol) {
    console.log("Preço getCurrentPrice", symbol);
    try {
      const response = await this.client.get(`/fapi/v1/ticker/price`, {
        params: { symbol },
      });
      console.log("Resposta da API getCurrentPrice:", response.data); // Verifica a resposta da API
      // const price = getPriceBySymbol(response.data, "BTCUSDT");
      const price = response.data.price;
      console.log("Preço getCurrentPrice:", price);
      if (price) {
        return parseFloat(price); // Converte o preço para um número
      } else {
        throw new Error(`Resposta inesperada da API: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('Erro ao obter o preço atual: ', error);
      throw error;
    }
  }
  

  async getCandles(symbol = 'BTCUSDC', interval = '5m', limit = 50) {
    const SYMBOL = symbol.symbol 
    console.log("getCandles maroto:", {SYMBOL, interval, limit});
    try {
      if (!SYMBOL || !interval || !limit) {
        throw new Error('Parâmetros inválidos: é necessário definir symbol, interval e limit corretamente.');
      }
      console.log("SYMBOL: ", SYMBOL)
      const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${SYMBOL}&interval=${interval}&limit=${limit}`
      console.log("url: ", url)
      const response = await axios.get(url);
  
      const formattedCandles = response.data.map(formatCandle);
      return formattedCandles;
    } catch (error) {
      console.error('getCandles Erro ao obter candles:', error);
      throw error;
    }
  };

  async getPositionRisk(symbol) {
    try {
      const response = await this.privateRequest('/fapi/v2/positionRisk', { symbol });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter risco da posição: ', error);
      throw error;
    }
  }

  async futuresOrder(order) {
    try {
      const response = await this.privateRequest('/fapi/v1/order', order, 'POST');
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ordem: ', error);
      throw error;
    }
  }

  async futuresCancelOrder(symbol, orderId) {
    try {
      const response = await this.privateRequest('/fapi/v1/order', { symbol, orderId }, 'DELETE');
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar ordem: ', error);
      throw error;
    }
  }

  async futuresOpenOrders(symbol) {
    try {
      const response = await this.privateRequest('/fapi/v1/openOrders', { symbol });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter ordens abertas: ', error);
      throw error;
    }
  }

  async futuresLeverage(symbol, leverage) {
    try {
      const response = await this.privateRequest('/fapi/v1/leverage', { symbol, leverage }, 'POST');
      return response.data;
    } catch (error) {
      console.error('Erro ao ajustar alavancagem: ', error);
      throw error;
    }
  }

  async futuresBalance() {
    try {
      const response = await this.privateRequest('/fapi/v2/balance');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter saldo de futuros: ', error);
      throw error;
    }
  }

  async privateRequest(path, params = {}, method = 'GET') {
    const timestamp = Date.now();
    const queryString = new URLSearchParams({ ...params, timestamp }).toString();
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');

    const options = {
      method,
      url: path,
      params: { ...params, timestamp, signature },
    };

    if (method === 'POST' || method === 'DELETE') {
      options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    }

    return this.client.request(options);
  }
}

module.exports = (apiKey, apiSecret) => new BinanceAPI(apiKey, apiSecret);