/* ==========================================================================
   Makerere Actuarial Society — shared site behaviour
   ========================================================================== */

function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

function initHeaderState() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initNavToggle() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if (!toggle || !links) return;

  const setOpen = (isOpen) => {
    links.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (header) header.classList.toggle('is-nav-open', isOpen);
  };

  toggle.addEventListener('click', () => {
    setOpen(!links.classList.contains('is-open'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (!links.classList.contains('is-open')) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (links.contains(target) || toggle.contains(target)) return;
    setOpen(false);
  });
}

function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const status = document.querySelector('[data-form-status]');
  const submit = form.querySelector('button[type="submit"]');

  const showStatus = (type, message) => {
    if (!status) return;
    status.textContent = message;
    status.classList.add('is-visible');
    status.classList.toggle('is-success', type === 'success');
    status.classList.toggle('is-error', type === 'error');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (submit instanceof HTMLButtonElement) {
      submit.setAttribute('aria-busy', 'true');
      submit.disabled = true;
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        form.reset();
        showStatus('success', 'Thanks — your message is on its way to the committee.');
      } else {
        showStatus('error', 'Something went wrong. Email us directly or try again in a moment.');
      }
    } catch {
      showStatus('error', 'Could not send right now. Please email or WhatsApp us instead.');
    } finally {
      if (submit instanceof HTMLButtonElement) {
        submit.removeAttribute('aria-busy');
        submit.disabled = false;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initHeaderState();
  initNavToggle();
  initContactForm();
});
