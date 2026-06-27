(function () {
  'use strict';

  const SAVE_KEY = 'hollow_save';

  // ── Known evidence keys ───────────────────────
  // Extend this list as items are added to the game.
  // Order matters — each index maps to a bitmask bit.
  const EVIDENCE_KEYS = [
    'photograph', 'letter', 'key', 'newspaper', 'recording',
    'note', 'map', 'diary', 'receipt', 'ticket', 'badge', 'coin'
  ];

  const TRACK_IDS = ['nos-dawel', 'lady-windsor', 'cae-ddistaw'];

  // ── Game state ────────────────────────────────

  const GameState = {
    currentRoom:   null,
    evidence:      [],
    flags:         {},
    choices:       [],
    selectedTrack: null,
    chapter:       1,

    save() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          currentRoom:   this.currentRoom,
          evidence:      [...this.evidence],
          flags:         { ...this.flags },
          choices:       [...this.choices],
          selectedTrack: this.selectedTrack,
          chapter:       this.chapter,
          savedAt:       Date.now()
        }));
      } catch (_) {}
    },

    load() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const data        = JSON.parse(raw);
        this.currentRoom  = data.currentRoom  ?? null;
        this.evidence     = data.evidence     ?? [];
        this.flags        = data.flags        ?? {};
        this.choices      = data.choices      ?? [];
        this.selectedTrack = data.selectedTrack ?? null;
        this.chapter      = data.chapter      ?? 1;
        return true;
      } catch (_) {
        return false;
      }
    },

    clear() {
      localStorage.removeItem(SAVE_KEY);
      this.currentRoom   = null;
      this.evidence      = [];
      this.flags         = {};
      this.choices       = [];
      this.selectedTrack = null;
      this.chapter       = 1;
    },

    // Call when player collects a piece of evidence
    addEvidence(itemKey) {
      if (this.evidence.includes(itemKey)) return;
      this.evidence.push(itemKey);
      this.save();
      updateEvidencePanel();
    },

    // Call to set a story flag
    setFlag(name, value = true) {
      this.flags[name] = value;
      this.save();
    },

    // Call when player makes a narrative choice
    recordChoice(choiceId) {
      this.choices.push(choiceId);
      this.save();
    },

    // Call to move player to a new room
    goToRoom(roomId) {
      this.currentRoom = roomId;
      this.save();
      renderRoom(roomId);
    },

    // Call at the end of a chapter
    completeChapter(chapterNum) {
      this.chapter = chapterNum + 1;
      this.save();
      showSaveCode(generateSaveCode(this));
    }
  };

  // ── Save code generation ──────────────────────
  // Format: HLW-XXX-N
  //   HLW  — always "HLW" (Hollow)
  //   XXX  — base-36 encoded bitmask (track + evidence + flags)
  //   N    — chapter number

  function generateSaveCode(state) {
    let n = 0;

    // bits 0–1: track selection (0=none, 1=A, 2=B, 3=C)
    const trackIdx = TRACK_IDS.indexOf(state.selectedTrack);
    if (trackIdx >= 0) n |= (trackIdx + 1);

    // bits 2–13: one bit per known evidence item
    EVIDENCE_KEYS.forEach((key, i) => {
      if (state.evidence.includes(key)) n |= (1 << (2 + i));
    });

    // bits 14–19: first six flag values (insertion order)
    Object.values(state.flags).slice(0, 6).forEach((val, i) => {
      if (val) n |= (1 << (14 + i));
    });

    const encoded    = n.toString(36).toUpperCase().padStart(3, '0').slice(-3);
    const chapterChar = String(Math.min(state.chapter, 9));
    return `HLW-${encoded}-${chapterChar}`;
  }

  // ── Evidence panel ────────────────────────────

  function updateEvidencePanel() {
    const panel = document.getElementById('evidence-panel');
    if (!panel) return;

    // Remove existing evidence items (leave save-code intact)
    panel.querySelectorAll('.evidence-item').forEach(el => el.remove());

    GameState.evidence.forEach(key => {
      const el = document.createElement('p');
      el.className = 'evidence-item';
      el.textContent = key.replace(/-/g, ' ');
      panel.insertBefore(el, panel.querySelector('.save-code'));
    });
  }

  function showSaveCode(code) {
    const panel = document.getElementById('evidence-panel');
    if (!panel) return;
    let el = panel.querySelector('.save-code');
    if (!el) {
      el = document.createElement('p');
      el.className = 'save-code';
      panel.appendChild(el);
    }
    el.textContent = `Your progress code: ${code}`;
  }

  // ── Room rendering stub ───────────────────────
  // Replace with full implementation once rooms/passages are ready.

  function renderRoom(roomId) { // eslint-disable-line no-unused-vars
    const screen = document.getElementById('game-screen');
    if (!screen) return;
    // Room rendering will be wired to data/rooms.js + data/passages.js here
  }

  // ── Screen elements ───────────────────────────

  const titleScreen   = document.getElementById('title-screen');
  const jukeboxScreen = document.getElementById('jukebox-screen');
  const gameScreen    = document.getElementById('game-screen');
  const tracks        = document.querySelectorAll('.track');
  const enterBtn      = document.getElementById('enter-btn');

  // ── Boot: resume from saved state ────────────

  const hasSave = GameState.load();

  if (hasSave && GameState.currentRoom) {
    // Player was mid-game — skip straight to the game screen
    titleScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    updateEvidencePanel();
    renderRoom(GameState.currentRoom);

  } else if (hasSave && GameState.selectedTrack) {
    // Player had chosen a track but hadn't entered yet — restore jukebox state
    titleScreen.classList.add('hidden');
    jukeboxScreen.classList.remove('hidden');
    jukeboxScreen.classList.add('visible');
    const saved = jukeboxScreen.querySelector(`[data-track="${GameState.selectedTrack}"]`);
    if (saved) {
      saved.classList.add('selected');
      enterBtn.classList.add('showing');
    }
  }

  // ── Title → Jukebox ──────────────────────────

  titleScreen.addEventListener('click', function onTitleClick() {
    titleScreen.removeEventListener('click', onTitleClick);
    titleScreen.style.transition = 'opacity 1s ease';
    titleScreen.style.opacity    = '0';
    setTimeout(() => {
      titleScreen.classList.add('hidden');
      jukeboxScreen.classList.remove('hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        jukeboxScreen.classList.add('visible');
      }));
    }, 1000);
  });

  // ── Track selection ───────────────────────────

  tracks.forEach(track => {
    track.addEventListener('click', () => {
      tracks.forEach(t => t.classList.remove('selected'));
      track.classList.add('selected');
      GameState.selectedTrack = track.dataset.track;
      GameState.save();
      enterBtn.classList.add('showing');
    });
  });

  // ── Jukebox → Game ────────────────────────────

  enterBtn.addEventListener('click', () => {
    if (!GameState.selectedTrack) return;
    jukeboxScreen.style.transition = 'opacity 1s ease';
    jukeboxScreen.style.opacity    = '0';
    setTimeout(() => {
      jukeboxScreen.classList.add('hidden');
      gameScreen.classList.remove('hidden');
      GameState.goToRoom('start');
    }, 1000);
  });

  // ── Public API ────────────────────────────────
  // Rooms and passages use window.Hollow to drive the game.

  window.Hollow = {
    state:            GameState,
    generateSaveCode,
    showSaveCode,
    updateEvidencePanel
  };

})();

// ── Room handler helpers ──────────────────────
// Called by onClick handlers in data/rooms.js.
// state is the single shared object passed to every click in a room.

function setFlag(state, flagName) {
  state.flags = state.flags || {};
  state.flags[flagName] = true;
}

function hasFlag(state, flagName) {
  return !!(state.flags && state.flags[flagName]);
}
