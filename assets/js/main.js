// Main: nav, announcement, before-after, animations, forms
(function(){

  // ===== Announcement rotator =====
  const messages = [
    "Free shipping on prepaid orders over <strong>₹599</strong>",
    "<strong>COD</strong> available across India",
    "Use code <strong>CURL10</strong> for 10% off your first order",
    "Sulphate-free • Silicone-free • Made in India"
  ];
  let idx = 0;
  const ann = document.getElementById('announce-msg');
  if(ann){
    ann.innerHTML = messages[0];
    setInterval(()=>{
      idx = (idx+1)%messages.length;
      ann.style.opacity='0';
      setTimeout(()=>{ ann.innerHTML = messages[idx]; ann.style.opacity='1'; }, 300);
    }, 4200);
  }

  // ===== Mobile nav =====
  document.querySelector('.hamburger')?.addEventListener('click', ()=>{
    document.querySelector('.mobile-nav')?.classList.add('open');
    document.body.style.overflow='hidden';
  });
  document.querySelector('.close-mobile')?.addEventListener('click', ()=>{
    document.querySelector('.mobile-nav')?.classList.remove('open');
    document.body.style.overflow='';
  });

  // ===== Search overlay =====
  document.querySelector('.open-search')?.addEventListener('click', e=>{
    e.preventDefault();
    document.querySelector('.search-overlay')?.classList.add('open');
    setTimeout(()=>document.querySelector('.search-overlay input')?.focus(),100);
  });
  document.querySelector('.close-search')?.addEventListener('click', ()=>{
    document.querySelector('.search-overlay')?.classList.remove('open');
  });
  document.querySelector('#search-form')?.addEventListener('submit', e=>{
    e.preventDefault();
    const q = e.target.querySelector('input').value.trim().toLowerCase();
    if(!q) return;
    location.href = 'shop.html?q=' + encodeURIComponent(q);
  });

  // ===== Before/After slider =====
  document.querySelectorAll('.ba-slider').forEach(slider=>{
    const handle = slider.querySelector('.ba-handle');
    const after = slider.querySelector('.ba-after');
    let dragging = false;
    function set(x){
      const rect = slider.getBoundingClientRect();
      const p = Math.max(0,Math.min(100, ((x-rect.left)/rect.width)*100));
      handle.style.left = p+'%';
      after.style.clipPath = `inset(0 0 0 ${p}%)`;
    }
    slider.addEventListener('pointerdown',e=>{dragging=true;set(e.clientX);slider.setPointerCapture(e.pointerId);});
    slider.addEventListener('pointermove',e=>{if(dragging)set(e.clientX);});
    slider.addEventListener('pointerup',()=>dragging=false);
  });

  // ===== Newsletter =====
  document.querySelectorAll('.nl-form, #nl-form').forEach(f=>{
    f.addEventListener('submit', e=>{
      e.preventDefault();
      const email = f.querySelector('input[type=email]')?.value;
      if(!email) return;
      window.CurlcoCart?.toast('Thank you! Check your inbox for the 10% off code.', 'success');
      f.reset();
    });
  });

  // ===== Generic form (contact) =====
  document.querySelectorAll('form[data-form]').forEach(f=>{
    f.addEventListener('submit', e=>{
      e.preventDefault();
      window.CurlcoCart?.toast('Message sent! We\'ll get back within 24 hours.', 'success');
      f.reset();
    });
  });

  // ===== Accordion =====
  document.addEventListener('click', e=>{
    const b = e.target.closest('.accordion-btn');
    if(b) b.parentElement.classList.toggle('open');
  });

  // ===== Reels modal =====
  document.addEventListener('click', e=>{
    const r = e.target.closest('.reel');
    if(r){
      const m = document.createElement('div');
      m.className='modal open';
      m.innerHTML = `<div class="modal-card" style="max-width:380px;padding:0;overflow:hidden;background:#000">
        <button class="modal-close" style="background:#fff;z-index:2">×</button>
        <video src="${r.dataset.video||''}" poster="${r.querySelector('img')?.src}" controls autoplay style="width:100%;aspect-ratio:9/16;background:#000"></video>
      </div>`;
      document.body.appendChild(m);
      m.addEventListener('click',ev=>{ if(ev.target===m||ev.target.closest('.modal-close')) m.remove(); });
    }
  });

  // ===== Reveal animations =====
  function initReveal(){
    const io = new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
    },{threshold:.1});
    document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el));
  }

  // ===== Footer year =====
  document.querySelectorAll('.year').forEach(e=>e.textContent = new Date().getFullYear());

  // ===== Page bootstrap =====
  document.addEventListener('DOMContentLoaded', async ()=>{
    initReveal();

    if(window.CurlcoRender){
      await window.CurlcoRender.loadAll();
      // homepage grids
      if(document.getElementById('best-grid')){
        const all = window.CurlcoProducts.all;
        window.CurlcoRender.renderInto('#best-grid',
          all.filter(p=>p.badge==='Bestseller').concat(all).slice(0,4));
      }
      if(document.getElementById('home-bundles')) window.CurlcoRender.renderBundles('#home-bundles',3);
      if(document.getElementById('shop-grid')){
        window.CurlcoRender.applyShop();
        document.querySelectorAll('.f-curl,.f-concern,.f-cat,.f-rating,#shop-sort')
          .forEach(el=>el.addEventListener('change', window.CurlcoRender.applyShop));
      }
      if(document.getElementById('bundles-page')) window.CurlcoRender.renderBundles('#bundles-page');
      if(document.getElementById('pdp')) window.CurlcoRender.renderPDP();
      if(document.getElementById('related-grid')){
        const all = window.CurlcoProducts.all;
        window.CurlcoRender.renderInto('#related-grid', all.slice(0,4));
      }
      initReveal();
    }

    // FAQs render
    if(document.getElementById('faq-list')){
      fetch('data/faqs.json').then(r=>r.json()).then(data=>{
        document.getElementById('faq-list').innerHTML = data.map(cat=>`
          <h3 style="margin-top:32px">${cat.category}</h3>
          <div class="accordion">${cat.items.map(it=>`
            <div class="accordion-item">
              <button class="accordion-btn">${it.q}</button>
              <div class="accordion-body"><p>${it.a}</p></div>
            </div>`).join('')}
          </div>`).join('');
        // FAQ JSON-LD
        const all = data.flatMap(c=>c.items);
        const ld = document.createElement('script');
        ld.type='application/ld+json';
        ld.textContent = JSON.stringify({
          "@context":"https://schema.org","@type":"FAQPage",
          "mainEntity": all.map(i=>({"@type":"Question","name":i.q,"acceptedAnswer":{"@type":"Answer","text":i.a}}))
        });
        document.head.appendChild(ld);
      });
      // FAQ search
      document.getElementById('faq-search')?.addEventListener('input', e=>{
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#faq-list .accordion-item').forEach(it=>{
          it.style.display = it.textContent.toLowerCase().includes(q)?'':'none';
        });
      });
    }
  });

})();
