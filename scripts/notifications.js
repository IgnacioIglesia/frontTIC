(() => {
  const LS_KEY = 'lot_notifications';

  const api = {
    list() {
      try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
      catch { return []; }
    },
    save(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); },
    add({ title, message, timestamp = new Date().toISOString(), read = false }) {
      const list = api.list();
      list.unshift({ title, message, timestamp, read });
      api.save(list);
      ui.updateBadge(); ui.render();
    },
    unreadCount() { return api.list().filter(n => !n.read).length; },
    markAllRead() { const l = api.list().map(n => ({...n, read:true})); api.save(l); ui.updateBadge(); ui.render(); },
    del(index) { const l = api.list(); l.splice(index,1); api.save(l); ui.updateBadge(); ui.render(); }
  };

  // ------- UI -------
  const ui = {
    ensureMarkup() {
      // Si ya existe, no hagas nada
      if (document.getElementById('notBtn')) return;

      // Buscamos un contenedor razonable (botonera del header)
      const actions = document.querySelector('.actions') || document.querySelector('.top .container, header .top');
      if (!actions) return;

      const wrap = document.createElement('div');
      wrap.className = 'not-dd-wrapper';
      wrap.innerHTML = `
        <button class="pill" id="notBtn" aria-label="Abrir notificaciones">🔔<span id="notCount">0</span></button>
        <div id="notDropdown" class="not-dropdown" hidden>
          <div class="not-dd-header">
            <strong>Notificaciones</strong>
            <a href="#" id="markAllRead" class="muted">Marcar todas como leídas</a>
          </div>
          <div id="notList" class="not-dd-list"></div>
        </div>`;
      actions.appendChild(wrap);
    },

    q(id) { return document.getElementById(id); },

    formatTime(ts) {
      const now = new Date(), diff = now - new Date(ts);
      const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
      if(m<1) return 'Ahora mismo'; if(m<60) return `Hace ${m} min`; if(h<24) return `Hace ${h} h`;
      if(d<7) return `Hace ${d} d`; return new Date(ts).toLocaleDateString();
    },

    updateBadge() {
      const countEl = ui.q('notCount'); const btn = ui.q('notBtn'); if(!countEl || !btn) return;
      const unread = api.unreadCount();
      countEl.textContent = unread;
      btn.classList.toggle('has-notifications', unread > 0);
    },

    render() {
      const listEl = ui.q('notList'); if(!listEl) return;
      const list = api.list();
      listEl.innerHTML = '';

      if (!list.length) {
        listEl.innerHTML = `<div class="not-dd-empty">
          <div style="font-size:22px; margin-bottom:6px;">🔔</div>
          No tienes notificaciones
        </div>`;
        return;
      }

      list.forEach((not, index) => {
        const el = document.createElement('div');
        el.className = `not-item ${not.read ? '' : 'unread'}`;
        el.innerHTML = `
          <div class="icon">🟡</div>
          <div>
            <div class="title">${not.title}</div>
            <div class="desc">${not.message}</div>
          </div>
          <div class="right">
            <div class="time">${ui.formatTime(not.timestamp)}</div>
            <button class="not-del" data-idx="${index}" aria-label="Borrar notificación" title="Borrar">🗑</button>
          </div>
        `;

        // Marcar leída (si no clickeó la papelera)
        el.addEventListener('click', (e) => {
          if (e.target.closest('.not-del')) return;
          const list = api.list();
          list[index].read = true;
          api.save(list);
          ui.updateBadge();
          ui.render();
        });

        listEl.appendChild(el);
      });

      // Papelera
      listEl.querySelectorAll('.not-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          api.del(Number(btn.dataset.idx));
        });
      });
    },

    wire() {
      const btn = ui.q('notBtn'), dd = ui.q('notDropdown'), mark = ui.q('markAllRead');
      if(!btn || !dd || !mark) return;

      const open = ()=> dd.hidden = false;
      const close = ()=> dd.hidden = true;

      btn.addEventListener('click', (e)=>{ e.stopPropagation(); dd.hidden ? open() : close(); });
      document.addEventListener('click', (e)=>{ if(!dd.hidden && !e.target.closest('.not-dd-wrapper')) close(); });
      mark.addEventListener('click', (e)=>{ e.preventDefault(); api.markAllRead(); });
    },

    seedIfEmpty() {
      const list = api.list();
      if (list.length) return;
      api.save([
        { title:"¡Bienvenido a La Otra Tribuna!", message:"Explorá nuestro catálogo de camisetas únicas.", timestamp:new Date(Date.now()-1000*60*5).toISOString(), read:false },
      ]);
    }
  };

  // Inicialización
  document.addEventListener('DOMContentLoaded', () => {
    ui.ensureMarkup();
    ui.seedIfEmpty();
    ui.updateBadge();
    ui.render();
    ui.wire();
  });

  // API pública
  window.Notifications = {
    add: api.add,
    unread: api.unreadCount,
    markAllRead: api.markAllRead
  };
})();