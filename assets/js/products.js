// Product rendering, filters, sort
(function(){
  let ALL = [], BUNDLES = [];
  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const stars = r => '★★★★★☆☆☆☆☆'.slice(5 - Math.round(r), 10 - Math.round(r));

  async function loadAll(){
    try{
      const [p, b] = await Promise.all([
        fetch('data/products.json').then(r=>r.json()),
        fetch('data/bundles.json').then(r=>r.json())
      ]);
      ALL = p; BUNDLES = b;
      window.CurlcoCart?.setProducts(p);
      window.CurlcoProducts = { all:ALL, bundles:BUNDLES };
      return {p,b};
    }catch(e){ console.error(e); return {p:[],b:[]}; }
  }

  function cardHTML(p){
    const off = p.mrp ? Math.round((1-p.price/p.mrp)*100) : 0;
    return `<article class="product-card reveal" data-id="${p.id}">
      <a class="product-media" href="product.html?id=${p.id}" aria-label="${p.title}">
        ${p.badge?`<span class="product-badge">${p.badge}</span>`:''}
        <img src="${p.images[0]}" alt="${p.title}" loading="lazy" decoding="async">
      </a>
      <button class="product-wish" data-id="${p.id}" aria-label="Add to wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div class="product-info">
        <a href="product.html?id=${p.id}"><h3>${p.title}</h3></a>
        <div class="product-sub">${p.subtitle||''}</div>
        <div class="rating-line"><span class="stars">${stars(p.rating)}</span><span>${p.rating} (${p.reviews})</span></div>
        <div class="price-row">
          <span class="price">${fmt(p.price)}</span>
          ${p.mrp?`<span class="mrp">${fmt(p.mrp)}</span><span class="off">${off}% OFF</span>`:''}
        </div>
        <div class="product-quick">
          <button class="btn btn-primary btn-sm btn-block" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>`;
  }

  function bundleCardHTML(b){
    const off = b.mrp ? Math.round((1-b.price/b.mrp)*100) : 0;
    return `<article class="bundle-card reveal">
      <a class="bundle-media" href="product.html?id=${b.id}&type=bundle" aria-label="${b.title}">
        ${b.badge?`<span class="bundle-badge">${b.badge}</span>`:''}
        ${b.save?`<span class="save-pill">Save ${fmt(b.save)}</span>`:''}
        <img src="${b.image}" alt="${b.title}" loading="lazy">
      </a>
      <div class="bundle-info">
        <h3>${b.title}</h3>
        <div class="product-sub">${b.subtitle}</div>
        <p style="font-size:.9rem;color:var(--muted);margin:0">${b.description}</p>
        <div class="price-row" style="margin-top:auto">
          <span class="price">${fmt(b.price)}</span>
          ${b.mrp?`<span class="mrp">${fmt(b.mrp)}</span><span class="off">${off}% OFF</span>`:''}
        </div>
        <button class="btn btn-outline btn-sm btn-block" data-add="${b.id}" style="margin-top:8px">Add bundle to cart</button>
      </div>
    </article>`;
  }

  function renderInto(sel, list, limit){
    const el = document.querySelector(sel);
    if(!el) return;
    let items = list || ALL;
    if(limit) items = items.slice(0, limit);
    el.innerHTML = items.map(cardHTML).join('');
    initReveal();
  }
  function renderBundles(sel, limit){
    const el = document.querySelector(sel);
    if(!el) return;
    let items = BUNDLES;
    if(limit) items = items.slice(0, limit);
    el.innerHTML = items.map(bundleCardHTML).join('');
    initReveal();
  }

  function applyShop(){
    const grid = document.getElementById('shop-grid');
    if(!grid) return;
    const curlChecks = [...document.querySelectorAll('.f-curl:checked')].map(c=>c.value);
    const concernChecks = [...document.querySelectorAll('.f-concern:checked')].map(c=>c.value);
    const catChecks = [...document.querySelectorAll('.f-cat:checked')].map(c=>c.value);
    const ratingMin = +(document.querySelector('.f-rating:checked')?.value || 0);
    const sort = document.getElementById('shop-sort')?.value || 'featured';

    let list = ALL.filter(p=>{
      if(curlChecks.length && !curlChecks.some(c=>p.curlType.includes(c)||p.curlType.includes('all'))) return false;
      if(concernChecks.length && !concernChecks.some(c=>p.concern.includes(c))) return false;
      if(catChecks.length && !catChecks.includes(p.category)) return false;
      if(p.rating < ratingMin) return false;
      return true;
    });
    if(sort==='price-asc') list.sort((a,b)=>a.price-b.price);
    if(sort==='price-desc') list.sort((a,b)=>b.price-a.price);
    if(sort==='rating') list.sort((a,b)=>b.rating-a.rating);
    if(sort==='new') list.sort((a,b)=>(b.badge==='New')-(a.badge==='New'));
    document.getElementById('shop-count').textContent = list.length + ' products';
    grid.innerHTML = list.map(cardHTML).join('') || '<p>No products match.</p>';
    initReveal();
  }

  function initReveal(){
    const io = new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
    },{threshold:.1});
    document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
  }

  function renderPDP(){
    const wrap = document.getElementById('pdp');
    if(!wrap) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const isBundle = params.get('type')==='bundle';
    const item = isBundle ? BUNDLES.find(b=>b.id===id) : ALL.find(p=>p.id===id);
    if(!item){ wrap.innerHTML = '<p>Product not found.</p>'; return; }

    const images = item.images || [item.image];
    const off = item.mrp ? Math.round((1-item.price/item.mrp)*100) : 0;
    document.title = item.title + ' | The Curl Co';
    document.querySelector('meta[name=description]')?.setAttribute('content',(item.shortDesc||item.description||'').slice(0,150));

    wrap.innerHTML = `
      <nav class="breadcrumb"><a href="index.html">Home</a><span>/</span><a href="shop.html">Shop</a><span>/</span>${item.title}</nav>
      <div class="pdp-grid">
        <div class="pdp-gallery">
          <div class="pdp-thumbs">
            ${images.map((src,i)=>`<button class="${i===0?'active':''}" data-i="${i}"><img src="${src}" alt="${item.title} ${i+1}"></button>`).join('')}
          </div>
          <div class="pdp-main"><img id="pdp-main-img" src="${images[0]}" alt="${item.title}"></div>
        </div>
        <div class="pdp-info">
          ${item.badge?`<span class="chip" style="background:var(--aubergine);color:var(--cream);border-color:var(--aubergine)">${item.badge}</span>`:''}
          <h1>${item.title}</h1>
          <div class="product-sub">${item.subtitle||''}</div>
          <div class="pdp-rating"><span class="stars">${stars(item.rating||4.7)}</span><span>${item.rating||4.7} (${item.reviews||120} reviews)</span><a href="#reviews">Read reviews</a></div>
          <div class="pdp-price">
            <span class="price">${fmt(item.price)}</span>
            ${item.mrp?`<span class="mrp">${fmt(item.mrp)}</span><span class="off">${off}% OFF</span>`:''}
          </div>
          <p>${item.shortDesc||item.description||''}</p>
          <div class="variant-row" id="pdp-variants">
            <span class="variant-chip active">${item.subtitle||'Default'}</span>
          </div>
          <div style="display:flex;gap:12px;align-items:center;margin:18px 0">
            <div class="qty-stepper" id="pdp-qty">
              <button data-d="-1">-</button><span>1</span><button data-d="1">+</button>
            </div>
            <span style="font-size:.85rem;color:var(--muted)">In stock — ships in 2-3 days</span>
          </div>
          <div class="pdp-buy-row">
            <button class="btn btn-primary btn-lg" id="pdp-add" data-add="${item.id}">Add to cart</button>
            <a class="btn btn-secondary btn-lg" id="pdp-buy" href="checkout.html?buy=${item.id}">Buy now</a>
          </div>
          <div class="pdp-trust">
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h13l3 4v6h-3"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M3 7v10h2"/></svg> Free shipping over ₹599</div>
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z"/></svg> COD available</div>
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg> Easy 7-day returns</div>
          </div>
          <div class="tabs">
            <button class="tab active" data-t="desc">Description</button>
            <button class="tab" data-t="ing">Ingredients</button>
            <button class="tab" data-t="use">How to use</button>
            <button class="tab" data-t="faq">FAQs</button>
          </div>
          <div class="tab-panel active" id="t-desc"><p>${item.description||''}</p></div>
          <div class="tab-panel" id="t-ing"><p>${item.ingredients||'Premium curl-friendly ingredients.'}</p></div>
          <div class="tab-panel" id="t-use"><p>${item.howToUse||'Apply on wet hair and scrunch.'}</p></div>
          <div class="tab-panel" id="t-faq">${(item.faqs||[]).map(f=>`<div style="margin-bottom:14px"><strong>${f.q}</strong><p style="margin:4px 0 0;color:var(--muted)">${f.a}</p></div>`).join('') || '<p>No FAQs yet.</p>'}</div>
        </div>
      </div>
    `;

    // FBT
    if(!isBundle){
      const others = ALL.filter(p=>p.id!==item.id).slice(0,2);
      const fbtList = [item, ...others];
      const fbtTotal = fbtList.reduce((s,p)=>s+p.price,0);
      const fbtMrp = fbtList.reduce((s,p)=>s+(p.mrp||p.price),0);
      const save = fbtMrp - fbtTotal;
      const html = `<h2 style="margin-top:64px">Frequently bought together</h2>
        <div class="fbt">
          ${fbtList.map((p,i)=>`<div class="fbt-prod"><img src="${p.images[0]}"><div>${p.title}</div><strong>${fmt(p.price)}</strong></div>${i<fbtList.length-1?'<div class="fbt-plus">+</div>':''}`).join('')}
          <div class="fbt-cta">
            <div style="margin-bottom:8px">Total <strong>${fmt(fbtTotal)}</strong> <span class="off">Save ${fmt(save)}</span></div>
            <button class="btn btn-primary btn-block" id="fbt-add">Add all to cart</button>
          </div>
        </div>`;
      wrap.insertAdjacentHTML('beforeend', html);
      document.getElementById('fbt-add')?.addEventListener('click', ()=>{
        fbtList.forEach(p=>window.CurlcoCart.add(p.id,1));
      });
      // Recently viewed / routine
      const routineHTML = `<h2 style="margin-top:64px">Complete your routine</h2>
        <div class="product-grid">${others.concat(ALL.slice(3,5)).slice(0,4).map(cardHTML).join('')}</div>`;
      wrap.insertAdjacentHTML('beforeend', routineHTML);
    }

    // reviews block
    fetch('data/reviews.json').then(r=>r.json()).then(rev=>{
      const list = rev.filter(r=>r.product===item.id).concat(rev.slice(0,3)).slice(0,6);
      const block = document.createElement('section');
      block.id='reviews';
      block.innerHTML = `<h2 style="margin-top:64px">Reviews (${item.reviews||list.length})</h2>
        <div class="review-wall">${list.map(r=>`<article class="review-card"><div class="stars">${stars(r.rating)}</div><h4>${r.title}</h4><p>${r.text}</p><div class="meta">— ${r.name}${r.verified?' <span class="verified-tag">Verified buyer</span>':''}</div>${r.image?`<img src="${r.image}" alt="${r.name}" loading="lazy">`:''}</article>`).join('')}</div>`;
      wrap.appendChild(block);
    });

    // gallery + tabs + qty
    wrap.addEventListener('click', e=>{
      const t = e.target.closest('.pdp-thumbs button');
      if(t){
        wrap.querySelectorAll('.pdp-thumbs button').forEach(b=>b.classList.remove('active'));
        t.classList.add('active');
        document.getElementById('pdp-main-img').src = images[+t.dataset.i];
      }
      const tab = e.target.closest('.tab');
      if(tab){
        wrap.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
        wrap.querySelectorAll('.tab-panel').forEach(b=>b.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('t-'+tab.dataset.t).classList.add('active');
      }
      const qb = e.target.closest('#pdp-qty button');
      if(qb){
        const sp = document.querySelector('#pdp-qty span');
        sp.textContent = Math.max(1, +sp.textContent + (+qb.dataset.d));
      }
    });

    // JSON-LD
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      "@context":"https://schema.org","@type":"Product",
      "name":item.title,"description":item.description||item.shortDesc,
      "image":images,"brand":{"@type":"Brand","name":"The Curl Co"},
      "offers":{"@type":"Offer","price":item.price,"priceCurrency":"INR","availability":"https://schema.org/InStock"},
      "aggregateRating":{"@type":"AggregateRating","ratingValue":item.rating||4.7,"reviewCount":item.reviews||120}
    });
    document.head.appendChild(ld);

    document.body.classList.add('pdp');
    initReveal();
  }

  window.CurlcoRender = { renderInto, renderBundles, applyShop, renderPDP, loadAll, cardHTML, bundleCardHTML, initReveal };

})();
