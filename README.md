# Truthful Tracker - AI

A self-betterment game. Log what you did today in your own words, and a cartoon
character answers — appreciation first, then one piece of advice for betterment,
200–300 words, in that character's voice.

Old Pokemon / Game Boy style. Chunky pixel art, pixel font, the classic dialogue
box. Pixel-clear on a 4K monitor (nearest-neighbour scaling, no blur anywhere).

## Characters

- **Sarah** — playful young blonde woman. Teases you, then cheers you on.
- **Jeremiah** — army-type Black man. Motivational. "You got it, commando."
- **Marty Byrde** — logical, cold, indirect. The Marty voice, from the Ozark
  voice profile (calm, conditions first, "let's say" + a rounded number).
- **Harkhy** — little Aladdin, fair with Mediterranean skin tone. In Harkirat's
  own voice (short bursts, "yeah" as a verdict, conditions first).

Pick one, or hit RANDOM ROLL.

## The rules

- **5 activities = 1 level up.** No XP. No badges. Just level up.
- **Day counter** — days since your first logged activity. First day = Day 1.
- Activities are stored in your browser (localStorage). Nothing leaves your
  machine except the advice call.

## Setup

1. Get an Anthropic API key (console.anthropic.com).
2. Open the app, scroll to Settings, paste your key, save.
3. The key stays in your browser. It only ever goes to `api.anthropic.com`,
   in the direct call that gets your advice. Nothing else.
4. Default model is `claude-sonnet-4-5` — change it in Settings if you want.

## Local first

No backend, no accounts, no framework. Static HTML/CSS/JS. Open `index.html`
or serve the folder with any static server.

## Site

https://harkseehra.github.io/Truthful-AI-Daily-Tracker/
