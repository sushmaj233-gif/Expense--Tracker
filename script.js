const balance = document.getElementById("balance");
const moneyPlus = document.getElementById("money-plus");
const moneyMinus = document.getElementById("money-minus");
const savingRate = document.getElementById("saving-rate");
const status = document.getElementById("status");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");
const search = document.getElementById("search");
const filterCategory = document.getElementById("filter-category");
const filterType = document.getElementById("filter-type");
const clearBtn = document.getElementById("clearBtn");
const transactionCount = document.getElementById("transaction-count");
const emptyState = document.getElementById("empty-state");
const chart = document.getElementById("category-chart");
const chartEmpty = document.getElementById("chart-empty");

let transactions = JSON.parse(localStorage.getItem("expenseFlowTransactions") || "[]");

date.value = new Date().toISOString().split("T")[0];

function formatMoney(value) {
  return `₹${Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function save() {
  localStorage.setItem("expenseFlowTransactions", JSON.stringify(transactions));
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function filteredTransactions() {
  const term = search.value.trim().toLowerCase();
  return transactions.filter(t => {
    const matchesSearch = !term || `${t.text} ${t.category} ${t.date}`.toLowerCase().includes(term);
    const matchesCategory = filterCategory.value === "all" || t.category === filterCategory.value;
    const matchesType = filterType.value === "all" || t.type === filterType.value;
    return matchesSearch && matchesCategory && matchesType;
  });
}

function renderTransactions() {
  list.innerHTML = "";
  const visible = filteredTransactions();
  emptyState.style.display = visible.length ? "none" : "block";
  transactionCount.textContent = `${visible.length} of ${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`;

  visible.slice().reverse().forEach(t => {
    const originalIndex = transactions.indexOf(t);
    const li = document.createElement("li");
    const sign = t.type === "income" ? "+" : "-";
    li.innerHTML = `
      <div class="transaction-main">
        <strong>${escapeHTML(t.text)}</strong>
        <div class="meta">
          <span>${escapeHTML(t.category)}</span><span>•</span><span>${escapeHTML(t.date)}</span>
        </div>
      </div>
      <span class="amount ${t.type}">${sign}${formatMoney(t.amount)}</span>
      <button class="delete-btn" type="button" data-index="${originalIndex}" aria-label="Delete transaction">Delete</button>
    `;
    list.appendChild(li);
  });
}

function updateSummary() {
  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = income - expenses;
  const rate = income ? Math.max(0, (currentBalance / income) * 100) : 0;

  balance.textContent = currentBalance < 0 ? `-${formatMoney(currentBalance)}` : formatMoney(currentBalance);
  moneyPlus.textContent = formatMoney(income);
  moneyMinus.textContent = formatMoney(expenses);
  savingRate.textContent = `${rate.toFixed(0)}%`;

  if (!transactions.length) status.textContent = "Add your first transaction to get started.";
  else if (currentBalance > 0) status.textContent = "You're currently spending less than you earn.";
  else if (currentBalance === 0) status.textContent = "Your income and expenses are currently balanced.";
  else status.textContent = "Your expenses are currently higher than your income.";
}

function updateChart() {
  const totals = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  chart.innerHTML = "";
  chartEmpty.style.display = rows.length ? "none" : "block";
  if (!rows.length) return;

  const max = rows[0][1];
  rows.forEach(([name, value]) => {
    const row = document.createElement("div");
    row.className = "chart-row";
    row.innerHTML = `
      <span class="chart-label">${escapeHTML(name)}</span>
      <div class="bar-track"><div class="bar" style="width:${(value / max) * 100}%"></div></div>
      <span class="chart-value">${formatMoney(value)}</span>
    `;
    chart.appendChild(row);
  });
}

function render() {
  updateSummary();
  renderTransactions();
  updateChart();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const numericAmount = Number(amount.value);
  if (!text.value.trim() || !numericAmount || numericAmount <= 0 || !date.value) return;

  transactions.push({
    id: Date.now(),
    text: text.value.trim(),
    amount: numericAmount,
    type: type.value,
    category: category.value,
    date: date.value
  });

  save();
  form.reset();
  type.value = "expense";
  date.value = new Date().toISOString().split("T")[0];
  render();
  text.focus();
});

list.addEventListener("click", event => {
  const button = event.target.closest(".delete-btn");
  if (!button) return;
  transactions.splice(Number(button.dataset.index), 1);
  save();
  render();
});

clearBtn.addEventListener("click", () => {
  if (!transactions.length) return;
  if (confirm("Delete all transactions? This cannot be undone.")) {
    transactions = [];
    save();
    render();
  }
});

[search, filterCategory, filterType].forEach(control => {
  control.addEventListener("input", renderTransactions);
  control.addEventListener("change", renderTransactions);
});

render();
