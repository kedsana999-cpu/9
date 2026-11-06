/* Atelier d'écriture — stockage local (IndexedDB, avec repli sur localStorage)
   Tout reste dans le navigateur de l'appareil. Rien n'est envoyé sur Internet. */
window.Atelier = window.Atelier || {};

(function (A) {
  'use strict';

  const DB_NAME = 'atelier-ecriture';
  const STORE = 'kv';
  const LS_PREFIX = 'atelier:';
  let dbPromise = null;
  let useLocalStorage = false;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) { reject(new Error('IndexedDB indisponible')); return; }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('Base bloquée'));
    });
    return dbPromise;
  }

  function tx(mode, fn) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const store = t.objectStore(STORE);
      const req = fn(store);
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error('Transaction annulée'));
    }));
  }

  const store = {
    get mode() { return useLocalStorage ? 'localStorage' : 'IndexedDB'; },

    async init() {
      try {
        await openDB();
        // Petit test d'écriture : certains navigateurs privés bloquent IndexedDB.
        await tx('readwrite', s => s.put(Date.now(), '__ping'));
      } catch (e) {
        console.warn('IndexedDB indisponible, repli sur localStorage', e);
        useLocalStorage = true;
      }
      // Demande au navigateur de ne pas effacer les données en cas de manque de place.
      try {
        if (navigator.storage && navigator.storage.persist) {
          A.persisted = await navigator.storage.persisted() || await navigator.storage.persist();
        }
      } catch (e) { /* sans importance */ }
    },

    async get(key) {
      if (useLocalStorage) {
        try { return JSON.parse(localStorage.getItem(LS_PREFIX + key) || 'null'); } catch (e) { return null; }
      }
      return tx('readonly', s => s.get(key));
    },

    async set(key, value) {
      if (useLocalStorage) {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
        return;
      }
      // Copie « propre » pour éviter les erreurs de clonage.
      return tx('readwrite', s => s.put(JSON.parse(JSON.stringify(value)), key));
    },

    async del(key) {
      if (useLocalStorage) { localStorage.removeItem(LS_PREFIX + key); return; }
      return tx('readwrite', s => s.delete(key));
    },

    async keys() {
      if (useLocalStorage) {
        return Object.keys(localStorage).filter(k => k.startsWith(LS_PREFIX)).map(k => k.slice(LS_PREFIX.length));
      }
      return tx('readonly', s => s.getAllKeys());
    }
  };

  /* ---------- Modèle de données ---------- */

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function pad(n) { return String(n).padStart(2, '0'); }
  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;
  function wordCount(text) {
    if (!text) return 0;
    const m = text.match(WORD_RE);
    return m ? m.length : 0;
  }

  const model = {
    uid, dayKey, wordCount,

    newProject(title) {
      const now = Date.now();
      return {
        id: uid(),
        title: title || 'Nouveau dossier',
        genre: '',
        pitch: '',
        nextStep: '',
        targetWords: 0,
        createdAt: now,
        updatedAt: now,
        chapters: [],
        plot: { synopsis: '', beats: [] },
        characters: [],
        ideas: [],
        lexicon: { words: [], concepts: [] },
        facts: [],
        aiHistory: [],
        session: { chapterId: null, cursor: 0 },
        shareOpts: { titlePage: true, numbering: true, pageBreak: true, pitch: false, exclude: [] }
      };
    },

    newChapter(title) {
      return { id: uid(), title: title || 'Sans titre', text: '', status: 'idee', notes: '', styleSample: false, updatedAt: Date.now() };
    },

    newBeat(title, desc) {
      return { id: uid(), title: title || '', desc: desc || '', status: 'a-ecrire', chapterId: null };
    },

    newCharacter(name) {
      return {
        id: uid(), name: name || 'Nouveau personnage', aliases: '', role: 'secondaire', age: '',
        look: '', personality: '', goal: '', fear: '', past: '', relations: '', voice: '', facts: '', notes: ''
      };
    },

    newIdea(text) {
      return { id: uid(), text: text || '', pinned: false, createdAt: Date.now() };
    },

    newFact(text, category) {
      return { id: uid(), text: text || '', category: category || 'regle' };
    },

    defaultSettings() {
      return {
        dailyGoal: 300,
        theme: 'auto',
        aiMode: 'copy',          // 'copy' (copier-coller, gratuit) ou 'api' (clé API)
        apiKey: '',
        model: 'claude-opus-5-5',
        styleProfile: '',
        languageToolUrl: 'https://api.languagetool.org/v2',
        dictionary: [],           // mots à ne jamais signaler (noms inventés…)
        tics: ['soudain', 'soudainement', 'vraiment', 'très', 'alors', 'puis', 'juste', 'commença à', 'se mit à', 'il y avait'],
        authorName: '',
        lastBackup: 0,
        lastExerciseId: null
      };
    },

    /** Mots d'un dossier (tous chapitres confondus). */
    projectWords(p) {
      return p.chapters.reduce((n, c) => n + wordCount(c.text), 0);
    },

    /** Compte les occurrences d'un mot ou d'une expression dans un texte (insensible à la casse et aux accents). */
    countOccurrences(text, term) {
      if (!text || !term) return 0;
      const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const t = norm(text);
      const q = norm(term.trim());
      if (!q) return 0;
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp('(^|[^\\p{L}\\p{N}])' + esc + '(?=$|[^\\p{L}\\p{N}])', 'gu');
      const m = t.match(re);
      return m ? m.length : 0;
    }
  };

  A.store = store;
  A.model = model;
})(window.Atelier);
