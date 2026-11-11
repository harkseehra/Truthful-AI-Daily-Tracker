/* TRUTHFUL AI DAILY TRACKER — v3
   Static. Local first. No backend. No accounts.
   Clean pastel yellow, light, more white.
   Activities + API key live in localStorage only.
   The key only ever leaves the machine in the direct call to api.anthropic.com.
   No character select: one character is picked at random for each piece of
   advice and pops up beside the dialogue box. The advice rolls in with a
   typewriter effect and auto-advances every 5 seconds. */

"use strict";

/* ================= CHARACTER VOICES =================
   Each voice is a system prompt written into the program.
   Marty: distilled from Ozark S1-S4 (voice-profile.md).
   Harkhy: Harkirat's own tone profile v1 (Oct 21 2026).
   Sarah + Jeremiah: written fresh, in the same spirit.
   Portraits come from portraits.js (base64 data URIs). */

const CHARACTERS = {
  sarah: {
    name: "SARAH",
    role: "PLAYFUL",
    tagline: "Teases you, then cheers you on.",
    system: [
      "You are Sarah, a playful young blonde woman in a cartoon game world. You are the player's cheerful friend.",
      "Voice: light, teasing, warm, playful. Short bursts. Little jokes. You say things like 'ohh, look at you!' and 'okay, that was actually cute.' You never lecture and never sound like a teacher.",
      "Your job: the player just told you something they did today. First, appreciate them — genuinely, playfully, like you are proud and a little bit teasing. Then give exactly ONE piece of advice for betterment — small, doable, fun, something they can try tomorrow.",
      "Length: 200 to 300 words total. Write it as one flowing reply in your voice, no headings, no bullet lists, no breaking character, no mentioning that you are an AI.",
      "Never moralize. Never guilt-trip. If the activity is small, celebrate it anyway — small counts."
    ].join(" ")
  },
  jeremiah: {
    name: "JEREMIAH",
    role: "COMMANDO",
    tagline: "Motivation. Mission. Move.",
    system: [
      "You are Jeremiah, an army-type Black man in a cartoon game world. You are the player's motivator and drill buddy — tough, warm, and always in their corner.",
      "Voice: short, punchy sentences. Motivational. Mission framing. You say things like 'you got it, commando' and 'listen up, soldier.' Orders, not essays. Discipline is care.",
      "Your job: the player just told you something they did today. First, appreciate them — loud, proud, like a mission accomplished. Then give exactly ONE piece of advice for betterment — framed as the next mission, one clear objective, doable tomorrow.",
      "Length: 200 to 300 words total. Write it as one flowing reply in your voice, no headings, no bullet lists, no breaking character, no mentioning that you are an AI.",
      "Never shame the player. Never be cruel. Hard on the mission, soft on the person."
    ].join(" ")
  },
  marty: {
    name: "MARTY BYRDE",
    role: "DAD / LOGIC",
    tagline: "Calm. Cold. Indirect. The math.",
    system: [
      "You are Marty Byrde, the calm, logical dad-type character in a cartoon game world. You speak like Marty Byrde from Ozark: calm, rational, dry. You are the only sane man in the room, and you know it, and it exhausts you.",
      "Voice: short declarative sentences, one thought per line, fragments welcome. Open flat — 'Okay.' / 'Here's the thing.' / 'Look.' Tag explanations with a check-in: 'okay?', 'right?', 'all right?' Restate the situation back plainer than the player said it. Numbers are your adjectives — use exact figures instead of vague ones. 'Let's say' plus a rounded number when you sketch a scenario. Dry understatement, then move on. Never moralize, never gush, never ramble, never do tough-guy talk. Under pressure you get shorter, not louder.",
      "Your job: the player just told you something they did today. First, appreciate them — flat, rationed, one line, and mean it. Then give exactly ONE piece of advice for betterment — logical, cold, indirect. Reduce it to mechanics: the situation, the constraint, the move. A plan with steps, not a feeling.",
      "Length: 200 to 300 words total. Write it as short lines separated by line breaks, Marty style — never a wall of text, no headings, no bullet lists, no breaking character, no mentioning that you are an AI.",
      "Never lecture on right and wrong. Never claim the moral high ground. You show the math of why the better move is their best option."
    ].join(" ")
  },
  harkhy: {
    name: "HARKHY",
    role: "LITTLE HARKHY",
    tagline: "Little Aladdin. Your voice.",
    system: [
      "You are Little Harkhy, a little Aladdin-type kid in a cartoon game world — fair, Mediterranean skin tone, street-smart, quick. You talk exactly like Harkirat: short bursts, one thought per line, zero preamble, direct address.",
      "Voice: 'yeah' is a complete verdict. Questions stripped out. Profanity as punctuation and emphasis, not anger. You think in conditions — if this, then that. 'Let's say' plus a rounded number when you sketch a scenario. Numbers written loose, like 600$ or 4.5k$. Dashes chain clauses. You write sounds, not spellings. A receipt is one word: Cool. Yeah. Okay. You never pad, never over-explain, never sound like a teacher.",
      "Your job: the player just told you something they did today. First, appreciate them — in your own words, short and real. Then give exactly ONE piece of advice for betterment — plain, direct, one condition at a time.",
      "Length: 200 to 300 words total. Write it as short lines, your cadence — no headings, no bullet lists, no breaking character, no mentioning that you are an AI.",
      "Never lecture. Never moralize. You talk to the player like a friend who tells it straight."
    ].join(" ")
  }
};

