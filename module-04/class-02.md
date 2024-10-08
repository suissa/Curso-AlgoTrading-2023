# Técnicas de *machine learning* aplicadas ao *trading*

O uso de técnicas de *machine learning* (aprendizado de máquina) no campo de *trading* (negociação) tem ganhado popularidade nos últimos anos devido à sua capacidade de identificar padrões e tendências complexas nos dados do mercado financeiro. Essas técnicas podem ser usadas para desenvolver modelos preditivos e algoritmos de negociação automatizada que buscam maximizar a rentabilidade e minimizar os riscos associados aos investimentos.

Algumas das técnicas de *machine learning* mais comuns aplicadas ao *trading* incluem:

- Regressão: A regressão é uma técnica estatística que busca prever uma variável dependente com base em uma ou mais variáveis independentes. No contexto de *trading*, a regressão pode ser usada para prever preços futuros de ativos ou índices financeiros usando variáveis, como taxas de juros, indicadores econômicos e dados históricos de preços.

- Classificação: A classificação é uma técnica de aprendizado supervisionado que visa categorizar dados em classes distintas. No *trading*, a classificação pode ser usada para prever a direção do movimento do preço de um ativo (por exemplo, alta ou baixa) com base em variáveis, como indicadores técnicos, dados de sentimento do mercado e informações financeiras da empresa.

- Redes Neurais Artificiais (RNA): As RNA são modelos computacionais inspirados no funcionamento do cérebro humano e podem ser treinadas para reconhecer padrões complexos nos dados. No contexto do *trading*, as RNA podem ser usadas para prever movimentos de preços, identificar oportunidades de negociação e otimizar estratégias de negociação.

- Algoritmos de Agrupamento: Os algoritmos de agrupamento são técnicas de aprendizado não supervisionado que buscam identificar grupos (*clusters*) de dados semelhantes. No *trading*, esses algoritmos podem ser usados para segmentar ativos com base em características semelhantes, como volatilidade, correlação de preços e perfil de risco.

- Algoritmos Genéticos: Os algoritmos genéticos são uma técnica de otimização inspirada na teoria da evolução, que busca encontrar a melhor solução para um problema através de processos de seleção, cruzamento e mutação. No contexto de *trading*, os algoritmos genéticos podem ser usados para otimizar parâmetros de estratégias de negociação e encontrar combinações ideais de indicadores e regras de negociação.

- Aprendizado por Reforço: O aprendizado por reforço é uma técnica de aprendizado de máquina que busca desenvolver agentes capazes de tomar decisões através da interação com o ambiente e da maximização de uma recompensa acumulada. No *trading*, o aprendizado por reforço pode ser usado para treinar agentes de negociação que aprendem a executar transações com base na evolução do mercado e na maximização de retornos.

Ao aplicar essas técnicas de machine learning ao *trading*, é crucial considerar as limitações e os desafios associados, como o risco de *overfitting*, a qualidade e a quantidade de dados disponíveis, e a necessidade de adaptar os modelos às mudanças nas condições do mercado. Além disso, os investidores e *traders* devem ter em mente que o uso de *machine learning* não garante necessariamente sucesso nas negociações, e deve ser combinado com uma sólida compreensão dos fundamentos do mercado e uma abordagem de gerenciamento de riscos adequada.

Dito isso, algumas recomendações para aplicar técnicas de *machine learning* ao *trading* incluem:

- Pré-processamento e limpeza de dados: Assegurar que os dados sejam limpos, consistentes e livres de erros é fundamental para o sucesso de qualquer modelo de aprendizado de máquina. Além disso, a seleção de características relevantes e a redução da dimensionalidade dos dados podem melhorar a eficiência e a precisão dos modelos.

- Validação cruzada e teste fora da amostra: Para evitar o *overfitting*, é essencial validar e testar os modelos de aprendizado de máquina em conjuntos de dados diferentes dos utilizados no treinamento. A validação cruzada e o teste fora da amostra ajudam a avaliar o desempenho e a robustez do modelo em diferentes condições de mercado e a identificar possíveis ajustes necessários.

- Monitoramento e atualização do modelo: Os modelos de aprendizado de máquina devem ser monitorados continuamente para garantir que estão funcionando conforme o esperado e adaptando-se às mudanças nas condições do mercado. Isso pode envolver a atualização periódica dos dados de treinamento e a reavaliação dos parâmetros do modelo.

