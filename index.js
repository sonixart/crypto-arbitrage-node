
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT',
  'DOGEUSDT', 'SOLUSDT', 'LTCUSDT', 'AVAXUSDT', 'LINKUSDT',
  'MATICUSDT', 'TRXUSDT', 'DOTUSDT', 'SHIBUSDT', 'ATOMUSDT'
];

async function getBinancePrice(symbol) {
  const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=' + symbol);
  const data = await res.json();
  return parseFloat(data.price);
}

async function getBybitPrice(symbol) {
  const res = await fetch('https://api.bybit.com/v2/public/tickers?symbol=' + symbol);
  const data = await res.json();
  return parseFloat(data.result[0].last_price);
}

app.get('/api/arbitrage', async (req, res) => {
  let results = [];
  for (const pair of PAIRS) {
    try {
      const [binance, bybit] = await Promise.all([
        getBinancePrice(pair),
        getBybitPrice(pair)
      ]);
      const percent = ((bybit - binance) / binance) * 100;
      results.push({
        pair,
        binance,
        bybit,
        percent: percent.toFixed(2)
      });
    } catch (e) {
      results.push({ pair, error: 'Fetch error' });
    }
  }
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
