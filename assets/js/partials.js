// Header / footer / drawers injected into pages
(function(){
  const HEADER = `
<div class="announce" role="region" aria-label="Announcements">
  <div class="announce-track"><span id="announce-msg">Free shipping on prepaid orders over <strong>₹599</strong></span></div>
</div>
<header class="site-header">
  <div class="container header-inner">
    <button class="hamburger" aria-label="Open menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
    <a href="{ROOT}index.html" class="logo"><img src="{ROOT}assets/img/logo.png" alt="The Curl Co" width="120" height="42"></a>
    <nav class="nav" aria-label="Primary">
      <ul class="nav-list">
        <li><a href="{ROOT}shop.html">Shop All</a>
          <div class="mega"><div class="mega-grid">
            <div><h4>By Concern</h4><a href="{ROOT}shop.html?c=frizz">Frizz control</a><a href="{ROOT}shop.html?c=definition">Definition</a><a href="{ROOT}shop.html?c=moisture">Moisture</a><a href="{ROOT}shop.html?c=volume">Volume</a></div>
            <div><h4>By Curl Type</h4><a href="{ROOT}shop.html?t=2">Waves (2A-2C)</a><a href="{ROOT}shop.html?t=3a">Loose curls (3A)</a><a href="{ROOT}shop.html?t=3b">Springy curls (3B)</a><a href="{ROOT}shop.html?t=4a">Coily (3C-4A)</a></div>
            <div><h4>By Category</h4><a href="{ROOT}shop.html?cat=cleanser">Shampoos</a><a href="{ROOT}shop.html?cat=conditioner">Conditioners</a><a href="{ROOT}shop.html?cat=styler">Creams & Gels</a><a href="{ROOT}shop.html?cat=accessory">Accessories</a></div>
          </div></div>
        </li>
        <li><a href="{ROOT}bundles.html">Bundles</a></li>
        <li><a href="{ROOT}routine-quiz.html">Curl Quiz</a></li>
        <li><a href="{ROOT}blog.html">Curl Edit</a></li>
        <li><a href="{ROOT}about.html">Our Story</a></li>
      </ul>
    </nav>
    <div class="icon-actions">
      <a class="icon-btn open-search" href="#" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></a>
      <a class="icon-btn" href="{ROOT}account.html" aria-label="Account"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></a>
      <a class="icon-btn" href="{ROOT}account.html#wishlist" aria-label="Wishlist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></a>
      <a class="icon-btn open-cart" href="#" aria-label="Cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M6 6 4 2H2"/></svg><span class="cart-badge cart-count" style="display:none">0</span></a>
    </div>
  </div>
</header>
<aside class="mobile-nav">
  <div class="mobile-nav-head"><a href="{ROOT}index.html" class="logo"><img src="{ROOT}assets/img/logo.png" alt="" height="34"></a><button class="close-mobile icon-btn">×</button></div>
  <a href="{ROOT}shop.html">Shop All</a><a href="{ROOT}bundles.html">Bundles</a><a href="{ROOT}routine-quiz.html">Curl Quiz</a><a href="{ROOT}blog.html">Curl Edit</a><a href="{ROOT}about.html">Our Story</a><a href="{ROOT}reviews.html">Reviews</a><a href="{ROOT}faq.html">FAQs</a><a href="{ROOT}contact.html">Contact</a>
</aside>
<div class="search-overlay">
  <button class="close-search icon-btn">×</button>
  <form id="search-form"><input type="search" placeholder="Search products, routines, curl types…"></form>
  <div class="search-suggestions">
    <a class="chip" href="{ROOT}shop.html?q=cream">Curl cream</a>
    <a class="chip" href="{ROOT}shop.html?q=gel">Hydrating gel</a>
    <a class="chip" href="{ROOT}shop.html?q=shampoo">Shampoo</a>
    <a class="chip" href="{ROOT}routine-quiz.html">Curl quiz</a>
  </div>
</div>`;

  const FOOTER = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="{ROOT}index.html" class="logo"><img src="{ROOT}assets/img/logo.png" alt="The Curl Co" style="height:42px;filter:invert(1) brightness(2)"></a>
        <p>India's curly hair authority. Sulphate-free, silicone-free curl care for 2A-4A textures.</p>
        <div class="socials">
          <a href="https://instagram.com/thecurlco" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
          <a href="https://youtube.com/@thecurlco" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.1-1C16.9 3.4 12 3.4 12 3.4s-4.9 0-8 .3c-.4.1-1.3.1-2.1 1C1.2 5.4 1 7 1 7s-.2 2-.2 4v1.9C.8 15 1 17 1 17s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.7.3 7.7.3s4.9 0 8-.3c.4-.1 1.3-.1 2.1-1 .7-.7.9-2.3.9-2.3s.2-2 .2-4V11c0-2-.2-4-.2-4zM9.7 15.2V7.7L16 11.4l-6.3 3.8z"/></svg></a>
          <a href="https://facebook.com/thecurlco" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-9h3l1-4h-4V6.5c0-1 .3-1.5 1.7-1.5H17V2h-2.7C11 2 10 4 10 6.3V9H7v4h3v9h3z"/></svg></a>
        </div>
        <div class="made-in">🇮🇳 Made in India</div>
      </div>
      <div class="footer-col"><h5>Shop</h5>
        <a href="{ROOT}shop.html">All products</a><a href="{ROOT}bundles.html">Bundles</a>
        <a href="{ROOT}shop.html?cat=cleanser">Shampoos</a><a href="{ROOT}shop.html?cat=styler">Creams & Gels</a>
        <a href="{ROOT}shop.html?cat=accessory">Accessories</a><a href="{ROOT}routine-quiz.html">Routine Quiz</a>
      </div>
      <div class="footer-col"><h5>Help</h5>
        <a href="{ROOT}contact.html">Contact us</a><a href="{ROOT}track-order.html">Track order</a>
        <a href="{ROOT}faq.html">FAQs</a><a href="{ROOT}account.html">My account</a>
        <a href="{ROOT}policies/shipping.html">Shipping</a><a href="{ROOT}policies/returns.html">Returns</a>
      </div>
      <div class="footer-col"><h5>Company</h5>
        <a href="{ROOT}about.html">Our story</a><a href="{ROOT}blog.html">The Curl Edit</a>
        <a href="{ROOT}reviews.html">Reviews</a><a href="{ROOT}policies/privacy.html">Privacy</a>
        <a href="{ROOT}policies/terms.html">Terms</a>
        <div class="payments"><span>VISA</span><span>MC</span><span>UPI</span><span>COD</span><span>RAZ</span></div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span class="year"></span> The Curl Co. All rights reserved.</span>
      <span>contact@curlco.in · +91 90826 43562</span>
    </div>
  </div>
</footer>
<div id="backdrop" class="backdrop"></div>
<aside id="cart-drawer" class="drawer">
  <div class="drawer-head"><h3>Your cart</h3><button class="drawer-close close-cart">×</button></div>
  <div id="free-bar" class="free-bar"></div>
  <div id="cart-body" class="drawer-body"></div>
  <div id="cart-foot" class="drawer-foot" style="display:none"></div>
</aside>
<nav class="tab-bar">
  <a href="{ROOT}index.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>Home</a>
  <a href="{ROOT}shop.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/></svg>Shop</a>
  <a href="{ROOT}routine-quiz.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>Quiz</a>
  <a href="#" class="open-cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>Cart</a>
  <a href="{ROOT}account.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>Account</a>
</nav>`;

  const root = document.documentElement.dataset.root || '';
  const slotH = document.getElementById('site-header-slot');
  const slotF = document.getElementById('site-footer-slot');
  if(slotH) slotH.innerHTML = HEADER.replaceAll('{ROOT}', root);
  if(slotF) slotF.innerHTML = FOOTER.replaceAll('{ROOT}', root);
})();
