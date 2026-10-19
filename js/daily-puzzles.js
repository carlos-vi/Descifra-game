// Banco de puzzles del reto diario. Mismo formato que js/puzzles.js.
// Cada día toca el siguiente; al acabarse, vuelve a empezar.
(function (root) {
  'use strict';

  const DAILY_PUZZLES = [
    {
      id: 'diario-veru',
      title: 'La acción primero',
      language: 'veru',
      intro: 'En veru las frases empiezan de una forma poco habitual.',
      corpus: [
        { text: 'pak tori mun', translation: 'el gato ve al ratón' },
        { text: 'sa mun kesu', translation: 'el ratón come el queso' },
        { text: 'pak eli tori', translation: 'la niña ve al gato' },
        { text: 'sa eli kesu', translation: 'la niña come el queso' },
      ],
      glossary: {
        pak: 'ver',
        sa: 'comer',
        tori: 'gato',
        mun: 'ratón',
        eli: 'niña',
        kesu: 'queso',
      },
      rules: [
        'El verbo va al principio de la frase.',
        'Después del verbo va quien hace la acción y luego lo que la recibe.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'pak mun eli',
          answer: ['el', 'ratón', 've', 'a', 'la', 'niña'],
          distractors: ['al', 'gato', 'come'],
        },
        {
          type: 'to-language',
          prompt: 'el gato come el queso',
          answer: ['sa', 'tori', 'kesu'],
          distractors: ['pak', 'mun', 'eli'],
        },
        {
          type: 'to-language',
          prompt: 'la niña ve al ratón',
          answer: ['pak', 'eli', 'mun'],
          distractors: ['sa', 'tori', 'kesu'],
        },
      ],
    },
    {
      id: 'diario-amara',
      title: 'Decir que no',
      language: 'amara',
      intro: 'Un vecino amara describe lo que hacen (y lo que no hacen) sus animales.',
      corpus: [
        { text: 'dor lai', translation: 'el perro ladra' },
        { text: 'dor laima', translation: 'el perro no ladra' },
        { text: 'fen sul', translation: 'el gato duerme' },
        { text: 'fen sulma', translation: 'el gato no duerme' },
        { text: 'kin kom', translation: 'el niño come' },
      ],
      glossary: {
        dor: 'perro',
        fen: 'gato',
        kin: 'niño',
        lai: 'ladrar',
        sul: 'dormir',
        kom: 'comer',
        '-ma': 'no (negación)',
      },
      rules: ['La negación es un sufijo que se añade al verbo.'],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'kin sulma',
          answer: ['el', 'niño', 'no', 'duerme'],
          distractors: ['ladra', 'come', 'gato'],
        },
        {
          type: 'to-spanish',
          prompt: 'dor komma',
          answer: ['el', 'perro', 'no', 'come'],
          distractors: ['ladra', 'niño', 'duerme'],
        },
        {
          type: 'to-language',
          prompt: 'el gato no ladra',
          answer: ['fen', 'laima'],
          distractors: ['lai', 'dor', 'sulma'],
        },
      ],
    },
    {
      id: 'diario-tesh',
      title: '¿De quién es?',
      language: 'tesh',
      intro: 'En tesh no hace falta decir «es», pero sí indicar a quién pertenece cada cosa.',
      corpus: [
        { text: 'mira hal', translation: 'la casa es grande' },
        { text: 'tamko mira hal', translation: 'la casa del hombre es grande' },
        { text: 'lisako dum hal', translation: 'el perro de la mujer es grande' },
        { text: 'lisako mira nep', translation: 'la casa de la mujer es pequeña' },
        { text: 'tam nep', translation: 'el hombre es pequeño' },
      ],
      glossary: {
        mira: 'casa',
        tam: 'hombre',
        lisa: 'mujer',
        dum: 'perro',
        hal: 'grande',
        nep: 'pequeño',
        '-ko': 'de (dueño)',
      },
      rules: [
        'El verbo «ser» no se escribe.',
        'El dueño va delante de lo que posee y lleva un sufijo.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'tamko dum nep',
          answer: ['el', 'perro', 'del', 'hombre', 'es', 'pequeño'],
          distractors: ['pequeña', 'de', 'la', 'grande'],
        },
        {
          type: 'to-language',
          prompt: 'la casa del perro es pequeña',
          answer: ['dumko', 'mira', 'nep'],
          distractors: ['dum', 'tamko', 'hal'],
        },
        {
          type: 'to-spanish',
          prompt: 'lisa hal',
          answer: ['la', 'mujer', 'es', 'grande'],
          distractors: ['el', 'de', 'pequeña'],
        },
      ],
    },
    {
      id: 'diario-nuvi',
      title: 'Yo, tú y él',
      language: 'nuvi',
      intro: 'En nuvi no se dicen «yo» ni «tú»: el verbo ya lo indica.',
      corpus: [
        { text: 'belani', translation: 'yo canto' },
        { text: 'belasu', translation: 'tú cantas' },
        { text: 'rin bela', translation: 'el niño canta' },
        { text: 'dumoni', translation: 'yo corro' },
        { text: 'rin lop', translation: 'el niño duerme' },
      ],
      glossary: {
        rin: 'niño',
        bela: 'cantar',
        dumo: 'correr',
        lop: 'dormir',
        '-ni': 'yo',
        '-su': 'tú',
      },
      rules: [
        'La persona se marca con un sufijo en el verbo.',
        'Si el verbo no lleva sufijo, la acción la hace él o ella.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'lopsu',
          answer: ['tú', 'duermes'],
          distractors: ['yo', 'duermo', 'duerme', 'corres'],
        },
        {
          type: 'to-spanish',
          prompt: 'rin dumo',
          answer: ['el', 'niño', 'corre'],
          distractors: ['corro', 'corres', 'yo'],
        },
        {
          type: 'to-language',
          prompt: 'yo duermo',
          answer: ['lopni'],
          distractors: ['lopsu', 'lop', 'belani'],
        },
      ],
    },
    {
      id: 'diario-korra',
      title: 'Dónde ocurre',
      language: 'korra',
      intro: 'Los korra indican el lugar de una forma muy compacta.',
      corpus: [
        { text: 'tori lop', translation: 'el gato duerme' },
        { text: 'tori mirata lop', translation: 'el gato duerme en la casa' },
        { text: 'pel kaita suk', translation: 'el pájaro come en el árbol' },
        { text: 'pel lop', translation: 'el pájaro duerme' },
        { text: 'tori suk', translation: 'el gato come' },
      ],
      glossary: {
        tori: 'gato',
        pel: 'pájaro',
        mira: 'casa',
        kai: 'árbol',
        lop: 'dormir',
        suk: 'comer',
        '-ta': 'en',
      },
      rules: [
        'El verbo va al final.',
        'El lugar lleva un sufijo en vez de la palabra «en».',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'pel mirata suk',
          answer: ['el', 'pájaro', 'come', 'en', 'la', 'casa'],
          distractors: ['duerme', 'árbol', 'del'],
        },
        {
          type: 'to-language',
          prompt: 'el gato duerme en el árbol',
          answer: ['tori', 'kaita', 'lop'],
          distractors: ['kai', 'suk', 'mirata'],
        },
        {
          type: 'to-spanish',
          prompt: 'tori kaita suk',
          answer: ['el', 'gato', 'come', 'en', 'el', 'árbol'],
          distractors: ['duerme', 'la', 'casa'],
        },
      ],
    },
    {
      id: 'diario-lomba',
      title: 'Contar con la mano',
      language: 'lomba',
      intro: 'Los lomba cuentan usando la mano. Descubre cómo forman los números.',
      corpus: [
        { text: 'nu dor', translation: 'un perro' },
        { text: 'ba dor', translation: 'dos perros' },
        { text: 'ki kat', translation: 'tres gatos' },
        { text: 'lom dor', translation: 'cinco perros' },
        { text: 'lom ba kat', translation: 'siete gatos' },
        { text: 'ba lom kat', translation: 'diez gatos' },
      ],
      glossary: {
        nu: 'uno',
        ba: 'dos',
        ki: 'tres',
        lom: 'cinco (una mano)',
        dor: 'perro',
        kat: 'gato',
      },
      rules: [
        'El nombre no cambia en plural.',
        'Un número detrás de «lom» se suma a cinco.',
        'Un número delante de «lom» multiplica a cinco.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'lom ki dor',
          answer: ['ocho', 'perros'],
          distractors: ['quince', 'seis', 'perro', 'gatos'],
        },
        {
          type: 'to-spanish',
          prompt: 'ki lom kat',
          answer: ['quince', 'gatos'],
          distractors: ['ocho', 'nueve', 'gato', 'perros'],
        },
        {
          type: 'to-language',
          prompt: 'seis perros',
          answer: ['lom', 'nu', 'dor'],
          distractors: ['ba', 'ki', 'kat'],
        },
      ],
    },
    {
      id: 'diario-sumu',
      title: 'Orden libre',
      language: 'sumu',
      intro: 'En sumu las palabras se pueden mover, pero algo indica quién recibe la acción.',
      corpus: [
        { text: 'tam dumu sum', translation: 'el hombre ve al perro' },
        { text: 'dumu tam sum', translation: 'el hombre ve al perro' },
        { text: 'lisa tamu sum', translation: 'la mujer ve al hombre' },
        { text: 'lisau dum kel', translation: 'el perro muerde a la mujer' },
      ],
      glossary: {
        tam: 'hombre',
        lisa: 'mujer',
        dum: 'perro',
        sum: 'ver',
        kel: 'morder',
        '-u': 'marca de quien recibe la acción',
      },
      rules: [
        'El verbo va al final.',
        'Quien recibe la acción lleva un sufijo, así que el orden de las demás palabras es libre.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'tamu dum kel',
          answer: ['el', 'perro', 'muerde', 'al', 'hombre'],
          distractors: ['ve', 'a', 'la', 'mujer'],
        },
        {
          type: 'to-spanish',
          prompt: 'lisau tam sum',
          answer: ['el', 'hombre', 've', 'a', 'la', 'mujer'],
          distractors: ['al', 'muerde', 'perro'],
        },
        {
          type: 'to-spanish',
          prompt: 'dum lisau sum',
          answer: ['el', 'perro', 've', 'a', 'la', 'mujer'],
          distractors: ['al', 'muerde', 'hombre'],
        },
      ],
    },
  ];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DAILY_PUZZLES;
  } else {
    root.DAILY_PUZZLES = DAILY_PUZZLES;
  }
})(this);
