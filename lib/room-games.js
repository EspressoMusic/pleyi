/* Room game picker — which games work with custom learning material */

const ALL_ROOM_GAMES = [
  "word-memory",
  "hangman",
  "spot-diff",
  "tower-stack",
  "word-shop",
];

function compatibleRoomGames(items) {
  if (!items?.length) return [...ALL_ROOM_GAMES];

  const n = items.length;
  const out = [];

  if (n >= 2) out.push("word-memory");
  if (n >= 1) out.push("hangman");
  if (n >= 3) out.push("spot-diff", "tower-stack", "word-shop");

  return out.filter((id) => ALL_ROOM_GAMES.includes(id));
}

module.exports = { ALL_ROOM_GAMES, compatibleRoomGames };
