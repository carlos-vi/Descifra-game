// Lógica del juego, sin dependencias del DOM para poder probarla con Node.
(function (root) {
  'use strict';

  const MAX_ATTEMPTS = 4;

  // Generador pseudoaleatorio con semilla: las fichas salen siempre en el
  // mismo orden para un mismo puzzle (necesario para el futuro modo diario).
  function seededRandom(seedText) {
    let h = 2166136261;
    for (const ch of seedText) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6d2b79f5;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(items, seedText) {
    const rand = seededRandom(seedText);
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Tipos de reto:
  // - "to-spanish" / "to-language": construir la traducción con fichas. Con
  //   morphemes: true las fichas son raíces y afijos ("tam", "-ne", "ni-").
  // - "match": emparejar las frases del corpus con sus traducciones desordenadas.
  // - "choice": elegir una opción (una regla, o la frase incorrecta).
  const POSITIONAL_TYPES = ['match', 'choice'];

  // Orden en que se muestran las traducciones de un corpus desordenado.
  function scrambledOrder(puzzle) {
    const indices = puzzle.corpus.map((_, i) => i);
    let order = shuffle(indices, puzzle.id + ':corpus');
    // Que ninguna traducción quede en su sitio original.
    let attempt = 0;
    while (order.some((v, i) => v === i) && attempt < 50) {
      attempt++;
      order = shuffle(indices, puzzle.id + ':corpus:' + attempt);
    }
    return order;
  }

  function letter(position) {
    return String.fromCharCode(65 + position);
  }

  // Respuesta de un reto como lista de fichas.
  function challengeAnswer(puzzle, index) {
    const challenge = puzzle.challenges[index];
    if (challenge.type === 'match') {
      const order = scrambledOrder(puzzle);
      return puzzle.corpus.map((_, i) => letter(order.indexOf(i)));
    }
    if (challenge.type === 'choice') return [String(challenge.correct)];
    return challenge.answer;
  }

  function maxAttempts(challenge) {
    if (challenge.maxAttempts) return challenge.maxAttempts;
    return challenge.type === 'choice' ? 2 : MAX_ATTEMPTS;
  }

  function buildTiles(puzzle, index) {
    const challenge = puzzle.challenges[index];
    return shuffle(challenge.answer.concat(challenge.distractors), puzzle.id + ':' + index);
  }

  function tokenize(text) {
    return text.trim().split(/\s+/).filter(Boolean);
  }

  // Une fichas de morfemas en palabras: "ni-" se pega a la siguiente y "-ne" a la anterior.
  function joinMorphemes(pieces) {
    let text = '';
    let glueNext = true;
    pieces.forEach((piece) => {
      const isSuffix = piece.length > 1 && piece.startsWith('-');
      const isPrefix = piece.length > 1 && piece.endsWith('-');
      const bare = piece.replace(/^-|-$/g, '');
      if (text && !isSuffix && !glueNext) text += ' ';
      text += bare;
      glueNext = isPrefix;
    });
    return text;
  }

  // Corrección al estilo Wordle: "correct" (sitio correcto), "present"
  // (está en la respuesta pero en otro sitio) o "absent".
  function scoreAttempt(guess, answer) {
    const result = guess.map(() => 'absent');
    const remaining = {};
    answer.forEach((word, i) => {
      if (guess[i] === word) {
        result[i] = 'correct';
      } else {
        remaining[word] = (remaining[word] || 0) + 1;
      }
    });
    guess.forEach((word, i) => {
      if (result[i] !== 'correct' && remaining[word] > 0) {
        result[i] = 'present';
        remaining[word]--;
      }
    });
    return result;
  }

  function scorePositional(guess, answer) {
    return guess.map((w, i) => (w === answer[i] ? 'correct' : 'absent'));
  }

  function isCorrect(guess, answer) {
    return guess.length === answer.length && guess.every((w, i) => w === answer[i]);
  }

  // Respuestas aceptadas: la principal y las alternativas (orden libre, etc.).
  function acceptedAnswers(puzzle, index) {
    return [challengeAnswer(puzzle, index)].concat(puzzle.challenges[index].alternatives || []);
  }

  // Evalúa un intento contra la respuesta aceptada más parecida.
  function evaluate(puzzle, index, guess) {
    const challenge = puzzle.challenges[index];
    const score = POSITIONAL_TYPES.includes(challenge.type) ? scorePositional : scoreAttempt;
    let best = null;
    for (const answer of acceptedAnswers(puzzle, index)) {
      const feedback = score(guess, answer);
      const hits = feedback.filter((f) => f === 'correct').length;
      const correct = isCorrect(guess, answer);
      if (!best || correct || (!best.correct && hits > best.hits)) {
        best = { feedback, hits, correct, length: answer.length };
      }
      if (correct) break;
    }
    const lengthHint = best.correct ? null : guess.length < best.length ? 'short' : guess.length > best.length ? 'long' : null;
    return { feedback: best.feedback, correct: best.correct, lengthHint };
  }

  function newState(puzzle) {
    return {
      puzzleId: puzzle.id,
      challenges: puzzle.challenges.map(() => ({ attempts: [], status: 'playing' })),
      revealedWords: [],
      revealedRules: 0,
      notebook: {},
      notes: '',
    };
  }

  function submitAttempt(puzzle, state, index, guess) {
    const challenge = puzzle.challenges[index];
    const progress = state.challenges[index];
    if (progress.status !== 'playing') {
      throw new Error('Este reto ya está terminado');
    }
    if (isLocked(puzzle, state, index)) {
      throw new Error('Primero hay que emparejar las traducciones');
    }
    const { feedback, correct, lengthHint } = evaluate(puzzle, index, guess);
    progress.attempts.push({ guess: guess.slice(), feedback, correct, lengthHint });
    if (correct) {
      progress.status = 'solved';
    } else if (progress.attempts.length >= maxAttempts(challenge)) {
      progress.status = 'failed';
    }
    return { feedback, status: progress.status, lengthHint };
  }

  // En los corpus desordenados, los demás retos esperan a que se emparejen las traducciones.
  function isLocked(puzzle, state, index) {
    const first = puzzle.challenges[0];
    return index > 0 && first.type === 'match' && state.challenges[0].status === 'playing';
  }

  // Las traducciones del corpus se ven emparejadas cuando no hay reto de emparejar
  // o cuando ese reto ya ha terminado.
  function corpusRevealed(puzzle, state) {
    return !puzzle.scrambled || state.challenges[0].status !== 'playing';
  }

  function glossaryKeys(puzzle) {
    return Object.keys(puzzle.glossary);
  }

  // Revela una pista. Devuelve lo revelado o null si no quedan.
  function useHint(puzzle, state, kind) {
    if (kind === 'word') {
      const next = glossaryKeys(puzzle).find((k) => !state.revealedWords.includes(k));
      if (!next) return null;
      state.revealedWords.push(next);
      return { morpheme: next, meaning: puzzle.glossary[next] };
    }
    if (kind === 'rule') {
      if (state.revealedRules >= puzzle.rules.length) return null;
      state.revealedRules++;
      return { rule: puzzle.rules[state.revealedRules - 1] };
    }
    throw new Error('Tipo de pista desconocido: ' + kind);
  }

  function hintsUsed(state) {
    return state.revealedWords.length + state.revealedRules;
  }

  function isFinished(state) {
    return state.challenges.every((c) => c.status !== 'playing');
  }

  // 3 estrellas sin fallos ni pistas; cada fallo o pista suma una penalización.
  // Si algún reto se pierde, 0 estrellas.
  function computeStars(state) {
    if (state.challenges.some((c) => c.status === 'failed')) return 0;
    const wrong = state.challenges.reduce(
      (sum, c) => sum + c.attempts.filter((a) => !a.correct).length,
      0
    );
    const penalty = wrong + hintsUsed(state);
    if (penalty === 0) return 3;
    if (penalty <= 2) return 2;
    return 1;
  }

  function hasKey(glossary, key) {
    return Object.prototype.hasOwnProperty.call(glossary, key);
  }

  // Divide una palabra de la lengua en prefijos + raíz + sufijos del glosario.
  // Devuelve la lista de morfemas o null si no se puede.
  function segment(word, glossary) {
    if (hasKey(glossary, word)) return [word];
    const keys = Object.keys(glossary);
    for (const suffix of keys.filter((k) => k.length > 1 && k.startsWith('-'))) {
      const bare = suffix.slice(1);
      if (word.length > bare.length && word.endsWith(bare)) {
        const rest = segment(word.slice(0, -bare.length), glossary);
        if (rest) return rest.concat(suffix);
      }
    }
    for (const prefix of keys.filter((k) => k.length > 1 && k.endsWith('-'))) {
      const bare = prefix.slice(0, -1);
      if (word.length > bare.length && word.startsWith(bare)) {
        const rest = segment(word.slice(bare.length), glossary);
        if (rest) return [prefix].concat(rest);
      }
    }
    return null;
  }

  // Interpreta una palabra ya segmentada con guiones ("ni-ti-sal-e"): la raíz va
  // sin guiones, los prefijos antes y los sufijos después. Devuelve null si algún
  // trozo no está en el glosario.
  function parseSegmented(word, glossary) {
    const parts = word.split('-');
    const rootIndex = parts.findIndex((p) => hasKey(glossary, p));
    if (rootIndex === -1) return null;
    const morphemes = parts.map((p, i) => (i < rootIndex ? p + '-' : i > rootIndex ? '-' + p : p));
    return morphemes.every((m) => hasKey(glossary, m)) ? morphemes : null;
  }

  // Glosa de una frase segmentada: [{ form: 'tam-ne', gloss: 'hombre-agente' }, ...]
  function glossSentence(segmented, glossary) {
    return tokenize(segmented).map((word) => {
      const morphemes = parseSegmented(word, glossary) || [word];
      return {
        form: word,
        gloss: morphemes.map((m) => glossary[m] || '?').join('-'),
      };
    });
  }

  // ---------- Reto diario ----------

  // Día del reto #1. Cada día local posterior suma uno.
  const DAILY_EPOCH = { year: 2026, month: 10, day: 19 };
  const MS_PER_DAY = 86400000;

  function dayNumber(date) {
    const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const epoch = Date.UTC(DAILY_EPOCH.year, DAILY_EPOCH.month - 1, DAILY_EPOCH.day);
    return Math.max(1, Math.round((today - epoch) / MS_PER_DAY) + 1);
  }

  function dailyPuzzle(number, pool) {
    return pool[(number - 1) % pool.length];
  }

  function msUntilNextDay(date) {
    const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return next - date;
  }

  // Resultado para compartir: una fila por reto y un cuadrado por intento.
  function shareText(number, state) {
    const stars = computeStars(state);
    const rows = state.challenges.map((c) => c.attempts.map((a) => (a.correct ? '🟩' : '🟥')).join(''));
    const hints = hintsUsed(state);
    const hintText = hints === 0 ? 'sin pistas' : hints === 1 ? '1 pista' : hints + ' pistas';
    return ['Descifra #' + number + ' ' + '★'.repeat(stars) + '☆'.repeat(3 - stars), ...rows, hintText].join('\n');
  }

  function emptyStats() {
    return { played: 0, solved: 0, streak: 0, maxStreak: 0, lastDay: null, stars: [0, 0, 0, 0] };
  }

  // Registra el resultado de un día. La racha cuenta días seguidos con al menos una estrella.
  function updateStats(stats, number, stars) {
    const next = Object.assign(emptyStats(), stats, { stars: (stats.stars || [0, 0, 0, 0]).slice() });
    if (next.lastDay !== null && number <= next.lastDay) return next;
    next.played++;
    next.stars[stars]++;
    if (stars > 0) {
      next.solved++;
      next.streak = next.lastDay === number - 1 ? next.streak + 1 : 1;
    } else {
      next.streak = 0;
    }
    next.maxStreak = Math.max(next.maxStreak, next.streak);
    next.lastDay = number;
    return next;
  }

  // La racha se pierde si se salta un día.
  function currentStreak(stats, number) {
    return stats.lastDay !== null && stats.lastDay >= number - 1 ? stats.streak : 0;
  }

  const Engine = {
    MAX_ATTEMPTS,
    scrambledOrder,
    letter,
    challengeAnswer,
    maxAttempts,
    joinMorphemes,
    evaluate,
    isLocked,
    corpusRevealed,
    parseSegmented,
    glossSentence,
    dayNumber,
    dailyPuzzle,
    msUntilNextDay,
    shareText,
    emptyStats,
    updateStats,
    currentStreak,
    shuffle,
    buildTiles,
    tokenize,
    scoreAttempt,
    isCorrect,
    newState,
    submitAttempt,
    useHint,
    hintsUsed,
    isFinished,
    computeStars,
    segment,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Engine;
  } else {
    root.Engine = Engine;
  }
})(this);
