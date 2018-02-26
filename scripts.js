var ccxt = require ('ccxt');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'crader';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  // not needed, will create automatically on first insert
  // if(db.getCollectionNames().indexOf('pair_record') === -1) {
  //   db.createCollection('pair_record');
  // }
  (async () => {
    let binance  = new ccxt.binance ({ verbose: false });
    // x = await binance.loadMarkets();
    // let ob = await binance.fetchOrderBook('ETH/BTC');
    // let bid = ob.bids.length ? ob.bids[0][0] : undefined
    // let ask = ob.asks.length ? ob.asks[0][0] : undefined
    // let spread = (bid && ask) ? ask - bid : undefined
    // console.log (binance.id, 'market price', { bid, ask, spread })
    // let ticker = await binance.fetchTicker('ETH/BTC');
    // console.log(ticker);
    // let ohlcv = await binance.fetchOHLCV('ETH/BTC', '1m');
    // console.log(ohlcv[ohlcv.length-1]);
    console.log(await binance.fetchMarkets());
    // ohlcv = await binance.fetchOHLCV('ETH/BTC', '1m');
    // console.log(ohlcv[ohlcv.length-1]);
    // ohlcv = await binance.fetchOHLCV('ETH/BTC', '1m');
    // console.log(ohlcv[ohlcv.length-1]);
    // ohlcv = await binance.fetchOHLCV('ETH/BTC', '1m');
    // console.log(ohlcv[ohlcv.length-1]);
    // ohlcv = await binance.fetchOHLCV('ETH/BTC', '1m');
    // console.log(ohlcv[ohlcv.length-1]);
    // y = await binance.fetchTicker('ETH/BTC');
    // let trades = await binance.fetchTrades('ETH/BTC', 1517002466234, 100);
    // console.log(trades);
    // for (let i = 0; i < trades.length - 1; i++) {
    //   console.log(trades[i].price);
    // }
  })()

<<<<<<< HEAD
  // db.collection('pair_record').deleteMany({"name":"test"});
  client.close();
});

// console.log (ccxt.exchanges);
=======
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
>>>>>>> 4a5c54f1728bbdc02bcd37230865d54bdb5f7253
