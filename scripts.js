var ccxt = require ('ccxt');

// console.log (ccxt.exchanges);

let binance  = new ccxt.binance ({ verbose: true });
// console.log (binance.id,  await binance.loadMarkets());
// console.log (binance.id,  await binance.fetchTicker('BTC/USD'));
// await isn't working
console.log (binance.id,  binance.loadMarkets());
console.log (binance.id,  binance.fetchTicker('BTC/USD'));