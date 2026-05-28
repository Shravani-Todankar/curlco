// Routine Quiz
(function(){
  const steps = [
    {
      q:"What's your curl pattern?",
      sub:"Pick the one closest to your natural texture.",
      key:"pattern",
      opts:[
        {v:"2a-2b",t:"Loose waves",d:"S-shaped waves, mostly straight at roots"},
        {v:"2c-3a",t:"Defined waves to loose curls",d:"Defined curls, beachy texture"},
        {v:"3b",t:"Springy curls",d:"Tight ringlets the size of a marker"},
        {v:"3c-4a",t:"Tight coils",d:"Corkscrews and coily texture"}
      ]
    },
    {
      q:"How does your hair feel after a wash?",
      sub:"This tells us about your porosity.",
      key:"porosity",
      opts:[
        {v:"low",t:"Water beads on hair",d:"Low porosity — needs lightweight humectants"},
        {v:"med",t:"Dries normally",d:"Medium porosity — easy to style"},
        {v:"high",t:"Dries very fast",d:"High porosity — needs sealing moisture"}
      ]
    },
    {
      q:"How is your scalp?",
      key:"scalp",
      opts:[
        {v:"oily",t:"Oily / quick to grease",d:""},
        {v:"dry",t:"Dry / flaky",d:""},
        {v:"normal",t:"Balanced",d:""},
        {v:"sensitive",t:"Sensitive / itchy",d:""}
      ]
    },
    {
      q:"What's your biggest concern?",
      key:"concern",
      opts:[
        {v:"frizz",t:"Frizz",d:"Smooth and defined curls"},
        {v:"definition",t:"More definition",d:"Clumped, springy curls"},
        {v:"volume",t:"Volume",d:"Lift at the roots, bouncy curls"},
        {v:"moisture",t:"Moisture",d:"Hydrated, soft curls"}
      ]
    },
    {
      q:"How often do you wash?",
      key:"wash",
      opts:[
        {v:"1x",t:"Once a week",d:""},
        {v:"2x",t:"Twice a week",d:""},
        {v:"3+",t:"3 or more times a week",d:""}
      ]
    }
  ];

  const state = { step:0, answers:{} };

  function render(){
    const wrap = document.getElementById('quiz');
    if(!wrap) return;
    if(state.step >= steps.length) return renderResult();
    const s = steps[state.step];
    const pct = (state.step / steps.length) * 100;
    wrap.innerHTML = `
      <div class="progress"><div class="fill" style="width:${pct}%"></div></div>
      <p class="muted" style="margin-bottom:4px">Step ${state.step+1} of ${steps.length}</p>
      <h2>${s.q}</h2>
      ${s.sub?`<p class="lead">${s.sub}</p>`:''}
      <div class="quiz-options">
        ${s.opts.map(o=>`<button class="quiz-opt" data-v="${o.v}"><strong>${o.t}</strong>${o.d?`<span>${o.d}</span>`:''}</button>`).join('')}
      </div>
      <div class="quiz-nav">
        <button class="btn btn-ghost" id="q-back" ${state.step===0?'disabled':''}>Back</button>
      </div>
    `;
    wrap.querySelectorAll('.quiz-opt').forEach(b=>b.addEventListener('click',()=>{
      state.answers[s.key] = b.dataset.v;
      state.step++;
      render();
    }));
    document.getElementById('q-back')?.addEventListener('click',()=>{
      if(state.step>0){ state.step--; render(); }
    });
  }

  function pickRoutine(){
    const a = state.answers;
    // Cream: pattern 2 -> soft, 3+ -> strong
    const cream = (a.pattern && (a.pattern.startsWith('2a')||a.pattern.startsWith('2c'))) ? 'soft-hold-cream' : 'strong-hold-cream';
    const gel = (a.concern==='volume'||a.pattern==='3c-4a') ? 'hydrating-gel' : null;
    const ids = ['shampoo','conditioner', cream];
    if(gel) ids.push(gel);
    ids.push('shine-serum');
    return ids;
  }

  function renderResult(){
    const ids = pickRoutine();
    const all = window.CurlcoProducts?.all || [];
    const picks = ids.map(id=>all.find(p=>p.id===id)).filter(Boolean);
    const total = picks.reduce((s,p)=>s+p.price,0);
    const fmt = window.CurlcoCart.fmt;
    document.getElementById('quiz').innerHTML = `
      <div class="progress"><div class="fill" style="width:100%"></div></div>
      <span class="eyebrow">Your routine is ready</span>
      <h2>Your personalised curl routine</h2>
      <p class="lead">Based on your answers we recommend this ${picks.length}-step routine, formulated for ${state.answers.pattern} curls with a focus on ${state.answers.concern}.</p>
      <div class="product-grid" style="margin-top:32px">
        ${picks.map(p=>window.CurlcoRender.cardHTML(p)).join('')}
      </div>
      <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <div><span class="muted">Total: </span><strong style="font-family:var(--ff-serif);font-size:1.6rem;color:var(--aubergine)">${fmt(total)}</strong></div>
        <button class="btn btn-primary btn-lg" id="q-add-all">Add full routine to cart</button>
        <button class="btn btn-ghost" id="q-restart">Retake quiz</button>
      </div>
    `;
    document.getElementById('q-add-all').addEventListener('click', ()=>{
      picks.forEach(p=>window.CurlcoCart.add(p.id,1));
    });
    document.getElementById('q-restart').addEventListener('click', ()=>{
      state.step=0;state.answers={};render();
    });
    window.CurlcoRender.initReveal();
  }

  window.CurlcoQuiz = { start:render };
  document.addEventListener('DOMContentLoaded', ()=>{
    if(document.getElementById('quiz')) {
      // wait for products to load
      const t = setInterval(()=>{
        if(window.CurlcoProducts?.all?.length){ clearInterval(t); render(); }
      },50);
    }
  });
})();
