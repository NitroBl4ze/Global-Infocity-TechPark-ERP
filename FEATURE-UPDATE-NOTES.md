# Current Feature Update — Global InfoCity ERP

- Department sign-in tiles are maintained separately in portal-access.js and portal-access.css.
- New staff registration is on register.html. Submissions become Pending applications for HR review.
- HR assigns one of Sales, Sales Manager, Finance, HR or Marketing and activates the demo account.
- email-service.js is a configurable EmailJS adapter. Without provider configuration, activation notifications are queued locally instead of being sent.
- department-themes.css adds department themes. Super Admin keeps the existing default theme.
- HR workspace includes user approvals, recruitment, employee directory, contract/outsourced campus staff, attendance/shifts, leave, training, performance, employee relations and a compliance checklist.
- Marketing workspace includes Instagram, LinkedIn, website and other channel metrics, content calendar, campaign tracking, and community/on-campus promotions. Metrics are manually entered; no live social API integration is configured.
- Super Admin receives an executive-level department overview and can open each department's full workspace. Commercial Amenities manages cafés, canteens, playground/recreation and top-floor terrace records.
- This remains a browser-local demo using LocalStorage and IndexedDB. It is not secure multi-user production software. Production requires backend authentication, server-side role enforcement, centralized database, secure password hashing, and server-side email dispatch.
- Amenity examples are proposed demo records, not evidence of approved or operational facilities. Site, structural, fire, accessibility, food-safety and local regulatory approvals must be verified before actual use.
