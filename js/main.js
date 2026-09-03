/* ==========================================================================
   Makerere Actuarial Society — shared site behaviour
   ========================================================================== */

/* ---------- mobile nav toggle ---------- */

function initNavToggle() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
});
