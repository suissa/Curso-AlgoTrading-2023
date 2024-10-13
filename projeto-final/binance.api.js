const axios = require('axios');
const crypto = require('crypto');

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
    try {
      const response = await this.client.get(`/fapi/v1/ticker/price`, {
        params: { symbol },
      });
      return response.data.price;
    } catch (error) {
      console.error('Erro ao obter o preço atual: ', error);
      throw error;
    }
  }

  async getCandles(symbol, interval = '5m', limit = 500) {
    try {
      const response = await this.client.get('/fapi/v1/klines', {
        params: { symbol, interval, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter candles: ', error);
      throw error;
    }
  }

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