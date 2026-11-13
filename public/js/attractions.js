// public/js/attractions.js

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('attractions-grid');

  // 1. Load and display attractions
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
              <a href="${attr.mapsLink}" target="_blank" class="btn btn-accent" style="flex:1; text-align:center; padding: 8px; font-size: 0.9rem;">Maps</a>
            </div>
            <button class="btn btn-secondary" style="margin-top: 10px; width: 100%; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border);" onclick="openReviews('${attr.id}', '${attr.name}')">⭐ Ratings & Reviews</button>
          </div>
        `;
        grid.appendChild(card);
      });
    }
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center; width:100%;">Error loading attractions.</p>';
  }

  // 2. Attach form submit listener for reviews
  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const attractionId = document.getElementById('review-attraction-id').value;
    const name = document.getElementById('review-name').value;
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;
  
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attractionId, name, rating, comment })
    });
    
    const json = await res.json();
    if (json.success) {
      document.getElementById('review-form').reset();
      await loadReviews(attractionId); // Reload the list
    } else {
      alert('Failed to submit review.');
    }
  });
});

// 3. Global functions for the Modal (called from HTML onclick)
window.openReviews = async function(id, name) {
  document.getElementById('review-modal').style.display = 'flex';
  document.getElementById('modal-title').innerText = name;
  document.getElementById('review-attraction-id').value = id;
  
  await loadReviews(id);
}

window.closeModal = function() {
  document.getElementById('review-modal').style.display = 'none';
  document.getElementById('review-form').reset();
}

// 4. Function to fetch and render reviews
async function loadReviews(attractionId) {
  const list = document.getElementById('reviews-list');
  const summary = document.getElementById('modal-rating-summary');
  
  list.innerHTML = '<p>Loading reviews...</p>';

  try {
    const res = await fetch(`/api/reviews/${attractionId}`);
    const json = await res.json();

    summary.innerHTML = json.count > 0 
      ? `⭐ ${json.average} out of 5 (${json.count} reviews)` 
      : 'No reviews yet. Be the first!';

    list.innerHTML = '';
    if (json.data.length === 0) return;

    // Sort newest first
    json.data.reverse().forEach(review => {
      const div = document.createElement('div');
      div.style.cssText = 'border-bottom: 1px solid var(--border); padding: 15px 0;';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
          <strong>${review.name}</strong>
          <span style="color: #f59e0b;">${'⭐'.repeat(review.rating)}</span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 5px;">${review.comment}</p>
        <small style="color: #94a3b8; font-size: 0.75rem;">${review.date}</small>
      `;
      list.appendChild(div);
    });
  } catch (err) {
    list.innerHTML = '<p>Error loading reviews.</p>';
  }
}