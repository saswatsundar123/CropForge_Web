(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     LIGHT MODE EASTER EGG
     ───────────────────────────────────────────── */
  const QUIPS = [
    "Dark mode is the scientific consensus.",
    "Light mode? We're running RUSLE, not a spreadsheet.",
    "Researchers don't ship light mode. Closed as wontfix.",
    "The soil profile is always dark. Trust the data.",
    "Error: photosynthesis is not a UI feature.",
    "My terminal has been dark since the first sowing season.",
    "Light mode increases cognitive load. Cite: my career.",
    "PRs welcome. (They're not.)",
    "That's a v3 problem. There is no v3.",
    "The simulation runs in the dark. So does the site.",
    "No. FAO-56 doesn't have a light theme.",
    "Ask me again after harvest.",
    "I love feature requests (not really).",
    "The ICAR handbook has never mentioned light mode.",
  ];

  let quipIdx = 0;
  const bubble = document.getElementById('bubble');
  const lightBtn = document.getElementById('lightbtn');

  function placeBubble() {
    const br = lightBtn.getBoundingClientRect();
    bubble.style.right = (window.innerWidth - br.right) + 'px';
    bubble.style.top = (br.bottom + 10) + 'px';
    bubble.style.left = 'auto';
  }

  if (lightBtn && bubble) {
    lightBtn.addEventListener('click', () => {
      bubble.textContent = QUIPS[quipIdx++ % QUIPS.length];
      placeBubble();
      bubble.classList.add('show');
      clearTimeout(bubble._timer);
      bubble._timer = setTimeout(() => bubble.classList.remove('show'), 4200);
    });
    window.addEventListener('scroll', () => {
      if (bubble.classList.contains('show')) placeBubble();
    }, { passive: true });
  }


  /* ─────────────────────────────────────────────
     COPY BUTTONS
     ───────────────────────────────────────────── */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.copy;
      if (!text || btn.classList.contains('copied')) return;

      const restore = () => btn.classList.remove('copied');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          btn.classList.add('copied');
          setTimeout(restore, 1800);
        }).catch(() => { });
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          btn.classList.add('copied');
          setTimeout(restore, 1800);
        } finally {
          document.body.removeChild(ta);
        }
      }
    });
  });


  /* ─────────────────────────────────────────────
     HERO TYPING ANIMATION
     ───────────────────────────────────────────── */
  (function initTyping() {
    const el = document.getElementById('hero-term');
    if (!el) return;

    // ponytail: skip if reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.innerHTML = [
        '<div class="t-line"><span class="t-prompt">$ </span>python</div>',
        '<div class="t-line"><span class="t-prompt">&gt;&gt;&gt; </span>import cropforge</div>',
        '<div class="t-line"><span class="t-prompt">&gt;&gt;&gt; </span>cropforge.version()</div>',
        '<div class="t-line grn">\'v1.0.0\'</div>',
        '<div class="t-line"><span class="t-prompt">&gt;&gt;&gt; </span>farm.run(days=90)</div>',
        '<div class="t-line grn">Simulation complete. ✓</div>',
        '<div class="t-line"><span class="t-prompt">&gt;&gt;&gt; </span><span class="cur">▋</span></div>',
      ].join('');
      return;
    }

    const LINES = [
      { p: '$', text: ' python' },
      { p: '>>>', text: ' import cropforge' },
      { p: '>>>', text: ' cropforge.version()' },
      { p: '', text: "'v1.0.0'", cls: 'grn' },
      { p: '>>>', text: ' farm = cropforge.Farm("ICAR-Plot")' },
      { p: '>>>', text: ' farm.run(days=90)' },
      { p: '', text: 'Simulation complete. ✓', cls: 'grn' },
    ];
    const CHAR_MS = 28;   // base ms per character
    const JITTER_MS = 14;   // ±jitter
    const PAUSE_MS = 160;  // pause between lines

    function typeLine(lineEl, text, onDone) {
      let i = 0;
      const cursor = document.createElement('span');
      cursor.className = 'cur';
      cursor.textContent = '▋';
      lineEl.appendChild(cursor);

      function tick() {
        if (i < text.length) {
          cursor.insertAdjacentText('beforebegin', text[i++]);
          setTimeout(tick, CHAR_MS + Math.random() * JITTER_MS);
        } else {
          cursor.remove();
          if (onDone) setTimeout(onDone, PAUSE_MS);
        }
      }
      tick();
    }

    function runLine(idx) {
      if (idx >= LINES.length) {
        // final blinking cursor
        const fin = document.createElement('div');
        fin.className = 't-line';
        fin.innerHTML = '<span class="t-prompt">&gt;&gt;&gt; </span><span class="cur">▋</span>';
        el.appendChild(fin);
        return;
      }

      const def = LINES[idx];
      const lineEl = document.createElement('div');
      lineEl.className = 't-line' + (def.cls ? ' ' + def.cls : '');

      if (def.p) {
        const ps = document.createElement('span');
        ps.className = 't-prompt';
        ps.textContent = def.p + ' ';
        lineEl.appendChild(ps);
      }

      el.appendChild(lineEl);
      typeLine(lineEl, def.text, () => runLine(idx + 1));
    }

    // Start after page settles
    setTimeout(() => runLine(0), 700);
  })();


  /* ─────────────────────────────────────────────
     GITHUB LIVE STATS
     ───────────────────────────────────────────── */
  (function fetchGitHub() {
    const REPO = 'saswatsundar123/cropforge';
    const BASE = 'https://api.github.com/repos/' + REPO;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el && val != null) el.textContent = val;
    };

    fetch(BASE)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => {
        set('gh-stars', d.stargazers_count);
        set('gh-forks', d.forks_count);
        set('gh-issues', d.open_issues_count);
        set('gh-license', d.license?.spdx_id ?? 'MIT');
      })
      .catch(() => { /* keep defaults */ });

    fetch(BASE + '/releases/latest')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => set('gh-release', d.tag_name))
      .catch(() => { /* keep v1.0.0 default */ });
  })();


  /* ─────────────────────────────────────────────
     DEFER HEAVY ASCII FRAMES
     ───────────────────────────────────────────── */
  window.addEventListener('load', () => {
    // Delay setting iframe sources by 1500ms to allow LCP and main-thread to clear
    setTimeout(() => {
      const crop = document.getElementById('ascii-crop');
      const forge = document.getElementById('ascii-forge');
      if (crop && crop.dataset.src) crop.src = crop.dataset.src;
      if (forge && forge.dataset.src) forge.src = forge.dataset.src;
    }, 1500);
  });

})();
