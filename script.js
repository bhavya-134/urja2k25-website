// script.fire-only.js — Fire-only theme version of script.js
// Simplified: site will always use the "fire" theme and other themes removed.

/* =======================================================
   Theme (forced to "fire") + elemental background (tsParticles)
   ======================================================= */
function initTheme() {
  const body = document.body;
  // Force fire theme for all pages
  body.dataset.theme = 'fire';
}

const particlePresets = {
  fire: {
    particles: {
      number: { value: 35, density: { enable: false} },
      size: { value: 1.0, random: true },
      move: { speed: 1.0, direction: "top", out_mode: "out" },
      opacity: { value: 0.35, random: true },
      color: { value: ["#FF6B35", "#FFD700", "#FF4500"] }
    },
    interactivity: { detectsOn: "canvas", events: { onhover: { enable: false }, onclick: { enable: false } } }
  }
};

let particlesLoadedForTheme = null;
function loadScriptOnce(src, cb) {
  if (document.querySelector(`script[src="${src}"]`)) { cb(); return; }
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onload = cb;
  s.onerror = cb;
  document.head.appendChild(s);
}

function initElementalBg() {
  const theme = 'fire';
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = window.innerWidth <= 720;
  const bg = document.getElementById('elemental-bg');
  if (!bg) return;

  if (isReduced || isSmall) {
    // remove particles for small screens or reduced-motion
    bg.innerHTML = '';
    particlesLoadedForTheme = null;
    return;
  }

  if (particlesLoadedForTheme === theme) return;

  // clear previous
  bg.innerHTML = '';

  // load tsParticles dynamically
  loadScriptOnce('https://cdn.jsdelivr.net/npm/tsparticles-engine@2/tsparticles.engine.min.js', () => {
    loadScriptOnce('https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.min.js', () => {
      // create container
      const el = document.createElement('div');
      el.id = 'tsparticles';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.pointerEvents = 'none';
      bg.appendChild(el);

      const preset = particlePresets[theme] || particlePresets.fire;
      const cfg = {
        fullScreen: { enable: false },
        detectRetina: true,
        background: { color: { value: "" } },
        particles: preset.particles,
        interactivity: preset.interactivity
      };

      if (window.tsParticles && window.tsParticles.load) {
        window.tsParticles.load(el.id, cfg).then(() => {
          particlesLoadedForTheme = theme;
        }).catch((err) => {
          console.warn('tsParticles load failed', err);
          particlesLoadedForTheme = null;
        });
      } else {
        console.warn('tsParticles not available');
      }
    });
  });
}

/* =======================================================
   Basic UI helpers (nav, smooth scroll, back-to-top, year)
   ======================================================= */
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

/* =======================================================
   Flip Countdown
   ======================================================= */
function initFlipCountdown() {
  const root = document.querySelector('.countdown');
  if (!root) return;
  const targetAttr = root.getAttribute('data-target');
  const targetDate = new Date(targetAttr || 'Sep 19, 2025 09:00:00 GMT+0530').getTime();
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
    const minutes = Math.floor(dist / (1000*60*60)); const seconds = Math.floor((dist % (1000*60)) / 1000);
    setCard(nodes.days, String(days).padStart(2,'0'));
    setCard(nodes.hours, pad2(hours));
    setCard(nodes.minutes, pad2(minutes));
    setCard(nodes.seconds, pad2(seconds));
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) document.querySelectorAll('.flip-card').forEach(card => card.classList.remove('flip-animate'));
  tick(); setInterval(tick, 1000);
}

/* =======================================================
   Timeline Schedule Functions
   ======================================================= */
function initScheduleTabs() {
  const tabs = document.querySelectorAll('.tabs .tab');
  const timelines = document.querySelectorAll('.timeline');

  if (!tabs.length || !timelines.length) {
    return;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetDay = tab.getAttribute('data-day');

      // Update tabs active state
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update timeline displays
      timelines.forEach(timeline => {
        timeline.classList.add('hidden');
        timeline.setAttribute('aria-hidden', 'true');
      });

      const activeTimeline = document.getElementById(targetDay);
      if (activeTimeline) {
        activeTimeline.classList.remove('hidden');
        activeTimeline.setAttribute('aria-hidden', 'false');

        // Animate timeline blocks when shown
        const timeBlocks = activeTimeline.querySelectorAll('.time-block');
        timeBlocks.forEach((block, index) => {
          block.style.animationDelay = `${index * 0.1}s`;
          block.classList.add('animate-in');
        });
      }
    });
  });

  // Initialize first tab as active if none are active
  const activeTab = document.querySelector('.tab.active');
  if (!activeTab && tabs.length > 0) {
    tabs[0].click();
  }
}

