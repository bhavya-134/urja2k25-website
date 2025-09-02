//
// Basic UI helpers (nav, smooth scroll, back-to-top, year, countdown)
//
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('show');
  });
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id && id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
      navMenu?.classList.remove('show');
    }
  });
});
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (!backToTop) return;
  if (window.scrollY > 600) backToTop.style.display = 'block';
  else backToTop.style.display = 'none';
});
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

function initFlipCountdown() {
  const root = document.querySelector('.countdown');
  if (!root) return;
  const targetAttr = root.getAttribute('data-target');
  const targetDate = new Date(targetAttr || 'Sep 18, 2025 09:30:00 GMT+0530').getTime();
  const nodes = {
    days: root.querySelector('.flip[data-type="days"] .flip-card'),
    hours: root.querySelector('.flip[data-type="hours"] .flip-card'),
    minutes: root.querySelector('.flip[data-type="minutes"] .flip-card'),
    seconds: root.querySelector('.flip[data-type="seconds"] .flip-card'),
  };
  function pad2(n){ return n.toString().padStart(2,'0'); }
  function setCard(card, val){
    if (!card) return;
    const current = card.getAttribute('data-value') || '00';
    if (current === val) return;
    const top = card.querySelector('.card-face.top');
    const bottom = card.querySelector('.card-face.bottom');
    const front = card.querySelector('.flip-front');
    const back = card.querySelector('.flip-back');
    top.textContent = current; bottom.textContent = current; front.textContent = current; back.textContent = val;
    card.classList.remove('flip-animate'); void card.offsetWidth; card.classList.add('flip-animate');
    setTimeout(() => {
      top.textContent = val; bottom.textContent = val; card.setAttribute('data-value', val); card.classList.remove('flip-animate');
    }, 600);
  }
  function tick(){
    const now = Date.now();
    let dist = targetDate - now;
    if (dist <= 0) {
      ['days','hours','minutes','seconds'].forEach(k => setCard(nodes[k], '00'));
      const container = document.querySelector('.hero-countdown');
      if (container && !container.querySelector('.event-live')) {
        const live = document.createElement('p'); live.className = 'event-live'; live.textContent = '🎉 URJA is LIVE!'; container.appendChild(live);
      }
      return;
    }
    const days = Math.floor(dist / (1000*60*60*24)); dist %= (1000*60*60*24);
    const hours = Math.floor(dist / (1000*60*60)); dist %= (1000*60*60);
    const minutes = Math.floor(dist / (1000*60)); const seconds = Math.floor((dist % (1000*60)) / 1000);
    setCard(nodes.days, String(days).padStart(2,'0'));
    setCard(nodes.hours, pad2(hours));
    setCard(nodes.minutes, pad2(minutes));
    setCard(nodes.seconds, pad2(seconds));
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) document.querySelectorAll('.flip-card').forEach(card => card.classList.remove('flip-animate'));
  tick(); setInterval(tick, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  initFlipCountdown();

  /* ===========================
     Event data (edit here later)
     =========================== */
  const URJA_EVENTS = {
    "Aavishar": { title:"Aavishar", fees:["Presentation time: 5–7 minutes","Max team size: 3"], coordinators:["KALYAAN KAPADIA, AMIT RAINA"], volunteers:["RUPESH NIKAM"] },
    "Abhivyakthi": { title:"Abhivyakthi", fees:["Free"], coordinators:["KANHAI TRIVEDI, HARSHIT PATEL"], volunteers:["NISARG, AMAR"] },
    "Code-to-Circuit": { title:"Code to Circuit", fees:["Free"], coordinators:["BHAVYA THARAKAN,  YASHASVI AGARWAL, VISHWA PATEL"], volunteers:["RISHI, ADARSH, RIDHAM"] },
    "Game-of-Drone": { title:"Game of Drone", desc:"Placeholder for Game of Drone.", fees:["₹50/-"], coordinators:["VANSH PATEL, JIYA PATEL, PRISHA GANDHI"], volunteers:["PARI, NEEL, KASHYAP, MOXIT, SAHIL"] },
    "Quiz-Whitz-Blitz": { title:"Quiz Whitz Blitz", fees:["Free"], coordinators:["YASH JINWALA, MUEEN"], volunteers:["DAKSH PATEL, AYUSH, SANKET"] },
    "Escape-the-Unknown": { title:"Escape the Unknown", fees:["₹20/-"], coordinators:["DURVA PATEL, SURTI NAYAN, SHUBHAM PATEL"], volunteers:["JAINAM, KUNAL TAYADE"] },
    "The-Land-of-Ludo": { title:"The Land of Ludo", fees:["₹20/-"], coordinators:["MIHIR PAREKH, AYUSH GANDHI "], volunteers:["AMAR, DALAJA, PRAKASH"] },
    "Meme-Creation": { title:"Meme Creation", fees:["₹20/-"], coordinators:["MEET SURTI, HARSHAL ZAVERI"], volunteers:["JAY, ADITYA"] },
    "Bidwars": { title:"Bidwars", desc:"Placeholder for Bidwars.", fees:["Free"], coordinators:["YUG, BHAVYA JOSHI, SARVAGNA"], volunteers:["DHRUV MORE, VAISHNAVI, DHRUVI"] },
    "NFS": { title:"NFS", desc:"Placeholder for NFS.", fees:["Solo: ₹20/-     Duo: ₹30/-     Trio: ₹40/-"], coordinators:["SHIVAM VAISHNAV, JAHAN, DAKSH PATEL"], volunteers:["DHRUTI PARMAR, ADITYA AMBADATH, OM, NITANT"] },
    "Robo-Soccer": { title:"Robo Soccer", fees:["₹30/-"], coordinators:["ABHIJIT SANTOSH, DEVAM VAGHASIYA, KAVYA KHANDWALA "], volunteers:["YASH HINGU, DEV, MEGH, LUCKY SHAH"] }
    
  };

  // helper to match event keys loosely (case/hyphen/space tolerant)
  function findEventData(rawKey) {
    if (!rawKey) return null;
    if (URJA_EVENTS[rawKey]) return URJA_EVENTS[rawKey];
    const norm = String(rawKey).toLowerCase().replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
    for (const k in URJA_EVENTS) {
      const kn = String(k).toLowerCase().replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
      if (kn === norm) return URJA_EVENTS[k];
    }
    return null;
  }

  /* ===========================
     Populate the cards (fix '...' placeholders)
     =========================== */
  (function populateEventCards() {
    const techList = ['Aavishar','Abhivyakthi','Code-to-Circuit','Game-of-Drone','Quiz-Whitz-Blitz','Robo-Soccer'];
    document.querySelectorAll('.urja-event-card').forEach((card, index) => {
      const rawKey = card.getAttribute('data-event') || card.dataset.event || '';
      const data = findEventData(rawKey);
      // auto-assign category if missing
      if (!card.getAttribute('data-category')) {
        const isTech = techList.some(n => n.toLowerCase().replace(/[-_\s]+/g,'') === String(rawKey).toLowerCase().replace(/[-_\s]+/g,''));
        card.setAttribute('data-category', isTech ? 'tech' : 'nontech');
      }
      // if card appears empty or contains only dots, fill it
      const text = (card.textContent || '').trim();
      const looksEmpty = !card.querySelector('img.poster') && (text === '' || text === '...' || text.length < 6);
      if (looksEmpty) {
        const logoPath = `assets/logos/${encodeURIComponent(rawKey)}.jpg`;
        const title = (data && data.title) ? data.title : (rawKey || 'Untitled Event');
        card.innerHTML = `
          <img class="poster" src="${logoPath}" alt="${title} logo" onerror="this.onerror=null;this.src='assets/urja_logo.png'"/>
          <div class="event-title">${title}</div>
        `;
        // ensure attribute present
        if (!card.getAttribute('data-event')) card.setAttribute('data-event', title);
      } else {
        // ensure poster exists and has class .poster
        const img = card.querySelector('img:not(.poster)');
        if (img && !img.classList.contains('poster')) img.classList.add('poster');
      }
    });
  })();

  /* ==================================
     Filtering logic (All / Technical / Non-Technical)
     ================================== */
  function initUrjaFiltering() {
    const filterBtns = document.querySelectorAll('.urja-filter-btn');
    const grid = document.getElementById('urjaEventsGrid');
    if (!filterBtns.length || !grid) return;
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => { b.classList.remove('urja-active'); b.setAttribute('aria-pressed','false'); });
        btn.classList.add('urja-active'); btn.setAttribute('aria-pressed','true');
        const filter = btn.dataset.filter; // all|tech|nontech
        const cards = grid.querySelectorAll('.urja-event-card');
        cards.forEach((card, idx) => {
          const cat = card.getAttribute('data-category') || 'nontech';
          const shouldShow = (filter === 'all') || (filter === 'tech' && cat === 'tech') || (filter === 'nontech' && cat === 'nontech');
          if (shouldShow) {
            card.classList.remove('urja-card-hidden');
            card.style.display = '';
            void card.offsetWidth;
            card.classList.add('urja-card-show');
            setTimeout(() => card.classList.remove('urja-card-show'), 350 + (idx*15));
          } else {
            card.classList.remove('urja-card-show');
            card.classList.add('urja-card-hidden');
            setTimeout(() => { if (card.classList.contains('urja-card-hidden')) card.style.display = 'none'; }, 260);
          }
        });
      });
    });
  }
  initUrjaFiltering();

  /* ==================================
     Modal behavior with external registration links
     ================================== */
  (function initModalSimple() {
    const modal = document.querySelector('.urja-event-modal');
    if (!modal) return;
    const headerImg = modal.querySelector('.urja-event-modal-header img');
    const titleEl = modal.querySelector('.urja-event-modal-body h2');
    const descEl = modal.querySelector('.urja-event-modal-body .desc');
    const feesEl = modal.querySelector('.urja-event-modal-body .fees');
    const coordEl = modal.querySelector('.urja-event-modal-footer .coordinators');
    const volEl = modal.querySelector('.urja-event-modal-footer .volunteers');
    const registerBtn = modal.querySelector('.urja-modal-register-btn');
    const closeBtn = modal.querySelector('.urja-event-modal-close');
    const closeInline = modal.querySelector('.urja-modal-close-inline');

    function openModal() {
      modal.classList.add('urja-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.remove('urja-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.urja-event-card').forEach(card => {
      card.addEventListener('click', () => {
        const rawKey = card.getAttribute('data-event') || card.dataset.event || '';
        const data = findEventData(rawKey) || {};
        const posterPath = `assets/posters/${encodeURIComponent(rawKey)}.jpg`;
        const title = data.title || card.querySelector('.event-title')?.textContent || rawKey || 'Event';

        // populate modal contents
        headerImg.src = posterPath;
        headerImg.alt = `${title} poster`;
        // fallback if poster missing will be handled by onerror: show urja_logo.png
        headerImg.onerror = function(){ this.onerror = null; this.src = 'assets/urja_logo.png'; };

        titleEl.textContent = title;
        descEl.textContent = data.desc || '';

        // fees
        feesEl.innerHTML = '';
        if (Array.isArray(data.fees) && data.fees.length) {
          data.fees.forEach(r => { const li = document.createElement('li'); li.textContent = r; feesEl.appendChild(li); });
          modal.querySelector('.urja-entry_fees-heading')?.removeAttribute('hidden');
        } else {
          modal.querySelector('.urja-entry_fees-heading')?.setAttribute('hidden', 'true');
        }

        coordEl.textContent = (data.coordinators || []).join(', ') || '—';
        volEl.textContent = (data.volunteers || []).join(', ') || '—';

        // register link: prefer data-form-link, fallback to empty '#'
        const link = card.getAttribute('data-form-link') || card.getAttribute('data-form-endpoint') || '';
        if (registerBtn) {
          if (link) {
            registerBtn.href = link;
            registerBtn.removeAttribute('aria-disabled');
            registerBtn.setAttribute('target','_blank');
          } else {
            registerBtn.href = '#';
            registerBtn.setAttribute('aria-disabled', 'true');
          }
        }

        openModal();
      });

      // allow keyboard activation (enter/space) if card has tabindex
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    // close handlers
    closeBtn?.addEventListener('click', closeModal);
    closeInline?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // friendly feedback if register missing
    registerBtn?.addEventListener('click', function (e) {
      if (this.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        alert('Registration link will be available soon.');
      }
    });
  })();
  
  // ==================================
  // Schedule Tab Switching Logic
  // ==================================
  function initScheduleTabs() {
    const tabs = document.querySelectorAll('.tabs .tab');
    const tables = document.querySelectorAll('.schedule-table');
    const tableWrapper = document.querySelector('.table-wrapper');

    if (!tabs.length || !tables.length || !tableWrapper) {
      return;
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetDay = tab.getAttribute('data-day');

        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        tables.forEach(table => {
          table.classList.add('hidden');
          table.setAttribute('aria-hidden', 'true');
        });

        const activeTable = document.getElementById(targetDay);
        if (activeTable) {
          activeTable.classList.remove('hidden');
          activeTable.setAttribute('aria-hidden', 'false');
        }
      });
    });
  }

  // Call the new function to enable the tabs
  initScheduleTabs();

}); // DOMContentLoaded end

