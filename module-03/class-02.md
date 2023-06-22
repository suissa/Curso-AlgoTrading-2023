# Como se conectar a uma corretora usando uma API

Esse curso se focará na exchange Binance, que é a maior do mundo. 
[Aqui está sua documentação](https://binance-docs.github.io/apidocs/spot/en/#general-info).


## Libs

Podemos nos conectar de diversas formas, aqui vamos aprender duas formas. Uma mais complicada e outra mais simples.

### Axios

Essa biblioteca serve para fazer requisições HTTP genéricas, vamos ver como se conectar
da forma mais crua possível usando ela.
[Link para o npm](https://www.npmjs.com/package/axios)

```js
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_SECRET_KEY;
const BASE_URL = 'https://api.binance.com';

// Exemplo: obter saldo da conta
async function getAccountInfo() {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = require('crypto').createHmac('sha256', API_SECRET).update(queryString).digest('hex');

    const response = await axios({
      method: 'GET',
      url: `${BASE_URL}/api/v3/account?${queryString}&signature=${signature}`,
      headers: {
        'X-MBX-APIKEY': API_KEY,
      },
    });

    console.log(response.data);
  } catch (error) {
    console.error('Erro ao buscar informações da conta:', error);
  }
}

;(async () => getAccountInfo())();


```

### binance-api-node

[Link para o npm](https://www.npmjs.com/package/binance-api-node)

```js
const Binance = require('binance-api-node').default;
require('dotenv').config();

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_SECRET_KEY;

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
});

// Exemplo: obter saldo da conta
async function getAccountInfo() {
  try {
    const accountInfo = await client.accountInfo();
    console.log(accountInfo);
  } catch (error) {
    console.error('Erro ao buscar informações da conta:', error);
  }
}

;(async () => getAccountInfo())();

```

### node-binance-api

[Linnk para o npm](https://www.npmjs.com/package/node-binance-api)

```js
const Binance = require('node-binance-api');
require('dotenv').config();

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_SECRET_KEY;

const binance = new Binance().options({
  APIKEY: API_KEY,
  APISECRET: API_SECRET,
});

// Exemplo: obter saldo da conta
async function getAccountInfo() {
  try {
    const accountInfo = await binance.balance();
    console.log(accountInfo);
  } catch (error) {
    console.error('Erro ao buscar informações da conta:', error);
  }
}

;(async () => getAccountInfo())();

```
Caso vc receba o seguinte erro `Error: Invalid API-key, IP, or permissions for action, request ip: $IP`
basta você adicionar seu IP nas restrições da sua API criada na Binance.