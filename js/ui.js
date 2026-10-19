// Interfaz del juego: pantallas, fichas y guardado del progreso.
(function () {
  'use strict';

  const app = document.getElementById('app');
  const homeButton = document.getElementById('home-button');
  const dialog = document.getElementById('result-dialog');
  const STORAGE_PREFIX = 'descifra:v1:';
  const STATS_KEY = 'stats';

  const TIERS = [
    { id: 'iniciacion', title: 'Iniciación', description: 'Vocabulario, plurales, orden de palabras y tiempos.' },
    { id: 'intermedio', title: 'Intermedio', description: 'Varias reglas a la vez y fichas de piezas sueltas.' },
    { id: 'avanzado', title: 'Avanzado', description: 'Gramáticas sin equivalente en español.' },
    { id: 'olimpiada', title: 'Olimpiada', description: 'Traducciones desordenadas: primero hay que emparejarlas.' },
  ];

  // Selección en curso, por reto: índices de fichas, letras elegidas u opción marcada.
  let selections = {};
  let pinnedWord = null;
  // Partida abierta: { puzzle, key, daily (número del reto diario o null) }.
  let current = null;
  let countdownTimer = null;

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

  function clearState(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {
      // Ignorado a propósito.
    }
  }

  // ---------- Utilidades ----------

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else if (value !== false && value != null) node.setAttribute(key, value === true ? '' : value);
    });
    (children || []).forEach((child) => {
      if (child != null) node.append(child);
    });
    return node;
  }

  function starsText(stars) {
    return '★'.repeat(stars) + '☆'.repeat(3 - stars);
  }

  function article(id) {
    return ARTICLES.find((a) => a.id === id);
  }

  // Palabras de la lengua, resaltables al pasar el ratón o al tocarlas.
  function languageText(text, extraClass) {
    const words = Engine.tokenize(text);
    const children = [];
    words.forEach((word, i) => {
      if (i > 0) children.push(' ');
      children.push(el('span', { class: 'lang-word', 'data-word': word, text: word }));
    });
    return el('span', { class: 'lang-text ' + (extraClass || '') }, children);
  }

  function setHighlight(word) {
    document.querySelectorAll('.lang-word.highlight').forEach((n) => n.classList.remove('highlight'));
    if (!word) return;
    document.querySelectorAll('.lang-word').forEach((n) => {
      if (n.dataset.word === word) n.classList.add('highlight');
    });
  }

  app.addEventListener('mouseover', (event) => {
    const target = event.target.closest('.lang-word');
    if (target) setHighlight(target.dataset.word);
  });
  app.addEventListener('mouseout', (event) => {
    if (event.target.closest('.lang-word')) setHighlight(pinnedWord);
  });
  app.addEventListener('click', (event) => {
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

  function topicLinks(topics) {
    if (!topics || !topics.length) return null;
    return el('p', { class: 'topic-links' }, [
      el('span', { class: 'muted', text: 'Aprende más: ' }),
      ...topics.map((id) => el('a', { class: 'chip', href: '#aprende-' + id, text: article(id).title })),
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
    const status = finished
      ? el('span', { class: 'level-stars', text: starsText(Engine.computeStars(state)) })
      : el('span', { class: 'daily-cta', text: started ? 'Continuar' : 'Jugar' });
    return el('a', { class: 'level-card daily-card', href: '#hoy' }, [
      el('span', { class: 'level-info' }, [
        el('span', { class: 'eyebrow', text: 'Reto diario · Descifra #' + number }),
        el('span', { class: 'level-title', text: puzzle.title }),
        el('span', {
          class: 'level-lang',
          text: finished
            ? 'Hecho. El siguiente reto llega a medianoche.'
            : 'Lengua: ' + puzzle.language + ' · ' + puzzle.challenges.length + ' retos',
        }),
        streak > 0 ? el('span', { class: 'level-lang', text: 'Racha: ' + streak + (streak === 1 ? ' día' : ' días') }) : null,
      ]),
      status,
    ]);
  }

  function levelCard(puzzle) {
    const state = loadState(puzzle, puzzle.id);
    const finished = Engine.isFinished(state);
    const started = state.challenges.some((c) => c.attempts.length > 0);
    const status = finished
      ? el('span', { class: 'level-stars', text: starsText(Engine.computeStars(state)) })
      : el('span', { class: 'level-status', text: started ? 'En curso' : 'Nuevo' });
    return el('li', {}, [
      el('a', { class: 'level-card', href: '#' + puzzle.id }, [
        el('span', { class: 'level-number', text: String(PUZZLES.indexOf(puzzle) + 1) }),
        el('span', { class: 'level-info' }, [
          el('span', { class: 'level-title', text: puzzle.title }),
          el('span', { class: 'level-lang', text: 'Lengua: ' + puzzle.language }),
        ]),
        status,
      ]),
    ]);
  }

  function renderHome() {
    homeButton.hidden = true;
    const tiers = TIERS.map((tier) =>
      el('section', { class: 'tier' }, [
        el('h2', { class: 'section-title', text: tier.title }),
        el('p', { class: 'muted tier-description', text: tier.description }),
        el('ol', { class: 'level-list' }, PUZZLES.filter((p) => p.tier === tier.id).map(levelCard)),
      ])
    );

    app.replaceChildren(
      el('section', { class: 'home' }, [
        el('p', {
          class: 'lead',
          text:
            'Cada reto es una lengua desconocida. Compara las frases de ejemplo con su traducción, ' +
            'deduce el vocabulario y la gramática, y construye las traducciones con las fichas.',
        }),
        renderDailyCard(),
        ...tiers,
        el('a', { class: 'level-card learn-card', href: '#aprende' }, [
          el('span', { class: 'level-info' }, [
            el('span', { class: 'eyebrow', text: 'Aprende' }),
            el('span', { class: 'level-title', text: 'Cómo funcionan las lenguas del mundo' }),
            el('span', {
              class: 'level-lang',
              text: 'Ergatividad, clases nominales, evidencialidad… con ejemplos de euskera, suajili, quechua, turco y muchas más.',
            }),
          ]),
          el('span', { class: 'daily-cta secondary-cta', text: 'Leer' }),
        ]),
        el('details', { class: 'how-to' }, [
          el('summary', { text: 'Cómo se juega' }),
          el('ul', {}, [
            el('li', { text: 'Pasa el ratón (o toca) sobre una palabra para ver dónde más aparece.' }),
            el('li', { text: 'Anota en el cuaderno lo que crees que significa cada palabra.' }),
            el('li', { text: 'En cada reto, pulsa las fichas en orden para formar la respuesta y comprueba.' }),
            el('li', {
              text: 'Verde: ficha correcta en su sitio. Amarillo: la ficha va, pero en otro sitio. Gris: no va.',
            }),
            el('li', {
              text: 'En los niveles avanzados las fichas son piezas: «ni-» se une a lo que va detrás y «-ne» a lo que va delante.',
            }),
            el('li', {
              text: 'Los fallos y las pistas restan estrellas. Si agotas los intentos de un reto, el nivel acaba sin estrellas.',
            }),
          ]),
        ]),
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
        el('h2', { class: 'puzzle-title', text: 'Cómo funcionan las lenguas del mundo' }),
        el('p', {
          class: 'lead',
          text:
            'Las lenguas inventadas del juego están inspiradas en lenguas reales. Aquí tienes los fenómenos ' +
            'que aparecen en los niveles, explicados con ejemplos de lenguas que se hablan hoy.',
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
                  class: 'level-lang',
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
      el('article', { class: 'learn-article' }, [
        el('a', { class: 'link-button', href: '#aprende', text: '← Todos los temas' }),
        el('h2', { class: 'puzzle-title', text: a.title }),
        el('p', { class: 'lead', text: a.summary }),
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
        el('h3', { class: 'section-title', text: 'Algunas lenguas que lo usan' }),
        el('p', { class: 'chips' }, a.languages.map((l) => el('span', { class: 'chip static', text: l }))),
        levels.length
          ? el('div', {}, [
              el('h3', { class: 'section-title', text: 'Practícalo en el juego' }),
              el(
                'ul',
                { class: 'level-list' },
                levels.map((p) =>
                  el('li', {}, [
                    el('a', { class: 'level-card', href: '#' + p.id }, [
                      el('span', { class: 'level-number', text: String(PUZZLES.indexOf(p) + 1) }),
                      el('span', { class: 'level-info' }, [
                        el('span', { class: 'level-title', text: p.title }),
                        el('span', {
                          class: 'level-lang',
                          text: TIERS.find((t) => t.id === p.tier).title + ' · Lengua: ' + p.language,
                        }),
                      ]),
                    ]),
                  ])
                )
              ),
            ])
          : null,
        next ? el('a', { class: 'next-article', href: '#aprende-' + next.id, text: 'Siguiente tema: ' + next.title + ' →' }) : null,
      ])
    );
  }

  // ---------- Pantalla de juego ----------

  function notebookWords(puzzle) {
    const seen = [];
    const add = (text) =>
      Engine.tokenize(text).forEach((w) => {
        if (!seen.includes(w)) seen.push(w);
      });
    puzzle.corpus.forEach((s) => add(s.text));
    puzzle.challenges.filter((c) => c.type === 'to-spanish').forEach((c) => add(c.prompt));
    return seen.sort((a, b) => a.localeCompare(b, 'es'));
  }

  function renderCorpus(puzzle, state) {
    if (Engine.corpusRevealed(puzzle, state)) {
      return el('section', { class: 'panel corpus-panel' }, [
        el('h2', { text: 'Frases de ejemplo' }),
        el(
          'ol',
          { class: 'corpus' },
          puzzle.corpus.map((s) =>
            el('li', {}, [languageText(s.text), el('span', { class: 'translation', text: s.translation })])
          )
        ),
      ]);
    }
    const order = Engine.scrambledOrder(puzzle);
    return el('section', { class: 'panel corpus-panel' }, [
      el('h2', { text: 'Frases de ejemplo' }),
      el('ol', { class: 'corpus' }, puzzle.corpus.map((s) => el('li', {}, [languageText(s.text)]))),
      el('h2', { class: 'subheading', text: 'Traducciones (desordenadas)' }),
      el(
        'ul',
        { class: 'scrambled' },
        order.map((corpusIndex, position) =>
          el('li', {}, [
            el('span', { class: 'letter', text: Engine.letter(position) }),
            el('span', { text: puzzle.corpus[corpusIndex].translation }),
          ])
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
      ...state.revealedWords.map((m) =>
        el('li', {}, [languageText(m), document.createTextNode(' = ' + puzzle.glossary[m])])
      ),
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
      el('h2', { text: 'Diccionario del ' + puzzle.language }),
      el(
        'dl',
        { class: 'dictionary' },
        Object.entries(puzzle.glossary).flatMap(([morpheme, meaning]) => [
          el('dt', {}, [languageText(morpheme)]),
          el('dd', { text: meaning }),
        ])
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

  function tileRow(words, feedback) {
    return el(
      'div',
      { class: 'tile-row' },
      words.map((w, i) => el('span', { class: 'tile ' + (feedback ? feedback[i] : ''), text: w }))
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
        return prefix + 'Traduce al español';
      default:
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
        saveState(state);
        if (Engine.isFinished(state) && current.daily) {
          writeJSON(STATS_KEY, Engine.updateStats(loadStats(), current.daily, Engine.computeStars(state)));
        }
        rerender();
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
    const free = Boolean(challenge.morphemes);

    const prompt = el('p', { class: 'prompt' }, [
      toSpanish ? languageText(challenge.prompt, 'big') : el('span', { class: 'big', text: '«' + challenge.prompt + '»' }),
    ]);
    const history = el(
      'div',
      { class: 'history' },
      progress.attempts.map((a) =>
        el('div', { class: 'attempt' }, [
          tileRow(a.guess, a.feedback),
          free ? el('p', { class: 'reads-as muted', text: 'Se lee: ' + Engine.joinMorphemes(a.guess) }) : null,
          lengthNote(a.lengthHint),
        ])
      )
    );
    const body = [prompt, history];

    if (progress.status === 'playing') {
      const chosen = selected.map((tileIndex, pos) =>
        el('button', {
          type: 'button',
          class: 'tile chosen',
          text: tiles[tileIndex],
          title: 'Quitar',
          onclick: () => {
            selected.splice(pos, 1);
            rerender();
          },
        })
      );
      let answerRow;
      let full;
      if (free) {
        // Con piezas, la longitud de la respuesta forma parte del puzzle.
        answerRow = el(
          'div',
          { class: 'tile-row answer-row free', 'aria-label': 'Tu respuesta' },
          chosen.length ? chosen : [el('span', { class: 'placeholder', text: 'Pulsa las piezas en orden…' })]
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
          el('button', {
            type: 'button',
            class: 'tile',
            text: word,
            disabled: selected.includes(tileIndex) || full,
            onclick: () => {
              selected.push(tileIndex);
              rerender();
            },
          })
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
      body.push(
        answerRow,
        free && selected.length
          ? el('p', { class: 'reads-as', text: 'Se lee: ' + Engine.joinMorphemes(selected.map((i) => tiles[i])) })
          : null,
        pool,
        actions
      );
    } else if (progress.status === 'failed') {
      const answer = challenge.answer;
      body.push(
        el('p', { class: 'solution' }, [
          document.createTextNode('Solución: '),
          toSpanish
            ? el('strong', { text: answer.join(' ') })
            : languageText(free ? Engine.joinMorphemes(answer) : answer.join(' ')),
          free ? el('span', { class: 'muted', text: ' (' + answer.join(' ') + ')' }) : null,
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
      progress.attempts.map((a) =>
        tileRow(
          a.guess.map((l, i) => i + 1 + l),
          a.feedback
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

    const options = challenge.options.map((option, i) => {
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

    const body = [el('p', { class: 'prompt question', text: challenge.prompt }), el('div', { class: 'options' }, options)];
    if (!done) {
      body.push(
        el('div', { class: 'button-row' }, [submitButton(puzzle, state, index, () => selected.slice(), selected.length === 1, rerender)])
      );
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
    const state = loadState(puzzle, game.key);
    const tier = TIERS.find((t) => t.id === puzzle.tier);
    const eyebrow = game.daily
      ? 'Reto diario · Descifra #' + game.daily + ' · Lengua: ' + puzzle.language
      : 'Nivel ' + (PUZZLES.indexOf(puzzle) + 1) + (tier ? ' · ' + tier.title : '') + ' · Lengua: ' + puzzle.language;
    let confirmingReset = false;

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
            clearState(game.key);
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
        el('section', { class: 'puzzle' }, [
          el('div', { class: 'puzzle-header' }, [
            el('p', { class: 'eyebrow', text: eyebrow }),
            el('h2', { class: 'puzzle-title', text: puzzle.title }),
            el('p', { class: 'lead', text: puzzle.intro }),
            finished ? topicLinks(puzzle.topics) : null,
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
    return el('div', { class: 'stat' }, [
      el('span', { class: 'stat-value', text: String(value) }),
      el('span', { class: 'stat-label', text: label }),
    ]);
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
      el('h2', { text: stars > 0 ? 'Has descifrado el ' + puzzle.language : 'El ' + puzzle.language + ' se resiste' }),
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
    const next = PUZZLES[PUZZLES.indexOf(puzzle) + 1];
    const solved = state.challenges.filter((c) => c.status === 'solved').length;
    const message =
      stars === 3
        ? '¡Perfecto! Has descifrado el ' + puzzle.language + ' sin ayuda.'
        : stars > 0
        ? 'Has descifrado el ' + puzzle.language + '.'
        : 'Has resuelto ' + solved + ' de ' + puzzle.challenges.length + ' retos. Puedes reiniciar el nivel y volver a intentarlo.';

    dialog.querySelector('.dialog-body').replaceChildren(
      el('h2', { text: puzzle.title }),
      el('p', { class: 'result-stars', 'aria-label': stars + ' de 3 estrellas', text: starsText(stars) }),
      el('p', { text: message }),
      el('p', {
        class: 'muted',
        text: 'Pistas usadas: ' + Engine.hintsUsed(state) + '. Junto a las frases tienes ahora el diccionario completo.',
      }),
      learnButton(puzzle),
      el('div', { class: 'button-row end' }, [
        el('button', { type: 'button', class: 'secondary', onclick: () => dialog.close(), text: 'Cerrar' }),
        el('button', {
          type: 'button',
          class: 'primary',
          onclick: () => {
            dialog.close();
            location.hash = next ? next.id : '';
          },
          text: next ? 'Siguiente nivel' : 'Volver al inicio',
        }),
      ])
    );
    dialog.showModal();
  }

  // ---------- Navegación ----------

  function route() {
    selections = {};
    pinnedWord = null;
    current = null;
    if (dialog.open) dialog.close();
    const hash = location.hash.slice(1);
    if (hash === 'hoy') {
      const number = Engine.dayNumber(new Date());
      renderPuzzle({ puzzle: Engine.dailyPuzzle(number, DAILY_PUZZLES), key: dailyKey(number), daily: number });
    } else if (hash === 'aprende') {
      renderLearnIndex();
    } else if (hash.startsWith('aprende-') && article(hash.slice(8))) {
      renderArticle(article(hash.slice(8)));
    } else {
      const puzzle = PUZZLES.find((p) => p.id === hash);
      if (puzzle) renderPuzzle({ puzzle, key: puzzle.id, daily: null });
      else renderHome();
    }
    window.scrollTo(0, 0);
  }

  dialog.addEventListener('close', () => clearInterval(countdownTimer));
  homeButton.addEventListener('click', () => {
    location.hash = '';
  });
  window.addEventListener('hashchange', route);
  route();
})();
