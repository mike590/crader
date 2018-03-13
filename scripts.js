let ccxt = require ('ccxt');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'crader';

let binance = new ccxt.binance ({ verbose: false });

// ms conversions
const minuteInMilliseconds = 1000 * 60;
const hourInMilliseconds = minuteInMilliseconds * 60;
const dayInMilliseconds = hourInMilliseconds * 24;
// 86400000
const intervals = {'1m': minuteInMilliseconds};
// const intervals = {
//                     '1m': minuteInMilliseconds,
//                     '3m': minuteInMilliseconds * 3,
//                     '5m': minuteInMilliseconds * 5,
//                     '15m': minuteInMilliseconds * 15,
//                     '30m': minuteInMilliseconds * 30,
//                     '1h': hourInMilliseconds,
//                     '2h': hourInMilliseconds * 2,
//                     '4h': hourInMilliseconds * 4,
//                     '6h': hourInMilliseconds * 6,
//                     '8h': hourInMilliseconds * 8,
//                     '12h': hourInMilliseconds * 12,
//                     '1d': dayInMilliseconds,
//                     '3d': dayInMilliseconds * 3,
//                     '1w': dayInMilliseconds * 7,
//                     '1M': dayInMilliseconds * 31
//                   };
// ----------------------
// async helpers
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
// -----------------------------
// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  (async () => {
    await db.collection('pair_record').removeMany({});
    // used for saving records
    let int;
    let oldestRec;

    // Split into two functions, fetch and save
    // easy to split, but figure out how to implement within asyncWhile
    async function saveRecords() {
      let ohlcv;
      if (oldestRec) {
       ohlcv = await binance.fetchOHLCV ('ETH/USDT', int, oldestRec + intervals['1m']);
      } else {
       ohlcv = await binance.fetchOHLCV ('ETH/USDT', int, Date.now()-(intervals['1m']*9));
      }
      await asyncForEach(ohlcv, async (rec) => {
        let typical = (rec[2] + rec[3] + rec[4]) / 3;
        // Repeat for the rest of the indicators
        let {
          ma: tempMa,
          ema: tempEma,
          agl: tempAgl,
          rsi: tempRsi
        } = await setIndicators(rec, int);
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
          'ma': tempMa,
          'ema': tempEma,
          'agl': tempAgl,
          'rsi': tempRsi
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

    async function setIndicators(rec, interval) {
      const span = 90;
      // find the length of the span in milliSeconds by keying in, then multiply it by the
      // span (-1 so as not include the record being passed in) to get a start time for the query,
      // add in a small percentage of the interval again for cushion (months can very length)
      const spanStart = rec[0] - (intervals[interval] * (span - 1) + (intervals[interval] * 0.2)) ;
      const typical = (rec[2] + rec[3] + rec[4]) / 3;
      let docs = await db.collection('pair_record').find({'time': {'$gt': spanStart}, 'interval': interval}).sort({'time': -1}).toArray();
      // taking indicators based on typical price ((low + high + close)/3) and closing price
      let aglt = agl(docs, typical, 'typical');
      let aglc = agl(docs, rec[4], 'close');
      return {
        'ma': {
          'typical': ma(docs, typical, 'typical'),
          'close': ma(docs, rec[4], 'close')
        },
        'ema': {
          'typical': ema(docs[0], typical, 'typical'),
          'close': ema(docs[0], rec[4], 'close')
        },
        // average gain/loss ([gain, loss]) typical
        'agl': {
          'typical': aglt,
          'close': aglc
        },
        'rsi': {
          'typical': rsi(aglt),
          'close': rsi(aglc)
        }
      };
    }

    function ma(docs, currentPrice, key) {
      let tempMa = {};
      [4, 9, 24, 44, 69, 89].forEach(endIndex => {
        let subArray = docs.slice(0, endIndex);
        let reduction = subArray.reduce((a, cV) => {return a + cV[key]}, 0);
        tempMa[endIndex + 1] = (reduction + currentPrice) / (subArray.length + 1);
      });
      return tempMa;
    }

    function ema(previousDoc, currentPrice, key) {
      if (previousDoc) {
        let tempEma = {};
        [6, 12, 26, 40].forEach(period => {
          let multiplier = 2 / (period + 1);
          let previousEma = previousDoc['ema'][key][period];
          tempEma[period] = (currentPrice - previousEma) * multiplier + previousEma;
        });
        return tempEma;
      } else {
        return {
          6: currentPrice,
          12: currentPrice,
          26: currentPrice,
          40: currentPrice
        };
      }
    }

    function agl(docs, currentPrice, key) {
      let agl = {};
      [6, 13, 20, 27, 34].forEach(endIndex => {
        // calculate based on smoothing formula
        if (docs[0] && docs[0].agl[key] && docs[0].agl[key][endIndex + 1]) {
          let gain, loss;
          if (currentPrice > docs[0][key]) {
            loss = ((docs[0].agl[key][endIndex + 1][1] * endIndex) / (endIndex + 1));
            gain = (((docs[0].agl[key][endIndex + 1][0] * endIndex) + (currentPrice - docs[0][key])) / (endIndex + 1));
          } else {
            gain = ((docs[0].agl[key][endIndex + 1][0] * endIndex) / (endIndex + 1));
            loss = (((docs[0].agl[key][endIndex + 1][1] * endIndex) + (docs[0][key] - currentPrice)) / (endIndex + 1));
          }
          agl[endIndex + 1] = [gain, loss];
        // calculate by adding up the previous period
        } else if (docs.length >= (endIndex)){
          let lastPrice;
          let gains = 0;
          let losses = 0;
          // reverse array to get oldest records first
          let subArray = docs.slice(0, endIndex).reverse();
          // calculate gains/losses of past records in this period
          subArray.forEach(doc => {
            if (lastPrice) {
              if (lastPrice > doc[key]) {
                losses += lastPrice - doc[key];
              } else {
                gains += doc[key] - lastPrice;
              }
            }
            lastPrice = doc[key];
          });
          // current record is also in this period
          if (lastPrice > currentPrice) {
            losses += lastPrice - currentPrice;
          } else {
            gains += currentPrice - lastPrice;
          }
          const ag = gains / (endIndex + 1);
          const al = losses / (endIndex + 1);
          agl[endIndex + 1] = [ag, al];
        // not enough to data to calculate
        } else {
          agl[endIndex + 1] = null;
        }
      });
      return agl;
    }

    function rsi(agl) {
      let tempRsi = {};
      Object.keys(agl).forEach(i => {
        if (agl[i]) {
          let tempRs = agl[i][0] / agl[i][1];
          tempRsi[i] = 100 - (100 / (1 + tempRs));
        } else {
          tempRsi[i] = null;
        }
      });
      return tempRsi;
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
