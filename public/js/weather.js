// public/js/weather.js
document.addEventListener('DOMContentLoaded', () => {
  const destSelect = document.getElementById('weather-dest');
  
  // Weather conditions based on city
  const weatherData = {
    'Hyderabad': { temp: '32°C', cond: 'Sunny', icon: '☀️', humid: '45%', wind: '12 km/h' },
    'Jaipur': { temp: '35°C', cond: 'Clear Sky', icon: '🌞', humid: '30%', wind: '10 km/h' },
    'Goa': { temp: '30°C', cond: 'Humid & Breezy', icon: '🌤️', humid: '75%', wind: '20 km/h' },
    'Manali': { temp: '18°C', cond: 'Partly Cloudy', icon: '⛅', humid: '50%', wind: '8 km/h' }
  };

  // Function to update the UI
  function updateWeather(city) {
    const data = weatherData[city] || weatherData['Hyderabad'];
    
    document.getElementById('w-city').innerText = city;
    document.getElementById('w-temp').innerText = data.temp;
    document.getElementById('w-cond').innerText = data.cond;
    document.getElementById('w-icon').innerText = data.icon;
    document.getElementById('w-humid').innerText = data.humid;
    document.getElementById('w-wind').innerText = data.wind;
  }

  // Listen for dropdown changes
  if (destSelect) {
    destSelect.addEventListener('change', (e) => {
      updateWeather(e.target.value);
    });
    
    // Initial load
    updateWeather(destSelect.value);
  }
});