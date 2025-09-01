// script.js (replace entire file with this)

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
    "Aavishar": { title:"Aavishar", poster:"assets/urja_logo.png", desc:"Placeholder for Aavishar.", rules:["Presentation time: 5–7 minutes","Max team size: 3"], coordinators:["Convener A"], volunteers:["Vol A"] },
    "Abhivyakthi": { title:"Abhivyakthi", poster:"assets/urja_logo.png", desc:"Placeholder for Abhivyakthi.", rules:["Rule 1"], coordinators:["Convener X"], volunteers:["Vol X"] },
    "Code-to-Circuit": { title:"Code to Circuit", poster:"assets/urja_logo.png", desc:"Placeholder for Code to Circuit.", rules:["Rule A"], coordinators:["Coord 1"], volunteers:["Vol 1"] },
    "Game-of-Drone": { title:"Game of Drone", poster:"assets/urja_logo.png", desc:"Placeholder for Game of Drone.", rules:["Rule A"], coordinators:["Coord 1"], volunteers:["Vol 1"] },
    "Quiz-Whitz-Blitz": { title:"Quiz Whitz Blitz", poster:"assets/urja_logo.png", desc:"Placeholder for Quiz Whitz Blitz.", rules:["Rule 1"], coordinators:["Coord A"], volunteers:["Vol A"] },
    "Escape-the-Unknown": { title:"Escape the Unknown", poster:"assets/urja_logo.png", desc:"Placeholder for Escape the Unknown.", rules:["Rule 1"], coordinators:["Coord E"], volunteers:["Vol E"] },
    "The-Land-of-Ludo": { title:"The Land of Ludo", poster:"assets/urja_logo.png", desc:"Placeholder for The Land of Ludo.", rules:["Rule 1"], coordinators:["Coord L"], volunteers:["Vol L"] },
    "Meme-Creation": { title:"Meme Creation", poster:"assets/urja_logo.png", desc:"Placeholder for Meme Creation.", rules:["Rule 1"], coordinators:["Coord M"], volunteers:["Vol M"] },
    "Bidwars": { title:"Bidwars", poster:"assets/urja_logo.png", desc:"Placeholder for Bidwars.", rules:["Rule 1"], coordinators:["Coord B"], volunteers:["Vol B"] },
    "NFS": { title:"NFS", poster:"assets/urja_logo.png", desc:"Placeholder for NFS.", rules:["Rule 1"], coordinators:["Coord N"], volunteers:["Vol N"] },
    "Robo-Soccer": { title:"Robo Soccer", poster:"assets/urja_logo.png", desc:"Placeholder for Robo Soccer.", rules:["Rule 1"], coordinators:["Coord R"], volunteers:["Vol R"] }
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
        const poster = (data && data.poster) ? data.poster : 'assets/urja_logo.png';
        const title = (data && data.title) ? data.title : (rawKey || 'Untitled Event');
        card.innerHTML = `
          <img class="poster" src="${poster}" alt="${title} poster" />
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
     Modal behaviour + registering logic
     - This re-uses the modal you already have in HTML
     ================================== */
  (function initUrjaRegistration() {
    const modal = document.querySelector('.urja-event-modal');
    if (!modal) return;
    const modalHeaderImg = modal.querySelector('.urja-event-modal-header img');
    const titleEl = modal.querySelector('.urja-event-modal-body h2');
    const descEl = modal.querySelector('.urja-event-modal-body .desc');
    const rulesEl = modal.querySelector('.urja-event-modal-body .rules');
    const coordEl = modal.querySelector('.urja-event-modal-footer .coordinators');
    const volEl = modal.querySelector('.urja-event-modal-footer .volunteers');
    const registerOpenBtn = modal.querySelector('.urja-register-open');
    const registerForm = modal.querySelector('.urja-register-form');
    const hiddenEventInput = registerForm.querySelector('.urja-hidden-eventname');
    const teamArea = registerForm.querySelector('.urja-team-area');
    const teamMembersContainer = registerForm.querySelector('.urja-team-members');
    const addMemberBtn = registerForm.querySelector('.urja-add-member');
    const removeMemberBtn = registerForm.querySelector('.urja-remove-member');
    const submitBtn = registerForm.querySelector('.urja-submit');
    const statusSpan = registerForm.querySelector('.urja-form-status');

    let currentCardEl = null;
    let currentEventKey = null;
    let teamMax = 0;

    function fillList(container, items) {
      container.innerHTML = '';
      if (!items || !items.length) { container.innerHTML = '<li>No data</li>'; return; }
      items.forEach(it => { const li = document.createElement('li'); li.textContent = it; container.appendChild(li); });
    }

    // Create block for a member (same layout as leader subfields)
    function createFullMemberBlock(index) {
      const wrapper = document.createElement('div');
      wrapper.className = 'urja-team-member-block';
      wrapper.setAttribute('data-member-index', String(index));
      wrapper.innerHTML = `
        <h4 style="margin:.5rem 0 .2rem; color:var(--muted); font-size:0.95rem;">Member ${index}</h4>
        <label style="display:block; font-size:.85rem; margin:.25rem 0 0;">Name</label>
        <input name="member_${index}_name" type="text" required class="urja-input" />
        <label style="display:block; font-size:.85rem; margin:.25rem 0 0;">Year</label>
        <select name="member_${index}_year" required class="urja-input">
          <option value="">Select year</option><option>1st</option><option>2nd</option><option>3rd</option><option>4th</option>
        </select>
        <label style="display:block; font-size:.85rem; margin:.25rem 0 0;">Branch</label>
        <select name="member_${index}_branch" required class="urja-input">
          <option value="">Select branch</option>
          <option>Computer</option><option>IT</option><option>Electrical</option>
          <option>Electrical &amp; Communication</option><option>Mechanical</option><option>IC</option>
        </select>
        <label style="display:block; font-size:.85rem; margin:.25rem 0 0;">SCET Id</label>
        <input name="member_${index}_scet" type="text" required class="urja-input" />
        <label style="display:block; font-size:.85rem; margin:.25rem 0 0;">Mobile No.</label>
        <input name="member_${index}_mobile" type="tel" required pattern="[\\+]?[0-9\\s\\-]+" class="urja-input" />
        <hr style="border:none;border-top:1px solid rgba(255,255,255,.04); margin:.6rem 0;">
      `;
      return wrapper;
    }

    // When clicking a card: populate modal accordingly and open it
    document.querySelectorAll('.urja-event-card').forEach(card => {
      card.addEventListener('click', () => {
        currentCardEl = card;
        currentEventKey = card.getAttribute('data-event') || card.dataset.event || '';
        const data = findEventData(currentEventKey) || {};
        const poster = data.poster || card.querySelector('.poster')?.src || 'assets/urja_logo.png';
        const title = (data.title) ? data.title : (card.querySelector('.event-title')?.textContent || currentEventKey || 'Event');

        // team info
        const isTeam = card.getAttribute('data-team') === 'true' || card.dataset.team === 'true';
        teamMax = parseInt(card.getAttribute('data-team-max') || card.dataset.teamMax || '0', 10) || 0;

        // Populate modal content
        modalHeaderImg.src = poster; modalHeaderImg.alt = title + ' poster';
        titleEl.textContent = title;
        descEl.textContent = data.desc || 'Details will be updated soon.';
        fillList(rulesEl, data.rules || []);
        coordEl.textContent = (data.coordinators || []).join(', ') || '—';
        volEl.textContent = (data.volunteers || []).join(', ') || '—';

        // Prepare registration form
        hiddenEventInput.value = title;
        registerForm.setAttribute('data-endpoint', card.getAttribute('data-form-endpoint') || '');

        // Reset UI states
        registerForm.reset();
        statusSpan.textContent = '';
        statusSpan.className = 'urja-form-status';

        // Team area handling
        if (isTeam) {
          teamArea.style.display = '';
          teamMembersContainer.innerHTML = '';
          const maxExtra = Math.max(0, teamMax - 1);

          if (teamMax === 2) {
            // duo: enforce one extra member block (non-editable)
            teamMembersContainer.appendChild(createFullMemberBlock(1));
            teamMembersContainer.setAttribute('data-count', '1');
            teamArea.setAttribute('data-duo-required', 'true');
            if (addMemberBtn) addMemberBtn.style.display = 'none';
            if (removeMemberBtn) removeMemberBtn.style.display = 'none';
          } else {
            // start with zero extra (leader only)
            teamMembersContainer.setAttribute('data-count', '0');
            teamArea.setAttribute('data-duo-required', 'false');
            if (addMemberBtn) addMemberBtn.style.display = '';
            if (removeMemberBtn) removeMemberBtn.style.display = 'none';
          }
        } else {
          teamArea.style.display = 'none';
          teamMembersContainer.innerHTML = '';
          teamMembersContainer.setAttribute('data-count', '0');
          if (addMemberBtn) addMemberBtn.style.display = 'none';
          if (removeMemberBtn) removeMemberBtn.style.display = 'none';
        }

        // registration is hidden until user clicks Register button inside modal
        registerForm.style.display = 'none';
        if (registerOpenBtn) registerOpenBtn.style.display = '';

        modal.classList.add('urja-active');
        document.body.style.overflow = 'hidden';
      });
    });

    // Register open -> reveal inline form
    registerOpenBtn?.addEventListener('click', () => {
      registerOpenBtn.style.display = 'none';
      registerForm.style.display = '';
      registerForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Add member
    addMemberBtn?.addEventListener('click', () => {
      const currentCount = parseInt(teamMembersContainer.getAttribute('data-count') || '0', 10);
      const maxExtra = Math.max(0, teamMax - 1);
      if (teamMax && currentCount >= maxExtra) {
        alert(`Max ${teamMax} members allowed (including leader).`);
        return;
      }
      const nextIndex = currentCount + 1;
      teamMembersContainer.appendChild(createFullMemberBlock(nextIndex));
      teamMembersContainer.setAttribute('data-count', String(nextIndex));
      if (nextIndex >= maxExtra && addMemberBtn) addMemberBtn.style.display = 'none';
      if (removeMemberBtn) removeMemberBtn.style.display = '';
    });

    // Remove member
    removeMemberBtn?.addEventListener('click', () => {
      const currentCount = parseInt(teamMembersContainer.getAttribute('data-count') || '0', 10);
      if (currentCount <= 0) return;
      const last = teamMembersContainer.querySelector('[data-member-index="' + currentCount + '"]');
      if (last) last.remove();
      const newCount = currentCount - 1;
      teamMembersContainer.setAttribute('data-count', String(newCount));
      if (addMemberBtn) addMemberBtn.style.display = '';
      if (newCount <= 0 && removeMemberBtn) removeMemberBtn.style.display = 'none';
    });

    // Submit registration
    registerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusSpan.textContent = ''; statusSpan.className = 'urja-form-status';
      const form = e.target; const fm = new FormData(form);
      // basic leader validation
      if (!fm.get('name') || !fm.get('year') || !fm.get('branch') || !fm.get('scet_id') || !fm.get('mobile')) {
        statusSpan.textContent = 'Please fill required fields for leader.'; statusSpan.classList.add('error'); return;
      }
      // team checks
      if (teamArea && teamArea.style.display !== 'none') {
        const duoRequired = teamArea.getAttribute('data-duo-required') === 'true';
        const extraCount = parseInt(teamMembersContainer.getAttribute('data-count') || '0', 10);
        const maxExtra = Math.max(0, teamMax - 1);
        if (duoRequired && extraCount < 1) { statusSpan.textContent = 'This event requires a teammate (duo). Please add 1 member.'; statusSpan.classList.add('error'); return; }
        if (teamMax && extraCount > maxExtra) { statusSpan.textContent = `Too many members. Max ${teamMax} allowed.`; statusSpan.classList.add('error'); return; }
        const memberBlocks = teamMembersContainer.querySelectorAll('.urja-team-member-block');
        for (let i=0;i<memberBlocks.length;i++) {
          const idx = memberBlocks[i].getAttribute('data-member-index');
          if (!fm.get(`member_${idx}_name`) || !fm.get(`member_${idx}_year`) || !fm.get(`member_${idx}_branch`) || !fm.get(`member_${idx}_scet`) || !fm.get(`member_${idx}_mobile`)) {
            statusSpan.textContent = `Please fill required fields for member ${idx}.`; statusSpan.classList.add('error'); return;
          }
        }
      }
      // endpoint
      const endpoint = form.getAttribute('data-endpoint') || currentCardEl?.getAttribute('data-form-endpoint') || '';
      if (!endpoint) { statusSpan.textContent = 'No form endpoint configured for this event. Please set data-form-endpoint on the event card.'; statusSpan.classList.add('error'); return; }

      submitBtn.disabled = true; const origText = submitBtn.textContent; submitBtn.textContent = 'Submitting...';
      try {
        const res = await fetch(endpoint, { method:'POST', body: fm, headers:{ 'Accept':'application/json' }});
        if (res.ok) {
          statusSpan.textContent = 'Registration successful — check your email for confirmation (if enabled).'; statusSpan.classList.add('success');
          registerForm.style.display = 'none'; if (registerOpenBtn) registerOpenBtn.style.display = 'none';
        } else {
          let body = '';
          try { body = await res.json(); } catch (err) { body = await res.text(); }
          console.error('Form submit failed', res.status, body);
          statusSpan.textContent = 'Submission failed. Please try again.'; statusSpan.classList.add('error');
        }
      } catch (err) {
        console.error('Submit error', err); statusSpan.textContent = 'Network error. Please try again later.'; statusSpan.classList.add('error');
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = origText;
      }
    });

    // Close modal handlers
    const modalClose = modal.querySelector('.urja-event-modal-close');
    modalClose?.addEventListener('click', () => {
      modal.classList.remove('urja-active'); document.body.style.overflow = ''; registerForm.style.display = 'none'; if (registerOpenBtn) registerOpenBtn.style.display = '';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { modal.classList.remove('urja-active'); document.body.style.overflow = ''; registerForm.style.display = 'none'; if (registerOpenBtn) registerOpenBtn.style.display = ''; }
    });

  })(); // end initUrjaRegistration

}); // DOMContentLoaded end