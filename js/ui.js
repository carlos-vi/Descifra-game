// Interfaz del juego: pantallas, fichas, ajustes y guardado del progreso.
(function () {
  'use strict';

  const app = document.getElementById('app');
  const homeButton = document.getElementById('home-button');
  const dialog = document.getElementById('result-dialog');
  const settingsDialog = document.getElementById('settings-dialog');
  const settingsButton = document.getElementById('settings-button');
  const STORAGE_PREFIX = 'descifra:v1:';
  const STATS_KEY = 'stats';
  const SETTINGS_KEY = 'settings';

  const DAILY_LABELS = [
    'Lunes · muy fácil',
    'Martes · fácil',
    'Miércoles · media',
    'Jueves · media',
    'Viernes · difícil',
    'Sábado · muy difícil',
    'Domingo · el más difícil',
  ];

  const ICONS = {
    back: '<path d="M15 5 L8 12 L15 19"/>',
    next: '<path d="M9 5 L16 12 L9 19"/>',
    star: '<path d="M12 3 L14.6 9 L21 9.5 L16 13.6 L17.6 20 L12 16.6 L6.4 20 L8 13.6 L3 9.5 L9.4 9 Z"/>',
    book: '<path d="M4 5 C8 4 10 5 12 7 C14 5 16 4 20 5 V19 C16 18 14 19 12 20 C10 19 8 18 4 19 Z M12 7 V20"/>',
    link: '<path d="M14 4 H20 V10 M20 4 L11 13 M18 14 V20 H4 V6 H10"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10 H20 M9 3 V7 M15 3 V7"/>',
  };

  // Selección en curso, por reto: índices de fichas, letras elegidas u opción marcada.
  let selections = {};
  let pinnedWord = null;
  // Partida abierta: { puzzle, key, daily (número del reto diario o null) }.
  let current = null;
  let countdownTimer = null;
  // Escritura de glifos del puzzle abierto (null si se escribe con letras).
  let currentScript = null;
  // Reto que se acaba de comprobar, para animar su última fila.
  let justChecked = null;

  // ---------- Guardado ----------

  function readJSON(key) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      // Sin almacenamiento disponible: se juega sin guardar.
    }
  }

  function clearKey(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {
      // Ignorado a propósito.
    }
  }

  function clearAllProgress() {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX) && k !== STORAGE_PREFIX + SETTINGS_KEY)
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      // Ignorado a propósito.
    }
  }

  function dailyKey(number) {
    return 'daily-' + number;
  }

  function loadState(puzzle, key) {
    const state = readJSON(key);
    if (state && state.challenges && state.challenges.length === puzzle.challenges.length) {
      if (state.notes == null) state.notes = '';
      return state;
    }
    return Engine.newState(puzzle);
  }

  function saveState(state) {
    writeJSON(current.key, state);
  }

  function loadStats() {
    return readJSON(STATS_KEY) || Engine.emptyStats();
  }

  // Ajustes del jugador. El resaltado de palabras iguales empieza desactivado.
  function loadSettings() {
    return Object.assign({ highlight: false }, readJSON(SETTINGS_KEY));
  }

  let settings = loadSettings();

  // ---------- Utilidades ----------

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'html') node.innerHTML = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else if (value !== false && value != null) node.setAttribute(key, value === true ? '' : value);
    });
    (children || []).forEach((child) => {
      if (child != null) node.append(child);
    });
    return node;
  }

  function svgIcon(inner, extraClass) {
    return el('span', {
      class: 'icon ' + (extraClass || ''),
      'aria-hidden': 'true',
      html:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
        'stroke-linejoin="round" focusable="false">' + inner + '</svg>',
    });
  }

  function wikiUrl(term) {
    return 'https://es.wikipedia.org/w/index.php?title=Especial:Buscar&go=Ir&search=' + encodeURIComponent(term);
  }

  function externalLinks(links) {
    return el(
      'ul',
      { class: 'external-links' },
      links.map((l) =>
        el('li', {}, [
          el('a', { href: wikiUrl(l.wiki), target: '_blank', rel: 'noopener' }, [
            document.createTextNode(l.label),
            svgIcon(ICONS.link, 'small'),
          ]),
        ])
      )
    );
  }

  function starsText(stars) {
    return '★'.repeat(stars) + '☆'.repeat(3 - stars);
  }

  // «el kenna», o «la escritura» en los niveles de glifos.
  function subject(puzzle) {
    return puzzle.script ? 'la escritura' : 'el ' + puzzle.language;
  }

  function article(id) {
    return ARTICLES.find((a) => a.id === id);
  }

  function category(id) {
    return CATEGORIES.find((c) => c.id === id);
  }

  function catStyle(id) {
    return '--cat: var(--cat-' + id + '); --cat-soft: var(--cat-' + id + '-soft)';
  }

  // Niveles de una categoría, de más fácil a más difícil.
  function levelsIn(categoryId) {
    return PUZZLES.filter((p) => p.category === categoryId).sort(
      (a, b) => a.difficulty - b.difficulty || PUZZLES.indexOf(a) - PUZZLES.indexOf(b)
    );
  }

  function difficultyDots(level) {
    return el(
      'span',
      { class: 'difficulty', role: 'img', 'aria-label': 'Dificultad ' + level + ' de 5' },
      [1, 2, 3, 4, 5].map((i) => el('span', { class: 'dot' + (i <= level ? ' on' : '') }))
    );
  }

  function levelProgress(puzzle) {
    const state = loadState(puzzle, puzzle.id);
    const finished = Engine.isFinished(state);
    return {
      finished,
      started: state.challenges.some((c) => c.attempts.length > 0),
      stars: finished ? Engine.computeStars(state) : 0,
    };
  }

  // ---------- Resaltado de palabras (opcional) ----------

  function glyphNode(glyph) {
    return el('span', { class: 'lang-word lang-glyph', 'data-word': glyph, html: Scripts.glyphSvg(currentScript, glyph) });
  }

  // Palabras escritas con glifos: cada glifo se resalta por separado.
  function glyphText(text, extraClass) {
    const script = Scripts.SCRIPTS[currentScript];
    const classes = ['glyph-word', script.rtl ? 'rtl' : '', script.vertical ? 'vertical' : '', script.cartouche ? 'cartouche' : '']
      .filter(Boolean)
      .join(' ');
    const words = Engine.tokenize(text).map((word) => el('span', { class: classes }, Engine.glyphsOf(word).map(glyphNode)));
    return el(
      'span',
      { class: 'lang-text glyph-text script-' + currentScript + ' ' + (extraClass || ''), role: 'img', 'aria-label': 'Texto en símbolos' },
      words
    );
  }

  // Palabras de la lengua. Si el ajuste está activado, se resaltan al pasar el ratón o al tocarlas.
  function languageText(text, extraClass) {
    if (currentScript) return glyphText(text, extraClass);
    const words = Engine.tokenize(text);
    const children = [];
    words.forEach((word, i) => {
      if (i > 0) children.push(' ');
      children.push(el('span', { class: 'lang-word', 'data-word': word, text: word }));
    });
    return el('span', { class: 'lang-text ' + (extraClass || '') }, children);
  }

  // Activa o desactiva el resaltado. Se guarda como preferencia para todos los niveles.
  function setHighlightSetting(on) {
    settings.highlight = on;
    writeJSON(SETTINGS_KEY, settings);
    pinnedWord = null;
    setHighlight(null);
    document.body.classList.toggle('highlight-on', on);
    document.querySelectorAll('.highlight-switch').forEach((input) => {
      input.checked = on;
    });
  }

  // Interruptor visible en cada nivel.
  function highlightToggle(id) {
    const input = el('input', {
      id,
      type: 'checkbox',
      class: 'switch highlight-switch',
      onchange: (event) => setHighlightSetting(event.target.checked),
    });
    input.checked = settings.highlight;
    return el('label', { class: 'highlight-toggle', for: id, title: 'Marca todas las apariciones de la palabra que señalas' }, [
      el('span', { text: 'Resaltar iguales' }),
      input,
    ]);
  }

  function setHighlight(word) {
    document.querySelectorAll('.lang-word.highlight').forEach((n) => n.classList.remove('highlight'));
    if (!word || !settings.highlight) return;
    document.querySelectorAll('.lang-word').forEach((n) => {
      if (n.dataset.word === word) n.classList.add('highlight');
    });
  }

  app.addEventListener('mouseover', (event) => {
    if (!settings.highlight) return;
    const target = event.target.closest('.lang-word');
    if (target) setHighlight(target.dataset.word);
  });
  app.addEventListener('mouseout', (event) => {
    if (settings.highlight && event.target.closest('.lang-word')) setHighlight(pinnedWord);
  });
  app.addEventListener('click', (event) => {
    if (!settings.highlight) return;
    const target = event.target.closest('.lang-word');
    if (!target) return;
    pinnedWord = pinnedWord === target.dataset.word ? null : target.dataset.word;
    setHighlight(pinnedWord);
  });

  // Frase analizada palabra a palabra: forma con guiones encima y glosa debajo.
  function interlinear(words, translation, label) {
    return el('figure', { class: 'interlinear' }, [
      label ? el('figcaption', { class: 'eyebrow', text: label }) : null,
      el(
        'div',
        { class: 'gloss-row' },
        words.map(([form, gloss]) =>
          el('span', { class: 'gloss-word' }, [
            el('span', { class: 'gloss-form', text: form }),
            el('span', { class: 'gloss-meaning', text: gloss }),
          ])
        )
      ),
      el('p', { class: 'gloss-translation', text: '«' + translation + '»' }),
    ]);
  }

  // ---------- Pantalla de inicio ----------

  function renderDailyCard() {
    const number = Engine.dayNumber(new Date());
    const puzzle = Engine.dailyPuzzle(number, DAILY_PUZZLES);
    const state = loadState(puzzle, dailyKey(number));
    const finished = Engine.isFinished(state);
    const started = state.challenges.some((c) => c.attempts.length > 0);
    const streak = Engine.currentStreak(loadStats(), number);
    return el('a', { class: 'daily-card', href: '#hoy' }, [
      el('span', { class: 'daily-info' }, [
        el('span', { class: 'eyebrow' }, [svgIcon(ICONS.calendar, 'small'), document.createTextNode(' Reto diario · Descifra #' + number)]),
        el('span', { class: 'daily-title', text: puzzle.title }),
        el('span', {
          class: 'daily-meta',
          text: finished
            ? 'Hecho: ' + starsText(Engine.computeStars(state)) + '. El siguiente llega a medianoche.'
            : DAILY_LABELS[Engine.dailyDifficulty(number) - 1] + ' · ' + puzzle.challenges.length + ' retos',
        }),
        streak > 0 ? el('span', { class: 'daily-meta', text: 'Racha: ' + streak + (streak === 1 ? ' día' : ' días') }) : null,
      ]),
      el('span', { class: 'daily-cta', text: finished ? 'Ver' : started ? 'Continuar' : 'Jugar' }),
    ]);
  }

  function categoryCard(c) {
    const levels = levelsIn(c.id);
    const progress = levels.map(levelProgress);
    const done = progress.filter((p) => p.finished).length;
    const stars = progress.reduce((sum, p) => sum + p.stars, 0);
    return el('li', {}, [
      el('a', { class: 'category-card', href: '#cat-' + c.id, style: catStyle(c.id) }, [
        el('span', { class: 'category-head' }, [
          svgIcon(c.icon, 'badge'),
          el('span', { class: 'category-count', text: done + '/' + levels.length }),
        ]),
        el('span', { class: 'category-title', text: c.title }),
        el('span', { class: 'category-description', text: c.description }),
        el('span', { class: 'progress', role: 'img', 'aria-label': done + ' de ' + levels.length + ' niveles completados' }, [
          el('span', { class: 'progress-bar', style: 'width: ' + Math.round((done / levels.length) * 100) + '%' }),
        ]),
        el('span', { class: 'category-stars', text: '★ ' + stars + ' / ' + levels.length * 3 }),
      ]),
    ]);
  }

  function renderHome() {
    homeButton.hidden = true;
    const all = PUZZLES.map(levelProgress);
    const done = all.filter((p) => p.finished).length;
    const stars = all.reduce((sum, p) => sum + p.stars, 0);

    app.replaceChildren(
      el('section', { class: 'hero' }, [
        el('div', { class: 'hero-text' }, [
          el('h2', { class: 'hero-title', text: 'Descifra lenguas que nunca has visto' }),
          el('p', {
            class: 'lead',
            text:
              'Cada nivel es una lengua o una escritura desconocida. Compara los ejemplos, deduce las reglas y demuéstralo traduciendo. ' +
              'Todas están inspiradas en lenguas reales.',
          }),
          el('p', { class: 'hero-stats' }, [
            el('span', {}, [el('strong', { text: String(done) }), document.createTextNode(' de ' + PUZZLES.length + ' niveles')]),
            el('span', {}, [el('strong', { text: String(stars) }), document.createTextNode(' de ' + PUZZLES.length * 3 + ' estrellas')]),
          ]),
        ]),
        renderDailyCard(),
      ]),
      el('h2', { class: 'section-title', text: 'Categorías' }),
      el('ul', { class: 'category-grid' }, CATEGORIES.map(categoryCard)),
      el('a', { class: 'learn-banner', href: '#aprende' }, [
        svgIcon(ICONS.book, 'badge'),
        el('span', { class: 'learn-banner-text' }, [
          el('span', { class: 'category-title', text: 'Aprende cómo funcionan las lenguas del mundo' }),
          el('span', {
            class: 'category-description',
            text: ARTICLES.length + ' temas con ejemplos reales: ergatividad, tonos, clasificadores, escrituras…',
          }),
        ]),
        svgIcon(ICONS.next),
      ]),
      el('details', { class: 'how-to' }, [
        el('summary', { text: 'Cómo se juega' }),
        el('ul', {}, [
          el('li', { text: 'Compara las frases de ejemplo con sus traducciones y busca qué se repite.' }),
          el('li', { text: 'Anota en el cuaderno lo que crees que significa cada palabra o símbolo.' }),
          el('li', { text: 'En cada reto, pulsa las fichas en orden para formar la respuesta y comprueba.' }),
          el('li', { text: 'Verde: ficha correcta en su sitio. Amarillo: la ficha va, pero en otro sitio. Gris: no va.' }),
          el('li', { text: 'Las piezas como «ni-» se unen a lo que va detrás, y las como «-ne», a lo que va delante.' }),
          el('li', { text: 'Los fallos y las pistas restan estrellas. Si agotas los intentos de un reto, el nivel acaba sin estrellas.' }),
          el('li', { text: 'Con el interruptor «Resaltar iguales» de cada nivel, al señalar una palabra se marcan todas sus apariciones.' }),
        ]),
      ])
    );
  }

  function levelCard(puzzle, index) {
    const p = levelProgress(puzzle);
    return el('li', {}, [
      el('a', { class: 'level-card' + (p.finished ? ' done' : ''), href: '#' + puzzle.id, style: catStyle(puzzle.category) }, [
        el('span', { class: 'level-number', text: String(index + 1) }),
        el('span', { class: 'level-info' }, [
          el('span', { class: 'level-title', text: puzzle.title }),
          el('span', { class: 'level-meta' }, [
            difficultyDots(puzzle.difficulty),
            el('span', { text: puzzle.script ? 'Escritura' : 'Lengua: ' + puzzle.language }),
          ]),
        ]),
        p.finished
          ? el('span', { class: 'level-stars', text: starsText(p.stars) })
          : el('span', { class: 'level-status', text: p.started ? 'En curso' : 'Nuevo' }),
      ]),
    ]);
  }

  function renderCategory(c) {
    homeButton.hidden = false;
    const levels = levelsIn(c.id);
    const nextUp = levels.find((p) => !levelProgress(p).finished);
    app.replaceChildren(
      el('section', { class: 'category-page', style: catStyle(c.id) }, [
        el('div', { class: 'category-hero' }, [
          svgIcon(c.icon, 'badge large'),
          el('div', {}, [
            el('p', { class: 'eyebrow', text: 'Categoría' }),
            el('h2', { class: 'page-title', text: c.title }),
            el('p', { class: 'lead', text: c.description }),
          ]),
        ]),
        nextUp
          ? el('a', { class: 'continue-link', href: '#' + nextUp.id }, [
              document.createTextNode('Siguiente: ' + nextUp.title),
              svgIcon(ICONS.next, 'small'),
            ])
          : el('p', { class: 'muted', text: 'Has completado todos los niveles de esta categoría.' }),
        el('ol', { class: 'level-list' }, levels.map(levelCard)),
      ])
    );
  }

  // ---------- Aprende ----------

  function levelsForTopic(id) {
    return PUZZLES.filter((p) => (p.topics || []).includes(id));
  }

  function renderLearnIndex() {
    homeButton.hidden = false;
    app.replaceChildren(
      el('section', { class: 'learn' }, [
        el('p', { class: 'eyebrow', text: 'Aprende' }),
        el('h2', { class: 'page-title', text: 'Cómo funcionan las lenguas del mundo' }),
        el('p', {
          class: 'lead',
          text:
            'Las lenguas y escrituras del juego están inspiradas en otras reales. Aquí tienes los fenómenos que aparecen en los niveles, ' +
            'explicados con ejemplos de lenguas que se hablan o se hablaron.',
        }),
        el(
          'ul',
          { class: 'article-list' },
          ARTICLES.map((a) => {
            const levels = levelsForTopic(a.id);
            return el('li', {}, [
              el('a', { class: 'article-card', href: '#aprende-' + a.id }, [
                el('span', { class: 'level-title', text: a.title }),
                el('span', { class: 'article-summary', text: a.summary }),
                el('span', {
                  class: 'level-meta',
                  text:
                    a.languages.slice(0, 3).join(', ') +
                    (levels.length ? ' · ' + levels.length + (levels.length === 1 ? ' nivel' : ' niveles') : ''),
                }),
              ]),
            ]);
          })
        ),
      ])
    );
  }

  function renderArticle(a) {
    homeButton.hidden = false;
    const levels = levelsForTopic(a.id);
    const next = ARTICLES[ARTICLES.indexOf(a) + 1];
    app.replaceChildren(
      el('article', { class: 'learn-article', lang: 'es' }, [
        el('a', { class: 'back-link', href: '#aprende' }, [svgIcon(ICONS.back, 'small'), document.createTextNode('Todos los temas')]),
        el('h2', { class: 'page-title', text: a.title }),
        el('p', { class: 'lead', text: a.summary }),
        // Una sola columna centrada: texto, ejemplos uno debajo de otro y, al final, el resto.
        ...a.paragraphs.map((p) => el('p', { class: 'article-text', text: p })),
        el('h3', { class: 'section-title', text: 'Ejemplos' }),
        el(
          'div',
          { class: 'examples' },
          a.examples.map((ex) =>
            el('div', { class: 'example' }, [
              interlinear(ex.words, ex.translation, ex.language),
              ex.note ? el('p', { class: 'muted example-note', text: ex.note }) : null,
            ])
          )
        ),
        el('div', { class: 'article-footer' }, articleAside(a, levels, next)),
      ])
    );
  }

  function articleAside(a, levels, next) {
    return [
        el('h3', { class: 'section-title', text: 'Algunas lenguas que lo usan' }),
        el('p', { class: 'chips' }, a.languages.map((l) => el('span', { class: 'chip static', text: l }))),
        el('h3', { class: 'section-title', text: 'Para saber más' }),
        externalLinks(a.links),
        levels.length
          ? el('div', {}, [
              el('h3', { class: 'section-title', text: 'Practícalo en el juego' }),
              el(
                'ul',
                { class: 'level-list' },
                levels.map((p) =>
                  el('li', {}, [
                    el('a', { class: 'level-card', href: '#' + p.id, style: catStyle(p.category) }, [
                      svgIcon(category(p.category).icon, 'badge'),
                      el('span', { class: 'level-info' }, [
                        el('span', { class: 'level-title', text: p.title }),
                        el('span', { class: 'level-meta' }, [difficultyDots(p.difficulty), el('span', { text: category(p.category).title })]),
                      ]),
                    ]),
                  ])
                )
              ),
            ])
          : null,
        next
          ? el('a', { class: 'continue-link', href: '#aprende-' + next.id }, [
              document.createTextNode('Siguiente tema: ' + next.title),
              svgIcon(ICONS.next, 'small'),
            ])
          : null,
    ];
  }

  // ---------- Pantalla de juego ----------

  // Palabras del cuaderno; en las escrituras, cada glifo por separado.
  function notebookWords(puzzle) {
    const seen = [];
    const add = (text) =>
      Engine.tokenize(text)
        .flatMap((w) => (puzzle.script ? Engine.glyphsOf(w) : [w]))
        .forEach((w) => {
          if (!seen.includes(w)) seen.push(w);
        });
    puzzle.corpus.forEach((s) => add(s.text));
    puzzle.challenges.filter((c) => c.type === 'to-spanish').forEach((c) => add(c.prompt));
    return puzzle.script ? seen : seen.sort((a, b) => a.localeCompare(b, 'es'));
  }

  function renderCorpus(puzzle, state) {
    if (Engine.corpusRevealed(puzzle, state)) {
      return el('section', { class: 'panel corpus-panel' }, [
        el('div', { class: 'panel-header' }, [el('h2', { text: 'Ejemplos' }), highlightToggle('highlight-toggle')]),
        el(
          'ol',
          { class: 'corpus' },
          puzzle.corpus.map((s) => el('li', {}, [languageText(s.text), el('span', { class: 'translation', text: s.translation })]))
        ),
      ]);
    }
    const order = Engine.scrambledOrder(puzzle);
    return el('section', { class: 'panel corpus-panel' }, [
      el('div', { class: 'panel-header' }, [el('h2', { text: 'Ejemplos' }), highlightToggle('highlight-toggle')]),
      el('ol', { class: 'corpus' }, puzzle.corpus.map((s) => el('li', {}, [languageText(s.text)]))),
      el('h2', { class: 'subheading', text: 'Traducciones (desordenadas)' }),
      el(
        'ul',
        { class: 'scrambled' },
        order.map((corpusIndex, position) =>
          el('li', {}, [el('span', { class: 'letter', text: Engine.letter(position) }), el('span', { text: puzzle.corpus[corpusIndex].translation })])
        )
      ),
    ]);
  }

  function renderNotebook(puzzle, state) {
    const rows = notebookWords(puzzle).map((word, i) =>
      el('label', { class: 'notebook-row' }, [
        languageText(word),
        el('input', {
          id: 'note-' + i,
          type: 'text',
          value: state.notebook[word] || '',
          placeholder: '¿?',
          autocomplete: 'off',
          oninput: (event) => {
            state.notebook[word] = event.target.value;
            saveState(state);
          },
        }),
      ])
    );
    const notes = el('textarea', {
      id: 'free-notes',
      class: 'free-notes',
      rows: '3',
      placeholder: 'Hipótesis, piezas que se repiten, reglas que sospechas…',
      oninput: (event) => {
        state.notes = event.target.value;
        saveState(state);
      },
    });
    notes.value = state.notes || '';
    return el('section', { class: 'panel notebook-panel' }, [
      el('h2', { text: 'Cuaderno' }),
      el('p', { class: 'muted', text: 'Tus notas. No cuentan para la puntuación.' }),
      el('div', { class: 'notebook' }, rows),
      el('label', { class: 'muted notes-label', for: 'free-notes', text: 'Notas libres' }),
      notes,
    ]);
  }

  function renderHints(puzzle, state, rerender) {
    const wordsLeft = Object.keys(puzzle.glossary).length - state.revealedWords.length;
    const rulesLeft = puzzle.rules.length - state.revealedRules;
    const use = (kind) => {
      Engine.useHint(puzzle, state, kind);
      saveState(state);
      rerender();
    };
    const revealed = el('ul', { class: 'hint-list' }, [
      ...state.revealedWords.map((m) => el('li', {}, [languageText(m), document.createTextNode(' = ' + puzzle.glossary[m])])),
      ...puzzle.rules.slice(0, state.revealedRules).map((r) => el('li', { text: r })),
    ]);
    return el('section', { class: 'panel hints-panel' }, [
      el('h2', { text: 'Pistas' }),
      el('p', { class: 'muted', text: 'Cada pista cuenta como un fallo al calcular las estrellas.' }),
      el('div', { class: 'button-row' }, [
        el('button', {
          type: 'button',
          class: 'secondary',
          disabled: wordsLeft === 0,
          onclick: () => use('word'),
          text: 'Revelar una pieza (' + wordsLeft + ')',
        }),
        el('button', {
          type: 'button',
          class: 'secondary',
          disabled: rulesLeft === 0,
          onclick: () => use('rule'),
          text: 'Revelar una regla (' + rulesLeft + ')',
        }),
      ]),
      state.revealedWords.length || state.revealedRules ? revealed : null,
    ]);
  }

  // Al terminar: el significado de cada pieza, las reglas y el análisis de las frases.
  function renderDictionary(puzzle) {
    const analysed = puzzle.corpus.filter((s) => s.segmented);
    return el('section', { class: 'panel dictionary-panel' }, [
      el('h2', { text: puzzle.script ? 'Clave de la escritura' : 'Diccionario del ' + puzzle.language }),
      el(
        'dl',
        { class: 'dictionary' },
        Object.entries(puzzle.glossary).flatMap(([morpheme, meaning]) => [el('dt', {}, [languageText(morpheme)]), el('dd', { text: meaning })])
      ),
      el('ul', { class: 'hint-list' }, puzzle.rules.map((r) => el('li', { text: r }))),
      analysed.length
        ? el('div', { class: 'analysis' }, [
            el('h2', { class: 'subheading', text: 'Análisis de las frases' }),
            ...analysed.map((s) =>
              interlinear(
                Engine.glossSentence(s.segmented, puzzle.glossary).map((w) => [w.form, w.gloss]),
                s.translation
              )
            ),
          ])
        : null,
    ]);
  }

  // En qué lenguas reales se inspira el nivel. Antes de terminar va plegado porque da pistas.
  function renderInspiration(puzzle, finished) {
    if (!puzzle.inspiration) return null;
    const body = [el('p', { text: puzzle.inspiration.text }), externalLinks(puzzle.inspiration.links)];
    if (puzzle.topics && puzzle.topics.length) {
      body.push(
        el(
          'p',
          { class: 'topic-links' },
          [el('span', { class: 'muted', text: 'En Aprende: ' })].concat(
            puzzle.topics.map((id) => el('a', { class: 'chip', href: '#aprende-' + id, text: article(id).title }))
          )
        )
      );
    }
    return el('details', { class: 'inspiration', open: finished }, [
      el('summary', { text: finished ? '¿En qué se inspira este nivel?' : '¿En qué se inspira este nivel? (da pistas)' }),
      ...body,
    ]);
  }

  // Contenido de una ficha: texto, o el dibujo del glifo.
  function tileAttrs(word, glyph, extra) {
    const attrs = Object.assign({}, extra);
    if (glyph) {
      attrs.html = Scripts.glyphSvg(currentScript, word);
      attrs['aria-label'] = 'símbolo';
      attrs.class = (attrs.class || 'tile') + ' glyph-tile';
    } else {
      attrs.text = word;
    }
    return attrs;
  }

  function tileRow(words, feedback, glyph, animate) {
    return el(
      'div',
      { class: 'tile-row' + (animate ? ' reveal' : '') },
      words.map((w, i) => el('span', tileAttrs(w, glyph, { class: 'tile ' + (feedback ? feedback[i] : ''), style: '--i: ' + i })))
    );
  }

  function lengthNote(hint) {
    if (!hint) return null;
    return el('p', { class: 'length-hint', text: hint === 'short' ? 'Faltan piezas.' : 'Sobran piezas.' });
  }

  function challengeLabel(puzzle, challenge, index) {
    const prefix = 'Reto ' + (index + 1) + ' · ';
    switch (challenge.type) {
      case 'match':
        return prefix + 'Empareja cada frase con su traducción';
      case 'choice':
        return prefix + 'Pregunta';
      case 'to-spanish':
        return prefix + (puzzle.script ? 'Lee la inscripción' : 'Traduce al español');
      default:
        if (puzzle.script) return prefix + 'Escríbelo con símbolos';
        return prefix + 'Traduce al ' + puzzle.language + (challenge.morphemes ? ' pieza a pieza' : '');
    }
  }

  function submitButton(puzzle, state, index, guess, enabled, rerender) {
    return el('button', {
      type: 'button',
      class: 'primary',
      disabled: !enabled,
      onclick: () => {
        Engine.submitAttempt(puzzle, state, index, guess());
        selections[index] = undefined;
        justChecked = index;
        saveState(state);
        if (Engine.isFinished(state) && current.daily) {
          writeJSON(STATS_KEY, Engine.updateStats(loadStats(), current.daily, Engine.computeStars(state)));
        }
        rerender();
        justChecked = null;
        if (Engine.isFinished(state)) showResult(puzzle, state);
      },
      text: 'Comprobar',
    });
  }

  function renderTileChallenge(puzzle, state, index, rerender) {
    const challenge = puzzle.challenges[index];
    const progress = state.challenges[index];
    const tiles = Engine.buildTiles(puzzle, index);
    const selected = selections[index] || (selections[index] = []);
    const toSpanish = challenge.type === 'to-spanish';
    const glyph = Boolean(challenge.glyphs);
    const free = Boolean(challenge.morphemes || glyph);
    const reading = (pieces) =>
      glyph
        ? el('div', { class: 'reads-as' }, [document.createTextNode('Se escribe: '), languageText(Engine.readAs(challenge, pieces))])
        : el('p', { class: 'reads-as', text: 'Se lee: ' + Engine.readAs(challenge, pieces) });

    const prompt = el('p', { class: 'prompt' }, [
      toSpanish ? languageText(challenge.prompt, 'big') : el('span', { class: 'big', text: '«' + challenge.prompt + '»' }),
    ]);
    const last = progress.attempts.length - 1;
    const history = el(
      'div',
      { class: 'history' },
      progress.attempts.map((a, n) =>
        el('div', { class: 'attempt' }, [
          tileRow(a.guess, a.feedback, glyph, justChecked === index && n === last),
          free ? reading(a.guess) : null,
          lengthNote(a.lengthHint),
        ])
      )
    );
    const body = [prompt, history];

    if (progress.status === 'playing') {
      const chosen = selected.map((tileIndex, pos) =>
        el(
          'button',
          tileAttrs(tiles[tileIndex], glyph, {
            type: 'button',
            class: 'tile chosen',
            title: 'Quitar',
            onclick: () => {
              selected.splice(pos, 1);
              rerender();
            },
          })
        )
      );
      let answerRow;
      let full;
      if (free) {
        // Con piezas o símbolos, la longitud de la respuesta forma parte del puzzle.
        answerRow = el(
          'div',
          { class: 'tile-row answer-row free', 'aria-label': 'Tu respuesta' },
          chosen.length
            ? chosen
            : [el('span', { class: 'placeholder', text: glyph ? 'Pulsa los símbolos en orden de lectura…' : 'Pulsa las piezas en orden…' })]
        );
        full = false;
      } else {
        // Un hueco por palabra de la respuesta, como las casillas de Wordle.
        const slots = challenge.answer.map((_, pos) => chosen[pos] || el('span', { class: 'tile slot', 'aria-hidden': 'true' }));
        answerRow = el('div', { class: 'tile-row answer-row', 'aria-label': 'Tu respuesta' }, slots);
        full = selected.length === challenge.answer.length;
      }
      const pool = el(
        'div',
        { class: 'tile-row pool' },
        tiles.map((word, tileIndex) =>
          el(
            'button',
            tileAttrs(word, glyph, {
              type: 'button',
              class: 'tile',
              disabled: selected.includes(tileIndex) || full,
              onclick: () => {
                selected.push(tileIndex);
                rerender();
              },
            })
          )
        )
      );
      const actions = el('div', { class: 'button-row' }, [
        el('button', {
          type: 'button',
          class: 'secondary',
          disabled: selected.length === 0,
          onclick: () => {
            selected.length = 0;
            rerender();
          },
          text: 'Borrar',
        }),
        submitButton(puzzle, state, index, () => selected.map((i) => tiles[i]), free ? selected.length > 0 : full, rerender),
      ]);
      body.push(answerRow, free && selected.length ? reading(selected.map((i) => tiles[i])) : null, pool, actions);
    } else if (progress.status === 'failed') {
      const answer = challenge.answer;
      body.push(
        el('p', { class: 'solution' }, [
          document.createTextNode('Solución: '),
          toSpanish ? el('strong', { text: answer.join(' ') }) : languageText(Engine.readAs(challenge, answer)),
          challenge.morphemes ? el('span', { class: 'muted', text: ' (' + answer.join(' ') + ')' }) : null,
        ])
      );
    }
    return body;
  }

  function renderMatchChallenge(puzzle, state, index, rerender) {
    const progress = state.challenges[index];
    const letters = puzzle.corpus.map((_, i) => Engine.letter(i));
    // Tras un intento fallido, se parte de las letras elegidas la última vez.
    const last = progress.attempts[progress.attempts.length - 1];
    const selected = selections[index] || (selections[index] = last ? last.guess.slice() : puzzle.corpus.map(() => ''));

    const history = el(
      'div',
      { class: 'history' },
      progress.attempts.map((a, n) =>
        tileRow(
          a.guess.map((l, i) => i + 1 + l),
          a.feedback,
          false,
          justChecked === index && n === progress.attempts.length - 1
        )
      )
    );
    const body = [
      el('p', { class: 'muted', text: 'Elige la letra de la traducción de cada frase. Tras comprobar, verás qué parejas están bien.' }),
      history,
    ];

    if (progress.status === 'playing') {
      const rows = puzzle.corpus.map((s, i) => {
        const id = 'match-' + i;
        const select = el(
          'select',
          {
            id,
            class: 'match-select',
            onchange: (event) => {
              selected[i] = event.target.value;
              rerender();
            },
          },
          [el('option', { value: '', text: '—' }), ...letters.map((l) => el('option', { value: l, text: l }))]
        );
        select.value = selected[i];
        return el('div', { class: 'match-row' }, [
          el('label', { class: 'match-label', for: id }, [el('span', { class: 'match-number', text: i + 1 + '.' }), languageText(s.text)]),
          select,
        ]);
      });
      body.push(
        el('div', { class: 'match-rows' }, rows),
        el('div', { class: 'button-row' }, [submitButton(puzzle, state, index, () => selected.slice(), selected.every(Boolean), rerender)])
      );
    } else if (progress.status === 'failed') {
      const answer = Engine.challengeAnswer(puzzle, index);
      body.push(
        el('p', {
          class: 'solution',
          text: 'Solución: ' + answer.map((l, i) => i + 1 + l).join(' · ') + '. Las traducciones ya aparecen en su sitio.',
        })
      );
    }
    return body;
  }

  function renderChoiceChallenge(puzzle, state, index, rerender) {
    const challenge = puzzle.challenges[index];
    const progress = state.challenges[index];
    const selected = selections[index] || (selections[index] = []);
    const tried = progress.attempts.map((a) => a.guess[0]);
    const done = progress.status !== 'playing';

    // Las opciones se muestran barajadas; cada botón conserva su índice original.
    const options = Engine.optionOrder(puzzle, index).map((i) => {
      const option = challenge.options[i];
      const value = String(i);
      let mark = '';
      if (done && i === challenge.correct) mark = 'correct';
      else if (tried.includes(value)) mark = 'absent';
      else if (selected[0] === value) mark = 'selected';
      return el(
        'button',
        {
          type: 'button',
          class: 'option ' + mark,
          disabled: done || tried.includes(value),
          'aria-pressed': selected[0] === value ? 'true' : 'false',
          onclick: () => {
            selections[index] = [value];
            rerender();
          },
        },
        [challenge.optionsLanguage ? languageText(option) : document.createTextNode(option)]
      );
    });

    const body = [
      el('p', { class: 'prompt question', text: challenge.prompt }),
      challenge.display ? el('p', { class: 'prompt' }, [languageText(challenge.display, 'big')]) : null,
      el('div', { class: 'options' }, options),
    ];
    if (!done) {
      body.push(el('div', { class: 'button-row' }, [submitButton(puzzle, state, index, () => selected.slice(), selected.length === 1, rerender)]));
    }
    return body;
  }

  function renderChallenge(puzzle, state, index, rerender) {
    const challenge = puzzle.challenges[index];
    const progress = state.challenges[index];
    const locked = Engine.isLocked(puzzle, state, index);
    const max = Engine.maxAttempts(challenge);

    const header = el('div', { class: 'challenge-header' }, [
      el('span', { class: 'challenge-label', text: challengeLabel(puzzle, challenge, index) }),
      el('span', {
        class: 'challenge-status ' + progress.status,
        text: locked
          ? 'Bloqueado'
          : progress.status === 'solved'
          ? 'Resuelto'
          : progress.status === 'failed'
          ? 'Sin intentos'
          : 'Intentos: ' + progress.attempts.length + '/' + max,
      }),
    ]);

    let body;
    if (locked) {
      body = [el('p', { class: 'muted', text: 'Empareja primero las frases con sus traducciones para desbloquear este reto.' })];
    } else if (challenge.type === 'match') {
      body = renderMatchChallenge(puzzle, state, index, rerender);
    } else if (challenge.type === 'choice') {
      body = renderChoiceChallenge(puzzle, state, index, rerender);
    } else {
      body = renderTileChallenge(puzzle, state, index, rerender);
    }
    return el('section', { class: 'panel challenge ' + progress.status + (locked ? ' locked' : '') }, [header, ...body]);
  }

  function renderPuzzle(game) {
    homeButton.hidden = false;
    current = game;
    const puzzle = game.puzzle;
    currentScript = puzzle.script || null;
    const state = loadState(puzzle, game.key);
    const cat = puzzle.category ? category(puzzle.category) : null;
    const position = cat ? levelsIn(cat.id).indexOf(puzzle) + 1 : 0;
    let confirmingReset = false;

    const eyebrow = game.daily
      ? el('p', { class: 'eyebrow', text: 'Reto diario · Descifra #' + game.daily + ' · ' + DAILY_LABELS[Engine.dailyDifficulty(game.daily) - 1] })
      : el('p', { class: 'eyebrow puzzle-eyebrow' }, [
          el('a', { class: 'chip', href: '#cat-' + cat.id }, [svgIcon(cat.icon, 'small'), document.createTextNode(' ' + cat.title)]),
          el('span', { text: 'Nivel ' + position + ' de ' + levelsIn(cat.id).length }),
          difficultyDots(puzzle.difficulty),
        ]);

    // Confirmación dentro de la página (no se usa confirm() del navegador).
    // El reto diario no se puede reiniciar: hay un solo intento al día.
    function resetControls() {
      if (game.daily) return [];
      if (!confirmingReset) {
        return [
          el('button', {
            type: 'button',
            class: 'link-button',
            onclick: () => {
              confirmingReset = true;
              rerender();
            },
            text: 'Reiniciar nivel',
          }),
        ];
      }
      return [
        el('p', { class: 'confirm-text', text: '¿Borrar tu progreso y tus notas de este nivel?' }),
        el('button', {
          type: 'button',
          class: 'secondary',
          onclick: () => {
            confirmingReset = false;
            rerender();
          },
          text: 'Cancelar',
        }),
        el('button', {
          type: 'button',
          class: 'primary',
          onclick: () => {
            clearKey(game.key);
            selections = {};
            renderPuzzle(game);
          },
          text: 'Sí, reiniciar',
        }),
      ];
    }

    function rerender() {
      const scroll = window.scrollY;
      const finished = Engine.isFinished(state);
      app.replaceChildren(
        el('section', { class: 'puzzle', style: cat ? catStyle(cat.id) : null }, [
          el('div', { class: 'puzzle-header' }, [
            eyebrow,
            el('h2', { class: 'page-title', text: puzzle.title }),
            el('p', { class: 'lead', text: puzzle.intro }),
            renderInspiration(puzzle, finished),
          ]),
          el('div', { class: 'columns' }, [
            el('div', { class: 'column' }, [
              renderCorpus(puzzle, state),
              finished ? renderDictionary(puzzle) : renderHints(puzzle, state, rerender),
              renderNotebook(puzzle, state),
            ]),
            el(
              'div',
              { class: 'column' },
              puzzle.challenges
                .map((_, i) => renderChallenge(puzzle, state, i, rerender))
                .concat(
                  el('div', { class: 'button-row end puzzle-actions' }, [
                    finished && !confirmingReset
                      ? el('button', { type: 'button', class: 'primary', onclick: () => showResult(puzzle, state), text: 'Ver resultado' })
                      : null,
                    ...resetControls(),
                  ])
                )
            ),
          ]),
        ])
      );
      setHighlight(pinnedWord);
      window.scrollTo(0, scroll);
    }

    rerender();
  }

  // ---------- Resultados ----------

  function formatCountdown(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const pad = (n) => String(n).padStart(2, '0');
    return pad(Math.floor(total / 3600)) + ':' + pad(Math.floor((total % 3600) / 60)) + ':' + pad(total % 60);
  }

  function statBox(value, label) {
    return el('div', { class: 'stat' }, [el('span', { class: 'stat-value', text: String(value) }), el('span', { class: 'stat-label', text: label })]);
  }

  function learnButton(puzzle) {
    if (!puzzle.topics || !puzzle.topics.length) return null;
    return el('button', {
      type: 'button',
      class: 'link-button',
      onclick: () => {
        dialog.close();
        location.hash = 'aprende-' + puzzle.topics[0];
      },
      text: 'Aprende: ' + article(puzzle.topics[0]).title + ' →',
    });
  }

  function showDailyResult(puzzle, state) {
    const number = current.daily;
    const stars = Engine.computeStars(state);
    const stats = loadStats();
    const share = Engine.shareText(number, state);
    const feedback = el('p', { class: 'muted copy-feedback', 'aria-live': 'polite' });
    const shareBox = el('textarea', { id: 'share-text', class: 'share-text', readonly: true, rows: String(share.split('\n').length) });
    shareBox.value = share;
    const countdown = el('span', { class: 'countdown', text: formatCountdown(Engine.msUntilNextDay(new Date())) });

    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      countdown.textContent = formatCountdown(Engine.msUntilNextDay(new Date()));
    }, 1000);

    dialog.querySelector('.dialog-body').replaceChildren(
      el('p', { class: 'eyebrow', text: 'Descifra #' + number }),
      el('h2', { text: stars > 0 ? 'Has descifrado ' + subject(puzzle) : 'Se te ha resistido ' + subject(puzzle) }),
      el('p', { class: 'result-stars', 'aria-label': stars + ' de 3 estrellas', text: starsText(stars) }),
      el('div', { class: 'stats' }, [
        statBox(stats.played, 'Jugados'),
        statBox(stats.solved, 'Descifrados'),
        statBox(Engine.currentStreak(stats, number), 'Racha'),
        statBox(stats.maxStreak, 'Mejor racha'),
      ]),
      el('label', { class: 'muted', for: 'share-text', text: 'Tu resultado, sin destripar la solución:' }),
      shareBox,
      feedback,
      el('p', { class: 'next-daily' }, [document.createTextNode('Siguiente reto en '), countdown]),
      learnButton(puzzle),
      el('div', { class: 'button-row end' }, [
        el('button', { type: 'button', class: 'secondary', onclick: () => dialog.close(), text: 'Cerrar' }),
        el('button', {
          type: 'button',
          class: 'primary',
          onclick: () => {
            const fallback = () => {
              shareBox.focus();
              shareBox.select();
              feedback.textContent = 'Texto seleccionado: cópialo para compartirlo.';
            };
            try {
              navigator.clipboard.writeText(share).then(() => {
                feedback.textContent = 'Resultado copiado.';
              }, fallback);
            } catch (e) {
              fallback();
            }
          },
          text: 'Copiar resultado',
        }),
      ])
    );
    dialog.showModal();
  }

  function showResult(puzzle, state) {
    if (current.daily) {
      showDailyResult(puzzle, state);
      return;
    }
    const stars = Engine.computeStars(state);
    const levels = levelsIn(puzzle.category);
    const next = levels[levels.indexOf(puzzle) + 1];
    const solved = state.challenges.filter((c) => c.status === 'solved').length;
    const message =
      stars === 3
        ? '¡Perfecto! Has descifrado ' + subject(puzzle) + ' sin ayuda.'
        : stars > 0
        ? 'Has descifrado ' + subject(puzzle) + '.'
        : 'Has resuelto ' + solved + ' de ' + puzzle.challenges.length + ' retos. Puedes reiniciar el nivel y volver a intentarlo.';

    dialog.querySelector('.dialog-body').replaceChildren(
      el('h2', { text: puzzle.title }),
      el('p', { class: 'result-stars', 'aria-label': stars + ' de 3 estrellas', text: starsText(stars) }),
      el('p', { text: message }),
      el('p', {
        class: 'muted',
        text: 'Pistas usadas: ' + Engine.hintsUsed(state) + '. Ahora puedes ver la solución completa y en qué lenguas reales se inspira el nivel.',
      }),
      learnButton(puzzle),
      el('div', { class: 'button-row end' }, [
        el('button', { type: 'button', class: 'secondary', onclick: () => dialog.close(), text: 'Cerrar' }),
        el('button', {
          type: 'button',
          class: 'primary',
          onclick: () => {
            dialog.close();
            location.hash = next ? next.id : 'cat-' + puzzle.category;
          },
          text: next ? 'Siguiente nivel' : 'Volver a la categoría',
        }),
      ])
    );
    dialog.showModal();
  }

  // ---------- Ajustes ----------

  function renderSettings() {
    let confirming = false;
    const body = settingsDialog.querySelector('.dialog-body');

    function draw() {
      const toggle = el('input', {
        id: 'setting-highlight',
        type: 'checkbox',
        class: 'switch highlight-switch',
        onchange: (event) => setHighlightSetting(event.target.checked),
      });
      toggle.checked = settings.highlight;
      body.replaceChildren(
        el('h2', { text: 'Ajustes' }),
        el('div', { class: 'setting' }, [
          el('label', { for: 'setting-highlight', class: 'setting-label' }, [
            el('span', { class: 'setting-title', text: 'Resaltar palabras iguales' }),
            el('span', {
              class: 'muted',
              text:
                'Al pasar el ratón o tocar una palabra o un símbolo, se marcan todas sus apariciones. También puedes cambiarlo con el interruptor de cada nivel.',
            }),
          ]),
          toggle,
        ]),
        el('div', { class: 'setting danger' }, [
          el('span', { class: 'setting-label' }, [
            el('span', { class: 'setting-title', text: 'Borrar todo el progreso' }),
            el('span', { class: 'muted', text: 'Borra estrellas, notas, rachas y estadísticas de este navegador.' }),
          ]),
          confirming
            ? el('span', { class: 'button-row' }, [
                el('button', { type: 'button', class: 'secondary', onclick: () => ((confirming = false), draw()), text: 'Cancelar' }),
                el('button', {
                  type: 'button',
                  class: 'primary danger',
                  onclick: () => {
                    clearAllProgress();
                    confirming = false;
                    settingsDialog.close();
                    route();
                  },
                  text: 'Sí, borrar',
                }),
              ])
            : el('button', { type: 'button', class: 'secondary', onclick: () => ((confirming = true), draw()), text: 'Borrar' }),
        ]),
        el('div', { class: 'button-row end' }, [
          el('button', { type: 'button', class: 'primary', onclick: () => settingsDialog.close(), text: 'Listo' }),
        ])
      );
    }

    draw();
    settingsDialog.showModal();
  }

  // ---------- Navegación ----------

  function route() {
    selections = {};
    pinnedWord = null;
    current = null;
    currentScript = null;
    if (dialog.open) dialog.close();
    const hash = location.hash.slice(1);
    if (hash === 'hoy') {
      const number = Engine.dayNumber(new Date());
      renderPuzzle({ puzzle: Engine.dailyPuzzle(number, DAILY_PUZZLES), key: dailyKey(number), daily: number });
    } else if (hash === 'aprende') {
      renderLearnIndex();
    } else if (hash.startsWith('aprende-') && article(hash.slice(8))) {
      renderArticle(article(hash.slice(8)));
    } else if (hash.startsWith('cat-') && category(hash.slice(4))) {
      renderCategory(category(hash.slice(4)));
    } else {
      const puzzle = PUZZLES.find((p) => p.id === hash);
      if (puzzle) renderPuzzle({ puzzle, key: puzzle.id, daily: null });
      else renderHome();
    }
    window.scrollTo(0, 0);
  }

  document.body.classList.toggle('highlight-on', settings.highlight);
  dialog.addEventListener('close', () => clearInterval(countdownTimer));
  homeButton.addEventListener('click', () => {
    location.hash = '';
  });
  settingsButton.addEventListener('click', renderSettings);
  window.addEventListener('hashchange', route);
  route();
})();
