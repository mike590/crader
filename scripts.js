var ccxt = require ('ccxt');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'crader';

async function saveRecord() {

}

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  console.log("Connected successfully to server");
  const db = client.db(dbName);

  (async () => {
    let binance  = new ccxt.binance ({ verbose: false });
    const minuteInMilliseconds = 1000 * 60;
    const hourInMilliseconds = minuteInMilliseconds * 60;
    const dayInMillieconds = hourInMilliseconds * 24;
    // const tenDaysAgo = Date.now() - 10 * dayInMillieconds;
    // let ohlcv = await binance.fetchOHLCV ('XRP/ETH', '1m', Date.now()-(hourInMilliseconds*3)); // one minute
    // ohlcv.forEach(rec => {
    //   db.collection('pair_record').insertOne({"name":"test","date":rec[0],"open":rec[1]});
    // })
    // db.collection('pair_record').removeMany({});
    // db.collection("pair_record").find({}).toArray((err, docs) => {
      // console.log(docs);
    // });

    client.close();
  })()

});