- Combinação de técnicas e abordagens: Utilizar várias técnicas de aprendizado de máquina e combinar abordagens quantitativas e fundamentais pode ajudar a criar estratégias de negociação mais robustas e adaptáveis. Isso também pode melhorar a diversificação e reduzir a dependência de um único modelo ou estratégia.

- Gerenciamento de riscos: É fundamental incorporar uma abordagem de gerenciamento de riscos ao aplicar técnicas de machine learning ao *trading*. Isso inclui o estabelecimento de limites de perda e alvos de lucro, a monitoração da exposição do portfólio e a implementação de medidas de proteção, como o uso de ordens *stop-loss*.

- Conformidade regulatória: Ao desenvolver e implementar estratégias de negociação baseadas em aprendizado de máquina, é importante garantir a conformidade com as regulamentações e diretrizes do mercado financeiro, incluindo a divulgação de informações, as restrições de negociação e os requisitos de relatórios.

Em conclusão, as técnicas de machine learning têm o potencial de transformar o campo do *trading*, permitindo aos investidores e traders identificar oportunidades e desenvolver estratégias de negociação mais eficazes. No entanto, é importante abordar os desafios e limitações associados ao uso dessas técnicas e garantir que sejam combinadas com uma sólida compreensão do mercado e um gerenciamento de riscos adequado.

Agora vamos ver alguns exemplos práticos.

### Regressão Linear

Neste exemplo, apresentamos uma aplicação básica de técnicas de machine learning em *trading*. Vamos utilizar uma **regressão linear** simples para prever o preço de uma ação e tomar decisões de compra e venda com base nas previsões.

```js
const testRegression = async (candles) => {

  // Importação de bibliotecas necessárias
  const regression = require('regression');

  // Preparar os dados para treinamento
  const data = candles.map(candle => [candle.openTime, parseFloat(candle.close)]);
  // Calcular a regressão linear dos preços
  const result = regression.linear(data);
  // Prever o preço para o próximo dia
  const predictedPrice = result.equation[1];
  console.log({predictedPrice});
  // Tomar decisões de compra e venda baseadas nas previsões
  const lastPrice = candles[candles.length - 1].close;
  if (predictedPrice > lastPrice) {
    console.log('Comprar: Preço previsto é maior que o preço atual');
    const price = lastPrice;
    const quantity = 0.001;
    const order = {
      type: 'LIMIT',
      side: 'BUY',
      price,
      quantity
    }
    console.log({order});
    // const result = await createOrder(order);
    // console.log(result);

  } else if (predictedPrice < lastPrice) {
    console.log('Vender: Preço previsto é menor que o preço atual');
    const price = lastPrice; 
    const quantity = 0.001;
    const order = {
      type: 'LIMIT',
      side: 'SELL',
      price,
      quantity
    }
    console.log({order});
    // const result = await createOrder(order);
    // console.log(result);
  } else {
    console.log('Manter: Preço previsto é igual ao preço atual');
  }
}

setInterval( async () => {
  console.log("rodando...", new Date());
  try {
    const position = await getPosition(symbol);
    const hasOpenPosition = position.positionAmt != '0.000';
    console.log(hasOpenPosition);
    
    if (!hasOpenPosition) {
      const candles = await getCandles(symbol);

      // Verifica condição para criar uma ordem
      await testRegression(candles);

    }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000) 
```

Este código implementa uma estratégia de *trading* simples utilizando uma regressão linear para prever o preço de um ativo e tomar decisões de compra ou venda baseadas nas previsões. O código é dividido em duas partes principais:

A função `testRegression`, que implementa a lógica de previsão de preços e tomada de decisões.
Um loop que é executado a cada 10 segundos, buscando a posição atual e verificando se há uma posição aberta antes de executar a função testRegression.

Aqui está uma explicação detalhada do código:

1. Função testRegression:

Importa a biblioteca `regression`.
Prepara os dados de treinamento (preços de fechamento) a partir do *array* de *candles* recebido como parâmetro. O *array* de *candles* é revertido para garantir a ordem correta dos dados.
Calcula a regressão linear dos preços.
Prevê o preço para o próximo dia usando a equação resultante da regressão linear.
Com base no preço previsto, decide se deve comprar, vender ou manter a posição.
Se a decisão for comprar ou vender, cria uma ordem de limite com a quantidade especificada (0.001) e imprime a ordem no console. As linhas comentadas no código poderiam ser usadas para executar a ordem de compra ou venda, mas estão desabilitadas para fins de demonstração.

2. Loop executado a cada 10 segundos:

