# Truthful AI Daily Tracker

A self-betterment game. Log what you did today in your own words, and a
character answers — appreciation first, then one piece of advice for
betterment, 200–300 words, in that character's voice.

## How it works

- **Log an activity** in plain language. It is saved in your browser
  (localStorage). Nothing leaves your machine except the advice call.
- **A character pops up at random** beside the dialogue box — Sarah,
  Jeremiah, Marty Byrde, or Harkhy — and answers in their voice. You never
  know who walks in next. There is no character select.
- **Level up:** every 5 activities = one level up. No XP, no badges.
- **Day counter:** days since your first logged activity. First day = Day 1.

## The characters

- **Sarah** — playful young blonde woman. Teases you, then cheers you on.
- **Jeremiah** — army-type motivator. "You got it, commando." Mission framing.
- **Marty Byrde** — calm, logical, cold, indirect. Voice distilled from
  Ozark S1–S4. Conditions first, the math, then the move.
- **Harkhy** — little Aladdin, fair Mediterranean skin. Your own voice:
  short bursts, direct, "yeah" as a verdict.

Portraits are high-res 3D renders embedded in `portraits.js` (base64 data
URIs — the push route is text-only, so no binary files).

## Design (v2)

Dark premium. Deep navy / charcoal base, white text, electric blue accent,
warm amber highlight. PS5-dashboard feel. Anton for display type, Inter for
body. Full desktop width. Pokémon-style dialogue layout: text box with the
character portrait at the side — that is the only thing taken from Pokémon.

## Setup

1. Open the app (GitHub Pages: enable it in repo Settings → Pages →
   Deploy from a branch → main / root).
2. Paste your **Anthropic API key** into Settings. It stays in this browser
   and only ever goes to `api.anthropic.com` in the direct call that gets
   your advice. Model defaults to `claude-sonnet-4-5`.
3. Log your first activity.

## Tech

Static HTML/CSS/JS. No framework, no backend, no accounts. Files:
`index.html`, `style.css`, `app.js`, `portraits.js`.

## Site

https://harkseehra.github.io/Truthful-AI-Daily-Tracker/
