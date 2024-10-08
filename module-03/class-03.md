# Como obter dados históricos e em tempo real usando APIs

Nós temos 2 tipos de mercado: Spot e Futures. Nesse curso vamos nos focar no Futures pois
nele conseguimos atuar tanto na alta como na baixa do preço do Bitcoin.

## Preço Atual

Vamos pegar o preço mais atual do BTCUSDT.

### Axios

```js
const axios = require('axios');

async function getCurrentPrice() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    const price = response.data.price;
    console.log('Preço atual do BTCUSDT:', price);
  } catch (error) {
    console.error('Erro ao buscar o preço atual:', error);
  }
}

(async () => {
  await getCurrentPrice();
})();
```

### node-binance-api

```js
const Binance = require('node-binance-api');

const binance = new Binance();

async function getCurrentPrice() {
  try {
    const ticker = await binance.prices('BTCUSDT');
    const price = ticker.BTCUSDT;
    console.log('Preço atual do BTCUSDT:', price);
  } catch (error) {
    console.error('Erro ao buscar o preço atual:', error);
  }
}

(async () => {
  await getCurrentPrice();
})();
```

### binance-node-api

```js
const Binance = require('binance-api-node').default;

const client = Binance();

async function getCurrentPrice() {
  try {
    const ticker = await client.prices({ symbol: 'BTCUSDT' });
    const price = ticker.BTCUSDT;
    console.log('Preço atual do BTCUSDT:', price);
  } catch (error) {
    console.error('Erro ao buscar o preço atual:', error);
  }
}

(async () => {
  await getCurrentPrice();
})();
```




## Candles
Cada *candlestick* representa uma unidade de tempo (por exemplo, um dia) e mostra o preço de abertura, o preço de fechamento, além do preço máximo e mínimo alcançados no período. Se o preço de fechamento for maior do que o preço de abertura, o corpo é preenchido ou verde; se o preço de fechamento for menor do que o preço de abertura, o corpo é vazio ou vermelho.

É a informação mais vital quando se está programando um robô de trading, pois você precisa deles para analisar e usar indicadores.
### Axios

```js
const axios = require('axios');

async function getCandles() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol: 'BTCUSDT',
        interval: '1m',
        limit: 10
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Erro ao buscar os candles:', error);
  }
}

(async () => {
  await getCandles();
})();
```

### node-binance-api

```js
const Binance = require('node-binance-api');

const binance = new Binance().options({
  test: true, // Se estiver em produção, remover essa linha
});

async function getCandles() {
  try {
    const candles = await binance.futuresCandles('BTCUSDT', '1m', { limit: 10 });
    console.log(candles);
  } catch (error) {
    console.error('Erro ao buscar os candles:', error);
  }
}

(async () => {
  await getCandles();
})();
``` 

### binance-node-api

```js
const Binance = require('binance-api-node').default;

const client = Binance();

async function getCandles() {
  try {
    const candles = await client.candles({ symbol: 'BTCUSDT', interval: '1m', limit: 10 });
    console.log(candles);
  } catch (error) {
    console.error('Erro ao buscar os candles:', error);
  }
}

(async () => {
  await getCandles();
})();
```

## Trades
Um trade em uma exchange é uma transação de compra ou venda de um ativo negociado na plataforma. Quando um trader coloca uma ordem de compra ou venda, o orderbook é atualizado para refletir a oferta ou demanda no mercado. Quando uma ordem de compra encontra uma ordem de venda que coincide com o preço e a quantidade, uma negociação (trade) é executada e o ativo é transferido do vendedor para o comprador.

Cada trade é registrado em um registro público, geralmente chamado de histórico de trades ou livro de negociações (tradebook). O registro de trades inclui informações como o preço, a quantidade, o horário e o par de criptomoedas envolvidos na transação.

Os traders usam os dados de trades para fazer análises técnicas, identificar padrões de preço e volume, e tomar decisões de negociação informadas. As exchanges geralmente fornecem gráficos e dados históricos de trades para ajudar os traders a visualizar e analisar as tendências de preços e volume em um determinado mercado.

Em resumo, os trades representam a execução de ordens de compra e venda em uma exchange, e o registro público dessas transações fornece informações valiosas para os traders que desejam entender melhor o mercado e tomar decisões informadas de negociação.

### Axios

```js
const axios = require('axios');

async function getLastTrades() {
  try {
    const response = await axios.get('https://fapi.binance.com/fapi/v1/trades?symbol=BTCUSDT');
    console.log(response.data);
  } catch (error) {
    console.error('Erro ao buscar as últimas trades:', error);
  }
}

(async () => {
  await getLastTrades();
})();

```
### node-binance-api

```js
const Binance = require('node-binance-api');

const binance = new Binance().options({
  test: true, // Se estiver em produção, remover essa linha
});

async function getLastTrades() {
  try {
    const trades = await binance.futuresTrades('BTCUSDT');
    console.log(trades);
  } catch (error) {
    console.error('Erro ao buscar as últimas trades:', error);
  }
}

(async () => {
  await getLastTrades();
})();
```