function initTimelineInteractions() {
  const timeBlocks = document.querySelectorAll('.time-block');

  timeBlocks.forEach(block => {
    const header = block.querySelector('.time-header');
    const eventItems = block.querySelectorAll('.event-item');

    if (!header) return;

    if (window.innerWidth <= 768) {
      header.style.cursor = 'pointer';
      header.addEventListener('click', () => {
        const eventsList = block.querySelector('.events-list');
        const emptySlot = block.querySelector('.empty-slot');
        const content = eventsList || emptySlot;

        if (content) {
          const isHidden = content.style.display === 'none';
          content.style.display = isHidden ? '' : 'none';

          const indicator = header.querySelector('.collapse-indicator') || document.createElement('span');
          if (!header.querySelector('.collapse-indicator')) {
            indicator.className = 'collapse-indicator';
            indicator.style.marginLeft = 'auto';
            indicator.style.fontSize = '0.8em';
            header.appendChild(indicator);
          }
          indicator.textContent = isHidden ? '▼' : '▲';
        }
      });
    }

    eventItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const indicator = item.querySelector('.event-indicator');
        if (indicator) {
          indicator.style.transform = 'scale(1.2)';
          indicator.style.boxShadow = '0 0 12px rgba(0,0,0,0.4)';
        }
      });

      item.addEventListener('mouseleave', () => {
        const indicator = item.querySelector('.event-indicator');
        if (indicator) {
          indicator.style.transform = 'scale(1)';
          indicator.style.boxShadow = '0 0 8px rgba(0,0,0,0.3)';
        }
      });
    });
  });
}

function initTimelineNavigation() {
  const navLinks = document.querySelectorAll('[data-scroll-to-time]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTime = link.getAttribute('data-scroll-to-time');
      const timeBlock = document.querySelector(`[data-time="${targetTime}"]`);

      if (timeBlock) {
        timeBlock.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        timeBlock.style.borderLeft = '6px solid var(--accent)';
        setTimeout(() => {
          timeBlock.style.borderLeft = '4px solid var(--brand)';
        }, 2000);
      }
    });
  });
}

function initCurrentTimeIndicator() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Only show if it's during event days
  const eventDate1 = new Date('2025-09-19'); // Day 1
  const eventDate2 = new Date('2025-09-20'); // Day 2
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today.getTime() === eventDate1.getTime() || today.getTime() === eventDate2.getTime()) {
    const timeBlocks = document.querySelectorAll('.time-block');

    timeBlocks.forEach(block => {
      const timeLabelEl = block.querySelector('.time-label');
      if (!timeLabelEl) return;
      const timeLabel = timeLabelEl.textContent;
      const [time, period] = timeLabel.split(' ');
      const [hoursStr, minutesStr] = time.split(':');
      const hours = Number(hoursStr || 0);
      const minutes = Number(minutesStr || 0);

      let blockHour = hours;
      if (period === 'PM' && hours !== 12) blockHour += 12;
      if (period === 'AM' && hours === 12) blockHour = 0;

      const currentTotalMinutes = currentHour * 60 + currentMinutes;
      const blockTotalMinutes = blockHour * 60 + (minutes || 0);

      if (currentTotalMinutes >= blockTotalMinutes &&
        currentTotalMinutes < blockTotalMinutes + 60) {
        const indicator = document.createElement('div');
        indicator.className = 'current-time-indicator';
        indicator.textContent = '● LIVE NOW';
        indicator.style.cssText = `
          color: var(--accent);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          animation: pulse 2s infinite;
        `;
        const timeHeader = block.querySelector('.time-header');
        if (timeHeader && !timeHeader.querySelector('.current-time-indicator')) {
          timeHeader.appendChild(indicator);
        }
      }
    });

    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
  }
}

