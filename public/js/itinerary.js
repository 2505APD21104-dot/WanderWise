// public/js/itinerary.js
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('itin-form');
  const destSelect = document.getElementById('itin-dest');
  const results = document.getElementById('itin-results');

  // Populate destinations
  try {
    const res = await fetch('/api/destinations');
    const json = await res.json();
    if (json.success) {
      destSelect.innerHTML = '<option value="">Select Destination</option>';
      json.data.forEach(d => {
        destSelect.innerHTML += `<option value="${d.name}">${d.name}, ${d.state}</option>`;
      });
    }
  } catch (err) {
    destSelect.innerHTML = '<option value="">Error loading</option>';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dest = destSelect.value;
    const days = document.getElementById('itin-days').value;
    const category = document.getElementById('itin-category').value;

    if (!dest) return alert('Please select a destination.');

    results.innerHTML = '<p style="text-align:center;">Generating...</p>';

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: dest, days, category })
      });
      const json = await res.json();

      if (json.success) {
        renderItinerary(json);
      } else {
        results.innerHTML = `<p style="color: red;">${json.error}</p>`;
      }
    } catch (err) {
      results.innerHTML = '<p style="color: red;">Error generating itinerary.</p>';
    }
  });

  function renderItinerary(data) {
    let html = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 style="color:var(--primary);">${data.days}-Day Trip to ${data.destination}</h3>
        <button class="btn btn-accent btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
      </div>
    `;

    data.itinerary.forEach(day => {
      html += `
        <div class="timeline-card">
          <h4>Day ${day.day}</h4>
          <div class="timeline-detail"><strong>Morning:</strong> ${day.morning}</div>
          <div class="timeline-detail"><strong>Afternoon:</strong> ${day.afternoon}</div>
          <div class="timeline-detail"><strong>Evening:</strong> ${day.evening}</div>
          <div class="timeline-detail" style="margin-top:10px; padding-top:10px; border-top:1px dashed var(--border);">
            <strong>Attraction:</strong> ${day.attractions.join(', ')}
          </div>
          <div class="timeline-detail"><strong>Food:</strong> ${day.restaurants.join(', ')}</div>
          <div class="timeline-detail"><strong>Estimated Cost:</strong> ₹${day.estimatedCost} per person</div>
        </div>
      `;
    });

    results.innerHTML = html;
  }
});