"""Makes the ready-made English audio clips the site plays: one mp3 per word or
sentence in public/audio/en/, and the list of them in
public/js/english-audio-clips.js. A clip that already exists is kept, so run it
again after adding words and only the new ones are made.

Needs ffmpeg and a current edge-tts (pip install --upgrade edge-tts). Older
versions get a 403 from the service.

    python scripts/generate-english-audio.py
"""

import asyncio
import json
import os
import re
import ssl
import subprocess
import sys
import tempfile

import edge_tts
import edge_tts.communicate

VOICE = "en-US-GuyNeural"
# A little slower than normal speech, for learners. speech.js counts on it.
RATE = "-10%"
WORKERS = 6

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "audio", "en")
LIST_FILE = os.path.join(ROOT, "public", "js", "english-audio-clips.js")

# edge-tts trusts only certifi's list, so behind a filtering connection (the
# filter re-signs the traffic with its own root) it can't connect. Use the
# computer's list instead. Python 3.13's strict mode also refuses such a root;
# the chain and host name are still checked.
_context = ssl.create_default_context()
_context.verify_flags &= ~ssl.VERIFY_X509_STRICT
edge_tts.communicate._SSL_CTX = _context


def slug(text):
    """The clip's file name. speech.js must compute the same one."""
    return re.sub(r"[^a-z0-9]+", "-", re.sub(r"['’]", "", text.lower())).strip("-")


def texts():
    node = subprocess.run(
        ["node", os.path.join(ROOT, "scripts", "english-audio-texts.js")],
        capture_output=True, check=True,
    )
    return json.loads(node.stdout.decode("utf-8"))


def trim(source, target):
    """Cuts the silence at both ends, so the word starts as soon as it plays,
    and keeps the files small: mono, 40 kbps."""
    silence = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", source,
         "-af", f"{silence},areverse,{silence},areverse",
         "-ac", "1", "-ar", "24000", "-b:a", "40k", target],
        check=True,
    )


async def make(text, name, tmp):
    raw = os.path.join(tmp, f"{name}.raw.mp3")
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, VOICE, rate=RATE).save(raw)
            trim(raw, os.path.join(OUT_DIR, f"{name}.mp3"))
            os.remove(raw)
            return True
        except Exception as error:  # the service sometimes drops a connection
            if attempt == 3:
                print(f"FAILED {text!r}: {error}", file=sys.stderr)
            await asyncio.sleep(1 + attempt * 2)
    return False


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    wanted = {}
    for text in texts():
        wanted.setdefault(slug(text), text)
    todo = [(name, text) for name, text in wanted.items() if not os.path.exists(os.path.join(OUT_DIR, f"{name}.mp3"))]
    print(f"{len(wanted)} clips, {len(todo)} to make", flush=True)

    queue = iter(todo)
    done = 0

    async def worker(tmp):
        nonlocal done
        for name, text in queue:
            await make(text, name, tmp)
            done += 1
            if done % 100 == 0:
                print(f"{done}/{len(todo)}", flush=True)

    with tempfile.TemporaryDirectory() as tmp:
        await asyncio.gather(*(worker(tmp) for _ in range(WORKERS)))

    have = sorted(name for name in wanted if os.path.exists(os.path.join(OUT_DIR, f"{name}.mp3")))
    with open(LIST_FILE, "w", encoding="utf-8", newline="\n") as out:
        out.write("/* Made by scripts/generate-english-audio.py: the words and sentences that\n")
        out.write("   have a ready-made clip in /audio/en/. speech.js reads it. */\n")
        out.write(f"window.ENGLISH_AUDIO_CLIPS = {json.dumps(' '.join(have))}.split(\" \");\n")
    print(f"done: {len(have)} of {len(wanted)} clips", flush=True)


asyncio.run(main())