function initTimelineSchedule() {
  initScheduleTabs();
  initTimelineInteractions();
  initTimelineNavigation();

  setTimeout(initCurrentTimeIndicator, 500);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initTimelineInteractions();
    }, 250);
  });
}

/* =======================================================
   Event Cards population + Filtering + Modal (Event details)
   ======================================================= */
const URJA_EVENTS = {
  "Aavishar": { title:"Aavishar", fees:["Free"], coordinators:["KALYAAN KAPADIA, AMIT RAINA"], volunteers:["RUPESH NIKAM"] },
  "Abhivyakthi": { title:"Abhivyakthi", fees:["Free"], coordinators:["KANHAI TRIVEDI, HARSHIT PATEL"], volunteers:["NISARG, AMAR"] },
  "Code-to-Circuit": { title:"Code to Circuit", fees:["Free"], coordinators:["BHAVYA THARAKAN,  YASHASVI AGARWAL, VISHWA PATEL"], volunteers:["RISHI, ADARSH, RIDHAM"] },
  "Game-of-Drone": { title:"Game of Drone", desc:"Placeholder for Game of Drone.", fees:["₹50/-"], coordinators:["VANSH PATEL, JIYA PATEL, PRISHA GANDHI"], volunteers:["PARI, NEEL, KASHYAP, MOXIT, SAHIL"] },
  "Quiz-Whitz-Blitz": { title:"Quiz Whitz Blitz", fees:["Free"], coordinators:["YASH JINWALA, MUEEN"], volunteers:["DAKSH PATEL, AYUSH, SANKET"] },
  "Escape-the-Unknown": { title:"Escape the Unknown", fees:["₹20/-"], coordinators:["DURVA PATEL, SURTI NAYAN, SHUBHAM PATEL"], volunteers:["JAINAM, KUNAL TAYADE"] },
  "The-Land-of-Ludo": { title:"The Land of Ludo", fees:["₹20/-"], coordinators:["MIHIR PAREKH, AYUSH GANDHI "], volunteers:["AMAR, DALAJA, PRAKASH"] },
  "Bidwars": { title:"Bidwars", desc:"Placeholder for Bidwars.", fees:["Free"], coordinators:["YUG, BHAVYA JOSHI, SARVAGNA"], volunteers:["DHRUV MORE, VAISHNAVI, DHRUVI"] },
  "NFS": { title:"NFS", desc:"Placeholder for NFS.", fees:["Solo: ₹20/-     Duo: ₹30/-     Trio: ₹40/-"], coordinators:["SHIVAM VAISHNAV, JAHAN, DAKSH PATEL"], volunteers:["DHRUTI PARMAR, ADITYA AMBADATH, OM, NITANT"] },
  "Robo-Soccer": { title:"Robo Soccer", fees:["₹30/-"], coordinators:["ABHIJIT SANTOSH, DEVAM VAGHASIYA, KAVYA KHANDWALA "], volunteers:["YASH HINGU, DEV, MEGH, LUCKY SHAH"] }
};

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

function populateEventCards() {
  const techList = ['Aavishar','Abhivyakthi','Code-to-Circuit','Game-of-Drone','Quiz-Whitz-Blitz','Robo-Soccer'];
  document.querySelectorAll('.urja-event-card').forEach((card, index) => {
    const rawKey = card.getAttribute('data-event') || card.dataset.event || '';
    const data = findEventData(rawKey);
    if (!card.getAttribute('data-category')) {
      const isTech = techList.some(n => n.toLowerCase().replace(/[-_\s]+/g,'') === String(rawKey).toLowerCase().replace(/[-_\s]+/g,''));
      card.setAttribute('data-category', isTech ? 'tech' : 'nontech');
    }
    const text = (card.textContent || '').trim();
    const looksEmpty = !card.querySelector('img.poster') && (text === '' || text === '...' || text.length < 6);
    if (looksEmpty) {
      const logoPath = `assets/logos/${encodeURIComponent(rawKey)}.jpg`;
      const title = (data && data.title) ? data.title : (rawKey || 'Untitled Event');
      card.innerHTML = `\n        <img class="poster" src="${logoPath}" alt="${title} logo" onerror="this.onerror=null;this.src='assets/urja_logo.png'"/>\n        <div class="event-title">${title}</div>\n      `;
      if (!card.getAttribute('data-event')) card.setAttribute('data-event', title);
    } else {
      const img = card.querySelector('img:not(.poster)');
      if (img && !img.classList.contains('poster')) img.classList.add('poster');
    }

    const bodyTheme = document.body.dataset.theme || 'fire';
    if (!card.classList.contains(`${bodyTheme}-theme`)) {
      if (!card.className.match(/(fire-theme)/)) {
        card.classList.add(`${bodyTheme}-theme`);
      }
    }
  });
}

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

