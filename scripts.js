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

  // db.collection('pair_record').deleteMany({"name":"test"});
  client.close();
});

// console.log (ccxt.exchanges);
