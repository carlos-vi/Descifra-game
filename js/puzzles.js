// Puzzles del juego.
//
// Formato de cada puzzle:
// - corpus: frases de ejemplo con su traducción (la "piedra Rosetta").
// - glossary: significado de cada raíz o sufijo (los sufijos empiezan por "-").
//   Se usa para las pistas y para comprobar en los tests que los retos son deducibles.
// - rules: reglas gramaticales que se revelan como pistas, de la más suave a la más directa.
// - challenges: "to-spanish" (prompt en la lengua, respuesta en español) o
//   "to-language" (al revés). La respuesta se construye con fichas: answer + distractors.
(function (root) {
  'use strict';

  const PUZZLES = [
    {
      id: 'tilo',
      title: 'Primeras palabras',
      language: 'tilo',
      intro:
        'En una tablilla de barro aparecen cuatro frases en tilo con su traducción. ' +
        'Compara las frases y averigua qué significa cada palabra.',
      corpus: [
        { text: 'mena saru tobi', translation: 'la niña ve al perro' },
        { text: 'tobi kipa lun', translation: 'el perro come el pan' },
        { text: 'osa saru lun', translation: 'el gato ve el pan' },
        { text: 'mena kipa lun', translation: 'la niña come el pan' },
      ],
      glossary: {
        mena: 'niña',
        tobi: 'perro',
        osa: 'gato',
        lun: 'pan',
        saru: 'ver',
        kipa: 'comer',
      },
      rules: [
        'El orden de las palabras es el mismo que en español.',
        'El tilo no tiene artículos: «el», «la» o la «a» de «al» no se escriben.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'tobi saru osa',
          answer: ['el', 'perro', 've', 'al', 'gato'],
          distractors: ['la', 'niña', 'come', 'el'],
        },
        {
          type: 'to-language',
          prompt: 'el gato come el pan',
          answer: ['osa', 'kipa', 'lun'],
          distractors: ['mena', 'saru', 'tobi'],
        },
      ],
    },
    {
      id: 'kaluni',
      title: 'Más de uno',
      language: 'kaluní',
      intro:
        'Un pastor kaluní dejó estas notas sobre sus animales. ' +
        'Fíjate en lo que cambia cuando hay más de uno.',
      corpus: [
        { text: 'kala miru', translation: 'el perro come' },
        { text: 'kalan miru', translation: 'los perros comen' },
        { text: 'sela vato', translation: 'la niña duerme' },
        { text: 'pesun vato', translation: 'los pájaros duermen' },
        { text: 'sela miru', translation: 'la niña come' },
      ],
      glossary: {
        kala: 'perro',
        sela: 'niña',
        pesu: 'pájaro',
        miru: 'comer',
        vato: 'dormir',
        '-n': 'plural',
      },
      rules: [
        'Para formar el plural se añade un sufijo al nombre.',
        'El verbo no cambia aunque el sujeto sea plural.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'selan miru',
          answer: ['las', 'niñas', 'comen'],
          distractors: ['la', 'niña', 'come', 'duermen'],
        },
        {
          type: 'to-spanish',
          prompt: 'pesu vato',
          answer: ['el', 'pájaro', 'duerme'],
          distractors: ['los', 'pájaros', 'duermen', 'come'],
        },
        {
          type: 'to-language',
          prompt: 'los perros duermen',
          answer: ['kalan', 'vato'],
          distractors: ['kala', 'miru', 'selan'],
        },
      ],
    },
    {
      id: 'oruk',
      title: 'El verbo al final',
      language: 'oruk',
      intro:
        'Los oruk escriben las frases en un orden distinto al nuestro. ' +
        'Descubre dónde colocan cada palabra.',
      corpus: [
        { text: 'tam nara veki', translation: 'el hombre bebe agua' },
        { text: 'lisa poko hapa', translation: 'la mujer come el pez' },
        { text: 'tam poko sum', translation: 'el hombre ve el pez' },
        { text: 'lisa nara sum', translation: 'la mujer ve el agua' },
        { text: 'lisa tam sum', translation: 'la mujer ve al hombre' },
      ],
      glossary: {
        tam: 'hombre',
        lisa: 'mujer',
        poko: 'pez',
        nara: 'agua',
        sum: 'ver',
        hapa: 'comer',
        veki: 'beber',
      },
      rules: [
        'El verbo siempre va al final de la frase.',
        'Primero va quien hace la acción y después lo que la recibe.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'tam lisa sum',
          answer: ['el', 'hombre', 've', 'a', 'la', 'mujer'],
          distractors: ['al', 'come'],
        },
        {
          type: 'to-language',
          prompt: 'el hombre come el pez',
          answer: ['tam', 'poko', 'hapa'],
          distractors: ['lisa', 'sum', 'nara'],
        },
        {
          type: 'to-language',
          prompt: 'la mujer bebe agua',
          answer: ['lisa', 'nara', 'veki'],
          distractors: ['tam', 'poko', 'sum'],
        },
      ],
    },
    {
      id: 'sefi',
      title: 'Ayer y mañana',
      language: 'sefi',
      intro:
        'Un cronista sefi anotó lo que pasó, lo que pasa y lo que pasará. ' +
        'Busca las palabras que marcan el tiempo.',
      corpus: [
        { text: 'rin bela', translation: 'el niño canta' },
        { text: 'rin ko bela', translation: 'el niño cantó' },
        { text: 'sau na dumo', translation: 'el pájaro correrá' },
        { text: 'sau dumo', translation: 'el pájaro corre' },
        { text: 'rin na lop', translation: 'el niño dormirá' },
      ],
      glossary: {
        rin: 'niño',
        sau: 'pájaro',
        bela: 'cantar',
        dumo: 'correr',
        lop: 'dormir',
        ko: 'pasado',
        na: 'futuro',
      },
      rules: [
        'El tiempo verbal se indica con una palabra antes del verbo.',
        'Si no hay ninguna palabra de tiempo, la frase está en presente.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'sau ko lop',
          answer: ['el', 'pájaro', 'durmió'],
          distractors: ['duerme', 'dormirá', 'niño', 'corrió'],
        },
        {
          type: 'to-spanish',
          prompt: 'rin ko dumo',
          answer: ['el', 'niño', 'corrió'],
          distractors: ['correrá', 'corre', 'pájaro'],
        },
        {
          type: 'to-language',
          prompt: 'el pájaro cantará',
          answer: ['sau', 'na', 'bela'],
          distractors: ['ko', 'rin', 'lop'],
        },
      ],
    },
    {
      id: 'zuneri',
      title: 'La gran prueba',
      language: 'zuneri',
      intro:
        'Los zuneri combinan todo lo que has visto: orden propio, plurales, ' +
        'tiempos y adjetivos. Es el último texto de la colección.',
      corpus: [
        { text: 'gor mira dak', translation: 'el lobo ve la casa' },
        { text: 'gor mira dakek', translation: 'el lobo vio la casa' },
        { text: 'gorli mira dak', translation: 'los lobos ven la casa' },
        { text: 'hun gor nevi mira dak', translation: 'el lobo grande ve la casa blanca' },
        { text: 'tobu nevi gor dak', translation: 'el niño ve al lobo blanco' },
      ],
      glossary: {
        gor: 'lobo',
        mira: 'casa',
        tobu: 'niño',
        dak: 'ver',
        hun: 'grande',
        nevi: 'blanco',
        '-li': 'plural',
        '-ek': 'pasado',
      },
      rules: [
        'El verbo va al final, como en oruk.',
        'Los adjetivos van delante del nombre.',
        'Los sufijos marcan el plural (en el nombre) y el pasado (en el verbo). Los adjetivos no cambian.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'tobuli mira dakek',
          answer: ['los', 'niños', 'vieron', 'la', 'casa'],
          distractors: ['niño', 'vio', 'ven', 'el'],
        },
        {
          type: 'to-spanish',
          prompt: 'hun tobuli nevi gor dakek',
          answer: ['los', 'niños', 'grandes', 'vieron', 'al', 'lobo', 'blanco'],
          distractors: ['niño', 'grande', 'vio', 'ven', 'el'],
        },
        {
          type: 'to-language',
          prompt: 'los lobos blancos ven la casa grande',
          answer: ['nevi', 'gorli', 'hun', 'mira', 'dak'],
          distractors: ['gor', 'dakek', 'tobu', 'mirali'],
        },
      ],
    },
  ];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PUZZLES;
  } else {
    root.PUZZLES = PUZZLES;
  }
})(this);