/* Modal behavior for event details */
(function initModalSimple() {
  // we will wire up modals after DOMContentLoaded (so skip if modal not present yet).
})();

/* =======================================================
   Timeline/Events Initialization helper
   ======================================================= */
function initEventUI() {
  populateEventCards();
  initUrjaFiltering();

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

      if (headerImg) {
        headerImg.src = posterPath;
        headerImg.alt = `${title} poster`;
        headerImg.onerror = function(){ this.onerror = null; this.src = 'assets/urja_logo.png'; };
      }

      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = data.desc || '';

      if (feesEl) {
        feesEl.innerHTML = '';
        if (Array.isArray(data.fees) && data.fees.length) {
          data.fees.forEach(r => { const li = document.createElement('li'); li.textContent = r; feesEl.appendChild(li); });
          modal.querySelector('.urja-entry_fees-heading')?.removeAttribute('hidden');
        } else {
          modal.querySelector('.urja-entry_fees-heading')?.setAttribute('hidden', 'true');
        }
      }

      if (coordEl) coordEl.textContent = (data.coordinators || []).join(', ') || '—';
      if (volEl) volEl.textContent = (data.volunteers || []).join(', ') || '—';

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

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  closeInline?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  registerBtn?.addEventListener('click', function (e) {
    if (this.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      alert('Registration link will be available soon.');
    }
  });
}

/* =======================================================
   Initialize Timeline + Events on load
   ======================================================= */
function initTimelineAndEvents() {
  initTimelineSchedule();
  initEventUI();
}



/* =======================================================
   Global full-viewport ember particle system (Fire theme)
   ======================================================= */

const isMobile = window.innerWidth <= 768;

