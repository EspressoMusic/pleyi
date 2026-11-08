/* Learn English — the pictures of the "find them in the picture" game
   (english-games.js, playHunt).

   scenes.<id>: the background /images/english/scenes/<id>.svg (1000 x 625) and
   the spots things can stand on, [x center, y bottom, size], in groups:
   - any: anything may stand there, and it gets a random one each game.
   - other groups: only for what `place` sends there, like a plane to the sky.
   - place: thing -> group. A thing whose group is full goes to `any`.

   topics.<topic id>: which scene, how much bigger things are drawn there
   (`scale`), its own extra `place` rules, and `extras`: the pictures that
   stand around the topic's words and don't count. No pictures of girls or
   women here. `byTray`: the topic is no theme you could spot in a picture, so
   the student is sent to the shapes in the tray instead. */

(function () {
  const row = (y, size, ...xs) => xs.map((x) => [x, y, size]);

  const OUTDOOR_PLACE = { bird: "sky", plane: "sky", helicopter: "sky", cloud: "sky", boat: "water", fish: "water", duck: "water" };

  const scenes = {
    kitchen: {
      spots: {
        any: [
          ...row(114, 70, 225, 295, 365, 435, 505),
          ...row(209, 70, 225, 295, 365, 435, 505),
          ...row(114, 64, 830, 895, 960),
          ...row(209, 64, 830, 895, 960),
          ...row(338, 74, 205, 425, 495, 725, 795, 865, 945),
          ...row(514, 76, 262, 335, 408, 482),
          ...row(622, 80, 56, 150, 610, 700, 790, 880, 955),
        ],
        fridge: [[92, 540, 250]],
        oven: [[630, 484, 142]],
      },
      place: { fridge: "fridge", oven: "oven" },
    },
    market: {
      spots: {
        any: [
          ...row(226, 88, 165, 265, 365, 465, 565, 665, 765, 845),
          ...row(360, 92, 115, 225, 335, 445, 555, 665, 775, 885),
          ...row(495, 96, 75, 195, 315, 435, 555, 675, 795, 915),
          ...row(622, 84, 130, 330, 530, 730, 900),
        ],
      },
    },
    farm: {
      spots: {
        any: [
          ...row(350, 84, 310, 415, 520, 625, 730, 835, 945),
          ...row(445, 96, 70, 195, 320, 445, 555, 680, 800, 920),
          ...row(555, 100, 70, 195, 320, 445),
          ...row(622, 84, 130, 390, 515),
        ],
        sky: [[420, 100, 76], [600, 70, 76], [740, 120, 76], [520, 135, 70], [310, 190, 66]],
        water: [[680, 555, 76], [790, 530, 76], [880, 570, 76], [750, 590, 60]],
      },
      place: OUTDOOR_PLACE,
    },
    classroom: {
      spots: {
        any: [
          ...row(194, 62, 65, 125, 185),
          ...row(318, 62, 65, 125, 185),
          ...row(442, 62, 65, 125, 185),
          ...row(334, 76, 360, 445, 530, 620),
          ...row(343, 70, 775, 845, 915, 975),
          ...row(524, 78, 75, 165, 255),
          ...row(524, 78, 405, 500, 595),
          ...row(524, 78, 735, 830, 925),
          ...row(622, 66, 325, 660),
        ],
        wall: [[255, 130, 84], [730, 310, 70]],
      },
      place: { clock: "wall" },
    },
    home: {
      spots: {
        any: [
          ...row(292, 112, 80, 205, 330, 445, 575, 700, 825, 935),
          ...row(592, 112, 75, 200, 325, 450, 565, 700, 825),
          ...row(170, 68, 90, 165, 240, 730, 820, 910),
          ...row(464, 68, 100, 195, 290, 730, 820, 910),
        ],
        door: [[945, 594, 150]],
        wall: [[380, 200, 110], [590, 170, 100], [440, 470, 100]],
      },
      place: { door: "door", window: "wall" },
    },
    bedroom: {
      spots: {
        any: [
          ...row(212, 104, 92, 190, 288, 386),
          ...row(386, 92, 92, 190, 288, 386),
          ...row(504, 86, 92, 190, 288, 386),
          ...row(402, 86, 650, 765, 880),
          ...row(172, 62, 830, 895, 955),
          ...row(622, 84, 480, 590, 700, 810, 920),
        ],
      },
    },
    clinic: {
      spots: {
        any: [
          ...row(146, 92, 110, 240),
          ...row(262, 92, 110, 240),
          ...row(146, 92, 435, 565),
          ...row(262, 92, 435, 565),
          ...row(146, 92, 760, 890),
          ...row(262, 92, 760, 890),
          ...row(405, 66, 60, 130, 200, 290),
          ...row(500, 72, 60, 130, 200, 290),
          ...row(392, 70, 445, 520, 600),
          ...row(452, 70, 790, 870, 945),
          ...row(622, 84, 110, 300, 480, 620, 800, 950),
        ],
      },
    },
    town: {
      spots: {
        any: [
          ...row(280, 110, 280, 415, 550, 685, 820, 945),
          ...row(428, 116, 75, 225, 375, 525, 675, 825, 945),
        ],
        sky: [[170, 130, 96], [400, 100, 96], [660, 130, 96], [880, 150, 80]],
        road: row(524, 96, 110, 330, 550, 770, 930),
        water: row(622, 80, 170, 500, 830),
        rail: [[125, 322, 124]],
      },
      place: { ...OUTDOOR_PLACE, train: "rail", car: "road", bus: "road", truck: "road", bike: "road" },
    },
    nature: {
      spots: {
        any: [
          ...row(470, 96, 70, 190, 310, 440, 560),
          ...row(600, 100, 70, 200, 330, 470),
          ...row(395, 84, 650, 760, 880, 970),
        ],
        day: [[85, 100, 92], [300, 100, 92], [525, 122, 84], [85, 226, 80], [300, 205, 76]],
        night: [[660, 120, 88], [790, 90, 88], [920, 130, 88], [860, 222, 64]],
        mountain: [[300, 310, 90], [700, 300, 84]],
        water: [[690, 555, 76], [800, 525, 76], [890, 575, 76]],
      },
      place: {
        sun: "day", cloud: "day", rain: "day", wind: "day", rainbow: "day", bird: "day", plane: "day",
        moon: "night", star: "night", snow: "mountain", fish: "water", boat: "water", duck: "water",
      },
    },
    park: {
      spots: {
        any: [
          ...row(330, 92, 150, 345, 470, 760, 860),
          ...row(450, 104, 60, 190, 320, 450, 590, 720, 870),
          ...row(585, 108, 70, 200, 330, 460, 570),
        ],
        sky: [[370, 90, 76], [530, 110, 76], [790, 90, 76]],
        water: [[710, 570, 90], [810, 545, 90], [900, 590, 90]],
      },
      place: { ...OUTDOOR_PLACE, "act-swim": "water", "sport-fishing": "water" },
    },
    playroom: {
      spots: {
        any: [
          ...row(172, 80, 80, 180),
          ...row(296, 80, 80, 180),
          ...row(420, 80, 80, 180),
          ...row(170, 108, 375, 575, 775),
          ...row(302, 84, 330, 430, 530, 630, 730, 830, 930),
          ...row(388, 74, 370, 470, 570),
          ...row(470, 92, 730, 840, 950),
          ...row(600, 96, 70, 190, 330, 450, 570, 690, 810, 930),
        ],
      },
    },
    dining: {
      spots: {
        any: [
          ...row(167, 78, 80, 155, 230),
          ...row(295, 78, 80, 155, 230),
          ...row(423, 78, 80, 155, 230),
          ...row(132, 82, 730, 830, 930),
          ...row(247, 82, 730, 830, 930),
          ...row(490, 92, 360, 470, 580, 690, 800, 910),
          ...row(615, 88, 90, 220, 420, 560, 700, 840),
        ],
        wall: [[350, 340, 90]],
      },
    },
  };

  const OBJECTS = ["ball", "book", "hat", "bag", "shoes", "clock", "flower", "umbrella", "lamp", "chair"];
  const ANIMALS = ["cat", "dog", "rabbit", "duck"];

  const topics = {
    vocabulary: { scene: "playroom", byTray: true, extras: ["shirt", "bus", "bed", "cow", "pizza", "pen", "lamp", "shoes", "banana", "chair", "plane", "cake", "bag", "egg", "hat", "horse"] },
    "vocab-kitchen": {
      scene: "kitchen",
      extras: ["apple", "banana", "orange", "carrot", "bread", "cheese", "egg", "milk", "pizza", "cake", "icecream", "water", "ball", "hat", "shoes", "book", "cat", "flower", "umbrella"],
    },
    "vocab-food": { scene: "market", extras: ["bag", "hat", "cat", "clock", "flower", "ball", "bird", "umbrella", "shoes", "book", "cup", "plate", "pencil", "bike", "dog"] },
    "vocab-animals": { scene: "farm", extras: ["ball", "flower", "tree", "apple", "carrot", "hat", "bag", "bike", "car", "umbrella", "boat", "shoes", "book", "chair", "plane"] },
    "vocab-school": { scene: "classroom", extras: ["apple", "ball", "cat", "hat", "banana", "shoes", "flower", "cup", "umbrella", "car", "fish", "lamp", "pizza", "bird", "dog", "socks"] },
    "vocab-home": { scene: "home", extras: ["ball", "cat", "dog", "book", "apple", "shoes", "clock", "flower", "bag", "cup", "umbrella", "hat", "car", "pencil", "pizza"] },
    "vocab-family": { scene: "home", scale: 1.05, extras: ["bed", "sofa", "table", "chair", "lamp", "tv", "ball", "cat", "dog", "book", "clock", "flower", "bag", "umbrella", "bath", "shoes", "cup", "car"] },
    "vocab-clothes": { scene: "bedroom", extras: ["ball", "book", "cat", "clock", "lamp", "apple", "bag", "pencil", "flower", "cup", "car", "umbrella", "dog", "banana"] },
    "vocab-body": { scene: "clinic", extras: ["clock", "cup", "book", "apple", "pencil", "bag", "flower", "chair", "lamp", "water", "ball", "umbrella", "shoes", "hat", "cat", "bed"] },
    "vocab-transport": { scene: "town", extras: ["tree", "flower", "dog", "cat", "bird", "ball", "house", "umbrella", "bag", "horse", "cow", "duck", "fish", "cloud"] },
    "vocab-places": {
      scene: "town",
      place: { "place-bus-stop": "road" },
      extras: ["bus", "car", "truck", "tree", "flower", "dog", "bird", "plane", "helicopter", "boat", "train", "duck"],
    },
    "vocab-jobs": { scene: "town", extras: ["house", "bus", "car", "tree", "flower", "dog", "cat", "bird", "plane", "boat", "train", "ball", "bike", "bag", "umbrella", "cow"] },
    "vocab-nature": { scene: "nature", extras: ["cow", "rabbit", "fish", "boat", "ball", "bike", "apple", "hat", "umbrella", "horse", "bag", "car", "dog", "shoes"] },
    "vocab-actions": { scene: "park", scale: 1.05, extras: ["ball", "bike", "dog", "cat", "bird", "duck", "flower", "tree", "apple", "bag", "umbrella", "hat", "fish", "plane"] },
    "vocab-hobbies": { scene: "park", extras: [...ANIMALS, "bike", "bird", "flower", "tree", "apple", "bag", "umbrella", "hat", "book", "boat"] },
    "vocab-numbers": { scene: "playroom", extras: [...OBJECTS, ...ANIMALS, "car", "apple", "bus", "banana", "cup", "bird"] },
    "vocab-colors": { scene: "playroom", extras: [...OBJECTS, ...ANIMALS, "car", "bus", "cup", "bird", "pencil", "fish"] },
    "vocab-feelings": { scene: "playroom", extras: [...OBJECTS, ...ANIMALS, "car", "apple", "bus", "banana", "cup", "bird"] },
    "vocab-opposites": { scene: "playroom", byTray: true, extras: ["cat", "dog", "ball", "book", "hat", "bag", "shoes", "flower", "umbrella", "lamp", "chair", "banana", "bird", "fish", "pizza", "cow"] },
    "vocab-holidays": { scene: "dining", extras: ["apple", "book", "clock", "cup", "flower", "ball", "cat", "lamp", "hat", "shoes", "plate", "fork", "spoon", "bread", "umbrella", "bag"] },
  };

  window.ENGLISH_HUNT = { scenes, topics, sceneUrl: (id) => `/images/english/scenes/${id}.svg` };
})();