const CHARACTER_KEYS = ["sarah", "jeremiah", "marty", "harkhy"];

/* ================= STATE ================= */

const LS = {
  activities: "tt_activities",
  key: "tt_api_key",
  model: "tt_model"
};

const DEFAULT_MODEL = "claude-sonnet-4-5";

function loadActivities() {
  try {
    return JSON.parse(localStorage.getItem(LS.activities) || "[]");
  } catch (_) {
    return [];
  }
}

function saveActivities(list) {
  localStorage.setItem(LS.activities, JSON.stringify(list));
}

/* Level: every 5 activities = one level up. No XP. No badges. */
function levelFor(count) {
  return 1 + Math.floor(count / 5);
}

function activitiesToNextLevel(count) {
  return 5 - (count % 5);
}

/* Day counter: days since first activity. First day = Day 1. */
function dayFor(activities) {
  if (!activities.length) return 1;
  const first = Math.min(...activities.map((a) => a.ts));
  return Math.floor((Date.now() - first) / 86400000) + 1;
}

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

/* ================= UI ================= */

const $ = (id) => document.getElementById(id);

let dialoguePages = [];
let dialoguePageIndex = 0;
let typeTimer = null;
let autoTimer = null;
let typing = false;

/* The advice rolls on by itself: next page every 5 seconds. */
const AUTO_ADVANCE_MS = 5000;

function stopDialogueTimers() {
  if (typeTimer !== null) { clearInterval(typeTimer); typeTimer = null; }
  if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = null; }
  typing = false;
}

function setTalking(on) {
  const img = $("portrait-img");
  if (!img) return;
  img.classList.toggle("talking", !!on && !img.hidden);
}

function setDialogue(name, text, paginate) {
  stopDialogueTimers();
  setTalking(false);
  $("dialogue-name").textContent = name;
  if (paginate) {
    dialoguePages = paginateText(text);
    dialoguePageIndex = 0;
    renderDialoguePage();
  } else {
    dialoguePages = [];
    dialoguePageIndex = 0;
    $("dialogue-text").textContent = text;
    $("dialogue-next").hidden = true;
  }
}

function paginateText(text) {
  // Game text: short pages, one idea per page.
  const sentences = text.match(/[^.!?\n]+[.!?\n]+["']?|[^.!?\n]+$/g) || [text];
  const pages = [];
  let page = "";
  for (const s of sentences) {
    const piece = s.trim();
    if (!piece) continue;
    if (page.length + piece.length + 1 > 300 && page) {
      pages.push(page);
      page = piece;
    } else {
      page = page ? page + " " + piece : piece;
    }
  }
  if (page) pages.push(page);
  return pages.length ? pages : [text];
}

/* Roll the page in, game-style, with a blinking caret. */
function typePage(text, onDone) {
  const el = $("dialogue-text");
  let i = 0;
  typing = true;
  setTalking(true);
  const step = () => {
    i = Math.min(text.length, i + 3);
    el.textContent = text.slice(0, i);
    const caret = document.createElement("span");
    caret.className = "caret";
    el.appendChild(caret);
    if (i >= text.length) {
      clearInterval(typeTimer);
      typeTimer = null;
      typing = false;
      el.textContent = text;
      setTalking(false);
      if (onDone) onDone();
    }
  };
  step();
  typeTimer = setInterval(step, 18);
}

function scheduleAutoAdvance() {
  autoTimer = setTimeout(() => {
    dialoguePageIndex++;
    renderDialoguePage();
  }, AUTO_ADVANCE_MS);
}

function renderDialoguePage() {
  stopDialogueTimers();
  const hasNext = dialoguePageIndex < dialoguePages.length - 1;
  $("dialogue-next").hidden = !hasNext;
  const page = dialoguePages[dialoguePageIndex] || "";
  typePage(page, () => {
    if (hasNext) scheduleAutoAdvance();
  });
}

$("dialogue-box").addEventListener("click", () => {
  if (typing) {
    // Finish this page instantly instead of waiting for the roll.
    stopDialogueTimers();
    $("dialogue-text").textContent = dialoguePages[dialoguePageIndex] || "";
    setTalking(false);
    if (dialoguePageIndex < dialoguePages.length - 1) scheduleAutoAdvance();
    return;
  }
  if (dialoguePages.length && dialoguePageIndex < dialoguePages.length - 1) {
    dialoguePageIndex++;
    renderDialoguePage();
  }
});

/* ---- the random reveal: one character pops up beside the dialogue box ---- */

let lastCharacter = null;

function pickRandomCharacter() {
  let pool = CHARACTER_KEYS.filter((k) => k !== lastCharacter);
  if (!pool.length) pool = CHARACTER_KEYS;
  const key = pool[Math.floor(Math.random() * pool.length)];
  lastCharacter = key;
  return key;
}

function showCharacter(key) {
  const img = $("portrait-img");
  const empty = $("portrait-empty");
  img.src = PORTRAITS[key];
  img.alt = CHARACTERS[key].name;
  img.hidden = false;
  empty.hidden = true;
  // Re-trigger the pop-in animation.
  img.classList.remove("pop");
  void img.offsetWidth;
  img.classList.add("pop");
}

function renderStats() {
  const activities = loadActivities();
  $("day-count").textContent = dayFor(activities);
  $("level-count").textContent = levelFor(activities.length);
  $("activity-count").textContent = activities.length;
  $("next-level").textContent = activitiesToNextLevel(activities.length);
}

function renderHistory() {
  const activities = loadActivities();
  const list = $("history-list");
  list.innerHTML = "";
  $("empty-log").style.display = activities.length ? "none" : "block";
  const recent = activities.slice(-10).reverse();
  for (const a of recent) {
    const li = document.createElement("li");
    const who = document.createElement("span");
    who.className = "log-who";
    who.textContent = CHARACTERS[a.character].name + "  •  " + fmtTime(a.ts);
    li.append(who, document.createTextNode(a.text));
    list.appendChild(li);
  }
}

$("clear-btn").addEventListener("click", () => {
  if (!confirm("Clear all your activities? Your day count and level reset too.")) return;
  saveActivities([]);
  lastCharacter = null;
  renderStats();
  renderHistory();
  $("portrait-img").hidden = true;
  $("portrait-empty").hidden = false;
  setDialogue("???", "Activities cleared. Fresh start. One line is all it takes.", false);
});

/* ================= ANTHROPIC CALL ================= */

async function getAdvice(characterKey, activityText, day, level) {
  const apiKey = (localStorage.getItem(LS.key) || "").trim();
  const model = (localStorage.getItem(LS.model) || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
  if (!apiKey) {
    throw new Error("NO_KEY");
  }
  const c = CHARACTERS[characterKey];
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1200,
      system: c.system,
      messages: [
        {
          role: "user",
          content:
            "This is Day " + day + " of my journey. I am Level " + level + ". " +
            "Today I did this: \"" + activityText + "\". Respond as " + c.name + "."
        }
      ]
    })
  });
  if (!res.ok) {
    let detail = "";
    try {
      const err = await res.json();
      detail = err && err.error && err.error.message ? ": " + err.error.message : "";
    } catch (_) { /* ignore */ }
    throw new Error("API_" + res.status + detail);
  }
  const data = await res.json();
  const text = data && data.content && data.content[0] && data.content[0].text;
  if (!text) throw new Error("EMPTY_REPLY");
  return text;
}

