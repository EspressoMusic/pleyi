/* Learn English — the cards of the class bingo game (english-games.js) and
   of the printed bingo cards (english-worksheet.js ?bingo=).

   A card is 3 × 3 pictures picked from the topic's words by the card's
   number alone, so the teacher's board can check any card — printed or on a
   phone — once the student says its number. The words are sorted first, so
   their order in the topic doesn't change the cards.

   EnglishBingo.card(ids, number) → the card's 9 word ids, row by row
   EnglishBingo.lines(isMarked)   → the full lines (rows, columns,
                                    diagonals) as lists of cell indexes */

(function () {
  const SIZE = 3;
  const CELLS = SIZE * SIZE;
  // One word more than a card holds, so the cards are not all the same.
  const MIN_WORDS = CELLS + 1;

  const range = [...Array(SIZE).keys()];
  const LINES = [
    ...range.map((r) => range.map((c) => r * SIZE + c)),
    ...range.map((c) => range.map((r) => r * SIZE + c)),
    range.map((i) => i * SIZE + i),
    range.map((i) => i * SIZE + (SIZE - 1 - i)),
  ];

  function hash(str) {
    let h = 2166136261;
    for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return h;
  }

  // A small seeded random number generator (mulberry32).
  function seeded(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function card(ids, number) {
    const pool = [...new Set(ids)].sort();
    const rand = seeded(hash(`${pool.join(",")}#${number}`));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, CELLS);
  }

  function lines(isMarked) {
    return LINES.filter((line) => line.every((i) => isMarked(i)));
  }

  window.EnglishBingo = { SIZE, CELLS, MIN_WORDS, card, lines };
})();
