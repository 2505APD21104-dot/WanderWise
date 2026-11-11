// public/js/restaurants.js
let allRestaurants = [];

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('restaurants-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  try {
    const res = await fetch('/api/restaurants');
    const json = await res.json();
    if (json.success) {
      allRestaurants = json.data;
      render(allRestaurants);
    }
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center; width:100%;">Error loading restaurants.</p>';
  }

  function render(data) {
    grid.innerHTML = '';
    if (data.length === 0) {
      grid.innerHTML = '<p style="text-align:center; width:100%;">No restaurants found.</p>';
      return;
    }

    data.forEach(r => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${r.image}" alt="${r.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'">
        <div class="card-content">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <h3 class="card-title">${r.name}</h3>
            <span style="color: #f59e0b; font-weight: bold;">★ ${r.rating}</span>
          </div>
          <p class="card-subtitle">${r.cuisine} • ${r.city}</p>
          <p class="card-text">${r.popularDishes.join(', ')}</p>
          
          <div style="font-size: 0.9rem; margin-bottom: 15px; font-weight: 600;">
            Cost for two: ₹${r.pricePerPerson * 2}
          </div>
          
          <a href="${r.mapsLink}" target="_blank" class="btn btn-primary" style="text-align:center; padding: 8px;">View on Maps</a>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Filter logic
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const cuisine = e.target.dataset.cuisine;
      if (cuisine === 'All') {
        render(allRestaurants);
      } else {
        const filtered = allRestaurants.filter(r => r.cuisine === cuisine);
        render(filtered);
      }
    });
  });
});