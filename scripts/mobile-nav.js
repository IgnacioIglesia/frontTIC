// scripts/mobile-nav.js
(function(){
  const burger   = document.querySelector('.burger');
  const drawer   = document.getElementById('mnav');
  const closeBtn = drawer?.querySelector('.close-mnav');
  const overlay  = document.getElementById('overlay');

  function openMnav(){
    drawer?.classList.add('open');
    overlay?.classList.add('show');
    burger?.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function closeMnav(){
    drawer?.classList.remove('open');
    overlay?.classList.remove('show');
    burger?.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }

  burger?.addEventListener('click', openMnav);
  closeBtn?.addEventListener('click', closeMnav);
  overlay?.addEventListener('click', closeMnav);
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMnav(); });

  // Sincroniza el buscador del drawer (#mq) con el de la página (#q) si existe
  const q     = document.getElementById('q');      // puede NO existir
  const mq    = document.getElementById('mq');
  const mMenu = document.getElementById('msearchMenu');
  const mainMenu = document.getElementById('searchMenu'); // puede NO existir

  function syncAndRender(v){
    if(!q) return;
    q.value = v || '';
    q.dispatchEvent(new Event('input', {bubbles:true}));
  }

  mq?.addEventListener('input', ()=>{
    syncAndRender(mq.value);
    if(mainMenu && mMenu){ mMenu.innerHTML = mainMenu.innerHTML; mMenu.hidden = mainMenu.hidden; }
  });
  mq?.addEventListener('focus', ()=>{
    if(mainMenu && mMenu){ mMenu.innerHTML = mainMenu.innerHTML; mMenu.hidden = false; }
  });
  document.addEventListener('click', (e)=>{
    if(mMenu && !mMenu.contains(e.target) && e.target !== mq) mMenu.hidden = true;
  });
})();
