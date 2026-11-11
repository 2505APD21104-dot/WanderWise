// public/js/attractions.js
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('attractions-grid');

  try {
    const res = await fetch('/api/attractions');
    const json = await res.json();
    
    if (json.success) {
      grid.innerHTML = '';
      json.data.forEach(attr => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <a href="${attr.officialSite}" target="_blank">
            <img src="${attr.image}" alt="${attr.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'">
          </a>
          <div class="card-content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <h3 class="card-title">${attr.name}</h3>
              <span style="font-size:0.8rem; background:var(--bg-main); padding:4px 8px; border-radius:10px;">₹${attr.fee}</span>
            </div>
            <p class="card-subtitle">${attr.city}, ${attr.state}</p>
            <p class="card-text">${attr.description}</p>
            
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">
              <div>🕒 ${attr.hours}</div>
              <div>📍 ${attr.address}</div>
            </div>
            
            <div style="display:flex; gap:10px; margin-top: auto;">
              <a href="${attr.officialSite}" target="_blank" class="btn btn-primary" style="flex:1; text-align:center; padding: 8px; font-size: 0.9rem;">Official Site</a>
              <a href="${attr.mapsLink}" target="_blank" class="btn btn-accent" style="flex:1; text-align:center; padding: 8px; font-size: 0.9rem;">Google Maps</a>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
    }
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center; width:100%;">Error loading attractions.</p>';
  }
});