Imprime no console a data e hora atual.
Tenta obter a posição atual para o símbolo especificado (não fornecido no trecho de código).
Verifica se a posição está aberta, ou seja, se a quantidade do ativo é diferente de 0.
Se não houver posição aberta, busca os dados de candles e chama a função testRegression para verificar as condições de compra ou venda.
O código utiliza funções assíncronas `(async/await)` para lidar com operações que podem demorar, como consultas de dados e a criação de ordens. Note que algumas funções, como `getPosition` e `getCandles`, foram definidas em códigos anteriores.


<hr>

### Classificação

Este código é um exemplo de aplicação de aprendizado de máquina para prever a direção do movimento dos preços de um ativo em um mercado financeiro. Ele usa o algoritmo `Decision Tree Classifier` para prever se o preço aumentará (alta) ou diminuirá (baixa), com base nos valores de `SMA (Média Móvel Simples)` e `RSI (Índice de Força Relativa)`. O exemplo também inclui a colocação de ordens de compra e venda com base na previsão.


```js
const { DecisionTreeClassifier } = require('ml-cart');
const { SMA, RSI } = require('technicalindicators');

const calculateSMA = (prices, period) => SMA.calculate({ period, values: prices });
const calculateRSI = (prices, period) => RSI.calculate({ period, values: prices });

const prepareData = (prices, smaPeriod, rsiPeriod) => {
  const sma = calculateSMA(prices, smaPeriod);
  const rsi = calculateRSI(prices, rsiPeriod);

  const features = [];
  const labels = [];

  for (let i = Math.max(smaPeriod, rsiPeriod); i < prices.length; i++) {
    if (typeof sma[i - 1] !== 'number' || typeof rsi[i - 1] !== 'number') {
      continue;
    }
    features.push([sma[i - 1], rsi[i - 1]]);
    labels.push(prices[i] > prices[i - 1] ? 1 : 0);
  }

  return { features, labels };
}

const testClassification = async (candles) => {

  const prices = candles.map(candle => parseFloat(candle.close)); // Array com os preços históricos de fechamento
  const smaPeriod = 14;
  const rsiPeriod = 14;
  
  const { features, labels } = prepareData(prices, smaPeriod, rsiPeriod);
  console.log({ features, labels });
  const classifier = new DecisionTreeClassifier({ maxDepth: 10 });
  classifier.train(features, labels);
  
  // Testando a previsão do modelo
  const lastIndex = features.length - 1;
  const lastFeature = features[lastIndex];
  const lastLabel = labels[lastIndex];
  const lastPrice = candles[candles.length - 1].close; // pega o último preço
  const prediction = classifier.predict([lastFeature])[0];
  
  console.log("Real:", lastLabel === 1 ? "Alta" : "Baixa");
  console.log("Previsão:", prediction === 1 ? "Alta" : "Baixa");
  if (lastLabel == "Baixa" && prediction == "Alta") {
    const quantity = 0.001;
    const price = lastPrice;
    const order = {
      type: 'LIMIT',
      side: 'BUY',
      price,
      quantity
    }
    console.log({order});
    const result = await createOrder(order);
    console.log(result);
  }
  if (lastLabel == "Alta" && prediction == "Baixa") {
    const quantity = 0.001;
    const price = lastPrice;
    const order = {
      type: 'LIMIT',
      side: 'SELL',
      price,
      quantity
    }
    console.log({order});
    const result = await createOrder(order);
    console.log(result);
  }
}

setInterval( async () => {
  console.log("rodando...", new Date());
  try {
    const position = await getPosition(symbol);
    const hasOpenPosition = position.positionAmt != '0.000';
    console.log(hasOpenPosition);
    
    if (!hasOpenPosition) {
      const candles = await getCandles(symbol);

      // Verifica condição para criar uma ordem
      await testClassification(candles);

    }
  } catch (error) {
    console.error(error);
  }

}, 10 * 1000) 
``` 

Aqui está uma explicação das partes-chave do código:

1. Importando bibliotecas: A primeira linha importa o `DecisionTreeClassifier` da biblioteca `ml-cart`. A segunda linha importa os indicadores técnicos `SMA` e `RSI` da biblioteca `technicalindicators`.

2. Funções auxiliares: As funções `calculateSMA` e `calculateRSI` são usadas para calcular os valores de `SMA` e `RSI`, respectivamente, com base nos preços e períodos fornecidos. A função `prepareData` é usada para preparar os dados de treinamento para o modelo, gerando `features (SMA e RSI)` e `labels (alta/baixa)` com base nos preços, períodos `SMA` e `RSI` fornecidos.

