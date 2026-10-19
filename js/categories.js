// Categorías de niveles. Cada nivel tiene una categoría y una dificultad de 1 a 5.
// El icono es un dibujo SVG de 24 × 24 con trazos.
(function (root) {
  'use strict';

  const CATEGORIES = [
    {
      id: 'primeros',
      title: 'Primeros pasos',
      description: 'Vocabulario, plurales, orden de palabras y tiempos: lo básico para descifrar.',
      icon: '<path d="M8 4 C5 4 4 8 5 11 C6 14 9 14 9 11 C9 8 10 4 8 4 Z M16 10 C13 10 12 14 13 17 C14 20 17 20 17 17 C17 14 18 10 16 10 Z"/>',
    },
    {
      id: 'frases',
      title: 'Frases',
      description: 'Quién hace qué a quién: casos, concordancia y verbos que lo dicen todo.',
      icon: '<path d="M4 6 H20 M4 12 H14 M4 18 H17"/><circle cx="19" cy="15" r="2"/>',
    },
    {
      id: 'piezas',
      title: 'Piezas de palabras',
      description: 'Palabras que se construyen con piezas: sufijos, infijos, repeticiones y raíces.',
      icon: '<path d="M4 9 H8 A2 2 0 1 1 12 9 H16 V13 A2 2 0 1 1 16 17 V20 H4 Z"/>',
    },
    {
      id: 'significado',
      title: 'Significado',
      description: 'Cómo reparte cada lengua el mundo: familia, direcciones, formas y metáforas.',
      icon: '<circle cx="12" cy="12" r="8"/><path d="M12 4 C8 8 8 16 12 20 C16 16 16 8 12 4 Z M4 12 H20"/>',
    },
    {
      id: 'sonidos',
      title: 'Sonidos',
      description: 'Tonos, vocales que se contagian y lenguas hermanas que cambian con el tiempo.',
      icon: '<path d="M3 12 H5 M7 8 V16 M11 5 V19 M15 9 V15 M19 11 V13"/>',
    },
    {
      id: 'numeros',
      title: 'Números',
      description: 'Contar de veinte en veinte, de seis en seis o hacia atrás.',
      icon: '<path d="M5 8 L8 5 V19 M12 8 C12 5 18 5 18 8 C18 11 12 14 12 19 H18"/>',
    },
    {
      id: 'escrituras',
      title: 'Escrituras',
      description: 'Descifra símbolos: alfabetos, braille, sílabas en cartuchos y jeroglíficos.',
      icon: '<path d="M3 12 C7 6 17 6 21 12 C17 18 7 18 3 12 Z"/><circle cx="12" cy="12" r="2.5"/>',
    },
    {
      id: 'olimpiada',
      title: 'Olimpiada',
      description: 'Traducciones desordenadas que primero hay que emparejar. Para expertos.',
      icon: '<circle cx="12" cy="14" r="6"/><path d="M9 3 L12 8 L15 3 M12 11 V17 M10 13 L12 11"/>',
    },
  ];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CATEGORIES;
  } else {
    root.CATEGORIES = CATEGORIES;
  }
})(this);
