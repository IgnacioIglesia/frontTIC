const PLACEHOLDER = 'https://placehold.co/600x750?text=Camiseta';
const uy = new Intl.NumberFormat('es-UY', { style:'currency', currency:'UYU', maximumFractionDigits:0 });

let escHandler = null;
let overlayHandler = null;

function cerrarModal(modal){
  modal?.remove();
  if (escHandler) document.removeEventListener('keydown', escHandler);
  const overlay = document.getElementById('overlay');
  if (overlay && overlayHandler) overlay.removeEventListener('click', overlayHandler);
  escHandler = overlayHandler = null;
  // Usa tu helper para no apagar overlay si está abierto carrito/ubicación
  window.hideOverlayIfIdle?.();
}

export function abrirModalPublicacion(pub){
  // Quitar modal previo si quedara alguno
  document.getElementById('dynamicModal')?.remove();

  // Estructura modal
  const modal = document.createElement('div');
  modal.id = 'dynamicModal';
  modal.className = 'modal open';
  modal.innerHTML = `
    <div class="modal-card product-card">
      <button class="modal-close" aria-label="Cerrar">✕</button>
      <div class="product-grid">
        <div class="product-media">
          <img id="mdImg" alt="">
        </div>
        <div class="product-info">
          <h3 id="mdTitle"></h3>
          <div class="pd-price" id="mdPrice"></div>
          <dl class="pd-meta">
            <div><dt>Categoría</dt><dd id="mdCat"></dd></div>
            <div><dt>Talle</dt><dd id="mdTalle"></dd></div>
            <div><dt>Condición</dt><dd id="mdCond"></dd></div>
            <div><dt>Autenticidad</dt><dd id="mdAuth"></dd></div>
            <div><dt>Stock</dt><dd id="mdStock"></dd></div>
          </dl>
          <p class="pd-desc" id="mdDesc"></p>
          <div class="pd-seller">
            <div class="user-avatar" id="mdAvatar"></div>
            <div>
              <div class="pd-seller-name" id="mdSeller"></div>
              <div class="muted" id="mdSellerEmail"></div>
            </div>
          </div>
          <div class="pd-actions">
            <button class="btn primary" id="mdAdd">Agregar al carrito</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Completar datos
  const img = modal.querySelector('#mdImg');
  img.src = pub.img || '';
  img.alt = pub.nombre || 'Publicación';
  img.onerror = () => { img.src = PLACEHOLDER; };

  modal.querySelector('#mdTitle').textContent = pub.nombre || 'Publicación';
  modal.querySelector('#mdPrice').textContent = uy.format(pub.precio || 0);
  modal.querySelector('#mdCat').textContent   = pub.categoria || '—';
  modal.querySelector('#mdTalle').textContent = pub.talle || '—';
  modal.querySelector('#mdCond').textContent  = pub.condicion || '—';
  modal.querySelector('#mdAuth').textContent  = pub.autenticidad || '—';
  modal.querySelector('#mdStock').textContent = (pub.stock ?? '—');
  modal.querySelector('#mdDesc').textContent  = pub.descripcion || '—';

  const sellerName  = pub.sellerName || 'Usuario';
  const sellerEmail = pub.sellerEmail || '';
  modal.querySelector('#mdSeller').textContent = sellerName;
  modal.querySelector('#mdSellerEmail').textContent = sellerEmail;
  modal.querySelector('#mdAvatar').textContent =
    (sellerName.split(/\s+/).map(s => s[0]).join('').slice(0,2) || '?').toUpperCase();

  // Cierres
  const overlay = document.getElementById('overlay');
  escHandler = (e) => { if (e.key === 'Escape') cerrarModal(modal); };
  document.addEventListener('keydown', escHandler);
  overlayHandler = () => cerrarModal(modal);
  overlay?.addEventListener('click', overlayHandler, { once: true });
  modal.querySelector('.modal-close').addEventListener('click', () => cerrarModal(modal));

  // Agregar al DOM y mostrar overlay
  document.body.appendChild(modal);
  window.showOverlay?.();

  // Agregar al carrito
  modal.querySelector('#mdAdd').addEventListener('click', () => {
    if (window.cart && window.saveCart && window.updateCartUI) {
      window.cart.set(pub.id, (window.cart.get(pub.id) || 0) + 1);
      window.saveCart();
      window.updateCartUI();
    } else {
      // Fallback ultra defensivo
      const m = new Map(Object.entries(JSON.parse(localStorage.getItem('lot_cart') || '{}')).map(([k,v]) => [+k, v]));
      m.set(pub.id, (m.get(pub.id) || 0) + 1);
      localStorage.setItem('lot_cart', JSON.stringify(Object.fromEntries(m)));
    }

    // Abrir panel carrito y mantener overlay si corresponde
    document.getElementById('cartMenu')?.classList.add('open');
    cerrarModal(modal);
    document.getElementById('overlay')?.classList.add('show');
  });
}