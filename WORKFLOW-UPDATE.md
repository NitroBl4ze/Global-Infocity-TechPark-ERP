# Department Workflow Expansion

## Login and department navigation
The employee access page displays dedicated dashboard buttons in this order: Super Admin, HR, Sales, Sales Manager and Marketing. Finance remains available as an additional tile to preserve the existing finance portal. If an active user already has a session for the selected role, selecting that tile opens the corresponding dashboard. Otherwise, the role-specific credential form appears and successful authentication redirects to that dashboard.

## Sales workspace
The Sales sidebar has separate entries for Lead Inbox, Call Log, Follow-ups, Client Replies and Client Handoff. A qualified client pushed from Sales is moved to the Quotation stage and receives a handoff status so the Sales Manager can see it in Client Receive.

## Sales Manager workspace
The Sales Manager sidebar includes Client Receive, Quotations, Payment Methods, Advance / Full Payments, Loans and Receipt Generation. Payment entries are recorded against the selected organisation. Receipt records are synchronised to the browser IndexedDB store. The print view can be printed or saved as PDF by the browser.

### Server receipt archive
The static demo does not contain an authenticated server or API, so browser IndexedDB is a local archive, not a server copy. The UI includes an optional upload adapter for a protected `POST /api/receipts` endpoint. Configure `window.INFOCITY_API_BASE` and a server-issued `window.INFOCITY_API_TOKEN` from the real application session. The server endpoint should validate the session, store the receipt file and metadata, and return a receipt ID. Do not put a permanent server secret in frontend JavaScript.

### Receipt email
The Sales Manager calls `window.InfoCityEmail.sendReceipt`. Configure `window.INFOCITY_EMAIL_CONFIG` with EmailJS `serviceId`, `templateId` and `publicKey` and create a template using the receipt parameters. Until configured, outgoing receipt emails are queued in `infocity_email_outbox`.

## Marketing workspace
The marketing dashboard tracks Instagram, LinkedIn, Google Ads, Meta Ads and Posters / Offline separately. Each channel accepts manual reporting snapshots for reach, growth, followers/audience, views, leads and spend. These are user-entered values; no live platform APIs are connected. Marketing leads can be pushed to the Sales Lead Inbox.

The Marketing Call Centre records inbound, missed, outbound and callback calls. Qualified poster calls can be converted to leads and pushed into Sales.

## HR workforce activity
The HR workspace retains user approvals, recruitment, employee directory, contractors, attendance, leave, training, performance, relations and compliance. A new Workforce Control page brings registration status, today's attendance and employee activity into one view. The contractor service list includes security, parking, lift, cafeteria, housekeeping, electrical, plumbing, server maintenance and internet provider teams.

## Database
IndexedDB schema is upgraded to version 4. New object stores are added for sales call logs, follow-ups, replies, payments, payment methods, loans, receipts, marketing metrics, marketing leads, marketing calls and employee activities. Existing object stores are retained.

## Demo / production boundary
Data remains browser-local and is not automatically synchronised between different employees or devices. The role checks are frontend demo controls, not production-grade server authorisation. Before real deployment, implement server-side authentication and RBAC, a central database, protected receipt upload, real payment verification, and server-side email delivery.
