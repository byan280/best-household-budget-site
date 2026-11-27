# best-household-budget-site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/byan280/best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/byan280/best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

HomeBudget is a household budget planner that runs entirely in the browser: monthly income and spending totals, per-category budget limits with progress bars and over-budget warnings, a transaction list with type, category and text filters, month-by-month navigation, a savings goal tracker, and month-at-a-glance insights. Everything is stored in the browser's localStorage, so no account, server, or data leaving the device is needed. The page works at desktop and phone sizes and ships as one self-contained file with no external requests.

## Features

- Add income and expense transactions with a description, amount, category, and date.
- Nine expense categories with editable monthly limits, spending bars, and remaining/over amounts.
- Filter transactions by type, category, or search text; delete any transaction.
- Monthly summary cards: income, spending, money left, and savings rate.
- Savings goal with a progress bar fed by the month's unspent income.
- Insights: biggest spending category, average daily spending, projected month-end balance, and how many categories are over budget.
- Demo data on first run so the dashboard is alive immediately; a reset button restores it.
- Responsive layout: four summary cards on desktop, stacked single column on phones.

## Run it

```sh
node main.ts
```

This writes the site to `out/index.html`. Open that file in a desktop browser (or serve the `out/` folder with any static file server) and use the site there. The build is deterministic: every run writes the same bytes and prints the same line.

## Layout

- `main.ts` — the entrypoint. It writes the whole site, `out/index.html`, and nothing else.
- `LICENSE` — MIT license.
