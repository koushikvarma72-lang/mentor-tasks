const AUTO_REFRESH_MS = 5 * 60 * 1000;
    let refreshTimer = null;

    const searchForm  = document.getElementById('searchForm');
    const cityInput   = document.getElementById('cityInput');
    const searchBtn   = document.getElementById('searchBtn');
    const errorBox    = document.getElementById('errorBox');
    const currentCard = document.getElementById('currentCard');
    const forecastSection = document.getElementById('forecastSection');
    const forecastGrid = document.getElementById('forecastGrid');
    const quickButtons = document.querySelectorAll('.quick-btn');

    async function geocodeCity(city) {
      const url =
        'https://nominatim.openstreetmap.org/search?format=json&q=' +
        encodeURIComponent(city) +
        '&limit=1';

      const res = await fetch(url, { headers: { 'Accept-Language': 'en' }});
      if (!res.ok) throw new Error('Failed to geocode city');

      const data = await res.json();
      if (!data.length) throw new Error('City not found');

      return {
        name: data[0].display_name.split(',')[0],
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }

    async function fetchOpenMeteo(lat, lon) {
      const url =
        'https://api.open-meteo.com/v1/forecast?latitude=' +
        lat +
        '&longitude=' +
        lon +
        '&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,weathercode&forecast_days=5&timezone=auto';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch weather');

      return res.json();
    }

    function summarizeMeteoHourly(met) {
      const hourly = met.hourly || {};
      const times  = hourly.time || [];
      const temps  = hourly.temperature_2m || [];
      const codes  = hourly.weathercode || [];
      const days = {};

      for (let i = 0; i < times.length; i++) {
        const d = times[i].split('T')[0];
        if (!days[d]) days[d] = [];
        days[d].push({ temp: temps[i], code: codes[i] });
      }

      return Object.keys(days).slice(0,5).map(k => {
        const items = days[k];
        const avg = items.reduce((s,it)=>s+it.temp,0)/items.length;
        const mid = items[Math.floor(items.length/2)];
        const code = mid?.code ?? null;
        const desc = code === 0 ? 'Clear' : code <= 3 ? 'Cloudy' : 'Precip';
        return {
          date: k,
          dateLabel: new Date(k).toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric'}),
          temp: Math.round(avg),
          desc
        };
      });
    }

    function renderCurrent(cityName, met) {
      const cw = met.current_weather || {};
      const temp = cw.temperature ?? '--';
      const wind = cw.windspeed ?? '--';
      const humidity =
        met.hourly?.relativehumidity_2m?.[0] != null
          ? met.hourly.relativehumidity_2m[0]
          : '--';

      const now = new Date();
      const nowStr = now.toLocaleString(undefined, {
        year:'numeric', month:'short', day:'numeric',
        hour:'numeric', minute:'2-digit', second:'2-digit'
      });

      currentCard.innerHTML = `
        <div class="current-top">
          <div style="display:flex;align-items:flex-end;gap:12px;">
            <div class="temp-large">${Math.round(temp)}<span>°C</span></div>
            <div class="current-info">
              <div class="city-name">${cityName}</div>
              <div class="date-line">${nowStr}</div>
            </div>
          </div>
        </div>
        <div class="metric-cards">
          <div class="metric-card">
            <div class="metric-label">Humidity</div>
            <div class="metric-value">${humidity}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Wind</div>
            <div class="metric-value">${wind} m/s</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Feels</div>
            <div class="metric-value">${Math.round(temp)}°C</div>
          </div>
        </div>
      `;
      currentCard.style.display = 'block';
    }

    function renderForecast(list) {
      if (!list || !list.length) {
        forecastSection.style.display = 'none';
        return;
      }
      forecastGrid.innerHTML = '';
      list.forEach(f => {
        const div = document.createElement('div');
        div.className = 'forecast-day';
        div.innerHTML = `
          <div class="date">${f.dateLabel}</div>
          <div class="temp">${f.temp}°C</div>
          <div class="desc">${f.desc}</div>
        `;
        forecastGrid.appendChild(div);
      });
      forecastSection.style.display = 'block';
    }

    async function doSearch(city) {
      if (!city) return;
      city = city.trim();
      if (!city) return;

      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }

      errorBox.style.display = 'none';
      errorBox.textContent = '';
      searchBtn.disabled = true;

      try {
        const geo = await geocodeCity(city);
        const met = await fetchOpenMeteo(geo.lat, geo.lon);

        renderCurrent(geo.name, met);
        const summarized = summarizeMeteoHourly(met);
        renderForecast(summarized);

        refreshTimer = setInterval(async () => {
          try {
            const newMet = await fetchOpenMeteo(geo.lat, geo.lon);
            renderCurrent(geo.name, newMet);
            renderForecast(summarizeMeteoHourly(newMet));
          } catch (e) {
            console.warn('[auto-refresh] failed', e);
          }
        }, AUTO_REFRESH_MS);
      } catch (err) {
        errorBox.textContent = err.message || 'Failed to fetch weather';
        errorBox.style.display = 'block';
        currentCard.style.display = 'none';
        forecastSection.style.display = 'none';
      } finally {
        searchBtn.disabled = false;
      }
    }

    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      doSearch(cityInput.value);
    });

    quickButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        cityInput.value = city;
        doSearch(city);
      });
    });