# Introdução a programação em Javascript

> **Caso você já conheça o Javascript pode pular essa aula.**

JavaScript é uma linguagem de programação dinâmica, orientada a objetos e com suporte a eventos. Originalmente projetada para ser executada no navegador, ela evoluiu e agora também é usada no lado do servidor, graças ao Node.js. No contexto do algo trading, JavaScript pode ser usado para desenvolver algoritmos de negociação, automatizar processos e analisar dados financeiros.

JavaScript é uma linguagem de programação amplamente utilizada no desenvolvimento web, e também é uma ferramenta valiosa no contexto do algo trading. Neste capítulo, aprenderemos os fundamentos da programação em JavaScript, que serão aplicados posteriormente para criar estratégias de negociação automatizadas e analisar dados financeiros.

## Variáveis e Tipos de Dados

Em JavaScript, você pode declarar variáveis usando as palavras-chave var, let ou const. As variáveis armazenam informações que podem ser usadas e alteradas ao longo do programa. Os tipos de dados mais comuns em JavaScript são:

- Números: representam tanto inteiros quanto decimais, como 42 e 3.14. Em JavaScript, os números são tratados como um único tipo de dado, chamado `Number`.
- Strings: sequências de caracteres, como "Algo Trading". Podem ser escritas usando aspas simples `' '`, aspas duplas `" "`, ou acentos graves ` `` ` para template literals.
- Booleanos: representam valores verdadeiro `true` ou falso `false`, e são frequentemente utilizados para controle de fluxo e tomada de decisões em um programa.
- Arrays: coleções ordenadas de elementos que podem conter diferentes tipos de dados, como `[1, 'dois', 3.14, {nome: 'Maria'}]`. Os arrays são criados usando colchetes `[]`.
- Objetos: coleções de pares chave-valor que podem armazenar diferentes tipos de dados, como {nome: 'João', idade: 30, casado: false}. Os objetos são criados usando chaves `{}`.

Além desses tipos de dados, JavaScript também possui outros dois valores especiais:

- `null`: um valor especial que representa a ausência de valor ou a falta de referência a um objeto.
- `undefined`: indica que uma variável foi declarada, mas não teve seu valor atribuído ainda.


<hr>

## Estruturas de Controle

As estruturas de controle permitem que você controle o fluxo de execução do seu código. As principais estruturas de controle em JavaScript incluem:

Condições: *if*, *else if* e *else*
*Switch*: para verificar múltiplas condições
*Loops*: *for*, *while* e *do-while*

### Condições: if, else if e else

As estruturas condicionais if, else if e else permitem que você execute blocos de código com base em condições específicas.

```js
const idade = 18;

if (idade >= 18) {
  console.log("Você é maior de idade.");
} else if (idade >= 70) {
  console.log("Você é idoso.");
} else {
  console.log("Você é menor de idade.");
}
```

### *Switch*

A estrutura *switch* permite verificar múltiplas condições com base em uma única variável ou expressão.
Neste exemplo, a estrutura switch verifica o valor da variável diaDaSemana e imprime o nome correspondente do dia da semana. Se o valor não estiver entre 0 e 6, a mensagem "Dia inválido" será exibida.

```javascript
const diaDaSemana = 3;

switch (diaDaSemana) {
  case 0:
    console.log("Domingo");
    break;
  case 1:
    console.log("Segunda-feira");
    break;
  case 2:
    console.log("Terça-feira");
    break;
  case 3:
    console.log("Quarta-feira");
    break;
  case 4:
    console.log("Quinta-feira");
    break;
  case 5:
    console.log("Sexta-feira");
    break;
  case 6:
    console.log("Sábado");
    break;
  default:
    console.log("Dia inválido");
}
```


### Loops: for, while e do-while

*Loops* são estruturas de controle que permitem repetir blocos de código até que uma condição seja satisfeita.


#### *For loop*:

Neste exemplo, o bloco de código será executado 5 vezes, com a variável i assumindo valores de 0 a 4.

