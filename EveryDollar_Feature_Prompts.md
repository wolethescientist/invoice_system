
# EveryDollar System Feature Prompts

_Backstory: We initially built an invoice system, but we now realize it is just a feature within a larger core system. The backend is Python FastAPI and the frontend is Next.js with TypeScript._

---

## Create monthly zero‑based budgets
**Prompt:**  
You are building a budget management module for our core system. Implement a feature where users can create monthly zero-based budgets. Each budget should allocate every dollar of income into specific categories. Ensure the backend (FastAPI) stores budgets with user associations, monthly periods, and category allocations. The frontend (Next.js + TypeScript) should allow users to input income, add/edit categories, and assign amounts, with live validation showing unallocated or over-allocated amounts. Include calculations to enforce that total allocations equal total income. The UI should be interactive, intuitive, and visually show remaining unassigned funds.

---

## Access budget
**Prompt:**  
Develop functionality to allow users to access their budgets across all devices. The backend should provide secure REST endpoints to fetch budgets by user ID and month. Include authentication via JWT tokens. The frontend should display the selected month’s budget in a responsive table or card layout. Include filtering by categories and a summary view of total income, total allocated, and unassigned funds. Ensure state is properly managed so that updates in one session reflect in others in real-time.

---

## Manually track / enter transactions
**Prompt:**  
Implement a manual transaction tracking feature. Backend should support CRUD operations for transactions, including amount, date, category, and optional notes, linked to user accounts and budgets. Frontend should provide an intuitive form for entering transactions, selecting the category, and viewing a list of recent transactions. Include live validation for amounts and dates, and show immediate updates in the related budget category totals.

---

## Customize budget categories and line items
**Prompt:**  
Create a feature allowing users to add, edit, or remove budget categories and line items. Backend should manage category metadata (name, type, icon/color, default allocation) per user. Ensure integrity so that deleting categories updates or reallocates existing transactions. Frontend should allow users to create custom categories dynamically and display them in budget allocation tables and charts. Include visual cues for category limits and totals.

---

## Unlimited budget categories / line items
**Prompt:**  
Enable unlimited budget categories and line items per user. Backend should efficiently store and retrieve potentially large numbers of categories without performance loss. Frontend should handle scrolling, grouping, or collapsible sections if categories exceed visible space. Ensure UI remains user-friendly regardless of the number of categories.

---

## Set up sinking funds / savings funds
**Prompt:**  
Develop a module for users to set up sinking funds or savings funds within the budget. Each fund should have a target amount, a monthly contribution plan, and a progress tracker. Backend should maintain fund metadata, contributions history, and calculate remaining amounts. Frontend should allow users to visualize progress with bars, percentages, and contribution schedules, and allow adjusting contribution amounts dynamically.

---

## Split a transaction across multiple budget categories
**Prompt:**  
Implement functionality for splitting a single transaction into multiple budget categories. Backend should store each split amount as a linked record under the parent transaction while maintaining category totals. Frontend should provide an interface to enter splits easily, showing total transaction amount and verifying that the sum of splits equals the transaction amount. Include visual feedback if the sum of splits does not match.

---

## Set due dates for bills (bill reminders)
**Prompt:**  
Create a bill reminder system integrated with budgets. Backend should store recurring and one-time bill due dates linked to budget categories and user accounts. Implement notifications (email, push, or in-app) to alert users of upcoming bills. Frontend should show upcoming bills in a calendar or list view, allow users to mark as paid, and adjust budget allocations accordingly.

---

## Paycheck planning (plan budget around when you get paid)
**Prompt:**  
Build paycheck planning functionality that lets users schedule income and see how it affects budget allocations. Backend should support paycheck schedules, split incomes across months, and calculate available funds based on timing. Frontend should visualize upcoming paychecks, allocated funds, and show users which categories can be funded with available income. Include UI elements for adjusting allocations before and after each paycheck.

---

## Financial roadmap (long-term planning / goal timeline)
**Prompt:**  
Implement a financial roadmap feature. Backend should track long-term financial goals (savings, debt repayment, investments) with target amounts, deadlines, and monthly contributions. Frontend should provide a timeline visualization showing progress toward each goal, and calculate projections for completion dates. Include interactive charts to let users adjust contributions and see immediate effect on goal completion.

---

## One‑click tracking suggestions (smart categorization)
**Prompt:**  
Create a system that automatically suggests budget categories for transactions based on history and patterns. Backend should analyze past transactions and maintain a suggestion algorithm. Frontend should display suggested categories during transaction entry with the option to accept, reject, or modify the suggestion. Include real-time updates to budget totals when suggestions are applied.

---

## Custom budget reports (spending & income insights)
**Prompt:**  
Develop functionality for generating custom budget reports. Backend should aggregate transactions, income, and allocations to produce summaries, trends, and charts. Frontend should allow users to select date ranges, categories, and types of reports. Provide interactive visualizations like bar charts, pie charts, and trend lines to help users understand spending habits.

---

## Export transaction data / reports (CSV)
**Prompt:**  
Implement export functionality allowing users to download transaction and budget data as CSV files. Backend should create endpoints to generate and serve CSVs for selected date ranges or categories. Frontend should provide a clear “Export” button and options for filtering data before export. Ensure correct formatting for easy import into spreadsheet software.

---

## Set and track financial goals (savings, debt, big purchases)
**Prompt:**  
Build a financial goals module where users can define goals with target amounts, deadlines, and contribution schedules. Backend should store goals, track progress, and calculate remaining amounts needed. Frontend should visualize goals with progress bars, percentages, and projected completion dates. Allow users to update contributions dynamically and see updated projections.

---

## Calculate current & projected net worth
**Prompt:**  
Implement a net worth calculation feature. Backend should aggregate assets, liabilities, and investments for each user and calculate current net worth. Include projections based on scheduled transactions, savings, and debt payments. Frontend should display net worth visually with trends over time, comparison charts, and alerts if net worth changes significantly.
