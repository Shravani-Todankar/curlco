/* The Curl Co. — Global JS (cart, drawer, nav, footer, announcement) */

/* =============== Constants =============== */
const LOGO_URL = "https://thecurlco.in/cdn/shop/files/tcc-logo-design.png?v=1707727956&width=500";
const WA_LINK = "https://wa.me/919082643562";
const FREE_SHIP = 499;
const IG_IMAGES = [
  "https://thecurlco.in/cdn/shop/files/PHOTO-2024-11-28-11-44-05_1.jpg?crop=center&height=200&v=1732807708&width=200",
  "https://thecurlco.in/cdn/shop/files/image_123650291.jpg?crop=center&height=200&v=1732807710&width=200",
  "https://thecurlco.in/cdn/shop/files/PHOTO-2024-11-28-11-44-07.jpg?crop=center&height=200&v=1732807708&width=200",
  "https://thecurlco.in/cdn/shop/files/PHOTO-2024-11-28-11-44-06.jpg?crop=center&height=200&v=1732807707&width=200",
  "https://thecurlco.in/cdn/shop/files/PHOTO-2024-11-28-11-44-06_1.jpg?crop=center&height=200&v=1732807707&width=200",
  "https://thecurlco.in/cdn/shop/files/PHOTO-2024-11-28-11-44-05.jpg?crop=center&height=200&v=1732807707&width=200"
];
const ANN_MESSAGES = [
  "🎁 With ₹1500+ orders get a FREE Gift Set from Ruby's Organics",
  "🚚 Free shipping over ₹499 — No code needed",
  "💬 Formulated by expert hairdressers — tested on 200+ curly heads",
  "🌿 CG-Friendly | SLS-Free | Vegan | Cruelty-Free",
  "📞 Salon discounts available — Call +91 9082643562"
];

/* =============== Helpers =============== */
function renderStars(rating){
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let h = '';
  for (let i = 0; i < full; i++) h += '<span class="star">★</span>';
  if (half) h += '<span class="star" style="opacity:0.5">★</span>';
  for (let i = full + (half?1:0); i < 5; i++) h += '<span class="star" style="opacity:0.18">★</span>';
  return h;
}
function formatPrice(n){ return '₹' + n.toLocaleString('en-IN'); }
function qs(s, p=document){ return p.querySelector(s); }
function qsa(s, p=document){ return Array.from(p.querySelectorAll(s)); }

/* =============== Cart Storage =============== */
function getCart(){
  try { return JSON.parse(localStorage.getItem('tcc_cart') || '[]'); }
  catch(e) { return []; }
}
function saveCart(cart){ localStorage.setItem('tcc_cart', JSON.stringify(cart)); updateCartBadge(); renderDrawer(); renderCartPage(); }
function addToCart(id, openDrawer = true){
  const item = findItem(id);
  if (!item) return;
  const cart = getCart();
  const ex = cart.find(c => c.id === item.id);
  if (ex) ex.qty++;
  else cart.push({ id:item.id, name:item.name, price:item.price, img:item.img1, qty:1, hairFor:item.hairFor||'' });
  saveCart(cart);
  showToast('✓ ' + (item.name.length > 30 ? item.name.slice(0,30)+'...' : item.name) + ' added');
  if (openDrawer) openCart();
}
function removeFromCart(id){
  const cart = getCart().filter(c => c.id !== parseInt(id));
  saveCart(cart);
}
function updateQty(id, qty){
  qty = Math.max(1, parseInt(qty) || 1);
  const cart = getCart();
  const item = cart.find(c => c.id === parseInt(id));
  if (item) { item.qty = qty; saveCart(cart); }
}
function clearCart(){ localStorage.removeItem('tcc_cart'); updateCartBadge(); renderDrawer(); }
function getCartCount(){ return getCart().reduce((s,i) => s + i.qty, 0); }
function getCartSubtotal(){ return getCart().reduce((s,i) => s + i.price * i.qty, 0); }
function updateCartBadge(){
  const c = getCartCount();
  qsa('.cart-count').forEach(el => { el.textContent = c; el.classList.toggle('zero', c === 0); });
}

