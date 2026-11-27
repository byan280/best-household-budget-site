import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// HomeBudget: a single-file household budget site.
// This program is fully deterministic: it writes the same bytes on every
// run, reads nothing from the environment or the network, and only writes
// out/index.html next to this file.

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "out");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HomeBudget — Household Budget Planner</title>
<style>
:root {
  --bg: #f4f6f8;
  --card: #ffffff;
  --ink: #1c2430;
  --muted: #667085;
  --line: #e4e7ec;
  --green: #12805c;
  --green-soft: #e6f4ef;
  --red: #c4320a;
  --red-soft: #feeceb;
  --amber: #b54708;
  --amber-soft: #fef3e6;
  --blue: #175cd3;
  --blue-soft: #eaf1fe;
  --radius: 14px;
  --shadow: 0 1px 3px rgba(16, 24, 40, 0.08);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.45;
}
header {
  background: var(--ink);
  color: #fff;
  padding: 18px 20px;
}
header .wrap {
  max-width: 1060px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.brand { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
.brand span { color: #7ddba8; }
.tagline { font-size: 13px; color: #cbd5e1; margin-top: 2px; }
.month-nav { display: flex; align-items: center; gap: 8px; }
.month-nav button {
  background: #2a3648;
  color: #fff;
  border: 1px solid #3b4a5f;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 14px;
  cursor: pointer;
}
.month-nav button:hover { background: #35445a; }
.month-label { font-weight: 700; min-width: 150px; text-align: center; }
main {
  max-width: 1060px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  gap: 18px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}
.stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); font-weight: 700; }
.stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-top: 4px; }
.stat-note { font-size: 13px; color: var(--muted); margin-top: 2px; }
.positive { color: var(--green); }
.negative { color: var(--red); }
.grid-2 { display: grid; grid-template-columns: 1.35fr 1fr; gap: 18px; align-items: start; }
h2 { font-size: 17px; margin: 0 0 12px; letter-spacing: -0.01em; }
h3 { font-size: 14px; margin: 0 0 8px; }
.muted { color: var(--muted); font-size: 13px; }
form.add-form { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
form.add-form .full { grid-column: 1 / -1; }
label { display: block; font-size: 12px; font-weight: 700; color: var(--muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
input, select {
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--line);
  border-radius: 9px;
  font-size: 15px;
  background: #fff;
  color: var(--ink);
}
input:focus, select:focus { outline: 2px solid var(--blue); outline-offset: 0; border-color: var(--blue); }
.type-toggle { display: flex; gap: 8px; }
.type-toggle button {
  flex: 1;
  padding: 9px 10px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.type-toggle button.active-expense { background: var(--red-soft); border-color: var(--red); color: var(--red); }
.type-toggle button.active-income { background: var(--green-soft); border-color: var(--green); color: var(--green); }
button.primary {
  background: var(--green);
  color: #fff;
  border: none;
  border-radius: 9px;
  padding: 11px 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
button.primary:hover { background: #0e6b4d; }
button.ghost {
  background: #fff;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
button.ghost:hover { background: #f9fafb; }
.budget-row { padding: 12px 0; border-top: 1px solid var(--line); }
.budget-row:first-of-type { border-top: none; }
.budget-top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.budget-name { font-weight: 700; }
.budget-amounts { font-size: 13px; color: var(--muted); white-space: nowrap; }
.bar { height: 10px; background: #eef2f6; border-radius: 99px; overflow: hidden; margin-top: 8px; }
.bar > div { height: 100%; border-radius: 99px; background: var(--green); transition: width 0.25s ease; }
.bar > div.warn { background: var(--amber); }
.bar > div.over { background: var(--red); }
.budget-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; gap: 10px; }
.budget-foot .left { font-size: 13px; }
.budget-foot input { width: 110px; padding: 6px 8px; font-size: 13px; }
.over-text { color: var(--red); font-weight: 700; font-size: 13px; }
.filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.filters select { width: auto; flex: 1; min-width: 130px; }
.tx { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 11px 0; border-top: 1px solid var(--line); }
.tx:first-of-type { border-top: none; }
.tx-main { min-width: 0; }
.tx-desc { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tx-meta { font-size: 12px; color: var(--muted); }
.tx-amt { font-weight: 800; white-space: nowrap; }
.tx-amt.inc { color: var(--green); }
.tx-amt.exp { color: var(--red); }
.tx-del { background: none; border: none; color: var(--muted); font-size: 18px; cursor: pointer; padding: 4px 6px; line-height: 1; }
.tx-del:hover { color: var(--red); }
.empty { padding: 18px 0; color: var(--muted); font-size: 14px; text-align: center; }
.insight { display: flex; justify-content: space-between; gap: 10px; padding: 8px 0; border-top: 1px solid var(--line); font-size: 14px; }
.insight:first-of-type { border-top: none; }
.insight b { text-align: right; }
.goal-inputs { display: flex; gap: 8px; flex-wrap: wrap; }
.goal-inputs input { flex: 1; min-width: 120px; }
.toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
footer { max-width: 1060px; margin: 0 auto; padding: 0 20px 28px; color: var(--muted); font-size: 12px; }
@media (max-width: 760px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
  .grid-2 { grid-template-columns: 1fr; }
  form.add-form { grid-template-columns: 1fr; }
  .stat-value { font-size: 23px; }
  .month-label { min-width: 120px; }
}
@media (max-width: 420px) {
  .cards { grid-template-columns: 1fr 1fr; gap: 10px; }
  main { padding: 14px; }
}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div>
      <div class="brand">Home<span>Budget</span></div>
      <div class="tagline">Plan the month. Know where every dollar goes.</div>
    </div>
    <div class="month-nav">
      <button id="prevMonth" type="button" aria-label="Previous month">&larr; Prev</button>
      <div class="month-label" id="monthLabel"></div>
      <button id="nextMonth" type="button" aria-label="Next month">Next &rarr;</button>
    </div>
  </div>
</header>
<main>
  <section class="cards" aria-label="Monthly summary">
    <div class="card"><div class="stat-label">Income</div><div class="stat-value positive" id="statIncome">$0</div><div class="stat-note" id="statIncomeNote">0 transactions</div></div>
    <div class="card"><div class="stat-label">Spent</div><div class="stat-value negative" id="statSpent">$0</div><div class="stat-note" id="statSpentNote">0 transactions</div></div>
    <div class="card"><div class="stat-label">Left to spend</div><div class="stat-value" id="statBalance">$0</div><div class="stat-note" id="statBalanceNote">Income minus spending</div></div>
    <div class="card"><div class="stat-label">Savings rate</div><div class="stat-value" id="statRate">0%</div><div class="stat-note" id="statRateNote">Share of income kept</div></div>
  </section>
  <div class="grid-2">
    <section class="card" aria-label="Budget by category">
      <h2>Budget by category</h2>
      <p class="muted">Set a monthly limit per category. Bars turn amber past 85% and red when over budget.</p>
      <div id="budgetList"></div>
    </section>
    <div style="display:grid;gap:18px;">
      <section class="card" aria-label="Add a transaction">
        <h2>Add a transaction</h2>
        <form class="add-form" id="addForm">
          <div class="full">
            <label>Type</label>
            <div class="type-toggle">
              <button type="button" id="typeExpense" class="active-expense">Expense</button>
              <button type="button" id="typeIncome">Income</button>
            </div>
          </div>
          <div class="full">
            <label for="fDesc">Description</label>
            <input id="fDesc" type="text" placeholder="e.g. Weekly groceries" maxlength="80" required>
          </div>
          <div>
            <label for="fAmount">Amount ($)</label>
            <input id="fAmount" type="number" min="0.01" step="0.01" placeholder="0.00" required>
          </div>
          <div>
            <label for="fDate">Date</label>
            <input id="fDate" type="date" required>
          </div>
          <div class="full">
            <label for="fCategory">Category</label>
            <select id="fCategory"></select>
          </div>
          <button class="primary full" type="submit">Add transaction</button>
        </form>
      </section>
      <section class="card" aria-label="Savings goal">
        <h2>Savings goal</h2>
        <div class="goal-inputs">
          <input id="goalName" type="text" maxlength="40" aria-label="Goal name" placeholder="Goal name">
          <input id="goalAmount" type="number" min="1" step="1" aria-label="Goal amount" placeholder="Target $">
        </div>
        <div class="bar" style="margin-top:12px;"><div id="goalBar" style="width:0%"></div></div>
        <p class="muted" id="goalText" style="margin:10px 0 0;"></p>
        <div class="toolbar">
          <button class="ghost" id="saveGoal" type="button">Save goal</button>
          <button class="ghost" id="resetDemo" type="button">Reset demo data</button>
        </div>
      </section>
    </div>
  </div>
  <section class="card" aria-label="Transactions">
    <h2>Transactions</h2>
    <div class="filters">
      <select id="filterType" aria-label="Filter by type">
        <option value="all">All types</option>
        <option value="expense">Expenses</option>
        <option value="income">Income</option>
      </select>
      <select id="filterCategory" aria-label="Filter by category">
        <option value="all">All categories</option>
      </select>
      <input id="filterSearch" type="search" placeholder="Search descriptions..." aria-label="Search descriptions">
    </div>
    <div id="txList"></div>
  </section>
  <section class="card" aria-label="Month insights">
    <h2>This month at a glance</h2>
    <div class="insight"><span>Biggest spending category</span><b id="insightTop">—</b></div>
    <div class="insight"><span>Average daily spending</span><b id="insightDaily">—</b></div>
    <div class="insight"><span>Projected month-end balance</span><b id="insightProjected">—</b></div>
    <div class="insight"><span>Budget categories over limit</span><b id="insightOver">—</b></div>
  </section>
</main>
<footer>HomeBudget stores everything in your own browser (localStorage). No account, no server, no data leaves your device.</footer>
<script>
(function () {
  'use strict';
  var STORE_KEY = 'homebudget-v1';
  var EXPENSE_CATS = [
    { id: 'housing', name: 'Housing', icon: '\u2302', limit: 1200 },
    { id: 'food', name: 'Food & Groceries', icon: '\uD83D\uDED2', limit: 500 },
    { id: 'transport', name: 'Transport', icon: '\uD83D\uDE97', limit: 220 },
    { id: 'utilities', name: 'Utilities & Bills', icon: '\uD83D\uDCA1', limit: 180 },
    { id: 'health', name: 'Health', icon: '\u2764\uFE0F', limit: 120 },
    { id: 'entertainment', name: 'Entertainment', icon: '\uD83C\uDFAC', limit: 100 },
    { id: 'shopping', name: 'Shopping', icon: '\uD83D\uDECD\uFE0F', limit: 150 },
    { id: 'savings', name: 'Savings', icon: '\uD83D\uDCB0', limit: 300 },
    { id: 'other', name: 'Other', icon: '\u2022', limit: 80 }
  ];
  var INCOME_CATS = [
    { id: 'salary', name: 'Salary', icon: '\uD83D\uDCBC' },
    { id: 'freelance', name: 'Freelance', icon: '\uD83D\uDCBB' },
    { id: 'other-income', name: 'Other income', icon: '+' }
  ];
  var ALL_CATS = EXPENSE_CATS.concat(INCOME_CATS);

  function catById(id) {
    for (var i = 0; i < ALL_CATS.length; i++) {
      if (ALL_CATS[i].id === id) return ALL_CATS[i];
    }
    return { id: id, name: 'Other', icon: '\u2022' };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function monthKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
  function dateStr(y, m, day) { return y + '-' + pad(m + 1) + '-' + pad(day); }
  function fmt(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function $(id) { return document.getElementById(id); }

  function defaultState() {
    var budgets = {};
    EXPENSE_CATS.forEach(function (c) { budgets[c.id] = c.limit; });
    return {
      transactions: [],
      budgets: budgets,
      goal: { name: 'Emergency fund', amount: 1000 },
      nextId: 1
    };
  }
  function seedDemo(state, now) {
    var y = now.getFullYear();
    var m = now.getMonth();
    var seed = [
      ['Salary', 4200, 'salary', 'income', 1],
      ['Rent', 1200, 'housing', 'expense', 2],
      ['Weekly groceries', 148.20, 'food', 'expense', 3],
      ['Electricity bill', 86.40, 'utilities', 'expense', 5],
      ['Fuel', 52.00, 'transport', 'expense', 6],
      ['Internet bill', 65.00, 'utilities', 'expense', 8],
      ['Groceries top-up', 96.75, 'food', 'expense', 10],
      ['Movie night', 34.00, 'entertainment', 'expense', 12],
      ['Freelance project', 350, 'freelance', 'income', 14],
      ['Pharmacy', 28.90, 'health', 'expense', 15],
      ['New shoes', 79.99, 'shopping', 'expense', 17],
      ['Transfer to savings', 300, 'savings', 'expense', 18]
    ];
    seed.forEach(function (row) {
      state.transactions.push({
        id: state.nextId++,
        desc: row[0],
        amount: row[1],
        category: row[2],
        type: row[3],
        date: dateStr(y, m, Math.min(row[4], 28))
      });
    });
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) {
        var fresh = defaultState();
        seedDemo(fresh, new Date());
        return fresh;
      }
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.transactions)) return defaultState();
      return parsed;
    } catch (e) {
      return defaultState();
    }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = load();
  var viewDate = new Date();
  viewDate.setDate(1);
  var currentType = 'expense';

  function monthTx() {
    var key = monthKey(viewDate);
    return state.transactions.filter(function (t) { return t.date.slice(0, 7) === key; });
  }
  function sums(list) {
    var inc = 0, exp = 0;
    list.forEach(function (t) {
      if (t.type === 'income') inc += t.amount; else exp += t.amount;
    });
    return { income: inc, spent: exp };
  }
  function spentByCategory(list) {
    var map = {};
    list.forEach(function (t) {
      if (t.type !== 'expense') return;
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }

  function renderSummary() {
    var s = sums(monthTx());
    var balance = s.income - s.spent;
    var rate = s.income > 0 ? Math.max(0, Math.round((balance / s.income) * 100)) : 0;
    var nInc = monthTx().filter(function (t) { return t.type === 'income'; }).length;
    var nExp = monthTx().filter(function (t) { return t.type === 'expense'; }).length;
    $('statIncome').textContent = fmt(s.income);
    $('statIncomeNote').textContent = nInc + (nInc === 1 ? ' transaction' : ' transactions');
    $('statSpent').textContent = fmt(s.spent);
    $('statSpentNote').textContent = nExp + (nExp === 1 ? ' transaction' : ' transactions');
    var balEl = $('statBalance');
    balEl.textContent = fmt(balance);
    balEl.className = 'stat-value ' + (balance < 0 ? 'negative' : 'positive');
    $('statRate').textContent = rate + '%';
    $('statRateNote').textContent = balance >= 0 ? 'Share of income kept' : 'Spending above income';
  }

  function renderBudgets() {
    var spent = spentByCategory(monthTx());
    var html = '';
    EXPENSE_CATS.forEach(function (c) {
      var limit = Number(state.budgets[c.id]) || 0;
      var used = spent[c.id] || 0;
      var pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
      var cls = used > limit ? 'over' : (pct >= 85 ? 'warn' : '');
      var left = limit - used;
      var leftText = left >= 0
        ? fmt(left) + ' left'
        : '<span class="over-text">' + fmt(-left) + ' over budget</span>';
      html += '<div class="budget-row">'
        + '<div class="budget-top"><span class="budget-name">' + c.icon + ' ' + esc(c.name) + '</span>'
        + '<span class="budget-amounts">' + fmt(used) + ' of ' + fmt(limit) + '</span></div>'
        + '<div class="bar"><div class="' + cls + '" style="width:' + pct + '%"></div></div>'
        + '<div class="budget-foot"><span class="left">' + leftText + '</span>'
        + '<label style="display:flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0;">Limit $'
        + '<input type="number" min="0" step="1" data-budget="' + c.id + '" value="' + limit + '" aria-label="' + esc(c.name) + ' monthly limit">'
        + '</label></div></div>';
    });
    $('budgetList').innerHTML = html;
  }

  function renderTransactions() {
    var typeF = $('filterType').value;
    var catF = $('filterCategory').value;
    var q = $('filterSearch').value.trim().toLowerCase();
    var list = monthTx().slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.id - a.id;
    });
    var rows = list.filter(function (t) {
      if (typeF !== 'all' && t.type !== typeF) return false;
      if (catF !== 'all' && t.category !== catF) return false;
      if (q && t.desc.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    if (!rows.length) {
      $('txList').innerHTML = '<div class="empty">No transactions match. Add one above, or try another month.</div>';
      return;
    }
    var html = '';
    rows.forEach(function (t) {
      var c = catById(t.category);
      var sign = t.type === 'income' ? '+' : '-';
      html += '<div class="tx"><div class="tx-main"><div class="tx-desc">' + esc(t.desc) + '</div>'
        + '<div class="tx-meta">' + c.icon + ' ' + esc(c.name) + ' &middot; ' + esc(t.date) + '</div></div>'
        + '<span class="tx-amt ' + (t.type === 'income' ? 'inc' : 'exp') + '">' + sign + fmt(t.amount) + '</span>'
        + '<button class="tx-del" type="button" data-del="' + t.id + '" aria-label="Delete ' + esc(t.desc) + '">&times;</button></div>';
    });
    $('txList').innerHTML = html;
  }

  function renderGoal() {
    var s = sums(monthTx());
    var kept = Math.max(0, s.income - s.spent);
    var target = Number(state.goal.amount) || 0;
    var pct = target > 0 ? Math.min(100, Math.round((kept / target) * 100)) : 0;
    $('goalName').value = state.goal.name || '';
    $('goalAmount').value = target > 0 ? target : '';
    $('goalBar').style.width = pct + '%';
    $('goalText').textContent = fmt(kept) + ' of ' + fmt(target) + ' saved this month (' + pct + '%).';
  }

  function renderInsights() {
    var list = monthTx();
    var s = sums(list);
    var spent = spentByCategory(list);
    var topId = null, topAmt = 0;
    Object.keys(spent).forEach(function (id) {
      if (spent[id] > topAmt) { topAmt = spent[id]; topId = id; }
    });
    $('insightTop').textContent = topId ? catById(topId).name + ' (' + fmt(topAmt) + ')' : '—';
    var today = new Date();
    var inViewMonth = today.getFullYear() === viewDate.getFullYear() && today.getMonth() === viewDate.getMonth();
    var dayCount = inViewMonth ? Math.max(1, today.getDate()) : daysInMonth(viewDate);
    $('insightDaily').textContent = fmt(s.spent / dayCount) + ' per day';
    var daysLeft = daysInMonth(viewDate) - dayCount;
    var projected = (s.income - s.spent) - (s.spent / dayCount) * daysLeft;
    $('insightProjected').textContent = fmt(projected);
    var over = EXPENSE_CATS.filter(function (c) {
      return (spent[c.id] || 0) > (Number(state.budgets[c.id]) || 0);
    }).length;
    $('insightOver').textContent = over === 0 ? 'None — all within budget' : String(over);
  }
  function daysInMonth(d) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  }

  function renderMonthLabel() {
    $('monthLabel').textContent = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  function renderCategoryOptions() {
    var cats = currentType === 'expense' ? EXPENSE_CATS : INCOME_CATS;
    $('fCategory').innerHTML = cats.map(function (c) {
      return '<option value="' + c.id + '">' + c.icon + ' ' + esc(c.name) + '</option>';
    }).join('');
    var all = $('filterCategory');
    var keep = all.value;
    all.innerHTML = '<option value="all">All categories</option>' + ALL_CATS.map(function (c) {
      return '<option value="' + c.id + '">' + c.icon + ' ' + esc(c.name) + '</option>';
    }).join('');
    all.value = keep || 'all';
  }
  function renderAll() {
    renderMonthLabel();
    renderSummary();
    renderBudgets();
    renderTransactions();
    renderGoal();
    renderInsights();
  }

  function setType(t) {
    currentType = t;
    $('typeExpense').className = t === 'expense' ? 'active-expense' : '';
    $('typeIncome').className = t === 'income' ? 'active-income' : '';
    renderCategoryOptions();
  }

  $('typeExpense').addEventListener('click', function () { setType('expense'); });
  $('typeIncome').addEventListener('click', function () { setType('income'); });
  $('prevMonth').addEventListener('click', function () {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderAll();
  });
  $('nextMonth').addEventListener('click', function () {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderAll();
  });
  $('addForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var desc = $('fDesc').value.trim();
    var amount = Number($('fAmount').value);
    var date = $('fDate').value;
    if (!desc || !(amount > 0) || !date) return;
    state.transactions.push({
      id: state.nextId++,
      desc: desc,
      amount: Math.round(amount * 100) / 100,
      category: $('fCategory').value,
      type: currentType,
      date: date
    });
    save();
    var parts = date.split('-');
    viewDate = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    $('fDesc').value = '';
    $('fAmount').value = '';
    renderAll();
  });
  $('txList').addEventListener('click', function (ev) {
    var btn = ev.target.closest ? ev.target.closest('[data-del]') : null;
    if (!btn) return;
    var id = Number(btn.getAttribute('data-del'));
    state.transactions = state.transactions.filter(function (t) { return t.id !== id; });
    save();
    renderAll();
  });
  $('budgetList').addEventListener('change', function (ev) {
    var input = ev.target.closest ? ev.target.closest('[data-budget]') : null;
    if (!input) return;
    var limit = Math.max(0, Number(input.value) || 0);
    state.budgets[input.getAttribute('data-budget')] = limit;
    save();
    renderAll();
  });
  ['filterType', 'filterCategory'].forEach(function (id) {
    $(id).addEventListener('change', renderTransactions);
  });
  $('filterSearch').addEventListener('input', renderTransactions);
  $('saveGoal').addEventListener('click', function () {
    state.goal = {
      name: $('goalName').value.trim() || 'Savings goal',
      amount: Math.max(0, Number($('goalAmount').value) || 0)
    };
    save();
    renderAll();
  });
  $('resetDemo').addEventListener('click', function () {
    var fresh = defaultState();
    seedDemo(fresh, new Date());
    state = fresh;
    viewDate = new Date();
    viewDate.setDate(1);
    save();
    setType('expense');
    renderAll();
  });

  $('fDate').value = dateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  setType('expense');
  renderAll();
})();
</script>
</body>
</html>`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html, "utf8");
console.log("wrote out/index.html (" + Buffer.byteLength(html, "utf8") + " bytes)");
