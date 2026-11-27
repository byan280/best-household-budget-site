// Household Budget Planner — a single-page household budget site.
//
// main.ts generates one self-contained index.html into the output
// directory named by MAKEFUN_OUTPUT_DIR (default ./output). The page is
// a working budget app: monthly summary, category budgets with progress
// bars, a transaction ledger with add / delete / filter, and insights.
// All state lives in the browser (localStorage). No network, no input
// files, no randomness, no clock reads at build time: every run writes
// byte-identical output.
//
// Run: node main.ts
// Runtime: node22 type-stripping (this file uses only plain JavaScript
// syntax so it runs unchanged under type-stripping).

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "./output";

const PART1 = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Household Budget Planner</title>
<meta name="description" content="Plan a household budget: track income and spending by category, stay inside monthly limits, and see where every dollar goes.">
<style>
:root {
  --bg: #f4f6f8;
  --card: #ffffff;
  --ink: #1c2530;
  --muted: #64748b;
  --line: #e2e8f0;
  --green: #15803d;
  --green-bg: #dcfce7;
  --red: #b91c1c;
  --red-bg: #fee2e2;
  --blue: #1d4ed8;
  --blue-bg: #dbeafe;
  --amber: #b45309;
  --amber-bg: #fef3c7;
  --radius: 14px;
  --shadow: 0 1px 3px rgba(15, 23, 42, 0.08), 0 4px 14px rgba(15, 23, 42, 0.05);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.5;
}
header.top {
  background: #0f172a;
  color: #f8fafc;
  padding: 28px 20px 22px;
}
header.top .wrap, main.wrap, footer.wrap { max-width: 1060px; margin: 0 auto; }
header.top h1 { margin: 0 0 4px; font-size: 28px; letter-spacing: -0.02em; }
header.top p { margin: 0; color: #cbd5e1; font-size: 15px; }
main.wrap { padding: 20px; }
footer.wrap { padding: 0 20px 28px; color: var(--muted); font-size: 13px; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px 20px;
  margin-bottom: 18px;
}
.card h2 { margin: 0 0 12px; font-size: 18px; letter-spacing: -0.01em; }
.card h3 { margin: 18px 0 8px; font-size: 15px; }
.grid-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}
.stat { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px 18px; }
.stat .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 4px; }
.stat .value { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
.stat .sub { font-size: 13px; color: var(--muted); margin-top: 2px; }
.stat .value.good { color: var(--green); }
.stat .value.bad { color: var(--red); }
.toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: end; margin-bottom: 14px; }
.toolbar .field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--muted); }
select, input[type="text"], input[type="number"], input[type="date"] {
  font: inherit; font-size: 14px; color: var(--ink);
  border: 1px solid var(--line); border-radius: 9px; padding: 8px 10px; background: #fff; min-width: 0;
}
button {
  font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
  border: 1px solid transparent; border-radius: 9px; padding: 9px 14px;
}
button.primary { background: #0f172a; color: #fff; }
button.primary:hover { background: #1e293b; }
button.ghost { background: #fff; border-color: var(--line); color: var(--ink); }
button.ghost:hover { background: #f8fafc; }
button.danger { background: #fff; border-color: #fecaca; color: var(--red); padding: 5px 10px; font-size: 13px; }
button.danger:hover { background: var(--red-bg); }
.budget-row { margin-bottom: 14px; }
.budget-row:last-child { margin-bottom: 0; }
.budget-head { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; }
.budget-head .name { font-weight: 600; }
.budget-head .nums { color: var(--muted); white-space: nowrap; }
.budget-head .nums b { color: var(--ink); }
.bar { height: 10px; background: #eef2f7; border-radius: 99px; overflow: hidden; margin-top: 6px; }
.bar > span { display: block; height: 100%; background: var(--green); border-radius: 99px; }
.bar > span.warn { background: var(--amber); }
.bar > span.over { background: var(--red); }
.budget-foot { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-top: 4px; }
.budget-foot .left { color: var(--green); font-weight: 600; }
.budget-foot .left.over { color: var(--red); }
table.ledger { width: 100%; border-collapse: collapse; font-size: 14px; }
table.ledger th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); padding: 8px 10px; border-bottom: 2px solid var(--line); }
table.ledger td { padding: 9px 10px; border-bottom: 1px solid var(--line); vertical-align: middle; }
table.ledger tr:last-child td { border-bottom: none; }
table.ledger td.amount { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
table.ledger td.amount.in { color: var(--green); font-weight: 600; }
table.ledger td.amount.out { color: var(--red); font-weight: 600; }
.tag { display: inline-block; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 99px; }
.tag.income { background: var(--green-bg); color: var(--green); }
.tag.expense { background: var(--red-bg); color: var(--red); }
.tag.cat { background: var(--blue-bg); color: var(--blue); }
.empty { color: var(--muted); font-size: 14px; padding: 12px 0 4px; }
.form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 10px; align-items: end; }
.form-grid .field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--muted); }
.insights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.insight { border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; background: #fbfdff; }
.insight .k { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
.insight .v { font-size: 16px; font-weight: 700; margin-top: 2px; }
.insight .d { font-size: 13px; color: var(--muted); margin-top: 2px; }
.hint { font-size: 13px; color: var(--muted); margin-top: 10px; }
@media (max-width: 760px) {
  .grid-summary { grid-template-columns: repeat(2, 1fr); }
  .insights { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr 1fr; }
  header.top h1 { font-size: 24px; }
  table.ledger th:nth-child(3), table.ledger td:nth-child(3) { display: none; }
}
</style>
</head>
`;

const PART2 = `<body>
<header class="top">
  <div class="wrap">
    <h1>Household Budget Planner</h1>
    <p>Know where every dollar goes. Set limits by category, track income and spending, and finish the month with money left over.</p>
  </div>
</header>
<main class="wrap">

  <div class="toolbar" role="region" aria-label="Month picker">
    <label class="field">Month
      <select id="monthSelect" aria-label="Month"></select>
    </label>
    <button class="ghost" id="sampleBtn" type="button">Reload sample data</button>
    <button class="ghost" id="clearBtn" type="button">Clear all transactions</button>
  </div>

  <section class="grid-summary" aria-label="Monthly summary">
    <div class="stat"><div class="label">Income</div><div class="value good" id="statIncome">$0.00</div><div class="sub" id="statIncomeSub"></div></div>
    <div class="stat"><div class="label">Spending</div><div class="value bad" id="statSpending">$0.00</div><div class="sub" id="statSpendingSub"></div></div>
    <div class="stat"><div class="label">Left to spend</div><div class="value" id="statLeft">$0.00</div><div class="sub" id="statLeftSub"></div></div>
    <div class="stat"><div class="label">Savings rate</div><div class="value" id="statRate">0%</div><div class="sub">share of income not spent</div></div>
  </section>

  <section class="card" aria-label="Budgets by category">
    <h2>Budgets by category</h2>
    <div id="budgetList"></div>
    <p class="hint">Budgets are monthly limits. Edit a limit and it applies to every month. Bars turn amber past 80% and red when the limit is passed.</p>
  </section>

  <section class="card" aria-label="Add a transaction">
    <h2>Add a transaction</h2>
    <form id="addForm" class="form-grid">
      <label class="field">Description
        <input type="text" id="fDesc" required maxlength="80" placeholder="e.g. Weekly groceries" autocomplete="off">
      </label>
      <label class="field">Amount ($)
        <input type="number" id="fAmount" required min="0.01" step="0.01" placeholder="0.00" inputmode="decimal">
      </label>
      <label class="field">Type
        <select id="fType">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <label class="field">Category
        <select id="fCategory"></select>
      </label>
      <label class="field">Date
        <input type="date" id="fDate" required>
      </label>
      <button class="primary" type="submit">Add</button>
    </form>
  </section>

  <section class="card" aria-label="Transactions">
    <h2>Transactions</h2>
    <div class="toolbar" role="region" aria-label="Filters">
      <label class="field">Search
        <input type="text" id="q" placeholder="Search descriptions" autocomplete="off">
      </label>
      <label class="field">Type
        <select id="filterType">
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>
      <label class="field">Category
        <select id="filterCat">
          <option value="all">All categories</option>
        </select>
      </label>
    </div>
    <table class="ledger">
      <thead>
        <tr><th>Description</th><th>Category</th><th>Date</th><th style="text-align:right">Amount</th><th><span style="display:none">Actions</span></th></tr>
      </thead>
      <tbody id="ledgerBody"></tbody>
    </table>
    <p class="empty" id="ledgerEmpty" hidden>No transactions match these filters.</p>
  </section>

  <section class="card" aria-label="Insights">
    <h2>This month at a glance</h2>
    <div class="insights">
      <div class="insight"><div class="k">Biggest expense category</div><div class="v" id="insTopCat">—</div><div class="d" id="insTopCatD"></div></div>
      <div class="insight"><div class="k">Average daily spending</div><div class="v" id="insDaily">—</div><div class="d">across days with spending</div></div>
      <div class="insight"><div class="k">Projected month-end</div><div class="v" id="insProj">—</div><div class="d" id="insProjD"></div></div>
    </div>
    <p class="hint">Your data never leaves this browser: it is stored only in localStorage on this device. No account, no tracking, no network requests.</p>
  </section>

</main>
<footer class="wrap">
  <p>Household Budget Planner — a single self-contained page. Add income and expenses, watch each category against its monthly limit, and keep the month in balance.</p>
</footer>
`;

const PART3 = `<script>
"use strict";
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var EXPENSE_CATS = [
  { name: "Housing", budget: 1400 },
  { name: "Groceries", budget: 600 },
  { name: "Transport", budget: 250 },
  { name: "Utilities", budget: 220 },
  { name: "Dining Out", budget: 200 },
  { name: "Entertainment", budget: 120 },
  { name: "Health", budget: 150 },
  { name: "Savings", budget: 500 },
  { name: "Other", budget: 100 }
];
var INCOME_CATS = ["Salary", "Other income"];
var STORE_KEY = "household-budget-v1";
var SAMPLE = [
  { id: "tx1", desc: "Monthly salary", amount: 4200, type: "income", cat: "Salary", date: "2026-11-01" },
  { id: "tx2", desc: "Rent", amount: 1400, type: "expense", cat: "Housing", date: "2026-11-01" },
  { id: "tx3", desc: "Electric bill", amount: 118, type: "expense", cat: "Utilities", date: "2026-11-02" },
  { id: "tx4", desc: "Weekly groceries", amount: 142.6, type: "expense", cat: "Groceries", date: "2026-11-03" },
  { id: "tx5", desc: "Fuel", amount: 48, type: "expense", cat: "Transport", date: "2026-11-05" },
  { id: "tx6", desc: "Weekly groceries", amount: 86.4, type: "expense", cat: "Groceries", date: "2026-11-06" },
  { id: "tx7", desc: "Dinner with friends", amount: 64, type: "expense", cat: "Dining Out", date: "2026-11-07" },
  { id: "tx8", desc: "Bus pass", amount: 60, type: "expense", cat: "Transport", date: "2026-11-08" },
  { id: "tx9", desc: "Internet bill", amount: 79.99, type: "expense", cat: "Utilities", date: "2026-11-10" },
  { id: "tx10", desc: "Weekly groceries", amount: 121.35, type: "expense", cat: "Groceries", date: "2026-11-11" },
  { id: "tx11", desc: "Movie night", amount: 32, type: "expense", cat: "Entertainment", date: "2026-11-12" },
  { id: "tx12", desc: "Pharmacy", amount: 28.5, type: "expense", cat: "Health", date: "2026-11-13" },
  { id: "tx13", desc: "Freelance work", amount: 350, type: "income", cat: "Other income", date: "2026-11-14" },
  { id: "tx14", desc: "Gym membership", amount: 45, type: "expense", cat: "Health", date: "2026-11-15" },
  { id: "tx15", desc: "Weekly groceries", amount: 98.2, type: "expense", cat: "Groceries", date: "2026-11-16" },
  { id: "tx16", desc: "Takeout", amount: 38.75, type: "expense", cat: "Dining Out", date: "2026-11-17" },
  { id: "tx17", desc: "Car insurance", amount: 112, type: "expense", cat: "Transport", date: "2026-11-19" },
  { id: "tx18", desc: "Weekly groceries", amount: 134.8, type: "expense", cat: "Groceries", date: "2026-11-21" },
  { id: "tx19", desc: "Streaming subscription", amount: 15.99, type: "expense", cat: "Entertainment", date: "2026-11-22" },
  { id: "tx20", desc: "Savings transfer", amount: 500, type: "expense", cat: "Savings", date: "2026-11-24" },
  { id: "tx21", desc: "Lunch", amount: 18.5, type: "expense", cat: "Dining Out", date: "2026-11-25" },
  { id: "tx22", desc: "Water bill", amount: 42, type: "expense", cat: "Utilities", date: "2026-11-26" },
  { id: "tx23", desc: "Weekly groceries", amount: 76.45, type: "expense", cat: "Groceries", date: "2026-11-27" }
];

function defaultState() {
  var budgets = {};
  EXPENSE_CATS.forEach(function (c) { budgets[c.name] = c.budget; });
  return { transactions: SAMPLE.slice(), budgets: budgets, nextId: 24 };
}
function load() {
  try {
    var raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    var s = JSON.parse(raw);
    if (!s || !Array.isArray(s.transactions) || typeof s.budgets !== "object") return defaultState();
    if (typeof s.nextId !== "number") s.nextId = s.transactions.length + 1;
    return s;
  } catch (e) { return defaultState(); }
}
function save() {
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}
var state = load();
var selectedMonth = null;

function fmt(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function monthKey(d) { return d.slice(0, 7); }
function monthLabel(key) {
  var parts = key.split("-");
  return MONTHS[parseInt(parts[1], 10) - 1] + " " + parts[0];
}
function monthTx(key) {
  return state.transactions.filter(function (t) { return monthKey(t.date) === key; });
}
function allMonths() {
  var seen = {};
  state.transactions.forEach(function (t) { seen[monthKey(t.date)] = true; });
  var now = new Date();
  var cur = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  seen[cur] = true;
  return Object.keys(seen).sort();
}
function renderMonths() {
  var sel = document.getElementById("monthSelect");
  var months = allMonths();
  sel.innerHTML = months.map(function (m) {
    return '<option value="' + m + '"' + (m === selectedMonth ? " selected" : "") + ">" + monthLabel(m) + "</option>";
  }).join("");
}
function renderSummary() {
  var txs = monthTx(selectedMonth);
  var income = 0, spending = 0;
  txs.forEach(function (t) { if (t.type === "income") income += t.amount; else spending += t.amount; });
  var left = income - spending;
  var rate = income > 0 ? Math.max(0, Math.round((left / income) * 100)) : 0;
  document.getElementById("statIncome").textContent = fmt(income);
  document.getElementById("statIncomeSub").textContent = txs.filter(function (t) { return t.type === "income"; }).length + " deposits";
  document.getElementById("statSpending").textContent = fmt(spending);
  document.getElementById("statSpendingSub").textContent = txs.filter(function (t) { return t.type === "expense"; }).length + " purchases";
  var leftEl = document.getElementById("statLeft");
  leftEl.textContent = fmt(left);
  leftEl.className = "value " + (left < 0 ? "bad" : "good");
  document.getElementById("statLeftSub").textContent = left < 0 ? "over budget for this month" : "available after spending";
  document.getElementById("statRate").textContent = rate + "%";
}
function renderBudgets() {
  var txs = monthTx(selectedMonth);
  var spent = {};
  txs.forEach(function (t) { if (t.type === "expense") spent[t.cat] = (spent[t.cat] || 0) + t.amount; });
  var html = "";
  EXPENSE_CATS.forEach(function (c) {
    var limit = typeof state.budgets[c.name] === "number" ? state.budgets[c.name] : c.budget;
    var used = spent[c.name] || 0;
    var pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : (used > 0 ? 100 : 0);
    var cls = used > limit ? "over" : (pct >= 80 ? "warn" : "");
    var remain = limit - used;
    html += '<div class="budget-row">';
    html += '<div class="budget-head"><span class="name">' + esc(c.name) + '</span><span class="nums"><b>' + fmt(used) + "</b> of " + fmt(limit) + "</span></div>";
    html += '<div class="bar"><span class="' + cls + '" style="width:' + pct + '%"></span></div>';
    html += '<div class="budget-foot"><span class="left' + (remain < 0 ? " over" : "") + '">' + (remain < 0 ? fmt(-remain) + " over limit" : fmt(remain) + " left") + "</span>";
    html += '<span>Monthly limit $ <input type="number" class="limitInput" data-cat="' + esc(c.name) + '" value="' + limit + '" min="0" step="10" style="width:90px" aria-label="Monthly limit for ' + esc(c.name) + '"></span></div>';
    html += "</div>";
  });
  document.getElementById("budgetList").innerHTML = html;
  document.querySelectorAll(".limitInput").forEach(function (input) {
    input.addEventListener("change", function () {
      var v = parseFloat(input.value);
      if (isNaN(v) || v < 0) { renderBudgets(); return; }
      state.budgets[input.getAttribute("data-cat")] = Math.round(v * 100) / 100;
      save();
      renderAll();
    });
  });
}
function renderLedger() {
  var q = document.getElementById("q").value.trim().toLowerCase();
  var ft = document.getElementById("filterType").value;
  var fc = document.getElementById("filterCat").value;
  var txs = monthTx(selectedMonth).filter(function (t) {
    if (ft !== "all" && t.type !== ft) return false;
    if (fc !== "all" && t.cat !== fc) return false;
    if (q && t.desc.toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
  txs.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  });
  var html = "";
  txs.forEach(function (t) {
    html += "<tr><td>" + esc(t.desc) + ' <span class="tag ' + t.type + '">' + t.type + "</span></td>";
    html += '<td><span class="tag cat">' + esc(t.cat) + "</span></td>";
    html += "<td>" + esc(t.date) + "</td>";
    html += '<td class="amount ' + (t.type === "income" ? "in" : "out") + '">' + (t.type === "income" ? "+" : "-") + fmt(t.amount) + "</td>";
    html += '<td style="text-align:right"><button class="danger" type="button" data-del="' + esc(t.id) + '">Delete</button></td></tr>';
  });
  document.getElementById("ledgerBody").innerHTML = html;
  document.getElementById("ledgerEmpty").hidden = txs.length !== 0;
}
function renderInsights() {
  var txs = monthTx(selectedMonth);
  var byCat = {};
  var days = {};
  var spending = 0;
  txs.forEach(function (t) {
    if (t.type !== "expense") return;
    spending += t.amount;
    byCat[t.cat] = (byCat[t.cat] || 0) + t.amount;
    days[t.date] = true;
  });
  var topCat = "—", topAmt = 0;
  Object.keys(byCat).forEach(function (c) { if (byCat[c] > topAmt) { topAmt = byCat[c]; topCat = c; } });
  document.getElementById("insTopCat").textContent = topCat;
  document.getElementById("insTopCatD").textContent = topAmt > 0 ? fmt(topAmt) + " spent" : "no spending yet";
  var nDays = Object.keys(days).length;
  var avg = nDays > 0 ? spending / nDays : 0;
  document.getElementById("insDaily").textContent = fmt(avg);
  var now = new Date();
  var curKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  if (selectedMonth === curKey) {
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var left = Math.max(0, daysInMonth - now.getDate());
    var proj = spending + avg * left;
    document.getElementById("insProj").textContent = fmt(proj);
    document.getElementById("insProjD").textContent = "if the daily average holds for " + left + " more days";
  } else {
    document.getElementById("insProj").textContent = fmt(spending);
    document.getElementById("insProjD").textContent = "final total for a past month";
  }
}
function renderCatOptions() {
  var type = document.getElementById("fType").value;
  var cats = type === "income" ? INCOME_CATS : EXPENSE_CATS.map(function (c) { return c.name; });
  document.getElementById("fCategory").innerHTML = cats.map(function (c) {
    return '<option value="' + esc(c) + '">' + esc(c) + "</option>";
  }).join("");
  var all = ["all"].concat(EXPENSE_CATS.map(function (c) { return c.name; }), INCOME_CATS);
  var seen = {};
  var opts = "";
  all.forEach(function (c) {
    if (seen[c]) return;
    seen[c] = true;
    opts += '<option value="' + esc(c) + '">' + (c === "all" ? "All categories" : esc(c)) + "</option>";
  });
  document.getElementById("filterCat").innerHTML = opts;
}
function renderAll() {
  renderMonths();
  renderSummary();
  renderBudgets();
  renderLedger();
  renderInsights();
}
function pickDefaultMonth() {
  var months = allMonths();
  selectedMonth = months[months.length - 1];
}
document.getElementById("monthSelect").addEventListener("change", function (e) {
  selectedMonth = e.target.value;
  renderAll();
});
document.getElementById("fType").addEventListener("change", renderCatOptions);
["q", "filterType", "filterCat"].forEach(function (id) {
  document.getElementById(id).addEventListener("input", renderLedger);
});
document.getElementById("ledgerBody").addEventListener("click", function (e) {
  var btn = e.target.closest ? e.target.closest("[data-del]") : null;
  if (!btn) return;
  var id = btn.getAttribute("data-del");
  state.transactions = state.transactions.filter(function (t) { return t.id !== id; });
  save();
  renderAll();
});
document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var desc = document.getElementById("fDesc").value.trim();
  var amount = parseFloat(document.getElementById("fAmount").value);
  var type = document.getElementById("fType").value;
  var cat = document.getElementById("fCategory").value;
  var date = document.getElementById("fDate").value;
  if (!desc || isNaN(amount) || amount <= 0 || !date) return;
  state.transactions.push({ id: "tx" + state.nextId, desc: desc, amount: Math.round(amount * 100) / 100, type: type, cat: cat, date: date });
  state.nextId += 1;
  save();
  selectedMonth = monthKey(date);
  document.getElementById("addForm").reset();
  renderCatOptions();
  document.getElementById("fDate").value = new Date().toISOString().slice(0, 10);
  renderAll();
});
document.getElementById("sampleBtn").addEventListener("click", function () {
  if (!window.confirm("Replace all transactions and budgets with the sample data?")) return;
  state = defaultState();
  save();
  pickDefaultMonth();
  renderAll();
});
document.getElementById("clearBtn").addEventListener("click", function () {
  if (!window.confirm("Delete every transaction? Budgets stay as set.")) return;
  state.transactions = [];
  save();
  renderAll();
});
pickDefaultMonth();
renderCatOptions();
document.getElementById("fDate").value = new Date().toISOString().slice(0, 10);
renderAll();
</script>
</body>
</html>
`;

const html = PART1 + PART2 + PART3;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html, "utf8");
console.log("wrote " + join(outDir, "index.html") + " (" + html.length + " bytes)");
