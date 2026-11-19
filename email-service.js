/* Email delivery adapter.
   Configure EmailJS serviceId/templateId/publicKey below to enable browser-side demo sending.
   Production deployments should use a trusted server-side mail provider and never expose secrets in the browser. */
(function () {
  'use strict';
  const CONFIG = window.INFOCITY_EMAIL_CONFIG || {
    serviceId: '',
    templateId: '',
    publicKey: ''
  };

  function recordDelivery(entry) {
    const outbox = JSON.parse(localStorage.getItem('infocity_email_outbox') || '[]');
    outbox.unshift(Object.assign({ id: Date.now(), createdAt: new Date().toISOString() }, entry));
    localStorage.setItem('infocity_email_outbox', JSON.stringify(outbox.slice(0, 500)));
  }

  async function sendApproval(user, role) {
    const params = {
      to_email: user.email || user.username,
      to_name: user.name,
      assigned_role: role,
      login_url: window.location.origin + window.location.pathname.replace(/[^/]*$/, 'index.html'),
      message: 'Your Global InfoCity workspace account has been approved and activated.'
    };
    if (!CONFIG.serviceId || !CONFIG.templateId || !CONFIG.publicKey) {
      recordDelivery({ to: params.to_email, subject: 'Global InfoCity account activated', status: 'Queued — email provider not configured', role: role });
      return { sent: false, status: 'queued' };
    }
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: CONFIG.serviceId, template_id: CONFIG.templateId, user_id: CONFIG.publicKey, template_params: params })
      });
      if (!response.ok) throw new Error('Email provider returned ' + response.status);
      recordDelivery({ to: params.to_email, subject: 'Global InfoCity account activated', status: 'Sent', role: role });
      return { sent: true, status: 'sent' };
    } catch (error) {
      recordDelivery({ to: params.to_email, subject: 'Global InfoCity account activated', status: 'Failed — ' + error.message, role: role });
      return { sent: false, status: 'failed', error: error.message };
    }
  }

  async function sendReceipt(receipt) {
    const params = {
      to_email: receipt.email,
      to_name: receipt.company,
      receipt_no: receipt.receiptNo,
      amount: 'INR ' + Number(receipt.amount || 0).toLocaleString('en-IN'),
      payment_type: receipt.paymentType,
      payment_date: receipt.date,
      payment_method: receipt.method,
      transaction_reference: receipt.reference,
      message: 'A Global InfoCity TechPark payment receipt has been generated. The receipt reference and payment details are included in this email.'
    };
    if (!params.to_email) {
      recordDelivery({ to: '', subject: 'Payment receipt ' + receipt.receiptNo, status: 'Not sent — organisation email missing', receiptNo: receipt.receiptNo });
      return { sent: false, status: 'Not sent — organisation email missing' };
    }
    if (!CONFIG.serviceId || !CONFIG.templateId || !CONFIG.publicKey) {
      recordDelivery({ to: params.to_email, subject: 'Payment receipt ' + receipt.receiptNo, status: 'Queued — email provider not configured', receiptNo: receipt.receiptNo });
      return { sent: false, status: 'Queued — email provider not configured' };
    }
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: CONFIG.serviceId, template_id: CONFIG.templateId, user_id: CONFIG.publicKey, template_params: params })
      });
      if (!response.ok) throw new Error('Email provider returned ' + response.status);
      recordDelivery({ to: params.to_email, subject: 'Payment receipt ' + receipt.receiptNo, status: 'Sent', receiptNo: receipt.receiptNo });
      return { sent: true, status: 'Sent' };
    } catch (error) {
      recordDelivery({ to: params.to_email, subject: 'Payment receipt ' + receipt.receiptNo, status: 'Failed — ' + error.message, receiptNo: receipt.receiptNo });
      return { sent: false, status: 'Failed — ' + error.message };
    }
  }

  window.InfoCityEmail = { sendApproval: sendApproval, sendReceipt: sendReceipt };
})();