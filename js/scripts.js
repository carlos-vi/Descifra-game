// Escrituras inventadas: cada glifo es un dibujo SVG.
//
// En los puzzles con "script", las palabras se separan con espacios y los glifos
// de una palabra con puntos: "ma.ri.na". Opciones de cada escritura:
// - rtl: se lee de derecha a izquierda (los datos van en orden de lectura).
// - vertical: los glifos de una palabra se apilan de arriba abajo.
// - cartouche: cada palabra va dentro de un marco.
// - compositional: los glifos se entienden por sus partes (puntos y barras), así
//   que un reto puede usar glifos que no aparecen tal cual en el corpus.
(function (root) {
  'use strict';

  const FILLED = 'fill="currentColor" stroke="none"';

  const SCRIPTS = {
    runas: {
      viewBox: '0 0 24 24',
      glyphs: {
        a: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.8" ${FILLED}/>`,
        c: '<path d="M4 8 L9 16 L14 8 L19 16"/>',
        e: '<path d="M12 4 L20 19 H4 Z"/>',
        i: '<path d="M12 4 V20 M7 4 H17"/>',
        l: '<rect x="6" y="6" width="12" height="12"/>',
        m: '<path d="M7 5 V18 H17 V5"/>',
        n: `<path d="M5 19 L19 5"/><circle cx="8" cy="8" r="1.8" ${FILLED}/>`,
        o: '<circle cx="12" cy="12" r="8"/>',
        r: '<path d="M12 20 V4 M6 10 L12 4 L18 10"/>',
        s: '<path d="M4 12 Q8 4 12 12 T20 12"/>',
        t: '<path d="M12 4 V20 M4 12 H20"/>',
        u: '<path d="M12 4 L20 12 L12 20 L4 12 Z"/>',
      },
    },

    silabas: {
      viewBox: '0 0 24 24',
      rtl: true,
      cartouche: true,
      glyphs: {
        ma: '<path d="M5 18 C5 6 19 6 19 18"/>',
        mi: `<path d="M5 18 C5 6 19 6 19 18"/><circle cx="12" cy="14" r="1.8" ${FILLED}/>`,
        ri: '<path d="M6 6 C18 6 6 18 18 18"/>',
        na: '<circle cx="12" cy="9" r="4"/><path d="M12 13 V20"/>',
        ni: '<path d="M6 5 V19 M6 12 C10 8 14 16 18 12"/>',
        ka: '<path d="M5 6 H19 M12 6 V19 M8 19 H16"/>',
        ko: '<path d="M18 7 A7 7 0 1 0 18 17 M14 12 H20"/>',
        o: '<circle cx="8" cy="12" r="3.5"/><circle cx="16" cy="12" r="3.5"/>',
        ro: '<path d="M4 12 C8 6 16 6 20 12 C16 18 8 18 4 12 Z M12 9 V15"/>',
        sa: '<path d="M6 19 L12 5 L18 19 M8.5 13 H15.5"/>',
      },
    },

    jeroglificos: {
      viewBox: '0 0 24 24',
      glyphs: {
        sol: `<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.8" ${FILLED}/>`,
        casa: '<path d="M5 20 V10 L12 4 L19 10 V20 Z M10 20 V14 H14 V20"/>',
        ojo: `<path d="M3 12 C7 6 17 6 21 12 C17 18 7 18 3 12 Z"/><circle cx="12" cy="12" r="2.5" ${FILLED}/>`,
        pajaro: '<path d="M4 14 C8 8 14 8 17 11 L21 10 L18 13 C16 17 9 18 4 14 Z M9 17 V21 M13 17 V21"/>',
        pie: '<path d="M9 3 V16 C9 19 11 20 14 20 H20 V17 C17 17 14 16 13 13 V3"/>',
        trazo: '<path d="M12 6 V18"/>',
        persona: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8 V15 M7 11 H17 M12 15 L8 21 M12 15 L16 21"/>',
        agua:
          '<path d="M3 7 L6 5 L9 7 L12 5 L15 7 L18 5 L21 7 M3 13 L6 11 L9 13 L12 11 L15 13 L18 11 L21 13 M3 19 L6 17 L9 19 L12 17 L15 19 L18 17 L21 19"/>',
        ciudad: '<circle cx="12" cy="12" r="8"/><path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5"/>',
      },
    },

    // Braille básico: cada letra es una celda de 2 × 3 posiciones (1-2-3 a la
    // izquierda, 4-5-6 a la derecha, de arriba abajo).
    braille: {
      viewBox: '0 0 20 30',
      compositional: true,
      glyph(id) {
        const cells = {
          a: '1', b: '12', c: '14', d: '145', e: '15', f: '124', g: '1245', h: '125', i: '24', j: '245',
          k: '13', l: '123', m: '134', n: '1345', o: '135', p: '1234', q: '12345', r: '1235', s: '234', t: '2345',
          u: '136', v: '1236', w: '2456', x: '1346', y: '13456', z: '1356',
        };
        if (!Object.prototype.hasOwnProperty.call(cells, id)) return null;
        const positions = { 1: [6, 6], 2: [6, 15], 3: [6, 24], 4: [14, 6], 5: [14, 15], 6: [14, 24] };
        return Object.entries(positions)
          .map(([dot, [x, y]]) =>
            cells[id].includes(dot)
              ? `<circle cx="${x}" cy="${y}" r="3.2" ${FILLED}/>`
              : `<circle cx="${x}" cy="${y}" r="1.2" fill="currentColor" stroke="none" opacity="0.3"/>`
          )
          .join('');
      },
    },

    // Numerales mayas: m0 a m19. Puntos valen 1, barras 5 y la concha 0.
    maya: {
      viewBox: '0 0 32 32',
      vertical: true,
      compositional: true,
      glyph(id) {
        const match = /^m(\d{1,2})$/.exec(id);
        if (!match) return null;
        const n = Number(match[1]);
        if (n > 19) return null;
        if (n === 0) {
          return '<path d="M5 19 C5 10 27 10 27 19 C27 23 5 23 5 19 Z M10 17 C14 14 18 14 22 17 M11 20 H21"/>';
        }
        const bars = Math.floor(n / 5);
        const dots = n % 5;
        // Centrado vertical: cada barra ocupa 6 unidades y la fila de puntos otras 6.
        const height = bars * 6 + (dots ? 6 : 0) - 2;
        const bottom = 16 + height / 2;
        let out = '';
        for (let i = 0; i < bars; i++) {
          out += `<rect x="4" y="${bottom - 4 - i * 6}" width="24" height="4" rx="1.5" ${FILLED}/>`;
        }
        const dotY = bottom - bars * 6 - 2;
        for (let i = 0; i < dots; i++) {
          out += `<circle cx="${16 - (dots - 1) * 3 + i * 6}" cy="${dotY}" r="2.6" ${FILLED}/>`;
        }
        return out;
      },
    },
  };

  function glyphMarkup(scriptId, glyphId) {
    const script = SCRIPTS[scriptId];
    if (!script) return null;
    if (script.glyph) return script.glyph(glyphId);
    return Object.prototype.hasOwnProperty.call(script.glyphs, glyphId) ? script.glyphs[glyphId] : null;
  }

  function glyphSvg(scriptId, glyphId) {
    const inner = glyphMarkup(scriptId, glyphId);
    const script = SCRIPTS[scriptId];
    return (
      `<svg class="glyph-svg" viewBox="${script.viewBox}" fill="none" stroke="currentColor" stroke-width="2" ` +
      `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`
    );
  }

  const Scripts = { SCRIPTS, glyphMarkup, glyphSvg };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scripts;
  } else {
    root.Scripts = Scripts;
  }
})(this);
