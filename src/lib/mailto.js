
export function buildBody(form, subjectPrefix) {
  const nameInput = form.querySelector('[name="name"]');
  const companyInput = form.querySelector('[name="company"]');
  const emailInput = form.querySelector('[name="email"]');
  const itEmailInput = form.querySelector('[name="it_email"]');
  const messageInput = form.querySelector('[name="message"]');

  const name = (nameInput?.value || '').trim();
  const company = (companyInput?.value || '').trim();
  const email = (emailInput?.value || '').trim();
  const itEmail = (itEmailInput?.value || '').trim();
  const message = (messageInput?.value || '').trim();

  // Determine which fields were actually present/relevant
  const lines = [
    `Request: ${subjectPrefix}`,
    '',
  ];

  if (nameInput) lines.push(`Name: ${name || '(not provided)'}`);
  if (companyInput) lines.push(`Company: ${company || '(not provided)'}`);
  if (emailInput) lines.push(`Work email: ${email || '(not provided)'}`);
  if (itEmailInput) lines.push(`IT contact email: ${itEmail || '(not provided)'}`);

  if (messageInput) {
    lines.push('');
    lines.push('Message:');
    lines.push(message || '(not provided)');
  }

  lines.push('');
  lines.push(`Sent from: ${window.location.href}`);

  return lines.join('\n');
}

export function setupMailtoForm(formId, copyBtnId, hintId, subjectPrefix, toEmail = 'hello@regparity.com') {
  const form = document.querySelector(`#${formId}`);
  if (!form) return;

  const copyBtn = document.querySelector(`#${copyBtnId}`);
  const hint = document.querySelector(`#${hintId}`);

  // Helper to build the body text
  const getBody = () => buildBody(form, subjectPrefix);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const company = (form.querySelector('[name="company"]')?.value || '').trim();
    // Default subject line
    const subject = `${subjectPrefix} — ${company || 'Unknown company'}`;
    const body = getBody();

    // We construct the mailto link here to ensure freshness
    const mailtoUrl = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    if (hint) hint.hidden = false;
  });

  if (copyBtn) {
    const originalText = copyBtn.textContent;
    copyBtn.addEventListener('click', async () => {
      if (!form.reportValidity()) return;

      const bodyText = getBody();
      try {
        await navigator.clipboard.writeText(bodyText);
        copyBtn.textContent = 'Copied';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    });
  }
}
