const Binance = require('binance-api-node').default;
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const client = Binance({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  futures: true // ativa o modo de futuros
});

const symbol = 'BTCUSDT';
const getPosition = async (symbol = 'BTCUSDT') => {
  try {
    const positions = await client.futuresPositionRisk({symbol});
    const position = positions.find(position => position.symbol === symbol);
    console.log(position);

    return position;
  } catch (error) {
    console.error(error);
  }
}

const getCandles = async (symbol = 'BTCUSDT', interval = "5m") => {
  try {
    const candles = await client.futuresCandles({
      symbol: symbol,
      interval: interval
    });
    // console.log("Last candle: ", candles[candles.length - 1]);
    return candles;
  } catch (error) {
    console.error(error);
  }
}

const createOrder = async (order) => {
  console.log('createOrder');
  if (order.type === 'LIMIT') 
    order.timeInForce = 'GTC';
  if (order.type === 'MARKET') 
    delete order.price;
  
  console.log({order})
  try {
    const result = await client.futuresOrder(order);
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
  
}
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