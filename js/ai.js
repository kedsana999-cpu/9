/* Atelier d'écriture — Assistant IA
   Deux façons de l'utiliser :
   - « Copier-coller » (gratuit) : l'Atelier prépare une demande complète (ton dossier + ton style),
     tu la colles dans Claude.ai (ou une autre IA) et tu recolles la réponse.
   - « Clé API » (automatique, payant à l'usage) : l'Atelier interroge Claude directement. */
window.Atelier = window.Atelier || {};

(function (A) {
  'use strict';

  const SDK_URL = 'vendor/anthropic-sdk-1.3.0.js';

  const MODELS = [
    { id: 'claude-opus-5-5', label: 'Claude Opus 5.5 — la meilleure qualité', inPrice: 4, outPrice: 20 },
    { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 — bon équilibre, deux fois moins cher', inPrice: 2, outPrice: 10 },
    { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5 — très économique, plus simple', inPrice: 0.1, outPrice: 0.5 }
  ];

  const SYSTEM = [
    "Tu es l'assistant d'écriture personnel d'une personne francophone qui écrit des nouvelles et des romans.",
    "Ton rôle : l'aider à écrire SON histoire, pas l'écrire à sa place. Tu respectes sa voix, son style et ses choix.",
    "Tu réponds toujours en français, avec une typographie française correcte (guillemets « », tirets de dialogue —, espaces avant ; : ! ?).",
    "Tu es précis et honnête, tu cites le texte quand tu commentes, et tu restes bienveillant : l'objectif est qu'elle garde l'envie d'écrire.",
    "Les éléments entre balises (<dossier>, <manuscrit>, <mon_style>, <passage>…) sont la matière de travail fournie par l'autrice ou l'auteur."
  ].join('\n');

  const ROLE_LABEL = { principal: 'personnage principal', secondaire: 'personnage secondaire', antagoniste: 'antagoniste', figurant: 'figurant' };
  const FACT_LABEL = { lieu: 'Lieu', regle: 'Règle du monde', chrono: 'Chronologie', objet: 'Objet', histoire: 'Histoire passée', autre: 'Autre' };
  const BEAT_LABEL = { 'a-ecrire': 'à écrire', 'en-cours': 'en cours', 'ecrit': 'écrit' };

  /* ---------- Briques de contexte ---------- */

  function line(label, value) {
    value = (value || '').toString().trim();
    return value ? label + ' : ' + value.replace(/\n+/g, ' / ') + '\n' : '';
  }

  function bible(p) {
    let s = '<dossier>\n';
    s += line('Titre', p.title) + line('Genre', p.genre) + line('Pitch', p.pitch);
    if (p.plot && p.plot.synopsis.trim()) s += '<trame>\n' + p.plot.synopsis.trim() + '\n</trame>\n';
    if (p.plot && p.plot.beats.length) {
      s += '<etapes_du_fil_rouge>\n';
      p.plot.beats.forEach((b, i) => {
        s += (i + 1) + '. [' + (BEAT_LABEL[b.status] || b.status) + '] ' + (b.title || 'Sans titre') + (b.desc ? ' — ' + b.desc.replace(/\n+/g, ' ') : '') + '\n';
      });
      s += '</etapes_du_fil_rouge>\n';
    }
    if (p.characters.length) {
      s += '<personnages>\n';
      p.characters.forEach(c => {
        s += '## ' + c.name + ' (' + (ROLE_LABEL[c.role] || c.role) + ')' + (c.aliases ? ' — aussi appelé·e : ' + c.aliases : '') + '\n';
        s += line('Âge', c.age) + line('Apparence', c.look) + line('Caractère', c.personality) + line('Ce qu\'il/elle veut', c.goal) +
          line('Ce qu\'il/elle craint', c.fear) + line('Passé', c.past) + line('Relations', c.relations) +
          line('Façon de parler', c.voice) + line('Faits établis', c.facts) + line('Notes', c.notes);
      });
      s += '</personnages>\n';
    }
    if (p.facts.length) {
      s += '<univers_et_faits_etablis>\n';
      p.facts.forEach(f => { if (f.text.trim()) s += '- [' + (FACT_LABEL[f.category] || f.category) + '] ' + f.text.trim().replace(/\n+/g, ' ') + '\n'; });
      s += '</univers_et_faits_etablis>\n';
    }
    const words = p.lexicon.words.map(w => w.word).filter(Boolean);
    const concepts = p.lexicon.concepts.map(c => c.title).filter(Boolean);
    if (words.length || concepts.length) {
      s += '<lexique>\n' + line('Mots que je veux utiliser', words.join(', ')) + line('Concepts à explorer', concepts.join(', ')) + '</lexique>\n';
    }
    return s + '</dossier>\n';
  }

  function chapterBlock(c, n) {
    return '<chapitre numero="' + n + '" titre="' + (c.title || '').replace(/"/g, "'") + '">\n' + (c.text || '').trim() + '\n</chapitre>\n';
  }

  function manuscript(p, upToIndex) {
    const list = upToIndex === undefined ? p.chapters : p.chapters.slice(0, upToIndex + 1);
    return '<manuscrit>\n' + list.map((c, i) => chapterBlock(c, i + 1)).join('') + '</manuscrit>\n';
  }

  /** Bloc « mon style » : profil + extraits des textes marqués comme échantillons. */
  function styleBlock(settings, samples, maxChars) {
    maxChars = maxChars || 9000;
    const profile = (settings.styleProfile || '').trim();
    let s = '';
    if (!profile && !samples.length) return '';
    s += '<mon_style>\n';
    if (profile) s += '<profil>\n' + profile + '\n</profil>\n';
    if (samples.length) {
      const per = Math.max(1200, Math.floor(maxChars / samples.length));
      s += '<extraits_de_mes_textes>\n';
      let used = 0;
      for (const sm of samples) {
        if (used >= maxChars) break;
        const t = sm.text.trim().slice(0, Math.min(per, maxChars - used));
        used += t.length;
        s += '--- ' + sm.label + ' ---\n' + t + (t.length < sm.text.trim().length ? ' […]' : '') + '\n';
      }
      s += '</extraits_de_mes_textes>\n';
    }
    return s + '</mon_style>\n';
  }

  /* ---------- Tâches ---------- */

  const INTENTIONS = {
    fluide: 'Rends le passage plus fluide et agréable à lire, sans changer ce qu\'il raconte.',
    concis: 'Resserre le passage : supprime les redites, les mots inutiles et les lourdeurs. Vise environ 20 à 30 % plus court.',
    vivant: 'Rends le passage plus vivant et sensoriel : images concrètes, détails précis, verbes forts.',
    montrer: 'Applique « montrer plutôt que dire » : remplace les émotions nommées et les explications par des gestes, des actions, des détails et des répliques qui les font ressentir.',
    tension: 'Augmente la tension et le rythme du passage.',
    dialogue: 'Améliore les dialogues : plus naturels, plus caractérisés, avec une ponctuation de dialogue française correcte.',
    correction: 'Corrige uniquement l\'orthographe, la grammaire, la concordance des temps et la ponctuation. Ne change rien au style ni au contenu.'
  };

  const TASKS = {
    rewrite: {
      label: 'Réécrire un passage',
      icon: 'wand',
      desc: 'Deux propositions dans ton style, et ce qui a changé.',
      build(ctx) {
        const i = ctx.input;
        const intent = INTENTIONS[i.intention] || INTENTIONS.fluide;
        let u = bible(ctx.project) + ctx.style;
        u += '<passage>\n' + (i.passage || '').trim() + '\n</passage>\n\n';
        u += 'Consigne : ' + intent + '\n';
        if ((i.custom || '').trim()) u += 'Précision de ma part : ' + i.custom.trim() + '\n';
        if (i.intention === 'correction') {
          u += '\nRéponds ainsi :\n## Texte corrigé\n(le passage corrigé)\n## Corrections\n(une puce par correction : « avant » → « après » — explication très courte)\n';
        } else {
          u += '\nRéponds ainsi :\n## Version 1\n(une réécriture fidèle)\n## Version 2\n(une variante plus audacieuse)\n## Ce que j\'ai changé\n(3 à 5 puces courtes qui expliquent les techniques utilisées, pour que j\'apprenne)\n';
        }
        u += '\nRègles : garde ma voix (voir <mon_style> s\'il est fourni), le temps du récit, le point de vue et les faits de l\'histoire. N\'ajoute aucun événement nouveau.';
        return { system: SYSTEM, user: u, effort: 'medium' };
      }
    },

    outline: {
      label: 'Découper ma trame',
      icon: 'route',
      desc: 'Transforme ta trame générale en étapes (scènes) à écrire.',
      build(ctx) {
        const p = ctx.project;
        let u = bible(p);
        u += '\nÀ partir de ma trame générale (dans <trame>) et des étapes déjà notées, propose un découpage de l\'histoire en 8 à 15 étapes (une étape = une scène ou un chapitre).\n' +
          'Garde mes idées et l\'histoire telle que je l\'imagine : tu organises, tu n\'inventes pas une autre histoire. ' +
          'Si un passage de la trame est flou ou s\'il manque un maillon logique, propose une étape et signale-la avec « (à préciser) ».\n\n' +
          'Format obligatoire, une étape par ligne, sans rien d\'autre avant la liste :\n' +
          '1. Titre court — ce qui se passe en une ou deux phrases\n2. Titre court — …\n\n' +
          'Après la liste, ajoute une partie « Trous à combler » avec au plus 3 questions sur ce qui manque à la trame.';
        return { system: SYSTEM, user: u, effort: 'medium' };
      }
    },

    coherence: {
      label: 'Traquer les incohérences',
      icon: 'search',
      desc: 'Contradictions, chronologie, failles logiques, fils oubliés.',
      build(ctx) {
        const p = ctx.project;
        const i = ctx.input;
        let u = bible(p);
        let focus = '';
        if (i.chapterId && i.chapterId !== 'all') {
          const idx = p.chapters.findIndex(c => c.id === i.chapterId);
          u += manuscript(p, idx);
          focus = 'Concentre-toi sur le chapitre ' + (idx + 1) + ' (« ' + p.chapters[idx].title + ' ») : vérifie qu\'il est cohérent avec lui-même, avec les chapitres précédents et avec le dossier.\n\n';
        } else {
          u += manuscript(p);
        }
        u += '\n' + focus + 'Relis attentivement et repère les problèmes de cohérence. Cherche en particulier :\n' +
          '1. Les contradictions factuelles (un détail affirmé puis contredit : apparence, âge, lieu, date, objet, qui sait quoi…)\n' +
          '2. Les problèmes de chronologie (ordre des événements, durées, saisons, âges incompatibles)\n' +
          '3. Les personnages incohérents (comportement qui contredit leur caractère sans raison, nom qui change, personnage à deux endroits à la fois)\n' +
          '4. Les failles logiques (comment X peut-il savoir Y ? pourquoi ne fait-il pas Z ?)\n' +
          '5. Les contradictions avec le dossier (<dossier>) : fiches personnages, univers, fil rouge\n' +
          '6. Les fils narratifs ouverts (éléments annoncés puis oubliés)\n\n' +
          'Pour chaque problème, utilise ce format :\n' +
          '### [Gravité : forte / moyenne / légère] Titre court\n' +
          '- Où : chapitre(s)\n- Citation(s) : les passages exacts entre guillemets\n- Le problème : une ou deux phrases\n- Piste de correction : une suggestion\n\n' +
          'Classe du plus grave au moins grave. Ne signale que de vrais problèmes, cite toujours le texte et n\'invente rien. ' +
          'S\'il n\'y a aucun problème, dis-le simplement. Termine par « Ce qui tient bien : » avec 2 ou 3 points forts de cohérence.';
        return { system: SYSTEM, user: u, effort: 'high' };
      }
    },

    unblock: {
      label: 'Je bloque sur la suite',
      icon: 'bulb',
      desc: '3 pistes pour la prochaine scène, à partir de ton fil rouge.',
      build(ctx) {
        const p = ctx.project;
        const i = ctx.input;
        let u = bible(p) + ctx.style;
        const c = p.chapters.find(x => x.id === i.chapterId);
        if (c) {
          const t = (c.text || '').trim();
          u += '<ou_j_en_suis chapitre="' + (c.title || '').replace(/"/g, "'") + '">\n' + (t.length > 5000 ? '[…] ' + t.slice(-5000) : t) + '\n</ou_j_en_suis>\n';
          if ((c.notes || '').trim()) u += line('Mes notes sur ce chapitre', c.notes);
        }
        if ((p.nextStep || '').trim()) u += line('Ma note « prochaine étape »', p.nextStep);
        u += '\nJe bloque sur la suite.' + ((i.note || '').trim() ? ' ' + i.note.trim() : '') + '\n\n' +
          'Propose-moi 3 directions vraiment différentes pour la scène suivante. Pour chacune :\n' +
          '### Piste 1 — titre\n- Ce qui se passe (3 ou 4 phrases)\n- Pourquoi ça sert l\'histoire (lien avec le fil rouge et les personnages)\n- Une première phrase possible, dans mon style\n\n' +
          'Puis une partie « Questions à te poser » : 3 questions qui m\'aident à trouver ma propre réponse.';
        if (i.wantDraft) u += '\n\nEnfin, une partie « Premier jet » (environ 250 mots) : écris le début de la piste qui te semble la plus forte, dans mon style, comme un brouillon que je réécrirai moi-même.';
        return { system: SYSTEM, user: u, effort: 'medium' };
      }
    },

    feedback: {
      label: 'Avis de lecteur',
      icon: 'book',
      desc: 'Ce qui marche, ce qui peut être renforcé.',
      build(ctx) {
        const p = ctx.project;
        const c = p.chapters.find(x => x.id === ctx.input.chapterId) || p.chapters[0];
        let u = bible(p);
        u += c ? chapterBlock(c, p.chapters.indexOf(c) + 1) : '';
        u += '\nLis ce chapitre comme un lecteur attentif et bienveillant, mais honnête. Réponds ainsi :\n' +
          '## Ce qui fonctionne\n(3 points précis, avec citations)\n' +
          '## Ce qui pourrait être renforcé\n(3 points, du plus important au moins important, avec une piste concrète pour chacun)\n' +
          '## Une question de lecteur\n(ce que je me demande en refermant le chapitre)\n' +
          '## Envie de lire la suite\n(une note sur 10 et pourquoi, en une phrase)\n\n' +
          'Sois concret et cite le texte. Ne réécris pas le chapitre.';
        return { system: SYSTEM, user: u, effort: 'medium' };
      }
    },

    style: {
      label: 'Analyser mon style',
      icon: 'feather',
      desc: 'Crée ton profil d\'écriture, réutilisé dans toutes les demandes.',
      build(ctx) {
        let u = ctx.styleSamplesOnly || '';
        u += '\nVoici des extraits de mes textes. Analyse mon style d\'écriture de façon concrète, avec des exemples tirés des extraits :\n' +
          '## Voix et point de vue\n## Rythme et construction des phrases\n## Vocabulaire et registre\n## Images et figures de style\n## Dialogues\n## Mes forces\n## Mes tics et habitudes à surveiller\n' +
          '## Profil condensé\n8 à 12 règles courtes, à l\'impératif, qui permettraient d\'imiter mon style (par exemple « Phrases courtes dans l\'action, longues dans l\'introspection »). Ce profil sera réutilisé tel quel dans mes prochaines demandes.';
        return { system: SYSTEM, user: u, effort: 'medium' };
      }
    },

    free: {
      label: 'Question libre',
      icon: 'chat',
      desc: 'Pose n\'importe quelle question sur ton histoire.',
      build(ctx) {
        const p = ctx.project;
        const i = ctx.input;
        let u = bible(p) + ctx.style;
        if (i.chapterId === 'all') u += manuscript(p);
        else if (i.chapterId) {
          const c = p.chapters.find(x => x.id === i.chapterId);
          if (c) u += chapterBlock(c, p.chapters.indexOf(c) + 1);
        }
        u += '\n' + (i.question || '').trim();
        return { system: SYSTEM, user: u, effort: 'medium' };
      }
    }
  };

  /* ---------- Préparation et envoi ---------- */

  function asPasteable(prompt) {
    return '[Consignes pour toi]\n' + prompt.system + '\n\n[Ma demande]\n' + prompt.user;
  }

  function estimate(prompt, modelId) {
    const m = MODELS.find(x => x.id === modelId) || MODELS[0];
    const chars = (prompt.system || '').length + (prompt.user || '').length;
    const inTok = Math.ceil(chars / 3.6);
    const outTok = 2500; // réponse + réflexion, ordre de grandeur
    const usd = (inTok * m.inPrice + outTok * m.outPrice) / 1e6;
    return { chars, inTok, usd };
  }

  function loadSDK() {
    if (window.Anthropic) return Promise.resolve(window.Anthropic);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SDK_URL;
      s.onload = () => window.Anthropic ? resolve(window.Anthropic) : reject(new Error('Bibliothèque Claude introuvable.'));
      s.onerror = () => reject(new Error('Impossible de charger la bibliothèque Claude.'));
      document.head.appendChild(s);
    });
  }

  function friendlyError(Anthropic, e) {
    if (Anthropic && e instanceof Anthropic.AuthenticationError) return 'Clé API refusée. Vérifie-la dans les Réglages.';
    if (Anthropic && e instanceof Anthropic.PermissionDeniedError) return 'Cette clé n\'a pas accès à ce modèle.';
    if (Anthropic && e instanceof Anthropic.RateLimitError) return 'Trop de demandes d\'un coup. Patiente une minute et réessaie.';
    if (Anthropic && e instanceof Anthropic.BadRequestError) {
      const msg = (e.message || '');
      if (/credit|balance|billing/i.test(msg)) return 'Crédit API insuffisant. Recharge ton compte sur console.anthropic.com.';
      return 'Demande refusée par l\'API : ' + msg;
    }
    if (Anthropic && e instanceof Anthropic.APIConnectionError) return 'Pas de connexion à Claude. Es-tu connecté·e à Internet ?';
    if (Anthropic && e instanceof Anthropic.APIUserAbortError) return 'Demande interrompue.';
    if (Anthropic && e instanceof Anthropic.APIError) return 'Erreur de l\'API (' + (e.status || '?') + ') : ' + e.message;
    return e && e.message ? e.message : String(e);
  }

  /**
   * Envoie la demande à Claude et transmet le texte au fil de l'eau.
   * handle.abort() permet d'interrompre.
   */
  async function run(prompt, settings, onText, handle) {
    if (!settings.apiKey) throw new Error('Ajoute ta clé API dans les Réglages (ou utilise le mode copier-coller).');
    const Anthropic = await loadSDK();
    const client = new Anthropic({ apiKey: settings.apiKey.trim(), dangerouslyAllowBrowser: true });
    const model = settings.model || 'claude-opus-5-5';
    const params = {
      model,
      max_tokens: 32000,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
      thinking: { type: 'adaptive' },
      output_config: { effort: prompt.effort || 'medium' }
    };
    let stream;
    try {
      if (model === 'claude-opus-5-5' || model === 'claude-sonnet-5-5') {
        // Repli automatique sur un autre modèle si une demande est refusée par erreur.
        stream = client.beta.messages.stream(Object.assign({}, params, {
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default'
        }));
      } else {
        stream = client.messages.stream(params);
      }
      if (handle) handle.abort = () => stream.abort();
      stream.on('text', t => onText && onText(t));
      const msg = await stream.finalMessage();
      if (msg.stop_reason === 'refusal') {
        throw new Error('Claude a refusé de traiter cette demande. Reformule-la ou retire le passage en cause.');
      }
      const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
      return { text, truncated: msg.stop_reason === 'max_tokens', usage: msg.usage };
    } catch (e) {
      throw new Error(friendlyError(Anthropic, e));
    }
  }

  A.ai = { MODELS, TASKS, INTENTIONS, SYSTEM, bible, manuscript, styleBlock, asPasteable, estimate, run, loadSDK };
})(window.Atelier);
