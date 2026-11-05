'use strict';

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const downloadButton = document.querySelector('#download-button');
const downloadStatus = document.querySelector('#download-status');
const captchaLocker = document.querySelector('#captcha-locker');
const gallery = document.querySelector('#gallery');

function closeMenu() {
  header.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}

menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  header.classList.toggle('menu-open', expanded);
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
});

document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);

navigation.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  closeMenu();
  if (link.getAttribute('href') === '#gallery') {
    event.preventDefault();
    gallery.showModal();
    return;
  }
  navigation.querySelectorAll('a').forEach(item => {
    item.classList.toggle('active', item === link);
    if (item === link) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  });
});

document.querySelector('.close-gallery').addEventListener('click', () => gallery.close());
gallery.addEventListener('click', event => {
  if (event.target === gallery) {
    const bounds = gallery.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) gallery.close();
  }
});

function scrollCaptchaIntoView() {
  const bounds = captchaLocker.getBoundingClientRect();
  if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
    captchaLocker.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest'
    });
  }
}

downloadButton.addEventListener('click', event => {
  event.preventDefault();
  downloadButton.classList.add('pressed');
  window.setTimeout(() => downloadButton.classList.remove('pressed'), 180);

  const firstReveal = captchaLocker.hidden;
  captchaLocker.hidden = false;
  downloadButton.setAttribute('aria-expanded', 'true');
  downloadButton.removeAttribute('aria-describedby');
  downloadStatus.hidden = true;

  if (firstReveal && 'ResizeObserver' in window) {
    // The provider can render asynchronously after its script has loaded.
    // Scroll once when it first has content, rather than following later resizes.
    const observer = new ResizeObserver(() => {
      if (captchaLocker.getBoundingClientRect().height > 0) {
        observer.disconnect();
        requestAnimationFrame(scrollCaptchaIntoView);
      }
    });
    observer.observe(captchaLocker);
  }

  const scriptUrl = 'https://apptrck.net/cp/js/1q5rl';
  if (![...document.scripts].some(script => script.src === scriptUrl)) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptUrl;
    script.addEventListener('load', () => requestAnimationFrame(scrollCaptchaIntoView), { once: true });
    document.body.append(script);
  }
  requestAnimationFrame(scrollCaptchaIntoView);
});