### binance-node-api

```js
const Binance = require('binance-api-node').default;

const client = Binance();

async function getLastTrades() {
  try {
    const trades = await client.futuresTrades({ symbol: 'BTCUSDT' });
    console.log(trades);
  } catch (error) {
    console.error('Erro ao buscar as últimas trades:', error);
  }
}

(async () => {
  await getLastTrades();
})();

```


## Orderbook
O orderbook é uma lista de ordens de compra e venda para um ativo negociado em uma exchange. O orderbook mostra o preço e a quantidade que os compradores estão dispostos a pagar por um ativo (ordens de compra) e o preço e a quantidade que os vendedores estão dispostos a receber por um ativo (ordens de venda). O orderbook é organizado em ordens de preço, com as ordens de compra mais altas no topo (preço mais alto) e as ordens de venda mais baixas na parte inferior (preço mais baixo).

O orderbook é atualizado em tempo real à medida que novas ordens são adicionadas ou removidas. Os traders usam o orderbook para determinar o melhor preço para comprar ou vender um ativo, bem como a quantidade de liquidez disponível no mercado. Com base no orderbook, os traders podem fazer análises técnicas e tomar decisões de negociação informadas.

O orderbook é uma ferramenta essencial para negociação em exchanges de criptomoedas, e muitas plataformas de negociação oferecem recursos avançados de orderbook, como visualizações gráficas e recursos de análise de dados.

> A diferença entre o orderbook e as trades é que o orderbook possui as ordens que ainda não foram executadas, 
enquanto que as trades são as ordens que já foram executadas. Logo uma ordem virá uma trade quando executada.

### Axios

```js
const axios = require('axios');

async function getFuturesOrders() {
  try {
    const response = await axios.get('https://fapi.binance.com/fapi/v1/depth', {
      params: {
        symbol: 'BTCUSDT',
        limit: 5
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Erro ao buscar as ordens:', error);
  }
}

(async () => {
  await getFuturesOrders();
})();
``` 

### node-binance-api

```js
const Binance = require('node-binance-api');

const binance = new Binance().options({
  test: true, // Se estiver em produção, remover essa linha
});

async function getFuturesOrders() {
  try {
    const orders = await binance.futuresDepth('BTCUSDT', { limit: 5 });
    console.log(orders);
  } catch (error) {
    console.error('Erro ao buscar as ordens:', error);
  }
}

(async () => {
  await getFuturesOrders();
})();
```

### binance-api-node

```js
const Binance = require('binance-api-node').default;

const client = Binance();

async function getFuturesOrders() {
  try {
    const orders = await client.futuresDepth({ symbol: 'BTCUSDT', limit: 5 });
    console.log(orders);
  } catch (error) {
    console.error('Erro ao buscar as ordens:', error);
  }
}

(async () => {
  await getFuturesOrders();
})();
```

# Como obter dados estando autenticado

Nessa parte vamos largar o *axios* e usar apenas uma lib, a [https://www.npmjs.com/package/binance-api-node](binance-api-node)

## Client

Vamos criar a instâncias de *client* para não precisar repetir sempre esse código:

```js
const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: 'SUA_API_KEY',
  apiSecret: 'SEU_API_SECRET',
  futures: true // ativa o modo de futuros
});
```

## Balance

O saldo ou balanço de futuros se refere ao saldo de sua conta de negociação de futuros na Binance. Ele representa o valor total de todos os ativos mantidos em sua conta, incluindo suas posições abertas, ordens pendentes e o saldo em criptomoedas e moedas fiduciárias disponíveis para negociação.

O saldo da sua conta de futuros pode ser visto em diferentes moedas fiduciárias, como USD, EUR, etc. Além disso, ele é atualizado constantemente para refletir suas atividades de negociação, como a abertura e fechamento de posições e execução de ordens.

Ao conhecer o seu saldo em futuros, você pode monitorar a sua exposição ao mercado e ajustar suas posições ou ordens para garantir que estejam alinhadas com seus objetivos de negociação e gerenciamento de riscos.

```js
client.futuresAccountBalance().then((balances) => {
  console.log(balances);
}).catch((err) => {
  console.error(err);
});
``` 

## Orders

Você precisará da informação de suas ordens em ação ou executadas para um melhor controle sobre o robô.

```js
const symbol = 'BTCUSDT';

client.futuresAllOrders({
  symbol: symbol
}).then((orders) => {
  console.log(orders);
}).catch((err) => {
  console.error(err);
});
``` 

## Position

Informação crucial para você saber se está com uma posição em aberto, essa será a base do nosso robô, pois ele irá
atuar de diferentes formas. Por exemplo: você vai analisar os dados apenas quando não estiver em uma posição.

```js
const symbol = 'BTCUSDT';

client.futuresPositionRisk({
  symbol: symbol
}).then((positions) => {
  console.log(positions);
}).catch((err) => {
  console.error(err);
});
```

Basicamente são essas as informações que você necessita para criar um robô, como veremos na próxima aula.