// Puzzles del juego.
//
// Formato de cada puzzle:
// - corpus: frases de ejemplo con su traducción (la "piedra Rosetta").
// - glossary: significado de cada raíz o sufijo (los sufijos empiezan por "-").
//   Se usa para las pistas y para comprobar en los tests que los retos son deducibles.
// - rules: reglas gramaticales que se revelan como pistas, de la más suave a la más directa.
// - challenges: "to-spanish" (prompt en la lengua, respuesta en español) o
//   "to-language" (al revés). La respuesta se construye con fichas: answer + distractors.
//   Con morphemes: true las fichas son raíces y afijos ("tam", "-ne", "ni-").
//   "alternatives" lista otras respuestas también válidas.
//   "choice": prompt + options + correct (índice). Con optionsLanguage: true las
//   opciones están en la lengua (por ejemplo, para buscar la frase incorrecta).
//   "match": emparejar el corpus con sus traducciones; requiere scrambled: true y
//   debe ser el primer reto.
// - tier: iniciacion, intermedio, avanzado, olimpiada o escrituras.
// - script: escritura de glifos (js/scripts.js). Las palabras se escriben como
//   glifos unidos por puntos ("ma.ri.na") y los retos to-language usan glyphs: true.
// - display (en "choice"): texto en la lengua que se muestra con la pregunta.
// - compound (con morphemes): las piezas forman una sola palabra compuesta.
// - topics: artículos de la sección Aprende relacionados (js/learn.js).
// - corpus[].segmented: la frase con los morfemas separados por guiones. Se usa
//   para comprobar el puzzle y para mostrar el análisis al terminar.
(function (root) {
  'use strict';

  const PUZZLES = [
    {
      id: 'tilo',
      tier: 'iniciacion',
      topics: ['orden'],
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
      tier: 'iniciacion',
      topics: ['aglutinacion'],
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
      tier: 'iniciacion',
      topics: ['orden'],
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
      tier: 'iniciacion',
      topics: ['tiempo'],
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
      tier: 'iniciacion',
      topics: ['orden', 'aglutinacion'],
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
    // ---------- Intermedio ----------
    {
      id: 'olu',
      tier: 'intermedio',
      topics: ['armonia', 'aglutinacion'],
      title: 'Las vocales mandan',
      language: 'olu',
      intro:
        'En olu las palabras se construyen añadiendo sufijos, pero los sufijos no siempre suenan igual. ' +
        'Descubre qué decide su forma.',
      corpus: [
        { text: 'tolular uyu', segmented: 'tolu-lar uyu', translation: 'los pájaros duermen' },
        { text: 'tolu sekide ote', segmented: 'tolu seki-de ote', translation: 'el pájaro canta en la casa' },
        { text: 'tolu maruda uyu', segmented: 'tolu maru-da uyu', translation: 'el pájaro duerme en el barco' },
        { text: 'tolular benide ote', segmented: 'tolu-lar beni-de ote', translation: 'los pájaros cantan en el árbol' },
        { text: 'kanu marularda uyu', segmented: 'kanu maru-lar-da uyu', translation: 'el gato duerme en los barcos' },
        { text: 'kanular benilerde uyu', segmented: 'kanu-lar beni-ler-de uyu', translation: 'los gatos duermen en los árboles' },
      ],
      glossary: {
        tolu: 'pájaro',
        kanu: 'gato',
        maru: 'barco',
        seki: 'casa',
        beni: 'árbol',
        uyu: 'dormir',
        ote: 'cantar',
        '-lar': 'plural (tras a, o, u)',
        '-ler': 'plural (tras e, i)',
        '-da': 'en (tras a, o, u)',
        '-de': 'en (tras e, i)',
      },
      rules: [
        'El verbo va al final.',
        'Los sufijos se añaden en este orden: primero el plural y después «en».',
        'Cada sufijo tiene dos formas: con a, o, u se usan -lar y -da; con e, i, se usan -ler y -de.',
      ],
      challenges: [
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'los pájaros cantan en las casas',
          answer: ['tolu', '-lar', 'seki', '-ler', '-de', 'ote'],
          distractors: ['-da', 'uyu', 'maru'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'el gato duerme en la casa',
          answer: ['kanu', 'seki', '-de', 'uyu'],
          distractors: ['-da', '-lar', 'ote'],
        },
        {
          type: 'to-spanish',
          prompt: 'tolu benide uyu',
          answer: ['el', 'pájaro', 'duerme', 'en', 'el', 'árbol'],
          distractors: ['los', 'pájaros', 'canta', 'la'],
        },
        {
          type: 'choice',
          prompt: '¿De qué depende que el plural sea -lar o -ler?',
          options: [
            'De las vocales de la palabra',
            'De si es un animal o una cosa',
            'Del verbo de la frase',
            'De dónde ocurre la acción',
          ],
          correct: 0,
        },
      ],
    },
    {
      id: 'ankor',
      tier: 'intermedio',
      topics: ['ergatividad', 'orden'],
      title: 'Quien hace y quien sufre',
      language: 'ankor',
      intro:
        'Los ankor marcan de forma especial a algunas de las personas que hacen una acción, ' +
        'pero no a todas. Averigua a cuáles.',
      corpus: [
        { text: 'tam lopa', segmented: 'tam lop-a', translation: 'el hombre duerme' },
        { text: 'tamne dum kesa', segmented: 'tam-ne dum kes-a', translation: 'el hombre golpea al perro' },
        { text: 'dumne tam kesu', segmented: 'dum-ne tam kes-u', translation: 'el perro golpeó al hombre' },
        { text: 'lisa nuku', segmented: 'lisa nuk-u', translation: 'la mujer lloró' },
        { text: 'lisane bor sima', segmented: 'lisa-ne bor sim-a', translation: 'la mujer come el pan' },
        { text: 'dum lopu', segmented: 'dum lop-u', translation: 'el perro durmió' },
      ],
      glossary: {
        tam: 'hombre',
        lisa: 'mujer',
        dum: 'perro',
        bor: 'pan',
        lop: 'dormir',
        nuk: 'llorar',
        kes: 'golpear',
        sim: 'comer',
        '-a': 'presente',
        '-u': 'pasado',
        '-ne': 'agente (quien actúa sobre otro)',
      },
      rules: [
        'El verbo va al final y lleva un sufijo de tiempo: -a presente, -u pasado.',
        'Quien recibe la acción no lleva ninguna marca.',
        'El sufijo -ne marca a quien hace una acción que recae sobre otro. Quien duerme o llora no lo lleva.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'lisane dum kesu',
          answer: ['la', 'mujer', 'golpeó', 'al', 'perro'],
          distractors: ['el', 'golpea', 'a', 'hombre'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'el perro come el pan',
          answer: ['dum', '-ne', 'bor', 'sim', '-a'],
          distractors: ['lop', '-u', 'tam'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'el hombre lloró',
          answer: ['tam', 'nuk', '-u'],
          distractors: ['-ne', '-a', 'lisa'],
        },
        {
          type: 'choice',
          prompt: '¿Cuándo lleva una palabra el sufijo -ne?',
          options: [
            'Siempre que hace la acción',
            'Cuando hace una acción que recae sobre otro',
            'Cuando recibe la acción',
            'Cuando la frase está en pasado',
          ],
          correct: 1,
        },
      ],
    },
    {
      id: 'ntaba',
      tier: 'intermedio',
      topics: ['clases'],
      title: 'Todo concuerda',
      language: 'ntaba',
      intro:
        'En ntaba cada nombre pertenece a una clase, y esa clase deja huella en otras palabras de la frase.',
      corpus: [
        { text: 'mukana atula', segmented: 'mu-kana a-tula', translation: 'el niño duerme' },
        { text: 'bakana batula', segmented: 'ba-kana ba-tula', translation: 'los niños duermen' },
        { text: 'kisanda kilala', segmented: 'ki-sanda ki-lala', translation: 'la cesta se cae' },
        { text: 'bisanda binene bilala', segmented: 'bi-sanda bi-nene bi-lala', translation: 'las cestas grandes se caen' },
        { text: 'mulume musota aimba', segmented: 'mu-lume mu-sota a-imba', translation: 'el hombre pequeño canta' },
        { text: 'kipewa kisota kilala', segmented: 'ki-pewa ki-sota ki-lala', translation: 'la piedra pequeña se cae' },
      ],
      glossary: {
        kana: 'niño',
        lume: 'hombre',
        sanda: 'cesta',
        pewa: 'piedra',
        nene: 'grande',
        sota: 'pequeño',
        tula: 'dormir',
        lala: 'caerse',
        imba: 'cantar',
        'mu-': 'persona (singular)',
        'ba-': 'personas (plural)',
        'ki-': 'cosa (singular)',
        'bi-': 'cosas (plural)',
        'a-': 'persona (singular) en el verbo',
      },
      rules: [
        'Cada nombre lleva un prefijo según su clase: persona o cosa, singular o plural.',
        'El adjetivo va detrás del nombre y copia su prefijo.',
        'El verbo también concuerda: ki- y bi- para cosas; a- y ba- para personas.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'balume banene baimba',
          answer: ['los', 'hombres', 'grandes', 'cantan'],
          distractors: ['el', 'hombre', 'grande', 'canta', 'pequeños'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'la cesta grande se cae',
          answer: ['ki-', 'sanda', 'ki-', 'nene', 'ki-', 'lala'],
          distractors: ['mu-', 'a-', 'bi-', 'sota'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'los niños pequeños cantan',
          answer: ['ba-', 'kana', 'ba-', 'sota', 'ba-', 'imba'],
          distractors: ['mu-', 'a-', 'bi-', 'nene'],
        },
        {
          type: 'choice',
          prompt: 'Una de estas frases tiene un error. ¿Cuál?',
          optionsLanguage: true,
          options: ['mukana musota atula', 'kisanda kinene alala', 'bakana banene batula', 'bisanda bisota bilala'],
          correct: 1,
        },
      ],
    },
    {
      id: 'kenna',
      tier: 'intermedio',
      topics: ['compuestos'],
      title: 'Palabras que se juntan',
      language: 'kenna',
      intro:
        'Los kenna tienen pocas palabras, pero las combinan para nombrar casi cualquier cosa. ' +
        'Descubre cómo se forman sus palabras compuestas.',
      corpus: [
        { text: 'nam', translation: 'agua' },
        { text: 'tok', translation: 'ojo' },
        { text: 'namtok', segmented: 'nam-tok', translation: 'lágrima' },
        { text: 'kum', translation: 'montaña' },
        { text: 'vel', translation: 'fuego' },
        { text: 'kumvel', segmented: 'kum-vel', translation: 'volcán' },
        { text: 'sel', translation: 'casa' },
        { text: 'selpira', segmented: 'sel-pira', translation: 'nido' },
        { text: 'sellibu', segmented: 'sel-libu', translation: 'biblioteca' },
        { text: 'ten', translation: 'cielo' },
      ],
      glossary: {
        nam: 'agua',
        tok: 'ojo',
        kum: 'montaña',
        vel: 'fuego',
        sel: 'casa',
        pira: 'pájaro',
        libu: 'libro',
        ten: 'cielo',
      },
      rules: [
        'Las palabras compuestas se forman uniendo dos raíces.',
        'Primero va la cosa y después «de qué» es: «nam-tok», agua del ojo, es una lágrima.',
      ],
      challenges: [
        {
          type: 'choice',
          prompt: '¿Qué significa esta palabra?',
          display: 'kumnam',
          options: ['una ola (una montaña de agua)', 'un río (el agua de la montaña)', 'un lago', 'una nube'],
          correct: 0,
        },
        {
          type: 'choice',
          prompt: '¿Y esta?',
          display: 'tokten',
          options: ['el sol', 'una nube', 'la lluvia', 'un pájaro'],
          correct: 0,
        },
        {
          type: 'to-language',
          morphemes: true,
          compound: true,
          prompt: 'la lluvia (el agua del cielo)',
          answer: ['nam', 'ten'],
          distractors: ['tok', 'kum', 'sel'],
        },
        {
          type: 'to-language',
          morphemes: true,
          compound: true,
          prompt: 'un fénix (un pájaro de fuego)',
          answer: ['pira', 'vel'],
          distractors: ['sel', 'tok', 'ten'],
        },
        {
          type: 'choice',
          prompt: '¿En qué orden se forman las palabras compuestas en kenna?',
          options: [
            'Primero la cosa y después «de qué» es',
            'Primero «de qué» es y después la cosa',
            'El orden da igual',
            'Depende de si es un ser vivo',
          ],
          correct: 0,
        },
      ],
    },
    // ---------- Avanzado ----------
    {
      id: 'ikoa',
      tier: 'avanzado',
      topics: ['polipersonal'],
      title: 'Yo te veo',
      language: 'ikoa',
      intro:
        'En ikoa una sola palabra puede ser una frase entera. Separa sus piezas para saber quién hace qué a quién.',
      corpus: [
        { text: 'nitisale', segmented: 'ni-ti-sal-e', translation: 'yo te veo' },
        { text: 'kamisalo', segmented: 'ka-mi-sal-o', translation: 'tú me viste' },
        { text: 'amipake', segmented: 'a-mi-pak-e', translation: 'él me ayuda' },
        { text: 'tama atirumo', segmented: 'tama a-ti-rum-o', translation: 'el padre te llamó' },
        { text: 'tama niupako', segmented: 'tama ni-u-pak-o', translation: 'yo ayudé al padre' },
        { text: 'kausale', segmented: 'ka-u-sal-e', translation: 'tú lo ves' },
      ],
      glossary: {
        tama: 'padre',
        sal: 'ver',
        pak: 'ayudar',
        rum: 'llamar',
        'ni-': 'yo',
        'ka-': 'tú',
        'a-': 'él/ella',
        'mi-': 'a mí',
        'ti-': 'a ti',
        'u-': 'a él/ella',
        '-e': 'presente',
        '-o': 'pasado',
      },
      rules: [
        'El verbo lleva dos prefijos: primero quién hace la acción y después quién la recibe.',
        'Al final del verbo va el tiempo: -e presente, -o pasado.',
        'Los nombres van delante del verbo, hagan o reciban la acción: los prefijos aclaran quién es quién.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'tama kaupake',
          answer: ['tú', 'ayudas', 'al', 'padre'],
          distractors: ['el', 'te', 'ayuda', 'ayudaste'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'tú me llamas',
          answer: ['ka-', 'mi-', 'rum', '-e'],
          distractors: ['ni-', 'ti-', '-o', 'a-'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'el padre me vio',
          answer: ['tama', 'a-', 'mi-', 'sal', '-o'],
          distractors: ['ni-', 'u-', '-e', 'ti-'],
        },
        {
          type: 'to-spanish',
          prompt: 'nitipako',
          answer: ['yo', 'te', 'ayudé'],
          distractors: ['me', 'ayudaste', 'tú', 'ayudo'],
        },
      ],
    },
    {
      id: 'sulpa',
      tier: 'avanzado',
      topics: ['evidencialidad', 'posesion'],
      title: 'Dicen que…',
      language: 'sulpa',
      intro:
        'Los sulpa son muy precisos: al contar algo indican de quién es cada cosa y cómo se han enterado.',
      corpus: [
        { text: 'tamari sunumi', segmented: 'tama-ri sunu-mi', translation: 'mi padre llegó' },
        { text: 'tamaka telasi', segmented: 'tama-ka tela-si', translation: 'dicen que tu padre se marchó' },
        { text: 'nina koloso kesimi', segmented: 'nina kolo-so kesi-mi', translation: 'la casa de la madre ardió' },
        { text: 'ipari telami', segmented: 'ipa-ri tela-mi', translation: 'mi perro se marchó' },
        { text: 'tama ipaso sunusi', segmented: 'tama ipa-so sunu-si', translation: 'dicen que el perro del padre llegó' },
        { text: 'koloka kesisi', segmented: 'kolo-ka kesi-si', translation: 'dicen que tu casa ardió' },
      ],
      glossary: {
        tama: 'padre',
        nina: 'madre',
        ipa: 'perro',
        kolo: 'casa',
        sunu: 'llegar',
        tela: 'marcharse',
        kesi: 'arder',
        '-ri': 'mi',
        '-ka': 'tu',
        '-so': 'su (de él/ella)',
        '-mi': 'lo vi yo',
        '-si': 'dicen que',
      },
      rules: [
        'Lo que se posee lleva un sufijo con su dueño: -ri (mi), -ka (tu), -so (su).',
        'El dueño va delante de lo poseído: «madre casa-su» es «la casa de la madre».',
        'El verbo indica cómo lo sabe quien habla: -mi si lo vio, -si si se lo contaron.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'ninaka ipaso telami',
          answer: ['el', 'perro', 'de', 'tu', 'madre', 'se', 'marchó'],
          distractors: ['dicen', 'que', 'mi', 'su'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'dicen que mi casa ardió',
          answer: ['kolo', '-ri', 'kesi', '-si'],
          distractors: ['-mi', '-ka', '-so', 'tama'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'dicen que la madre de mi padre llegó',
          answer: ['tama', '-ri', 'nina', '-so', 'sunu', '-si'],
          distractors: ['-ka', '-mi', 'kolo'],
        },
        {
          type: 'choice',
          prompt: '¿Qué indica el sufijo -mi?',
          options: [
            'Que quien habla lo vio con sus propios ojos',
            'Que la acción ocurrió en el pasado',
            'Que algo es mío',
            'Que la frase es una pregunta',
          ],
          correct: 0,
        },
      ],
    },
    {
      id: 'oruna',
      tier: 'avanzado',
      topics: ['parentesco'],
      title: 'La familia de Ana',
      language: 'oruna',
      intro:
        'Ana habla oruna y nos ha contado cómo llama a cada miembro de su familia. ' +
        'Los oruna no dividen la familia como nosotros: descubre su lógica.',
      corpus: [
        { text: 'aba', translation: 'Luis, el padre de Ana' },
        { text: 'aba', translation: 'Pablo, el hermano del padre de Ana' },
        { text: 'ena', translation: 'Eva, la madre de Ana' },
        { text: 'kodo', translation: 'Jorge, el hermano de la madre de Ana' },
        { text: 'ruta', translation: 'Rosa, la hermana del padre de Ana' },
        { text: 'sibo', translation: 'Tomás, el hermano de Ana' },
        { text: 'sibo', translation: 'Dani, el hijo de Pablo' },
        { text: 'mari', translation: 'Leo, el hijo de Rosa' },
        { text: 'mari', translation: 'Lía, la hija de Rosa' },
        { text: 'sila', translation: 'Nora, la hija de Marta, la hermana de la madre de Ana' },
      ],
      glossary: {
        aba: 'padre, o hermano del padre',
        ena: 'madre, o hermana de la madre',
        kodo: 'hermano de la madre',
        ruta: 'hermana del padre',
        sibo: 'hermano, o primo paralelo',
        sila: 'hermana, o prima paralela',
        mari: 'primo o prima cruzados',
      },
      rules: [
        'El hermano del padre se llama igual que el padre, y la hermana de la madre igual que la madre.',
        'Los hijos de quienes se llaman «aba» o «ena» son como hermanos: «sibo» o «sila».',
        'Los hijos de «kodo» y de «ruta» son «mari», sean chicos o chicas.',
      ],
      challenges: [
        {
          type: 'choice',
          prompt: '¿Cómo llama Ana a Marta, la hermana de su madre?',
          optionsLanguage: true,
          options: ['ena', 'ruta', 'kodo', 'sila'],
          correct: 0,
        },
        {
          type: 'choice',
          prompt: '¿Y a Iker, el hijo de Marta?',
          optionsLanguage: true,
          options: ['mari', 'sibo', 'aba', 'kodo'],
          correct: 1,
        },
        {
          type: 'choice',
          prompt: '¿Y a Sara, la hija de Jorge?',
          optionsLanguage: true,
          options: ['sila', 'mari', 'ena', 'ruta'],
          correct: 1,
        },
        {
          type: 'choice',
          prompt: '¿Cómo llama Dani, el hijo de Pablo, a Ana?',
          optionsLanguage: true,
          options: ['sila', 'mari', 'sibo', 'ena'],
          correct: 0,
        },
        {
          type: 'choice',
          prompt: '¿Qué tienen en común las personas a las que Ana llama «mari»?',
          options: [
            'Son hijos del hermano de la madre o de la hermana del padre',
            'Son hijos de cualquier tío o tía',
            'Son de la familia de la madre',
            'Son más pequeños que Ana',
          ],
          correct: 0,
        },
      ],
    },
    // ---------- Olimpiada ----------
    {
      id: 'tavaki',
      tier: 'olimpiada',
      topics: ['inclusivo', 'tiempo'],
      title: 'Tú y yo',
      language: 'tavaki',
      scrambled: true,
      intro:
        'Un pescador tavaki dictó estas frases, pero las traducciones se han mezclado. ' +
        'Empareja cada frase con su traducción y después resuelve los retos.',
      corpus: [
        { text: 'kaiku ika', segmented: 'kai-ku ika', translation: 'yo como pescado' },
        { text: 'nahoeta', segmented: 'na-hoe-ta', translation: 'tú y yo remaremos' },
        { text: 'tafumai vaka', segmented: 'tafu-mai vaka', translation: 'ellos y yo vemos la canoa' },
        { text: 'nakaimu ika', segmented: 'na-kai-mu ika', translation: 'tú comerás pescado' },
        { text: 'hoeta', segmented: 'hoe-ta', translation: 'tú y yo remamos' },
        { text: 'natafu vaka', segmented: 'na-tafu vaka', translation: 'él verá la canoa' },
        { text: 'tafuku ika', segmented: 'tafu-ku ika', translation: 'yo veo el pescado' },
        { text: 'hoemu', segmented: 'hoe-mu', translation: 'tú remas' },
      ],
      glossary: {
        kai: 'comer',
        hoe: 'remar',
        tafu: 'ver',
        ika: 'pescado',
        vaka: 'canoa',
        'na-': 'futuro',
        '-ku': 'yo',
        '-mu': 'tú',
        '-ta': 'nosotros (tú y yo)',
        '-mai': 'nosotros (sin ti)',
      },
      rules: [
        'El verbo va primero y lleva un sufijo de persona; sin sufijo, la acción la hace él o ella.',
        'na- delante del verbo indica futuro.',
        'Hay dos «nosotros»: -ta incluye a quien escucha (tú y yo) y -mai lo deja fuera (ellos y yo).',
      ],
      challenges: [
        { type: 'match' },
        {
          type: 'to-spanish',
          prompt: 'nahoemai',
          answer: ['ellos', 'y', 'yo', 'remaremos'],
          distractors: ['tú', 'remamos', 'comeremos'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'tú y yo veremos la canoa',
          answer: ['na-', 'tafu', '-ta', 'vaka'],
          distractors: ['-mai', '-mu', 'ika', '-ku'],
        },
        {
          type: 'to-language',
          morphemes: true,
          prompt: 'él come pescado',
          answer: ['kai', 'ika'],
          distractors: ['-ku', 'na-', '-mu', '-ta'],
        },
        {
          type: 'choice',
          prompt: '¿Qué diferencia hay entre -ta y -mai?',
          options: [
            '-ta incluye a quien escucha y -mai lo deja fuera',
            '-ta es presente y -mai es futuro',
            '-ta es singular y -mai es plural',
            'Ninguna: los dos significan «nosotros»',
          ],
          correct: 0,
        },
      ],
    },
    {
      id: 'senka',
      tier: 'olimpiada',
      topics: ['numeros'],
      title: 'Cuentas antiguas',
      language: 'senka',
      scrambled: true,
      intro:
        'En una tablilla de cuentas senka aparecen siete números escritos con palabras. ' +
        'Al lado hay siete cifras, pero en otro orden. Descubre cómo cuentan los senka.',
      corpus: [
        { text: 'sar', translation: '3' },
        { text: 'tak ne mok', translation: '10' },
        { text: 'tu tak', translation: '12' },
        { text: 'sar tak ne ul', translation: '19' },
        { text: 'pen tak ne pen', translation: '35' },
        { text: 'nuru ne tu', translation: '38' },
        { text: 'tu nuru ne tak', translation: '78' },
      ],
      glossary: {
        ul: '1',
        tu: '2',
        sar: '3',
        mok: '4',
        pen: '5',
        tak: '6',
        nuru: '36',
        ne: 'y (suma)',
      },
      rules: [
        '«tak» vale 6 y «nuru» vale 36 (6 × 6).',
        'Un número delante de «tak» o de «nuru» lo multiplica.',
        '«ne» suma, y las partes van de mayor a menor.',
      ],
      challenges: [
        { type: 'match' },
        {
          type: 'choice',
          prompt: '¿Qué número es «tu nuru ne sar tak»?',
          options: ['90', '78', '84', '108'],
          correct: 0,
        },
        {
          type: 'to-language',
          prompt: '29',
          answer: ['mok', 'tak', 'ne', 'pen'],
          distractors: ['sar', 'ne', 'nuru', 'tu'],
        },
        {
          type: 'to-language',
          prompt: '50',
          answer: ['nuru', 'ne', 'tu', 'tak', 'ne', 'tu'],
          distractors: ['sar', 'pen', 'ul'],
        },
        {
          type: 'choice',
          prompt: '¿Qué número es «sar nuru ne pen tak ne sar»?',
          options: ['141', '138', '147', '129'],
          correct: 0,
        },
      ],
    },
    // ---------- Escrituras ----------
    {
      id: 'runas',
      tier: 'escrituras',
      topics: ['escrituras'],
      script: 'runas',
      title: 'Un alfabeto nuevo',
      language: 'español en runas',
      intro:
        'En una cueva aparecen palabras talladas con símbolos desconocidos. Al lado, alguien escribió lo que dicen. ' +
        'Descubre qué letra es cada símbolo.',
      corpus: [
        { text: 's.o.l', translation: 'sol' },
        { text: 'l.u.n.a', translation: 'luna' },
        { text: 'm.a.r', translation: 'mar' },
        { text: 'c.a.s.a', translation: 'casa' },
        { text: 't.r.e.n', translation: 'tren' },
        { text: 'm.i.e.l', translation: 'miel' },
      ],
      glossary: {
        a: 'la letra a',
        c: 'la letra c',
        e: 'la letra e',
        i: 'la letra i',
        l: 'la letra l',
        m: 'la letra m',
        n: 'la letra n',
        o: 'la letra o',
        r: 'la letra r',
        s: 'la letra s',
        t: 'la letra t',
        u: 'la letra u',
      },
      rules: [
        'Cada símbolo es una letra y el texto está en español.',
        'Se lee de izquierda a derecha y las tildes no se escriben.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'r.i.s.a',
          answer: ['risa'],
          distractors: ['rosa', 'misa', 'casa'],
        },
        {
          type: 'to-spanish',
          prompt: 'l.a s.a.l',
          answer: ['la', 'sal'],
          distractors: ['el', 'sol', 'las'],
        },
        {
          type: 'to-language',
          glyphs: true,
          prompt: 'mesa',
          answer: ['m', 'e', 's', 'a'],
          distractors: ['o', 'n', 'r'],
        },
        {
          type: 'to-language',
          glyphs: true,
          prompt: 'limón',
          answer: ['l', 'i', 'm', 'o', 'n'],
          distractors: ['a', 'e', 'u'],
        },
      ],
    },
    {
      id: 'maya',
      tier: 'escrituras',
      topics: ['numeros', 'escrituras'],
      script: 'maya',
      title: 'Puntos y barras',
      language: 'numerales mayas',
      intro:
        'Los mayas escribían los números con solo tres símbolos, apilados en pisos. ' +
        'Estos son algunos números con su valor. Descubre el sistema.',
      corpus: [
        { text: 'm3', translation: '3' },
        { text: 'm7', translation: '7' },
        { text: 'm15', translation: '15' },
        { text: 'm1.m0', translation: '20' },
        { text: 'm1.m6', translation: '26' },
        { text: 'm2.m13', translation: '53' },
        { text: 'm10.m0', translation: '200' },
      ],
      glossary: {
        m3: 'tres puntos: 3',
        m15: 'tres barras: 15',
        m0: 'la concha: 0',
        'm1.m0': 'un 1 en el piso de arriba y un 0 abajo: 20',
      },
      rules: [
        'Un punto vale 1 y una barra vale 5; se suman.',
        'La concha es el cero.',
        'Los números se apilan en pisos: el de abajo cuenta unidades y el de arriba, veintenas.',
      ],
      challenges: [
        {
          type: 'choice',
          prompt: '¿Qué número es este?',
          display: 'm3.m12',
          options: ['72', '75', '312', '65'],
          correct: 0,
        },
        {
          type: 'to-language',
          glyphs: true,
          prompt: '45',
          answer: ['m2', 'm5'],
          distractors: ['m4', 'm0', 'm9'],
        },
        {
          type: 'to-language',
          glyphs: true,
          prompt: '100',
          answer: ['m5', 'm0'],
          distractors: ['m1', 'm10', 'm4'],
        },
        {
          type: 'choice',
          prompt: '¿Y este, con tres pisos?',
          display: 'm1.m0.m0',
          options: ['400', '200', '100', '120'],
          correct: 0,
        },
      ],
    },
    {
      id: 'cartuchos',
      tier: 'escrituras',
      topics: ['escrituras'],
      script: 'silabas',
      title: 'Nombres en cartuchos',
      language: 'escritura silábica',
      intro:
        'Como hizo Champollion con los jeroglíficos, empieza por los nombres propios: van dentro de un marco ' +
        'y sabes cómo suenan. Cada símbolo es una sílaba, pero cuidado con el sentido de la escritura.',
      corpus: [
        { text: 'ma.ri.na', translation: 'Marina' },
        { text: 'ka.ri.na', translation: 'Karina' },
        { text: 'ma.ri.o', translation: 'Mario' },
        { text: 'ro.sa', translation: 'Rosa' },
        { text: 'ro.mi.na', translation: 'Romina' },
        { text: 'ni.ko', translation: 'Niko' },
      ],
      glossary: {
        ma: 'la sílaba ma',
        ri: 'la sílaba ri',
        na: 'la sílaba na',
        ka: 'la sílaba ka',
        o: 'la vocal o',
        ro: 'la sílaba ro',
        sa: 'la sílaba sa',
        mi: 'la sílaba mi',
        ni: 'la sílaba ni',
        ko: 'la sílaba ko',
      },
      rules: [
        'Cada símbolo es una sílaba.',
        'Los nombres propios van dentro de un marco, como los cartuchos egipcios.',
        'Se lee de derecha a izquierda.',
      ],
      challenges: [
        {
          type: 'to-spanish',
          prompt: 'ma.ri.sa',
          answer: ['Marisa'],
          distractors: ['Sarima', 'Marina', 'Rosa'],
        },
        {
          type: 'to-spanish',
          prompt: 'ni.na',
          answer: ['Nina'],
          distractors: ['Nani', 'Niko', 'Mina'],
        },
        {
          type: 'to-language',
          glyphs: true,
          prompt: 'Roma',
          answer: ['ro', 'ma'],
          distractors: ['sa', 'mi', 'na'],
        },
        {
          type: 'to-language',
          glyphs: true,
          prompt: 'Mariko',
          answer: ['ma', 'ri', 'ko'],
          distractors: ['ka', 'ni', 'o'],
        },
        {
          type: 'choice',
          prompt: '¿En qué dirección se lee esta escritura?',
          options: ['De derecha a izquierda', 'De izquierda a derecha', 'De arriba abajo', 'Cambia en cada palabra'],
          correct: 0,
        },
      ],
    },
    {
      id: 'jeroglificos',
      tier: 'escrituras',
      topics: ['escrituras'],
      script: 'jeroglificos',
      title: 'Dibujos que suenan',
      language: 'jeroglíficos',
      intro:
        'Esta escritura mezcla tres tipos de signos, como los jeroglíficos egipcios: dibujos que se leen como palabras, ' +
        'dibujos que se leen solo por su sonido y signos que no se leen. Junto a cada inscripción está su pronunciación.',
      corpus: [
        { text: 'sol.trazo', translation: 'ra: «sol»' },
        { text: 'casa.trazo', translation: 'pe: «casa»' },
        { text: 'ojo.trazo', translation: 'ti: «ojo»' },
        { text: 'pajaro.sol.persona', translation: 'Mara, una mujer' },
        { text: 'pie.casa.agua', translation: 'Supe, un río' },
        { text: 'ojo.pajaro.ciudad', translation: 'Tima, una ciudad' },
        { text: 'pie.ojo.persona', translation: 'Suti, un hombre' },
      ],
      glossary: {
        sol: 'sol; como sonido, «ra»',
        casa: 'casa; como sonido, «pe»',
        ojo: 'ojo; como sonido, «ti»',
        pajaro: 'pájaro; como sonido, «ma»',
        pie: 'pie; como sonido, «su»',
        trazo: 'indica que el dibujo anterior se lee como palabra',
        persona: 'no se lee: indica que es una persona',
        agua: 'no se lee: indica que es un río',
        ciudad: 'no se lee: indica que es una ciudad',
      },
      rules: [
        'Cada dibujo puede leerse por su sonido: el del nombre de lo que representa. El sol se dice «ra», así que suena ra.',
        'Un trazo vertical detrás de un dibujo indica que se lee como palabra: «sol», no el sonido ra.',
        'El último signo de un nombre no se lee: indica si es una persona, un río o una ciudad.',
      ],
      challenges: [
        {
          type: 'choice',
          prompt: '¿Qué está escrito aquí?',
          display: 'casa.sol.ciudad',
          options: ['Pera, una ciudad', 'Pera, una mujer', 'Rape, una ciudad', 'la casa del sol'],
          correct: 0,
        },
        {
          type: 'to-language',
          glyphs: true,
          prompt: 'Rasu, un río',
          answer: ['sol', 'pie', 'agua'],
          distractors: ['persona', 'ciudad', 'trazo', 'casa'],
        },
        {
          type: 'to-language',
          glyphs: true,
          prompt: 'Tira, un hombre',
          answer: ['ojo', 'sol', 'persona'],
          distractors: ['trazo', 'ciudad', 'pajaro'],
        },
        {
          type: 'choice',
          prompt: '¿Y esto?',
          display: 'pajaro.trazo',
          options: ['«pájaro»', 'Mara, una mujer', 'Ma, una ciudad', '«sol»'],
          correct: 0,
        },
        {
          type: 'choice',
          prompt: '¿Para qué sirve el último signo de «Mara» y de «Suti»?',
          options: [
            'Indica que el nombre es de una persona y no se lee',
            'Se lee «ka»',
            'Indica plural',
            'Marca el final de la frase',
          ],
          correct: 0,
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
