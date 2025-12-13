

const API_KEY = "";
const USE_API = Boolean(API_KEY && API_KEY.trim().length > 0);

const stockCatalog = [
  {symbol:'AAPL', name:'Apple Inc.'},
  {symbol:'MSFT', name:'Microsoft Corp.'},
  {symbol:'GOOGL', name:'Alphabet Inc.'},
  {symbol:'TSLA', name:'Tesla, Inc.'},
  {symbol:'INFY', name:'Infosys Ltd'},
  {symbol:'NIFTY', name:'Nifty Index'} // NIFTY won't work on Alpha Vantage — will fallback to sample
];


const sampleStocks = {
  AAPL: { price:174.12, changePerc:-0.34, history:[165,168,170,172,171,173,174] },
  MSFT: { price:348.54, changePerc:0.42, history:[330,335,340,345,346,347,348] },
  GOOGL: { price:139.18, changePerc:1.12, history:[128,130,132,135,136,137,139] },
  TSLA: { price:247.33, changePerc:-2.15, history:[260,255,252,250,249,248,247] },
  INFY: { price:41.22, changePerc:0.87, history:[38,39,40,40.5,40.8,41.0,41.2] },
  NIFTY: { price:21950, changePerc:0.15, history:[21600,21700,21800,21900,21920,21930,21950] }
};

const listEl = document.getElementById('stock-list');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');

let renderedSymbols = stockCatalog.map(s => s.symbol);

// Render list based on catalog; prices will be populated from API or sample when selected.
function renderList(symbols){
  listEl.innerHTML = '';
  symbols.forEach(sym => {
    const meta = stockCatalog.find(s => s.symbol === sym) || {symbol: sym, name:''};
    const div = document.createElement('div');
    div.className = 'stock-item';
    // show placeholder price until fetched
    div.innerHTML = `<div>
      <div class="symbol">${meta.symbol} <span class="meta">- ${meta.name}</span></div>
      <div class="meta">Price: <span class="price" data-symbol="${meta.symbol}">-</span></div>
    </div>
    <div class="right">
      <div class="change" data-symbol="${meta.symbol}">-</div>
    </div>`;
    div.addEventListener('click',()=>selectStock(meta.symbol));
    listEl.appendChild(div);
  });
}

// Called when user selects a symbol
async function selectStock(symbol){
  document.getElementById('chart-title').textContent = symbol;
  // show loading state in list item
  const priceEl = document.querySelector(`.price[data-symbol="${symbol}"]`);
  const changeEl = document.querySelector(`.change[data-symbol="${symbol}"]`);
  if(priceEl) priceEl.textContent = '...';
  if(changeEl) changeEl.textContent = '...';

  if(USE_API && symbol !== 'NIFTY'){ // NIFTY is index; Alpha Vantage requires specific symbols/exchange
    try{
      const result = await fetchAlphaDaily(symbol);
      if(result && result.history && result.history.length){
        // update list UI
        const latest = result.history[result.history.length - 1];
        const prev = result.history[result.history.length - 2] ?? latest;
        const changePerc = (((latest - prev) / prev) * 100);
        if(priceEl) priceEl.textContent = formatNumber(latest);
        if(changeEl) {
          changeEl.textContent = (changePerc>=0?'+':'') + changePerc.toFixed(2) + '%';
          changeEl.className = changePerc>=0 ? 'positive' : 'negative';
        }
        drawChart(result.history, symbol);
        return;
      }
      // else fallthrough to sample data
    } catch(err){
      console.error('API fetch error', err);
      // fallback below
    }
  }

  // Fallback: use sample data stored locally
  const s = sampleStocks[symbol];
  if(s){
    if(priceEl) priceEl.textContent = formatNumber(s.price);
    if(changeEl){
      changeEl.textContent = (s.changePerc>=0?'+':'') + s.changePerc.toFixed(2) + '%';
      changeEl.className = s.changePerc>=0 ? 'positive' : 'negative';
    }
    drawChart(s.history, symbol);
  } else {
    // No data available
    if(priceEl) priceEl.textContent = '-';
    if(changeEl) changeEl.textContent = '-';
    drawChart([], symbol);
  }
}