function initGlobalEmbers() {
  if (!document.body || document.body.dataset.theme !== 'fire') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (window._globalEmber && window._globalEmber.canvas) {
    resizeGlobalCanvas();
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'global-ember-canvas';
  canvas.style.opacity = '1';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  window._globalEmber = { canvas, ctx, rafId: null, running: true };

  function resizeGlobalCanvas() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = Math.max(1, window.innerWidth);
    const cssH = Math.max(1, window.innerHeight);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    window._globalEmber.cssW = cssW;
    window._globalEmber.cssH = cssH;
    window._globalEmber.dpr = dpr;
  }

  let particles = [];
  function spawnParticle(midAirChance = 0.18) {
  const W = window._globalEmber.cssW;
  const H = window._globalEmber.cssH;
  const spawnMidAir = Math.random() < midAirChance;
  const x = Math.random() * W;
  const y = spawnMidAir ? (H * (0.15 + Math.random() * 0.6)) : (H + Math.random() * (H * 0.12));
  
  // Reduce speed on mobile
  const vx = (Math.random() - 0.5) * (isMobile ? 0.3 : 0.9);
  const vy = - (0.6 + Math.random() * (isMobile ? 0.8 : 1.8));
  
  let size = 0.6 + Math.random() * 3.6;
  if (window._globalEmber.cssW < 600) {
    size *= 0.6;
  }
  const life = 1600 + Math.random() * 3800 + (spawnMidAir ? 800 : 0);
  const hue = 12 + Math.random() * 36;
  const sat = 82 + Math.random() * 12;
  const light = 44 + Math.random() * 28;
  const color = `hsla(${Math.round(hue)}, ${Math.round(sat)}%, ${Math.round(light)}%,`;
  return { x, y, vx, vy, size, life, born: performance.now(), color, alpha: 1 };
}

  function computeMaxParticles() {
  const area = window._globalEmber.cssW * window._globalEmber.cssH;
  let max = Math.min(220, Math.max(24, Math.floor(area / 10000)));
  
  // Reduce particle count on mobile
  if (isMobile) {
    max = Math.floor(max * 0.3); // 30% of normal count on mobile
  } else if (window._globalEmber.cssW < 600) {
    max = Math.floor(max * 0.1);
  }
  return max;
}

  function ensureParticleCount() {
    const max = computeMaxParticles();
    while (particles.length < max) particles.push(spawnParticle());
  }

  function windFactor(t) {
    return Math.sin(t * 0.0007) * 0.2 + Math.cos(t * 0.00037) * 0.15;
  }

  let last = performance.now();
  function frame(now) {
    const dt = now - last;
    last = now;
    const W = window._globalEmber.cssW;
    const H = window._globalEmber.cssH;

    ctx.clearRect(0, 0, W, H);

    const spawnProb = isMobile ? 0.3 : 0.7; // Less frequent spawning on mobile
    if (Math.random() < spawnProb) particles.push(spawnParticle());

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = now - p.born;
      const lifeRatio = age / p.life;

      if (lifeRatio >= 1 || p.y + p.size < -60 || p.x < -80 || p.x > W + 80) {
        particles.splice(i, 1);
        continue;
      }

      const wind = windFactor(now) * (0.2 + Math.sin(p.y * 0.01) * 0.2);
      p.vx = p.vx * 0.992 + wind * 0.02;
      p.vy = p.vy + (Math.random() - 0.48) * 0.01;
      p.x += p.vx * (dt * 0.06);
      p.y += p.vy * (dt * 0.06);

      p.alpha = Math.max(0, 1 - lifeRatio);

      const core = Math.max(0.8, p.size);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, core * 6);
      g.addColorStop(0, `${p.color} 1)`);
      g.addColorStop(0.25, `${p.color} ${0.85})`);
      g.addColorStop(0.45, `${p.color} ${0.55})`);
      g.addColorStop(1, `rgba(255,120,20, ${0.02 * p.alpha})`);

      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.max(0, p.alpha * 0.95);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, core * 3.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = `${p.color} ${0.92})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, core, 0, Math.PI * 2);
      ctx.fill();
    }

    ensureParticleCount();

    window._globalEmber.rafId = requestAnimationFrame(frame);
  }

  function start() {
    resizeGlobalCanvas();
    particles = [];
    last = performance.now();
    ensureParticleCount();
    if (window._globalEmber.rafId) cancelAnimationFrame(window._globalEmber.rafId);
    window._globalEmber.rafId = requestAnimationFrame(frame);
  }

  let rTmo;
  function onResize() {
    clearTimeout(rTmo);
    rTmo = setTimeout(() => {
      resizeGlobalCanvas();
      for (let i = 0; i < Math.min(18, Math.floor(computeMaxParticles() * 0.08)); i++) {
        particles.push(spawnParticle(0.28));
      }
    }, 100);
  }
  window.addEventListener('resize', onResize);

  function onVisibility() {
    if (document.hidden) {
      if (window._globalEmber.rafId) cancelAnimationFrame(window._globalEmber.rafId);
    } else {
      last = performance.now();
      window._globalEmber.rafId = requestAnimationFrame(frame);
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  window._globalEmber._cleanup = function () {
    if (window._globalEmber.rafId) cancelAnimationFrame(window._globalEmber.rafId);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    try { if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas); } catch(e) {}
    window._globalEmber = null;
  };

  setTimeout(start, 50);
}

function destroyGlobalEmbers() {
  if (window._globalEmber && typeof window._globalEmber._cleanup === 'function') {
    window._globalEmber._cleanup();
  } else {
    const c = document.getElementById('global-ember-canvas');
    if (c && c.parentNode) c.parentNode.removeChild(c);
  }
}

/* =======================================================
   Boot / DOM ready — force fire theme across pages
   ======================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initElementalBg();

  // Always launch full-viewport embers for the fire theme
  setTimeout(() => initGlobalEmbers(), 80);

  // Re-init elemental bg on resize (debounced)
  let _tmo;
  window.addEventListener('resize', () => {
    clearTimeout(_tmo);
    _tmo = setTimeout(() => initElementalBg(), 300);
  });

  // core UI
  initFlipCountdown();
  initTimelineAndEvents();

  // Early bird badge (if countdown present)
  
});

/* =======================================================
   End of fire-only script
   ======================================================= */