```js
for (let i = 0; i < 5; i++) {
  console.log("Repetição " + i);
}
```

#### *While loop*:

Neste exemplo, o bloco de código será executado enquanto a variável count for menor que 5.

```js
let count = 0;

while (count < 5) {
  console.log("Repetição " + count);
  count++;
}
```

#### *Do-while loop*:

Neste exemplo, o bloco de código será executado pelo menos uma vez e continuará enquanto a variável counter for menor que 5.

```js
let counter = 0;

do {
  console.log("Repetição " + counter);
  counter++;
} while (counter < 5);
```
<hr> 

## Funções

As funções em JavaScript são blocos de código nomeados que podem ser reutilizados ao longo do seu programa. Elas ajudam a organizar o código, facilitam a manutenção e promovem a reutilização. As funções podem receber parâmetros e retornar valores, permitindo a criação de códigos modulares e flexíveis.

Dominar o uso de funções em JavaScript é crucial para escrever código eficiente, organizado e reutilizável. Funções bem projetadas podem tornar seu programa mais fácil de entender e manter, além de reduzir a duplicação de código.

### Definindo Funções

Há várias maneiras de definir funções em JavaScript. Aqui estão duas das maneiras mais comuns:

*Function Declaration:*

```js
function soma(a, b) {
  return a + b;
}
```

*Function Expression:*

```js
const subtracao = function(a, b) {
  return a - b;
};
``` 

### Chamando Funções

Depois de definir uma função, você pode chamá-la em seu código usando seu nome e passando os argumentos necessários:

```js
const resultadoSoma = soma(5, 3); // resultadoSoma recebe o valor 8
const resultadoSubtracao = subtracao(10, 4); // resultadoSubtracao recebe o valor 6
```


### Parâmetros e Argumentos

As funções podem receber parâmetros, que são variáveis locais dentro da função. Quando você chama uma função, os valores que você passa para ela são chamados de argumentos. Os argumentos são atribuídos aos parâmetros correspondentes na ordem em que são passados.

```js
function saudacao(nome, idade) {
  console.log("Olá, meu nome é " + nome + " e eu tenho " + idade + " anos.");
}

saudacao("João", 25); // Exibe "Olá, meu nome é João e eu tenho 25 anos."
```

### Valores de Retorno

As funções podem retornar valores usando a palavra-chave return. Quando uma função retorna um valor, você pode usar esse valor em expressões, atribuições ou passá-lo para outras funções.

```js
function multiplica(a, b) {
  return a * b;
}

const resultadoMultiplicacao = multiplica(5, 4); // resultadoMultiplicacao recebe o valor 20
console.log("O resultado da multiplicação é: " + resultadoMultiplicacao); // Exibe "O resultado da multiplicação é: 20"
```

### Funções de Arrow

As funções de *arrow*, ou *arrow functions*, são uma maneira mais concisa de escrever funções em JavaScript. Elas são especialmente úteis para funções anônimas ou pequenas funções que são passadas como argumentos para outras funções.

**Eu uso esse mais esse tipo de função.**

```js
const divisao = (a, b) => {
  return a / b;
};

const resultadoDivisao = divisao(20, 4); // resultadoDivisao recebe o valor 5
```

Caso você apenas retorne algum valor pode usar sem o `return` e as `{}`

```js
const divisao = (a, b) => a / b;
const resultadoDivisao = divisao(20, 4); // resultadoDivisao recebe o valor 5
```
### IIFE (Immediately Invoked Function Expression)

IIFE, ou *Immediately Invoked Function Expression*, é um padrão de design em JavaScript que permite que uma função seja definida e executada imediatamente após sua criação. IIFEs são úteis para isolar variáveis e funções, evitando que elas "vazem" para o escopo global e possam causar conflitos ou poluição no espaço de nomes.

