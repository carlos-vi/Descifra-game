const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../js/engine.js');
const LEVELS = require('../js/puzzles.js');
const DAILY_PUZZLES = require('../js/daily-puzzles.js');
const PUZZLES = LEVELS;
const ALL_PUZZLES = LEVELS.concat(DAILY_PUZZLES);

test('scoreAttempt marca palabras correctas, presentes y ausentes', () => {
  assert.deepEqual(Engine.scoreAttempt(['el', 'gato', 've'], ['el', 'perro', 've']), ['correct', 'absent', 'correct']);
  assert.deepEqual(Engine.scoreAttempt(['ve', 'el'], ['el', 've']), ['present', 'present']);
});

test('scoreAttempt no cuenta dos veces una palabra repetida', () => {
  // Solo hay un "el" en la respuesta y ya está en su sitio.
  assert.deepEqual(Engine.scoreAttempt(['el', 'el', 'gato'], ['el', 'gato', 've']), ['correct', 'absent', 'present']);
  // Dos "el" en la respuesta, uno bien colocado y otro desplazado.
  assert.deepEqual(
    Engine.scoreAttempt(['el', 'perro', 'el', 've'], ['el', 'perro', 've', 'el']),
    ['correct', 'correct', 'present', 'present']
  );
});

test('scoreAttempt admite intentos más cortos o largos que la respuesta', () => {
  assert.deepEqual(Engine.scoreAttempt(['el'], ['el', 'perro']), ['correct']);
  assert.deepEqual(Engine.scoreAttempt(['el', 'perro', 've'], ['el', 'perro']), ['correct', 'correct', 'absent']);
  assert.equal(Engine.isCorrect(['el', 'perro', 've'], ['el', 'perro']), false);
});

test('las fichas se barajan siempre igual para el mismo puzzle', () => {
  const puzzle = PUZZLES[0];
  assert.deepEqual(Engine.buildTiles(puzzle, 0), Engine.buildTiles(puzzle, 0));
  assert.deepEqual(
    Engine.buildTiles(puzzle, 0).slice().sort(),
    puzzle.challenges[0].answer.concat(puzzle.challenges[0].distractors).sort()
  );
});

test('un reto se resuelve al acertar y se pierde al agotar los intentos', () => {
  const puzzle = PUZZLES[0];
  const state = Engine.newState(puzzle);
  const wrong = ['el', 'gato'];
  for (let i = 0; i < Engine.MAX_ATTEMPTS; i++) Engine.submitAttempt(puzzle, state, 0, wrong);
  assert.equal(state.challenges[0].status, 'failed');
  assert.throws(() => Engine.submitAttempt(puzzle, state, 0, wrong));

  const result = Engine.submitAttempt(puzzle, state, 1, puzzle.challenges[1].answer);
  assert.equal(result.status, 'solved');
  assert.equal(Engine.isFinished(state), true);
  assert.equal(Engine.computeStars(state), 0);
});

test('las estrellas bajan con fallos y pistas', () => {
  const puzzle = PUZZLES[1];
  const solveAll = (state) => puzzle.challenges.forEach((c, i) => Engine.submitAttempt(puzzle, state, i, c.answer));

  const perfect = Engine.newState(puzzle);
  solveAll(perfect);
  assert.equal(Engine.computeStars(perfect), 3);

  const twoMistakes = Engine.newState(puzzle);
  Engine.submitAttempt(puzzle, twoMistakes, 0, ['la']);
  Engine.useHint(puzzle, twoMistakes, 'rule');
  solveAll(twoMistakes);
  assert.equal(Engine.computeStars(twoMistakes), 2);

  const many = Engine.newState(puzzle);
  Engine.useHint(puzzle, many, 'word');
  Engine.useHint(puzzle, many, 'word');
  Engine.useHint(puzzle, many, 'rule');
  solveAll(many);
  assert.equal(Engine.computeStars(many), 1);
});

test('un intento incompleto cuenta como fallo aunque todo esté en verde', () => {
  const puzzle = PUZZLES[1];
  const state = Engine.newState(puzzle);
  const result = Engine.submitAttempt(puzzle, state, 0, puzzle.challenges[0].answer.slice(0, 1));
  assert.equal(result.status, 'playing');
  puzzle.challenges.forEach((c, i) => Engine.submitAttempt(puzzle, state, i, c.answer));
  assert.equal(Engine.computeStars(state), 2);
});

test('las pistas se acaban', () => {
  const puzzle = PUZZLES[0];
  const state = Engine.newState(puzzle);
  const words = Object.keys(puzzle.glossary);
  words.forEach((w) => assert.equal(Engine.useHint(puzzle, state, 'word').morpheme, w));
  assert.equal(Engine.useHint(puzzle, state, 'word'), null);
  puzzle.rules.forEach(() => assert.ok(Engine.useHint(puzzle, state, 'rule')));
  assert.equal(Engine.useHint(puzzle, state, 'rule'), null);
});

