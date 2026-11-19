Global InfoCity TechPark — CRM Restructure

This build reorganises the existing demo portals into focused views. Use the left navigation to open each view as a separate route (query-string page) rather than stacking multiple dashboard modules in one visible screen.

Sales Executive routes:
- sales.html?view=board
- sales.html?view=statistics
- sales.html?view=floorplan
- sales.html?view=newlead

Sales Manager routes:
- sales_manager.html?view=quotations
- sales_manager.html?view=statistics
- sales_manager.html?view=assign
- sales_manager.html?view=forecast

Finance routes:
- finance.html?view=pnl
- finance.html?view=statistics
- finance.html?view=reports

Super Admin routes:
- superadmin.html?view=pipeline
- superadmin.html?view=statistics
- superadmin.html?view=floorplan
- superadmin.html?view=screening
- superadmin.html?view=agreements
- superadmin.html?view=financials
- superadmin.html?view=utilities
- superadmin.html?view=proptax
- superadmin.html?view=rbac

Changes:
- Pipeline is now a dedicated view with a company detail drawer.
- Lead source remains visible on pipeline cards and quotation / assignment tables.
- Sales, Sales Manager and Finance are direct Super Admin sidebar links; no dropdown is used.
- Statistics, floor availability, lead assignment and finance reports open as separate views.
- Lead source distribution charts were added to Sales, Sales Manager and Super Admin statistics.
- Numbered topic prefixes were removed from HR navigation.
- Existing IndexedDB schema, localStorage keys, seed records, login flow and company-specific finance invoice PDF functionality are preserved.

Run locally with VS Code Live Server or another static server. Keep all files in this folder together. Chart.js and the invoice PDF generator use CDNs and therefore require internet access.

Demo note: authentication and storage are browser-based demo mechanisms, not production-grade security.