As IIFEs podem ser usadas em combinação com outras técnicas, como objetos ou módulos, para organizar e encapsular código em projetos maiores. Além disso, IIFEs eram comumente usadas em JavaScript antes da introdução do let e const para declarar variáveis com escopo de bloco, ajudando a evitar a poluição do escopo global.

Uma IIFE é criada envolvendo uma função anônima em parênteses, seguida por outro par de parênteses que invoca a função imediatamente:

```js
;(function() {
  const variavelLocal = "Esta variável não vazará para o escopo global";
  console.log(variavelLocal);
})();

(function(nome, idade) {
  console.log("Meu nome é " + nome + " e eu tenho " + idade + " anos.");
})("João", 25);
```

E também é muito utilizada para executar funções *async* com um *await* dentro dela:

```js
;(async () => {
  const resultado = await getData();
  console.log(resultado);
})();
```

<hr>

## Manipulação de Dados

JavaScript fornece diversas funções e métodos para manipular dados. Por exemplo, você pode:

- Converter strings em números e vice-versa
- Manipular arrays e objetos
- Trabalhar com datas e horários

### Converter strings em números e vice-versa

```js
// Converter string para número
const str = "42";
const num = parseInt(str, 10); // Converte a string "42" para o número 42

// Converter número para string
const number = 42;
const string = number.toString(); // Converte o número 42 para a string "42"
```

### Manipular arrays e objetos

```js
// Criar e manipular arrays
const arr = [1, 2, 3];
arr.push(4); // Adiciona o número 4 ao final do array
arr.pop(); // Remove o último elemento do array
const reversedArr = arr.reverse(); // Inverte a ordem dos elementos no array
const firstThree = arr.slice(0, 3);
const lastThree = arr.slice(-3);
// Criar e manipular objetos
const obj = {
  nome: "João",
  idade: 30
};
obj.profissao = "Engenheiro"; // Adiciona uma nova propriedade ao objeto
delete obj.idade; // Remove a propriedade "idade" do objeto
const keys = Object.keys(obj); // Retorna um array com as chaves do objeto: ["nome", "profissao"]
const keys = Object.values(obj); // Retorna um array com os valores do objeto: ["João", "Engenheiro"]
```

### Trabalhar com datas e horários

```js
// Criar uma nova data e hora
const now = new Date(); // Cria um objeto Date com a data e hora atuais

// Acessar partes da data e hora
const year = now.getFullYear(); // Obtém o ano atual (ex.: 2023)
const month = now.getMonth() + 1; // Obtém o mês atual (0-11, por isso adicionamos 1)
const day = now.getDate(); // Obtém o dia do mês atual

// Calcular a diferença entre duas datas
const date1 = new Date('2023-04-26');
const date2 = new Date('2023-05-01');
const diffInMilliseconds = date2 - date1; // Calcula a diferença em milissegundos
const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24); // Converte a diferença para dias
```

