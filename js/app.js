/* Atelier d'écriture — application principale */
(function (A) {
  'use strict';

  const M = A.model;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => (n || 0).toLocaleString('fr-FR');
  const plural = (n, one, many) => fmt(n) + ' ' + (n > 1 ? many : one);

  /* ======================================================================
     Icônes
     ====================================================================== */
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    folder: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 2 1.2 3 2.5 3.5C12 9 11 6 12 3z"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    check2: '<path d="M4 15 8 5l4 10M5.5 11.5h5"/><path d="m13 17 3 3 5-6"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16v4M17 18h4"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    maximize: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
    book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H20"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    words: '<path d="M4 7h16M4 12h10M4 17h7"/>',
    pin: '<path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v8"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    pen: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
    wand: '<path d="m4 20 11-11M14 4v2M19 9h2M17.5 5.5 19 4M17 12l1.5 1.5M12 6.5 10.5 5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    feather: '<path d="M20 4c-6 0-12 4-13 13l-3 3"/><path d="M7 17c5 0 9-3 11-8"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    alert: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17.5v.01"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M7 10H5.5A1.5 1.5 0 0 0 4 11.5v8A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H17"/>'
  };
  function ic(name) {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* ======================================================================
     État et sauvegarde
     ====================================================================== */
  const st = {
    projects: [],
    settings: M.defaultSettings(),
    exercises: [],
    log: {},
    session: { lastProjectId: null },
    ui: { check: {}, lt: null, ai: null, train: null, spark: null, jump: null, charFilter: '', ideaTag: '' }
  };

  const dirty = new Set();
  let saveTimer = null;

  function touch(key) {
    dirty.add(key);
    setSaveState('saving');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 600);
  }
  function touchProject(p) { p.updatedAt = Date.now(); touch('p:' + p.id); }

  async function flush() {
    clearTimeout(saveTimer);
    if (!dirty.size) return;
    const keys = Array.from(dirty);
    dirty.clear();
    try {
      for (const k of keys) {
        if (k.startsWith('p:')) {
          const p = st.projects.find(x => 'p:' + x.id === k);
          if (p) await A.store.set(k, p); else await A.store.del(k);
        } else if (k in { settings: 1, exercises: 1, log: 1, session: 1 }) {
          await A.store.set(k, st[k]);
        }
      }
      setSaveState('saved');
    } catch (e) {
      console.error(e);
      keys.forEach(k => dirty.add(k));
      setSaveState('error');
      toast('Attention : la sauvegarde a échoué. Télécharge une sauvegarde par précaution.');
    }
  }

  function setSaveState(s) {
    const el = $('#saveState');
    if (!el) return;
    el.className = 'save-state ' + s;
    el.textContent = s === 'saving' ? 'Enregistrement…' : s === 'error' ? '⚠ Non enregistré' : '✓ Enregistré';
  }

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', e => { if (dirty.size) { flush(); e.preventDefault(); e.returnValue = ''; } });

  function migrateProject(p) {
    const d = M.newProject();
    const out = Object.assign(d, p);
    out.plot = Object.assign({ synopsis: '', beats: [] }, p.plot || {});
    out.lexicon = Object.assign({ words: [], concepts: [] }, p.lexicon || {});
    out.session = Object.assign({ chapterId: null, cursor: 0 }, p.session || {});
    out.shareOpts = Object.assign({ titlePage: true, numbering: true, pageBreak: true, pitch: false, exclude: [] }, p.shareOpts || {});
    ['chapters', 'characters', 'ideas', 'facts', 'aiHistory'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
    return out;
  }

  async function load() {
    await A.store.init();
    const keys = await A.store.keys();
    st.settings = Object.assign(M.defaultSettings(), (await A.store.get('settings')) || {});
    st.exercises = (await A.store.get('exercises')) || [];
    st.log = (await A.store.get('log')) || {};
    st.session = Object.assign({ lastProjectId: null }, (await A.store.get('session')) || {});
    for (const k of keys) {
      if (String(k).startsWith('p:')) {
        const p = await A.store.get(k);
        if (p) st.projects.push(migrateProject(p));
      }
    }
    sortProjects();
    applyTheme();
  }

  function sortProjects() { st.projects.sort((a, b) => b.updatedAt - a.updatedAt); }
  function getProject(id) { return st.projects.find(p => p.id === id); }
  function lastProject() { return getProject(st.session.lastProjectId) || st.projects[0] || null; }

  function applyTheme() {
    const t = st.settings.theme;
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }

  /* ---------- Journal d'écriture quotidien ---------- */
  const wordCache = new Map();
  function trackWords(key, text) {
    const n = M.wordCount(text);
    const prev = wordCache.has(key) ? wordCache.get(key) : n;
    wordCache.set(key, n);
    const delta = n - prev;
    if (delta > 0 && delta < 80) { // au-delà : probablement un collage, on ne le compte pas
      const d = M.dayKey();
      st.log[d] = st.log[d] || { m: 0 };
      st.log[d].m += delta;
      touch('log');
    }
  }
  function dayTotal(day) {
    const m = (st.log[day] && st.log[day].m) || 0;
    const e = st.exercises.filter(x => x.date === day).reduce((s, x) => s + (x.wordCount || 0), 0);
    return m + e;
  }
  function calcStreak() {
    const goal = Math.max(1, st.settings.dailyGoal || 300);
    const d = new Date();
    let streak = 0;
    if (dayTotal(M.dayKey(d)) >= goal) streak = 1;
    d.setDate(d.getDate() - 1);
    while (dayTotal(M.dayKey(d)) >= goal) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  }

  /* ======================================================================
     Petits utilitaires d'interface
     ====================================================================== */
  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function select(attrs, options, value) {
    return '<select ' + attrs + '>' + options.map(o => '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(value) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
  }

  function dateFr(ts, withYear) {
    const o = { day: 'numeric', month: 'long' };
    if (withYear) o.year = 'numeric';
    return new Date(ts).toLocaleDateString('fr-FR', o);
  }
  function ago(ts) {
    if (!ts) return 'jamais';
    const s = (Date.now() - ts) / 1000;
    if (s < 60) return "à l'instant";
    if (s < 3600) return 'il y a ' + Math.floor(s / 60) + ' min';
    if (s < 86400) return 'il y a ' + Math.floor(s / 3600) + ' h';
    const d = Math.floor(s / 86400);
    return d === 1 ? 'hier' : 'il y a ' + d + ' jours';
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function slug(s) {
    return (s || 'texte').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'texte';
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast('Copié dans le presse-papiers ✓'); }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copié ✓'); } catch (e2) { toast('Copie impossible : sélectionne le texte à la main.'); }
      ta.remove();
    }
  }

  function setPath(obj, path, value) {
    const segs = path.split('.');
    let o = obj;
    for (let i = 0; i < segs.length - 1; i++) {
      const s = segs[i];
      o = Array.isArray(o) ? o.find(x => x.id === s) : o[s];
      if (o == null) return false;
    }
    o[segs[segs.length - 1]] = value;
    return true;
  }

  function fieldValue(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'number') return parseFloat(el.value) || 0;
    return el.value;
  }

  const CH_STATUS = [['idee', 'Idée'], ['brouillon', 'Brouillon'], ['relecture', 'En relecture'], ['fini', 'Terminé']];
  const BEAT_STATUS = [['a-ecrire', 'À écrire'], ['en-cours', 'En cours'], ['ecrit', 'Écrit']];
  const ROLES = [['principal', 'Principal'], ['secondaire', 'Secondaire'], ['antagoniste', 'Antagoniste'], ['figurant', 'Figurant']];
  const FACT_CATS = [['lieu', 'Lieu'], ['regle', 'Règle du monde'], ['chrono', 'Chronologie'], ['objet', 'Objet'], ['histoire', 'Passé / histoire'], ['autre', 'Autre']];

  /* ======================================================================
     Routeur
     ====================================================================== */
  function route() {
    return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  }
  function go(hash) {
    if (location.hash === hash) render(); else location.hash = hash;
  }

  let afterRender = [];
  function render() {
    const parts = route();
    const main = $('#main');
    document.body.classList.remove('focus');
    afterRender = [];
    let nav = 'home';
    let html;
    if (!parts.length) html = viewHome();
    else if (parts[0] === 'dossiers') { nav = 'dossiers'; html = viewProjects(); }
    else if (parts[0] === 'd') {
      nav = 'dossiers';
      const p = getProject(parts[1]);
      if (!p) html = notFound();
      else {
        if (st.session.lastProjectId !== p.id) { st.session.lastProjectId = p.id; touch('session'); }
        html = viewProject(p, parts[2] || 'tableau', parts[3]);
      }
    }
    else if (parts[0] === 'entrainement') { nav = 'entrainement'; html = viewTraining(parts[1]); }
    else if (parts[0] === 'reglages') { nav = 'reglages'; html = viewSettings(); }
    else html = notFound();
    main.innerHTML = html;
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === nav));
    afterRender.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    if (st.ui.focusTitle) {
      st.ui.focusTitle = false;
      const t = $('.title-input');
      if (t) { t.focus(); t.select(); }
    }
  }

  function notFound() {
    return '<div class="empty">' + ic('alert') + '<p>Cette page n\'existe pas (ou le dossier a été supprimé).</p><a class="btn" href="#/">Retour à l\'accueil</a></div>';
  }

  /* ======================================================================
     Accueil
     ====================================================================== */
  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return 'Bonne nuit d\'écriture';
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  function backupBanner() {
    const hasContent = st.projects.some(p => p.chapters.length || p.ideas.length || p.characters.length) || st.exercises.length;
    if (!hasContent) return '';
    const last = st.settings.lastBackup || 0;
    if (Date.now() - last < 7 * 86400000) return '';
    return '<div class="banner">' + ic('alert') + '<span class="spacer">' + (last ? 'Ta dernière sauvegarde date de ' + ago(last).replace('il y a ', '') + '.' : 'Tu n\'as encore jamais téléchargé de sauvegarde.') +
      ' Tes textes ne sont stockés que sur cet appareil.</span><button class="btn-sm btn-primary" data-act="backup">' + ic('download') + ' Sauvegarder maintenant</button></div>';
  }

  function pickSpark() {
    const ideas = [];
    st.projects.forEach(p => p.ideas.forEach(i => { if (i.text.trim()) ideas.push({ text: i.text, from: p.title, pid: p.id }); }));
    if (ideas.length && Math.random() < 0.4) return Object.assign({ kind: 'idee' }, A.prompts.pick(ideas));
    return { kind: 'consigne', text: A.prompts.pick(A.prompts.consignes) };
  }

  function viewHome() {
    const p = lastProject();
    const goal = st.settings.dailyGoal || 300;
    const today = dayTotal(M.dayKey());
    const streak = calcStreak();
    if (!st.ui.spark) st.ui.spark = pickSpark();
    const spark = st.ui.spark;
    let h = '<div class="page-head"><div><h1>' + greeting() + '.</h1><p>' +
      (today >= goal ? 'Objectif du jour atteint. Tout ce que tu écris maintenant, c\'est du bonus.' : 'Un petit pas aujourd\'hui, c\'est déjà écrire.') + '</p></div></div>';
    h += backupBanner();
    h += '<div class="grid-2">';

    if (p) {
      const ch = p.chapters.find(c => c.id === p.session.chapterId) || p.chapters[p.chapters.length - 1];
      h += '<section class="card accent stack"><div><small class="muted">Reprendre là où tu t\'es arrêté·e</small><h2>' + esc(p.title) + '</h2></div>' +
        (p.nextStep.trim() ? '<p class="quote">' + esc(p.nextStep) + '</p>' : '<p class="muted">Aucune note laissée la dernière fois. Pense au « 📌 Note pour la prochaine fois » sous l\'éditeur.</p>') +
        (ch ? '<p class="muted" style="margin:0">Dernier chapitre ouvert : <b>' + esc(ch.title) + '</b> · ' + plural(M.wordCount(ch.text), 'mot', 'mots') + '</p>' : '') +
        '<div class="row"><a class="btn btn-primary" href="#/d/' + p.id + '/manuscrit' + (ch ? '/' + ch.id : '') + '">' + ic('pen') + ' Reprendre l\'écriture</a>' +
        '<a class="btn" href="#/d/' + p.id + '">Ouvrir le dossier</a></div></section>';
    } else {
      h += '<section class="card accent stack"><div><h2>Bienvenue dans ton atelier</h2><p class="muted">Un dossier = une histoire : manuscrit, personnages, fil rouge, idées, mots à utiliser… tout au même endroit.</p></div>' +
        '<div class="quick-add"><input type="text" id="newProjectTitle" placeholder="Titre de ta première histoire" data-enter="new-project"><button class="btn-primary" data-act="new-project">' + ic('plus') + ' Créer</button></div></section>';
    }

    const pct = Math.min(100, Math.round(100 * today / goal));
    h += '<section class="card stack"><div class="row between"><div><small class="muted">Entraînement du jour</small><h2>' + fmt(today) + ' / ' + fmt(goal) + ' mots</h2></div>' +
      '<div style="text-align:right"><span class="flame">' + ic('flame') + '</span> <b style="font-size:1.4rem;font-family:var(--serif)">' + streak + '</b><br><small class="muted">jour' + (streak > 1 ? 's' : '') + ' d\'affilée</small></div></div>' +
      '<div class="progress' + (pct >= 100 ? ' done' : '') + '"><div style="width:' + pct + '%"></div></div>' +
      '<p class="muted" style="margin:0">Compte tout ce que tu écris : entraînement et manuscrits.</p>' +
      '<div class="row"><a class="btn' + (pct >= 100 ? '' : ' btn-primary') + '" href="#/entrainement">' + ic('flame') + (pct >= 100 ? ' Écrire encore' : ' Écrire mes ' + fmt(Math.max(0, goal - today)) + ' mots') + '</a></div></section>';
    h += '</div>';

    // Étincelle + conseil
    h += '<div class="grid-2" style="margin-top:1rem">';
    h += '<section class="card stack"><div class="row between"><small class="muted">' + (spark.kind === 'idee' ? 'Une de tes idées (' + esc(spark.from) + ')' : 'Étincelle') + '</small>' +
      '<button class="btn-ghost btn-sm" data-act="spark-next" title="Une autre">' + ic('dice') + ' Une autre</button></div>' +
      '<p class="prompt-card" style="margin:0">' + esc(spark.text) + '</p>' +
      '<div class="row"><button class="btn" data-act="spark-write">' + ic('pen') + ' Écrire là-dessus</button></div></section>';
    if (p) {
      const move = nextMove(p);
      h += '<section class="card soft stack"><small class="muted">Prochain pas conseillé pour « ' + esc(p.title) + ' »</small><p style="margin:0;font-size:1.05rem">' + esc(move.text) + '</p>' +
        '<div class="row"><a class="btn" href="' + move.href + '">' + ic('arrow') + ' ' + esc(move.label) + '</a></div></section>';
    } else {
      h += '<section class="card soft stack"><small class="muted">Comment ça marche ?</small><ol class="list-plain">' +
        '<li>Crée un dossier pour chaque histoire.</li><li>Jette ta trame en vrac dans le <b>Fil rouge</b>, puis découpe-la en étapes.</li>' +
        '<li>Écris chapitre par chapitre. Tout s\'enregistre tout seul.</li><li>Lance un <b>CHECK</b> de temps en temps.</li><li>Entraîne-toi chaque jour, même 10 minutes.</li></ol></section>';
    }
    h += '</div>';

    if (st.projects.length) {
      h += '<div class="row between" style="margin:1.5rem 0 .75rem"><h2 style="margin:0">Mes dossiers</h2><a class="btn btn-ghost" href="#/dossiers">Tout voir ' + ic('arrow') + '</a></div>';
      h += '<div class="grid-3">' + st.projects.slice(0, 3).map(projectCard).join('') + '</div>';
    }
    return h;
  }

  /** Conseille l'étape suivante d'un dossier, pour passer de la trame à l'histoire complète. */
  function nextMove(p) {
    const base = '#/d/' + p.id + '/';
    if (!p.plot.synopsis.trim() && !p.plot.beats.length) return { text: 'Commence par écrire ta trame générale en vrac : ce qui se passe, comment ça commence, comment ça finit. Pas besoin que ce soit beau.', href: base + 'fil', label: 'Écrire ma trame' };
    if (!p.plot.beats.length) return { text: 'Ta trame existe. Découpe-la maintenant en étapes : une étape = une scène. C\'est ce qui rend l\'histoire « écrivable » morceau par morceau.', href: base + 'fil', label: 'Découper en étapes' };
    if (!p.characters.some(c => c.role === 'principal')) return { text: 'Crée la fiche de ton personnage principal : ce qu\'il veut, ce qu\'il craint. Ça guide toutes les scènes.', href: base + 'personnages', label: 'Créer la fiche' };
    const todo = p.plot.beats.find(b => b.status !== 'ecrit' && !b.chapterId);
    const inProgress = p.chapters.find(c => c.status === 'brouillon');
    if (inProgress) return { text: 'Continue le brouillon « ' + inProgress.title + ' ». Même 200 mots, c\'est une victoire.', href: base + 'manuscrit/' + inProgress.id, label: 'Continuer le brouillon' };
    if (todo) return { text: 'Prochaine étape à écrire : « ' + (todo.title || 'sans titre') + ' ». Tu n\'es pas obligé·e d\'écrire dans l\'ordre.', href: base + 'fil', label: 'Ouvrir le fil rouge' };
    if (p.chapters.some(c => c.status === 'relecture')) return { text: 'Des chapitres attendent leur relecture : lance un CHECK pour repérer temps, répétitions et fautes.', href: base + 'check', label: 'Lancer un CHECK' };
    return { text: 'Toutes tes étapes ont un chapitre. Relis l\'ensemble ou traque les incohérences avec l\'assistant.', href: base + 'assistant/coherence', label: 'Traquer les incohérences' };
  }

  /* ======================================================================
     Liste des dossiers
     ====================================================================== */
  function projectCard(p) {
    const words = M.projectWords(p);
    return '<a class="card card-link stack" href="#/d/' + p.id + '"><div><h3 style="margin:0">' + esc(p.title) + '</h3>' +
      (p.genre ? '<small class="muted">' + esc(p.genre) + '</small>' : '') + '</div>' +
      (p.pitch ? '<p class="muted" style="margin:0">' + esc(p.pitch.slice(0, 140)) + (p.pitch.length > 140 ? '…' : '') + '</p>' : '') +
      '<div class="row"><span class="pill">' + plural(words, 'mot', 'mots') + '</span><span class="pill">' + plural(p.chapters.length, 'chapitre', 'chapitres') + '</span>' +
      '<span class="pill">' + plural(p.characters.length, 'personnage', 'personnages') + '</span></div><small class="muted">Modifié ' + ago(p.updatedAt) + '</small></a>';
  }

  function viewProjects() {
    let h = '<div class="page-head"><div><h1>Mes dossiers</h1><p>Une histoire par dossier. Tout est enregistré automatiquement.</p></div>' +
      '<button class="btn" data-act="import" data-kind="any">' + ic('upload') + ' Importer</button></div>';
    h += '<div class="card" style="margin-bottom:1rem"><label for="newProjectTitle">Nouvelle histoire</label><div class="quick-add">' +
      '<input type="text" id="newProjectTitle" placeholder="Titre (provisoire, ça se change)" data-enter="new-project">' +
      '<button class="btn-primary" data-act="new-project">' + ic('plus') + ' Créer le dossier</button></div></div>';
    if (!st.projects.length) h += '<div class="empty">' + ic('folder') + '<p>Aucun dossier pour l\'instant.</p></div>';
    else h += '<div class="grid-3">' + st.projects.map(projectCard).join('') + '</div>';
    return h;
  }

  /* ======================================================================
     Dossier
     ====================================================================== */
  const TABS = [
    ['tableau', 'Tableau', 'grid'], ['manuscrit', 'Manuscrit', 'pen'], ['fil', 'Fil rouge', 'route'],
    ['personnages', 'Personnages', 'users'], ['idees', 'Idées', 'bulb'], ['lexique', 'Lexique', 'words'],
    ['univers', 'Univers', 'globe'], ['check', 'CHECK', 'check2'], ['assistant', 'Assistant', 'sparkle'],
    ['partager', 'Partager', 'share']
  ];

  function viewProject(p, tab, sub) {
    let h = '<div class="project-head"><a class="crumb" href="#/dossiers">' + ic('back') + ' Dossiers</a><span class="spacer"></span></div>';
    h += '<h1 style="margin-bottom:.75rem">' + esc(p.title) + '</h1>';
    h += '<nav class="tabs" aria-label="Sections du dossier">' + TABS.map(t =>
      '<a href="#/d/' + p.id + '/' + t[0] + '" class="' + (t[0] === tab ? 'active' : '') + (t[0] === 'check' ? ' check-tab' : '') + '">' + ic(t[2]) + t[1] + '</a>').join('') + '</nav>';
    afterRender.push(() => { const a = $('.tabs a.active'); if (a) a.scrollIntoView({ block: 'nearest', inline: 'center' }); });
    switch (tab) {
      case 'manuscrit': return h + viewManuscript(p, sub);
      case 'fil': return h + viewPlot(p);
      case 'personnages': return h + viewCharacters(p, sub);
      case 'idees': return h + viewIdeas(p);
      case 'lexique': return h + viewLexicon(p);
      case 'univers': return h + viewWorld(p);
      case 'check': return h + viewCheck(p, sub);
      case 'assistant': return h + viewAssistant(p, sub);
      case 'partager': return h + viewShare(p);
      default: return h + viewOverview(p);
    }
  }

  /* ---------- Tableau ---------- */
  function viewOverview(p) {
    const words = M.projectWords(p);
    const move = nextMove(p);
    let h = '<div class="grid-2">';
    h += '<section class="card stack"><h2>📌 Où j\'en suis</h2>' +
      '<textarea data-path="nextStep" rows="4" placeholder="Avant de partir, note ici où tu t\'es arrêté·e et ce que tu veux écrire la prochaine fois. Cette note t\'attendra sur l\'accueil.">' + esc(p.nextStep) + '</textarea>' +
      '<div class="card soft" style="padding:.8rem"><small class="muted">Prochain pas conseillé</small><p style="margin:.25rem 0 .5rem">' + esc(move.text) + '</p><a class="btn btn-sm" href="' + move.href + '">' + ic('arrow') + ' ' + esc(move.label) + '</a></div></section>';
    h += '<section class="card"><h2>Carte d\'identité</h2>' +
      '<div class="field"><label>Titre</label><input type="text" data-path="title" value="' + esc(p.title) + '" data-on="title"></div>' +
      '<div class="field"><label>Genre</label><input type="text" data-path="genre" value="' + esc(p.genre) + '" placeholder="Nouvelle fantastique, polar, roman d\'apprentissage…"></div>' +
      '<div class="field"><label>Le pitch en une ou deux phrases</label><textarea data-path="pitch" rows="2" placeholder="Quand… [personnage] doit… sinon…">' + esc(p.pitch) + '</textarea></div>' +
      '<div class="field"><label>Objectif de longueur (mots)</label><input type="number" min="0" step="500" data-path="targetWords" value="' + (p.targetWords || '') + '" placeholder="Ex. 8000 pour une nouvelle, 60000 pour un roman"></div></section>';
    h += '</div>';

    const pct = p.targetWords ? Math.min(100, Math.round(100 * words / p.targetWords)) : 0;
    h += '<section class="card" style="margin-top:1rem"><div class="stats">' +
      '<div class="stat"><b>' + fmt(words) + '</b><span>mots écrits</span></div>' +
      '<div class="stat"><b>' + p.chapters.length + '</b><span>chapitres</span></div>' +
      '<div class="stat"><b>' + p.characters.length + '</b><span>personnages</span></div>' +
      '<div class="stat"><b>' + p.ideas.length + '</b><span>idées</span></div></div>' +
      (p.targetWords ? '<div style="margin-top:1rem"><div class="row between"><small class="muted">Vers l\'objectif de ' + fmt(p.targetWords) + ' mots</small><small class="muted">' + pct + ' %</small></div><div class="progress' + (pct >= 100 ? ' done' : '') + '"><div style="width:' + pct + '%"></div></div></div>' : '') +
      '</section>';

    h += '<section class="card accent" style="margin-top:1rem"><div class="row between"><div><h2 style="margin:0">Partager ton histoire</h2>' +
      '<small class="muted">En PDF, en Word ou en texte, ou le dossier complet pour continuer sur un autre appareil.</small></div>' +
      '<a class="btn btn-primary" href="#/d/' + p.id + '/partager">' + ic('share') + ' Partager / exporter</a></div></section>';
    h += '<div class="row" style="margin-top:1rem;justify-content:flex-end"><button class="btn-danger btn-sm" data-act="delete-project">' + ic('trash') + ' Supprimer le dossier</button></div>';
    return h;
  }

  /* ---------- Manuscrit ---------- */
  function viewManuscript(p, chId) {
    if (!p.chapters.length) {
      return '<div class="empty">' + ic('pen') + '<p>Pas encore de chapitre.</p><div class="row" style="justify-content:center">' +
        '<button class="btn-primary" data-act="add-chapter">' + ic('plus') + ' Créer le premier chapitre</button>' +
        '<a class="btn" href="#/d/' + p.id + '/fil">Partir du fil rouge</a></div></div>';
    }
    let ch = p.chapters.find(c => c.id === chId) || p.chapters.find(c => c.id === p.session.chapterId) || p.chapters[0];
    if (p.session.chapterId !== ch.id) { p.session.chapterId = ch.id; p.session.cursor = 0; touch('p:' + p.id); }
    const idx = p.chapters.indexOf(ch);
    const words = M.wordCount(ch.text);
    wordCache.set(ch.id, words);

    let h = '<button class="btn focus-exit" data-act="focus">' + ic('x') + ' Quitter la concentration</button>';
    h += '<div class="writer"><aside class="side"><div class="card" style="padding:.6rem"><ul class="chapter-list">';
    h += p.chapters.map((c, i) => '<li class="' + (c.id === ch.id ? 'active' : '') + '"><a href="#/d/' + p.id + '/manuscrit/' + c.id + '">' +
      '<span class="t"><span class="dot s-' + c.status + '" data-chdot="' + c.id + '"></span><span data-chtitle="' + c.id + '">' + esc((i + 1) + '. ' + c.title) + '</span></span>' +
      '<small class="muted"><span data-chwords="' + c.id + '">' + plural(M.wordCount(c.text), 'mot', 'mots') + '</span>' + (c.styleSample ? ' · ✒︎ style' : '') + '</small></a></li>').join('');
    h += '</ul><button class="btn-ghost btn-sm" style="width:100%;margin-top:.4rem" data-act="add-chapter">' + ic('plus') + ' Nouveau chapitre</button></div>' +
      '<p class="help" style="padding:0 .4rem"><span class="dot s-idee"></span>Idée <span class="dot s-brouillon"></span>Brouillon <span class="dot s-relecture"></span>Relecture <span class="dot s-fini"></span>Terminé</p></aside>';

    h += '<div class="editor-wrap">';
    h += '<div class="row no-focus mobile-chapters">' + select('data-on="chapter-jump" aria-label="Changer de chapitre" style="flex:1;width:auto"',
      p.chapters.map((c, i) => [c.id, (i + 1) + '. ' + c.title]), ch.id) +
      '<button class="btn-icon" data-act="add-chapter" title="Nouveau chapitre">' + ic('plus') + '</button></div>';
    h += '<div class="row no-focus"><input type="text" class="title-input" style="flex:1;min-width:200px" data-path="chapters.' + ch.id + '.title" value="' + esc(ch.title) + '" aria-label="Titre du chapitre">' +
      select('data-path="chapters.' + ch.id + '.status" aria-label="État du chapitre" style="width:auto"', CH_STATUS, ch.status) + '</div>';
    h += '<div class="editor-bar no-focus">' +
      '<button class="btn-sm" data-act="focus" title="Mode concentration (Échap pour sortir)">' + ic('maximize') + ' Concentration</button>' +
      '<button class="btn-sm" data-act="rewrite-selection" title="Sélectionne un passage puis clique">' + ic('wand') + ' Réécrire la sélection</button>' +
      '<button class="btn-sm" data-act="unblock-chapter">' + ic('bulb') + ' Je bloque</button>' +
      '<a class="btn btn-sm" href="#/d/' + p.id + '/check/' + ch.id + '">' + ic('check2') + ' CHECK</a>' +
      '<span class="count" id="wordCount">' + plural(words, 'mot', 'mots') + '</span></div>';
    h += '<textarea id="editor" class="editor" data-path="chapters.' + ch.id + '.text" spellcheck="true" lang="fr" placeholder="Il était une fois… (tout s\'enregistre automatiquement)">' + esc(ch.text) + '</textarea>';
    h += '<div class="row no-focus"><label class="check"><input type="checkbox" data-path="chapters.' + ch.id + '.styleSample"' + (ch.styleSample ? ' checked' : '') + '> Ce chapitre représente bien mon style (sert d\'exemple à l\'assistant)</label></div>';
    h += '<details class="fold no-focus"' + (ch.notes ? ' open' : '') + '><summary>Notes de ce chapitre</summary><textarea data-path="chapters.' + ch.id + '.notes" rows="3" placeholder="Ce qui doit se passer, ce qu\'il ne faut pas oublier…">' + esc(ch.notes) + '</textarea></details>';
    h += '<div class="no-focus"><label>📌 Note pour la prochaine fois</label><textarea data-path="nextStep" rows="2" placeholder="Où tu t\'arrêtes, ce que tu veux écrire ensuite. Elle t\'attendra sur l\'accueil.">' + esc(p.nextStep) + '</textarea></div>';
    h += '<div class="row no-focus"><button class="btn-sm" data-act="move-chapter" data-dir="-1"' + (idx === 0 ? ' disabled' : '') + '>' + ic('up') + ' Monter</button>' +
      '<button class="btn-sm" data-act="move-chapter" data-dir="1"' + (idx === p.chapters.length - 1 ? ' disabled' : '') + '>' + ic('down') + ' Descendre</button>' +
      '<span class="spacer"></span><button class="btn-sm btn-danger" data-act="delete-chapter">' + ic('trash') + ' Supprimer ce chapitre</button></div>';
    h += '</div></div>';

    afterRender.push(() => {
      const ed = $('#editor');
      if (!ed) return;
      const jump = st.ui.jump;
      st.ui.jump = null;
      if (jump && jump.chapterId === ch.id) {
        ed.focus();
        ed.setSelectionRange(jump.start, jump.end);
        scrollEditorTo(ed, jump.start);
      } else if (p.session.cursor) {
        const pos = Math.min(p.session.cursor, ed.value.length);
        ed.focus({ preventScroll: true });
        ed.setSelectionRange(pos, pos);
        scrollEditorTo(ed, pos);
      }
    });
    return h;
  }

  /** Fait défiler la zone de texte pour montrer la position donnée. */
  function scrollEditorTo(ed, pos) {
    const mirror = document.createElement('div');
    const cs = getComputedStyle(ed);
    ['fontFamily', 'fontSize', 'lineHeight', 'paddingLeft', 'paddingRight', 'paddingTop', 'letterSpacing', 'wordSpacing'].forEach(k => mirror.style[k] = cs[k]);
    mirror.style.width = ed.clientWidth + 'px';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.overflowWrap = 'break-word';
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.textContent = ed.value.slice(0, pos) + '​';
    document.body.appendChild(mirror);
    const y = mirror.scrollHeight;
    mirror.remove();
    ed.scrollTop = Math.max(0, y - ed.clientHeight / 2);
    const r = ed.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.5) window.scrollTo({ top: window.scrollY + r.top - 80 });
  }

  /* ---------- Fil rouge ---------- */
  function viewPlot(p) {
    let h = '<div class="grid-2">';
    h += '<section class="card stack"><div><h2>Trame générale</h2><p class="muted" style="margin:0">Écris en vrac, sans te censurer : le début, la fin, les moments forts, les questions. Ce n\'est pas du texte à publier, c\'est ta carte.</p></div>' +
      '<textarea data-path="plot.synopsis" rows="14" placeholder="Une femme découvre que…\nAu milieu, elle comprend que…\nÀ la fin…">' + esc(p.plot.synopsis) + '</textarea>' +
      '<div class="row"><a class="btn" href="#/d/' + p.id + '/assistant/outline">' + ic('sparkle') + ' Découper ma trame avec l\'assistant</a></div></section>';

    h += '<section class="card stack"><div><h2>Partir d\'une structure</h2><p class="muted" style="margin:0">Tu as du mal à dérouler toute l\'histoire d\'un coup ? Ajoute un squelette d\'étapes, puis remplis-les une par une, dans l\'ordre que tu veux.</p></div>' +
      A.prompts.structures.map(s => '<div class="item"><div class="body"><b>' + esc(s.name) + '</b><br><small class="muted">' + esc(s.desc) + ' · ' + s.beats.length + ' étapes</small></div>' +
        '<div class="tools"><button class="btn-sm" data-act="apply-structure" data-id="' + s.id + '">' + ic('plus') + ' Ajouter</button></div></div>').join('') + '</section>';
    h += '</div>';

    h += '<section class="card" style="margin-top:1rem"><div class="row between" style="margin-bottom:.75rem"><div><h2 style="margin:0">Étapes de l\'histoire</h2><small class="muted">Une étape = une scène ou un chapitre. Quand tu es prêt·e, transforme-la en chapitre.</small></div>' +
      (p.plot.beats.length ? '<span class="pill green">' + p.plot.beats.filter(b => b.status === 'ecrit').length + ' / ' + p.plot.beats.length + ' écrites</span>' : '') + '</div>';
    if (!p.plot.beats.length) h += '<div class="empty" style="margin-bottom:.75rem">' + ic('route') + '<p>Aucune étape. Ajoute-les une à une ci-dessous, ou pars d\'une structure.</p></div>';
    h += p.plot.beats.map((b, i) => {
      const linked = b.chapterId && p.chapters.find(c => c.id === b.chapterId);
      return '<div class="item' + (b.status === 'ecrit' ? ' done' : '') + '"><span class="beat-num' + (b.status === 'ecrit' ? ' done' : '') + '">' + (i + 1) + '</span><div class="body stack" style="--gap:.4rem">' +
        '<input type="text" data-path="plot.beats.' + b.id + '.title" value="' + esc(b.title) + '" placeholder="Titre de l\'étape" style="font-weight:600">' +
        '<textarea data-path="plot.beats.' + b.id + '.desc" rows="2" placeholder="Ce qui se passe…" style="margin-top:.4rem">' + esc(b.desc) + '</textarea>' +
        '<div class="row" style="margin-top:.4rem">' + select('data-path="plot.beats.' + b.id + '.status" data-rerender="1" style="width:auto"', BEAT_STATUS, b.status) +
        (linked ? '<a class="btn btn-sm" href="#/d/' + p.id + '/manuscrit/' + linked.id + '">' + ic('pen') + ' Ouvrir « ' + esc(linked.title) + ' »</a>'
          : '<button class="btn-sm btn-primary" data-act="beat-to-chapter" data-id="' + b.id + '">' + ic('pen') + ' Écrire ce chapitre</button>') + '</div></div>' +
        '<div class="tools"><button class="btn-ghost btn-icon" data-act="move-beat" data-id="' + b.id + '" data-dir="-1" title="Monter"' + (i === 0 ? ' disabled' : '') + '>' + ic('up') + '</button>' +
        '<button class="btn-ghost btn-icon" data-act="move-beat" data-id="' + b.id + '" data-dir="1" title="Descendre"' + (i === p.plot.beats.length - 1 ? ' disabled' : '') + '>' + ic('down') + '</button>' +
        '<button class="btn-ghost btn-icon" data-act="delete-beat" data-id="' + b.id + '" title="Supprimer">' + ic('trash') + '</button></div></div>';
    }).join('');
    h += '<div class="quick-add" style="margin-top:.75rem"><input type="text" id="newBeat" placeholder="Nouvelle étape (ex. « Elle trouve la lettre »)" data-enter="add-beat"><button data-act="add-beat">' + ic('plus') + ' Ajouter</button></div></section>';
    return h;
  }

  /* ---------- Personnages ---------- */
  function viewCharacters(p, charId) {
    const c = charId && p.characters.find(x => x.id === charId);
    if (c) return viewCharacter(p, c);
    const text = p.chapters.map(x => x.text).join('\n');
    let h = '<div class="row between" style="margin-bottom:1rem"><p class="muted" style="margin:0">Les fiches servent de mémoire : l\'assistant et le CHECK s\'en servent pour repérer les incohérences.</p>' +
      '<button class="btn-primary" data-act="add-char">' + ic('plus') + ' Nouveau personnage</button></div>';
    if (!p.characters.length) return h + '<div class="empty">' + ic('users') + '<p>Aucun personnage pour l\'instant.</p></div>';
    const order = { principal: 0, antagoniste: 1, secondaire: 2, figurant: 3 };
    const list = p.characters.slice().sort((a, b) => (order[a.role] - order[b.role]) || a.name.localeCompare(b.name));
    h += '<div class="grid-3">' + list.map(ch => {
      const n = M.countOccurrences(text, (ch.name || '').split(/\s+/)[0]);
      const role = ROLES.find(r => r[0] === ch.role);
      return '<a class="card card-link char-card stack" href="#/d/' + p.id + '/personnages/' + ch.id + '"><div class="char-head"><span class="avatar">' + esc((ch.name || '?').trim().charAt(0).toUpperCase()) + '</span>' +
        '<div><h3>' + esc(ch.name) + '</h3><span class="pill' + (ch.role === 'principal' ? ' accent' : ch.role === 'antagoniste' ? ' red' : '') + '">' + esc(role ? role[1] : ch.role) + '</span></div></div>' +
        (ch.goal ? '<p class="muted" style="margin:0"><b>Veut :</b> ' + esc(ch.goal.slice(0, 120)) + '</p>' : '') +
        '<small class="muted">' + (n ? 'Cité·e ' + plural(n, 'fois', 'fois') + ' dans le manuscrit' : 'Pas encore apparu·e dans le manuscrit') + '</small></a>';
    }).join('') + '</div>';
    return h;
  }

  function viewCharacter(p, c) {
    const f = (key, label, ph, rows) => '<div class="field"><label>' + label + '</label>' + (rows
      ? '<textarea data-path="characters.' + c.id + '.' + key + '" rows="' + rows + '" placeholder="' + esc(ph || '') + '">' + esc(c[key]) + '</textarea>'
      : '<input type="text" data-path="characters.' + c.id + '.' + key + '" value="' + esc(c[key]) + '" placeholder="' + esc(ph || '') + '">') + '</div>';
    let h = '<div class="row between" style="margin-bottom:1rem"><a class="btn btn-ghost" href="#/d/' + p.id + '/personnages">' + ic('back') + ' Tous les personnages</a>' +
      '<button class="btn-danger btn-sm" data-act="delete-char" data-id="' + c.id + '">' + ic('trash') + ' Supprimer la fiche</button></div>';
    h += '<div class="grid-2"><section class="card">' +
      '<div class="field"><label>Nom</label><input type="text" class="title-input" style="padding-left:.7rem;border-color:var(--border)" data-path="characters.' + c.id + '.name" value="' + esc(c.name) + '"></div>' +
      f('aliases', 'Autres noms, surnoms (séparés par des virgules)', 'Lou, Mademoiselle Martin…') +
      '<div class="field"><label>Rôle</label>' + select('data-path="characters.' + c.id + '.role"', ROLES, c.role) + '</div>' +
      f('age', 'Âge', '') + f('look', 'Apparence', 'Ce qu\'on remarque en premier…', 3) + f('voice', 'Façon de parler', 'Tics de langage, registre, accent…', 2) +
      '</section><section class="card">' +
      f('personality', 'Caractère', '', 3) + f('goal', 'Ce qu\'il / elle veut', 'Son objectif dans l\'histoire', 2) + f('fear', 'Ce qu\'il / elle craint', '', 2) +
      f('past', 'Passé', 'Ce qui l\'a construit·e', 3) + f('relations', 'Relations', 'Avec les autres personnages', 3) + '</section></div>';
    h += '<section class="card" style="margin-top:1rem">' + f('facts', 'Faits établis (à ne pas contredire)', 'Un fait par ligne : yeux verts, cicatrice à la main gauche, a perdu son frère en 2003…', 4) +
      f('notes', 'Notes libres', '', 3) + '</section>';
    return h;
  }

  /* ---------- Idées ---------- */
  function ideaTags(text) { return (text.match(/#[\p{L}\p{N}_-]+/gu) || []).map(t => t.toLowerCase()); }

  function viewIdeas(p) {
    const tag = st.ui.ideaTag;
    const allTags = Array.from(new Set(p.ideas.flatMap(i => ideaTags(i.text)))).sort();
    let list = p.ideas.slice().sort((a, b) => (b.pinned - a.pinned) || (b.createdAt - a.createdAt));
    if (tag) list = list.filter(i => ideaTags(i.text).includes(tag));
    let h = '<section class="card stack"><div><h2>Boîte à idées</h2><p class="muted" style="margin:0">Note tout, même les idées bancales. Ajoute des #mots-clés pour les retrouver.</p></div>' +
      '<div class="quick-add"><textarea id="newIdea" rows="2" placeholder="Et si… (Ctrl + Entrée pour ajouter)" data-enter="add-idea"></textarea><button class="btn-primary" data-act="add-idea">' + ic('plus') + ' Ajouter</button></div>' +
      '<div class="row">' + (p.ideas.length ? '<button class="btn-sm" data-act="random-idea">' + ic('dice') + ' Pioche une idée au hasard</button>' : '') +
      (allTags.length ? '<span class="muted" style="font-size:.85rem">Filtrer :</span>' + allTags.map(t => '<button class="tag' + (t === tag ? '' : '') + '" data-act="idea-tag" data-tag="' + esc(t) + '" style="' + (t === tag ? 'outline:2px solid var(--accent)' : '') + '">' + esc(t) + '</button>').join('') +
        (tag ? '<button class="btn-ghost btn-sm" data-act="idea-tag" data-tag="">' + ic('x') + ' Tout afficher</button>' : '') : '') + '</div></section>';
    h += '<div style="margin-top:1rem">';
    if (!list.length) h += '<div class="empty">' + ic('bulb') + '<p>' + (tag ? 'Aucune idée avec ce mot-clé.' : 'La boîte est vide. La première idée est la plus dure !') + '</p></div>';
    h += list.map(i => '<div class="item' + (i.pinned ? ' pinned' : '') + '" id="idea-' + i.id + '"><div class="body"><textarea data-path="ideas.' + i.id + '.text" rows="2" style="border-color:transparent;padding:.2rem 0;min-height:2.5rem">' + esc(i.text) + '</textarea>' +
      '<small class="muted">' + dateFr(i.createdAt) + '</small></div><div class="tools">' +
      '<button class="btn-ghost btn-icon" data-act="pin-idea" data-id="' + i.id + '" title="' + (i.pinned ? 'Désépingler' : 'Épingler en haut') + '" style="' + (i.pinned ? 'color:var(--accent)' : '') + '">' + ic('pin') + '</button>' +
      '<button class="btn-ghost btn-icon" data-act="idea-to-beat" data-id="' + i.id + '" title="Ajouter au fil rouge">' + ic('route') + '</button>' +
      '<button class="btn-ghost btn-icon" data-act="delete-idea" data-id="' + i.id + '" title="Supprimer">' + ic('trash') + '</button></div></div>').join('');
    h += '</div>';
    return h;
  }

  /* ---------- Lexique ---------- */
  function viewLexicon(p) {
    const text = p.chapters.map(x => x.text).join('\n');
    let h = '<div class="grid-2">';
    h += '<section class="card stack"><div><h2>Mots à utiliser</h2><p class="muted" style="margin:0">Les mots rares, beaux ou justes que tu veux placer. L\'Atelier compte s\'ils apparaissent déjà dans ton manuscrit.</p></div>' +
      '<div class="quick-add"><input type="text" id="newWord" placeholder="Un mot ou une expression" data-enter="add-word"><button data-act="add-word">' + ic('plus') + '</button></div><div>';
    if (!p.lexicon.words.length) h += '<p class="muted">Aucun mot pour l\'instant.</p>';
    h += p.lexicon.words.map(w => {
      const n = M.countOccurrences(text, w.word);
      return '<div class="item"><div class="body"><div class="row"><input type="text" data-path="lexicon.words.' + w.id + '.word" value="' + esc(w.word) + '" style="flex:1;font-family:var(--serif);font-size:1.05rem">' +
        (n ? '<span class="pill green">' + ic('check') + ' utilisé ' + plural(n, 'fois', 'fois') + '</span>' : '<span class="pill">pas encore utilisé</span>') + '</div>' +
        '<input type="text" data-path="lexicon.words.' + w.id + '.note" value="' + esc(w.note || '') + '" placeholder="Définition, usage, idée de phrase…" style="margin-top:.35rem;font-size:.9rem"></div>' +
        '<div class="tools"><button class="btn-ghost btn-icon" data-act="delete-word" data-id="' + w.id + '" title="Supprimer">' + ic('trash') + '</button></div></div>';
    }).join('');
    h += '</div></section>';

    h += '<section class="card stack"><div><h2>Concepts à explorer</h2><p class="muted" style="margin:0">Thèmes, questions, émotions ou images que ton histoire devrait creuser.</p></div>' +
      '<div class="quick-add"><input type="text" id="newConcept" placeholder="Ex. « la honte héritée », « le temps qui s\'arrête »" data-enter="add-concept"><button data-act="add-concept">' + ic('plus') + '</button></div><div>';
    if (!p.lexicon.concepts.length) h += '<p class="muted">Aucun concept pour l\'instant.</p>';
    h += p.lexicon.concepts.map(c => '<div class="item' + (c.explored ? ' done' : '') + '"><div class="body"><input type="text" data-path="lexicon.concepts.' + c.id + '.title" value="' + esc(c.title) + '" style="font-weight:600">' +
      '<textarea data-path="lexicon.concepts.' + c.id + '.desc" rows="2" placeholder="Pistes, scènes possibles, questions…" style="margin-top:.35rem">' + esc(c.desc || '') + '</textarea>' +
      '<label class="check" style="margin-top:.35rem"><input type="checkbox" data-path="lexicon.concepts.' + c.id + '.explored" data-rerender="1"' + (c.explored ? ' checked' : '') + '> Exploré dans l\'histoire</label></div>' +
      '<div class="tools"><button class="btn-ghost btn-icon" data-act="delete-concept" data-id="' + c.id + '" title="Supprimer">' + ic('trash') + '</button></div></div>').join('');
    h += '</div></section></div>';
    return h;
  }

  /* ---------- Univers ---------- */
  function viewWorld(p) {
    let h = '<section class="card stack"><div><h2>Univers et faits établis</h2><p class="muted" style="margin:0">Tout ce qui est « vrai » dans ton histoire et ne doit pas être contredit : lieux, règles du monde, dates, objets importants, événements passés. Le CHECK et l\'assistant s\'en servent.</p></div>' +
      '<div class="quick-add">' + select('id="newFactCat" style="width:auto"', FACT_CATS, 'regle') +
      '<input type="text" id="newFact" placeholder="Ex. « Le village est à 3 h de marche de la mer »" data-enter="add-fact"><button data-act="add-fact">' + ic('plus') + '</button></div></section>';
    h += '<div style="margin-top:1rem">';
    if (!p.facts.length) h += '<div class="empty">' + ic('globe') + '<p>Aucun fait noté pour l\'instant.</p></div>';
    FACT_CATS.forEach(cat => {
      const list = p.facts.filter(f => f.category === cat[0]);
      if (!list.length) return;
      h += '<h3 style="margin:1rem 0 .5rem">' + esc(cat[1]) + '</h3>';
      h += list.map(f => '<div class="item"><div class="body"><textarea data-path="facts.' + f.id + '.text" rows="2">' + esc(f.text) + '</textarea>' +
        '<div style="margin-top:.35rem">' + select('data-path="facts.' + f.id + '.category" data-rerender="1" style="width:auto;font-size:.85rem"', FACT_CATS, f.category) + '</div></div>' +
        '<div class="tools"><button class="btn-ghost btn-icon" data-act="delete-fact" data-id="' + f.id + '" title="Supprimer">' + ic('trash') + '</button></div></div>').join('');
    });
    return h + '</div>';
  }

  /* ======================================================================
     CHECK
     ====================================================================== */
  function checkScope(p, sub) {
    const ui = st.ui.check;
    if (sub) ui[p.id] = sub;
    let scope = ui[p.id] || p.session.chapterId || 'all';
    if (scope !== 'all' && !p.chapters.find(c => c.id === scope)) scope = 'all';
    ui[p.id] = scope;
    return scope;
  }
  function scopeChapters(p, scope) { return scope === 'all' ? p.chapters : p.chapters.filter(c => c.id === scope); }

  function hl(ex) { return esc(ex.before) + '<mark>' + esc(ex.hit) + '</mark>' + esc(ex.after); }

  function knownWords(p) {
    const w = (st.settings.dictionary || []).slice();
    p.lexicon.words.forEach(x => w.push(...(x.word || '').split(/\s+/)));
    p.facts.forEach(f => (f.text.match(/\p{Lu}[\p{L}'’\-]+/gu) || []).forEach(x => w.push(x)));
    p.characters.forEach(c => [c.name, c.aliases].join(' ').split(/[\s,;]+/).forEach(x => x && w.push(x)));
    return w;
  }

  function viewCheck(p, sub) {
    if (!p.chapters.length) return '<div class="empty">' + ic('check2') + '<p>Écris d\'abord un chapitre : le CHECK analysera ton texte.</p></div>';
    const scope = checkScope(p, sub);
    const chapters = scopeChapters(p, scope);
    const opts = [['all', 'Tout le manuscrit']].concat(p.chapters.map((c, i) => [c.id, (i + 1) + '. ' + c.title]));
    let h = '<section class="card"><div class="row"><div style="flex:1;min-width:220px"><h2 style="margin:0">CHECK</h2><small class="muted">Concordance des temps, orthographe, grammaire, style, typographie et cohérence.</small></div>' +
      '<div style="min-width:220px">' + select('data-on="check-scope" aria-label="Que vérifier ?"', opts, scope) + '</div></div></section>';

    // 1. Orthographe & grammaire (LanguageTool)
    const lt = st.ui.lt && st.ui.lt.projectId === p.id && st.ui.lt.scope === scope ? st.ui.lt : null;
    h += '<section class="card" style="margin-top:1rem"><div class="row between"><div><h2 style="margin:0">1. Orthographe & grammaire</h2>' +
      '<small class="muted">Par LanguageTool, un correcteur gratuit en ligne : ton texte est envoyé à son serveur le temps de l\'analyse.</small></div>' +
      (lt && lt.running ? '<span class="pill amber">Analyse… ' + (lt.progress || '') + '</span>' : '<button class="btn-primary" data-act="lt-run">' + ic('check2') + (lt ? ' Relancer' : ' Lancer la vérification') + '</button>') + '</div>';
    if (lt && lt.error) h += '<div class="banner" style="margin:1rem 0 0">' + ic('alert') + '<span>' + esc(lt.error) + '</span></div>';
    if (lt && !lt.running && !lt.error) {
      const dict = new Set(knownWords(p).map(w => w.toLowerCase()));
      const visible = lt.matches.filter(m => !m.done && !m.ignored && !(m.kind === 'spell' && dict.has((m.original || '').toLowerCase())));
      const counts = { spell: 0, grammar: 0, typo: 0, style: 0 };
      visible.forEach(m => counts[m.kind]++);
      h += '<div class="row" style="margin:.75rem 0">' + (visible.length
        ? '<span class="pill red">' + counts.spell + ' orthographe</span><span class="pill amber">' + counts.grammar + ' grammaire</span><span class="pill">' + counts.typo + ' typographie</span><span class="pill accent">' + counts.style + ' style</span>'
        : '<span class="pill green">' + ic('check') + ' Rien à signaler</span>') + '</div>';
      const KIND = { spell: 'Orthographe', grammar: 'Grammaire', typo: 'Typographie', style: 'Style' };
      h += visible.slice(0, 120).map(m => {
        const ch = p.chapters.find(c => c.id === m.chapterId);
        if (!ch) return '';
        const ex = A.check.excerpt(ch.text, m.offset, m.offset + m.length, 55);
        const i = lt.matches.indexOf(m);
        return '<div class="issue ' + (m.kind === 'typo' ? 'style' : m.kind) + '"><div class="row between"><small><b>' + KIND[m.kind] + '</b>' + (scope === 'all' ? ' · ' + esc(ch.title) : '') + '</small>' +
          '<button class="btn-ghost btn-sm" data-act="goto-pos" data-ch="' + ch.id + '" data-s="' + m.offset + '" data-e="' + (m.offset + m.length) + '">Voir dans le texte</button></div>' +
          '<div class="ctx">' + hl(ex) + '</div><div>' + esc(m.message) + '</div><div class="sugg">' +
          m.replacements.map((r, k) => '<button class="btn-sm" data-act="lt-apply" data-i="' + i + '" data-r="' + k + '">' + (r ? esc(r) : '<i>(supprimer)</i>') + '</button>').join('') +
          '<button class="btn-ghost btn-sm" data-act="lt-ignore" data-i="' + i + '">Ignorer</button>' +
          (m.kind === 'spell' ? '<button class="btn-ghost btn-sm" data-act="lt-dict" data-i="' + i + '" title="Ne plus jamais signaler ce mot">+ Dictionnaire</button>' : '') + '</div></div>';
      }).join('');
      if (visible.length > 120) h += '<p class="muted" style="margin-top:.75rem">… et ' + (visible.length - 120) + ' autres. Corrige d\'abord celles-ci puis relance.</p>';
    }
    h += '</section>';

    // 2. Analyses locales
    const reports = chapters.map(c => ({ c, r: A.check.localReport(c.text, { tics: st.settings.tics, characters: p.characters, knownWords: knownWords(p) }) }));
    const P = reports.reduce((s, x) => s + x.r.tense.present, 0);
    const T = reports.reduce((s, x) => s + x.r.tense.past, 0);
    const dominant = P + T < 4 ? 'inconnu' : (P > T ? 'present' : 'passe');
    const flagged = [];
    chapters.forEach(c => {
      const t = A.check.analyzeTense(c.text, dominant === 'inconnu' ? undefined : dominant);
      t.flagged.forEach(f => flagged.push({ c, f }));
    });
    const TENSE = { present: 'présent (et passé composé)', passe: 'passé (imparfait, passé simple)', inconnu: 'pas assez de texte pour juger', melange: 'mélange présent / passé' };
    const pctP = P + T ? Math.round(100 * P / (P + T)) : 0;
    h += '<section class="card" style="margin-top:1rem"><h2>2. Concordance des temps</h2>' +
      '<p>Temps principal du récit : <b>' + TENSE[dominant] + '</b>' + (dominant !== 'inconnu' ? ' (' + (dominant === 'present' ? pctP : 100 - pctP) + ' % des verbes repérés)' : '') + '</p>' +
      (P + T ? '<div class="meter" title="Présent / passé"><span style="width:' + pctP + '%;background:var(--accent)"></span><span style="width:' + (100 - pctP) + '%;background:var(--green)"></span></div>' +
        '<div class="row between"><small class="muted">■ présent</small><small class="muted">passé ■</small></div>' : '') +
      '<p class="help">Analyse approximative de la narration (les dialogues sont ignorés, ils peuvent être au présent). Elle signale les paragraphes qui semblent changer de temps : à toi de juger si c\'est voulu.</p>';
    if (dominant !== 'inconnu') {
      if (!flagged.length) h += '<div class="issue ok">' + ic('check') + ' Aucun changement de temps suspect repéré.</div>';
      h += flagged.slice(0, 40).map(x => '<div class="issue grammar"><div class="row between"><small><b>' + TENSE[x.f.tense] + '</b> alors que le récit est au ' + (dominant === 'present' ? 'présent' : 'passé') + (scope === 'all' ? ' · ' + esc(x.c.title) : '') + '</small>' +
        '<button class="btn-ghost btn-sm" data-act="goto-pos" data-ch="' + x.c.id + '" data-s="' + x.f.start + '" data-e="' + (x.f.start + x.f.text.length) + '">Voir dans le texte</button></div>' +
        '<div class="ctx">' + esc(x.f.text.length > 260 ? x.f.text.slice(0, 260) + '…' : x.f.text) + '</div></div>').join('');
    }
    h += '</section>';

    // 3. Style
    const reps = reports.flatMap(x => x.r.repetitions.map(r => ({ c: x.c, r })));
    const longs = reports.flatMap(x => x.r.longSentences.map(s => ({ c: x.c, s })));
    const words = reports.reduce((s, x) => s + x.r.words, 0);
    const advTotal = reports.reduce((s, x) => s + x.r.adverbs.total, 0);
    const advMap = new Map();
    reports.forEach(x => x.r.adverbs.top.forEach(([w, n]) => advMap.set(w, (advMap.get(w) || 0) + n)));
    const ticsAll = A.check.analyzeTics(chapters.map(c => c.text).join('\n'), st.settings.tics);
    h += '<section class="card" style="margin-top:1rem"><h2>3. Style</h2><div class="stats" style="margin-bottom:1rem">' +
      '<div class="stat"><b>' + fmt(words) + '</b><span>mots</span></div>' +
      '<div class="stat"><b>' + reps.length + '</b><span>répétitions proches</span></div>' +
      '<div class="stat"><b>' + longs.length + '</b><span>phrases très longues</span></div>' +
      '<div class="stat"><b>' + (words ? Math.round(1000 * advTotal / words) : 0) + '</b><span>adverbes en -ment / 1000 mots</span></div></div>';
    h += '<details class="fold"' + (reps.length ? ' open' : '') + '><summary>Répétitions rapprochées (' + reps.length + ')</summary>' +
      (reps.length ? reps.slice(0, 40).map(x => {
        const t = x.c.text;
        const clean = s => esc(s.replace(/\s+/g, ' '));
        let middle = t.slice(x.r.first + x.r.len1, x.r.second);
        if (middle.length > 160) middle = middle.slice(0, 70) + ' […] ' + middle.slice(-70);
        const a = Math.max(0, x.r.first - 40), b = Math.min(t.length, x.r.second + x.r.len2 + 40);
        const ex = { html: (a > 0 ? '…' : '') + clean(t.slice(a, x.r.first)) + '<mark>' + esc(t.substr(x.r.first, x.r.len1)) + '</mark>' + clean(middle) +
          '<mark>' + esc(t.substr(x.r.second, x.r.len2)) + '</mark>' + clean(t.slice(x.r.second + x.r.len2, b)) + (b < t.length ? '…' : '') };
        return '<div class="issue style"><div class="row between"><small><b>« ' + esc(x.r.word) + ' »</b> répété à ' + x.r.distance + ' mots d\'écart' + (scope === 'all' ? ' · ' + esc(x.c.title) : '') + '</small>' +
          '<button class="btn-ghost btn-sm" data-act="goto-pos" data-ch="' + x.c.id + '" data-s="' + x.r.second + '" data-e="' + (x.r.second + x.r.len2) + '">Voir</button></div><div class="ctx">' + ex.html + '</div></div>';
      }).join('') : '<p class="muted">Aucune.</p>') + '</details>';
    h += '<details class="fold" style="margin-top:.5rem"><summary>Phrases de plus de 40 mots (' + longs.length + ')</summary>' +
      (longs.length ? longs.slice(0, 25).map(x => '<div class="issue style"><div class="row between"><small><b>' + x.s.words + ' mots</b>' + (scope === 'all' ? ' · ' + esc(x.c.title) : '') + '</small>' +
        '<button class="btn-ghost btn-sm" data-act="goto-pos" data-ch="' + x.c.id + '" data-s="' + x.s.start + '" data-e="' + x.s.end + '">Voir</button></div><div class="ctx">' + esc(x.c.text.slice(x.s.start, Math.min(x.s.end, x.s.start + 220))) + (x.s.end - x.s.start > 220 ? '…' : '') + '</div></div>').join('')
        : '<p class="muted">Aucune. Une phrase longue n\'est pas une faute, mais vérifie qu\'elle se lit d\'une traite.</p>') + '</details>';
    const advTop = Array.from(advMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15);
    h += '<details class="fold" style="margin-top:.5rem"><summary>Adverbes en -ment (' + advTotal + ')</summary><p class="help">Approximatif. Repère surtout ceux qui doublent un verbe (« murmurer doucement ») : un verbe plus précis suffit souvent.</p>' +
      (advTop.length ? '<div class="row">' + advTop.map(([w, n]) => '<span class="pill">' + esc(w) + ' × ' + n + '</span>').join('') + '</div>' : '<p class="muted">Aucun.</p>') + '</details>';
    h += '<details class="fold" style="margin-top:.5rem"><summary>Mots-tics (' + ticsAll.length + ')</summary><p class="help">Liste modifiable dans les Réglages.</p>' +
      (ticsAll.length ? '<div class="row">' + ticsAll.map(t => '<span class="pill' + (t.per1000 > 2 ? ' amber' : '') + '">« ' + esc(t.tic) + ' » × ' + t.count + '</span>').join('') + '</div>' : '<p class="muted">Aucun.</p>') + '</details>';
    h += '</section>';

    // 4. Typographie
    const typo = {};
    reports.forEach(x => x.r.typography.forEach(t => { typo[t.id] = typo[t.id] || { label: t.label, count: 0 }; typo[t.id].count += t.count; }));
    const typoList = Object.values(typo);
    h += '<section class="card" style="margin-top:1rem"><div class="row between"><div><h2 style="margin:0">4. Typographie française</h2><small class="muted">Espaces avant ; : ! ?, guillemets « », tirets de dialogue, points de suspension.</small></div>' +
      (typoList.length ? '<button data-act="typo-fix">' + ic('wand') + ' Tout corriger automatiquement</button>' : '') + '</div>' +
      (typoList.length ? '<div class="row" style="margin-top:.75rem">' + typoList.map(t => '<span class="pill">' + esc(t.label) + ' × ' + t.count + '</span>').join('') + '</div>'
        : '<div class="issue ok" style="margin-top:.75rem">' + ic('check') + ' Typographie impeccable.</div>') + '</section>';

    // 5. Noms et personnages
    const variants = new Map(); const unknown = new Map(); const mentions = new Map();
    reports.forEach(x => {
      x.r.names.variants.forEach(v => { const k = v.written; const e = variants.get(k) || Object.assign({}, v, { count: 0, ch: x.c }); e.count += v.count; variants.set(k, e); });
      x.r.names.unknown.forEach(u => { const e = unknown.get(u.name) || { name: u.name, count: 0 }; e.count += u.count; unknown.set(u.name, e); });
      x.r.names.mentions.forEach(m => mentions.set(m.id, (mentions.get(m.id) || 0) + m.count));
    });
    const absent = p.characters.filter(c => !mentions.get(c.id));
    h += '<section class="card" style="margin-top:1rem"><h2>5. Noms et personnages</h2>';
    if (!p.characters.length) h += '<p class="muted">Crée des fiches personnages pour que le CHECK repère les noms mal orthographiés (« Mathilde » / « Matilde »).</p>';
    if (variants.size) {
      h += '<h3>Orthographes suspectes</h3>' + Array.from(variants.values()).map(v => '<div class="issue spell"><div class="row between"><span>« <b>' + esc(v.written) + '</b> » (' + plural(v.count, 'fois', 'fois') + ') : ne serait-ce pas « <b>' + esc(v.suggestion) + '</b> » ?</span>' +
        '<span class="row"><button class="btn-sm" data-act="name-replace" data-from="' + esc(v.written) + '" data-to="' + esc(v.suggestion) + '">Remplacer partout</button>' +
        '<button class="btn-ghost btn-sm" data-act="name-ignore" data-name="' + esc(v.written) + '">C\'est voulu</button></span></div></div>').join('');
    }
    const unk = Array.from(unknown.values()).filter(u => u.count >= 3).sort((a, b) => b.count - a.count).slice(0, 15);
    if (unk.length) {
      h += '<h3 style="margin-top:1rem">Noms récurrents sans fiche</h3><p class="help">Personnages, lieux ou noms propres qui reviennent souvent. Crée une fiche, ou indique que c\'est normal.</p>' +
        unk.map(u => '<div class="issue"><div class="row between"><span><b>' + esc(u.name) + '</b> · ' + plural(u.count, 'fois', 'fois') + '</span><span class="row">' +
          '<button class="btn-sm" data-act="name-create" data-name="' + esc(u.name) + '">' + ic('users') + ' Créer une fiche</button>' +
          '<button class="btn-ghost btn-sm" data-act="name-ignore" data-name="' + esc(u.name) + '">C\'est normal</button></span></div></div>').join('');
    }
    if (absent.length && scope === 'all') h += '<h3 style="margin-top:1rem">Jamais cités dans le manuscrit</h3><div class="row">' + absent.map(c => '<a class="pill" href="#/d/' + p.id + '/personnages/' + c.id + '">' + esc(c.name) + '</a>').join('') + '</div>';
    if (p.characters.length && !variants.size && !unk.length && !(absent.length && scope === 'all')) h += '<div class="issue ok">' + ic('check') + ' Rien à signaler sur les noms.</div>';
    h += '</section>';

    // 6. Cohérence
    h += '<section class="card accent" style="margin-top:1rem"><h2>6. Cohérence de l\'histoire</h2><p>Contradictions (« dire un truc et le contredire plus tard »), chronologie, failles logiques, fils oubliés : ça demande de comprendre l\'histoire, donc c\'est le travail de l\'assistant IA. Il compare ton texte à tes fiches, ton univers et ton fil rouge.</p>' +
      '<a class="btn btn-primary" href="#/d/' + p.id + '/assistant/coherence">' + ic('search') + ' Traquer les incohérences</a></section>';
    return h;
  }

  /* ======================================================================
     Partager
     ====================================================================== */
  function shareOpts(p) {
    p.shareOpts = Object.assign({ titlePage: true, numbering: true, pageBreak: true, pitch: false, exclude: [] }, p.shareOpts || {});
    return p.shareOpts;
  }

  function projectExport(p) {
    return { app: 'atelier-ecriture', kind: 'dossier', version: 1, exportedAt: new Date().toISOString(), project: p };
  }

  function viewShare(p) {
    const o = shareOpts(p);
    const ex = new Set(o.exclude);
    const included = p.chapters.filter(c => !ex.has(c.id) && c.text.trim());
    const words = included.reduce((s, c) => s + M.wordCount(c.text), 0);
    const pages = Math.max(1, Math.round(words / 330)) + (o.titlePage ? 1 : 0);
    const canShare = A.exporter.canShareFile(A.exporter.MIME.pdf);
    // On charge la bibliothèque PDF à l'avance : le partage doit suivre immédiatement le clic.
    afterRender.push(() => { A.exporter.loadPdfLib().catch(() => {}); });

    let h = '<div class="grid-2">';
    h += '<section class="card stack"><div><h2>Que partager ?</h2><p class="muted" style="margin:0">Choisis les chapitres et la présentation.</p></div>';
    if (!p.chapters.length) h += '<p class="muted" style="margin:0">Aucun chapitre pour l\'instant.</p>';
    else {
      h += '<div class="row"><button class="btn-sm" data-act="share-select" data-mode="all">Tous</button>' +
        '<button class="btn-sm" data-act="share-select" data-mode="done">Seulement les terminés</button>' +
        '<button class="btn-sm btn-ghost" data-act="share-select" data-mode="none">Aucun</button></div>';
      h += '<div class="share-list">' + p.chapters.map((c, i) => {
        const empty = !c.text.trim();
        return '<label class="check"><input type="checkbox" data-on="share-ch" data-id="' + c.id + '"' + (!ex.has(c.id) && !empty ? ' checked' : '') + (empty ? ' disabled' : '') + '>' +
          '<span><span class="dot s-' + c.status + '"></span>' + esc((i + 1) + '. ' + c.title) + ' <small class="muted">· ' + (empty ? 'vide' : plural(M.wordCount(c.text), 'mot', 'mots')) + '</small></span></label>';
      }).join('') + '</div>';
    }
    h += '<hr class="sep" style="margin:.25rem 0">' +
      '<div class="field"><label>Ton nom (ou pseudonyme) sur la page de titre</label><input type="text" data-spath="authorName" value="' + esc(st.settings.authorName || '') + '" placeholder="Facultatif"></div>' +
      '<label class="check"><input type="checkbox" data-path="shareOpts.titlePage" data-rerender="1"' + (o.titlePage ? ' checked' : '') + '> Page de titre</label>' +
      '<label class="check"><input type="checkbox" data-path="shareOpts.pitch"' + (o.pitch && p.pitch ? ' checked' : '') + (p.pitch && o.titlePage ? '' : ' disabled') + '> Ajouter le pitch sur la page de titre' +
      (p.pitch ? '' : ' <small class="muted">(à écrire dans le Tableau)</small>') + '</label>' +
      '<label class="check"><input type="checkbox" data-path="shareOpts.numbering"' + (o.numbering ? ' checked' : '') + '> Numéroter les chapitres (« Chapitre 1 »)</label>' +
      '<label class="check"><input type="checkbox" data-path="shareOpts.pageBreak"' + (o.pageBreak ? ' checked' : '') + '> Chaque chapitre sur une nouvelle page</label></section>';

    const dis = included.length ? '' : ' disabled';
    const row = (id, title, desc, shareable) => '<div class="item"><div class="body"><b>' + title + '</b><br><small class="muted">' + desc + '</small></div>' +
      '<div class="tools share-tools">' +
      (shareable && canShare ? '<button class="btn-sm btn-primary" data-act="share-file" data-format="' + id + '" data-mode="share"' + dis + '>' + ic('share') + ' Partager</button>' : '') +
      '<button class="btn-sm' + (shareable && canShare ? '' : ' btn-primary') + '" data-act="share-file" data-format="' + id + '" data-mode="download"' + dis + '>' + ic('download') + ' Télécharger</button></div></div>';
    h += '<section class="card stack"><div><h2>Envoyer ou télécharger</h2><p class="muted" style="margin:0">' +
      (included.length ? plural(included.length, 'chapitre', 'chapitres') + ' · ' + plural(words, 'mot', 'mots') + ' · environ ' + plural(pages, 'page', 'pages')
        : 'Sélectionne au moins un chapitre qui contient du texte.') + '</p></div>' +
      '<div>' + row('pdf', 'PDF', 'Pour faire lire : mise en page de livre (A4, texte justifié, numéros de page). Ne se modifie pas.', true) +
      row('docx', 'Word (.docx)', 'Pour retravailler le texte ou l\'envoyer à un éditeur, un concours, une relectrice. S\'ouvre aussi dans Pages, LibreOffice et Google Docs.', true) +
      row('txt', 'Texte brut (.txt)', 'Le texte seul, sans mise en forme.', true) + '</div>' +
      (canShare ? '<p class="help" style="margin:0">« Partager » ouvre le menu de ton appareil : Mail, Messages, WhatsApp, Drive, AirDrop… Si ton appareil refuse un format, le fichier est simplement téléchargé.</p>'
        : '<p class="help" style="margin:0">Sur ordinateur, télécharge le fichier puis joins-le à un e-mail ou range-le dans ton cloud. Sur téléphone, un bouton « Partager » apparaît ici.</p>') +
      '</section></div>';

    h += '<section class="card stack" style="margin-top:1rem"><div><h2>Continuer sur un autre appareil</h2><p class="muted" style="margin:0">Le dossier complet (manuscrit, fiches, fil rouge, idées, lexique…) dans un seul fichier. Sur l\'autre appareil : <b>Dossiers → Importer</b>.</p></div>' +
      '<div class="row">' + (canShare ? '<button data-act="share-file" data-format="json" data-mode="share">' + ic('share') + ' Partager le dossier</button>' : '') +
      '<button data-act="share-file" data-format="json" data-mode="download">' + ic('save') + ' Télécharger le dossier (.json)</button></div></section>';
    return h;
  }

  async function deliverDoc(title, doc, fmt, wantShare) {
    const E = A.exporter;
    const base = slug(title);
    let blob, name;
    if (fmt === 'pdf') {
      if (!window.jspdf) { toast('Préparation du PDF…'); await E.loadPdfLib(); }
      blob = E.toPdf(doc); name = base + '.pdf';
    } else if (fmt === 'docx') { blob = E.toDocx(doc); name = base + '.docx'; }
    else { blob = new Blob([E.toTxt(doc)], { type: E.MIME.txt }); name = base + '.txt'; }
    return { result: await E.deliver(blob, name, title, wantShare), name };
  }

  function deliveredToast(r, wantShare) {
    if (r.result === 'shared') toast('Partagé ✓');
    else if (r.result === 'downloaded') toast(wantShare ? 'Partage direct indisponible pour ce format ici : fichier téléchargé ✓' : 'Fichier téléchargé : ' + r.name);
  }

  /* ======================================================================
     Assistant
     ====================================================================== */
  function aiState(p, task) {
    if (!st.ui.ai || st.ui.ai.projectId !== p.id) {
      st.ui.ai = { projectId: p.id, task: 'rewrite', input: { intention: 'fluide', chapterId: p.session.chapterId || 'all', wantDraft: false }, prompt: null, output: '', running: false, error: null, handle: null, pasteMode: false };
    }
    if (task && A.ai.TASKS[task] && st.ui.ai.task !== task) {
      st.ui.ai.task = task; st.ui.ai.prompt = null; st.ui.ai.output = ''; st.ui.ai.error = null;
    }
    return st.ui.ai;
  }

  function styleSamples() {
    const out = [];
    st.projects.forEach(p => p.chapters.forEach(c => { if (c.styleSample && c.text.trim()) out.push({ label: p.title + ' — ' + c.title, text: c.text }); }));
    st.exercises.forEach(e => { if (e.styleSample && (e.text || '').trim()) out.push({ label: 'Entraînement du ' + dateFr(e.createdAt, true), text: e.text }); });
    return out;
  }

  function buildPrompt(p, ai) {
    const samples = styleSamples();
    const max = st.settings.aiMode === 'api' ? 30000 : 9000;
    const style = A.ai.styleBlock(st.settings, samples, max);
    const ctx = {
      project: p, settings: st.settings, input: ai.input, style,
      styleSamplesOnly: A.ai.styleBlock({ styleProfile: '' }, samples, st.settings.aiMode === 'api' ? 40000 : 12000)
    };
    return A.ai.TASKS[ai.task].build(ctx);
  }

  function chapterOptions(p, withAll, allLabel) {
    const o = p.chapters.map((c, i) => [c.id, (i + 1) + '. ' + c.title]);
    return withAll ? [['all', allLabel || 'Tout le manuscrit']].concat(o) : o;
  }

  function viewAssistant(p, sub) {
    const ai = aiState(p, sub);
    const api = st.settings.aiMode === 'api';
    const T = A.ai.TASKS;
    let h = '<section class="card stack"><div class="row between"><div><h2 style="margin:0">Assistant d\'écriture</h2><small class="muted">Il connaît ton dossier (fiches, univers, fil rouge) et imite ton style.</small></div>' +
      '<div class="mode-switch" role="group" aria-label="Mode"><button class="' + (api ? '' : 'on') + '" data-act="ai-mode" data-mode="copy">Copier-coller (gratuit)</button><button class="' + (api ? 'on' : '') + '" data-act="ai-mode" data-mode="api">Automatique (clé API)</button></div></div>';
    if (api && !st.settings.apiKey) h += '<div class="banner" style="margin:0">' + ic('alert') + '<span class="spacer">Le mode automatique a besoin d\'une clé API Claude.</span><a class="btn btn-sm" href="#/reglages">Ajouter ma clé</a></div>';
    if (!api) h += '<p class="help" style="margin:0">L\'Atelier prépare une demande complète. Tu la copies dans <b>Claude.ai</b> (un compte gratuit suffit), puis tu recolles la réponse ici pour la garder.</p>';
    h += '<div class="task-grid">' + Object.keys(T).map(k => '<button class="task-btn' + (k === ai.task ? ' active' : '') + '" data-act="ai-task" data-task="' + k + '"><b>' + ic(T[k].icon) + esc(T[k].label) + '</b><span>' + esc(T[k].desc) + '</span></button>').join('') + '</div></section>';

    // Formulaire de la tâche
    h += '<section class="card stack" style="margin-top:1rem"><h2 style="margin:0">' + esc(T[ai.task].label) + '</h2>';
    const inp = ai.input;
    // Un chapitre précis est requis pour ces tâches : on choisit le dernier ouvert par défaut.
    if ((ai.task === 'unblock' || ai.task === 'feedback') && !p.chapters.some(c => c.id === inp.chapterId)) {
      inp.chapterId = p.chapters.some(c => c.id === p.session.chapterId) ? p.session.chapterId : (ai.task === 'feedback' && p.chapters[0] ? p.chapters[0].id : '');
    }
    if (ai.task === 'coherence' && inp.chapterId && inp.chapterId !== 'all' && !p.chapters.some(c => c.id === inp.chapterId)) inp.chapterId = 'all';
    let ready = true;
    let hint = '';
    if (ai.task === 'rewrite') {
      h += '<div class="field"><label>Passage à retravailler</label><textarea data-ai="passage" rows="8" placeholder="Colle un passage, ou sélectionne-le dans l\'éditeur puis clique sur « Réécrire la sélection ».">' + esc(inp.passage || '') + '</textarea></div>' +
        '<div class="grid-2"><div class="field"><label>Ce que tu veux</label>' + select('data-ai="intention"', [['fluide', 'Plus fluide'], ['concis', 'Plus concis'], ['vivant', 'Plus vivant, plus sensoriel'], ['montrer', 'Montrer plutôt que dire'], ['tension', 'Plus de tension'], ['dialogue', 'Améliorer les dialogues'], ['correction', 'Corriger seulement (fautes, temps)']], inp.intention || 'fluide') + '</div>' +
        '<div class="field"><label>Précision (facultatif)</label><input type="text" data-ai="custom" value="' + esc(inp.custom || '') + '" placeholder="Ex. garder la dernière phrase telle quelle"></div></div>';
      ready = !!(inp.passage || '').trim();
      hint = 'Ajoute un passage à retravailler.';
    } else if (ai.task === 'outline') {
      ready = !!p.plot.synopsis.trim();
      h += ready ? '<p class="muted" style="margin:0">L\'assistant va lire ta trame générale (onglet Fil rouge) et proposer des étapes. Tu pourras les ajouter d\'un clic à ton fil rouge.</p>'
        : '<div class="banner" style="margin:0">' + ic('alert') + '<span class="spacer">Écris d\'abord ta trame générale dans le Fil rouge, même en vrac.</span><a class="btn btn-sm" href="#/d/' + p.id + '/fil">Aller au fil rouge</a></div>';
    } else if (ai.task === 'coherence') {
      ready = p.chapters.some(c => c.text.trim());
      h += '<div class="field"><label>Que vérifier ?</label>' + select('data-ai="chapterId"', chapterOptions(p, true, 'Toute l\'histoire'), inp.chapterId || 'all') + '<p class="help">Pour un chapitre précis, l\'assistant le compare aussi aux chapitres précédents et à ton dossier.</p></div>';
      hint = 'Écris d\'abord un chapitre.';
    } else if (ai.task === 'unblock') {
      ready = true;
      h += '<div class="field"><label>Où en es-tu ?</label>' + select('data-ai="chapterId"', [['', '— Je n\'ai pas encore commencé —']].concat(chapterOptions(p, false)), inp.chapterId || '') + '</div>' +
        '<div class="field"><label>Ce qui te bloque (facultatif)</label><input type="text" data-ai="note" value="' + esc(inp.note || '') + '" placeholder="Ex. je ne sais pas comment ils se retrouvent"></div>' +
        '<label class="check"><input type="checkbox" data-ai="wantDraft"' + (inp.wantDraft ? ' checked' : '') + '> Ajouter un premier jet d\'environ 250 mots, que je réécrirai</label>';
    } else if (ai.task === 'feedback') {
      ready = p.chapters.length > 0;
      h += '<div class="field"><label>Chapitre à lire</label>' + select('data-ai="chapterId"', chapterOptions(p, false), inp.chapterId) + '</div>';
      hint = 'Écris d\'abord un chapitre.';
    } else if (ai.task === 'style') {
      const samples = styleSamples();
      ready = samples.length > 0;
      h += '<p style="margin:0">L\'assistant ne « s\'entraîne » pas sur tes textes : à chaque demande, il reçoit ton <b>profil de style</b> et des <b>extraits</b> de tes meilleurs textes, et il s\'en inspire. Plus tu marques de textes comme exemples, plus il te ressemble.</p>' +
        '<p class="muted" style="margin:0">' + (samples.length ? plural(samples.length, 'texte marqué', 'textes marqués') + ' comme exemple de ton style : ' + samples.map(s => esc(s.label)).join(', ') + '.'
          : 'Aucun texte marqué pour l\'instant. Coche « Ce chapitre représente bien mon style » sous l\'éditeur, ou marque un texte d\'entraînement.') + '</p>' +
        (st.settings.styleProfile ? '<details class="fold"><summary>Ton profil de style actuel</summary><div class="output" style="max-height:20rem">' + esc(st.settings.styleProfile) + '</div><a class="btn btn-sm" style="margin-top:.5rem" href="#/reglages">Le modifier</a></details>' : '');
      hint = 'Marque au moins un texte comme exemple de ton style.';
    } else if (ai.task === 'free') {
      h += '<div class="field"><label>Ta question</label><textarea data-ai="question" rows="4" placeholder="Ex. Quel serait un bon titre ? Comment rendre mon antagoniste plus crédible ?">' + esc(inp.question || '') + '</textarea></div>' +
        '<div class="field"><label>Joindre du texte</label>' + select('data-ai="chapterId"', [['', 'Seulement le dossier (fiches, univers, fil rouge)']].concat(chapterOptions(p, true, 'Tout le manuscrit')), inp.chapterId || '') + '</div>';
      ready = !!(inp.question || '').trim();
      hint = 'Écris ta question.';
    }

    if (!ready && hint && ai.task !== 'outline') h += '<p class="help" style="margin:0">' + esc(hint) + '</p>';
    if (api) {
      let cost = '';
      if (ready) { try { const e = A.ai.estimate(buildPrompt(p, ai), st.settings.model); cost = ' (≈ ' + (e.usd < 0.01 ? 'moins d\'1 centime' : e.usd.toFixed(2).replace('.', ',') + ' $') + ')'; } catch (e) { /* ignore */ } }
      h += '<div class="row">' + (ai.running ? '<button data-act="ai-stop">' + ic('stop') + ' Arrêter</button><span class="pill amber">Claude écrit…</span>'
        : '<button class="btn-primary" data-act="ai-run"' + (ready && st.settings.apiKey ? '' : ' disabled') + '>' + ic('play') + ' Lancer' + cost + '</button>') + '</div>';
    } else {
      h += '<div class="row"><button class="btn-primary" data-act="ai-prepare"' + (ready ? '' : ' disabled') + '>' + ic('sparkle') + ' Préparer la demande</button></div>';
      if (ai.prompt) {
        const full = A.ai.asPasteable(ai.prompt);
        h += '<hr class="sep" style="margin:.5rem 0"><div class="row"><b>Étape 1.</b> Copie la demande<span class="spacer"></span><small class="muted">' + fmt(full.length) + ' caractères</small></div>' +
          (full.length > 60000 ? '<p class="help">C\'est long : si Claude.ai refuse, vérifie chapitre par chapitre.</p>' : '') +
          '<textarea class="prompt-box" readonly rows="8">' + esc(full) + '</textarea>' +
          '<div class="row"><button class="btn-primary" data-act="ai-copy">' + ic('copy') + ' Copier la demande</button><a class="btn" href="https://claude.ai/new" target="_blank" rel="noopener">' + ic('external') + ' Ouvrir Claude.ai</a></div>' +
          '<div class="row" style="margin-top:.5rem"><b>Étape 2.</b> Colle la réponse ici pour la garder (facultatif)</div>' +
          '<textarea id="aiPaste" rows="6" placeholder="Colle ici la réponse de Claude…">' + esc(ai.pasteDraft || '') + '</textarea>' +
          '<div class="row"><button data-act="ai-save-paste">' + ic('save') + ' Garder cette réponse</button></div>';
      }
    }
    if (ai.error) h += '<div class="banner" style="margin:0;background:var(--red-soft)">' + ic('alert') + '<span>' + esc(ai.error) + '</span></div>';
    h += '</section>';

    // Résultat
    if (ai.output || ai.running) {
      h += '<section class="card stack" style="margin-top:1rem"><h2 style="margin:0">Réponse</h2><div class="output" id="aiOut">' + esc(ai.output) + '</div>';
      if (!ai.running) h += outputActions(p, ai.task, ai.output, ai.input);
      h += '</section>';
    }

    // Historique
    const hist = p.aiHistory.slice().reverse();
    if (hist.length) {
      h += '<section class="card" style="margin-top:1rem"><h2>Réponses gardées</h2>' + hist.map(x => '<details class="fold" style="margin-top:.5rem"><summary>' + esc((T[x.task] && T[x.task].label) || x.task) + ' · ' + dateFr(x.date) + '</summary>' +
        '<div class="output" style="max-height:24rem">' + mdLite(x.output) + '</div><div class="row" style="margin-top:.5rem">' +
        '<button class="btn-sm" data-act="ai-copy-hist" data-id="' + x.id + '">' + ic('copy') + ' Copier</button>' +
        '<button class="btn-sm" data-act="ai-hist-idea" data-id="' + x.id + '">' + ic('bulb') + ' Vers la boîte à idées</button>' +
        '<span class="spacer"></span><button class="btn-ghost btn-sm" data-act="ai-hist-delete" data-id="' + x.id + '">' + ic('trash') + ' Supprimer</button></div></details>').join('') + '</section>';
    }
    return h;
  }

  /** Mise en forme légère des réponses (titres, gras). */
  function mdLite(text) {
    return esc(text).split('\n').map(l => {
      const m = l.match(/^#{1,4}\s+(.*)$/);
      return m ? '<h3>' + m[1] + '</h3>' : l;
    }).join('\n').replace(/<\/h3>\n/g, '</h3>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  }

  function section(text, title) {
    const re = new RegExp('^#{1,3}\\s*' + title + '[^\\n]*\\n([\\s\\S]*?)(?=^#{1,3}\\s|$(?![\\s\\S]))', 'mi');
    const m = text.match(re);
    return m ? m[1].trim() : '';
  }

  function outputActions(p, task, output, input) {
    let h = '<div class="row"><button data-act="ai-copy-output">' + ic('copy') + ' Copier</button>';
    const ch = input && input.sourceChapterId && p.chapters.find(c => c.id === input.sourceChapterId);
    if (task === 'rewrite' && ch && (input.passage || '') && ch.text.includes(input.passage)) {
      if (section(output, 'Version 1')) h += '<button data-act="ai-use-version" data-v="Version 1">' + ic('check') + ' Utiliser la version 1</button>';
      if (section(output, 'Version 2')) h += '<button data-act="ai-use-version" data-v="Version 2">' + ic('check') + ' Utiliser la version 2</button>';
      if (section(output, 'Texte corrigé')) h += '<button data-act="ai-use-version" data-v="Texte corrigé">' + ic('check') + ' Appliquer la correction</button>';
    }
    if (task === 'style') h += '<button class="btn-primary" data-act="ai-save-style">' + ic('save') + ' Enregistrer comme mon profil de style</button>';
    if (task === 'outline') h += '<button class="btn-primary" data-act="ai-import-beats">' + ic('route') + ' Ajouter ces étapes au fil rouge</button>';
    h += '<button data-act="ai-to-idea">' + ic('bulb') + ' Vers la boîte à idées</button></div>';
    if (task === 'rewrite' && !(ch && ch.text.includes(input.passage || '\u0000'))) h += '<p class="help" style="margin:0">Astuce : en sélectionnant le passage dans l\'éditeur puis « Réécrire la sélection », tu pourras remplacer le texte d\'un clic.</p>';
    return h;
  }

  function saveAiHistory(p, task, output) {
    p.aiHistory.push({ id: M.uid(), task, date: Date.now(), output });
    if (p.aiHistory.length > 40) p.aiHistory.splice(0, p.aiHistory.length - 40);
    touchProject(p);
  }

  /* ======================================================================
     Entraînement
     ====================================================================== */
  function currentExercise() {
    return st.exercises.find(e => e.id === st.settings.lastExerciseId && !e.done) || null;
  }
  function trainState() {
    if (!st.ui.train) st.ui.train = { prompt: A.prompts.pick(A.prompts.consignes), words: A.prompts.pickMany(A.prompts.mots, 3), timer: null };
    return st.ui.train;
  }

  function viewTraining(sub) {
    if (sub) {
      const ex = st.exercises.find(e => e.id === sub);
      if (ex && ex.done) return viewExercise(ex);
    }
    const goal = st.settings.dailyGoal || 300;
    const today = dayTotal(M.dayKey());
    const streak = calcStreak();
    const done = st.exercises.filter(e => e.done);
    const totalWords = st.exercises.reduce((s, e) => s + (e.wordCount || 0), 0);
    const cur = currentExercise();
    const tr = trainState();
    const prompt = cur ? cur.prompt : tr.prompt;
    const words = cur ? (cur.words || []) : tr.words;
    const text = cur ? cur.text : '';
    const n = M.wordCount(text);
    const pct = Math.min(100, Math.round(100 * n / goal));

    let h = '<div class="page-head"><div><h1>Entraînement</h1><p>' + fmt(goal) + ' mots par jour, sans pression : le but est de prendre l\'habitude de taper des mots.</p></div></div>';
    h += '<div class="stats" style="margin-bottom:1rem">' +
      '<div class="stat"><b><span class="flame">' + ic('flame') + '</span> ' + streak + '</b><span>jour' + (streak > 1 ? 's' : '') + ' d\'affilée</span></div>' +
      '<div class="stat"><b>' + fmt(today) + '</b><span>mots aujourd\'hui (tout compris)</span></div>' +
      '<div class="stat"><b>' + done.length + '</b><span>séances terminées</span></div>' +
      '<div class="stat"><b>' + fmt(totalWords) + '</b><span>mots d\'entraînement</span></div></div>';

    h += '<section class="card stack"><div class="row between"><small class="muted">' + (cur ? 'Séance en cours (enregistrée automatiquement)' : 'Consigne du jour') + '</small>' +
      '<div class="row"><button class="btn-ghost btn-sm" data-act="train-new-prompt">' + ic('dice') + ' Autre consigne</button><button class="btn-ghost btn-sm" data-act="train-free">Écriture libre</button></div></div>' +
      '<p class="prompt-card" style="margin:0">' + esc(prompt || 'Écriture libre : écris ce qui te passe par la tête, sans t\'arrêter.') + '</p>';
    h += '<div class="row"><small class="muted">Mots à placer (facultatif) :</small><div class="words-imposed" id="imposed">' +
      (words.length ? words.map(w => '<span class="w' + (M.countOccurrences(text, w) ? ' used' : '') + '" data-w="' + esc(w) + '">' + esc(w) + '</span>').join('') : '<small class="muted">aucun</small>') + '</div>' +
      '<button class="btn-ghost btn-sm" data-act="train-new-words">' + ic('dice') + ' Autres mots</button>' +
      (words.length ? '<button class="btn-ghost btn-sm" data-act="train-no-words">Sans mots</button>' : '') + '</div>';
    h += '<div class="row"><small class="muted">Minuteur :</small>' + [5, 10, 15, 20].map(m => '<button class="btn-sm" data-act="train-timer" data-min="' + m + '">' + m + ' min</button>').join('') +
      '<span class="timer" id="timer"></span><button class="btn-ghost btn-sm hidden" id="timerStop" data-act="train-timer" data-min="0">' + ic('stop') + ' Stop</button></div>';
    h += '<textarea id="trainText" class="editor" style="min-height:40vh" data-on="train-text" lang="fr" spellcheck="true" placeholder="Commence à écrire… ne te relis pas, ne corrige pas. Juste avancer.">' + esc(text) + '</textarea>';
    h += '<div class="row"><div style="flex:1;min-width:180px"><div class="progress' + (pct >= 100 ? ' done' : '') + '" id="trainProgress"><div style="width:' + pct + '%"></div></div></div>' +
      '<b id="trainCount">' + fmt(n) + ' / ' + fmt(goal) + ' mots</b></div>' +
      '<div id="trainCelebrate" class="celebrate' + (pct >= 100 ? '' : ' hidden') + '">🎉 Objectif atteint ! Tu peux continuer ou terminer la séance.</div>' +
      '<div class="row"><button class="btn-primary" data-act="train-finish"' + (n ? '' : ' disabled') + ' id="trainFinish">' + ic('check') + ' Terminer la séance</button></div></section>';

    h += '<section class="card" style="margin-top:1rem"><h2>Les 16 dernières semaines</h2>' + heatmap(goal) +
      '<p class="help">Plus la case est foncée, plus tu as écrit ce jour-là (entraînement + manuscrits).</p></section>';

    h += '<section class="card" style="margin-top:1rem"><h2>Mes séances</h2>';
    if (!done.length) h += '<p class="muted">Tes séances terminées apparaîtront ici.</p>';
    h += done.slice().reverse().slice(0, 60).map(e => '<div class="item"><div class="body"><a href="#/entrainement/' + e.id + '" style="text-decoration:none;color:inherit"><b>' + dateFr(e.createdAt, true) + '</b> · ' + plural(e.wordCount, 'mot', 'mots') +
      (e.styleSample ? ' <span class="pill accent">exemple de style</span>' : '') + '<br><small class="muted">' + esc((e.prompt || 'Écriture libre').slice(0, 110)) + '</small></a></div>' +
      '<div class="tools"><a class="btn btn-ghost btn-icon" href="#/entrainement/' + e.id + '" title="Relire">' + ic('book') + '</a></div></div>').join('');
    h += '</section>';

    afterRender.push(updateTimer);
    return h;
  }

  function viewExercise(e) {
    const projOpts = [['', '— Envoyer vers la boîte à idées de… —']].concat(st.projects.map(p => [p.id, p.title]));
    const canShareEx = A.exporter.canShareFile(A.exporter.MIME.pdf);
    afterRender.push(() => { A.exporter.loadPdfLib().catch(() => {}); });
    return '<div class="row between" style="margin-bottom:1rem"><a class="btn btn-ghost" href="#/entrainement">' + ic('back') + ' Entraînement</a>' +
      '<button class="btn-danger btn-sm" data-act="train-delete" data-id="' + e.id + '">' + ic('trash') + ' Supprimer</button></div>' +
      '<section class="card stack"><small class="muted">' + dateFr(e.createdAt, true) + ' · ' + plural(e.wordCount, 'mot', 'mots') + '</small>' +
      '<p class="prompt-card" style="margin:0">' + esc(e.prompt || 'Écriture libre') + '</p>' +
      '<textarea class="editor" data-on="exercise-text" data-id="' + e.id + '" lang="fr">' + esc(e.text) + '</textarea>' +
      '<label class="check"><input type="checkbox" data-on="exercise-sample" data-id="' + e.id + '"' + (e.styleSample ? ' checked' : '') + '> Ce texte représente bien mon style (sert d\'exemple à l\'assistant)</label>' +
      (st.projects.length ? '<div class="row">' + select('id="exToProject" style="width:auto;flex:1"', projOpts, '') + '<button data-act="train-to-idea" data-id="' + e.id + '">' + ic('bulb') + ' Envoyer</button></div>' : '') +
      '<div class="row"><small class="muted">Partager ce texte :</small>' +
      (canShareEx ? '<button class="btn-sm btn-primary" data-act="share-exercise" data-format="pdf" data-mode="share" data-id="' + e.id + '">' + ic('share') + ' Partager (PDF)</button>' : '') +
      '<button class="btn-sm" data-act="share-exercise" data-format="pdf" data-mode="download" data-id="' + e.id + '">' + ic('download') + ' PDF</button>' +
      '<button class="btn-sm" data-act="share-exercise" data-format="docx" data-mode="download" data-id="' + e.id + '">' + ic('download') + ' Word</button></div>' +
      '</section>';
  }

  function heatmap(goal) {
    const days = 16 * 7;
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // commence un lundi
    let h = '<div class="heat" role="img" aria-label="Calendrier d\'écriture">';
    const todayKey = M.dayKey();
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = M.dayKey(d);
      const n = dayTotal(k);
      const lvl = n <= 0 ? '' : n < goal / 2 ? 'l1' : n < goal ? 'l2' : 'l3';
      h += '<i class="' + lvl + (k === todayKey ? ' today' : '') + '" title="' + dateFr(d.getTime()) + ' : ' + plural(n, 'mot', 'mots') + '"></i>';
    }
    return h + '</div>';
  }

  let timerInterval = null;
  function updateTimer() {
    const tr = st.ui.train;
    const el = $('#timer');
    const stop = $('#timerStop');
    if (!el) return;
    if (!tr || !tr.timer) { el.textContent = ''; if (stop) stop.classList.add('hidden'); return; }
    const left = Math.max(0, Math.round((tr.timer - Date.now()) / 1000));
    el.innerHTML =ic('clock') + ' ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
    if (stop) stop.classList.remove('hidden');
    if (left <= 0) {
      tr.timer = null;
      clearInterval(timerInterval);
      el.innerHTML = '⏰ Temps écoulé !';
      if (stop) stop.classList.add('hidden');
      toast('Temps écoulé ! Termine ta phrase… ou continue sur ta lancée.');
    }
  }

  /* ======================================================================
     Réglages
     ====================================================================== */
  function viewSettings() {
    const s = st.settings;
    const samples = styleSamples();
    let h = '<div class="page-head"><div><h1>Réglages</h1><p>Tout est enregistré sur cet appareil uniquement.</p></div></div><div class="grid-2">';
    h += '<section class="card"><h2>Écriture</h2>' +
      '<div class="field"><label>Objectif quotidien (mots)</label><input type="number" min="50" step="50" data-spath="dailyGoal" value="' + (s.dailyGoal || 300) + '"><p class="help">300 à 400 mots par jour suffisent pour installer l\'habitude.</p></div>' +
      '<div class="field"><label>Apparence</label>' + select('data-spath="theme" data-on="theme"', [['auto', 'Automatique (comme l\'appareil)'], ['light', 'Clair'], ['dark', 'Sombre']], s.theme) + '</div></section>';

    h += '<section class="card"><h2>Assistant IA</h2>' +
      '<div class="field"><label>Mode</label>' + select('data-spath="aiMode" data-rerender="1"', [['copy', 'Copier-coller vers Claude.ai (gratuit)'], ['api', 'Automatique avec une clé API (payant à l\'usage)']], s.aiMode) + '</div>' +
      (s.aiMode === 'api' ? '<div class="field"><label>Clé API Claude</label><input type="password" autocomplete="off" data-spath="apiKey" value="' + esc(s.apiKey) + '" placeholder="sk-ant-…">' +
        '<p class="help">À créer sur <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a> (crédit prépayé, séparé d\'un abonnement Claude Pro/Max). La clé reste dans ce navigateur et n\'est jamais incluse dans les sauvegardes.</p></div>' +
        '<div class="field"><label>Modèle</label>' + select('data-spath="model"', A.ai.MODELS.map(m => [m.id, m.label]), s.model) + '</div>' +
        '<div class="row"><button class="btn-sm" data-act="test-key">' + ic('play') + ' Tester la clé</button><span id="keyTest" class="muted" style="font-size:.9rem"></span></div>'
        : '<p class="help">Le mode gratuit prépare une demande complète (ton dossier + ton style) que tu colles dans Claude.ai. Rien à configurer.</p>') +
      '</section>';

    h += '<section class="card"><h2>Mon style</h2><p class="muted">L\'assistant reçoit ce profil à chaque demande, avec des extraits de tes textes marqués comme exemples (' + samples.length + ' actuellement). Utilise « Analyser mon style » dans l\'assistant pour le générer, puis ajuste-le ici.</p>' +
      '<textarea data-spath="styleProfile" rows="10" placeholder="Ex. :\n- Phrases courtes dans l\'action, longues dans l\'introspection\n- Narration à la première personne, au passé composé\n- Humour discret, images tirées de la nature…">' + esc(s.styleProfile) + '</textarea></section>';

    h += '<section class="card"><h2>CHECK</h2>' +
      '<div class="field"><label>Mon dictionnaire (un mot par ligne)</label><textarea data-on="dictionary" rows="4" placeholder="Noms inventés, mots régionaux… jamais signalés comme fautes">' + esc((s.dictionary || []).join('\n')) + '</textarea></div>' +
      '<div class="field"><label>Mots-tics à surveiller (un par ligne)</label><textarea data-on="tics" rows="5">' + esc((s.tics || []).join('\n')) + '</textarea></div>' +
      '<div class="field"><label>Serveur LanguageTool</label><input type="url" data-spath="languageToolUrl" value="' + esc(s.languageToolUrl) + '"><p class="help">Laisse la valeur par défaut, sauf si tu as un compte LanguageTool ou ton propre serveur.</p></div></section>';
    h += '</div>';

    h += '<section class="card" style="margin-top:1rem"><h2>Sauvegardes</h2><p>Tes textes sont stockés dans ce navigateur (' + A.store.mode + (A.persisted ? ', stockage protégé' : '') + '). ' +
      'S\'il est réinitialisé, ou si tu changes d\'appareil, seule une sauvegarde te permettra de les retrouver. <b>Télécharge-en une régulièrement</b> (et garde-la dans ton cloud, par exemple).</p>' +
      '<p class="muted">Dernière sauvegarde : ' + (s.lastBackup ? dateFr(s.lastBackup, true) + ' (' + ago(s.lastBackup) + ')' : 'jamais') + '</p>' +
      '<div class="row"><button class="btn-primary" data-act="backup">' + ic('download') + ' Télécharger une sauvegarde complète</button>' +
      '<button data-act="import" data-kind="any">' + ic('upload') + ' Restaurer / importer</button>' +
      '<span class="spacer"></span><button class="btn-danger btn-sm" data-act="wipe-all">' + ic('trash') + ' Tout effacer</button></div></section>';
    h += '<p class="help" style="text-align:center;margin-top:1.5rem">Atelier d\'écriture · fonctionne hors ligne · aucune donnée envoyée ailleurs, sauf quand tu lances le correcteur ou l\'assistant.</p>';
    return h;
  }

  /* ======================================================================
     Export / import
     ====================================================================== */
  function fullBackup() {
    const settings = Object.assign({}, st.settings, { apiKey: '' });
    return { app: 'atelier-ecriture', kind: 'sauvegarde', version: 1, exportedAt: new Date().toISOString(), projects: st.projects, exercises: st.exercises, log: st.log, settings };
  }

  async function importFile(file) {
    let data;
    try { data = JSON.parse(await file.text()); } catch (e) { toast('Ce fichier n\'est pas une sauvegarde de l\'Atelier.'); return; }
    if (!data || data.app !== 'atelier-ecriture') { toast('Ce fichier n\'est pas une sauvegarde de l\'Atelier.'); return; }
    if (data.kind === 'dossier' && data.project) {
      const p = migrateProject(data.project);
      if (getProject(p.id)) { p.id = M.uid(); p.title += ' (copie importée)'; }
      st.projects.unshift(p);
      touchProject(p);
      await flush();
      toast('Dossier « ' + p.title + ' » importé ✓');
      go('#/d/' + p.id);
      return;
    }
    if (data.kind === 'sauvegarde') {
      const n = (data.projects || []).length;
      if (!confirm('Cette sauvegarde contient ' + plural(n, 'dossier', 'dossiers') + ' et ' + plural((data.exercises || []).length, 'séance', 'séances') + ' d\'entraînement.\n\nLes ajouter à ton atelier ? (Rien n\'est effacé : si un dossier existe déjà, la version la plus récente est conservée.)')) return;
      let added = 0, updated = 0;
      (data.projects || []).forEach(raw => {
        const p = migrateProject(raw);
        const ex = getProject(p.id);
        if (!ex) { st.projects.push(p); added++; touch('p:' + p.id); }
        else if ((p.updatedAt || 0) > (ex.updatedAt || 0)) { Object.assign(ex, p); updated++; touch('p:' + p.id); }
      });
      const ids = new Set(st.exercises.map(e => e.id));
      (data.exercises || []).forEach(e => { if (!ids.has(e.id)) st.exercises.push(e); });
      st.exercises.sort((a, b) => a.createdAt - b.createdAt);
      Object.entries(data.log || {}).forEach(([d, v]) => { st.log[d] = { m: Math.max((st.log[d] && st.log[d].m) || 0, (v && v.m) || 0) }; });
      const s = data.settings || {};
      ['styleProfile'].forEach(k => { if (!st.settings[k] && s[k]) st.settings[k] = s[k]; });
      st.settings.dictionary = Array.from(new Set((st.settings.dictionary || []).concat(s.dictionary || [])));
      touch('exercises'); touch('log'); touch('settings');
      sortProjects();
      await flush();
      toast('Sauvegarde restaurée : ' + added + ' ajouté(s), ' + updated + ' mis à jour ✓');
      go('#/dossiers');
    }
  }

  /* ======================================================================
     Actions (clics)
     ====================================================================== */
  function curProject() {
    const r = route();
    return r[0] === 'd' ? getProject(r[1]) : null;
  }

  function moveItem(arr, id, dir) {
    const i = arr.findIndex(x => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }

  function inputValue(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    const v = el.value.trim();
    return v;
  }

  const ACT = {
    'new-project'() {
      const title = inputValue('newProjectTitle') || 'Histoire sans titre';
      const p = M.newProject(title);
      st.projects.unshift(p);
      touchProject(p);
      go('#/d/' + p.id + '/fil');
      toast('Dossier créé. Commence par jeter ta trame en vrac ✍️');
    },
    'delete-project'() {
      const p = curProject();
      if (!p) return;
      if (!confirm('Supprimer définitivement « ' + p.title + ' » et tout son contenu ?\n\nConseil : exporte d\'abord le dossier complet (.json).')) return;
      st.projects = st.projects.filter(x => x.id !== p.id);
      touch('p:' + p.id);
      if (st.session.lastProjectId === p.id) { st.session.lastProjectId = null; touch('session'); }
      go('#/dossiers');
      toast('Dossier supprimé.');
    },
    async 'share-file'(el) {
      const p = curProject();
      const fmt = el.dataset.format;
      const wantShare = el.dataset.mode === 'share';
      try {
        let r;
        if (fmt === 'json') {
          const name = 'dossier-' + slug(p.title) + '.json';
          const blob = new Blob([JSON.stringify(projectExport(p), null, 1)], { type: A.exporter.MIME.json });
          r = { result: await A.exporter.deliver(blob, name, p.title, wantShare), name };
        } else {
          const doc = A.exporter.prepare(p, Object.assign({}, shareOpts(p), { author: st.settings.authorName }));
          if (!doc.chapters.length) { toast('Aucun chapitre avec du texte à partager.'); return; }
          r = await deliverDoc(p.title, doc, fmt, wantShare);
        }
        deliveredToast(r, wantShare);
      } catch (e) { console.error(e); toast('Export impossible : ' + e.message); }
    },
    'share-select'(el) {
      const p = curProject();
      const o = shareOpts(p);
      const m = el.dataset.mode;
      o.exclude = m === 'all' ? [] : m === 'none' ? p.chapters.map(c => c.id) : p.chapters.filter(c => c.status !== 'fini').map(c => c.id);
      touchProject(p); render();
      if (m === 'done' && !p.chapters.some(c => c.status === 'fini')) toast('Aucun chapitre n\'est marqué « Terminé » pour l\'instant.');
    },
    async 'share-exercise'(el) {
      const e = st.exercises.find(x => x.id === el.dataset.id);
      if (!e || !e.text.trim()) return;
      const title = 'Entraînement du ' + dateFr(e.createdAt, true);
      const doc = A.exporter.prepare({ title, chapters: [{ id: e.id, title, text: e.text }] },
        { titlePage: false, numbering: false, pageBreak: false, pitch: false, exclude: [], author: st.settings.authorName });
      try { deliveredToast(await deliverDoc(title, doc, el.dataset.format, el.dataset.mode === 'share'), el.dataset.mode === 'share'); }
      catch (err) { console.error(err); toast('Export impossible : ' + err.message); }
    },
    backup() {
      download('atelier-sauvegarde-' + M.dayKey() + '.json', JSON.stringify(fullBackup(), null, 1), 'application/json');
      st.settings.lastBackup = Date.now();
      touch('settings');
      toast('Sauvegarde téléchargée ✓ Range-la en lieu sûr (cloud, clé USB…).');
      setTimeout(render, 300);
    },
    import() { $('#fileInput').click(); },
    'wipe-all'() {
      if (!confirm('Effacer TOUT le contenu de l\'atelier sur cet appareil ? Cette action est irréversible.')) return;
      if (!confirm('Vraiment tout effacer ? As-tu téléchargé une sauvegarde ?')) return;
      st.projects.forEach(p => touch('p:' + p.id));
      st.projects = []; st.exercises = []; st.log = {};
      st.settings = Object.assign(M.defaultSettings(), { apiKey: st.settings.apiKey });
      touch('exercises'); touch('log'); touch('settings');
      flush().then(() => { go('#/'); toast('Atelier remis à zéro.'); });
    },

    /* Manuscrit */
    'add-chapter'() {
      const p = curProject();
      const c = M.newChapter('Chapitre ' + (p.chapters.length + 1));
      c.status = 'brouillon';
      p.chapters.push(c);
      p.session.chapterId = c.id; p.session.cursor = 0;
      touchProject(p);
      go('#/d/' + p.id + '/manuscrit/' + c.id);
      st.ui.focusTitle = true;
    },
    'delete-chapter'() {
      const p = curProject();
      const ch = p.chapters.find(c => c.id === p.session.chapterId);
      if (!ch) return;
      if (ch.text.trim() && !confirm('Supprimer le chapitre « ' + ch.title + ' » (' + plural(M.wordCount(ch.text), 'mot', 'mots') + ') ?')) return;
      p.chapters = p.chapters.filter(c => c.id !== ch.id);
      p.plot.beats.forEach(b => { if (b.chapterId === ch.id) b.chapterId = null; });
      p.session.chapterId = p.chapters[0] ? p.chapters[0].id : null;
      touchProject(p);
      go('#/d/' + p.id + '/manuscrit');
    },
    'move-chapter'(el) {
      const p = curProject();
      moveItem(p.chapters, p.session.chapterId, +el.dataset.dir);
      touchProject(p); render();
    },
    focus() {
      const on = !document.body.classList.contains('focus');
      document.body.classList.toggle('focus', on);
      const ed = $('#editor'); if (ed) ed.focus();
      if (on) toast('Mode concentration. Échap pour sortir.');
    },
    'rewrite-selection'() {
      const p = curProject();
      const ed = $('#editor');
      const sel = ed ? ed.value.slice(ed.selectionStart, ed.selectionEnd) : '';
      if (!sel.trim()) { toast('Sélectionne d\'abord un passage dans le texte.'); return; }
      const ai = aiState(p, 'rewrite');
      ai.task = 'rewrite'; ai.prompt = null; ai.output = ''; ai.error = null;
      ai.input.passage = sel;
      ai.input.sourceChapterId = p.session.chapterId;
      go('#/d/' + p.id + '/assistant/rewrite');
    },
    'unblock-chapter'() {
      const p = curProject();
      const ai = aiState(p, 'unblock');
      ai.input.chapterId = p.session.chapterId;
      go('#/d/' + p.id + '/assistant/unblock');
    },

    /* Fil rouge */
    'add-beat'() {
      const p = curProject();
      const t = inputValue('newBeat');
      if (!t) return;
      p.plot.beats.push(M.newBeat(t));
      touchProject(p); render();
      setTimeout(() => { const i = $('#newBeat'); if (i) i.focus(); }, 30);
    },
    'delete-beat'(el) {
      const p = curProject();
      const b = p.plot.beats.find(x => x.id === el.dataset.id);
      if (b && (b.title || b.desc) && !confirm('Supprimer l\'étape « ' + (b.title || 'sans titre') + ' » ?')) return;
      p.plot.beats = p.plot.beats.filter(x => x.id !== el.dataset.id);
      touchProject(p); render();
    },
    'move-beat'(el) { const p = curProject(); moveItem(p.plot.beats, el.dataset.id, +el.dataset.dir); touchProject(p); render(); },
    'beat-to-chapter'(el) {
      const p = curProject();
      const b = p.plot.beats.find(x => x.id === el.dataset.id);
      const c = M.newChapter(b.title || 'Chapitre ' + (p.chapters.length + 1));
      c.notes = b.desc || '';
      c.status = 'brouillon';
      // Place le chapitre dans l'ordre des étapes
      const beatIdx = p.plot.beats.indexOf(b);
      let insertAt = p.chapters.length;
      for (let k = beatIdx + 1; k < p.plot.beats.length; k++) {
        const ci = p.chapters.findIndex(x => x.id === p.plot.beats[k].chapterId);
        if (ci >= 0) { insertAt = ci; break; }
      }
      p.chapters.splice(insertAt, 0, c);
      b.chapterId = c.id;
      if (b.status === 'a-ecrire') b.status = 'en-cours';
      p.session.chapterId = c.id; p.session.cursor = 0;
      touchProject(p);
      go('#/d/' + p.id + '/manuscrit/' + c.id);
      toast('Chapitre créé. Les notes de l\'étape sont dans « Notes de ce chapitre ».');
    },
    'apply-structure'(el) {
      const p = curProject();
      const s = A.prompts.structures.find(x => x.id === el.dataset.id);
      if (p.plot.beats.length && !confirm('Ajouter les ' + s.beats.length + ' étapes « ' + s.name + ' » à la suite des tiennes ?')) return;
      s.beats.forEach(b => p.plot.beats.push(M.newBeat(b[0], b[1])));
      touchProject(p); render();
      toast(s.beats.length + ' étapes ajoutées. Remplace les descriptions par ton histoire !');
    },

    /* Personnages */
    'add-char'() {
      const p = curProject();
      const c = M.newCharacter();
      if (!p.characters.some(x => x.role === 'principal')) c.role = 'principal';
      p.characters.push(c);
      touchProject(p);
      go('#/d/' + p.id + '/personnages/' + c.id);
      st.ui.focusTitle = true;
    },
    'delete-char'(el) {
      const p = curProject();
      const c = p.characters.find(x => x.id === el.dataset.id);
      if (!confirm('Supprimer la fiche de « ' + c.name + ' » ?')) return;
      p.characters = p.characters.filter(x => x.id !== c.id);
      touchProject(p);
      go('#/d/' + p.id + '/personnages');
    },

    /* Idées */
    'add-idea'() {
      const p = curProject();
      const t = inputValue('newIdea');
      if (!t) return;
      p.ideas.push(M.newIdea(t));
      touchProject(p); render();
      setTimeout(() => { const i = $('#newIdea'); if (i) i.focus(); }, 30);
    },
    'delete-idea'(el) {
      const p = curProject();
      if (!confirm('Supprimer cette idée ?')) return;
      p.ideas = p.ideas.filter(x => x.id !== el.dataset.id);
      touchProject(p); render();
    },
    'pin-idea'(el) { const p = curProject(); const i = p.ideas.find(x => x.id === el.dataset.id); i.pinned = !i.pinned; touchProject(p); render(); },
    'idea-to-beat'(el) {
      const p = curProject();
      const i = p.ideas.find(x => x.id === el.dataset.id);
      const first = i.text.split(/[.\n!?]/)[0].trim().slice(0, 70);
      p.plot.beats.push(M.newBeat(first, i.text));
      touchProject(p);
      toast('Ajoutée au fil rouge comme nouvelle étape ✓');
    },
    'random-idea'() {
      const p = curProject();
      if (!p.ideas.length) return;
      const i = A.prompts.pick(p.ideas);
      st.ui.ideaTag = '';
      render();
      const el = document.getElementById('idea-' + i.id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.outline = '3px solid var(--accent)'; setTimeout(() => { el.style.outline = ''; }, 2500); }
    },
    'idea-tag'(el) { st.ui.ideaTag = el.dataset.tag; render(); },

    /* Lexique & univers */
    'add-word'() { const p = curProject(); const t = inputValue('newWord'); if (!t) return; p.lexicon.words.push({ id: M.uid(), word: t, note: '' }); touchProject(p); render(); setTimeout(() => { const i = $('#newWord'); if (i) i.focus(); }, 30); },
    'delete-word'(el) { const p = curProject(); p.lexicon.words = p.lexicon.words.filter(x => x.id !== el.dataset.id); touchProject(p); render(); },
    'add-concept'() { const p = curProject(); const t = inputValue('newConcept'); if (!t) return; p.lexicon.concepts.push({ id: M.uid(), title: t, desc: '', explored: false }); touchProject(p); render(); setTimeout(() => { const i = $('#newConcept'); if (i) i.focus(); }, 30); },
    'delete-concept'(el) { const p = curProject(); p.lexicon.concepts = p.lexicon.concepts.filter(x => x.id !== el.dataset.id); touchProject(p); render(); },
    'add-fact'() {
      const p = curProject(); const t = inputValue('newFact'); if (!t) return;
      p.facts.push(M.newFact(t, $('#newFactCat').value));
      touchProject(p); render();
      setTimeout(() => { const i = $('#newFact'); if (i) i.focus(); }, 30);
    },
    'delete-fact'(el) { const p = curProject(); p.facts = p.facts.filter(x => x.id !== el.dataset.id); touchProject(p); render(); },

    /* CHECK */
    async 'lt-run'() {
      const p = curProject();
      const scope = checkScope(p);
      const chapters = scopeChapters(p, scope).filter(c => c.text.trim());
      const lt = st.ui.lt = { projectId: p.id, scope, running: true, progress: '', error: null, matches: [] };
      render();
      try {
        for (let i = 0; i < chapters.length; i++) {
          const c = chapters[i];
          lt.progress = chapters.length > 1 ? (i + 1) + '/' + chapters.length : '';
          const pill = $('.pill.amber'); if (pill) pill.textContent = 'Analyse… ' + lt.progress;
          if (i > 0) await new Promise(r => setTimeout(r, 3200));
          const res = await A.check.languageTool(c.text, st.settings.languageToolUrl);
          res.forEach(m => { m.chapterId = c.id; lt.matches.push(m); });
        }
      } catch (e) {
        lt.error = e.message;
      }
      lt.running = false;
      if (st.ui.lt === lt) render();
    },
    'lt-apply'(el) {
      const p = curProject();
      const lt = st.ui.lt;
      const m = lt.matches[+el.dataset.i];
      const rep = m.replacements[+el.dataset.r];
      const ch = p.chapters.find(c => c.id === m.chapterId);
      if (!ch || ch.text.substr(m.offset, m.length) !== m.original) { toast('Le texte a changé depuis la vérification : relance-la.'); return; }
      ch.text = ch.text.slice(0, m.offset) + rep + ch.text.slice(m.offset + m.length);
      const delta = rep.length - m.length;
      lt.matches.forEach(o => { if (o !== m && o.chapterId === m.chapterId && o.offset > m.offset) o.offset += delta; });
      m.done = true;
      touchProject(p); render();
    },
    'lt-ignore'(el) { st.ui.lt.matches[+el.dataset.i].ignored = true; render(); },
    'lt-dict'(el) {
      const m = st.ui.lt.matches[+el.dataset.i];
      const w = (m.original || '').trim();
      if (w && !st.settings.dictionary.includes(w)) st.settings.dictionary.push(w);
      touch('settings'); render();
      toast('« ' + w + ' » ajouté à ton dictionnaire.');
    },
    'goto-pos'(el) {
      const p = curProject();
      st.ui.jump = { chapterId: el.dataset.ch, start: +el.dataset.s, end: +el.dataset.e };
      p.session.chapterId = el.dataset.ch;
      go('#/d/' + p.id + '/manuscrit/' + el.dataset.ch);
    },
    'typo-fix'() {
      const p = curProject();
      const chapters = scopeChapters(p, checkScope(p));
      if (!confirm('Corriger automatiquement la typographie de ' + plural(chapters.length, 'chapitre', 'chapitres') + ' ?\n(espaces insécables, guillemets « », tirets de dialogue, points de suspension)')) return;
      let changed = 0;
      chapters.forEach(c => { const t = A.check.fixTypography(c.text); if (t !== c.text) { c.text = t; changed++; } });
      if (st.ui.lt && st.ui.lt.projectId === p.id) st.ui.lt = null; // les positions ne sont plus valables
      touchProject(p); render();
      toast(changed ? 'Typographie corrigée dans ' + plural(changed, 'chapitre', 'chapitres') + ' ✓' : 'Rien à corriger.');
    },
    'name-replace'(el) {
      const p = curProject();
      const from = el.dataset.from, to = el.dataset.to;
      const re = new RegExp('(^|[^\\p{L}\\p{N}])' + from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^\\p{L}\\p{N}])', 'gu');
      let n = 0;
      scopeChapters(p, checkScope(p)).forEach(c => { c.text = c.text.replace(re, (m0, pre) => { n++; return pre + to; }); });
      if (st.ui.lt && st.ui.lt.projectId === p.id) st.ui.lt = null;
      touchProject(p); render();
      toast(plural(n, 'remplacement', 'remplacements') + ' : « ' + from + ' » → « ' + to + ' »');
    },
    'name-ignore'(el) {
      const w = el.dataset.name;
      if (!st.settings.dictionary.includes(w)) st.settings.dictionary.push(w);
      touch('settings'); render();
    },
    'name-create'(el) {
      const p = curProject();
      const c = M.newCharacter(el.dataset.name);
      p.characters.push(c);
      touchProject(p);
      go('#/d/' + p.id + '/personnages/' + c.id);
    },

    /* Assistant */
    'ai-mode'(el) { st.settings.aiMode = el.dataset.mode; touch('settings'); const ai = st.ui.ai; if (ai) { ai.prompt = null; ai.error = null; } render(); },
    'ai-task'(el) {
      const p = curProject();
      go('#/d/' + p.id + '/assistant/' + el.dataset.task);
    },
    'ai-prepare'() {
      const p = curProject();
      const ai = aiState(p);
      ai.prompt = buildPrompt(p, ai);
      ai.output = ''; ai.error = null; ai.pasteDraft = '';
      render();
      const box = $('.prompt-box'); if (box) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    'ai-copy'() { const ai = st.ui.ai; if (ai && ai.prompt) copyText(A.ai.asPasteable(ai.prompt)); },
    'ai-save-paste'() {
      const p = curProject();
      const ai = aiState(p);
      const t = ($('#aiPaste') || {}).value || '';
      if (!t.trim()) { toast('Colle d\'abord la réponse de Claude.'); return; }
      ai.output = t.trim(); ai.pasteDraft = '';
      saveAiHistory(p, ai.task, ai.output);
      render();
      toast('Réponse gardée dans le dossier ✓');
    },
    async 'ai-run'() {
      const p = curProject();
      const ai = aiState(p);
      const prompt = buildPrompt(p, ai);
      ai.running = true; ai.output = ''; ai.error = null; ai.handle = {};
      render();
      const out = () => $('#aiOut');
      try {
        const res = await A.ai.run(prompt, st.settings, t => {
          ai.output += t;
          const o = out();
          if (o) { o.textContent = ai.output; o.scrollTop = o.scrollHeight; }
        }, ai.handle);
        ai.output = res.text;
        if (res.truncated) ai.output += '\n\n[Réponse coupée : elle était trop longue.]';
        saveAiHistory(p, ai.task, ai.output);
      } catch (e) {
        ai.error = e.message;
      }
      ai.running = false;
      if (st.ui.ai === ai && curProject() === p) render();
    },
    'ai-stop'() { const ai = st.ui.ai; if (ai && ai.handle && ai.handle.abort) ai.handle.abort(); },
    'ai-copy-output'() { if (st.ui.ai) copyText(st.ui.ai.output); },
    'ai-use-version'(el) {
      const p = curProject();
      const ai = st.ui.ai;
      const ch = p.chapters.find(c => c.id === ai.input.sourceChapterId);
      const v = section(ai.output, el.dataset.v);
      if (!ch || !v) return;
      const i = ch.text.indexOf(ai.input.passage);
      if (i < 0) { toast('Le passage d\'origine a changé : copie la version à la main.'); return; }
      ch.text = ch.text.slice(0, i) + v + ch.text.slice(i + ai.input.passage.length);
      ai.input.passage = v;
      touchProject(p);
      st.ui.jump = { chapterId: ch.id, start: i, end: i + v.length };
      go('#/d/' + p.id + '/manuscrit/' + ch.id);
      toast('Passage remplacé ✓ (Ctrl+Z dans l\'éditeur ne marche pas après ce remplacement : la version d\'origine est dans l\'historique de l\'assistant.)');
    },
    'ai-save-style'() {
      const ai = st.ui.ai;
      const condensed = section(ai.output, 'Profil condensé');
      st.settings.styleProfile = condensed || ai.output;
      touch('settings');
      toast('Profil de style enregistré ✓ Il sera utilisé dans toutes tes demandes.');
    },
    'ai-import-beats'() {
      const p = curProject();
      const lines = st.ui.ai.output.split('\n');
      let n = 0;
      for (const l of lines) {
        const m = l.replace(/\*\*/g, '').match(/^\s*(\d+)[.)]\s+(.+)$/);
        if (!m) { if (n && /^#{1,3}\s|^Trous/i.test(l.trim())) break; continue; }
        const parts = m[2].split(/\s+[—–-]\s+/);
        p.plot.beats.push(M.newBeat(parts[0].trim(), parts.slice(1).join(' — ').trim()));
        n++;
      }
      if (!n) { toast('Je n\'ai pas trouvé de liste numérotée dans la réponse.'); return; }
      touchProject(p);
      go('#/d/' + p.id + '/fil');
      toast(n + ' étapes ajoutées au fil rouge ✓');
    },
    'ai-to-idea'() {
      const p = curProject();
      p.ideas.push(M.newIdea('[Assistant] ' + st.ui.ai.output));
      touchProject(p);
      toast('Ajouté à la boîte à idées ✓');
    },
    'ai-copy-hist'(el) { const p = curProject(); const x = p.aiHistory.find(h => h.id === el.dataset.id); if (x) copyText(x.output); },
    'ai-hist-idea'(el) { const p = curProject(); const x = p.aiHistory.find(h => h.id === el.dataset.id); if (x) { p.ideas.push(M.newIdea('[Assistant] ' + x.output)); touchProject(p); toast('Ajouté à la boîte à idées ✓'); } },
    'ai-hist-delete'(el) { const p = curProject(); p.aiHistory = p.aiHistory.filter(h => h.id !== el.dataset.id); touchProject(p); render(); },
    async 'test-key'() {
      const out = $('#keyTest');
      out.textContent = 'Test en cours…';
      try {
        const r = await A.ai.run({ system: 'Réponds en un mot.', user: 'Dis simplement : OK', effort: 'low' }, Object.assign({}, st.settings, { model: 'claude-haiku-5-5' }), null);
        out.textContent = '✓ La clé fonctionne (' + (r.text || '').trim().slice(0, 20) + ')';
      } catch (e) { out.textContent = '✗ ' + e.message; }
    },

    /* Accueil */
    'spark-next'() { st.ui.spark = pickSpark(); render(); },
    'spark-write'() {
      const s = st.ui.spark;
      const cur = currentExercise();
      if (cur && cur.text.trim() && !confirm('Une séance est déjà en cours. La remplacer par cette consigne ? (le texte déjà écrit est gardé dans la séance actuelle)')) { go('#/entrainement'); return; }
      if (cur) { cur.done = true; touch('exercises'); st.settings.lastExerciseId = null; touch('settings'); }
      st.ui.train = { prompt: s.text, words: A.prompts.pickMany(A.prompts.mots, 3), timer: null };
      go('#/entrainement');
    },

    /* Entraînement */
    'train-new-prompt'() {
      const cur = currentExercise();
      const pr = A.prompts.pick(A.prompts.consignes);
      if (cur) { cur.prompt = pr; touch('exercises'); } else trainState().prompt = pr;
      render();
    },
    'train-free'() { const cur = currentExercise(); if (cur) { cur.prompt = ''; touch('exercises'); } else trainState().prompt = ''; render(); },
    'train-new-words'() {
      const w = A.prompts.pickMany(A.prompts.mots, 3);
      const cur = currentExercise(); if (cur) { cur.words = w; touch('exercises'); } else trainState().words = w;
      render();
    },
    'train-no-words'() { const cur = currentExercise(); if (cur) { cur.words = []; touch('exercises'); } else trainState().words = []; render(); },
    'train-timer'(el) {
      const tr = trainState();
      const min = +el.dataset.min;
      clearInterval(timerInterval);
      tr.timer = min ? Date.now() + min * 60000 : null;
      if (min) { timerInterval = setInterval(updateTimer, 1000); const t = $('#trainText'); if (t) t.focus(); }
      updateTimer();
    },
    'train-finish'() {
      const cur = currentExercise();
      if (!cur) return;
      cur.done = true;
      cur.wordCount = M.wordCount(cur.text);
      st.settings.lastExerciseId = null;
      touch('exercises'); touch('settings');
      st.ui.train = null;
      clearInterval(timerInterval);
      const goal = st.settings.dailyGoal || 300;
      toast(cur.wordCount >= goal ? 'Bravo ! ' + plural(cur.wordCount, 'mot', 'mots') + ' aujourd\'hui 🎉' : 'Séance enregistrée : ' + plural(cur.wordCount, 'mot', 'mots') + '. Chaque mot compte.');
      go('#/entrainement/' + cur.id);
    },
    'train-delete'(el) {
      if (!confirm('Supprimer ce texte d\'entraînement ?')) return;
      st.exercises = st.exercises.filter(e => e.id !== el.dataset.id);
      touch('exercises');
      go('#/entrainement');
    },
    'train-to-idea'(el) {
      const pid = ($('#exToProject') || {}).value;
      const p = getProject(pid);
      if (!p) { toast('Choisis d\'abord un dossier.'); return; }
      const e = st.exercises.find(x => x.id === el.dataset.id);
      p.ideas.push(M.newIdea('[Entraînement du ' + dateFr(e.createdAt) + '] ' + (e.prompt ? e.prompt + '\n\n' : '') + e.text));
      touchProject(p);
      toast('Envoyé dans la boîte à idées de « ' + p.title + ' » ✓');
    }
  };

  /* ======================================================================
     Saisie (input)
     ====================================================================== */
  const INPUT = {
    title(el) {
      const h1 = $('main h1'); if (h1) h1.textContent = el.value;
    },
    'check-scope'(el) {
      const p = curProject();
      st.ui.check[p.id] = el.value;
      go('#/d/' + p.id + '/check/' + el.value);
    },
    theme(el) { st.settings.theme = el.value; applyTheme(); },
    'share-ch'(el) {
      const p = curProject();
      const o = shareOpts(p);
      const set = new Set(o.exclude);
      if (el.checked) set.delete(el.dataset.id); else set.add(el.dataset.id);
      o.exclude = Array.from(set);
      touchProject(p); render();
    },
    'chapter-jump'(el) { const p = curProject(); go('#/d/' + p.id + '/manuscrit/' + el.value); },
    dictionary(el) { st.settings.dictionary = el.value.split('\n').map(s => s.trim()).filter(Boolean); touch('settings'); },
    tics(el) { st.settings.tics = el.value.split('\n').map(s => s.trim()).filter(Boolean); touch('settings'); },
    'train-text'(el) {
      let cur = currentExercise();
      if (!cur) {
        const tr = trainState();
        cur = { id: M.uid(), date: M.dayKey(), createdAt: Date.now(), prompt: tr.prompt, words: tr.words, text: '', wordCount: 0, done: false, styleSample: false };
        st.exercises.push(cur);
        st.settings.lastExerciseId = cur.id;
        touch('settings');
      }
      cur.text = el.value;
      cur.date = cur.date || M.dayKey();
      cur.wordCount = M.wordCount(cur.text);
      touch('exercises');
      const goal = st.settings.dailyGoal || 300;
      const pct = Math.min(100, Math.round(100 * cur.wordCount / goal));
      const pr = $('#trainProgress'); if (pr) { pr.firstChild.style.width = pct + '%'; pr.classList.toggle('done', pct >= 100); }
      const c = $('#trainCount'); if (c) c.textContent = fmt(cur.wordCount) + ' / ' + fmt(goal) + ' mots';
      const cel = $('#trainCelebrate'); if (cel) cel.classList.toggle('hidden', pct < 100);
      const fin = $('#trainFinish'); if (fin) fin.disabled = !cur.wordCount;
      $$('#imposed .w').forEach(w => w.classList.toggle('used', M.countOccurrences(cur.text, w.dataset.w) > 0));
    },
    'exercise-text'(el) {
      const e = st.exercises.find(x => x.id === el.dataset.id);
      e.text = el.value; e.wordCount = M.wordCount(e.text); touch('exercises');
    },
    'exercise-sample'(el) {
      const e = st.exercises.find(x => x.id === el.dataset.id);
      e.styleSample = el.checked; touch('exercises');
    }
  };

  function onPathInput(el) {
    const p = curProject();
    if (!p) return;
    const path = el.dataset.path;
    const v = fieldValue(el);
    if (!setPath(p, path, v)) return;
    touchProject(p);
    const m = path.match(/^chapters\.([^.]+)\.(\w+)$/);
    if (m) {
      const id = m[1], key = m[2];
      if (key === 'text') {
        trackWords(id, v);
        const label = plural(wordCache.get(id), 'mot', 'mots');
        const wc = $('#wordCount'); if (wc) wc.textContent = label;
        const lw = $('[data-chwords="' + id + '"]'); if (lw) lw.textContent = label;
        p.session.cursor = el.selectionStart;
      } else if (key === 'title') {
        const t = $('[data-chtitle="' + id + '"]');
        if (t) t.textContent = (p.chapters.findIndex(c => c.id === id) + 1) + '. ' + v;
      } else if (key === 'status') {
        const d = $('[data-chdot="' + id + '"]'); if (d) d.className = 'dot s-' + v;
      }
    }
    if (el.dataset.on && INPUT[el.dataset.on]) INPUT[el.dataset.on](el);
    if (el.dataset.rerender) render();
  }

  function onSettingInput(el) {
    st.settings[el.dataset.spath] = fieldValue(el);
    touch('settings');
    if (el.dataset.on && INPUT[el.dataset.on]) INPUT[el.dataset.on](el);
    if (el.dataset.rerender) render();
  }

  function onAiInput(el) {
    const ai = st.ui.ai;
    if (!ai) return;
    ai.input[el.dataset.ai] = fieldValue(el);
    if (el.dataset.ai === 'passage') ai.input.sourceChapterId = ai.input.sourceChapterId && (() => {
      const p = curProject(); const c = p && p.chapters.find(x => x.id === ai.input.sourceChapterId);
      return c && c.text.includes(el.value) ? c.id : null;
    })();
    ai.prompt = null;
    // Active / désactive les boutons sans tout redessiner (pour ne pas perdre le curseur)
    const ready = (ai.task === 'rewrite') ? !!(ai.input.passage || '').trim() : (ai.task === 'free') ? !!(ai.input.question || '').trim() : true;
    const b = $('[data-act="ai-run"]') || $('[data-act="ai-prepare"]');
    if (b) b.disabled = !ready || (st.settings.aiMode === 'api' && !st.settings.apiKey);
    if (el.tagName === 'SELECT' || el.type === 'checkbox') render();
  }

  /* ======================================================================
     Écouteurs globaux
     ====================================================================== */
  function bindEvents() {
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-act]');
      if (!el || el.disabled) return;
      const fn = ACT[el.dataset.act];
      if (fn) { e.preventDefault(); fn(el, e); }
    });
    document.addEventListener('input', e => {
      const el = e.target;
      if (el.dataset.path !== undefined) onPathInput(el);
      else if (el.dataset.spath) onSettingInput(el);
      else if (el.dataset.ai) onAiInput(el);
      else if (el.dataset.on && INPUT[el.dataset.on]) INPUT[el.dataset.on](el, e);
      else if (el.id === 'aiPaste' && st.ui.ai) st.ui.ai.pasteDraft = el.value;
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.body.classList.contains('focus')) { document.body.classList.remove('focus'); return; }
      const el = e.target;
      if (el.dataset && el.dataset.enter && e.key === 'Enter' && (el.tagName === 'INPUT' || e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const fn = ACT[el.dataset.enter];
        if (fn) fn(el, e);
      }
    });
    const saveCursor = e => {
      if (e.target.id !== 'editor') return;
      const p = curProject();
      if (p) p.session.cursor = e.target.selectionStart;
    };
    document.addEventListener('keyup', saveCursor);
    document.addEventListener('mouseup', saveCursor);
    document.addEventListener('focusout', e => {
      if (e.target.id === 'editor') { const p = curProject(); if (p) { p.session.cursor = e.target.selectionStart; touch('p:' + p.id); } }
    });
    $('#fileInput').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (f) importFile(f);
      e.target.value = '';
    });
    window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); $('#main').focus({ preventScroll: true }); });
  }

  /* ======================================================================
     Démarrage
     ====================================================================== */
  async function start() {
    $$('[data-icon]').forEach(el => { el.outerHTML = ic(el.dataset.icon); });
    try {
      await load();
    } catch (e) {
      console.error(e);
      $('#main').innerHTML = '<div class="empty">' + ic('alert') + '<p>Impossible d\'ouvrir le stockage de ce navigateur. Es-tu en navigation privée ?</p></div>';
      return;
    }
    bindEvents();
    setSaveState('saved');
    render();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker', err));
    }
  }

  A.app = { st, render, flush }; // utile pour le débogage
  start();
})(window.Atelier);