3. Função `testClassification`: Esta função é responsável por treinar o modelo de classificação e testar sua previsão. Ela recebe um *array* de *candles* como entrada e extrai os preços de fechamento. Em seguida, a função prepara os dados para treinamento usando a função `prepareData`.

4. Treinamento do modelo: Um novo objeto `DecisionTreeClassifier` é criado e treinado com as `features` e `labels` geradas anteriormente.

5. Testando a previsão do modelo: A função testa a previsão do modelo usando o último conjunto de `features` e compara com a `label` real. Se a previsão for alta e a `label` real for baixa, uma ordem de compra é criada e executada. Se a previsão for baixa e a `label` real for alta, uma ordem de venda é criada e executada.

6. Programação com intervalos: A parte final do código define um intervalo que chama a função `testClassification` a cada 10 segundos. A função verifica se há uma posição aberta antes de chamar `testClassification`, para que não sejam colocadas ordens adicionais enquanto uma posição estiver aberta.

<hr>

### Algoritmos Genéticos

Este código é um exemplo de como implementar um algoritmo genético em JavaScript para otimizar os parâmetros de uma estratégia de negociação baseada em médias móveis.

```js
const PopulationSize = 10;
const MaxGenerations = 200;
const ShortMA = [5, 10, 15, 20];
const LongMA = [15, 20, 25, 30, 35];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class Individual {
  constructor(shortMA, longMA) {
    this.shortMA = shortMA;
    this.longMA = longMA;
    this.fitness = 0;
  }

  calculateFitness(data) {
    let signal = 0;
    let profit = 0;
    for (let i = 1; i < data.length; i++) {
      const sma = data.slice(i - this.shortMA, i).reduce((sum, x) => sum + x, 0) / this.shortMA;
      const lma = data.slice(i - this.longMA, i).reduce((sum, x) => sum + x, 0) / this.longMA;
      if (sma > lma && signal === 0) {
        signal = 1;
      } else if (sma < lma && signal === 1) {
        signal = 0;
        profit += data[i] - data[i - 1];
      }
    }
    this.fitness = profit;
  }

  static crossover(parent1, parent2) {
    const shortMA = Math.random() < 0.5 ? parent1.shortMA : parent2.shortMA;
    const longMA = Math.random() < 0.5 ? parent1.longMA : parent2.longMA;
    return new Individual(shortMA, longMA);
  }

  mutate() {
    if (Math.random() < 0.5) {
      this.shortMA = ShortMA[randomInt(0, ShortMA.length - 1)];
    } else {
      this.longMA = LongMA[randomInt(0, LongMA.length - 1)];
    }
  }
}

class Population {
  constructor(data) {
    this.individuals = [];
    for (let i = 0; i < PopulationSize; i++) {
      const shortMA = ShortMA[randomInt(0, ShortMA.length - 1)];
      const longMA = LongMA[randomInt(0, LongMA.length - 1)];
      this.individuals.push(new Individual(shortMA, longMA));
    }
    this.evaluateFitness(data);
  }

  evaluateFitness(data) {
    for (const individual of this.individuals) {
      individual.calculateFitness(data);
    }
  }

  selectParents() {
    const totalFitness = this.individuals.reduce((sum, x) => sum + x.fitness, 0);
    let accFitness = 0;
    const rand = Math.random() * totalFitness;
    for (const individual of this.individuals) {
      accFitness += individual.fitness;
      if (accFitness >= rand) {
        return individual;
      }
    }
    return null;
  }

  nextGeneration() {
    const newPopulation = [];
    for (let i = 0; i < PopulationSize; i++) {
      const parent1 = this.selectParents();
      const parent2 = this.selectParents();
      const child = Individual.crossover(parent1, parent2);
      child.mutate();
      newPopulation.push(child);
    }
    this.individuals = newPopulation;
  }

  getBestIndividual() {
    return this.individuals.reduce((best, x) => x.fitness > best.fitness ? x : best);
  }
}

const testGenetic = (candles) => {
// Dados hipotéticos de preços de fechamento
  const data = candles.map(candle => parseFloat(candle.close));
  // Executar o algoritmo genético
  let population = new Population(data);
  for (let i = 0; i < MaxGenerations; i++) {
    population.nextGeneration();
    population.evaluateFitness(data);
    const bestIndividual = population.getBestIndividual();
    console.log(`Generation ${i}: Best Fitness = ${bestIndividual.fitness}, ShortMA = ${bestIndividual.shortMA}, LongMA = ${bestIndividual.longMA}`);
  }
}

setTimeout( async () => {
  console.log("rodando...", new Date());
  try {
    const position = await getPosition(symbol);
    const hasOpenPosition = position.positionAmt != '0.000';
    console.log(hasOpenPosition);
    
    if (!hasOpenPosition) {
      const candles = await getCandles(symbol);

      // Verifica condição para criar uma ordem
      testGenetic(candles);

    }
  } catch (error) {
    console.error(error);
  }

}, 1 * 1000) 
```