test('segment separa raíces y sufijos', () => {
  const glossary = { gor: 'lobo', dak: 'ver', '-li': 'plural', '-ek': 'pasado' };
  assert.deepEqual(Engine.segment('gorli', glossary), ['gor', '-li']);
  assert.deepEqual(Engine.segment('dakek', glossary), ['dak', '-ek']);
  assert.equal(Engine.segment('mira', glossary), null);
});

// ---------- Validación de los puzzles ----------

const TIERS = ['iniciacion', 'intermedio', 'avanzado', 'olimpiada'];

// Morfemas de una palabra del corpus: con la segmentación escrita si la hay.
function corpusWordMorphemes(puzzle, word, segmentedWord) {
  if (segmentedWord) {
    assert.equal(segmentedWord.replace(/-/g, ''), word, `"${segmentedWord}" no coincide con "${word}"`);
    return Engine.parseSegmented(segmentedWord, puzzle.glossary);
  }
  return Engine.segment(word, puzzle.glossary);
}

for (const puzzle of ALL_PUZZLES) {
  test(`puzzle "${puzzle.id}" está bien formado y es deducible`, () => {
    assert.ok(puzzle.id && puzzle.title && puzzle.language && puzzle.intro);
    assert.ok(puzzle.corpus.length >= 3, 'al menos 3 frases de ejemplo');
    assert.ok(puzzle.rules.length >= 1, 'al menos una regla');
    if (LEVELS.includes(puzzle)) assert.ok(TIERS.includes(puzzle.tier), 'nivel con grupo de dificultad');

    // Todos los morfemas que aparecen en el corpus están en el glosario...
    const corpusMorphemes = new Set();
    for (const sentence of puzzle.corpus) {
      const words = Engine.tokenize(sentence.text);
      const segmented = sentence.segmented ? Engine.tokenize(sentence.segmented) : [];
      if (sentence.segmented) assert.equal(segmented.length, words.length, `segmentación de "${sentence.text}"`);
      words.forEach((word, i) => {
        const parts = corpusWordMorphemes(puzzle, word, segmented[i]);
        assert.ok(parts, `"${word}" del corpus no se puede analizar con el glosario`);
        parts.forEach((p) => corpusMorphemes.add(p));
      });
    }
    // ...y todo el glosario aparece en el corpus.
    for (const morpheme of Object.keys(puzzle.glossary)) {
      assert.ok(corpusMorphemes.has(morpheme), `"${morpheme}" no aparece en ninguna frase de ejemplo`);
    }

    // Cada palabra de la lengua en un reto se compone de morfemas vistos en el corpus.
    const assertDeducible = (word, where) => {
      const parts = Engine.segment(word, puzzle.glossary);
      assert.ok(parts, `"${word}" de ${where} no es deducible`);
      parts.forEach((p) => assert.ok(corpusMorphemes.has(p), `"${p}" (${where}) no aparece en el corpus`));
    };

    puzzle.challenges.forEach((challenge, index) => {
      const where = `reto ${index + 1}`;
      switch (challenge.type) {
        case 'match':
          assert.equal(index, 0, 'el reto de emparejar va primero');
          assert.ok(puzzle.scrambled, 'emparejar requiere scrambled: true');
          assert.equal(new Set(puzzle.corpus.map((c) => c.translation)).size, puzzle.corpus.length, 'traducciones distintas');
          break;
        case 'choice':
          assert.ok(challenge.prompt && challenge.options.length >= 2);
          assert.ok(challenge.correct >= 0 && challenge.correct < challenge.options.length);
          if (challenge.optionsLanguage) {
            challenge.options.forEach((o) => Engine.tokenize(o).forEach((w) => assertDeducible(w, where)));
          }
          break;
        case 'to-spanish':
        case 'to-language': {
          const tiles = challenge.answer.concat(challenge.distractors);
          assert.ok(challenge.answer.length > 0 && challenge.distractors.length > 0);
          assert.ok(!tiles.some((w) => /\s/.test(w)), 'una palabra por ficha');
          if (challenge.type === 'to-spanish') {
            Engine.tokenize(challenge.prompt).forEach((w) => assertDeducible(w, where));
          } else if (challenge.morphemes) {
            // Las fichas son morfemas del glosario; las de la respuesta, vistas en el corpus.
            tiles.forEach((m) => assert.ok(m in puzzle.glossary, `ficha "${m}" (${where}) no está en el glosario`));
            challenge.answer.forEach((m) => assert.ok(corpusMorphemes.has(m), `"${m}" (${where}) no aparece en el corpus`));
          } else {
            challenge.answer.forEach((w) => assertDeducible(w, where));
            // Los distractores deben ser palabras posibles, para que no se delaten solos.
            challenge.distractors.forEach((w) => assert.ok(Engine.segment(w, puzzle.glossary), `distractor "${w}" no es una palabra posible`));
          }
          break;
        }
        default:
          assert.fail(`tipo de reto desconocido: ${challenge.type}`);
      }
    });

    // El puzzle completo se puede resolver con 3 estrellas.
    const state = Engine.newState(puzzle);
    puzzle.challenges.forEach((_, i) => Engine.submitAttempt(puzzle, state, i, Engine.challengeAnswer(puzzle, i)));
    assert.equal(Engine.computeStars(state), 3);
  });
}

