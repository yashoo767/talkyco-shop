/* ===== TALKYCO SHOP — MAIN JS ===== */

/* ---------- CART ---------- */
const CART_KEY = 'talkyco_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id, name, price, emoji, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty += qty; }
  else { cart.push({ id, name, price, emoji, qty }); }
  saveCart(cart);
  showToast(`${name} added to cart`, 'success');
}

function updateCartItem(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    const idx = cart.indexOf(item);
    cart.splice(idx, 1);
  }
  saveCart(cart);
  renderCart();
}

function removeCartItem(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

/* ---------- RENDER CART PAGE ---------- */
function renderCart() {
  const container = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (summaryEl) summaryEl.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji || '💊'}</div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">OTC Healthcare Product</div>
        <div class="cart-item-qty">
          <div class="qty-control">
            <button class="qty-btn" onclick="updateCartItem('${item.id}', -1)">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartItem('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem('${item.id}')">Remove</button>
      </div>
      <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join('');

  const subtotal = cartTotal();
  const shipping = subtotal >= 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  updateSummaryRows(subtotal, shipping, tax, total);
}

function updateSummaryRows(subtotal, shipping, tax, total) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('summary-subtotal', `$${subtotal.toFixed(2)}`);
  set('summary-shipping', shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`);
  set('summary-tax', `$${tax.toFixed(2)}`);
  set('summary-total', `$${total.toFixed(2)}`);
}

/* ---------- RENDER CHECKOUT ORDER SUMMARY ---------- */
function renderCheckoutSummary() {
  const container = document.getElementById('checkout-order-items');
  if (!container) return;
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = '/cart.html';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="order-item-row">
      <div class="order-item-img">${item.emoji || '💊'}</div>
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-qty">Qty: ${item.qty}</div>
      </div>
      <div class="order-item-price">$${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join('');

  const subtotal = cartTotal();
  const shipping = subtotal >= 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  updateSummaryRows(subtotal, shipping, tax, total);
}

/* ---------- MOBILE NAV ---------- */
function initMobileNav() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target) && nav.classList.contains('open')) {
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ---------- FAQ ACCORDION ---------- */
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

/* ---------- FAQ CATEGORIES ---------- */
function initFaqCategories() {
  document.querySelectorAll('.faq-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.faq-item').forEach(item => {
        item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}

/* ---------- TABS ---------- */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.dataset.tab;
      const container = btn.closest('.product-tabs');
      if (!container) return;
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = container.querySelector(`#tab-${panel}`);
      if (target) target.classList.add('active');
    });
  });
}

/* ---------- QTY BUTTONS (product pages) ---------- */
function initQtyButtons() {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const control = btn.closest('.qty-control');
      if (!control) return;
      const valueEl = control.querySelector('.qty-value');
      if (!valueEl) return;
      let val = parseInt(valueEl.textContent || valueEl.value) || 1;
      if (btn.textContent === '+' || btn.textContent === '＋') val++;
      else val = Math.max(1, val - 1);
      if (valueEl.tagName === 'INPUT') valueEl.value = val;
      else valueEl.textContent = val;
    });
  });
}

/* ---------- ADD TO CART BUTTONS ---------- */
function initAddToCart() {
  document.querySelectorAll('.add-to-cart-btn, [data-add-cart]').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const id = btn.dataset.id || Math.random().toString(36).slice(2);
      const name = btn.dataset.name || 'Product';
      const price = parseFloat(btn.dataset.price) || 9.99;
      const emoji = btn.dataset.emoji || '💊';
      const qtyEl = btn.closest('.product-detail')?.querySelector('.qty-value');
      const qty = qtyEl ? parseInt(qtyEl.textContent || qtyEl.value) || 1 : 1;
      addToCart(id, name, price, emoji, qty);
    });
  });
}

