const state = {
  accounts: [
    { name: 'Main Checking', type: 'debit', balance: 2450 },
    { name: 'Emergency HYSA', type: 'hysa', balance: 9100 },
    { name: 'Roth IRA', type: 'roth_ira', balance: 18350 }
  ],
  expenses: [
    { label: 'Rent', amount: 1600, category: 'Rent' },
    { label: 'Electric', amount: 120, category: 'Bills' },
    { label: 'Groceries', amount: 340, category: 'Food' }
  ],
  goals: [
    { name: 'Travel Fund', target: 4000, saved: 1800 },
    { name: 'New Laptop', target: 2200, saved: 600 }
  ],
  stocks: [{ symbol: 'VOO', price: 482.14 }]
};

const byId = (id) => document.getElementById(id);
const fmt = (n) => `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function renderList(elId, items, renderMeta) {
  const list = byId(elId);
  list.innerHTML = '';
  const tpl = byId('rowTemplate');
  items.forEach((item) => {
    const row = tpl.content.cloneNode(true);
    row.querySelector('.name').textContent = item.name || item.symbol || item.label;
    row.querySelector('.meta').textContent = renderMeta(item);
    list.appendChild(row);
  });
}

function renderAccounts() {
  renderList('accountsList', state.accounts, a => `${a.type.toUpperCase()} • ${fmt(a.balance)}`);
}

function renderGoals() {
  renderList('goalsList', state.goals, g => `${fmt(g.saved)} / ${fmt(g.target)}`);
  goalsChart.data.labels = state.goals.map(g => g.name);
  goalsChart.data.datasets[0].data = state.goals.map(g => g.saved);
  goalsChart.data.datasets[1].data = state.goals.map(g => Math.max(g.target - g.saved, 0));
  goalsChart.update();
}

function renderStocks() {
  renderList('stockList', state.stocks, s => fmt(s.price));
}

function spendingByCategory(multiplier = 1) {
  const totals = {};
  state.expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + (e.amount * multiplier);
  });
  return totals;
}

function updateSpendingChart() {
  const range = byId('spendRange').value;
  const multi = { daily: 1 / 30, weekly: 7 / 30, monthly: 1, yearly: 12 }[range];
  const totals = spendingByCategory(multi);
  spendingChart.data.labels = Object.keys(totals);
  spendingChart.data.datasets[0].data = Object.values(totals);
  spendingChart.update();
}

const spendingChart = new Chart(byId('spendingChart'), {
  type: 'pie',
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#6dd6ff', '#a98bff', '#ff9f6d', '#88f7b4', '#ffe36d', '#f77ecb']
    }]
  }
});

const goalsChart = new Chart(byId('goalsChart'), {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [
      { label: 'Saved', data: [], backgroundColor: '#88f7b4' },
      { label: 'Remaining', data: [], backgroundColor: '#2d3a58' }
    ]
  }
});

byId('accountForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  state.accounts.push({ name: f.get('name'), type: f.get('type'), balance: Number(f.get('balance')) });
  e.target.reset();
  renderAccounts();
});

byId('expenseForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  state.expenses.push({ label: f.get('label'), amount: Number(f.get('amount')), category: f.get('category') });
  e.target.reset();
  updateSpendingChart();
});

byId('goalForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  state.goals.push({ name: f.get('name'), target: Number(f.get('target')), saved: Number(f.get('saved')) });
  e.target.reset();
  renderGoals();
});

byId('stockForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  state.stocks.push({ symbol: String(f.get('symbol')).toUpperCase(), price: Number(f.get('price')) });
  e.target.reset();
  renderStocks();
});

byId('spendRange').addEventListener('change', updateSpendingChart);

byId('connectBankBtn').addEventListener('click', () => {
  alert('Bank linking placeholder. Integrate Plaid, MX, or Teller API here for live transaction sync.');
});

renderAccounts();
renderGoals();
renderStocks();
updateSpendingChart();
