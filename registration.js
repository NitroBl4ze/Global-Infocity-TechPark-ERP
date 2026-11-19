(function () {
  'use strict';
  function init() {
    const form = document.getElementById('registrationForm');
    if (!form) return;
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      await (window.InfoCityDBReady || Promise.resolve()).catch(function () {});
      const name = document.getElementById('appName').value.trim();
      const email = document.getElementById('appEmail').value.trim().toLowerCase();
      const phone = document.getElementById('appPhone').value.trim();
      const message = document.getElementById('registrationMessage');
      const users = JSON.parse(localStorage.getItem('infocity_users') || '[]');
      const applications = JSON.parse(localStorage.getItem('infocity_user_applications') || '[]');
      if (users.some(function (user) { return String(user.email || user.username || '').toLowerCase() === email; }) ||
          applications.some(function (app) { return app.email === email && app.status === 'Pending'; })) {
        message.className = 'portal-message error';
        message.textContent = 'An account or pending request already exists for this email.';
        return;
      }
      const application = {
        id: Date.now(),
        name: name,
        email: email,
        username: email,
        phone: phone,
        preferredDepartment: document.getElementById('appPreference').value,
        requestedPosition: document.getElementById('appPosition').value.trim(),
        experience: document.getElementById('appExperience').value,
        initialPassword: document.getElementById('appPassword').value,
        notes: document.getElementById('appNotes').value.trim(),
        status: 'Pending',
        appliedOn: new Date().toISOString(),
        reviewedBy: '',
        assignedRole: ''
      };
      applications.unshift(application);
      localStorage.setItem('infocity_user_applications', JSON.stringify(applications));
      const logs = JSON.parse(localStorage.getItem('infocity_audit_logs') || '[]');
      logs.unshift({ id: Date.now(), time: new Date().toLocaleString(), actor: email, action: 'Submitted new user registration', module: 'HR Access Requests', severity: 'INFO' });
      localStorage.setItem('infocity_audit_logs', JSON.stringify(logs));
      form.reset();
      message.className = 'portal-message success-msg';
      message.textContent = 'Request submitted. HR will review it and activate your account after role assignment.';
      form.querySelector('button[type="submit"]').disabled = true;
    });
  }
  document.addEventListener('DOMContentLoaded', init, { once: true });
})();