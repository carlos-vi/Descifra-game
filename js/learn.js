// Artículos de la sección «Aprende».
// "links": lecturas recomendadas; llevan a la búsqueda de Wikipedia en español.
//
// Cada ejemplo es una frase de una lengua real, palabra a palabra: [forma, glosa].
// La forma lleva los morfemas separados por guiones; la frase original se obtiene
// quitándolos. Los niveles relacionados se calculan a partir de "topics" de cada puzzle.
(function (root) {
  'use strict';

  const ARTICLES = [
    {
      id: 'orden',
      title: 'El orden de las palabras',
      summary: 'Sujeto, verbo y objeto pueden ir en cualquier orden. Unos órdenes son mucho más frecuentes que otros.',
      paragraphs: [
        'En español decimos «el perro muerde al hombre»: primero el sujeto, luego el verbo y después el objeto. ' +
          'Los lingüistas lo abrevian como SVO. No es la única opción: entre las lenguas del mundo aparecen los seis órdenes posibles, aunque con frecuencias muy distintas.',
        'El orden más común es SOV, con el verbo al final: lo usan el japonés, el turco, el euskera, el hindi o el quechua. ' +
          'Casi igual de frecuente es SVO, el del español, el inglés, el chino o el suajili. ' +
          'VSO, con el verbo delante, es bastante menos común: irlandés, galés, árabe clásico. ' +
          'Los órdenes que empiezan por el objeto son rarísimos; el hixkaryana, en la Amazonía brasileña, es uno de los pocos casos conocidos de OVS.',
        'Un orden fijo no es la única manera de saber quién hace qué. Las lenguas con casos marcan el papel de cada palabra con una terminación, ' +
          'y entonces el orden queda libre para destacar una cosa u otra. En latín, «Puer puellam amat» y «Puellam puer amat» significan lo mismo.',
      ],
      examples: [
        {
          language: 'Japonés',
          words: [['watashi', 'yo'], ['wa', 'tema'], ['ringo', 'manzana'], ['o', 'objeto'], ['tabe-masu', 'comer-cortés']],
          translation: 'Yo como manzanas.',
          note: 'Orden SOV. Las partículas «wa» y «o» indican el tema y el objeto.',
        },
        {
          language: 'Irlandés',
          words: [['chonaic', 'vio'], ['Seán', 'Seán'], ['an', 'el'], ['madra', 'perro']],
          translation: 'Seán vio al perro.',
          note: 'Orden VSO: la frase empieza por el verbo.',
        },
        {
          language: 'Latín',
          words: [['puell-am', 'niña-objeto'], ['puer', 'niño'], ['ama-t', 'amar-él']],
          translation: 'El niño ama a la niña.',
          note: 'La terminación -am marca el objeto, así que el orden puede cambiar sin cambiar el significado.',
        },
      ],
      languages: ['Japonés', 'Turco', 'Euskera', 'Irlandés', 'Árabe clásico', 'Latín', 'Hixkaryana'],
      links: [{ label: 'Sujeto, objeto, verbo', wiki: 'Sujeto objeto verbo' }, { label: 'Orden sintáctico', wiki: 'Orden sintáctico' }],
    },
    {
      id: 'si-no',
      title: 'Responder sin «sí» ni «no»',
      summary: 'Hay lenguas que no tienen palabra para «sí»: se contesta repitiendo el verbo de la pregunta.',
      paragraphs: [
        'En español respondemos con «sí» o «no». Pero muchas lenguas no tienen esas palabras, o las usan poco. ' +
          'En irlandés, a «¿Estás cansado?» se responde «Estoy» o «No estoy». El finés y el chino hacen algo parecido.',
        'Las preguntas también se forman de maneras distintas: con entonación, como en español; cambiando el orden, como en inglés o alemán; ' +
          'o con una partícula al final, como el «ma» del chino o el «ka» del japonés.',
      ],
      examples: [
        { language: 'Finés', words: [['Tule-t-ko', 'venir-tú-pregunta']], translation: '¿Vienes?' },
        { language: 'Finés', words: [['Tule-n', 'venir-yo']], translation: 'Sí (literalmente, «vengo»).' },
        {
          language: 'Chino mandarín',
          words: [['nǐ', 'tú'], ['qù', 'ir'], ['ma', 'pregunta']],
          translation: '¿Vas?',
          note: 'Para responder que sí basta con «qù», «voy».',
        },
      ],
      languages: ['Irlandés', 'Finés', 'Chino mandarín', 'Japonés', 'Galés'],
      links: [{ label: 'Sí y no', wiki: 'Sí y no' }, { label: 'Idioma irlandés', wiki: 'Idioma irlandés' }],
    },
    {
      id: 'aglutinacion',
      title: 'Palabras hechas de piezas',
      summary: 'En las lenguas aglutinantes, una palabra puede equivaler a una frase entera: cada pieza aporta un significado.',
      paragraphs: [
        'Las palabras se pueden dividir en piezas con significado, llamadas morfemas. En «casas» hay dos: «casa» y «-s», el plural. ' +
          'El español lo hace a menudo fundiendo varios significados en una sola terminación: la «-o» de «canto» indica a la vez primera persona, singular, presente e indicativo. Por eso se dice que es una lengua fusional.',
        'Las lenguas aglutinantes, como el turco, el finés, el húngaro, el quechua o el euskera, prefieren encadenar piezas, cada una con un solo significado, ' +
          'una detrás de otra. El resultado son palabras largas pero muy regulares.',
        'Para descifrarlas, el truco es buscar trozos que se repiten. Si «ev» es «casa» y «evler» es «casas», «-ler» tiene que ser el plural.',
      ],
      examples: [
        {
          language: 'Turco',
          words: [['ev-ler-imiz-de', 'casa-plural-nuestro-en']],
          translation: 'en nuestras casas',
          note: 'Cuatro piezas, cuatro significados, una sola palabra.',
        },
        {
          language: 'Quechua',
          words: [['wasi-kuna-pi', 'casa-plural-en']],
          translation: 'en las casas',
        },
      ],
      languages: ['Turco', 'Finés', 'Húngaro', 'Quechua', 'Euskera', 'Japonés'],
      links: [{ label: 'Lengua aglutinante', wiki: 'Lengua aglutinante' }, { label: 'Morfema', wiki: 'Morfema' }],
    },
    {
      id: 'numero',
      title: 'Uno, dos, muchos',
      summary: 'Además de singular y plural, algunas lenguas tienen un número especial para «dos»: el dual.',
      paragraphs: [
        'El español distingue entre uno y más de uno. Otras lenguas tienen un tercer número, el dual, solo para dos cosas. ' +
          'Lo tenían el griego antiguo y el sánscrito, y lo conservan hoy el esloveno, el árabe, el sami o el inuktitut.',
        'Unas pocas lenguas van más allá y tienen trial (exactamente tres) o paucal (unos pocos). ' +
          'Y otras, como el chino o el japonés, casi nunca marcan el plural: el contexto basta.',
      ],
      examples: [
        { language: 'Esloveno', words: [['hiš-a', 'casa-singular']], translation: 'una casa' },
        { language: 'Esloveno', words: [['hiš-i', 'casa-dual']], translation: 'dos casas' },
        { language: 'Esloveno', words: [['hiš-e', 'casa-plural']], translation: 'casas (tres o más)' },
        {
          language: 'Árabe',
          words: [['kitāb-ān', 'libro-dual']],
          translation: 'dos libros',
          note: 'Frente a kitāb, «libro», y kutub, «libros».',
        },
      ],
      languages: ['Esloveno', 'Árabe', 'Inuktitut', 'Sami', 'Griego antiguo', 'Sánscrito'],
      links: [{ label: 'Número dual', wiki: 'Número dual' }, { label: 'Número gramatical', wiki: 'Número gramatical' }],
    },
    {
      id: 'armonia',
      title: 'Armonía vocálica',
      summary: 'Los sufijos cambian de vocal para parecerse a las vocales de la palabra a la que se unen.',
      paragraphs: [
        'En algunas lenguas, las vocales de una palabra tienen que «llevarse bien». Los sufijos no tienen una forma fija: ' +
          'cambian de vocal para concordar con las de la raíz. Esto se llama armonía vocálica y es típico del turco, el finés, el húngaro y el mongol.',
        'En turco las vocales se dividen en anteriores (e, i, ö, ü) y posteriores (a, ı, o, u). El plural es -ler después de una vocal anterior y -lar después de una posterior. ' +
          'Lo mismo pasa con muchos otros sufijos, como el de lugar: -de o -da.',
        'Al descifrar, si un sufijo aparece con dos formas parecidas, mira las vocales de la palabra a la que va pegado.',
      ],
      examples: [
        { language: 'Turco', words: [['ev-ler', 'casa-plural']], translation: 'casas' },
        { language: 'Turco', words: [['kitap-lar', 'libro-plural']], translation: 'libros' },
        { language: 'Turco', words: [['okul-da', 'escuela-en']], translation: 'en la escuela' },
        { language: 'Finés', words: [['talo-ssa', 'casa-en']], translation: 'en la casa' },
        {
          language: 'Finés',
          words: [['metsä-ssä', 'bosque-en']],
          translation: 'en el bosque',
          note: 'El sufijo -ssa se convierte en -ssä porque «metsä» tiene vocales anteriores.',
        },
      ],
      languages: ['Turco', 'Finés', 'Húngaro', 'Mongol'],
      links: [{ label: 'Armonía vocálica', wiki: 'Armonía vocálica' }],
    },
    {
      id: 'tonos',
      title: 'Lenguas tonales',
      summary: 'En muchas lenguas, la altura de la voz cambia el significado: «ma» puede ser madre o caballo.',
      paragraphs: [
        'En español la entonación expresa emoción o pregunta, pero no cambia el significado de una palabra. ' +
          'En las lenguas tonales sí: la misma sílaba dicha más aguda, más grave, subiendo o bajando, es otra palabra.',
        'Son muy frecuentes: el chino (cuatro tonos en mandarín), el vietnamita (seis), el tailandés, el yoruba, el zulú o muchas lenguas de América como el mixteco. ' +
          'En algunas lenguas africanas el tono también hace de gramática y distingue, por ejemplo, el presente del pasado.',
        'Cuando se escriben con letras latinas, los tonos suelen marcarse con tildes y otros signos sobre las vocales.',
      ],
      examples: [
        { language: 'Chino mandarín', words: [['mā', 'tono alto']], translation: 'madre' },
        { language: 'Chino mandarín', words: [['má', 'tono que sube']], translation: 'cáñamo' },
        { language: 'Chino mandarín', words: [['mǎ', 'tono que baja y sube']], translation: 'caballo' },
        { language: 'Chino mandarín', words: [['mà', 'tono que baja']], translation: 'regañar' },
      ],
      languages: ['Chino mandarín', 'Vietnamita', 'Tailandés', 'Yoruba', 'Zulú', 'Mixteco'],
      links: [{ label: 'Lengua tonal', wiki: 'Lengua tonal' }, { label: 'Tono (lingüística)', wiki: 'Tono (lingüística)' }],
    },
    {
      id: 'cambio-fonetico',
      title: 'Lenguas hermanas',
      summary: 'Las lenguas emparentadas cambian sus sonidos de forma regular, y eso permite predecir unas palabras a partir de otras.',
      paragraphs: [
        'El español, el italiano, el francés o el portugués vienen del latín. Al evolucionar, cada una cambió sus sonidos, pero no al azar: ' +
          'un mismo sonido cambió igual en casi todas las palabras. Por eso «noche», «notte», «nuit» y «noite» se parecen tanto.',
        'En castellano, por ejemplo, la f inicial latina se convirtió en h en muchas palabras: filium dio «hijo», ferrum dio «hierro» y facere, «hacer». ' +
          'En las lenguas germánicas, la p se volvió f: el latín pater y piscis corresponden al inglés father y fish. Este cambio forma parte de la ley de Grimm.',
        'Gracias a estas regularidades, los lingüistas pueden reconstruir cómo eran lenguas de las que no queda ningún texto, como el protoindoeuropeo.',
      ],
      examples: [
        { language: 'Latín → español', words: [['filium', 'latín'], ['hijo', 'español']], translation: 'f se vuelve h' },
        { language: 'Latín → español', words: [['ferrum', 'latín'], ['hierro', 'español']], translation: 'f se vuelve h' },
        { language: 'Latín e inglés', words: [['pater', 'latín'], ['father', 'inglés']], translation: 'p se corresponde con f' },
        { language: 'Latín e inglés', words: [['piscis', 'latín'], ['fish', 'inglés']], translation: 'p se corresponde con f' },
      ],
      languages: ['Latín', 'Español', 'Italiano', 'Inglés', 'Alemán', 'Protoindoeuropeo'],
      links: [{ label: 'Cambio fonético', wiki: 'Cambio fonético' }, { label: 'Ley de Grimm', wiki: 'Ley de Grimm' }],
    },
    {
      id: 'compuestos',
      title: 'Palabras compuestas',
      summary: 'Unir dos palabras para crear una nueva: «mano-zapato» es guante y «fuego-montaña», volcán.',
      paragraphs: [
        'Todas las lenguas crean palabras nuevas juntando otras. El español lo hace a veces («sacacorchos», «bocacalle»), ' +
          'pero en alemán, chino o finés es la forma normal de crear vocabulario.',
        'En cada compuesto hay una palabra principal y otra que la precisa. En español la principal suele ir primero (una «bocacalle» es una boca de la calle); ' +
          'en alemán o en chino va al final: un «Handschuh», literalmente «mano-zapato», es un zapato para la mano, un guante.',
        'La poesía germánica antigua llevó esto al extremo con los «kennings», metáforas compuestas: en inglés antiguo, el mar era el «camino de la ballena».',
      ],
      examples: [
        { language: 'Alemán', words: [['Hand-schuh', 'mano-zapato']], translation: 'guante' },
        { language: 'Chino mandarín', words: [['huǒ-shān', 'fuego-montaña']], translation: 'volcán' },
        {
          language: 'Chino mandarín',
          words: [['diàn-nǎo', 'electricidad-cerebro']],
          translation: 'ordenador',
          note: 'Muchas palabras modernas del chino se forman así, juntando palabras antiguas.',
        },
        { language: 'Inglés antiguo', words: [['hron-rād', 'ballena-camino']], translation: 'el mar (en poesía)' },
      ],
      languages: ['Alemán', 'Chino mandarín', 'Finés', 'Inglés antiguo', 'Islandés'],
      links: [{ label: 'Kenning', wiki: 'Kenning' }, { label: 'Palabra compuesta', wiki: 'Palabra compuesta' }],
    },
    {
      id: 'ergatividad',
      title: 'Ergatividad',
      summary: 'Quien llega o duerme se marca igual que quien recibe un golpe, y distinto de quien lo da.',
      paragraphs: [
        'En español, el sujeto se trata igual tanto si su acción recae sobre otro («el hombre come pan») como si no («el hombre llega»). ' +
          'Así funcionan las lenguas llamadas nominativo-acusativas, la mayoría de las de Europa.',
        'En las lenguas ergativas, en cambio, quien hace una acción sobre otro lleva una marca especial, el ergativo. ' +
          'Quien llega, duerme o se cae va sin marca, igual que lo que recibe la acción (el absolutivo). ' +
          'Es como si «el hombre» de «el hombre llega» se pareciera más al «pan» de «el hombre come pan» que al hombre que come.',
        'Alrededor de una cuarta parte de las lenguas del mundo tienen algún tipo de ergatividad: el euskera, el georgiano, las lenguas mayas, el inuktitut o el dyirbal de Australia. ' +
          'A menudo es parcial: en hindi, por ejemplo, solo aparece con acciones acabadas (el aspecto perfectivo).',
      ],
      examples: [
        {
          language: 'Euskera',
          words: [['Gizon-a', 'hombre-el'], ['etorri', 'venido'], ['da', 'es (auxiliar)']],
          translation: 'El hombre ha venido.',
        },
        {
          language: 'Euskera',
          words: [['Gizon-a-k', 'hombre-el-ergativo'], ['ogi-a', 'pan-el'], ['jan', 'comido'], ['du', 'ha (auxiliar)']],
          translation: 'El hombre ha comido el pan.',
          note: 'Quien come lleva -k; quien viene, no. También cambia el auxiliar: «da» con un participante, «du» con dos.',
        },
        {
          language: 'Hindi',
          words: [['Rām', 'Ram'], ['ne', 'ergativo'], ['roṭī', 'pan'], ['khāyī', 'comió']],
          translation: 'Ram comió pan.',
          note: 'En presente se dice «Rām roṭī khātā hai», sin «ne»: en hindi la marca solo aparece con acciones acabadas.',
        },
      ],
      languages: ['Euskera', 'Georgiano', 'Hindi', 'Maya yucateco', 'Inuktitut', 'Dyirbal'],
      links: [{ label: 'Lengua ergativa', wiki: 'Lengua ergativa' }, { label: 'Euskera', wiki: 'Euskera' }],
    },
    {
      id: 'clases',
      title: 'Clases nominales',
      summary: 'Los nombres se agrupan en clases, y la clase se repite en adjetivos y verbos.',
      paragraphs: [
        'El español divide los nombres en dos clases, masculino y femenino, y esa clase se nota en artículos y adjetivos: «la casa blanca», «el coche blanco». ' +
          'Muchas lenguas tienen bastantes más. Las lenguas bantúes de África, como el suajili, el zulú o el kikuyu, tienen más de diez.',
        'En suajili cada clase tiene un prefijo para el singular y otro para el plural, y ese prefijo se repite, a veces con otra forma, en el adjetivo y en el verbo. ' +
          'Las clases tienen cierta lógica (personas, árboles, objetos, cosas abstractas…), aunque con muchas excepciones.',
        'Al descifrar, fíjate en los principios de las palabras: si varias palabras de una frase empiezan igual, probablemente concuerdan entre sí.',
      ],
      examples: [
        {
          language: 'Suajili',
          words: [['m-toto', 'persona-niño'], ['m-dogo', 'persona-pequeño'], ['a-na-lala', 'él/ella-presente-dormir']],
          translation: 'El niño pequeño duerme.',
        },
        {
          language: 'Suajili',
          words: [['wa-toto', 'personas-niño'], ['wa-dogo', 'personas-pequeño'], ['wa-na-lala', 'ellos-presente-dormir']],
          translation: 'Los niños pequeños duermen.',
        },
        {
          language: 'Suajili',
          words: [['ki-tabu', 'cosa-libro'], ['ki-dogo', 'cosa-pequeño'], ['ki-me-anguka', 'cosa-perfecto-caer']],
          translation: 'El libro pequeño se ha caído.',
          note: 'El prefijo ki- se repite en las tres palabras. En plural sería vi-tabu, vi-dogo, vi-me-anguka.',
        },
      ],
      languages: ['Suajili', 'Zulú', 'Kikuyu', 'Lingala'],
      links: [{ label: 'Clase nominal', wiki: 'Clase nominal' }, { label: 'Idioma suajili', wiki: 'Idioma suajili' }],
    },
    {
      id: 'polipersonal',
      title: 'Verbos que lo dicen todo',
      summary: 'El verbo lleva dentro quién hace la acción y quién la recibe.',
      paragraphs: [
        'En español el verbo indica quién hace la acción («canto», «cantas») y a veces se le pegan pronombres («dámelo»). ' +
          'Muchas lenguas van más allá: el verbo incluye siempre quién hace la acción y quién la recibe. Se llama concordancia polipersonal.',
        'Ocurre en suajili, en euskera, en georgiano y en muchas lenguas de América, como el náhuatl o el mohawk. ' +
          'En las lenguas polisintéticas una sola palabra puede contener sujeto, objeto, tiempo y mucho más: lo que en español es una frase.',
        'Al descifrar, compara verbos que se parecen y fíjate en qué cambia cuando cambia la persona: así aparecen las piezas de «yo», «tú», «a mí», «a ti»…',
      ],
      examples: [
        { language: 'Suajili', words: [['ni-li-ku-ona', 'yo-pasado-a ti-ver']], translation: 'Te vi.' },
        { language: 'Suajili', words: [['a-li-ni-penda', 'él/ella-pasado-a mí-querer']], translation: 'Me quería.' },
        { language: 'Náhuatl', words: [['ni-mitz-tlazohtla', 'yo-a ti-querer']], translation: 'Te quiero.' },
      ],
      languages: ['Suajili', 'Euskera', 'Georgiano', 'Náhuatl', 'Mohawk'],
      links: [{ label: 'Lengua polisintética', wiki: 'Lengua polisintética' }, { label: 'Idioma náhuatl', wiki: 'Idioma náhuatl' }],
    },
    {
      id: 'evidencialidad',
      title: '¿Cómo lo sabes?',
      summary: 'En muchas lenguas el verbo indica si quien habla vio lo que cuenta, se lo contaron o lo deduce.',
      paragraphs: [
        'En español podemos decir «dicen que llueve» o «parece que llueve», pero no es obligatorio: «llueve» vale para todo. ' +
          'En muchas lenguas no: el verbo lleva una marca que dice cómo sabe el hablante lo que cuenta. A esto se le llama evidencialidad.',
        'Aparece en el quechua y el aimara de los Andes, en turco, en búlgaro, en tibetano y en muchas lenguas amazónicas. ' +
          'Algunas distinguen hasta cinco fuentes: lo vi, lo oí, lo deduzco por las pistas, lo supongo, me lo contaron.',
      ],
      examples: [
        {
          language: 'Quechua',
          words: [['para-sha-n-mi', 'llover-progresivo-él-lo veo']],
          translation: 'Está lloviendo (lo veo).',
        },
        {
          language: 'Quechua',
          words: [['para-sha-n-si', 'llover-progresivo-él-dicen']],
          translation: 'Dicen que está lloviendo.',
        },
        {
          language: 'Turco',
          words: [['Ali', 'Alí'], ['gel-miş', 'venir-por lo visto']],
          translation: 'Por lo visto, Alí ha venido.',
          note: 'Si el hablante lo presenció, diría «Ali geldi», «Alí vino».',
        },
      ],
      languages: ['Quechua', 'Aimara', 'Turco', 'Búlgaro', 'Tibetano', 'Tuyuca'],
      links: [{ label: 'Evidencialidad', wiki: 'Evidencialidad' }, { label: 'Lenguas quechuas', wiki: 'Lenguas quechuas' }],
    },
    {
      id: 'posesion',
      title: '¿Quién marca la posesión?',
      summary: 'Unas lenguas marcan al dueño, otras lo poseído, y algunas las dos cosas.',
      paragraphs: [
        'En «la casa del hombre», el español marca al dueño con «de». Los lingüistas lo llaman marcación en el dependiente. ' +
          'Otras lenguas lo hacen al revés: marcan lo poseído, como si dijeran «el hombre su-casa». Es la marcación en el núcleo. Y algunas marcan las dos cosas.',
        'El húngaro marca lo poseído, el turco marca los dos y el náhuatl pone al dueño como prefijo de lo poseído. ' +
          'Además, muchas lenguas distinguen la posesión inalienable (partes del cuerpo, parientes: lo que no se puede regalar ni perder) de la alienable, con construcciones distintas.',
      ],
      examples: [
        {
          language: 'Húngaro',
          words: [['a', 'el'], ['fiú', 'chico'], ['ház-a', 'casa-su']],
          translation: 'la casa del chico',
          note: 'Literalmente, «el chico su-casa».',
        },
        {
          language: 'Turco',
          words: [['adam-ın', 'hombre-de'], ['ev-i', 'casa-su']],
          translation: 'la casa del hombre',
          note: 'El turco marca al dueño y a lo poseído.',
        },
        {
          language: 'Náhuatl',
          words: [['no-cal', 'mi-casa']],
          translation: 'mi casa',
          note: 'Con otros prefijos: mo-cal (tu casa), i-cal (su casa).',
        },
      ],
      languages: ['Húngaro', 'Turco', 'Náhuatl', 'Quechua', 'Hebreo'],
      links: [{ label: 'Posesión inalienable', wiki: 'Posesión inalienable' }, { label: 'Idioma húngaro', wiki: 'Idioma húngaro' }],
    },
    {
      id: 'inclusivo',
      title: 'Dos maneras de decir «nosotros»',
      summary: 'Muchas lenguas distinguen un «nosotros» que incluye a quien escucha y otro que lo deja fuera.',
      paragraphs: [
        'Si alguien te dice «nosotros vamos al cine», ¿te incluye a ti? En español no se sabe. ' +
          'Muchas lenguas obligan a decidirlo: tienen un «nosotros» inclusivo (tú y yo, quizá con otros) y un «nosotros» exclusivo (yo y otros, pero tú no).',
        'Es muy frecuente en las lenguas austronesias, como el indonesio, el tagalo o el hawaiano, en quechua y aimara, en muchas lenguas de Australia y en el tamil, en la India.',
      ],
      examples: [
        {
          language: 'Indonesio',
          words: [['kita', 'nosotros (contigo)'], ['makan', 'comer']],
          translation: 'Comemos (tú y yo).',
        },
        {
          language: 'Indonesio',
          words: [['kami', 'nosotros (sin ti)'], ['makan', 'comer']],
          translation: 'Comemos (nosotros, pero tú no).',
        },
        {
          language: 'Quechua',
          words: [['ñuqa-nchik', 'yo-inclusivo']],
          translation: 'nosotros (contigo)',
          note: 'Frente a ñuqa-yku, «nosotros (sin ti)».',
        },
      ],
      languages: ['Indonesio', 'Tagalo', 'Hawaiano', 'Quechua', 'Aimara', 'Tamil'],
      links: [{ label: 'Clusividad', wiki: 'Clusividad' }, { label: 'Idioma indonesio', wiki: 'Idioma indonesio' }],
    },
    {
      id: 'parentesco',
      title: 'Sistemas de parentesco',
      summary: 'Cada lengua divide la familia a su manera: hay lenguas que llaman «padre» al tío y «hermanos» a algunos primos.',
      paragraphs: [
        'En español, «tío» sirve para el hermano del padre, el de la madre y hasta el marido de una tía. Muchas lenguas son más precisas, y otras lo son menos.',
        'En el sistema que los antropólogos llaman iroqués, por los pueblos haudenosaunee de Norteamérica, el hermano del padre se llama igual que el padre ' +
          'y la hermana de la madre igual que la madre. Sus hijos son «hermanos», mientras que los hijos del hermano de la madre o de la hermana del padre ' +
          '(los primos cruzados) tienen un nombre propio.',
        'El hawaiano va más lejos: todos los primos se llaman como los hermanos y todos los tíos como los padres. ' +
          'El chino, en cambio, tiene una palabra distinta para cada tío y cada tía según el lado de la familia y la edad.',
      ],
      examples: [
        {
          language: 'Hawaiano',
          words: [['makua-kāne', 'progenitor-varón']],
          translation: 'padre (y también tío)',
        },
        { language: 'Chino mandarín', words: [['jiùjiu', 'hermano de la madre']], translation: 'tío materno' },
        { language: 'Chino mandarín', words: [['gūgu', 'hermana del padre']], translation: 'tía paterna' },
        {
          language: 'Chino mandarín',
          words: [['shūshu', 'hermano menor del padre']],
          translation: 'tío paterno (más joven que el padre)',
        },
      ],
      languages: ['Hawaiano', 'Chino mandarín', 'Lenguas iroquesas', 'Sueco', 'Hindi'],
      links: [{ label: 'Terminología de parentesco', wiki: 'Terminología de parentesco' }, { label: 'Lewis H. Morgan', wiki: 'Lewis Henry Morgan' }],
    },
    {
      id: 'clasificadores',
      title: 'Clasificadores',
      summary: 'Para contar cosas, muchas lenguas añaden una palabra que depende de su forma: no es lo mismo contar lápices que hojas.',
      paragraphs: [
        'En español decimos «dos lápices» sin más. En japonés, chino, coreano, tailandés o en muchas lenguas mayas hace falta una palabra entre el número y la cosa: el clasificador. ' +
          'Algo parecido hacemos al decir «dos cabezas de ganado» o «tres hojas de papel».',
        'Los clasificadores agrupan las cosas por su forma (largas, planas, redondas), por si son seres vivos, por su función… ' +
          'y a veces por razones históricas que ya nadie recuerda.',
      ],
      examples: [
        { language: 'Japonés', words: [['enpitsu', 'lápiz'], ['ni-hon', 'dos-largo']], translation: 'dos lápices' },
        { language: 'Japonés', words: [['kami', 'papel'], ['ni-mai', 'dos-plano']], translation: 'dos hojas de papel' },
        { language: 'Japonés', words: [['neko', 'gato'], ['ni-hiki', 'dos-animal']], translation: 'dos gatos' },
        { language: 'Chino mandarín', words: [['sān', 'tres'], ['běn', 'volumen'], ['shū', 'libro']], translation: 'tres libros' },
      ],
      languages: ['Japonés', 'Chino mandarín', 'Coreano', 'Tailandés', 'Tzeltal'],
      links: [{ label: 'Clasificador (lingüística)', wiki: 'Clasificador (lingüística)' }],
    },
    {
      id: 'direcciones',
      title: 'Norte, sur, este y oeste',
      summary: 'Hay lenguas sin «izquierda» ni «derecha»: todo se sitúa con los puntos cardinales.',
      paragraphs: [
        'Para decir dónde está algo, el español usa sobre todo el propio cuerpo: delante, detrás, a la izquierda, a la derecha. ' +
          'Si te das la vuelta, lo que estaba a tu derecha pasa a estar a tu izquierda.',
        'El guugu yimithirr, una lengua del norte de Australia, no funciona así: se dice que algo está al norte o al este de ti, aunque esté a un palmo. ' +
          'Sus hablantes saben en todo momento dónde está cada punto cardinal, igual que nosotros sabemos dónde está nuestra mano derecha.',
        'Otras lenguas usan referencias del paisaje: en balinés se habla de «hacia la montaña» (kaja) y «hacia el mar» (kelod), y en tzeltal, en México, de «cuesta arriba» y «cuesta abajo». ' +
          'Guy Deutscher lo cuenta en su libro «El prisma del lenguaje».',
      ],
      examples: [
        { language: 'Guugu yimithirr', words: [['gungga', 'norte'], ['jiba', 'sur'], ['naga', 'este'], ['guwa', 'oeste']], translation: 'los cuatro puntos cardinales' },
        { language: 'Balinés', words: [['kaja', 'hacia la montaña'], ['kelod', 'hacia el mar']], translation: 'las dos direcciones principales' },
      ],
      languages: ['Guugu yimithirr', 'Balinés', 'Tzeltal'],
      links: [{ label: 'Guugu yimithirr', wiki: 'Idioma guugu yimithirr' }, { label: 'Punto cardinal', wiki: 'Punto cardinal' }],
    },
    {
      id: 'numeros',
      title: 'Contar de otra manera',
      summary: 'No todas las lenguas cuentan de diez en diez: hay sistemas de base 20, de base 5 y otras sorpresas.',
      paragraphs: [
        'Contamos de diez en diez porque tenemos diez dedos, pero no todas las lenguas lo hacen. ' +
          'Muchas cuentan de veinte en veinte, con los dedos de manos y pies: el euskera, el náhuatl, el maya, el yoruba o el georgiano. ' +
          'El francés conserva restos de ese sistema: 80 es «quatre-vingts», cuatro veintes.',
        'Hay sistemas de base 5 y de base 12, y lenguas de Papúa Nueva Guinea que cuentan señalando partes del cuerpo. ' +
          'Las operaciones también varían: el yoruba usa restas, y 15 se dice como «veinte menos cinco».',
        'Los mayas escribían los números con puntos (1), barras (5) y una concha (0), apilados en pisos que valen 1, 20, 400… ' +
          'Fueron de las primeras culturas en usar el cero. Los babilonios, en cambio, contaban en base 60, y de ahí vienen los 60 minutos de una hora.',
        'Al descifrar números, busca primero las palabras que multiplican y las que suman, y comprueba tu hipótesis con todos los ejemplos.',
      ],
      examples: [
        {
          language: 'Euskera',
          words: [['berr-ogei-ta', 'dos-veinte-y'], ['bi', 'dos']],
          translation: '42',
          note: 'Literalmente, «dos veintes y dos».',
        },
        {
          language: 'Francés',
          words: [['quatre', 'cuatro'], ['vingt', 'veinte'], ['dix', 'diez']],
          translation: '90',
          note: 'Se escribe «quatre-vingt-dix»: cuatro veintes y diez.',
        },
        {
          language: 'Náhuatl',
          words: [['cem-pohualli', 'uno-cuenta']],
          translation: '20',
          note: 'Veinte es «una cuenta completa».',
        },
      ],
      languages: ['Euskera', 'Náhuatl', 'Maya', 'Yoruba', 'Francés', 'Georgiano', 'Babilonio'],
      links: [{ label: 'Sistema vigesimal', wiki: 'Sistema vigesimal' }, { label: 'Numeración maya', wiki: 'Numeración maya' }],
    },
    {
      id: 'tiempo',
      title: 'El tiempo sin conjugar',
      summary: 'Muchas lenguas no cambian el verbo para indicar el tiempo: usan palabras sueltas, o nada.',
      paragraphs: [
        'En español el tiempo va dentro del verbo: canto, canté, cantaré. Muchas lenguas no conjugan. ' +
          'Indican el tiempo con una palabra aparte o lo dejan al contexto, como el vietnamita, el chino o el indonesio.',
        'Otras se fijan sobre todo en si la acción está terminada o no (el aspecto) más que en cuándo ocurre.',
      ],
      examples: [
        { language: 'Vietnamita', words: [['tôi', 'yo'], ['đã', 'pasado'], ['ăn', 'comer']], translation: 'Comí.' },
        { language: 'Vietnamita', words: [['tôi', 'yo'], ['sẽ', 'futuro'], ['ăn', 'comer']], translation: 'Comeré.' },
        { language: 'Indonesio', words: [['saya', 'yo'], ['akan', 'futuro'], ['makan', 'comer']], translation: 'Comeré.' },
      ],
      languages: ['Vietnamita', 'Chino mandarín', 'Indonesio', 'Tailandés'],
      links: [{ label: 'Lengua aislante', wiki: 'Lengua aislante' }, { label: 'Aspecto gramatical', wiki: 'Aspecto gramatical' }],
    },
    {
      id: 'no-concatenativa',
      title: 'Más allá de los sufijos',
      summary: 'Infijos, reduplicación y raíces de consonantes: piezas que no se añaden ni al principio ni al final.',
      paragraphs: [
        'No todas las piezas se pegan delante o detrás. Los infijos se meten dentro de la raíz: en tagalo, «sulat» (escribir) da «sumulat».',
        'La reduplicación repite la palabra, o parte de ella. En indonesio, «rumah» es casa y «rumah-rumah», casas.',
        'En árabe y hebreo, las raíces son grupos de consonantes y las vocales que las rodean dan el significado concreto. ' +
          'De la raíz k-t-b, relacionada con escribir, salen kataba (escribió), kitāb (libro), kātib (escritor) y maktaba (biblioteca).',
      ],
      examples: [
        {
          language: 'Tagalo',
          words: [['s-um-ulat', 'escribir (infijo de agente)']],
          translation: 'escribió',
          note: 'El infijo -um- se mete después de la primera consonante.',
        },
        { language: 'Indonesio', words: [['anak-anak', 'niño-niño']], translation: 'niños' },
        { language: 'Árabe', words: [['kitāb', 'libro (raíz k-t-b)']], translation: 'libro' },
        { language: 'Árabe', words: [['kātib', 'escritor (raíz k-t-b)']], translation: 'escritor' },
      ],
      languages: ['Tagalo', 'Indonesio', 'Árabe', 'Hebreo'],
      links: [{ label: 'Infijo', wiki: 'Infijo' }, { label: 'Reduplicación', wiki: 'Reduplicación (lingüística)' }, { label: 'Idioma árabe', wiki: 'Idioma árabe' }],
    },
    {
      id: 'escrituras',
      title: 'Escrituras del mundo',
      summary: 'Alfabetos, silabarios, escrituras sin vocales y signos que representan palabras enteras.',
      paragraphs: [
        'Una escritura puede representar la lengua de maneras muy distintas. Los alfabetos, como el latino, el griego o el cirílico, tienen un signo por sonido. ' +
          'Los abyads, como el árabe y el hebreo, escriben sobre todo las consonantes y dejan que el lector ponga las vocales.',
        'En los silabarios cada signo es una sílaba: los kana japoneses, o el silabario cherokee que Sequoyah inventó hacia 1821. ' +
          'En las escrituras logográficas, como la china, muchos signos representan palabras enteras: 木 es «árbol», 林 (dos árboles) es «bosque».',
        'Los jeroglíficos egipcios mezclaban todo: signos que eran palabras, signos que valían solo por su sonido y determinativos, signos mudos que indicaban la categoría de la palabra. ' +
          'Champollion los descifró en 1822 gracias a la piedra de Rosetta, que tenía el mismo texto en jeroglífico, en demótico y en griego. ' +
          'Su clave fueron los nombres de reyes encerrados en cartuchos, como Ptolomeo y Cleopatra: sabía cómo sonaban y pudo comparar sus signos.',
        'Un siglo después, Michael Ventris descifró en 1952 la escritura lineal B de Creta, un silabario, y descubrió que escondía una forma muy antigua del griego.',
        'No todas las escrituras se leen con la vista: el braille, que Louis Braille inventó en 1824 con solo 15 años, representa cada letra con puntos en relieve que se leen con los dedos.',
      ],
      examples: [
        {
          language: 'Japonés (hiragana)',
          words: [['か', 'ka'], ['き', 'ki']],
          translation: 'kaki, «caqui»',
          note: 'Cada signo es una sílaba.',
        },
        {
          language: 'Chino',
          words: [['木', 'árbol'], ['林', 'bosque'], ['森', 'bosque espeso']],
          translation: 'un árbol, dos árboles, tres árboles',
          note: 'Algunos caracteres combinan otros: más árboles, más bosque.',
        },
        {
          language: 'Árabe',
          words: [['كتب', 'k-t-b']],
          translation: 'kataba, «escribió», o kutub, «libros»',
          note: 'Se escriben las consonantes; las vocales se deducen por el contexto.',
        },
      ],
      languages: ['Japonés', 'Chino', 'Árabe', 'Hebreo', 'Cherokee', 'Egipcio antiguo', 'Griego micénico'],
      links: [{ label: 'Sistema de escritura', wiki: 'Sistema de escritura' }, { label: 'Piedra de Rosetta', wiki: 'Piedra de Rosetta' }, { label: 'Lineal B', wiki: 'Lineal B' }, { label: 'Braille', wiki: 'Braille' }],
    },
  ];

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARTICLES;
  } else {
    root.ARTICLES = ARTICLES;
  }
})(this);