Porém trabalhar com datas no Javascript pode ser uma tarefa inglória e para solucionar isso
temos a ótima biblioteca [moment](https://www.npmjs.com/package/moment). Que por sinal suas funções
deveriam fazer parte do Javascript, IMHO.


### Moment


[Moment](https://www.npmjs.com/package/moment) é uma biblioteca JavaScript amplamente utilizada para manipular e formatar datas e horários. Em algo trading, trabalhar com datas e horários é uma tarefa comum, já que muitas vezes você precisa analisar dados históricos, lidar com intervalos de tempo e programar a execução de ordens em momentos específicos.

Aqui estão alguns dos recursos-chave do Moment:

#### Criação de Momentos

Você pode criar objetos Moment a partir de várias entradas, como datas JavaScript, strings, arrays e timestamps UNIX. Por exemplo:

```js
const moment = require('moment'); // Importa a biblioteca Moment.js

const now = moment(); // Cria um objeto Moment para a data e hora atual
const specificDate = moment('2023-04-26'); // Cria um objeto Moment para uma data específica
const fromArray = moment([2023, 3, 26]); // Cria um objeto Moment a partir de um array
const fromTimestamp = moment.unix(1651372800); // Cria um objeto Moment a partir de um timestamp UNIX
```
#### Manipulação de Momentos

A biblioteca Moment fornece vários métodos para manipular objetos Moment, como adicionar ou subtrair unidades de tempo, definir e obter valores e comparar momentos. Por exemplo:

```js
const future = now.add(1, 'week'); // Adiciona uma semana ao momento atual
const past = now.subtract(3, 'days'); // Subtrai três dias do momento atual
const day = now.day(); // Obtém o dia da semana (0 = domingo, 1 = segunda-feira, etc.)
const isBefore = now.isBefore(specificDate); // Verifica se o momento atual é anterior à data específica
```

#### Formatação de Momentos

O Moment também permite formatar objetos Moment como strings legíveis por humanos ou em formatos específicos. Por exemplo:

```js
const formatted = now.format('YYYY-MM-DD HH:mm:ss'); // Formata o momento atual como '2023-04-26 12:34:56'
const humanReadable = now.fromNow(); // Retorna uma string legível por humanos, como 'há 2 horas'
```


<hr>

## Promises, Async e Await

Em JavaScript, é comum trabalhar com operações assíncronas, como solicitações de rede, leitura de arquivos e acesso a APIs. Essas operações podem levar algum tempo para serem concluídas e, em vez de bloquear a execução do programa, elas são processadas em paralelo. Para lidar com operações assíncronas, JavaScript introduziu o conceito de *Promises*, juntamente com as palavras-chave `async` e `await`.

### Promises

Uma *Promise* é um objeto que representa o resultado de uma operação assíncrona que pode ser concluída no futuro. Uma *Promise* tem três estados possíveis:

- *Pending* (pendente): a operação ainda não foi concluída.
- *Fulfilled* (cumprida): a operação foi concluída com sucesso e a Promise tem um valor resultante.
- *Rejected* (rejeitada): ocorreu um erro durante a operação e a Promise tem um motivo de rejeição.

Você pode usar o método `then()` para tratar o valor de uma Promise cumprida e o método `catch()` para tratar o motivo de uma Promise rejeitada. Além disso, você pode encadear várias *Promises* usando o método `then()`.

### Async e Await

A palavra-chave `async` é usada para declarar funções assíncronas. Essas funções retornam uma *Promise* e, quando chamadas, são executadas em paralelo com o restante do programa. Dentro de uma função assíncrona, você pode usar a palavra-chave `await` antes de uma Promise para aguardar sua resolução antes de prosseguir com a execução da função. Isso permite escrever código assíncrono de maneira mais clara e legível, semelhante a um código síncrono.

Aqui está um exemplo de como usar Promises e async/await para lidar com operações assíncronas:

```js
// Função que retorna uma Promise que resolve após um tempo especificado
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função assíncrona que utiliza a função timeout
async function process() {
  console.log("Início do processamento...", new Date());
  await timeout(5000); // Aguarda 5 segundos antes de prosseguir
  console.log("Processamento concluído.", new Date());
}

process(); // Chama a função assíncrona
```

<hr>

## Bibliotecas e APIs

No mundo do algo trading, você frequentemente precisará utilizar bibliotecas e APIs para acessar dados financeiros, executar operações e gerenciar seu portfólio. Algumas das bibliotecas mais populares incluem:

- [Pandas-js](https://www.npmjs.com/package/pandas-js): manipulação e análise de dados
- [TA-Lib](https://www.npmjs.com/package/talib): análise técnica e indicadores
- [TechnicalIndicators](https://www.npmjs.com/package/technicalindicators): indicadores
- [CCXT](https://www.npmjs.com/package/ccxt): API para acessar diversas exchanges de criptomoedas
- [Simple Statistics](https://www.npmjs.com/package/simple-statistics): uma implementação de estatísticas descritivas, de regressão e etc

No próximo capítulo, exploraremos como aplicar os fundamentos da programação em JavaScript para criar estratégias de negociação automatizadas e analisar dados financeiros.