// Fetch daily series from Alpha Vantage and return { history: [close...last7], meta... }
async function fetchAlphaDaily(symbol){
  // Use TIME_SERIES_DAILY; note output is JSON with "Time Series (Daily)"
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${API_KEY}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Network response not ok: ' + res.status);
  const json = await res.json();

  // Check for API errors or note about rate limit
  if(json['Error Message']) throw new Error('Alpha Vantage error: ' + json['Error Message']);
  if(json['Note']) {
    // rate limit / too many requests
    throw new Error('Alpha Vantage rate limit or note: ' + json['Note']);
  }

  const series = json['Time Series (Daily)'] || json['Time Series (Daily)'];
  if(!series) throw new Error('No time series returned by API');

  // Extract most recent 7 business days, sorted ascending (oldest -> newest)
  const dates = Object.keys(series).sort();
  const lastDates = dates.slice(-7);
  const history = lastDates.map(d => {
    const closeStr = series[d]['4. close'];
    return parseFloat(closeStr);
  });

  return { history, fetchedAt: dates[dates.length-1] };
}

// Utility: format number with up to 2 decimals; if large integer, preserve
function formatNumber(n){
  if(Math.abs(n) >= 1000 && Math.abs(n) < 1000000) return Math.round(n).toLocaleString();
  return (Math.round((n + Number.EPSILON) * 100) / 100).toString();
}

// Search & sort handlers
searchEl.addEventListener('input', ()=>{
  const q = searchEl.value.trim().toLowerCase();
  const filtered = stockCatalog
    .filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    .map(s => s.symbol);
  renderList(filtered);
});

sortEl.addEventListener('change', ()=>{
  const v = sortEl.value;
  // For sort by price we need to have price values; if API not used we rely on sampleStocks
  let arr = stockCatalog.slice();
  if(v === 'price-asc' || v === 'price-desc'){
    arr.sort((a,b)=>{
      const pa = sampleStocks[a.symbol] ? sampleStocks[a.symbol].price : 0;
      const pb = sampleStocks[b.symbol] ? sampleStocks[b.symbol].price : 0;
      return v==='price-asc'? pa-pb : pb-pa;
    });
  } else if(v === 'change-desc'){
    arr.sort((a,b)=>{
      const ca = sampleStocks[a.symbol] ? sampleStocks[a.symbol].changePerc : 0;
      const cb = sampleStocks[b.symbol] ? sampleStocks[b.symbol].changePerc : 0;
      return cb - ca;
    });
  }
  renderList(arr.map(x => x.symbol));
});

// ------- Canvas Chart (same as original) --------
const canvas = document.getElementById('priceChart');
const ctx = canvas.getContext('2d');

function drawChart(data, label){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(!data || data.length === 0){
    ctx.fillStyle = '#68707a';
    ctx.font = '14px Arial';
    ctx.fillText('No data available for ' + label, 20, 40);
    return;
  }

  const padding = 40;
  const w = canvas.width - padding*2;
  const h = canvas.height - padding*2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) || 1;

  // axes
  ctx.strokeStyle = '#e6e9ef';
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding+h);
  ctx.lineTo(padding+w, padding+h);
  ctx.stroke();

  // line
  ctx.beginPath();
  data.forEach((v,i)=>{
    const x = padding + (i/(data.length-1))*w;
    const y = padding + h - ((v-min)/range)*h;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#2b7cff';
  ctx.stroke();

  // points
  data.forEach((v,i)=>{
    const x = padding + (i/(data.length-1))*w;
    const y = padding + h - ((v-min)/range)*h;
    ctx.beginPath();
    ctx.arc(x,y,3,0,Math.PI*2);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2b7cff';
    ctx.fill();
    ctx.stroke();
  });

  // labels
  ctx.fillStyle = '#68707a';
  ctx.font = '12px Arial';
  ctx.fillText('Min: '+ formatNumber(min), 10, 14);
  ctx.fillText('Max: '+ formatNumber(max), 10, 30);
  // x labels: show oldest and newest date indices
  ctx.fillText('Points: ' + data.length, canvas.width - 120, 20);
}

// Initialize list and select first
renderList(renderedSymbols);
selectStock(renderedSymbols[0]);

// Helpful note displayed in console
console.info("Stock Dashboard: Using API =", USE_API, " — If you set API_KEY variable at top, live data will be fetched (Alpha Vantage).");
