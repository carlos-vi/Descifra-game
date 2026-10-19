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

function languageWords(challenge) {
  return challenge.type === 'to-spanish' ? Engine.tokenize(challenge.prompt) : challenge.answer;
}

for (const puzzle of ALL_PUZZLES) {
  test(`puzzle "${puzzle.id}" está bien formado y es deducible`, () => {
    assert.ok(puzzle.id && puzzle.title && puzzle.language && puzzle.intro);
    assert.ok(puzzle.corpus.length >= 3, 'al menos 3 frases de ejemplo');
    assert.ok(puzzle.rules.length >= 1, 'al menos una regla');

    // Todos los morfemas que aparecen en el corpus están en el glosario...
    const corpusMorphemes = new Set();
    for (const sentence of puzzle.corpus) {
      for (const word of Engine.tokenize(sentence.text)) {
        const parts = Engine.segment(word, puzzle.glossary);
        assert.ok(parts, `"${word}" del corpus no se puede analizar con el glosario`);
        parts.forEach((p) => corpusMorphemes.add(p));
      }
    }
    // ...y todo el glosario aparece en el corpus.
    for (const morpheme of Object.keys(puzzle.glossary)) {
      assert.ok(corpusMorphemes.has(morpheme), `"${morpheme}" no aparece en ninguna frase de ejemplo`);
    }

    for (const challenge of puzzle.challenges) {
      assert.ok(['to-spanish', 'to-language'].includes(challenge.type));
      assert.ok(challenge.answer.length > 0 && challenge.distractors.length > 0);
      assert.ok(!challenge.answer.concat(challenge.distractors).some((w) => /\s/.test(w)), 'una palabra por ficha');
      // Cada palabra de la lengua en el reto se compone de morfemas vistos en el corpus.
      for (const word of languageWords(challenge)) {
        const parts = Engine.segment(word, puzzle.glossary);
        assert.ok(parts, `"${word}" del reto "${challenge.prompt}" no es deducible`);
        parts.forEach((p) => assert.ok(corpusMorphemes.has(p), `"${p}" no aparece en el corpus`));
      }
      // Los distractores en la lengua deben ser palabras posibles, para que no se delaten solos.
      if (challenge.type === 'to-language') {
        for (const word of challenge.distractors) {
          assert.ok(Engine.segment(word, puzzle.glossary), `distractor "${word}" no es una palabra posible`);
        }
      }
    }

    // El puzzle completo se puede resolver con 3 estrellas.
    const state = Engine.newState(puzzle);
    puzzle.challenges.forEach((c, i) => Engine.submitAttempt(puzzle, state, i, c.answer));
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
