
const moment = require('moment'); // Importa a biblioteca Moment.js

const now = moment(); // Cria um objeto Moment para a data e hora atual
const specificDate = moment('2023-04-26'); // Cria um objeto Moment para uma data específica
const fromArray = moment([2023, 3, 26]); // Cria um objeto Moment a partir de um array
const fromTimestamp = moment.unix(1651372800); // Cria um objeto Moment a partir de um timestamp UNIX

console.log({now});
console.log({specificDate});
console.log({fromArray});
console.log({fromTimestamp});

const future = now.add(1, 'week'); // Adiciona uma semana ao momento atual
const past = now.subtract(3, 'days'); // Subtrai três dias do momento atual
const day = now.day(); // Obtém o dia da semana (0 = domingo, 1 = segunda-feira, etc.)
const isBefore = now.isBefore(specificDate); // Verifica se o momento atual é anterior à data específica

console.log({future});
console.log({past});
console.log({day});
console.log({isBefore});

const formatted = now.format('YYYY-MM-DD HH:mm:ss'); // Formata o momento atual como '2023-04-26 12:34:56'
const humanReadable = now.fromNow(); // Retorna uma string legível por humanos, como 'há 2 horas'

console.log(formatted);
console.log(humanReadable);