const ccxt = require ('ccxt');

// console.log (ccxt.exchanges);

const binance = new ccxt.binance({ verbose: false });

(async () => {
  // x = await binance.loadMarkets();
  // y = await binance.fetchTicker('BTC/USD');
  //
  // const trades = await binance.fetchTrades('ETH/BTC');
  // const prices = trades.map((trade) => trade.price);
  // const max = Math.max(...prices);
  // const min = Math.min(...prices);
  // const mean = prices.reduce((acc, cV) => acc + cV)/prices.length;
  // const spread = max - min;
  // console.log(min, max, spread, mean);
  // console.log(spread / mean * 100);
  const symbols = ['ETH/BTC', 'XRP/ETH', 'XLM/ETH', 'VEN/ETH'];
  const dayInMillieconds = 1000 * 60 * 60 * 24;
  const tenDaysAgo = Date.now() - 10 * dayInMillieconds;
  console.log(tenDaysAgo);
  let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
	if (binance.has.fetchOHLCV) {
   //  for (const symbol of symbols) {
   //    await sleep (binance.rateLimit); // milliseconds
   //    ohlcv = await binance.fetchOHLCV (symbol, '1m', tenDaysAgo); // one minute
			// console.log(ohlcv[ohlcv.length-1]);
   //  }
    ohlcv = await binance.fetchOHLCV ('XRP/ETH', '1m', tenDaysAgo); // one minute
    // for (const t of ohlcv) {
    // 	console.log(new Date(t[0]));
    // }
    // const first = ohlcv[0];
    // const last = ohlcv[ohlcv.length-1][0];
    // console.log(new Date(first[0]));
    // console.log(new Date(last[0]));
    // console.log(ohlcv.length);
  }

})()

class Record {
	constructor(date, base, quote, price) {
		this.data = date;
		this.base = base;
		this.quote = quote;
		this.price = price;
	}

	get() {
		return {
			date: this.data,
			base: this.base,
			quote: this.quote,
			price: this.price
		}
	}

}