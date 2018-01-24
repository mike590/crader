var ccxt = require ('ccxt');

// console.log (ccxt.exchanges);

let binance  = new ccxt.binance ({ verbose: true });
async function test() => {
  x = await binance.loadMarkets();
  // y = await binance.fetchTicker('BTC/USD');
  debugger
}
setTimeout(test, 5000)
