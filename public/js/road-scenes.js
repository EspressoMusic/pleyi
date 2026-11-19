/* The pictures of the road-safety picture games (road-safety.js).
   A game's card shows on /road-safety once it has at least one picture.

   find — "מצאו בתמונה": things hidden in a busy street picture.
     { id, title, src, w, h, items: [{ name, img?, box: [x, y, w, h] }] }
     img: a small picture of the thing for the list under the big one
     (the name alone when left out).
   wrong — "מה לא בסדר?": the dangers in a street picture.
     { id, title, src, w, h, spots: [{ says, fix, box: [x, y, w, h] }] }
     says: what is wrong ("ילד חוצה באדום"); fix: what to do instead
     ("מחכים לאיש הירוק").
   box: where it is, in the picture's own pixels (w x h); a tap inside it
   (or very near it) finds it.
   Pictures go in /images/road/<id>/. No pictures of girls or women. */

(function () {
  window.RoadScenes = {
    find: [],
    wrong: [],
  };
})();
