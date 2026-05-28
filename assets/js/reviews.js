// Reviews wall
(function(){
  const stars = r => '★★★★★☆☆☆☆☆'.slice(5 - Math.round(r), 10 - Math.round(r));
  let ALL = [];

  async function load(){
    if(!document.getElementById('review-wall') && !document.getElementById('home-reviews')) return;
    try{
      ALL = await fetch('data/reviews.json').then(r=>r.json());
      render(ALL);
    }catch(e){ console.error(e); }
  }
  function card(r){
    return `<article class="review-card">
      <div class="stars">${stars(r.rating)}</div>
      <h4>${r.title}</h4>
      <p>${r.text}</p>
      <div class="meta">— ${r.name}${r.verified?' <span class="verified-tag">Verified buyer</span>':''} · ${r.date||''}</div>
      ${r.image?`<img src="${r.image}" alt="Review from ${r.name}" loading="lazy" data-light>`:''}
    </article>`;
  }
  function render(list){
    const wall = document.getElementById('review-wall');
    if(wall) wall.innerHTML = list.map(card).join('');
    const home = document.getElementById('home-reviews');
    if(home) home.innerHTML = list.slice(0,9).map(card).join('');
    window.CurlcoRender?.initReveal();
  }

  document.addEventListener('click', e=>{
    const f = e.target.closest('[data-rfilter]');
    if(f){
      document.querySelectorAll('[data-rfilter]').forEach(b=>b.classList.remove('active'));
      f.classList.add('active');
      const v = f.dataset.rfilter;
      if(v==='all') render(ALL);
      else if(v==='photo') render(ALL.filter(r=>r.image));
      else render(ALL.filter(r=>r.rating===+v));
    }
    const img = e.target.closest('[data-light]');
    if(img){
      const m = document.createElement('div');
      m.className='modal open';
      m.innerHTML = `<div class="modal-card" style="max-width:700px;background:transparent;padding:0">
        <button class="modal-close" aria-label="Close">×</button>
        <img src="${img.src}" alt="" style="border-radius:14px;max-height:80vh;object-fit:contain;width:100%">
      </div>`;
      document.body.appendChild(m);
      m.addEventListener('click',ev=>{ if(ev.target===m||ev.target.closest('.modal-close')) m.remove(); });
    }
  });

  document.addEventListener('DOMContentLoaded', load);
})();
