// public/js/budget.js
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('budget-form');
  const destSelect = document.getElementById('dest-city');
  const resultsBox = document.getElementById('budget-results');

  // Populate destinations
  try {
    const res = await fetch('/api/destinations');
    const json = await res.json();
    if (json.success) {
      destSelect.innerHTML = '<option value="">Select Destination</option>';
      json.data.forEach(d => {
        destSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`;
      });
    }
  } catch (err) {
    destSelect.innerHTML = '<option value="">Error loading</option>';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
      startingCity: document.getElementById('start-city').value,
      destination: destSelect.value,
      travellers: document.getElementById('travellers').value,
      days: document.getElementById('days').value,
      category: document.getElementById('category').value
    };

    if (!payload.destination) return alert('Please select a destination.');

    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        renderBudget(json.breakdown);
      } else {
        alert(json.error);
      }
    } catch (err) {
      alert('Error calculating budget.');
    }
  });

  function renderBudget(data) {
    resultsBox.style.display = 'block';
    
    // Formatting function
    const fmt = (num) => '₹' + num.toLocaleString('en-IN');

    // Set text
    document.getElementById('res-transport').innerText = fmt(data.transportation);
    document.getElementById('res-hotel').innerText = fmt(data.hotel);
    document.getElementById('res-food').innerText = fmt(data.food);
    document.getElementById('res-attractions').innerText = fmt(data.attractionFees);
    document.getElementById('res-local').innerText = fmt(data.localTransport + data.additional);
    document.getElementById('res-total').innerText = fmt(data.total);

    // Calculate percentages for progress bars
    const getPct = (val) => (val / data.total) * 100;

    document.getElementById('bar-transport').style.width = getPct(data.transportation) + '%';
    document.getElementById('bar-hotel').style.width = getPct(data.hotel) + '%';
    document.getElementById('bar-food').style.width = getPct(data.food) + '%';
    document.getElementById('bar-attractions').style.width = getPct(data.attractionFees) + '%';
    document.getElementById('bar-local').style.width = getPct(data.localTransport + data.additional) + '%';
  }
});