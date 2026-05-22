/**
 * about-weather.ts
 * Weather widget + live clock for the About bento cell.
 * Uses Open-Meteo API (no key required).
 */

const WEATHER_IMAGES: Record<string, string> = {
  'clear-day':           '/weather/dia_despejado.png',
  'clear-night':         '/weather/noche_despejada.png',
  'mainly-clear-day':    '/weather/dia_despejado.png',
  'mainly-clear-night':  '/weather/noche_despejada_campo.png',
  'partly-cloudy-day':   '/weather/parcialmente_nublado_dia.png',
  'partly-cloudy-night': '/weather/parcialmente_nublado_noche.png',
  'mostly-cloudy-day':   '/weather/mayormente_nublado_dia.png',
  'mostly-cloudy-night': '/weather/mayormente_nublado_noche.png',
  'overcast-day':        '/weather/dia_nublado.png',
  'overcast-night':      '/weather/mayormente_nublado_noche.png',
  'fog-day':             '/weather/niebla_densa_dia.png',
  'fog-night':           '/weather/niebla_nocturna.png',
  'haze-night':          '/weather/noche_brumosa_costa.png',
  'wind-day':            '/weather/dia_ventoso.png',
  'wind-night':          '/weather/noche_ventosa.png',
  'drizzle-day':         '/weather/lluvia_diurna.png',
  'drizzle-night':       '/weather/lluvia_nocturna.png',
  'rain-day':            '/weather/lluvia_diurna.png',
  'rain-night':          '/weather/lluvia_nocturna.png',
  'snow-day':            '/weather/dia_nevado.png',
  'snow-night':          '/weather/nieve_nocturna.png',
  'storm-day':           '/weather/tormenta_electrica_diurna.png',
  'storm-night':         '/weather/tormenta_electrica_nocturna.png',
  'hot-sunny-day':       '/weather/dia_soleado.png',
};

function getWeatherImage(code: number, isDay: boolean, tempC = 0): string {
  if (isDay && code <= 1 && tempC >= 28) return WEATHER_IMAGES['hot-sunny-day'];
  if (code === 0)  return isDay ? WEATHER_IMAGES['clear-day']         : WEATHER_IMAGES['clear-night'];
  if (code === 1)  return isDay ? WEATHER_IMAGES['mainly-clear-day']  : WEATHER_IMAGES['mainly-clear-night'];
  if (code === 2)  return isDay ? WEATHER_IMAGES['partly-cloudy-day'] : WEATHER_IMAGES['partly-cloudy-night'];
  if (code === 3)  return isDay ? WEATHER_IMAGES['mostly-cloudy-day'] : WEATHER_IMAGES['mostly-cloudy-night'];
  if (code <= 9)   return isDay ? WEATHER_IMAGES['overcast-day']      : WEATHER_IMAGES['overcast-night'];
  if (code <= 29)  return isDay ? WEATHER_IMAGES['wind-day']          : WEATHER_IMAGES['wind-night'];
  if (code <= 49)  return isDay ? WEATHER_IMAGES['fog-day']           : WEATHER_IMAGES['haze-night'];
  if (code <= 59)  return isDay ? WEATHER_IMAGES['drizzle-day']       : WEATHER_IMAGES['drizzle-night'];
  if (code <= 69)  return isDay ? WEATHER_IMAGES['rain-day']          : WEATHER_IMAGES['rain-night'];
  if (code <= 79)  return isDay ? WEATHER_IMAGES['snow-day']          : WEATHER_IMAGES['snow-night'];
  if (code <= 84)  return isDay ? WEATHER_IMAGES['rain-day']          : WEATHER_IMAGES['rain-night'];
  if (code <= 86)  return isDay ? WEATHER_IMAGES['snow-day']          : WEATHER_IMAGES['snow-night'];
  if (code <= 99)  return isDay ? WEATHER_IMAGES['storm-day']         : WEATHER_IMAGES['storm-night'];
  return isDay ? WEATHER_IMAGES['clear-day'] : WEATHER_IMAGES['clear-night'];
}

