let ccxt = require ('ccxt');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'crader';

let binance = new ccxt.binance ({ verbose: false });

const minuteInMilliseconds = 1000 * 60;
const hourInMilliseconds = minuteInMilliseconds * 60;
const dayInMilliseconds = hourInMilliseconds * 24;
// 86400000
// const intervals = {'1m': minuteInMilliseconds};
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

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

function timeoutPromised(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(time) {
  await timeoutPromised(time);
}

async function asyncWhile(callback) {
  let iterateAgain = true
  while (iterateAgain == true) {
    iterateAgain = await callback();
    await sleep(binance.rateLimit);
  }
}

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  (async () => {
    await db.collection('pair_record').removeMany({});
    // used for saving records
    let int;
    let oldestRec;

    // Split into ttwo functions, fetch and save
    // easy to split, but figure out how to implement within asyncWhile
    async function saveRecords() {
      let ohlcv;
      if (oldestRec) {
       ohlcv = await binance.fetchOHLCV ('ETH/USDT', int, oldestRec + intervals['1m']);
      } else {
       ohlcv = await binance.fetchOHLCV ('ETH/USDT', int, Date.now()-(intervals['1m']*100));
      }
      await asyncForEach(ohlcv, async (rec) => {
        let typical = (rec[2] + rec[3] + rec[4]) / 3;
        // Repeat for the rest of the indicators
        let tempMa = await ma(rec, int);
        await db.collection('pair_record').insertOne({
          'base': 'ETH',
          'quote': 'USDT',
          'interval': int,
          'time': rec[0],
          'open': rec[1],
          'high': rec[2],
          'low': rec[3],
          'close': rec[4],
          'typical': typical,
          'volume': rec[5],
          'ma': tempMa
        });
      });
      if (ohlcv.length === 500) {
        oldestRec = ohlcv[499][0];
        return true;
      } else {
        oldestRec = null;
        return false;
      }
    }

    async function ma(rec, interval) {
      const span = 90;
      // find the length of the span in milliSeconds by keying in, then multiply it by the
      // span (-1 so as not include the record being passed in) to get a start time for the query,
      // add in a small percentage of the interval again for cushion (months can very length)
      const spanStart = rec[0] - (intervals[interval] * (span - 1) + (intervals[interval] * 0.2)) ;
      const typical = (rec[2] + rec[3] + rec[4]) / 3;
      let docs = await db.collection('pair_record').find({'time': {'$gt': spanStart}, 'interval': interval}).sort({'time': -1}).toArray();
      let tempMa = {};
      [4, 9, 24, 44, 69, 89].forEach(endIndex => {
        let subArray = docs.slice(0, endIndex);
        let reduction = subArray.reduce((a, cV) => {return a + cV.typical}, 0)
        tempMa[endIndex+1] = (reduction + typical) / (subArray.length + 1);
      });
      return tempMa;
    }

    await asyncForEach(Object.keys(intervals), async (tempInt) => {
      int = tempInt;
      await asyncWhile(saveRecords)
    });


    await asyncForEach(Object.keys(intervals), async (tempInt) => {
      let docs = await db.collection("pair_record").find({'interval': tempInt}).toArray();
      console.log(tempInt + ": " + docs.length);
    });

    client.close();
  })()

});

