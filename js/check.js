/* Atelier d'écriture — module CHECK
   1) Orthographe & grammaire : LanguageTool (service en ligne gratuit, français)
   2) Temps, style, typographie, cohérence des noms : analyses locales, hors ligne */
window.Atelier = window.Atelier || {};

(function (A) {
  'use strict';

  /* ---------- Outils ---------- */
  const TOKEN_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function tokens(text) {
    const out = [];
    for (const m of text.matchAll(TOKEN_RE)) out.push({ w: m[0], lw: m[0].toLowerCase(), i: m.index });
    return out;
  }

  function paragraphs(text) {
    const out = [];
    const re = /[^\n]+/g;
    let m;
    while ((m = re.exec(text))) {
      if (m[0].trim()) out.push({ text: m[0], start: m.index });
    }
    return out;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  /** Extrait lisible autour d'une position, avec la zone [s, e) mise en évidence. */
  function excerpt(text, s, e, radius) {
    radius = radius || 60;
    const a = Math.max(0, s - radius);
    const b = Math.min(text.length, e + radius);
    return {
      before: (a > 0 ? '…' : '') + text.slice(a, s).replace(/\s+/g, ' '),
      hit: text.slice(s, e),
      after: text.slice(e, b).replace(/\s+/g, ' ') + (b < text.length ? '…' : '')
    };
  }

  /* Mots vides : jamais comptés comme répétitions ni comme noms propres */
  const STOP = new Set(('le la les un une des du de d l au aux et ou mais donc or ni car que qu qui quoi dont où ' +
    'ce cet cette ces se sa son ses ma mon mes ta ton tes notre nos votre vos leur leurs il ils elle elles on je j tu nous vous ' +
    'me m te t lui y en ne n pas plus moins très bien tout tous toute toutes rien sans avec pour par sur sous dans entre vers chez ' +
    'comme si alors puis aussi encore déjà jamais toujours même autre autres quand comment pourquoi parce cela ceci ça celui celle ceux celles ' +
    'être avoir était étaient avait avaient est sont a ont fut faire fait dit peu trop quelque quelques chaque après avant pendant depuis ' +
    'oui non ah oh eh bon voilà voici ici là-bas là c s quelqu').split(/\s+/));

  /* Noms communs fréquents en -ment (pour ne pas les compter comme adverbes) */
  const MENT_NOUNS = new Set(('moment moments comment ciment aliment aliments segment fragment fragments argument arguments serment serments ' +
    'gouvernement appartement appartements sentiment sentiments mouvement mouvements monument monuments instrument instruments ' +
    'vêtement vêtements document documents élément éléments logement bâtiment bâtiments changement changements commencement ' +
    'comportement événement événements évènement évènements jugement paiement traitement tourment tourments firmament testament régiment ' +
    'parlement département compartiment médicament médicaments tempérament enseignement développement environnement établissement ' +
    'fonctionnement roulement sifflement grondement frémissement gémissement gémissements battement battements claquement craquement ' +
    'grincement hurlement hurlements tremblement tremblements étonnement isolement emplacement équipement agrandissement avertissement ' +
    'divertissement engagement sauvetage rassemblement licenciement raisonnement remerciement remerciements consentement dénouement ' +
    'renseignement renseignements accouchement aboiement aboiements bourdonnement chuchotement chuchotements froissement grognement ' +
    'halètement sanglot ronflement soulagement épuisement acharnement aveuglement bouleversement châtiment complément supplément ' +
    'excrément froment piment sacrement tégument lament amendement armement campement cantonnement déplacement emportement ' +
    'entraînement entrainement enterrement étourdissement évanouissement frottement glissement jaillissement miaulement pressentiment ' +
    'recueillement ressentiment ruissellement scintillement sursaut tiraillement vieillissement').split(/\s+/));

  /* ---------- Concordance des temps (heuristique) ---------- */
  const PRESENT = new Set(('suis es est sommes êtes sont ai as a avons avez ont vais vas va allons allez vont fais faisons font ' +
    'peux peut pouvons pouvez peuvent veux veut voulons voulez veulent dois doit devons devez doivent sais sait savons savez savent ' +
    'viens vient venons venez viennent prends prend prenons prenez prennent vois voit voyons voyez voient mets met mettent ' +
    'crois croit croient tiens tient tiennent connais connaît connait connaissent faut semble semblent regarde regardent ' +
    'pense pensent parle parlent arrive arrivent reste restent marche marchent sens sent sentent ouvre ouvrent attends attend attendent ' +
    'entends entend entendent cherche cherchent trouve trouvent donne donnent demande demandent sors sort sortent dors dort dorment ' +
    'cours court courent lève lèvent tourne tournent devient deviennent comprends comprend comprennent').split(/\s+/));

  const PAST = new Set(('fut furent eut eurent fit firent prit prirent mit mirent vint vinrent tint tinrent put purent sut surent ' +
    'voulut voulurent parut parurent dut alla sembla resta regarda demanda répondit murmura ajouta entra sortit arriva comprit reprit ' +
    'ouvrit devint revint sentit pensa tourna leva posa tendit lança cria hurla soupira hocha recula avança attendit entendit vit').split(/\s+/));

  const AIT_STOP = new Set('lait fait trait souhait portrait parfait extrait retrait abstrait distrait attrait bienfait méfait forfait satisfait imparfait surfait refait défait contrefait stupéfait soit tait plait plaît'.split(' '));
  const AIS_STOP = new Set(('mais jamais désormais frais épais mauvais anglais français palais relais marais biais niais laquais rabais harnais ' +
    'balais dais jais panais irlandais japonais hollandais écossais portugais polonais libanais sénégalais congolais néerlandais ' +
    'lyonnais marseillais bordelais calais vais fais sais tais plais rais dais').split(/\s+/));

  function isPast(lw) {
    if (PAST.has(lw)) return true;
    if (lw.length >= 6 && lw.endsWith('aient')) return true;
    if (lw.length >= 5 && lw.endsWith('ait') && !AIT_STOP.has(lw)) return true;
    if (lw.length >= 6 && lw.endsWith('ais') && !AIS_STOP.has(lw)) return true;
    if (lw.length >= 6 && /(èrent|âmes|âtes)$/.test(lw)) return true;
    return false;
  }

  /** Retire les dialogues : on ne vérifie la concordance que dans la narration. */
  function narration(par) {
    const t = par.trim();
    if (/^[—–\-]/.test(t)) return '';
    return t.replace(/«[^»]*»/g, ' ').replace(/“[^”]*”/g, ' ').replace(/"[^"]*"/g, ' ');
  }

  function tenseOf(text) {
    let p = 0, t = 0;
    for (const tok of tokens(text)) {
      if (PRESENT.has(tok.lw)) p++;
      else if (isPast(tok.lw)) t++;
    }
    let tense = 'inconnu';
    if (p >= 2 && p >= 2 * t) tense = 'present';
    else if (t >= 2 && t >= 2 * p) tense = 'passe';
    else if (p >= 2 && t >= 2) tense = 'melange';
    return { p, t, tense };
  }

  /** forced : temps de référence imposé (« present » ou « passe »), sinon le temps dominant du texte. */
  function analyzeTense(text, forced) {
    const pars = paragraphs(text);
    let P = 0, T = 0;
    const rows = pars.map((par, idx) => {
      const n = narration(par.text);
      const r = n ? tenseOf(n) : { p: 0, t: 0, tense: 'dialogue' };
      P += r.p; T += r.t;
      return Object.assign({ idx, start: par.start, text: par.text }, r);
    });
    const total = P + T;
    const own = total < 4 ? 'inconnu' : (P > T ? 'present' : 'passe');
    const dominant = forced || own;
    const ratio = total ? Math.round(100 * Math.max(P, T) / total) : 0;
    const flagged = rows.filter(r =>
      (r.tense === 'melange') ||
      (dominant !== 'inconnu' && (r.tense === 'present' || r.tense === 'passe') && r.tense !== dominant));
    return { dominant, own, ratio, present: P, past: T, flagged };
  }

  /* ---------- Répétitions ---------- */
  function stem(lw) {
    let s = lw.replace(/['’]/g, '');
    if (s.length > 5) s = s.replace(/(es|s|x)$/, '');
    return s;
  }

  function analyzeRepetitions(text, windowSize) {
    windowSize = windowSize || 35;
    const toks = tokens(text);
    const last = new Map();
    const found = [];
    const seenPairs = new Set();
    toks.forEach((tok, k) => {
      if (tok.lw.length < 5 || STOP.has(tok.lw)) return;
      const s = stem(tok.lw);
      const prev = last.get(s);
      if (prev !== undefined && k - prev <= windowSize) {
        const a = toks[prev];
        const between = text.slice(a.i, tok.i);
        if (!/\n\s*\n/.test(between)) {
          const key = s + ':' + Math.floor(a.i / 400);
          if (!seenPairs.has(key)) {
            seenPairs.add(key);
            found.push({ word: tok.w, first: a.i, second: tok.i, len1: a.w.length, len2: tok.w.length, distance: k - prev });
          }
        }
      }
      last.set(s, k);
    });
    return found;
  }

  /* ---------- Phrases longues, adverbes, tics ---------- */
  function analyzeSentences(text, maxWords) {
    maxWords = maxWords || 40;
    const out = [];
    const re = /[^.!?…\n]+(?:[.!?…]+[»”"]?|$)/g;
    let m;
    while ((m = re.exec(text))) {
      const n = A.model.wordCount(m[0]);
      if (n > maxWords) out.push({ start: m.index, end: m.index + m[0].length, words: n });
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    return out;
  }

  function analyzeAdverbs(text) {
    const counts = new Map();
    let total = 0;
    for (const tok of tokens(text)) {
      const lw = tok.lw;
      // Approximation : un mot en -ment qui n'est pas un nom commun connu est compté comme adverbe.
      if (lw.length > 6 && lw.endsWith('ment') && !MENT_NOUNS.has(lw)) {
        counts.set(lw, (counts.get(lw) || 0) + 1);
        total++;
      }
    }
    const words = A.model.wordCount(text) || 1;
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
    return { total, per1000: Math.round(1000 * total / words), top };
  }

  function analyzeTics(text, tics) {
    const words = A.model.wordCount(text) || 1;
    return (tics || []).map(t => {
      const n = A.model.countOccurrences(text, t);
      return { tic: t, count: n, per1000: Math.round(10000 * n / words) / 10 };
    }).filter(x => x.count > 0).sort((a, b) => b.count - a.count);
  }

  /* ---------- Typographie française ---------- */
  const NBSP = ' ', NNBSP = ' ';
  const TYPO_RULES = [
    { id: 'ellipsis', label: 'Points de suspension « ... » → « … »', re: /\.\.\./g },
    { id: 'space-before-high', label: 'Espace manquante avant ; ! ? ou :', re: /[^\s  !?;:(\[«—–\-\/\d]([!?;]|:(?!\/\/))(?=\s|$|[»”"])/g },
    { id: 'space-before-comma', label: 'Espace en trop avant une virgule ou un point', re: / +[,.](?!\.)/g },
    { id: 'double-space', label: 'Espaces doubles', re: /[^\S\n]{2,}/g },
    { id: 'straight-quotes', label: 'Guillemets droits " " → « »', re: /"/g },
    { id: 'dialogue-dash', label: 'Tiret de dialogue « - » → « — »', re: /^[\t ]*-[\t ]+/gm }
  ];

  function analyzeTypography(text) {
    return TYPO_RULES.map(rule => {
      const hits = [];
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(text)) && hits.length < 200) {
        hits.push(m.index);
        if (rule.re.lastIndex === m.index) rule.re.lastIndex++;
      }
      return { id: rule.id, label: rule.label, count: hits.length, first: hits.slice(0, 3) };
    }).filter(r => r.count > 0);
  }

  function fixTypography(text) {
    let t = text;
    t = t.replace(/\.\.\./g, '…');
    t = t.replace(/^([\t ]*)-[\t ]+/gm, '$1—' + NBSP);
    // Guillemets droits : on alterne ouvrant/fermant, paragraphe par paragraphe, si le nombre est pair.
    t = t.split('\n').map(line => {
      const n = (line.match(/"/g) || []).length;
      if (!n || n % 2) return line;
      let open = true;
      return line.replace(/"\s*/g, (m0, off, str) => {
        if (open) { open = false; return '«' + NBSP; }
        open = true; return m0;
      }).replace(/\s*"/g, NBSP + '»');
    }).join('\n');
    // Espaces avant ; ! ? (fine insécable) et : (insécable)
    t = t.replace(/[   ]*([!?;])/g, (m0, p, off, str) => {
      const prev = str[off - 1];
      if (off === 0 || prev === undefined || prev === '\n' || /[!?;(\[«]/.test(prev)) return m0;
      return NNBSP + p;
    });
    t = t.replace(/(\S)[   ]*:(?!\/\/)(?=\s|$|«)/g, (m0, prev) => /\d/.test(prev) ? m0 : prev + NBSP + ':');
    t = t.replace(/:«/g, ': «');
    // Espaces à l'intérieur des guillemets français
    t = t.replace(/«[   ]*/g, '«' + NBSP).replace(/[   ]*»/g, NBSP + '»');
    // Ménage
    t = t.replace(/ +([,.])(?!\.)/g, '$1');
    t = t.replace(/[^\S\n  ]{2,}/g, ' ');
    return t;
  }

  /* ---------- Cohérence des noms ---------- */
  function nameIndex(characters) {
    const idx = [];
    (characters || []).forEach(c => {
      const parts = [c.name].concat((c.aliases || '').split(/[,;\n]/))
        .flatMap(s => (s || '').split(/\s+/))
        .map(s => s.trim()).filter(s => s.length >= 3 && /^\p{Lu}/u.test(s));
      parts.forEach(p => idx.push({ name: p, lw: p.toLowerCase(), charId: c.id, charName: c.name }));
    });
    return idx;
  }

  function isSentenceStart(text, i) {
    let j = i - 1;
    while (j >= 0 && /[\s  ]/.test(text[j])) j--;
    if (j < 0) return true;
    return /[.!?…«»"“”—–\-:\n(]/.test(text[j]) || text[j + 1] === '\n';
  }

  function analyzeNames(text, characters, knownWords) {
    const idx = nameIndex(characters);
    const known = new Set(idx.map(x => x.lw));
    const ignore = new Set((knownWords || []).map(w => w.toLowerCase()));
    const variants = new Map();
    const unknown = new Map();
    const all = tokens(text);
    // Mots qui apparaissent aussi en minuscules : ce sont des mots courants, pas des noms.
    const lowerWords = new Set(all.filter(t => !/^\p{Lu}/u.test(t.w)).map(t => t.lw));
    for (const tok of all) {
      if (!/^\p{Lu}/u.test(tok.w) || tok.w.length < 3) continue;
      if (/^\p{Lu}+$/u.test(tok.w) && tok.w.length > 1) continue; // SIGLES
      const lw = tok.lw;
      if (known.has(lw) || STOP.has(lw) || ignore.has(lw) || lowerWords.has(lw)) continue;
      const startOfSentence = isSentenceStart(text, tok.i);
      let best = null;
      for (const n of idx) {
        const tol = n.lw.length >= 7 ? 2 : 1;
        if (Math.abs(n.lw.length - lw.length) > tol) continue;
        const d = levenshtein(norm(lw), norm(n.lw));
        if (d > 0 && d <= tol && (!best || d < best.d)) best = { d, n };
      }
      if (best) {
        const k = tok.w;
        const v = variants.get(k) || { written: k, suggestion: best.n.name, charName: best.n.charName, count: 0, first: tok.i };
        v.count++;
        variants.set(k, v);
      } else if (!startOfSentence) {
        const u = unknown.get(tok.w) || { name: tok.w, count: 0, first: tok.i };
        u.count++;
        unknown.set(tok.w, u);
      }
    }
    const mentions = (characters || []).map(c => {
      const parts = idx.filter(x => x.charId === c.id);
      const n = parts.reduce((s, x) => s + A.model.countOccurrences(text, x.name), 0);
      return { id: c.id, name: c.name, count: n };
    });
    return {
      variants: [...variants.values()].sort((a, b) => b.count - a.count),
      unknown: [...unknown.values()].filter(u => u.count >= 3).sort((a, b) => b.count - a.count).slice(0, 20),
      mentions
    };
  }

  /* ---------- LanguageTool (en ligne) ---------- */
  function chunkText(text, size) {
    size = size || 12000;
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      let end = Math.min(text.length, start + size);
      if (end < text.length) {
        const nl = text.lastIndexOf('\n', end);
        if (nl > start + size / 4) end = nl + 1;
        else {
          const sp = text.lastIndexOf(' ', end);
          if (sp > start) end = sp + 1;
        }
      }
      chunks.push({ start, text: text.slice(start, end) });
      start = end;
    }
    return chunks;
  }

  function issueKind(m) {
    const t = (m.rule && m.rule.issueType) || '';
    const cat = (m.rule && m.rule.category && m.rule.category.id) || '';
    if (t === 'misspelling' || cat === 'TYPOS') return 'spell';
    if (t === 'grammar' || cat === 'GRAMMAR' || cat === 'CONJUGAISON' || cat === 'AGREEMENT') return 'grammar';
    if (t === 'typographical' || t === 'whitespace' || cat === 'TYPOGRAPHY' || cat === 'PUNCTUATION') return 'typo';
    return 'style';
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function languageTool(text, baseUrl, onProgress) {
    const base = (baseUrl || 'https://api.languagetool.org/v2').replace(/\/+$/, '');
    const chunks = chunkText(text);
    const out = [];
    for (let i = 0; i < chunks.length; i++) {
      if (onProgress) onProgress(i, chunks.length);
      if (i > 0) await sleep(3200); // service gratuit : 20 requêtes / minute maximum
      const body = new URLSearchParams({ text: chunks[i].text, language: 'fr', motherTongue: 'fr' });
      let res;
      try {
        res = await fetch(base + '/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
          body
        });
      } catch (e) {
        throw new Error("Impossible de joindre le correcteur. Es-tu connecté·e à Internet ?");
      }
      if (res.status === 429) throw new Error('Le correcteur gratuit est saturé (trop de demandes). Réessaie dans une minute.');
      if (res.status === 413) throw new Error('Texte trop long pour le correcteur gratuit. Vérifie chapitre par chapitre.');
      if (!res.ok) throw new Error('Le correcteur a répondu une erreur (' + res.status + ').');
      const json = await res.json();
      (json.matches || []).forEach(m => {
        out.push({
          offset: m.offset + chunks[i].start,
          length: m.length,
          original: chunks[i].text.substr(m.offset, m.length),
          message: m.message,
          short: m.shortMessage || '',
          replacements: (m.replacements || []).slice(0, 5).map(r => r.value),
          rule: (m.rule && m.rule.description) || '',
          ruleId: (m.rule && m.rule.id) || '',
          kind: issueKind(m)
        });
      });
    }
    if (onProgress) onProgress(chunks.length, chunks.length);
    return out;
  }

  /* ---------- Analyse complète locale ---------- */
  function localReport(text, opts) {
    opts = opts || {};
    return {
      words: A.model.wordCount(text),
      tense: analyzeTense(text),
      repetitions: analyzeRepetitions(text),
      longSentences: analyzeSentences(text, opts.maxSentenceWords || 40),
      adverbs: analyzeAdverbs(text),
      tics: analyzeTics(text, opts.tics),
      typography: analyzeTypography(text),
      names: analyzeNames(text, opts.characters, opts.knownWords)
    };
  }

  A.check = {
    excerpt, levenshtein, paragraphs,
    analyzeTense, analyzeRepetitions, analyzeSentences, analyzeAdverbs, analyzeTics,
    analyzeTypography, fixTypography, analyzeNames, languageTool, localReport, chunkText
  };
})(window.Atelier);