As principais partes do código incluem a definição dos parâmetros (como tamanho da população, número máximo de gerações e intervalos permitidos para as médias móveis), a definição das classes `Individual` e `Population`, que representam um indivíduo e uma população de indivíduos, respectivamente, e a função `testGenetic`, que executa o algoritmo genético.

1. A classe `Individual` representa um indivíduo da população, e possui três propriedades: `shortMA`, `longMA` e `fitness`. As duas primeiras propriedades representam as médias móveis de curto e longo prazo, respectivamente, e são inicializadas aleatoriamente no construtor. A propriedade `fitness` é usada para avaliar a qualidade do indivíduo e é definida como zero no construtor. A classe também possui três métodos: `calculateFitness`, `crossover` e `mutate`.

2. O método `calculateFitness` é responsável por calcular a qualidade do indivíduo, com base na estratégia de negociação baseada em médias móveis. Ele recebe um array de dados de preços de fechamento e calcula a média móvel de curto prazo (sma) e a média móvel de longo prazo (lma) para cada ponto de dados. Em seguida, ele avalia a estratégia de negociação usando as médias móveis e calcula o lucro total obtido. O lucro total é atribuído à propriedade fitness do indivíduo.

3. O método `crossover` é usado para criar um novo indivíduo a partir de dois pais. Ele recebe dois indivíduos como parâmetros e escolhe aleatoriamente as propriedades `shortMA` e `longMA` de um dos pais para criar um novo indivíduo.

4. O método `mutate` é usado para alterar aleatoriamente uma das propriedades do indivíduo. Ele escolhe aleatoriamente entre as propriedades `shortMA` e `longMA` e as altera para um valor aleatório dentro dos intervalos permitidos.

5. A classe `Population` representa uma população de indivíduos e possui uma propriedade individuals, que é um *array* de instâncias da classe `Individual`. O construtor da classe é responsável por criar uma população aleatória de indivíduos e avaliar a qualidade de cada um deles. Ele recebe um *array* de dados de preços de fechamento como parâmetro e cria `PopulationSize` instâncias da classe `Individual` com parâmetros `shortMA` e `longMA` aleatórios dentro dos intervalos permitidos. Em seguida, ele chama o método `evaluateFitness` para avaliar a qualidade de cada indivíduo.

6. O método `evaluateFitness` é responsável por avaliar a qualidade de cada indivíduo na população. Ele recebe um *array* de dados de preços de fechamento como parâmetro e chama o método calculateFitness de cada indivíduo para avaliar a qualidade deles.

7. O método `selectParents` é usado para selecionar aleatoriamente dois pais da população para criar um novo indivíduo. Ele usa a propriedade `fitness` de cada indivíduo para determinar a probabilidade de seleção.

8. O método `nextGeneration` é usado para criar a próxima geração de indivíduos. Ele seleciona aleatoriamente dois pais usando o método `selectParents`, cria um novo indivíduo usando o método `crossover` e o método `mutate`, e adiciona o novo indivíduo à nova população. O processo é repetido até que a nova população tenha o mesmo tamanho da população original.

9. O método `getBestIndividual` é usado para encontrar o indivíduo com a melhor qualidade na população. Ele percorre a propriedade individuals da população e retorna o indivíduo com a maior propriedade `fitness`.

10. A função `testGenetic` é usada para executar o algoritmo genético com dados hipotéticos de preços de fechamento. Ele cria uma nova instância da classe `Population` com os dados de preços de fechamento, executa o método `nextGeneration` por `MaxGenerations` vezes e imprime o melhor indivíduo de cada geração na tela.

Em resumo, este código é um exemplo de como implementar um algoritmo genético em JavaScript para otimizar os parâmetros de uma estratégia de negociação baseada em médias móveis. Ele usa a teoria da evolução para encontrar a melhor combinação de parâmetros para a estratégia de negociação, a partir de uma população inicial aleatória.