/* Department access selector. This feature is isolated so it can be removed without touching the portal pages. */
(function () {
  'use strict';
  const PORTALS = [
    { role: 'SuperAdmin', title: 'Super Admin', description: 'Complete TechPark and department access', icon: '⌂', className: 'portal-admin', route: 'superadmin.html?view=departments' },
    { role: 'HR', title: 'Human Resources', description: 'Registrations, employees and campus workforce', icon: '♙', className: 'portal-hr', route: 'hr.html?view=overview' },
    { role: 'Sales', title: 'Sales', description: 'Leads, calls, follow-ups and client handoff', icon: '↗', className: 'portal-sales', route: 'sales.html?view=board' },
    { role: 'Sales Manager', title: 'Sales Manager', description: 'Clients, quotations, payments and receipts', icon: '▤', className: 'portal-manager', route: 'sales_manager.html?view=quotations' },
    { role: 'Marketing', title: 'Marketing', description: 'Instagram, LinkedIn, Ads and call centre', icon: '✳', className: 'portal-marketing', route: 'marketing.html?view=overview' },
    { role: 'Finance', title: 'Finance', description: 'Existing finance dashboard and invoicing', icon: '₹', className: 'portal-finance', route: 'finance.html?view=pnl' }
  ];

  function audit(actor, action, severity) {
    const rows = JSON.parse(localStorage.getItem('infocity_audit_logs') || '[]');
    rows.unshift({ id: Date.now(), time: new Date().toLocaleString(), actor: actor || 'Unknown', action: action, module: 'Access Gateway', severity: severity || 'INFO' });
    localStorage.setItem('infocity_audit_logs', JSON.stringify(rows.slice(0, 500)));
  }

  function init() {
    const grid = document.getElementById('portalGrid');
    const form = document.getElementById('portalLoginForm');
    const message = document.getElementById('portalLoginMessage');
    if (!grid || !form) return;

    grid.innerHTML = PORTALS.map(function (portal) {
      return '<button type="button" class="portal-choice ' + portal.className + '" data-role="' + portal.role + '">' +
        '<span class="portal-choice-icon" aria-hidden="true">' + portal.icon + '</span>' +
        '<span class="portal-choice-copy"><strong>' + portal.title + '</strong><small>' + portal.description + '</small></span>' +
        '<span class="portal-choice-arrow" aria-hidden="true">Open →</span></button>';
    }).join('');

    grid.querySelectorAll('[data-role]').forEach(function (button) {
      button.addEventListener('click', function () {
        const selected = PORTALS.find(function (portal) { return portal.role === button.dataset.role; });
        let activeUser = null;
        try { activeUser = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch (error) {}
        if (activeUser && activeUser.status === 'Active' && activeUser.role === selected.role) {
          window.location.href = selected.route;
          return;
        }
        document.getElementById('selectedPortalRole').value = selected.role;
        document.getElementById('selectedPortalName').textContent = selected.title;
        document.getElementById('portalTitle').textContent = selected.title + ' workspace';
        grid.classList.add('hidden');
        form.classList.remove('hidden');
        message.textContent = '';
        document.getElementById('portalUsername').focus();
      });
    });

    document.getElementById('portalBackButton').addEventListener('click', function () {
      form.classList.add('hidden');
      grid.classList.remove('hidden');
      document.getElementById('portalTitle').textContent = 'Select your workspace';
      message.textContent = '';
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      await (window.InfoCityDBReady || Promise.resolve()).catch(function () {});
      const selectedRole = document.getElementById('selectedPortalRole').value;
      const identifier = document.getElementById('portalUsername').value.trim().toLowerCase();
      const password = document.getElementById('portalPassword').value;
      const users = JSON.parse(localStorage.getItem('infocity_users') || '[]');
      const user = users.find(function (item) {
        return String(item.username || '').toLowerCase() === identifier ||
          String(item.email || '').toLowerCase() === identifier;
      });

      if (!user || user.password !== password) {
        audit(identifier, 'Failed sign-in attempt', 'WARN');
        message.className = 'portal-message error';
        message.textContent = 'The email/username or password is incorrect.';
        return;
      }
      if (user.status !== 'Active') {
        audit(identifier, 'Blocked sign-in for non-active account', 'WARN');
        message.className = 'portal-message error';
        message.textContent = user.status === 'Pending' ? 'Your registration is awaiting HR approval.' : 'This account is not active. Contact HR.';
        return;
      }
      if (user.role !== selectedRole) {
        message.className = 'portal-message error';
        message.textContent = 'This account belongs to ' + user.role + '. Select that department to continue.';
        return;
      }

      const portal = PORTALS.find(function (item) { return item.role === user.role; });
      const sessionUser = Object.assign({}, user);
      delete sessionUser.password;
      localStorage.setItem('currentUser', JSON.stringify(sessionUser));
      audit(user.username, 'Signed into ' + user.role + ' portal', 'INFO');
      window.location.href = portal.route;
    });
  }

  document.addEventListener('DOMContentLoaded', init, { once: true });
})();