/* ================= LOG FLOW ================= */

let busy = false;

$("log-btn").addEventListener("click", async () => {
  if (busy) return;
  const input = $("activity-input");
  const text = input.value.trim();
  if (!text) {
    setDialogue("???", "Write something first. One line is enough. What did you do today?", false);
    input.focus();
    return;
  }

  // A character pops up at random, beside the dialogue box.
  const characterKey = pickRandomCharacter();
  const c = CHARACTERS[characterKey];
  showCharacter(characterKey);

  const activities = loadActivities();
  const oldLevel = levelFor(activities.length);
  const entry = { text: text, ts: Date.now(), character: characterKey };
  activities.push(entry);
  saveActivities(activities);
  input.value = "";
  renderStats();
  renderHistory();

  const newLevel = levelFor(activities.length);
  const day = dayFor(activities);
  const leveledUp = newLevel > oldLevel;

  busy = true;
  setDialogue(c.name, c.name + " is thinking...", false);
  try {
    const advice = await getAdvice(characterKey, text, day, newLevel);
    let full = advice;
    if (leveledUp) {
      full = "LEVEL UP! You are now LEVEL " + newLevel + ". Five activities, one level. That is how it works.\n\n" + advice;
    }
    setDialogue(c.name, full, true);
  } catch (err) {
    if (err.message === "NO_KEY") {
      setDialogue(c.name, "Hold on. I need your Anthropic API key first — put it in Settings below. It stays in this browser, and it only ever goes to api.anthropic.com. Your activity is saved already. Add the key and add your next one.", false);
    } else {
      setDialogue(c.name, "Something went wrong getting my reply (" + err.message + "). Your activity is saved. Check your key and model in Settings, then try again.", false);
    }
  } finally {
    busy = false;
  }
});

/* ================= SETTINGS ================= */

$("save-settings-btn").addEventListener("click", () => {
  const key = $("api-key").value.trim();
  const model = $("model").value.trim() || DEFAULT_MODEL;
  if (key) localStorage.setItem(LS.key, key);
  localStorage.setItem(LS.model, model);
  setDialogue("???", "Settings saved. Your key stays in this browser. Nothing else changes.", false);
});

/* ================= INIT ================= */

(function init() {
  const savedKey = localStorage.getItem(LS.key);
  if (savedKey) $("api-key").value = savedKey;
  const savedModel = localStorage.getItem(LS.model);
  if (savedModel) $("model").value = savedModel;
  renderStats();
  renderHistory();
})();
