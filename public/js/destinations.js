// public/js/destinations.js
let allDestinations = [];

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('destinations-grid');
  const searchInput = document.getElementById('search-dest');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Fetch data from backend API
  try {
    const res = await fetch('/api/destinations');
    const json = await res.json();
    if (json.success) {
      allDestinations = json.data;
      renderDestinations(allDestinations);
    }
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center; width:100%;">Error loading destinations. Make sure server is running.</p>';
  }

  // Render function
  function renderDestinations(data) {
    grid.innerHTML = '';
    if (data.length === 0) {
      grid.innerHTML = '<p style="text-align:center; width:100%;">No destinations found matching your search.</p>';
      return;
    }

    data.forEach(dest => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${dest.image}" alt="${dest.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'">
        <div class="card-content">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <h3 class="card-title">${dest.name}</h3>
            <span style="font-size:0.8rem; background:var(--border); padding:4px 8px; border-radius:10px;">${dest.category}</span>
          </div>
          <p class="card-subtitle">${dest.state}</p>
          <p class="card-text">${dest.description}</p>
          <div style="margin-bottom: 15px; font-size: 0.9rem;">
            <strong>Top Attractions:</strong> ${dest.attractions.join(', ')}
          </div>
          <a href="${dest.officialSite}" target="_blank" class="btn btn-primary" style="text-align: center; font-size: 0.9rem;">Explore More</a>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').dataset.category;

    const filtered = allDestinations.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(query) || 
                            d.state.toLowerCase().includes(query) || 
                            d.description.toLowerCase().includes(query);
      const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    renderDestinations(filtered);
  });

  // Filter functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Trigger search input to apply both filters
      searchInput.dispatchEvent(new Event('input'));
    });
  });
});