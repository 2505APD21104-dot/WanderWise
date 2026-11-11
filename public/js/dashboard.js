// public/js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  const spentEl = document.getElementById('dash-spent');
  const countEl = document.getElementById('dash-count');
  const chartContainer = document.getElementById('chart-container');

  // Read expenses from LocalStorage
  const expenses = JSON.parse(localStorage.getItem('wanderwise_expenses')) || [];

  // Update basic stats
  countEl.innerText = expenses.length;
  
  if (expenses.length === 0) {
    return; // Stop here if no expenses
  }

  // Calculate totals by category
  const categories = {};
  let totalSpent = 0;

  expenses.forEach(exp => {
    totalSpent += exp.amount;
    if (categories[exp.category]) {
      categories[exp.category] += exp.amount;
    } else {
      categories[exp.category] = exp.amount;
    }
  });

  spentEl.innerText = '₹' + totalSpent.toLocaleString('en-IN');

  // Render CSS Bar Chart
  chartContainer.innerHTML = '';
  
  // Sort categories by highest spending
  const sortedCategories = Object.keys(categories).sort((a, b) => categories[b] - categories[a]);

  const colors = {
    Transportation: '#3b82f6',
    Accommodation: '#8b5cf6',
    Food: '#f97316',
    Shopping: '#ec4899',
    Attractions: '#10b981',
    'Local Travel': '#64748b',
    Other: '#94a3b8'
  };

  sortedCategories.forEach(cat => {
    const amount = categories[cat];
    const pct = (amount / totalSpent) * 100;
    const color = colors[cat] || '#3b82f6';

    const row = document.createElement('div');
    row.className = 'bar-chart-row';
    row.innerHTML = `
      <div class="bar-label">${cat}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${pct}%; background: ${color};"></div>
      </div>
      <div class="bar-val">₹${amount.toLocaleString('en-IN')}</div>
    `;
    chartContainer.appendChild(row);
  });
});