test('los identificadores de los puzzles son únicos', () => {
  const ids = ALL_PUZZLES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

// ---------- Reto diario ----------

test('dayNumber empieza en 1 y avanza con los días locales', () => {
  assert.equal(Engine.dayNumber(new Date(2026, 9, 19, 0, 1)), 1);
  assert.equal(Engine.dayNumber(new Date(2026, 9, 19, 23, 59)), 1);
  assert.equal(Engine.dayNumber(new Date(2026, 9, 20, 0, 0)), 2);
  assert.equal(Engine.dayNumber(new Date(2027, 0, 1, 12, 0)), 75);
  // Antes del lanzamiento se juega el #1.
  assert.equal(Engine.dayNumber(new Date(2026, 0, 1)), 1);
});

test('dailyPuzzle recorre el banco y vuelve a empezar', () => {
  assert.equal(Engine.dailyPuzzle(1, DAILY_PUZZLES), DAILY_PUZZLES[0]);
  assert.equal(Engine.dailyPuzzle(DAILY_PUZZLES.length, DAILY_PUZZLES), DAILY_PUZZLES[DAILY_PUZZLES.length - 1]);
  assert.equal(Engine.dailyPuzzle(DAILY_PUZZLES.length + 1, DAILY_PUZZLES), DAILY_PUZZLES[0]);
});

test('msUntilNextDay cuenta hasta la medianoche local', () => {
  assert.equal(Engine.msUntilNextDay(new Date(2026, 9, 19, 23, 0, 0)), 3600000);
});

test('shareText resume intentos y pistas sin desvelar palabras', () => {
  const puzzle = DAILY_PUZZLES[0];
  const state = Engine.newState(puzzle);
  Engine.submitAttempt(puzzle, state, 0, puzzle.challenges[0].answer.slice().reverse());
  Engine.useHint(puzzle, state, 'rule');
  puzzle.challenges.forEach((c, i) => Engine.submitAttempt(puzzle, state, i, c.answer));
  const text = Engine.shareText(12, state);
  assert.equal(text, 'Descifra #12 ★★☆\n🟥🟩\n🟩\n🟩\n1 pista');
  for (const word of Object.keys(puzzle.glossary)) assert.ok(!text.includes(word));
});

test('updateStats lleva la racha de días seguidos y no cuenta dos veces el mismo día', () => {
  let stats = Engine.emptyStats();
  stats = Engine.updateStats(stats, 1, 3);
  stats = Engine.updateStats(stats, 2, 2);
  assert.equal(stats.streak, 2);
  assert.deepEqual(Engine.updateStats(stats, 2, 0), stats);
  stats = Engine.updateStats(stats, 4, 1);
  assert.equal(stats.streak, 1);
  assert.equal(stats.maxStreak, 2);
  stats = Engine.updateStats(stats, 5, 0);
  assert.equal(stats.streak, 0);
  assert.equal(stats.played, 4);
  assert.equal(stats.solved, 3);
  assert.deepEqual(stats.stars, [1, 1, 1, 1]);
});

test('currentStreak se pierde al saltarse un día', () => {
  const stats = Engine.updateStats(Engine.updateStats(Engine.emptyStats(), 1, 3), 2, 3);
  assert.equal(Engine.currentStreak(stats, 2), 2);
  assert.equal(Engine.currentStreak(stats, 3), 2);
  assert.equal(Engine.currentStreak(stats, 4), 0);
});

// ---------- Retos avanzados ----------

test('joinMorphemes pega prefijos y sufijos a su raíz', () => {
  assert.equal(Engine.joinMorphemes(['tama', 'a-', 'mi-', 'sal', '-o']), 'tama amisalo');
  assert.equal(Engine.joinMorphemes(['tolu', '-lar', 'seki', '-ler', '-de', 'ote']), 'tolular sekilerde ote');
});

test('parseSegmented y glossSentence analizan frases con guiones', () => {
  const ikoa = LEVELS.find((p) => p.id === 'ikoa');
  assert.deepEqual(Engine.parseSegmented('ni-ti-sal-e', ikoa.glossary), ['ni-', 'ti-', 'sal', '-e']);
  assert.equal(Engine.parseSegmented('ni-xx-sal', ikoa.glossary), null);
  assert.deepEqual(Engine.glossSentence('tama ni-u-pak-o', ikoa.glossary), [
    { form: 'tama', gloss: 'padre' },
    { form: 'ni-u-pak-o', gloss: 'yo-a él/ella-ayudar-pasado' },
  ]);
});

test('segment reconoce prefijos', () => {
  const ntaba = LEVELS.find((p) => p.id === 'ntaba');
  assert.deepEqual(Engine.segment('bakana', ntaba.glossary), ['ba-', 'kana']);
});

test('un intento de longitud distinta avisa de que faltan o sobran piezas', () => {
  const ankor = LEVELS.find((p) => p.id === 'ankor');
  const state = Engine.newState(ankor);
  assert.equal(Engine.submitAttempt(ankor, state, 2, ['tam', '-ne', 'nuk', '-u']).lengthHint, 'long');
  assert.equal(Engine.submitAttempt(ankor, state, 2, ['tam', 'nuk']).lengthHint, 'short');
  assert.equal(Engine.submitAttempt(ankor, state, 2, ['tam', 'nuk', '-u']).status, 'solved');
});

test('las alternativas también se aceptan como respuesta', () => {
  const puzzle = {
    id: 'prueba',
    corpus: [],
    challenges: [{ type: 'to-language', answer: ['a', 'b'], alternatives: [['b', 'a']], distractors: ['c'] }],
  };
  const state = Engine.newState(puzzle);
  assert.equal(Engine.submitAttempt(puzzle, state, 0, ['b', 'a']).status, 'solved');
});

test('las preguntas de opción múltiple tienen 2 intentos', () => {
  const sulpa = LEVELS.find((p) => p.id === 'sulpa');
  const state = Engine.newState(sulpa);
  Engine.submitAttempt(sulpa, state, 3, ['1']);
  assert.equal(Engine.submitAttempt(sulpa, state, 3, ['2']).status, 'failed');
});

test('emparejar: traducciones desordenadas y retos bloqueados hasta terminar', () => {
  const senka = LEVELS.find((p) => p.id === 'senka');
  const order = Engine.scrambledOrder(senka);
  assert.deepEqual(order.slice().sort(), senka.corpus.map((_, i) => i));
  assert.ok(order.every((v, i) => v !== i), 'ninguna traducción en su sitio');
  const state = Engine.newState(senka);
  assert.ok(Engine.isLocked(senka, state, 1));
  assert.equal(Engine.corpusRevealed(senka, state), false);
  assert.throws(() => Engine.submitAttempt(senka, state, 1, ['0']));
  const answer = Engine.challengeAnswer(senka, 0);
  const result = Engine.submitAttempt(senka, state, 0, answer);
  assert.equal(result.status, 'solved');
  assert.equal(Engine.isLocked(senka, state, 1), false);
  assert.equal(Engine.corpusRevealed(senka, state), true);
  // Cada letra apunta a la traducción correcta.
  answer.forEach((l, i) => assert.equal(senka.corpus[order[l.charCodeAt(0) - 65]].translation, senka.corpus[i].translation));
});

test('emparejar marca cada fila acertada o fallada', () => {
  const tavaki = LEVELS.find((p) => p.id === 'tavaki');
  const answer = Engine.challengeAnswer(tavaki, 0);
  const guess = answer.slice();
  [guess[0], guess[1]] = [guess[1], guess[0]];
  const { feedback } = Engine.evaluate(tavaki, 0, guess);
  assert.deepEqual(feedback.slice(0, 3), ['absent', 'absent', 'correct']);
});

// ---------- Aprende ----------

const ARTICLES = require('../js/learn.js');

test('los artículos de Aprende están completos', () => {
  const ids = ARTICLES.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const a of ARTICLES) {
    assert.ok(/^[a-z-]+$/.test(a.id), `id "${a.id}" válido para un enlace`);
    assert.ok(a.title && a.summary && a.paragraphs.length && a.examples.length && a.languages.length);
    for (const ex of a.examples) {
      assert.ok(ex.language && ex.translation);
      ex.words.forEach((w) => assert.equal(w.length, 2, `ejemplo de ${a.id}: [forma, glosa]`));
    }
  }
});

test('cada tema de los puzzles tiene su artículo', () => {
  const ids = new Set(ARTICLES.map((a) => a.id));
  for (const puzzle of ALL_PUZZLES) {
    for (const topic of puzzle.topics || []) assert.ok(ids.has(topic), `${puzzle.id}: tema "${topic}" sin artículo`);
  }
});
