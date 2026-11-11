// public/js/map.js
document.addEventListener('DOMContentLoaded', async () => {
  const statesList = document.getElementById('states-list');
  const mapResults = document.getElementById('map-results');
  let allDestinations = [];

  // Get unique states from destinations data
  try {
    const res = await fetch('/api/destinations');
    const json = await res.json();
    if (json.success) {
      allDestinations = json.data;
      const states = [...new Set(allDestinations.map(d => d.state))].sort();
      renderStates(states);
    }
  } catch (err) {
    statesList.innerHTML = '<p>Error loading data.</p>';
  }

  function renderStates(states) {
    statesList.innerHTML = '';
    states.forEach(state => {
      const btn = document.createElement('div');
      btn.className = 'state-btn';
      btn.textContent = state;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.state-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showDestinationsForState(state);
      });
      statesList.appendChild(btn);
    });
  }

  function showDestinationsForState(state) {
    const filtered = allDestinations.filter(d => d.state === state);
    mapResults.innerHTML = `<h2 style="margin-bottom: 20px; color: var(--primary);">${state}</h2>`;
    
    if (filtered.length === 0) {
      mapResults.innerHTML += '<p>No destinations found for this state yet.</p>';
      return;
    }

    filtered.forEach(dest => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.innerHTML = `
        <img src="${dest.image}" alt="${dest.name}" onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'">
        <div>
          <h3 style="margin-bottom: 5px;">${dest.name}</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 10px;">${dest.description}</p>
          <a href="${dest.officialSite}" target="_blank" class="btn btn-primary" style="padding: 6px 15px; font-size: 0.85rem;">Explore Official Site</a>
        </div>
      `;
      mapResults.appendChild(card);
    });
  }
});