/* =============== Toast =============== */
function showToast(msg){
  let t = qs('#tcc-toast');
  if (!t) { t = document.createElement('div'); t.id = 'tcc-toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* =============== Cart Drawer =============== */
function openCart(){
  const d = qs('#cart-drawer'); const o = qs('#cart-overlay');
  if (!d) return;
  d.classList.add('open'); d.setAttribute('aria-hidden','false');
  o.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderDrawer();
}
function closeCart(){
  const d = qs('#cart-drawer'); const o = qs('#cart-overlay');
  if (!d) return;
  d.classList.remove('open'); d.setAttribute('aria-hidden','true');
  o.classList.remove('open');
  document.body.style.overflow = '';
}
function renderDrawer(){
  const items = getCart();
  const itemsEl = qs('#drawer-items');
  const footer = qs('#drawer-footer');
  const shipBar = qs('#drawer-shipping-bar');
  const countEl = qs('#drawer-count');
  const subtotalEl = qs('#drawer-subtotal');
  if (!itemsEl) return;

  if (countEl) countEl.textContent = getCartCount();

  if (items.length === 0) {
    itemsEl.innerHTML = `
      <div class="drawer-empty">
        <span class="empty-emoji">🌀</span>
        <h4>Your cart is empty</h4>
        <p>Your curls are waiting for some love.</p>
        <a href="all-products.html" class="btn btn-primary">Shop Now</a>
      </div>`;
    if (footer) footer.style.display = 'none';
    if (shipBar) shipBar.innerHTML = '';
    return;
  }

  if (footer) footer.style.display = 'block';

  // Shipping bar
  const subtotal = getCartSubtotal();
  if (shipBar) {
    if (subtotal >= FREE_SHIP) {
      shipBar.innerHTML = `<div class="shipping-unlocked"><p>🎉 <strong>Free shipping unlocked!</strong></p><div class="bar-track"><div class="bar-fill" style="width:100%"></div></div></div>`;
    } else {
      const left = FREE_SHIP - subtotal;
      const pct = Math.min(100, (subtotal / FREE_SHIP) * 100);
      shipBar.innerHTML = `<p>Add <strong>${formatPrice(left)}</strong> more for free shipping</p><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>`;
    }
  }

  // Items
  itemsEl.innerHTML = items.map(it => `
    <div class="drawer-item">
      <img src="${it.img}" alt="${it.name}">
      <div class="drawer-item-info">
        <div class="drawer-item-name">${it.name}</div>
        <div class="drawer-item-price">${formatPrice(it.price)}</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="updateQty(${it.id}, ${it.qty - 1})" aria-label="Decrease quantity">−</button>
          <span class="qty-num">${it.qty}</span>
          <button class="qty-btn" onclick="updateQty(${it.id}, ${it.qty + 1})" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="drawer-item-right">
        <div class="drawer-item-price">${formatPrice(it.price * it.qty)}</div>
        <a class="drawer-remove" href="javascript:;" onclick="removeFromCart(${it.id})">Remove</a>
      </div>
    </div>`).join('');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
}

/* =============== Header / Nav Injection =============== */
function renderHeader(){
  const placeholder = qs('[data-include="header"]');
  if (!placeholder) return;
  placeholder.outerHTML = `
    <div class="announcement-bar" id="announcement-bar">
      <button class="ann-close" id="ann-close" aria-label="Dismiss">✕</button>
      <div class="ann-messages" id="ann-messages">
        ${ANN_MESSAGES.map((m,i) => `<div class="ann-message${i===0?' active':''}">${m}</div>`).join('')}
      </div>
      <a class="ann-shop" href="all-products.html">Shop Now →</a>
    </div>
    <header class="nav-wrapper" id="nav-wrapper">
      <div class="nav-inner">
        <a class="nav-logo" href="index.html"><img src="${LOGO_URL}" alt="The Curl Co."></a>
        <nav class="nav-links" aria-label="Primary">
          <a class="nav-link" href="all-products.html">All Products</a>
          <div class="nav-dropdown">
            <a class="nav-link has-dropdown" href="shop-by-hair-type.html">Shop by Hair Type ▾</a>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="shop-by-hair-type.html#wavy"><div class="dd-title">Wavy Hair</div><div class="dd-sub">2A–2C — Light hold, hydration</div></a>
              <a class="dropdown-item" href="shop-by-hair-type.html#curly"><div class="dd-title">Curly Hair</div><div class="dd-sub">3A–3C — Strong hold, definition</div></a>
            </div>
          </div>
          <a class="nav-link" href="combos.html">Combos</a>
          <a class="nav-link" href="accessories.html">Accessories</a>
          <a class="nav-link" href="events.html">Events</a>
          <a class="nav-link" href="how-to-use.html">How to Use</a>
          <a class="nav-link" href="about-us.html">About Us</a>
          <a class="nav-link" href="blog.html">Blog</a>
        </nav>
        <div class="nav-actions">
          <button class="nav-icon-btn" id="search-toggle" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button class="nav-icon-btn" id="cart-icon" aria-label="Open cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span class="cart-count zero">0</span>
          </button>
          <button class="nav-burger" id="nav-burger" aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      <div class="search-bar" id="search-bar">
        <input type="text" placeholder="Search for curl cream, gel, shampoo..." aria-label="Search products">
      </div>
    </header>
    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <button class="mm-close" id="mm-close" aria-label="Close menu">✕</button>
      <a href="index.html">Home</a>
      <a href="all-products.html">All Products</a>
      <a href="shop-by-hair-type.html">Shop by Hair Type</a>
      <a href="shop-by-hair-type.html#wavy" class="mm-sub">↳ Wavy Hair</a>
      <a href="shop-by-hair-type.html#curly" class="mm-sub">↳ Curly Hair</a>
      <a href="combos.html">Combos</a>
      <a href="accessories.html">Accessories</a>
      <a href="events.html">Events</a>
      <a href="how-to-use.html">How to Use</a>
      <a href="about-us.html">About Us</a>
      <a href="blog.html">Blog</a>
    </div>
    <div id="cart-overlay" class="cart-overlay"></div>
    <div id="cart-drawer" class="cart-drawer" aria-hidden="true" role="dialog" aria-label="Shopping cart">
      <div class="drawer-header">
        <h3>Your Curl Cart (<span id="drawer-count">0</span>)</h3>
        <button id="drawer-close" aria-label="Close cart">✕</button>
      </div>
      <div id="drawer-shipping-bar" class="shipping-bar"></div>
      <div id="drawer-items" class="drawer-items"></div>
      <div id="drawer-footer" class="drawer-footer">
        <div class="drawer-subtotal"><span>Subtotal</span><span id="drawer-subtotal">₹0</span></div>
        <p class="drawer-tax-note">Taxes & shipping calculated at checkout</p>
        <a href="checkout.html" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;">Proceed to Checkout →</a>
        <a href="all-products.html" class="drawer-continue">Continue Shopping</a>
      </div>
    </div>
  `;
}

/* =============== Footer Injection =============== */
function renderFooter(){
  const placeholder = qs('[data-include="footer"]');
  if (!placeholder) return;
  placeholder.outerHTML = `
    <section class="info-strip">
      <div class="info-strip-inner">
        <div class="info-item">📞 Salon discounts: +91 9082643562</div>
        <div class="info-item">🚚 Free shipping over ₹499</div>
        <div class="info-item">💅 Hair Services: Alchemic Beauty — 4 cities</div>
        <div class="info-item">🕐 Customer support 9am–6pm</div>
      </div>
    </section>
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <div class="footer-logo"><img src="${LOGO_URL}" alt="The Curl Co."></div>
          <p class="footer-tagline">Effortless Curls, Everyday.</p>
          <div class="footer-social">
            <a href="https://www.instagram.com/thecurlcoindia/" target="_blank" rel="noopener" aria-label="Instagram"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
            <a href="https://www.facebook.com/thecurlco/" target="_blank" rel="noopener" aria-label="Facebook"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.5V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.8l-.5 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg></a>
            <a href="${WA_LINK}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7 0-.3-.2-1.2-.5-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 1.9.8 2.6.9 3.6.7.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4M12 21.5c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.6 1 1-3.5-.2-.4A9.5 9.5 0 1 1 12 21.5M12 .5C5.7.5.5 5.7.5 12c0 2 .5 4 1.5 5.7L.5 23.5l5.9-1.5a11.4 11.4 0 0 0 5.6 1.4c6.3 0 11.5-5.2 11.5-11.5S18.3.5 12 .5"/></svg></a>
          </div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <nav class="footer-links">
            <a href="index.html">Home</a>
            <a href="all-products.html">All Products</a>
            <a href="combos.html">Combos</a>
            <a href="about-us.html">About Us</a>
            <a href="#">FAQs</a>
            <a href="#">Contact</a>
            <a href="how-to-use.html">How to Use</a>
            <a href="blog.html">Blog</a>
          </nav>
        </div>
        <div>
          <h4>Policies</h4>
          <nav class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Return & Refund</a>
            <a href="#">Shipping & Delivery</a>
            <a href="#">Terms & Conditions</a>
          </nav>
        </div>
        <div>
          <h4>Follow on Instagram</h4>
          <div class="footer-ig">
            ${IG_IMAGES.map(u => `<a href="https://www.instagram.com/thecurlcoindia/" target="_blank" rel="noopener"><img src="${u}" alt="Instagram post" loading="lazy"></a>`).join('')}
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="copy">CurlCo Haircare LLP | Copyright 2026</div>
        <div class="pays">Visa &nbsp; Mastercard &nbsp; UPI &nbsp; Paytm &nbsp; Google Pay</div>
      </div>
    </footer>
    <a class="wa-fab" href="${WA_LINK}" target="_blank" rel="noopener" title="Chat with a Curl Expert" aria-label="WhatsApp">💬</a>
  `;
}

/* =============== Product Card Renderer =============== */
function productCardHTML(p, isCombo = false){
  return `
    <article class="product-card" data-id="${p.id}">
      ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
      <a class="card-media" href="all-products.html#p-${p.id}">
        <img class="img-primary" src="${p.img1}" alt="${p.name}" loading="lazy">
        <img class="img-hover" src="${p.img2}" alt="${p.name}" loading="lazy">
      </a>
      <div class="card-body">
        <div class="card-eyebrow">${p.hairFor || (isCombo ? 'Curated Combo' : '')}</div>
        <h3 class="card-name">${p.name}</h3>
        <div class="card-stars">${renderStars(p.rating)} <span class="review-count">(${p.reviews})</span></div>
        ${isCombo && p.includes ? `<details class="card-includes"><summary>What's Included</summary><ul>${p.includes.map(i => `<li>${i}</li>`).join('')}</ul></details>` : ''}
        <div class="card-price-row">
          <span class="price">${formatPrice(p.price)}</span>
          <button class="card-atc" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
      </div>
    </article>`;
}

/* =============== Announcement Bar =============== */
function initAnnouncement(){
  const bar = qs('#announcement-bar');
  if (!bar) return;
  if (sessionStorage.getItem('tcc_ann_closed') === '1') { bar.classList.add('hidden'); document.body.style.paddingTop = '72px'; return; }
  const msgs = qsa('.ann-message');
  let i = 0;
  setInterval(() => {
    msgs[i].classList.remove('active');
    i = (i + 1) % msgs.length;
    msgs[i].classList.add('active');
  }, 3500);
  qs('#ann-close')?.addEventListener('click', () => {
    bar.classList.add('hidden');
    sessionStorage.setItem('tcc_ann_closed','1');
    document.body.style.paddingTop = '72px';
  });
}

/* =============== Nav behavior =============== */
function initNav(){
  const navWrap = qs('#nav-wrapper');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) navWrap?.classList.add('scrolled');
    else navWrap?.classList.remove('scrolled');
  });
  qs('#search-toggle')?.addEventListener('click', () => qs('#search-bar')?.classList.toggle('open'));
  const mm = qs('#mobile-menu');
  qs('#nav-burger')?.addEventListener('click', () => { mm?.classList.add('open'); mm?.setAttribute('aria-hidden','false'); });
  qs('#mm-close')?.addEventListener('click', () => { mm?.classList.remove('open'); mm?.setAttribute('aria-hidden','true'); });
  qsa('#mobile-menu a').forEach(a => a.addEventListener('click', () => { mm?.classList.remove('open'); }));
}

/* =============== Drawer wiring =============== */
function initDrawer(){
  qs('#cart-icon')?.addEventListener('click', openCart);
  qs('#cart-overlay')?.addEventListener('click', closeCart);
  qs('#drawer-close')?.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCart();
      qs('#mobile-menu')?.classList.remove('open');
      qs('#search-bar')?.classList.remove('open');
    }
  });
}

/* =============== Cart Page Renderer =============== */
function renderCartPage(){
  const wrap = qs('#cart-page');
  if (!wrap) return;
  const items = getCart();
  const empty = qs('#cart-empty');
  const layout = qs('#cart-layout');
  if (items.length === 0) {
    empty.style.display = 'block';
    layout.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  layout.style.display = 'grid';
  qs('#cart-table-body').innerHTML = items.map(it => `
    <div class="cart-row">
      <img src="${it.img}" alt="${it.name}">
      <div>
        <div class="ci-name">${it.name}</div>
        <div class="ci-meta">${it.hairFor || ''}</div>
      </div>
      <div class="ci-price">${formatPrice(it.price)}</div>
      <div class="qty-control">
        <button class="qty-btn" onclick="updateQty(${it.id}, ${it.qty - 1})">−</button>
        <span class="qty-num">${it.qty}</span>
        <button class="qty-btn" onclick="updateQty(${it.id}, ${it.qty + 1})">+</button>
      </div>
      <div class="ci-total">${formatPrice(it.price * it.qty)}</div>
      <button class="ci-remove" onclick="removeFromCart(${it.id})" aria-label="Remove">✕</button>
    </div>`).join('');

  const sub = getCartSubtotal();
  const ship = sub >= FREE_SHIP ? 0 : 50;
  qs('#cart-subtotal').textContent = formatPrice(sub);
  qs('#cart-shipping').textContent = ship === 0 ? 'Free' : formatPrice(ship);
  qs('#cart-total').textContent = formatPrice(sub + ship);
  const pct = Math.min(100, (sub / FREE_SHIP) * 100);
  const fillEl = qs('#cart-ship-fill');
  if (fillEl) fillEl.style.width = pct + '%';
  const noteEl = qs('#cart-ship-note');
  if (noteEl) noteEl.textContent = sub >= FREE_SHIP ? '🎉 Free shipping unlocked!' : `Add ${formatPrice(FREE_SHIP - sub)} more for free shipping`;
}

/* =============== Boot =============== */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  initAnnouncement();
  initNav();
  initDrawer();
  updateCartBadge();
  renderDrawer();
  renderCartPage();
  if (typeof onPageReady === 'function') onPageReady();
});
