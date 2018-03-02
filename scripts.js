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
    const dayInMilliseconds = hourInMilliseconds * 24;
    // 86400000
    const intervals = {
                        '1m': minuteInMilliseconds,
                        '3m': minuteInMilliseconds * 3,
                        '5m': minuteInMilliseconds * 5,
                        '15m': minuteInMilliseconds * 15,
                        '30m': minuteInMilliseconds * 30,
                        '1h': hourInMilliseconds,
                        '2h': hourInMilliseconds * 2,
                        '4h': hourInMilliseconds * 4,
                        '6h': hourInMilliseconds * 6,
                        '8h': hourInMilliseconds * 8,
                        '12h': hourInMilliseconds * 12,
                        '1d': dayInMilliseconds,
                        '3d': dayInMilliseconds * 3,
                        '1w': dayInMilliseconds * 7,
                        '1M': dayInMilliseconds * 31
                      };
    // async function ma(rec, span, interval) {
    //   // find the length of the interval in milliSeconds by keying in, then multiply it by the
    //   // span (-1 so as not include the record being passed in) to get a start time for the query,
    //   // add in a small percentage of the interval again for cushion (months can very length)
    //   const spanStart = rec[0] - (intervals[interval] * (span - 1)) + (intervals[interval] + 0.2);
    //   const typical = (rec[2] + rec[3] + rec[4]) / 3;
    //   let ma;
    //   db.collection('pair_record').find({'time': {'$gt': spanStart}}).toArray((err, docs) => {
    //     reduction = docs.reduce((a, cV) => {return a + cV.typical}, 0)
    //     return (reduction + typical) / (docs.length + 1);
    //   });
    // }
    //
    // TODO Compensate for 500 limit response
    //
    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
      }
    }
    await asyncForEach(Object.keys(intervals), async (int) => {
      let ohlcv = await binance.fetchOHLCV ('ETH/USDT', int, Date.now()-(intervals['1M']*24));
      ohlcv.forEach(rec => {
        let typical = (rec[2] + rec[3] + rec[4]) / 3;
        db.collection('pair_record').insertOne({
          'base': 'ETH',
          'quote': 'USDT',
          'interval': int,
          'time': rec[0],
          'open': rec[1],
          'high': rec[2],
          'low': rec[3],
          'close': rec[4],
          'typical': typical,
          'volume': rec[5]
        });
      });
    });

    // db.collection('pair_record').removeMany({});
    Object.keys(intervals).forEach(int => {
      db.collection("pair_record").find({'interval': int}).toArray((err, docs) => {
        console.log(int + ": " + docs.length);
      });
    });

    client.close();
  })()

});