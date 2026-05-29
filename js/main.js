/* The Curl Co. — Global JS (cart, drawer, nav, footer, announcement, search, PDP, quiz, before/after) */

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
const FOUNDER_IMG = "https://thecurlco.in/cdn/shop/files/ConvertOut-Resized-PIX07181-2_1_50c43399-3dbd-4dff-8363-a99676fc997d.jpg?v=1716898281&width=1024";

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
function formatPrice(n){ return '₹' + Math.round(n).toLocaleString('en-IN'); }
function qs(s, p=document){ return p.querySelector(s); }
function qsa(s, p=document){ return Array.from(p.querySelectorAll(s)); }
function isCheckoutPage(){ return /checkout\.html/i.test(window.location.pathname); }
function isProductPage(){ return /product\.html/i.test(window.location.pathname); }
function getQueryParam(name){ return new URLSearchParams(window.location.search).get(name); }

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
function addToCartQty(id, qty, openDrawer = true){
  const item = findItem(id);
  if (!item) return;
  qty = Math.max(1, parseInt(qty) || 1);
  const cart = getCart();
  const ex = cart.find(c => c.id === item.id);
  if (ex) ex.qty += qty;
  else cart.push({ id:item.id, name:item.name, price:item.price, img:item.img1, qty:qty, hairFor:item.hairFor||'' });
  saveCart(cart);
  showToast('✓ Added ' + qty + ' × ' + (item.name.length > 25 ? item.name.slice(0,25)+'...' : item.name));
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

  itemsEl.innerHTML = items.map(it => `
    <div class="drawer-item">
      <img src="${it.img}" alt="${it.name}">
      <div class="drawer-item-info">
        <div class="drawer-item-name">${it.name}</div>
        <div class="drawer-item-price">${formatPrice(it.price)}</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="updateQty(${it.id}, ${it.qty - 1})" aria-label="Decrease">−</button>
          <span class="qty-num">${it.qty}</span>
          <button class="qty-btn" onclick="updateQty(${it.id}, ${it.qty + 1})" aria-label="Increase">+</button>
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

  if (isCheckoutPage()) {
    document.body.classList.add('checkout-page');
    placeholder.outerHTML = `
      <header class="checkout-header">
        <div class="ch-inner">
          <a class="ch-back" href="cart.html">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Cart
          </a>
          <a class="ch-logo" href="index.html"><img src="${LOGO_URL}" alt="The Curl Co."></a>
          <div class="ch-secure">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure Checkout
          </div>
        </div>
      </header>
      <div id="cart-overlay" class="cart-overlay"></div>
      <div id="cart-drawer" class="cart-drawer" aria-hidden="true" role="dialog" aria-label="Shopping cart">
        <div class="drawer-header"><h3>Your Curl Cart (<span id="drawer-count">0</span>)</h3><button id="drawer-close" aria-label="Close cart">✕</button></div>
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
    return;
  }

  placeholder.outerHTML = `
    <div class="announcement-bar" id="announcement-bar">
      <button class="ann-close" id="ann-close" aria-label="Dismiss announcement">✕</button>
      <div class="ann-messages" id="ann-messages">
        ${ANN_MESSAGES.map((m,i) => `<div class="ann-message${i===0?' active':''}">${m}</div>`).join('')}
      </div>
      <a class="ann-shop" href="all-products.html">Shop Now <span>→</span></a>
    </div>
    <header class="nav-wrapper" id="nav-wrapper">
      <div class="nav-inner">
        <div class="nav-zone-left">
          <button class="nav-burger" id="nav-burger" aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <a class="nav-logo nav-no-mobile" href="index.html"><img src="${LOGO_URL}" alt="The Curl Co."></a>
        </div>
        <div class="nav-zone-center">
          <nav class="nav-links" aria-label="Primary">
            <a class="nav-link" href="all-products.html">Shop</a>
            <div class="nav-dropdown">
              <a class="nav-link has-dropdown" href="shop-by-hair-type.html">Hair Type ▾</a>
              <div class="dropdown-menu">
                <a class="dropdown-item" href="shop-by-hair-type.html#wavy"><div class="dd-title">Wavy Hair</div><div class="dd-sub">2A–2C — Light hold, hydration</div></a>
                <a class="dropdown-item" href="shop-by-hair-type.html#curly"><div class="dd-title">Curly Hair</div><div class="dd-sub">3A–3C — Strong hold, definition</div></a>
              </div>
            </div>
            <a class="nav-link" href="combos.html">Combos</a>
            <a class="nav-link" href="accessories.html">Accessories</a>
            <a class="nav-link" href="how-to-use.html">How to Use</a>
            <a class="nav-link" href="about-us.html">About</a>
            <a class="nav-link" href="blog.html">Blog</a>
          </nav>
        </div>
        <div class="nav-zone-right">
          <button class="nav-icon-btn" id="search-toggle" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button class="nav-icon-btn nav-no-mobile" aria-label="Wishlist" onclick="showToast('Wishlist coming soon')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="nav-icon-btn nav-no-mobile" aria-label="Account" onclick="showToast('Account coming soon')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <button class="nav-icon-btn" id="cart-icon" aria-label="Open cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span class="cart-count zero">0</span>
          </button>
        </div>
      </div>
    </header>
    <div class="search-overlay-backdrop" id="search-backdrop"></div>
    <div class="search-overlay" id="search-overlay" aria-hidden="true">
      <div class="search-inner">
        <div class="search-row">
          <input type="text" id="search-input" placeholder="Search for curl cream, gel, shampoo..." aria-label="Search">
          <button class="search-close" id="search-close" aria-label="Close search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="search-chips">
          <button class="search-chip" data-q="curl cream">Curl Cream</button>
          <button class="search-chip" data-q="soft hold">Soft Hold</button>
          <button class="search-chip" data-q="strong hold">Strong Hold</button>
          <button class="search-chip" data-q="bundles">Bundles</button>
        </div>
        <div class="search-popular">
          <div class="search-popular-label">Popular Products</div>
          <div class="search-popular-grid" id="search-popular-grid"></div>
        </div>
      </div>
    </div>
    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <button class="mm-close" id="mm-close" aria-label="Close menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <div class="mm-links">
        <a href="index.html">Home</a>
        <a href="all-products.html">Shop</a>
        <a href="shop-by-hair-type.html">Hair Type</a>
        <a href="shop-by-hair-type.html#wavy" class="mm-sub">↳ Wavy (2A–2C)</a>
        <a href="shop-by-hair-type.html#curly" class="mm-sub">↳ Curly (3A–3C)</a>
        <a href="combos.html">Combos</a>
        <a href="accessories.html">Accessories</a>
        <a href="how-to-use.html">How to Use</a>
        <a href="about-us.html">About Us</a>
        <a href="blog.html">Blog</a>
        <a href="events.html">Events</a>
      </div>
      <div class="mm-footer">
        <div class="mm-foot-label">Follow Us</div>
        <div class="mm-social">
          <a href="https://www.instagram.com/thecurlcoindia/" target="_blank" rel="noopener" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
          <a href="${WA_LINK}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7 0-.3-.2-1.2-.5-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 1.9.8 2.6.9 3.6.7.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4M12 21.5c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.6 1 1-3.5-.2-.4A9.5 9.5 0 1 1 12 21.5M12 .5C5.7.5.5 5.7.5 12c0 2 .5 4 1.5 5.7L.5 23.5l5.9-1.5a11.4 11.4 0 0 0 5.6 1.4c6.3 0 11.5-5.2 11.5-11.5S18.3.5 12 .5"/></svg></a>
        </div>
      </div>
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

  if (isCheckoutPage()) {
    placeholder.outerHTML = `
      <footer class="footer" style="padding: 32px 24px;">
        <div class="footer-bottom" style="border:none; padding: 0;">
          <div class="copy">CurlCo Haircare LLP | Copyright 2026</div>
          <div class="pays">Visa &nbsp; Mastercard &nbsp; UPI &nbsp; Paytm &nbsp; Google Pay</div>
        </div>
      </footer>
    `;
    return;
  }

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
            <a href="https://www.instagram.com/thecurlcoindia/" target="_blank" rel="noopener" aria-label="Instagram"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
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
  const badgeClass = p.badge && /best/i.test(p.badge) ? 'badge-bestseller'
                    : p.badge && /new/i.test(p.badge) ? 'badge-new'
                    : p.badge && /sale|off/i.test(p.badge) ? 'badge-sale'
                    : 'badge-bestseller';
  return `
    <article class="product-card" data-id="${p.id}">
      ${p.badge ? `<span class="card-badge ${badgeClass}">${p.badge}</span>` : ''}
      <a class="product-card-link" href="product.html?id=${p.id}">
        <div class="card-media">
          <img class="img-primary" src="${p.img1}" alt="${p.name}" loading="lazy">
          <img class="img-hover" src="${p.img2}" alt="${p.name}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="card-eyebrow">${p.hairFor || (isCombo ? 'Curated Combo' : '')}</div>
          <h3 class="card-name">${p.name}</h3>
          <div class="card-stars">${renderStars(p.rating)} <span class="review-count">(${p.reviews})</span></div>
          ${isCombo && p.includes ? `<details class="card-includes" onclick="event.stopPropagation()"><summary>What's Included</summary><ul>${p.includes.map(i => `<li>${i}</li>`).join('')}</ul></details>` : ''}
          <div class="card-price-row">
            <span class="price">${formatPrice(p.price)}</span>
            <button class="card-atc" onclick="event.preventDefault(); event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
          </div>
        </div>
      </a>
    </article>`;
}

/* =============== Announcement Bar =============== */
function initAnnouncement(){
  const bar = qs('#announcement-bar');
  if (!bar) return;
  if (sessionStorage.getItem('tcc_announce_dismissed') === '1') {
    bar.classList.add('hidden');
    document.body.style.paddingTop = 'var(--header-h)';
    return;
  }
  const msgs = qsa('.ann-message');
  if (msgs.length > 1) {
    let i = 0;
    const rotate = () => {
      msgs[i].classList.remove('active');
      i = (i + 1) % msgs.length;
      msgs[i].classList.add('active');
    };
    let interval = setInterval(rotate, 4500);
    bar.addEventListener('mouseenter', () => clearInterval(interval));
    bar.addEventListener('mouseleave', () => { interval = setInterval(rotate, 4500); });
  }
  qs('#ann-close')?.addEventListener('click', () => {
    bar.classList.add('hidden');
    sessionStorage.setItem('tcc_announce_dismissed','1');
    document.body.style.paddingTop = 'var(--header-h)';
  });
}

/* =============== Nav behavior =============== */
function initNav(){
  const navWrap = qs('#nav-wrapper');
  const bar = qs('#announcement-bar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navWrap?.classList.add('scrolled');
      bar?.classList.add('scrolled-away');
    } else {
      navWrap?.classList.remove('scrolled');
      bar?.classList.remove('scrolled-away');
    }
  });
  const mm = qs('#mobile-menu');
  qs('#nav-burger')?.addEventListener('click', () => { mm?.classList.add('open'); mm?.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; });
  qs('#mm-close')?.addEventListener('click', () => { mm?.classList.remove('open'); mm?.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; });
  qsa('#mobile-menu a:not(.mm-close)').forEach(a => a.addEventListener('click', () => { mm?.classList.remove('open'); document.body.style.overflow = ''; }));
}

/* =============== Search =============== */
function initSearch(){
  const toggle = qs('#search-toggle');
  const overlay = qs('#search-overlay');
  const backdrop = qs('#search-backdrop');
  const closeBtn = qs('#search-close');
  const input = qs('#search-input');
  const popularGrid = qs('#search-popular-grid');
  if (!toggle || !overlay) return;

  // Populate popular products
  if (popularGrid && typeof PRODUCTS !== 'undefined') {
    popularGrid.innerHTML = PRODUCTS.slice(0, 4).map(p => `
      <a class="search-popular-card" href="product.html?id=${p.id}">
        <img src="${p.img1}" alt="${p.name}">
        <div>
          <div class="sp-name">${p.name.split('(')[0].trim().slice(0, 32)}</div>
          <div class="sp-price">${formatPrice(p.price)}</div>
        </div>
      </a>
    `).join('');
  }

  const open = () => {
    document.body.classList.add('search-open');
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 280);
  };
  const close = () => {
    document.body.classList.remove('search-open');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if (input) input.value = '';
  };

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    if (document.body.classList.contains('search-open')) close();
    else open();
  });
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  qsa('.search-chip').forEach(c => c.addEventListener('click', () => {
    if (input) input.value = c.dataset.q || c.textContent;
    input?.focus();
  }));
  qsa('.search-popular-card').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('search-open')) close();
  });
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

/* =============== Before/After Slider =============== */
function initBeforeAfter(){
  const ba = qs('.before-after');
  if (!ba) return;
  const after = ba.querySelector('.ba-after');
  const handle = ba.querySelector('.ba-handle');
  let dragging = false;
  let touched = false;

  const setPos = (pct, snap=false) => {
    pct = Math.max(0, Math.min(100, pct));
    if (snap) pct = Math.round(pct / 5) * 5;
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = pct + '%';
    if (!touched) {
      ba.classList.add('touched');
      touched = true;
    }
  };
  const getPctFromEvent = (e) => {
    const r = ba.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    return (x / r.width) * 100;
  };
  const onMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    setPos(getPctFromEvent(e));
  };
  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    setPos(getPctFromEvent(e), true);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  };
  const onDown = (e) => {
    dragging = true;
    setPos(getPctFromEvent(e));
    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };
  ba.addEventListener('mousedown', onDown);
  ba.addEventListener('touchstart', onDown, { passive: true });
}

/* =============== Curl Type Quiz Modal =============== */
function initQuizModal(){
  const fab = qs('#curl-quiz-fab');
  if (!fab) return;
  // Build modal
  const modal = document.createElement('div');
  modal.className = 'quiz-modal-backdrop';
  modal.id = 'quiz-modal-backdrop';
  modal.innerHTML = `
    <div class="quiz-modal" role="dialog" aria-label="Curl Type Quiz">
      <button class="quiz-modal-close" aria-label="Close">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <div class="quiz-dots">
        <div class="quiz-dot active"></div>
        <div class="quiz-dot"></div>
        <div class="quiz-dot"></div>
        <div class="quiz-dot"></div>
      </div>
      <div class="quiz-step active" data-step="1">
        <h3>What's your curl pattern?</h3>
        <p>Choose the closest match — no judgement.</p>
        <div class="quiz-options">
          <button class="quiz-option" data-val="wavy"><span class="qo-symbol">〰️</span>Wavy (2A–2C)</button>
          <button class="quiz-option" data-val="curly"><span class="qo-symbol">🌀</span>Curly (3A–3C)</button>
        </div>
      </div>
      <div class="quiz-step" data-step="2">
        <h3>How often do you wash?</h3>
        <p>Wash frequency shapes your routine.</p>
        <div class="quiz-options">
          <button class="quiz-option" data-val="daily"><span class="qo-symbol">💧</span>Every day</button>
          <button class="quiz-option" data-val="weekly"><span class="qo-symbol">📅</span>2–3 a week</button>
        </div>
      </div>
      <div class="quiz-step" data-step="3">
        <h3>What's your goal?</h3>
        <p>Pick your top priority right now.</p>
        <div class="quiz-options">
          <button class="quiz-option" data-val="definition"><span class="qo-symbol">✨</span>Definition</button>
          <button class="quiz-option" data-val="hold"><span class="qo-symbol">💪</span>Strong hold</button>
          <button class="quiz-option" data-val="frizz"><span class="qo-symbol">🪞</span>Frizz control</button>
          <button class="quiz-option" data-val="hydration"><span class="qo-symbol">💦</span>Hydration</button>
        </div>
      </div>
      <div class="quiz-step" data-step="4">
        <div class="quiz-result" id="quiz-result-card"></div>
      </div>
      <div class="quiz-nav">
        <button class="btn btn-outline btn-sm" id="quiz-back" style="display:none;">← Back</button>
        <button class="btn btn-primary btn-sm" id="quiz-next" disabled>Next →</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const answers = { 1:null, 2:null, 3:null };
  let step = 1;

  const updateDots = () => {
    qsa('.quiz-dot', modal).forEach((d, i) => d.classList.toggle('active', i < step));
  };
  const showStep = (n) => {
    step = n;
    qsa('.quiz-step', modal).forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === n));
    qs('#quiz-back', modal).style.display = n > 1 ? 'inline-flex' : 'none';
    const next = qs('#quiz-next', modal);
    if (n === 4) next.style.display = 'none';
    else { next.style.display = 'inline-flex'; next.disabled = !answers[n]; next.textContent = n === 3 ? 'See My Match →' : 'Next →'; }
    updateDots();
  };

  const pickProduct = () => {
    const { 1:pattern, 3:goal } = answers;
    let id = 1;
    if (goal === 'hold' && pattern === 'curly') id = 2;
    else if (goal === 'hold') id = 2;
    else if (goal === 'definition') id = 3;
    else if (goal === 'frizz') id = 5;
    else if (goal === 'hydration') id = 4;
    else id = 1;
    return findItem(id);
  };
  const renderResult = () => {
    const p = pickProduct();
    qs('#quiz-result-card', modal).innerHTML = `
      <h3 style="text-align:center; margin-bottom:6px;">Your Match</h3>
      <p style="margin-bottom:18px;">Based on your answers, this is the one for you.</p>
      <img src="${p.img1}" alt="${p.name}">
      <h4>${p.name.split('(')[0].trim()}</h4>
      <div class="qr-sub">${p.hairFor || ''}</div>
      <a class="btn btn-primary" href="product.html?id=${p.id}">Shop Now →</a>
    `;
  };

  qsa('.quiz-option', modal).forEach(opt => opt.addEventListener('click', () => {
    const parent = opt.closest('.quiz-step');
    const n = parseInt(parent.dataset.step);
    qsa('.quiz-option', parent).forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    answers[n] = opt.dataset.val;
    const nextBtn = qs('#quiz-next', modal);
    nextBtn.disabled = false;
  }));

  qs('#quiz-next', modal).addEventListener('click', () => {
    if (step === 3) { renderResult(); showStep(4); }
    else showStep(step + 1);
  });
  qs('#quiz-back', modal).addEventListener('click', () => showStep(Math.max(1, step - 1)));

  const closeModal = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
  qs('.quiz-modal-close', modal).addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  fab.addEventListener('click', () => {
    showStep(1);
    Object.keys(answers).forEach(k => answers[k] = null);
    qsa('.quiz-option', modal).forEach(o => o.classList.remove('selected'));
    qs('#quiz-next', modal).disabled = true;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

/* =============== Reveal on scroll =============== */
function initReveal(){
  if (!('IntersectionObserver' in window)) { qsa('.how-step').forEach(el => el.classList.add('in-view')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.2 });
  qsa('.how-step').forEach(el => obs.observe(el));
}

/* =============== Accordion (FAQ etc.) =============== */
function initAccordion(){
  qsa('.acc-item').forEach(item => {
    const q = item.querySelector('.acc-q');
    q?.addEventListener('click', () => {
      const open = item.classList.contains('open');
      qsa('.acc-item', item.parentElement).forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
}

/* =============== Video reel inline play =============== */
function initVideoReel(){
  qsa('.video-reel-card').forEach(card => {
    card.addEventListener('click', () => {
      const v = card.querySelector('video');
      if (!v) return;
      if (v.paused) { v.play(); card.classList.add('playing'); }
      else { v.pause(); card.classList.remove('playing'); }
    });
  });
}

/* =============== PRODUCT PAGE RENDER =============== */
function buildExtraImages(item){
  // Synthesize gallery from img1 with width/crop variations
  const base = item.img1.split('?')[0];
  return [
    item.img1,
    item.img2,
    base + "?crop=top&height=685&width=625",
    base + "?crop=bottom&height=685&width=625"
  ];
}
function getCategoryLabel(item){
  if (item.type === 'combo') return 'Curated Combo';
  if (item.tag === 'shampoo') return 'Cleansers';
  if (item.tag === 'conditioner') return 'Conditioners';
  if (item.tag === 'serum') return 'Treatments';
  if (item.tag === 'gel') return 'Stylers';
  if (item.tag) return 'Curl Creams';
  return 'Curl Care';
}
function pickRelated(item, n=4){
  const pool = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).filter(p => p.id !== item.id);
  return pool.slice(0, n);
}
function pickFBT(item){
  const pool = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).filter(p => p.id !== item.id);
  return pool.slice(0, 2);
}

function renderProductPage(){
  const host = qs('#pdp-host');
  if (!host) return;
  const idParam = parseInt(getQueryParam('id'));
  const item = (idParam && findItem(idParam)) || PRODUCTS[0];
  const isCombo = item.type === 'combo';
  const mrp = Math.round(item.price * 1.25);
  const off = Math.round(((mrp - item.price) / mrp) * 100);
  const images = buildExtraImages(item);
  const cat = getCategoryLabel(item);
  const related = pickRelated(item, 4);
  const fbt = pickFBT(item);
  const fbtTotal = item.price + fbt.reduce((s,p) => s + p.price, 0);
  const fbtSave = Math.round(fbtTotal * 0.10);

  const variantPills = isCombo
    ? ['Wavy', 'Curly', 'Both'].map((v,i) => `<button class="pdp-variant-pill${i===0?' active':''}" data-v="${v.toLowerCase()}">${v}</button>`).join('')
    : ['50g', '100g', '200g'].map((v,i) => `<button class="pdp-variant-pill${i===2?' active':''}" data-v="${v}">${v}</button>`).join('');

  const ingredients = [
    { name: 'Quinoa Protein', role: 'Strengthens & smooths curl cuticles' },
    { name: 'Shea Butter', role: 'Deep hydration & elasticity' },
    { name: 'Argan Oil', role: 'Shine without weighing curls down' },
    { name: 'Sunflower Seed Oil', role: 'Softens & seals frizz' },
    { name: 'Glycerin', role: 'Humectant — pulls moisture into the hair shaft' },
    { name: 'Aloe Vera', role: 'Soothes scalp & boosts curl spring' },
    { name: 'Vitamin E', role: 'Antioxidant — protects from environmental damage' },
    { name: 'Hydrolyzed Wheat Protein', role: 'Improves curl pattern & strength' }
  ];

  const tabs = {
    description: `
      <h4>About this product</h4>
      <p>${item.desc || ''}</p>
      <p>Formulated by Sassoon-trained hairdressers and tested on 200+ real Indian curls. Free from sulphates, silicones, parabens, and harsh drying agents — just curl-loving ingredients that work with your texture, not against it.</p>
      <h4 style="margin-top:18px;">What it does</h4>
      <ul class="bullet">
        <li>Locks in long-lasting curl definition without crunch.</li>
        <li>Tames frizz in humidity — built for Indian weather.</li>
        <li>Hydrates and softens with every wash day.</li>
        <li>Lightweight, non-greasy, won't weigh curls down.</li>
      </ul>
    `,
    ingredients: `
      <h4>Curl-friendly ingredients</h4>
      <p>Every ingredient earns its place. No silicones, no sulphates, no nasties.</p>
      ${ingredients.map(i => `<div class="pdp-ingredient"><strong>${i.name}</strong><span>${i.role}</span></div>`).join('')}
    `,
    howto: `
      <h4>How to use — in 3 steps</h4>
      <div class="pdp-step"><div class="step-num">1</div><div><h5>Apply on damp curls</h5><p>After conditioning, gently squeeze excess water. Apply a generous coin-sized amount evenly section by section.</p></div></div>
      <div class="pdp-step"><div class="step-num">2</div><div><h5>Scrunch upward</h5><p>Cup curls in your palm and scrunch upward toward the scalp to encourage curl pattern. Repeat all over.</p></div></div>
      <div class="pdp-step"><div class="step-num">3</div><div><h5>Air-dry or diffuse</h5><p>Let curls air-dry undisturbed, or diffuse on low heat. Once fully dry, scrunch out the crunch (SOTC) for soft, defined curls.</p></div></div>
    `,
    faqs: `
      <div class="accordion">
        <div class="acc-item"><button class="acc-q">Is this CG-Friendly? <span class="acc-toggle">+</span></button><div class="acc-a"><div class="acc-a-inner">Yes. Every formula follows Curly Girl Method principles — no sulphates, silicones, or drying alcohols.</div></div></div>
        <div class="acc-item"><button class="acc-q">Is it sulphate and silicone free? <span class="acc-toggle">+</span></button><div class="acc-a"><div class="acc-a-inner">Absolutely. Our entire range is free of sulphates, silicones, parabens, mineral oils, and artificial colors.</div></div></div>
        <div class="acc-item"><button class="acc-q">Is this suitable for my curl type? <span class="acc-toggle">+</span></button><div class="acc-a"><div class="acc-a-inner">${item.hairFor || 'Suitable for all curl types from 2A waves to 3C coils.'} If you're unsure, take our 60-second Curl Quiz.</div></div></div>
        <div class="acc-item"><button class="acc-q">What's the return policy? <span class="acc-toggle">+</span></button><div class="acc-a"><div class="acc-a-inner">We offer a 7-day no-questions-asked return on unopened products. For curl emergencies, WhatsApp us and we'll sort you out.</div></div></div>
      </div>
    `
  };

  const reviewsList = [
    { stars: 5, text: 'My 3A curls have never looked this defined. The soft hold cream gives bounce without crunch!', name: 'Priya M., Mumbai', verified: true, photos: true },
    { stars: 5, text: 'Finally a brand that understands Indian curly hair. The shampoo doesn\'t strip my curls at all.', name: 'Sneha R., Pune', verified: true, photos: false },
    { stars: 5, text: 'The strong hold cream is life-changing for my 3B coils. They last 3 days without touching.', name: 'Divya K., Bangalore', verified: true, photos: true },
    { stars: 4, text: 'Smells lovely, great hold for a soft-hold formula. Wish the bottle were larger — finishing too quickly!', name: 'Aanya S., Delhi', verified: true, photos: false }
  ];

  host.innerHTML = `
    <nav class="pdp-breadcrumb">
      <a href="index.html">Home</a><span class="sep">/</span>
      <a href="all-products.html">Shop</a><span class="sep">/</span>
      <a href="all-products.html">${cat}</a><span class="sep">/</span>
      <span>${item.name.split('(')[0].trim()}</span>
    </nav>

    <div class="pdp-grid">
      <div class="pdp-gallery">
        <div class="pdp-gallery-main"><img id="pdp-main-img" src="${images[0]}" alt="${item.name}"></div>
        <div class="pdp-gallery-thumbs">
          ${images.map((u,i) => `<button class="pdp-thumb${i===0?' active':''}" data-i="${i}"><img src="${u}" alt="View ${i+1}"></button>`).join('')}
        </div>
      </div>
      <div class="pdp-info">
        <span class="pdp-category-pill">${cat}</span>
        <h1>${item.name}</h1>
        <div class="pdp-rating-row">
          <span class="stars">${renderStars(item.rating)}</span>
          <a href="#reviews">(${item.reviews} reviews)</a>
          <span class="verified">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Verified Buyers
          </span>
        </div>
        <div class="pdp-price-row">
          <span class="p-current">${formatPrice(item.price)}</span>
          <span class="p-mrp">${formatPrice(mrp)}</span>
          <span class="p-sale">${off}% OFF</span>
        </div>
        <p class="pdp-desc">${item.desc || ''}</p>
        <div class="pdp-hair-chip"><strong>Best for:</strong> ${item.hairFor || 'All curl types (2A–3C)'}</div>

        <div class="pdp-variants">
          <div class="pv-label">${isCombo ? 'Routine for' : 'Size'}</div>
          <div class="pdp-variant-pills">${variantPills}</div>
        </div>

        <div class="pdp-offers">
          <div class="pdp-offer"><div class="po-icon">🎁</div><div><strong>Free Gift on ₹1500+ orders</strong><span>Ruby's Organics Gift Set added at checkout</span></div></div>
          <div class="pdp-offer"><div class="po-icon">🚚</div><div><strong>Free shipping over ₹499</strong><span>No code needed — applied automatically</span></div></div>
        </div>

        <div class="pdp-atc-row">
          <div class="pdp-qty">
            <button id="pdp-qty-minus" aria-label="Decrease quantity">−</button>
            <span class="pdp-qty-num" id="pdp-qty">1</span>
            <button id="pdp-qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn-primary btn-lg" id="pdp-atc">Add to Cart</button>
          <button class="btn btn-gold btn-lg" id="pdp-buynow">Buy Now</button>
        </div>

        <div class="pdp-trust-strip">
          <div class="pt-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Secure Pay</div>
          <div class="pt-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> 7-day Return</div>
          <div class="pt-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> COD</div>
          <div class="pt-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Authentic</div>
        </div>
      </div>
    </div>

    <section class="pdp-tabs">
      <div class="pdp-tab-pills" role="tablist">
        <button class="pdp-tab-pill active" data-tab="description">Description</button>
        <button class="pdp-tab-pill" data-tab="ingredients">Ingredients</button>
        <button class="pdp-tab-pill" data-tab="howto">How to Use</button>
        <button class="pdp-tab-pill" data-tab="faqs">FAQs</button>
      </div>
      <div class="pdp-tab-content active" data-tab="description">${tabs.description}</div>
      <div class="pdp-tab-content" data-tab="ingredients">${tabs.ingredients}</div>
      <div class="pdp-tab-content" data-tab="howto">${tabs.howto}</div>
      <div class="pdp-tab-content" data-tab="faqs">${tabs.faqs}</div>
    </section>

    <section class="pdp-reviews" id="reviews">
      <div class="section-head left"><span class="eyebrow">Customer Reviews</span><h2>What Curlfriends are saying</h2></div>
      <div class="pdp-reviews-summary">
        <div class="pdp-reviews-big">
          <div class="big-num">${item.rating.toFixed(1)}</div>
          <div class="big-stars">${renderStars(item.rating)}</div>
          <div class="big-count">${item.reviews} verified reviews</div>
        </div>
        <div class="pdp-reviews-bars">
          ${[5,4,3,2,1].map(n => {
            const pct = n === 5 ? 78 : n === 4 ? 16 : n === 3 ? 4 : n === 2 ? 1 : 1;
            return `<div class="pdp-bar-row"><span class="pb-label">${n}<span class="star">★</span></span><div class="pdp-bar-track"><div class="pdp-bar-fill" style="width:${pct}%"></div></div><span>${pct}%</span></div>`;
          }).join('')}
        </div>
      </div>
      <div class="pdp-reviews-filters">
        <button class="pdp-rev-pill active">All</button>
        <button class="pdp-rev-pill">5★</button>
        <button class="pdp-rev-pill">With photos</button>
        <button class="pdp-rev-pill">Verified</button>
      </div>
      <div class="pdp-reviews-grid">
        ${reviewsList.map(r => `
          <div class="review-card">
            <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
            <p class="review-text">${r.text}</p>
            <div class="review-name">— ${r.name} ${r.verified ? '· <span style="color:var(--success);">Verified Buyer</span>' : ''}</div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="pdp-fbt">
      <div class="section-head left"><span class="eyebrow">Bundle & Save</span><h2>Frequently Bought Together</h2></div>
      <div class="pdp-fbt-grid">
        <div class="pdp-fbt-item">
          <label><input type="checkbox" checked disabled> This item</label>
          <img src="${item.img1}" alt="${item.name}">
          <div class="fbt-name">${item.name.split('(')[0].trim()}</div>
          <div class="fbt-price">${formatPrice(item.price)}</div>
        </div>
        <div class="pdp-fbt-plus">+</div>
        <div class="pdp-fbt-item">
          <label><input type="checkbox" checked class="fbt-check" data-id="${fbt[0]?.id}"> Add</label>
          <img src="${fbt[0]?.img1}" alt="${fbt[0]?.name}">
          <div class="fbt-name">${fbt[0]?.name.split('(')[0].trim()}</div>
          <div class="fbt-price">${formatPrice(fbt[0]?.price)}</div>
        </div>
        <div class="pdp-fbt-plus">+</div>
        <div class="pdp-fbt-item">
          <label><input type="checkbox" checked class="fbt-check" data-id="${fbt[1]?.id}"> Add</label>
          <img src="${fbt[1]?.img1}" alt="${fbt[1]?.name}">
          <div class="fbt-name">${fbt[1]?.name.split('(')[0].trim()}</div>
          <div class="fbt-price">${formatPrice(fbt[1]?.price)}</div>
        </div>
        <div class="pdp-fbt-cta">
          <div class="fbt-total">${formatPrice(fbtTotal - fbtSave)}</div>
          <div class="fbt-save">Save ${formatPrice(fbtSave)}</div>
          <button class="btn btn-primary" id="fbt-add-all">Add 3 to Cart</button>
        </div>
      </div>
    </section>

    <section class="pdp-related">
      <div class="section-head left"><span class="eyebrow">Complete Your Routine</span><h2>You may also love</h2></div>
      <div class="pdp-related-grid">
        ${related.map(p => productCardHTML(p)).join('')}
      </div>
    </section>

    <section class="pdp-shipinfo">
      <h3>Shipping & Returns</h3>
      <div class="accordion">
        <div class="acc-item"><button class="acc-q">Shipping & Delivery <span class="acc-toggle">+</span></button><div class="acc-a"><div class="acc-a-inner">Orders placed before 2pm IST ship the same day. Standard delivery 3–5 working days across India. Free shipping on orders over ₹499.</div></div></div>
        <div class="acc-item"><button class="acc-q">Returns & Exchange <span class="acc-toggle">+</span></button><div class="acc-a"><div class="acc-a-inner">7-day no-questions-asked return on unopened products. For curl emergencies, WhatsApp us and we'll sort it out.</div></div></div>
        <div class="acc-item"><button class="acc-q">Cancellation <span class="acc-toggle">+</span></button><div class="acc-a"><div class="acc-a-inner">Orders can be cancelled within 4 hours of placing. Once shipped, please use the returns process.</div></div></div>
        <div class="acc-item"><button class="acc-q">Contact Us <span class="acc-toggle">+</span></button><div class="acc-a"><div class="acc-a-inner">WhatsApp +91 9082643562 or email hello@thecurlco.in. We're online 9am–6pm Mon–Sat.</div></div></div>
      </div>
    </section>

    <div class="mobile-atc-bar" id="mobile-atc">
      <div class="matc-thumb">
        <img src="${item.img1}" alt="${item.name}">
        <div>
          <div class="matc-name">${item.name.split('(')[0].trim()}</div>
          <div class="matc-price">${formatPrice(item.price)}</div>
        </div>
      </div>
      <button class="btn btn-primary" onclick="addToCart(${item.id})">Add to Cart</button>
    </div>
  `;

  // wire up gallery
  qsa('.pdp-thumb').forEach(t => t.addEventListener('click', () => {
    qsa('.pdp-thumb').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    qs('#pdp-main-img').src = images[parseInt(t.dataset.i)];
  }));

  // qty stepper
  let qty = 1;
  const qtyEl = qs('#pdp-qty');
  qs('#pdp-qty-minus').addEventListener('click', () => { qty = Math.max(1, qty - 1); qtyEl.textContent = qty; });
  qs('#pdp-qty-plus').addEventListener('click', () => { qty = qty + 1; qtyEl.textContent = qty; });

  // ATC + Buy now
  qs('#pdp-atc').addEventListener('click', () => addToCartQty(item.id, qty, true));
  qs('#pdp-buynow').addEventListener('click', () => { addToCartQty(item.id, qty, false); window.location.href = 'checkout.html'; });

  // FBT add all
  qs('#fbt-add-all').addEventListener('click', () => {
    addToCartQty(item.id, 1, false);
    qsa('.fbt-check').forEach(cb => { if (cb.checked) addToCartQty(parseInt(cb.dataset.id), 1, false); });
    showToast('✓ 3 items added');
    openCart();
  });

  // Variants
  qsa('.pdp-variant-pill').forEach(p => p.addEventListener('click', () => {
    qsa('.pdp-variant-pill').forEach(x => x.classList.remove('active'));
    p.classList.add('active');
  }));

  // Tabs
  qsa('.pdp-tab-pill').forEach(t => t.addEventListener('click', () => {
    const k = t.dataset.tab;
    qsa('.pdp-tab-pill').forEach(x => x.classList.toggle('active', x === t));
    qsa('.pdp-tab-content').forEach(c => c.classList.toggle('active', c.dataset.tab === k));
  }));

  // Init accordion on page (FAQ + shipinfo)
  initAccordion();

  // Mobile ATC visibility
  document.body.classList.add('has-mobile-atc');
  const matc = qs('#mobile-atc');
  const trigger = qs('.pdp-info');
  window.addEventListener('scroll', () => {
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    if (r.bottom < 100) matc.classList.add('show');
    else matc.classList.remove('show');
  });

  // doc title
  document.title = `${item.name.split('(')[0].trim()} — The Curl Co.`;
}

/* =============== CHECKOUT — utility (validation, progress) =============== */
function initCheckoutValidation(){
  if (!isCheckoutPage()) return;
  const fields = {
    email: { el: '#f-email', test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email.' },
    phone: { el: '#f-phone', test: v => /^[0-9]{10}$/.test(v), msg: 'Phone must be 10 digits.' },
    pin:   { el: '#f-pin',   test: v => /^[0-9]{6}$/.test(v), msg: 'Pincode must be 6 digits.' }
  };
  Object.values(fields).forEach(f => {
    const el = qs(f.el); if (!el) return;
    el.addEventListener('blur', () => {
      const wrap = el.closest('.form-field');
      const err = wrap?.querySelector('.err-msg');
      if (!el.value.trim()) { wrap?.classList.remove('invalid'); if (err) err.textContent = ''; return; }
      if (!f.test(el.value.trim())) { wrap?.classList.add('invalid'); if (err) err.textContent = f.msg; }
      else { wrap?.classList.remove('invalid'); if (err) err.textContent = ''; }
    });
  });
}

/* =============== Boot =============== */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  initAnnouncement();
  initNav();
  initSearch();
  initDrawer();
  updateCartBadge();
  renderDrawer();
  renderCartPage();
  initReveal();
  initAccordion();
  initVideoReel();
  initBeforeAfter();
  initQuizModal();
  if (isProductPage()) renderProductPage();
  if (isCheckoutPage()) initCheckoutValidation();
  if (typeof onPageReady === 'function') onPageReady();
});