/* ---------- SMS POPUP ---------- */
function initSmsPopup() {
  const overlay = document.getElementById('sms-modal');
  if (!overlay) return;

  const dismissed = sessionStorage.getItem('sms_modal_dismissed');
  if (!dismissed) {
    setTimeout(() => overlay.classList.add('open'), 8000);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSmsModal();
  });

  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeSmsModal);

  const form = overlay.querySelector('#sms-popup-form');
  if (form) form.addEventListener('submit', handleSmsSubmit);
}

function closeSmsModal() {
  const overlay = document.getElementById('sms-modal');
  if (overlay) overlay.classList.remove('open');
  sessionStorage.setItem('sms_modal_dismissed', '1');
}

/* ---------- SMS FORM SUBMIT ---------- */
function handleSmsSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const phone = form.querySelector('input[type="tel"]')?.value;
  const consent = form.querySelector('input[type="checkbox"]')?.checked;
  if (!phone) { showToast('Please enter your phone number.', 'error'); return; }

  // Record consent data (in production, POST to backend)
  const consentRecord = {
    phone_number: phone,
    consent_status: consent,
    consent_timestamp: new Date().toISOString(),
    consent_source: 'website_form',
    consent_page_url: window.location.href,
    campaign_name: 'TalkyCo OTC Marketing',
    ip_address: 'client-side',
    user_agent: navigator.userAgent
  };
  console.log('SMS Consent Record:', consentRecord);

  // Show success
  const successEl = form.closest('.sms-form-card, .modal-body, .sms-consent-body')?.querySelector('.sms-success');
  if (successEl) {
    form.style.display = 'none';
    successEl.classList.add('show');
    // Show appropriate success message based on consent
    const subscribedMsg = successEl.querySelector('.sms-success-subscribed');
    const noConsentMsg = successEl.querySelector('.sms-success-no-consent');
    if (consent && subscribedMsg) {
      subscribedMsg.style.display = 'inline';
      if (noConsentMsg) noConsentMsg.style.display = 'none';
    } else if (!consent && noConsentMsg) {
      noConsentMsg.style.display = 'inline';
      if (subscribedMsg) subscribedMsg.style.display = 'none';
    }
  } else {
    if (consent) {
      showToast('You\'re subscribed! Watch for TalkyCo offers.', 'success');
    } else {
      showToast('Thank you. Your information has been submitted.', 'success');
    }
    closeSmsModal();
  }
}

/* ---------- TOAST ---------- */
function showToast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '!'}</span>${msg}`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

/* ---------- CHECKOUT FORM ---------- */
function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const mandatoryConsent = form.querySelector('#terms-consent');
    if (!mandatoryConsent?.checked) {
      showToast('Please accept the Terms & Conditions to continue.', 'error');
      return;
    }
    // Record SMS consent if checked (optional)
    const smsConsent = form.querySelector('#sms-consent');
    if (smsConsent?.checked) {
      const phone = form.querySelector('#billing-phone')?.value;
      console.log('Checkout SMS consent given for:', phone);
    }
    window.location.href = 'order.html?status=success';
  });
}

/* ---------- COUPON ---------- */
function applyCoupon() {
  const input = document.getElementById('coupon-input');
  const code = input?.value.trim().toUpperCase();
  if (!code) return;
  const valid = { 'TALKY10': 10, 'WELCOME15': 15 };
  if (valid[code]) {
    showToast(`Coupon applied: ${valid[code]}% off`, 'success');
  } else {
    showToast('Invalid coupon code.', 'error');
  }
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initMobileNav();
  initFaq();
  initFaqCategories();
  initTabs();
  initQtyButtons();
  initAddToCart();
  initSmsPopup();
  initCheckoutForm();
  renderCart();
  renderCheckoutSummary();

  // SMS forms on various pages
  document.querySelectorAll('.sms-form, #sms-page-form').forEach(form => {
    form.addEventListener('submit', handleSmsSubmit);
  });

  // Highlight current nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (path === href || path.endsWith(href))) {
      link.classList.add('active');
    }
  });
});
