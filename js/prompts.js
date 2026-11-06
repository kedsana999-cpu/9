/* Atelier d'écriture — consignes d'entraînement, mots imposés et structures de récit */
window.Atelier = window.Atelier || {};

(function (A) {
  'use strict';

  const consignes = [
    // Sensations
    "Décris une cuisine un dimanche matin uniquement par les odeurs et les sons. Aucun élément visuel.",
    "Un personnage touche un objet qu'il n'a pas vu depuis vingt ans. Raconte ce que ses mains reconnaissent avant sa mémoire.",
    "Décris la pluie à quelqu'un qui ne l'a jamais vue.",
    "Une gare, la nuit, en hiver. Écris dix minutes sans jamais utiliser le mot « froid ».",
    "Raconte un repas de famille à travers le goût d'un seul plat.",
    "Décris une ville que tu connais comme si tu y arrivais pour la première fois.",
    "Un silence qui en dit long : écris la scène sans aucun dialogue.",
    // Personnages
    "Un personnage ment à quelqu'un qu'il aime. On doit le comprendre sans qu'il ne soit jamais écrit « il mentait ».",
    "Écris la liste de ce que ton personnage garde dans ses poches, puis raconte d'où vient l'objet le plus étrange.",
    "Ton personnage reçoit une lettre qui ne lui était pas destinée. Il l'ouvre quand même.",
    "Décris quelqu'un uniquement par sa façon de marcher et de s'asseoir.",
    "Un personnage doit annoncer une mauvaise nouvelle. Il tourne autour du pot pendant toute la scène.",
    "Écris le premier souvenir de ton personnage principal, tel qu'il le raconterait à un inconnu.",
    "Deux personnes qui se détestent sont coincées dans un ascenseur.",
    "Ton antagoniste a une très bonne raison de faire ce qu'il fait. Laisse-le se justifier.",
    "Un enfant explique à un adulte une règle du monde qui n'a aucun sens… sauf pour lui.",
    "Écris le journal intime d'un personnage secondaire le jour où ton héros a changé sa vie.",
    "Quelqu'un attend. Qui, quoi, et depuis combien de temps ? Ne le révèle qu'à la dernière phrase.",
    // Dialogues
    "Une dispute de couple où l'objet de la dispute n'est jamais le vrai problème.",
    "Écris une conversation téléphonique dont on n'entend qu'un seul côté.",
    "Deux inconnus se parlent dans un train. L'un des deux sait quelque chose sur l'autre.",
    "Un interrogatoire où c'est le suspect qui mène la danse.",
    "Une scène de rupture entièrement composée de phrases de moins de six mots.",
    "Deux vieux amis se retrouvent. Ils évitent soigneusement le sujet qui les a séparés.",
    // Premières phrases imposées
    "Commence par : « Personne n'avait remarqué que l'horloge de la place s'était arrêtée. »",
    "Commence par : « Ce n'était pas la première fois qu'elle rentrait par la fenêtre. »",
    "Commence par : « Le jour où la mer s'est retirée, elle n'est jamais revenue. »",
    "Commence par : « J'aurais dû me méfier quand le chien a refusé d'entrer. »",
    "Commence par : « Il restait trois minutes avant la fermeture, et c'est là qu'il est entré. »",
    "Commence par : « Dans ma famille, on ne parle jamais de l'oncle Gabriel. »",
    "Commence par : « La clé ne correspondait à aucune porte de la maison. »",
    "Commence par : « On m'avait promis que ce serait un voyage tranquille. »",
    "Termine par : « Et c'est ainsi que j'ai appris à ne plus attendre personne. »",
    "Termine par : « Elle a souri. Elle savait. »",
    // Contraintes
    "Écris un texte où chaque phrase commence par une lettre différente, dans l'ordre de l'alphabet (aussi loin que possible).",
    "Raconte une histoire complète en exactement cinq phrases.",
    "Écris au présent une scène d'action, puis réécris son dernier paragraphe au passé simple. Observe la différence.",
    "Écris une scène à la deuxième personne : « Tu ouvres la porte… »",
    "Écris un texte sans aucun adjectif.",
    "Écris une page sans utiliser le verbe « être » ni le verbe « avoir ».",
    "Raconte une scène deux fois : du point de vue de la victime, puis de celui du témoin.",
    "Une histoire qui se déroule en marche arrière : commence par la fin.",
    "Écris une notice de montage… pour un sentiment.",
    // Imaginaire
    "Dans cette ville, on paie avec des souvenirs. Ton personnage vient de dépenser le plus précieux.",
    "Une porte apparaît chaque nuit dans le mur de la chambre. Ce soir, elle est entrouverte.",
    "Les ombres ont commencé à se détacher de leurs propriétaires. La tienne a pris de l'avance.",
    "Un village où il est interdit de chanter. Quelqu'un chante.",
    "Un objet banal de ta maison est en réalité vivant depuis toujours. Il prend la parole.",
    "On peut désormais acheter une heure de plus par jour. Que fait ton personnage de la sienne ?",
    "Le dernier libraire du monde reçoit un client.",
    "Une carte postale arrive, postée il y a cinquante ans.",
    // Introspection / matière personnelle
    "Écris sur un lieu de ton enfance qui n'existe plus.",
    "Raconte un moment où tu as eu tort, mais donne-le à un personnage inventé.",
    "Écris une lettre à quelqu'un que tu n'as jamais remercié.",
    "Liste dix choses que tu as vues aujourd'hui, puis transforme la plus banale en début d'histoire.",
    "Écris sur une peur d'enfant, avec les mots d'un adulte.",
    "Décris ta journée d'hier comme si c'était un roman policier.",
    // Atelier de style
    "Prends une scène banale (faire les courses) et écris-la avec une tension de thriller.",
    "Écris la même scène en trois phrases très longues, puis en vingt phrases très courtes.",
    "Une scène où le décor reflète l'état émotionnel du personnage, sans jamais nommer l'émotion.",
    "Montre qu'un personnage est riche (ou pauvre) sans jamais parler d'argent.",
    "Écris un paragraphe d'ouverture qui donne envie de lire la suite. Puis un deuxième, totalement différent.",
    "Écris une scène d'adieu sans le mot « adieu », ni « au revoir », ni larmes.",
    "Fais tenir toute une vie dans une seule journée.",
    "Une tempête approche. Fais monter la tension phrase après phrase.",
    "Écris librement pendant dix minutes, sans t'arrêter et sans te relire. Si tu bloques, écris « je bloque » jusqu'à ce que ça reparte."
  ];

  const mots = [
    "lanterne", "cicatrice", "orage", "vertige", "grenier", "boussole", "sel", "murmure", "miroir", "racine",
    "écho", "brume", "cendre", "funambule", "horloge", "plume", "frontière", "lierre", "phare", "marée",
    "fissure", "velours", "verger", "naufrage", "minuit", "clé", "silence", "orchidée", "carrousel", "parchemin",
    "lucioles", "sablier", "cerf-volant", "abîme", "cristal", "renard", "ruelle", "épine", "aube", "comète",
    "colère", "tendresse", "mensonge", "promesse", "absence", "secret", "nostalgie", "audace", "pardon", "honte",
    "valise", "bibliothèque", "quai", "fenêtre", "escalier", "jardin", "cave", "toit", "pont", "forêt",
    "violon", "encre", "bougie", "photographie", "lettre", "médaillon", "carnet", "parapluie", "manteau", "tasse",
    "désert", "glacier", "île", "volcan", "marais", "falaise", "rivière", "dune", "grotte", "prairie",
    "trahison", "héritage", "rencontre", "fuite", "retour", "attente", "rêve", "insomnie", "fête", "deuil",
    "rouille", "soie", "ardoise", "miel", "charbon", "argile", "cuivre", "lavande", "givre", "poussière",
    "chuchoter", "trébucher", "s'enfuir", "rougir", "frissonner", "guetter", "effleurer", "s'égarer", "pardonner", "oublier"
  ];

  /* Structures de récit pour transformer une trame en étapes concrètes */
  const structures = [
    {
      id: 'schema',
      name: 'Schéma narratif (5 temps)',
      desc: 'Le grand classique : idéal pour une nouvelle.',
      beats: [
        ['Situation initiale', 'Qui, où, quand ? Le monde « normal » avant que tout bascule.'],
        ['Élément perturbateur', "L'événement qui dérègle tout et lance l'histoire."],
        ['Péripéties', 'Les obstacles, les tentatives, les rebondissements. Ce qui se complique.'],
        ['Dénouement', "Le moment décisif où le conflit se résout (bien ou mal)."],
        ['Situation finale', "Le nouvel équilibre. Qu'est-ce qui a changé ?"]
      ]
    },
    {
      id: 'actes',
      name: 'Structure en 3 actes',
      desc: 'Pour un roman ou une longue nouvelle.',
      beats: [
        ['Ouverture', 'Présenter le héros, son quotidien, ce qui lui manque.'],
        ['Déclencheur', 'Un événement l\'oblige à sortir de sa routine.'],
        ['Fin de l\'acte I : le choix', 'Le héros s\'engage. Plus de retour en arrière possible.'],
        ['Montée des obstacles', 'Les épreuves, les alliés, les ennemis. On apprend les règles.'],
        ['Point milieu', 'Une révélation ou un retournement qui change les enjeux.'],
        ['Tout s\'effondre', 'Le moment le plus sombre. Le héros semble avoir perdu.'],
        ['Climax', 'La confrontation finale. Le héros utilise ce qu\'il a appris.'],
        ['Résolution', 'Les conséquences. Le nouveau monde du héros.']
      ]
    },
    {
      id: 'heros',
      name: 'Le voyage du héros (simplifié)',
      desc: 'Pour une aventure, du fantastique, une quête.',
      beats: [
        ['Le monde ordinaire', ''],
        ["L'appel de l'aventure", ''],
        ['Le refus, puis le mentor', ''],
        ['Le seuil', 'Le héros entre dans un monde inconnu.'],
        ['Épreuves, alliés, ennemis', ''],
        ["L'épreuve suprême", ''],
        ['La récompense', ''],
        ['Le chemin du retour', ''],
        ['La transformation', 'Le héros revient changé.']
      ]
    },
    {
      id: 'chute',
      name: 'Nouvelle à chute',
      desc: 'Tout est construit pour une dernière phrase qui renverse la lecture.',
      beats: [
        ['La chute (à écrire en premier !)', 'Quelle révélation finale ? Écris-la avant tout le reste.'],
        ['Fausse piste', 'Ce que le lecteur doit croire.'],
        ['Indices discrets', 'Trois détails semés qui prendront sens à la fin.'],
        ['Montée vers la révélation', ''],
        ['La dernière phrase', '']
      ]
    }
  ];

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function pickMany(list, n) {
    const copy = list.slice();
    const out = [];
    while (copy.length && out.length < n) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    return out;
  }

  A.prompts = { consignes, mots, structures, pick, pickMany };
})(window.Atelier);
