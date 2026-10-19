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

  function buildTiles(puzzle, index) {
    const challenge = puzzle.challenges[index];
    return shuffle(challenge.answer.concat(challenge.distractors), puzzle.id + ':' + index);
  }

  function tokenize(text) {
    return text.trim().split(/\s+/).filter(Boolean);
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

  function isCorrect(guess, answer) {
    return guess.length === answer.length && guess.every((w, i) => w === answer[i]);
  }

  function newState(puzzle) {
    return {
      puzzleId: puzzle.id,
      challenges: puzzle.challenges.map(() => ({ attempts: [], status: 'playing' })),
      revealedWords: [],
      revealedRules: 0,
      notebook: {},
    };
  }

  function submitAttempt(puzzle, state, index, guess) {
    const challenge = puzzle.challenges[index];
    const progress = state.challenges[index];
    if (progress.status !== 'playing') {
      throw new Error('Este reto ya está terminado');
    }
    const feedback = scoreAttempt(guess, challenge.answer);
    const correct = isCorrect(guess, challenge.answer);
    progress.attempts.push({ guess: guess.slice(), feedback, correct });
    if (correct) {
      progress.status = 'solved';
    } else if (progress.attempts.length >= MAX_ATTEMPTS) {
      progress.status = 'failed';
    }
    return { feedback, status: progress.status };
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

  // Divide una palabra de la lengua en raíz + sufijos del glosario.
  // Devuelve la lista de morfemas o null si no se puede.
  function segment(word, glossary) {
    const suffixes = Object.keys(glossary).filter((k) => k.startsWith('-'));
    if (Object.prototype.hasOwnProperty.call(glossary, word)) return [word];
    for (const suffix of suffixes) {
      const bare = suffix.slice(1);
      if (word.length > bare.length && word.endsWith(bare)) {
        const rest = segment(word.slice(0, -bare.length), glossary);
        if (rest) return rest.concat(suffix);
      }
    }
    return null;
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
