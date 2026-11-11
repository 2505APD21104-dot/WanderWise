// public/js/expenses.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('expense-form');
  const list = document.getElementById('expense-list');
  const totalEl = document.getElementById('total-expense');

  // Load from LocalStorage
  let expenses = JSON.parse(localStorage.getItem('wanderwise_expenses')) || [];

  function renderExpenses() {
    list.innerHTML = '';
    let total = 0;

    if (expenses.length === 0) {
      list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No expenses recorded yet.</p>';
      totalEl.innerText = '₹0';
      return;
    }

    expenses.forEach((exp, index) => {
      total += exp.amount;
      const div = document.createElement('div');
      div.className = 'expense-item';
      div.innerHTML = `
        <div>
          <h4 style="margin-bottom: 5px;">${exp.name}</h4>
          <span style="font-size: 0.85rem; color: var(--text-muted); background: var(--bg-main); padding: 3px 8px; border-radius: 5px;">${exp.category}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
          <strong>₹${exp.amount}</strong>
          <button class="delete-btn" onclick="deleteExpense(${index})">✕</button>
        </div>
      `;
      list.appendChild(div);
    });

    totalEl.innerText = '₹' + total.toLocaleString('en-IN');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('exp-name').value;
    const category = document.getElementById('exp-category').value;
    const amount = parseInt(document.getElementById('exp-amount').value);

    const newExpense = { id: Date.now(), name, category, amount };
    expenses.push(newExpense);
    
    // Save & Render
    localStorage.setItem('wanderwise_expenses', JSON.stringify(expenses));
    renderExpenses();
    form.reset();
  });

  // Expose delete function to global scope for inline onclick
  window.deleteExpense = function(index) {
    expenses.splice(index, 1);
    localStorage.setItem('wanderwise_expenses', JSON.stringify(expenses));
    renderExpenses();
  };

  // Initial render
  renderExpenses();
});