export function initWeather(): void {
  const weatherTemp   = document.getElementById('weather-temp');
  const weatherDesc   = document.getElementById('weather-desc');
  const weatherFeels  = document.getElementById('weather-feels');
  const weatherCell   = document.getElementById('weather-cell');
  const weatherBgImg  = document.getElementById('weather-bg-img') as HTMLImageElement | null;
  const weatherTimeEl = document.getElementById('weather-time');
  const weatherDateEl = document.getElementById('weather-date');

  // Live clock
  function updateClock() {
    if (!weatherTimeEl || !weatherDateEl) return;
    const now = new Date();
    weatherTimeEl.textContent = now.toLocaleTimeString('en-CA', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'America/Toronto',
    });
    weatherDateEl.textContent = now
      .toLocaleDateString('en-CA', {
        weekday: 'short', month: 'short', day: 'numeric',
        timeZone: 'America/Toronto',
      })
      .replace(',', '.');
  }
  updateClock();
  setInterval(updateClock, 1000);

  if (!weatherTemp || !weatherDesc || !weatherCell) return;

  const feelsLikeLabel   = weatherCell.getAttribute('data-feels-like')   || 'Feels like';
  const unavailableLabel = weatherCell.getAttribute('data-unavailable')  || 'Unavailable';

  const labels = {
    clearDay:     weatherCell.getAttribute('data-clear-day')     || 'Clear sky',
    clearNight:   weatherCell.getAttribute('data-clear-night')   || 'Clear night',
    partlyCloudy: weatherCell.getAttribute('data-partly-cloudy') || 'Partly cloudy',
    foggy:        weatherCell.getAttribute('data-foggy')         || 'Foggy',
    drizzle:      weatherCell.getAttribute('data-drizzle')       || 'Drizzle',
    rain:         weatherCell.getAttribute('data-rain')          || 'Rain',
    snow:         weatherCell.getAttribute('data-snow')          || 'Snow',
    rainShowers:  weatherCell.getAttribute('data-rain-showers')  || 'Rain showers',
    snowShowers:  weatherCell.getAttribute('data-snow-showers')  || 'Snow showers',
    thunderstorm: weatherCell.getAttribute('data-thunderstorm')  || 'Thunderstorm',
  };

  fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=43.65&longitude=-79.38&current=temperature_2m,apparent_temperature,weather_code,is_day&timezone=America/Toronto'
  )
    .then(r => r.json())
    .then(data => {
      const tempC  = Math.round(data.current?.temperature_2m ?? 0);
      const tempF  = Math.round(tempC * 9 / 5 + 32);
      const feelsC = Math.round(data.current?.apparent_temperature ?? tempC);
      const feelsF = Math.round(feelsC * 9 / 5 + 32);
      const code   = data.current?.weather_code ?? 0;
      const isDay  = data.current?.is_day === 1;

      weatherTemp.textContent = `${tempC}°C / ${tempF}°F`;
      if (weatherFeels) weatherFeels.textContent = `${feelsLikeLabel} ${feelsC}°C / ${feelsF}°F`;

      let desc = labels.clearDay;
      if (code === 0)       desc = isDay ? labels.clearDay     : labels.clearNight;
      else if (code <= 3)   desc = labels.partlyCloudy;
      else if (code <= 49)  desc = labels.foggy;
      else if (code <= 59)  desc = labels.drizzle;
      else if (code <= 69)  desc = labels.rain;
      else if (code <= 79)  desc = labels.snow;
      else if (code <= 84)  desc = labels.rainShowers;
      else if (code <= 86)  desc = labels.snowShowers;
      else if (code <= 99)  desc = labels.thunderstorm;
      weatherDesc.textContent = desc;

      if (weatherBgImg) weatherBgImg.src = getWeatherImage(code, isDay, tempC);
    })
    .catch(() => { weatherDesc.textContent = unavailableLabel; });
}
