/* Says English words and sentences in a man's voice.

   Most of them have a ready-made clip (english-audio-clips.js lists them,
   scripts/generate-english-audio.py makes them), which starts the moment it is
   clicked and sounds the same on every device. Anything else — a reading
   passage, an exercise the AI just wrote — goes to the browser's own voice: a
   man's voice installed on the device if there is one. Online voices come
   after those because they take a second or two to start.

   PleyiSpeech.say(text, rate)        — rate 0.9 is the normal pace
   PleyiSpeech.preload(texts)         — fetches clips before they are needed
   PleyiSpeech.stop()
   PleyiSpeech.canSpeak()
   PleyiSpeech.utterance(text, rate)  — a browser-voice utterance, for reading
                                        a passage paragraph by paragraph */

(function () {
  const CLIP_URL = (name) => `/audio/en/${name}.mp3?v=1`;
  // The pace the clips were recorded at (generate-english-audio.py).
  const CLIP_RATE = 0.9;
  // How much lower a voice that may be a woman's is pitched.
  const LOW_PITCH = 0.72;

  const MALE_NAMES = /\b(andrew|brian|christopher|david|eric|george|guy|james|mark|richard|roger|ryan|steffan|thomas|william|aaron|alex|arthur|daniel|fred|gordon|lee|oliver|rishi|tom|male)\b/i;
  // Android names its voices by code.
  const MALE_CODES = /en[-_](us|gb|au|in)[-_]x[-_](iol|iom|tpd|gbb|gbd|rjs|aub|aud|ene|end)/i;

  const clips = new Set(window.ENGLISH_AUDIO_CLIPS || []);
  const fetched = new Map();
  let audioContext = null;
  let playing = null;
  let turn = 0;

  // The clip's file name. generate-english-audio.py computes the same one.
  function clipName(text) {
    return String(text)
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function hasBrowserVoice() {
    return "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  }

  function canSpeak() {
    return clips.size > 0 || hasBrowserVoice();
  }

  /* ── Browser voice ── */

  let cachedVoice;

  function isMale(voice) {
    return MALE_NAMES.test(voice.name) || MALE_CODES.test(voice.name);
  }

  function pickVoice() {
    if (cachedVoice !== undefined) return cachedVoice;
    const voices = (window.speechSynthesis?.getVoices?.() || []).filter((v) => /^en/i.test(v.lang));
    if (!voices.length) return null;
    const best = (list) => list.find((v) => v.localService && /^en[-_]US/i.test(v.lang)) || list.find((v) => v.localService) || list.find((v) => /^en[-_]US/i.test(v.lang)) || list[0];
    cachedVoice = best(voices.filter(isMale)) || best(voices) || null;
    return cachedVoice;
  }

  if (hasBrowserVoice()) {
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {
      cachedVoice = undefined;
    });
  }

  function utterance(text, rate = CLIP_RATE) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = rate;
    const voice = pickVoice();
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    }
    if (!voice || !isMale(voice)) utter.pitch = LOW_PITCH;
    return utter;
  }

  function sayWithBrowser(text, rate) {
    if (hasBrowserVoice()) window.speechSynthesis.speak(utterance(text, rate));
  }

  /* ── Ready-made clips ── */

  function getContext() {
    if (!audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) audioContext = new Context();
    }
    return audioContext;
  }

  // Browsers keep sound locked until the first click or key press. On iPhones
  // the "playback" session also lets it through the silent switch.
  if (clips.size) {
    if (navigator.audioSession) navigator.audioSession.type = "playback";
    const unlock = () => {
      const context = getContext();
      context?.resume?.();
      if (context?.state === "running") {
        ["pointerup", "touchend", "click", "keydown"].forEach((type) => window.removeEventListener(type, unlock, true));
      }
    };
    ["pointerup", "touchend", "click", "keydown"].forEach((type) => window.addEventListener(type, unlock, true));
  }

  // The compressed clip, kept for the whole visit: decoding one takes only a
  // few milliseconds, so it happens at each play.
  function fetchClip(name) {
    if (!fetched.has(name)) {
      fetched.set(
        name,
        fetch(CLIP_URL(name))
          .then((res) => {
            if (!res.ok) throw new Error(String(res.status));
            return res.arrayBuffer();
          })
          .catch(() => {
            fetched.delete(name);
            return null;
          })
      );
    }
    return fetched.get(name);
  }

  function playClip(name, text, rate, myTurn) {
    const context = getContext();
    context.resume?.();
    fetchClip(name)
      .then((data) => {
        if (!data) throw new Error("no clip");
        return new Promise((resolve, reject) => context.decodeAudioData(data.slice(0), resolve, reject));
      })
      .then((buffer) => {
        if (myTurn !== turn) return;
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start();
        playing = source;
      })
      .catch(() => {
        if (myTurn === turn) sayWithBrowser(text, rate);
      });
  }

  // A slower pace (the "slow" button) needs the pitch kept, which only an
  // audio element does.
  function playSlowClip(name, text, rate, pace, myTurn) {
    fetchClip(name).then((data) => {
      if (myTurn !== turn) return;
      if (!data) {
        sayWithBrowser(text, rate);
        return;
      }
      const url = URL.createObjectURL(new Blob([data], { type: "audio/mpeg" }));
      const element = new Audio(url);
      element.playbackRate = pace;
      element.preservesPitch = true;
      element.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
      element.play().catch(() => {
        URL.revokeObjectURL(url);
        if (myTurn === turn) sayWithBrowser(text, rate);
      });
      playing = { stop: () => element.pause() };
    });
  }

  /* ── The public calls ── */

  function stop() {
    turn++;
    try {
      playing?.stop();
    } catch {
      /* already over */
    }
    playing = null;
    if (hasBrowserVoice()) window.speechSynthesis.cancel();
  }

  function say(text, rate = CLIP_RATE) {
    if (!text) return;
    stop();
    const name = clipName(text);
    if (clips.has(name) && getContext()) {
      const pace = rate / CLIP_RATE;
      if (Math.abs(pace - 1) > 0.05) playSlowClip(name, text, rate, pace, turn);
      else playClip(name, text, rate, turn);
    } else {
      sayWithBrowser(text, rate);
    }
  }

  function preload(texts) {
    (texts || []).forEach((text) => {
      const name = clipName(text);
      if (clips.has(name)) fetchClip(name);
    });
  }

  window.PleyiSpeech = { say, stop, preload, canSpeak, utterance };
})();
