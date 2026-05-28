// Cart module
(function(){
  const KEY = 'curlco_cart_v1';
  const FREE_THRESHOLD = 599;

  const state = { items: [], wish: [], products: [] };

  function load(){
    try{
      const raw = localStorage.getItem(KEY);
      if(raw) state.items = JSON.parse(raw);
      const w = localStorage.getItem('curlco_wish_v1');
      if(w) state.wish = JSON.parse(w);
    }catch(e){}
  }
  function save(){
    localStorage.setItem(KEY, JSON.stringify(state.items));
    localStorage.setItem('curlco_wish_v1', JSON.stringify(state.wish));
  }
  function fmt(n){ return '₹' + Math.round(n).toLocaleString('en-IN'); }
  function totalItems(){ return state.items.reduce((s,i)=>s+i.qty,0); }
  function subtotal(){ return state.items.reduce((s,i)=>s+i.qty*i.price,0); }

  function findProduct(id){ return state.products.find(p=>p.id===id); }

  function add(id, qty=1, variant=''){
    const p = findProduct(id);
    if(!p) return;
    const key = id + '|' + variant;
    const ex = state.items.find(i=>i.key===key);
    if(ex) ex.qty += qty;
    else state.items.push({
      key, id, variant,
      title:p.title, price:p.price, image:p.images[0]
    });
    save();render();open();toast('Added to cart');
  }
  function remove(key){
    state.items = state.items.filter(i=>i.key!==key);
    save();render();
  }
  function changeQty(key, delta){
    const it = state.items.find(i=>i.key===key);
    if(!it) return;
    it.qty = Math.max(1, it.qty + delta);
    save();render();
  }
  function wishToggle(id){
    const idx = state.wish.indexOf(id);
    if(idx>-1) state.wish.splice(idx,1); else state.wish.push(id);
    save();renderWish();
    toast(idx>-1?'Removed from wishlist':'Added to wishlist');
  }
  function renderWish(){
    document.querySelectorAll('.product-wish[data-id]').forEach(b=>{
      b.classList.toggle('active', state.wish.includes(b.dataset.id));
    });
  }

  function open(){
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('backdrop')?.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function close(){
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('backdrop')?.classList.remove('open');
    document.body.style.overflow='';
  }

  function render(){
    // badge
    document.querySelectorAll('.cart-count').forEach(el=>el.textContent = totalItems());
    document.querySelectorAll('.cart-count').forEach(el=>el.style.display = totalItems()? 'flex':'none');
    // drawer body
    const body = document.getElementById('cart-body');
    const sub = subtotal();
    if(!body) return;
    if(!state.items.length){
      body.innerHTML = `<div class="cart-empty">
        <p>Your cart is empty.</p>
        <a href="shop.html" class="btn btn-primary">Shop the routine</a>
      </div>`;
    }else{
      body.innerHTML = state.items.map(i=>`
        <div class="cart-item">
          <img src="${i.image}" alt="${i.title}" loading="lazy">
          <div>
            <h4>${i.title}</h4>
            <div class="sub">${i.variant||''}</div>
            <div class="qty">
              <button data-act="dec" data-key="${i.key}">-</button>
              <span>${i.qty}</span>
              <button data-act="inc" data-key="${i.key}">+</button>
            </div>
          </div>
          <div class="end">
            <strong>${fmt(i.qty*i.price)}</strong>
            <button class="rm" data-act="rm" data-key="${i.key}">Remove</button>
          </div>
        </div>`).join('');
    }
    // free-ship
    const remain = Math.max(0, FREE_THRESHOLD - sub);
    const pct = Math.min(100, (sub/FREE_THRESHOLD)*100);
    const fb = document.getElementById('free-bar');
    if(fb){
      fb.innerHTML = remain>0
        ? `Add <strong>${fmt(remain)}</strong> more for FREE shipping
           <div class="bar"><div class="fill" style="width:${pct}%"></div></div>`
        : `You unlocked <strong>FREE shipping!</strong> <div class="bar"><div class="fill" style="width:100%"></div></div>`;
    }
    // foot
    const foot = document.getElementById('cart-foot');
    if(foot){
      foot.style.display = state.items.length? 'block':'none';
      foot.innerHTML = `
        <div class="subtotal"><span>Subtotal</span><strong>${fmt(sub)}</strong></div>
        <a href="checkout.html" class="btn btn-primary btn-block btn-lg">Checkout</a>
        <a href="cart.html" class="btn btn-ghost btn-block" style="margin-top:8px">View cart</a>`;
    }
  }

  function toast(msg, type=''){
    let wrap = document.querySelector('.toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(),400); }, 2400);
  }

  document.addEventListener('click', e=>{
    const t = e.target.closest('[data-act]');
    if(t && t.closest('.cart-item, .drawer')){
      const k = t.dataset.key, a = t.dataset.act;
      if(a==='inc') changeQty(k,1);
      if(a==='dec') changeQty(k,-1);
      if(a==='rm') remove(k);
    }
    if(e.target.closest('.open-cart')){ e.preventDefault(); open(); }
    if(e.target.closest('.close-cart')||e.target.id==='backdrop'){ close(); }
    if(e.target.closest('[data-add]')){
      e.preventDefault();
      const id = e.target.closest('[data-add]').dataset.add;
      add(id,1);
    }
    if(e.target.closest('.product-wish')){
      e.preventDefault();
      wishToggle(e.target.closest('.product-wish').dataset.id);
    }
  });

  document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });

  window.CurlcoCart = { add, remove, changeQty, open, close, render, renderWish,
    setProducts:p=>{ state.products=p; renderWish(); render(); },
    getItems:()=>state.items, getSubtotal:subtotal, fmt, toast };

  load();
  document.addEventListener('DOMContentLoaded', render);
})();
