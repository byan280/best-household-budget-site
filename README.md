# best-household-budget-site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/byan280/best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/byan280/best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A household budget site in a single self-contained page: set a monthly limit per category, record income and spending, and see at a glance how much is left. The page ships with realistic sample data for November 2026, works entirely offline in the browser, and stores everything in localStorage on the device — no account, no tracking, no network requests.

What it does:

- Monthly summary: income, spending, money left, and savings rate.
- Budgets by category (housing, groceries, transport, utilities, dining out, entertainment, health, savings, other) with progress bars that turn amber past 80% and red over the limit; limits are editable inline.
- A transaction ledger with add, delete, text search, and type/category filters.
- Month picker, sample-data reload, clear-all, and "this month at a glance" insights (biggest expense category, average daily spending, projected month-end).
- Responsive layout: four summary cards on desktop, two across on phones.

## Run it

```sh
node main.ts
```

`main.ts` writes `index.html` into the directory named by `MAKEFUN_OUTPUT_DIR` (default `./output`). Open that file in any desktop or mobile browser — no build step, no server, no dependencies.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
