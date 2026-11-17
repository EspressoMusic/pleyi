/* The pictures of "חפשו ומצאו" (class-games.js): one big busy picture and
   the things hidden in it. Each thing has its own small picture for the bar
   under the big one, and a box [x, y, w, h] in the big picture's own pixels
   (w x h of the scene): a tap inside the box finds it.
   No pictures of girls or women here. */

(function () {
  const park = "/images/class-find/park";
  const picnic = "/images/class-find/picnic";

  window.ClassFindScenes = [
    {
      id: "park",
      title: "יום בפארק",
      src: `${park}/scene.jpg`,
      w: 1536,
      h: 1024,
      items: [
        { name: "עפיפון", img: `${park}/kite.png`, box: [245, 12, 151, 102] },
        { name: "ברווז גומי", img: `${park}/duck.png`, box: [789, 413, 49, 52] },
        { name: "מזלף", img: `${park}/watering-can.png`, box: [1412, 606, 98, 84] },
        { name: "משקפת", img: `${park}/binoculars.png`, box: [701, 648, 68, 51] },
        { name: "כובע", img: `${park}/cap.png`, box: [1188, 157, 32, 22] },
        { name: "מגף", img: `${park}/boot.png`, box: [1181, 882, 64, 78] },
        { name: "גזר", img: `${park}/carrot.png`, box: [361, 879, 66, 55] },
        { name: "סירה", img: `${park}/boat.png`, box: [931, 399, 63, 70] },
        { name: "פרפר", img: `${park}/butterfly.png`, box: [62, 702, 55, 63] },
        { name: "תפוח", img: `${park}/apple.png`, box: [119, 491, 35, 42] },
        { name: "כדור", img: `${park}/ball.png`, box: [1072, 702, 55, 56] },
        { name: "תיבת אוצר", img: `${park}/chest.png`, box: [1446, 305, 70, 58] },
      ],
    },
    {
      id: "picnic",
      title: "פיקניק ביער",
      src: `${picnic}/scene.jpg`,
      w: 1536,
      h: 1024,
      items: [
        { name: "שועל צעצוע", img: `${picnic}/fox.png`, box: [1176, 519, 160, 164] },
        { name: "ספל", img: `${picnic}/mug.png`, box: [474, 657, 84, 73] },
        { name: "תרמוס", img: `${picnic}/thermos.png`, box: [647, 511, 52, 162] },
        { name: "מטרייה", img: `${picnic}/umbrella.png`, box: [1349, 251, 112, 352] },
        { name: "אגס", img: `${picnic}/pear.png`, box: [319, 344, 42, 73] },
        { name: "כפפה", img: `${picnic}/mitten.png`, box: [208, 650, 136, 88] },
        { name: "שעון כיס", img: `${picnic}/watch.png`, box: [178, 806, 78, 72] },
        { name: "סירה", img: `${picnic}/boat.png`, box: [985, 739, 118, 125] },
      ],
    },
  ];
})();
