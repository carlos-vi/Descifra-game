# Descifra

Juego de lógica en el que hay que descifrar lenguas inventadas. Cada nivel muestra
unas frases de ejemplo con su traducción; a partir de ellas se deduce el vocabulario
y la gramática y se resuelven retos de traducción construyendo la respuesta con fichas.

## Jugar

Abre `index.html` en el navegador. No necesita instalación ni servidor.

## Modos de juego

- **Reto diario** (`#hoy`): una lengua nueva cada día, la misma para todos, numerada como
  «Descifra #N». Se juega una vez al día; al terminar se puede copiar el resultado para
  compartirlo sin desvelar la solución, y se guardan la racha y las estadísticas.
  Los puzzles salen de `js/daily-puzzles.js` y se repiten cuando se acaba el banco.
- **Niveles de práctica**: 5 lenguas de dificultad creciente que se pueden reiniciar.

## Cómo funciona

- Tras cada intento, las fichas se colorean como en Wordle: verde (palabra correcta
  en su sitio), amarillo (la palabra va, pero en otro sitio) y gris (no va).
- Hay 4 intentos por reto. Se empieza con 3 estrellas y cada fallo o pista resta.
- El progreso y las notas del cuaderno se guardan en el navegador.

## Estructura

```
index.html
css/style.css
js/engine.js     lógica del juego (sin DOM, probada con Node)
js/puzzles.js    niveles de práctica y explicación del formato de los puzzles
js/daily-puzzles.js  banco de puzzles del reto diario
js/ui.js         interfaz
tests/           tests automáticos
```

## Tests

```
npm test
```

Además de la lógica, los tests comprueban que cada puzzle sea deducible: todas las
palabras de los retos se componen de raíces y sufijos que aparecen en las frases de ejemplo.

## Añadir un puzzle

Añade un objeto a `js/puzzles.js` (niveles) o a `js/daily-puzzles.js` (reto diario) siguiendo el formato descrito al principio del archivo
y ejecuta `npm test`.
