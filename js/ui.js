// Interfaz del juego: pantallas, fichas y guardado del progreso.
(function () {
  'use strict';

  const app = document.getElementById('app');
  const homeButton = document.getElementById('home-button');
  const dialog = document.getElementById('result-dialog');
  const STORAGE_PREFIX = 'descifra:v1:';
  const STATS_KEY = 'stats';

  // Selección de fichas en curso, por reto: lista de índices dentro de las fichas.
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
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (raw) {
        const state = JSON.parse(raw);
        if (state.challenges && state.challenges.length === puzzle.challenges.length) return state;
      }
    } catch (e) {
      // Sin almacenamiento disponible: se juega sin guardar.
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

  // ---------- Pantalla de niveles ----------

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

  function renderHome() {
    homeButton.hidden = true;
    selections = {};
    pinnedWord = null;
    current = null;
    const list = el('ol', { class: 'level-list' });
    PUZZLES.forEach((puzzle, i) => {
      const state = loadState(puzzle, puzzle.id);
      const finished = Engine.isFinished(state);
      const started = state.challenges.some((c) => c.attempts.length > 0);
      const status = finished
        ? el('span', { class: 'level-stars', text: starsText(Engine.computeStars(state)) })
        : el('span', { class: 'level-status', text: started ? 'En curso' : 'Nuevo' });
      list.append(
        el('li', {}, [
          el('a', { class: 'level-card', href: '#' + puzzle.id }, [
            el('span', { class: 'level-number', text: String(i + 1) }),
            el('span', { class: 'level-info' }, [
              el('span', { class: 'level-title', text: puzzle.title }),
              el('span', { class: 'level-lang', text: 'Lengua: ' + puzzle.language }),
            ]),
            status,
          ]),
        ])
      );
    });

    app.replaceChildren(
      el('section', { class: 'home' }, [
        el('p', {
          class: 'lead',
          text:
            'Cada reto es una lengua desconocida. Compara las frases de ejemplo con su traducción, ' +
            'deduce el vocabulario y la gramática, y construye las traducciones con las fichas.',
        }),
        renderDailyCard(),
        el('h2', { class: 'section-title', text: 'Niveles de práctica' }),
        list,
        el('details', { class: 'how-to' }, [
          el('summary', { text: 'Cómo se juega' }),
          el('ul', {}, [
            el('li', { text: 'Pasa el ratón (o toca) sobre una palabra para ver dónde más aparece.' }),
            el('li', { text: 'Anota en el cuaderno lo que crees que significa cada palabra.' }),
            el('li', { text: 'En cada reto, pulsa las fichas en orden para llenar los huecos y comprueba.' }),
            el('li', {
              text:
                'Verde: palabra correcta en su sitio. Amarillo: la palabra va, pero en otro sitio. Gris: no va.',
            }),
            el('li', {
              text:
                'Tienes ' + Engine.MAX_ATTEMPTS + ' intentos por reto. Los fallos y las pistas restan estrellas.',
            }),
          ]),
        ]),
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

  function renderCorpus(puzzle) {
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

  function renderNotebook(puzzle, state) {
    const rows = notebookWords(puzzle).map((word) =>
      el('label', { class: 'notebook-row' }, [
        languageText(word),
        el('input', {
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
    return el('section', { class: 'panel notebook-panel' }, [
      el('h2', { text: 'Cuaderno' }),
      el('p', { class: 'muted', text: 'Tus notas. No cuentan para la puntuación.' }),
      el('div', { class: 'notebook' }, rows),
    ]);
  }

  function renderHints(puzzle, state, rerender) {
    const finished = Engine.isFinished(state);
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
          disabled: finished || wordsLeft === 0,
          onclick: () => use('word'),
          text: 'Revelar una palabra (' + wordsLeft + ')',
        }),
        el('button', {
          type: 'button',
          class: 'secondary',
          disabled: finished || rulesLeft === 0,
          onclick: () => use('rule'),
          text: 'Revelar una regla (' + rulesLeft + ')',
        }),
      ]),
      state.revealedWords.length || state.revealedRules ? revealed : null,
    ]);
  }

  // Al terminar, se muestra el significado de todas las raíces y sufijos.
  function renderDictionary(puzzle) {
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
    ]);
  }

  function tileRow(words, feedback) {
    return el(
      'div',
      { class: 'tile-row' },
      words.map((w, i) => el('span', { class: 'tile ' + (feedback ? feedback[i] : ''), text: w }))
    );
  }

  function renderChallenge(puzzle, state, index, rerender) {
    const challenge = puzzle.challenges[index];
    const progress = state.challenges[index];
    const tiles = Engine.buildTiles(puzzle, index);
    const selected = selections[index] || (selections[index] = []);
    const toSpanish = challenge.type === 'to-spanish';

    const header = el('div', { class: 'challenge-header' }, [
      el('span', { class: 'challenge-label', text: 'Reto ' + (index + 1) + ' · Traduce ' + (toSpanish ? 'al español' : 'al ' + puzzle.language) }),
      el('span', {
        class: 'challenge-status ' + progress.status,
        text:
          progress.status === 'solved'
            ? 'Resuelto'
            : progress.status === 'failed'
            ? 'Sin intentos'
            : 'Intentos: ' + progress.attempts.length + '/' + Engine.MAX_ATTEMPTS,
      }),
    ]);

    const prompt = el('p', { class: 'prompt' }, [
      toSpanish ? languageText(challenge.prompt, 'big') : el('span', { class: 'big', text: '«' + challenge.prompt + '»' }),
    ]);

    const history = el(
      'div',
      { class: 'history' },
      progress.attempts.map((a) => tileRow(a.guess, a.feedback))
    );

    const body = [header, prompt, history];

    if (progress.status === 'playing') {
      // Un hueco por palabra de la respuesta, como las casillas de Wordle.
      const slots = challenge.answer.map((_, pos) =>
        pos < selected.length
          ? el('button', {
              type: 'button',
              class: 'tile chosen',
              text: tiles[selected[pos]],
              title: 'Quitar',
              onclick: () => {
                selected.splice(pos, 1);
                rerender();
              },
            })
          : el('span', { class: 'tile slot', 'aria-hidden': 'true' })
      );
      const answerRow = el('div', { class: 'tile-row answer-row', 'aria-label': 'Tu respuesta' }, slots);
      const full = selected.length === challenge.answer.length;
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
        el('button', {
          type: 'button',
          class: 'primary',
          disabled: !full,
          onclick: () => {
            Engine.submitAttempt(puzzle, state, index, selected.map((i) => tiles[i]));
            selected.length = 0;
            saveState(state);
            if (Engine.isFinished(state) && current.daily) {
              writeJSON(STATS_KEY, Engine.updateStats(loadStats(), current.daily, Engine.computeStars(state)));
            }
            rerender();
            if (Engine.isFinished(state)) showResult(puzzle, state);
          },
          text: 'Comprobar',
        }),
      ]);
      body.push(answerRow, pool, actions);
    } else if (progress.status === 'failed') {
      body.push(
        el('p', { class: 'solution' }, [
          document.createTextNode('Solución: '),
          toSpanish ? el('strong', { text: challenge.answer.join(' ') }) : languageText(challenge.answer.join(' ')),
        ])
      );
    }

    return el('section', { class: 'panel challenge ' + progress.status }, body);
  }

  function renderPuzzle(game) {
    homeButton.hidden = false;
    current = game;
    const puzzle = game.puzzle;
    const state = loadState(puzzle, game.key);
    const eyebrow = game.daily
      ? 'Reto diario · Descifra #' + game.daily + ' · Lengua: ' + puzzle.language
      : 'Nivel ' + (PUZZLES.indexOf(puzzle) + 1) + ' · Lengua: ' + puzzle.language;
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
      app.replaceChildren(
        el('section', { class: 'puzzle' }, [
          el('div', { class: 'puzzle-header' }, [
            el('p', { class: 'eyebrow', text: eyebrow }),
            el('h2', { class: 'puzzle-title', text: puzzle.title }),
            el('p', { class: 'lead', text: puzzle.intro }),
          ]),
          el('div', { class: 'columns' }, [
            el('div', { class: 'column' }, [
              renderCorpus(puzzle),
              Engine.isFinished(state) ? renderDictionary(puzzle) : renderHints(puzzle, state, rerender),
              renderNotebook(puzzle, state),
            ]),
            el(
              'div',
              { class: 'column' },
              puzzle.challenges
                .map((_, i) => renderChallenge(puzzle, state, i, rerender))
                .concat(
                  el('div', { class: 'button-row end puzzle-actions' }, [
                    Engine.isFinished(state) && !confirmingReset
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
    const index = PUZZLES.indexOf(puzzle);
    const next = PUZZLES[index + 1];
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
        text: 'Pistas usadas: ' + Engine.hintsUsed(state),
      }),
      el('div', { class: 'button-row end' }, [
        el('button', { type: 'button', class: 'secondary', onclick: () => dialog.close(), text: 'Cerrar' }),
        next
          ? el('button', {
              type: 'button',
              class: 'primary',
              onclick: () => {
                dialog.close();
                location.hash = next.id;
              },
              text: 'Siguiente nivel',
            })
          : el('button', {
              type: 'button',
              class: 'primary',
              onclick: () => {
                dialog.close();
                location.hash = '';
              },
              text: 'Volver a los niveles',
            }),
      ])
    );
    dialog.showModal();
  }

  // ---------- Navegación ----------

  function route() {
    selections = {};
    pinnedWord = null;
    if (dialog.open) dialog.close();
    if (location.hash === '#hoy') {
      const number = Engine.dayNumber(new Date());
      renderPuzzle({ puzzle: Engine.dailyPuzzle(number, DAILY_PUZZLES), key: dailyKey(number), daily: number });
    } else {
      const puzzle = PUZZLES.find((p) => '#' + p.id === location.hash);
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
