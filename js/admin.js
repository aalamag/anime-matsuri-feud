import { loadConfig, saveConfig, resetConfig, defaultConfig, loadGame, esc } from './store.js';

// SHA-256 of the organizer PIN. This is a client-side gate for a party game,
// not real security — anyone with dev tools can edit their own browser's copy.
const PIN_HASH = '56471092a173990ff183717716892802a7c8319ee94648ae5ed4dda85b6ed40b';
const AUTH_KEY = 'amff.admin';

const root = document.getElementById('admin');
let cfg = loadConfig();
let dirty = false;
let savedMsg = '';
let bankFilter = 'all';
const openQs = new Set();

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function isAuthed() { try { return sessionStorage.getItem(AUTH_KEY) === PIN_HASH; } catch { return false; } }

// ------------------------------------------------------------ sign in

function renderSignIn(err = '') {
  root.innerHTML = `<div class="signin"><form id="signin">
    <div class="kicker" style="font-size:12px">Anime Matsuri Season 2 · Sakura &amp; Spirits</div>
    <h1>Organizer sign in</h1>
    <p>Edit the survey questions and game settings.</p>
    <input id="pin" type="password" autocomplete="current-password" placeholder="Organizer PIN" aria-label="Organizer PIN" autofocus>
    <div class="err">${esc(err)}</div>
    <button class="btn primary" type="submit" style="justify-content:center">Sign in</button>
    <a class="hint" href="./">← Back to the game</a>
  </form></div>`;
  document.getElementById('signin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = document.getElementById('pin').value.trim();
    if (!crypto?.subtle) return renderSignIn('Open this page over https (or localhost) to sign in.');
    if ((await sha256(pin)) === PIN_HASH) { try { sessionStorage.setItem(AUTH_KEY, PIN_HASH); } catch {} renderAdmin(); }
    else renderSignIn('That PIN is not right.');
  });
}

// ------------------------------------------------------------ admin

const qById = () => Object.fromEntries(cfg.bank.map((q) => [q.id, q]));
const usedIds = () => new Set([...cfg.rounds.map((r) => r.qid), ...cfg.fastMoney.qids]);
const options = (kind, selected) => cfg.bank.filter((q) => q.kind === kind)
  .map((q) => `<option value="${q.id}" ${q.id === selected ? 'selected' : ''}>${esc(q.q)}${q.isNew ? '  ✦ new' : ''}</option>`).join('');
const multLabel = { 1: 'Single Points', 2: 'Double Points', 3: 'Triple Points' };

function markDirty() { dirty = true; savedMsg = ''; const s = document.getElementById('status'); if (s) { s.className = 'dirty'; s.textContent = 'Unsaved changes'; } }

function lineupHTML() {
  return cfg.rounds.map((r, i) => `<div class="lu-row">
    <span class="lu-n">${i + 1}</span>
    <select data-k="round.qid" data-i="${i}" aria-label="Round ${i + 1} question">${options('round', r.qid)}</select>
    <select data-k="round.mult" data-i="${i}" aria-label="Round ${i + 1} multiplier">${[1, 2, 3].map((m) => `<option value="${m}" ${Number(r.mult) === m ? 'selected' : ''}>×${m} ${['', 'Single', 'Double', 'Triple'][m]}</option>`).join('')}</select>
    <input class="lu-label" data-k="round.label" data-i="${i}" value="${esc(r.label)}" placeholder="${multLabel[r.mult]}" aria-label="Round ${i + 1} label">
    <button class="btn icon-btn" data-act="delRound" data-i="${i}" title="Remove round" ${cfg.rounds.length <= 1 ? 'disabled' : ''}>✕</button>
  </div>`).join('');
}

function fmHTML() {
  const f = cfg.fastMoney;
  const on = `<label class="chk" style="margin-bottom:12px"><input type="checkbox" data-k="fm.enabled" ${f.enabled !== false ? 'checked' : ''}> Play Fast Money after the last round</label>`;
  if (f.enabled === false) return on + '<p class="note">Off — the game ends after the last round and the highest score wins.</p>';
  return on + `<div class="lineup">${f.qids.map((id, i) => `<div class="fm-pick" style="grid-template-columns:34px minmax(0,1fr) 36px">
      <span class="lu-n">Q${i + 1}</span>
      <select data-k="fm.qid" data-i="${i}" aria-label="Fast Money question ${i + 1}">${options('fm', id)}</select>
      <button class="btn icon-btn" data-act="delFm" data-i="${i}" title="Remove" ${f.qids.length <= 1 ? 'disabled' : ''}>✕</button></div>`).join('')}
    </div>
    <div class="q-actions" style="margin:10px 0 14px">${f.qids.length < 8 ? '<button class="btn" data-act="addFm">+ Add Fast Money question</button>' : ''}</div>
    <div class="grid2">
      <label class="f">Target points<input type="number" min="1" data-k="fm.target" value="${f.target}"></label>
      <label class="f">Players
        <select data-k="fm.players"><option value="2" ${f.players === 2 ? 'selected' : ''}>2 players (classic)</option><option value="1" ${f.players === 1 ? 'selected' : ''}>1 player</option></select></label>
      <label class="f">Player 1 timer (s)<input type="number" min="5" data-k="fm.t0" value="${f.timers[0]}"></label>
      <label class="f">Player 2 timer (s)<input type="number" min="5" data-k="fm.t1" value="${f.timers[1]}"></label>
      <label class="f">Bonus for reaching target<input type="number" min="0" data-k="fm.bonus" value="${f.bonus}"></label>
      <label class="chk"><input type="checkbox" data-k="fm.counts" ${f.countsToScore ? 'checked' : ''}> Fast Money points count toward the team total</label>
    </div>
    ${f.players === 1 ? `<p class="note" style="margin-top:10px">With 1 player the best possible total is ${f.qids.reduce((s, id) => s + (qById()[id]?.answers[0]?.[1] || 0), 0)} — lower the target if it's above that.</p>` : ''}`;
}

function bankHTML() {
  const used = usedIds();
  const list = cfg.bank.filter((q) => bankFilter === 'all' || q.kind === bankFilter || (bankFilter === 'new' && q.isNew));
  return list.map((q) => {
    const sum = q.answers.reduce((s, a) => s + (Number(a[1]) || 0), 0);
    return `<details class="q" data-qid="${q.id}" ${openQs.has(q.id) ? 'open' : ''}>
      <summary><span class="tag ${q.kind === 'fm' ? 'fm' : ''}">${q.kind === 'fm' ? 'Fast Money' : 'Round'}</span>
        ${q.isNew ? '<span class="tag new">New</span>' : ''}${used.has(q.id) ? '<span class="tag used">In game</span>' : ''}
        <span class="q-title">${esc(q.q)}</span><span class="q-sum">${q.answers.length} answers · ${sum} pts</span></summary>
      <div class="q-body">
        <div class="grid2" style="grid-template-columns:minmax(0,1fr) 170px">
          <label class="f">Survey question<input data-k="q.q" data-q="${q.id}" value="${esc(q.q)}"></label>
          <label class="f">Used for<select data-k="q.kind" data-q="${q.id}"><option value="round" ${q.kind === 'round' ? 'selected' : ''}>Main round</option><option value="fm" ${q.kind === 'fm' ? 'selected' : ''}>Fast Money</option></select></label>
        </div>
        ${q.answers.map((a, ai) => `<div class="ans"><b>${ai + 1}</b>
          <input data-k="a.t" data-q="${q.id}" data-a="${ai}" value="${esc(a[0])}" aria-label="Answer ${ai + 1}">
          <input type="number" min="0" data-k="a.p" data-q="${q.id}" data-a="${ai}" value="${a[1]}" aria-label="Points for answer ${ai + 1}">
          <button class="btn icon-btn" data-act="delAns" data-q="${q.id}" data-a="${ai}" title="Remove answer">✕</button></div>`).join('')}
        <div class="q-actions">
          ${q.answers.length < 8 ? `<button class="btn" data-act="addAns" data-q="${q.id}">+ Add answer</button>` : '<span class="hint">8 answers max (fills the board)</span>'}
          <button class="btn" data-act="sortAns" data-q="${q.id}">Sort by points</button>
          <button class="btn" data-act="delQ" data-q="${q.id}" style="margin-left:auto">Delete question</button>
        </div>
      </div></details>`;
  }).join('') || '<p class="hint">No questions in this filter.</p>';
}

function renderAdmin() {
  const game = loadGame();
  const inProgress = game && game.screen !== 'title';
  root.innerHTML = `
    <div class="a-head">
      <h1>Organizer admin</h1>
      <span id="status" class="${dirty ? 'dirty' : 'saved'}">${dirty ? 'Unsaved changes' : esc(savedMsg)}</span>
      <div class="bar-actions">
        <button class="btn primary" data-act="save">Save</button>
        <button class="btn" data-act="discard">Discard changes</button>
        <a class="btn" href="./">← Back to game</a>
        <button class="btn" data-act="logout">Sign out</button>
      </div>
    </div>
    ${inProgress ? '<p class="note">A game is in progress on this browser. Saved changes apply when the host clicks <b>New game</b>.</p>' : ''}

    <section class="card"><h2>Event</h2><p class="sub">Shown on the title screen and footers.</p>
      <div class="grid2">
        <label class="f">Title<input data-k="title" value="${esc(cfg.title)}"></label>
        <label class="f">Subtitle<input data-k="subtitle" value="${esc(cfg.subtitle)}"></label>
        <label class="f">Season / footer<input data-k="season" value="${esc(cfg.season)}"></label>
        <label class="f">Team 1 name<input data-k="team0" value="${esc(cfg.teams[0])}"></label>
        <label class="f">Team 2 name<input data-k="team1" value="${esc(cfg.teams[1])}"></label>
      </div></section>

    <section class="card"><h2>Main-game rounds</h2><p class="sub">Pick a survey question and point multiplier for each round, in play order.</p>
      <div class="lineup">${lineupHTML()}</div>
      <div class="q-actions" style="margin-top:10px">${cfg.rounds.length < 10 ? '<button class="btn" data-act="addRound">+ Add round</button>' : ''}</div></section>

    <section class="card"><h2>Fast Money</h2><p class="sub">The final challenge.</p>${fmHTML()}</section>

    <section class="card"><h2>Question bank</h2><p class="sub">Answers are ranked top-to-bottom. Keep each question's points at about 100 or less.</p>
      <div class="filter">${[['all', 'All'], ['round', 'Main rounds'], ['fm', 'Fast Money'], ['new', 'New themes']].map(([k, l]) => `<button class="btn ${bankFilter === k ? 'sel team-1' : ''}" data-act="filter" data-f="${k}">${l}</button>`).join('')}
        <span style="margin-left:auto"></span>
        <button class="btn" data-act="addQ" data-kind="round">+ New round question</button>
        <button class="btn" data-act="addQ" data-kind="fm">+ New Fast Money question</button></div>
      <div class="qlist">${bankHTML()}</div></section>

    <section class="card"><h2>Backup &amp; reset</h2>
      <p class="sub">Settings are saved in <b>this browser</b> only. To run the game on another computer, export here and import there.</p>
      <div class="q-actions">
        <button class="btn" data-act="export">Export JSON</button>
        <label class="btn" style="cursor:pointer">Import JSON<input id="importFile" type="file" accept="application/json,.json" hidden></label>
        <button class="btn" data-act="reset" style="margin-left:auto">Reset to defaults</button>
      </div></section>`;
}

// ------------------------------------------------------------ events

function onField(el) {
  const k = el.dataset.k, i = Number(el.dataset.i);
  const q = el.dataset.q ? qById()[el.dataset.q] : null;
  const num = (v, min = 0) => Math.max(min, Number(v) || 0);
  const f = cfg.fastMoney;
  let rerender = false;
  switch (k) {
    case 'title': case 'subtitle': case 'season': cfg[k] = el.value; break;
    case 'team0': cfg.teams[0] = el.value; break;
    case 'team1': cfg.teams[1] = el.value; break;
    case 'round.qid': cfg.rounds[i].qid = el.value; rerender = true; break;
    case 'round.mult': {
      const old = cfg.rounds[i];
      if (!old.label || old.label === multLabel[old.mult]) old.label = multLabel[el.value];
      old.mult = Number(el.value); rerender = true; break;
    }
    case 'round.label': cfg.rounds[i].label = el.value; break;
    case 'fm.qid': f.qids[i] = el.value; rerender = true; break;
    case 'fm.target': f.target = num(el.value, 1); break;
    case 'fm.players': f.players = Number(el.value); rerender = true; break;
    case 'fm.t0': f.timers[0] = num(el.value, 5); break;
    case 'fm.t1': f.timers[1] = num(el.value, 5); break;
    case 'fm.bonus': f.bonus = num(el.value); break;
    case 'fm.counts': f.countsToScore = el.checked; break;
    case 'fm.enabled': f.enabled = el.checked; rerender = true; break;
    case 'q.q': q.q = el.value; break;
    case 'q.kind': {
      if (usedIds().has(q.id)) { alert('This question is in the current lineup. Swap it out of the lineup first.'); el.value = q.kind; return; }
      q.kind = el.value; rerender = true; break;
    }
    case 'a.t': q.answers[el.dataset.a][0] = el.value; break;
    case 'a.p': q.answers[el.dataset.a][1] = num(el.value); break;
  }
  markDirty();
  if (rerender) renderAdmin();
  else if (q) refreshSummary(q);
}

root.addEventListener('change', (e) => {
  if (e.target.id === 'importFile') return importFile(e.target.files[0]);
  if (e.target.matches('select, input[type=checkbox]') && e.target.dataset.k) onField(e.target);
});

// Keep a question's collapsed summary current without re-rendering (keeps focus).
function refreshSummary(q) {
  const d = root.querySelector(`details.q[data-qid="${q.id}"]`); if (!d) return;
  d.querySelector('.q-title').textContent = q.q;
  d.querySelector('.q-sum').textContent = `${q.answers.length} answers · ${q.answers.reduce((s, a) => s + (Number(a[1]) || 0), 0)} pts`;
}
root.addEventListener('input', (e) => { if (e.target.matches('input:not([type=checkbox])') && e.target.dataset.k) onField(e.target); });
root.addEventListener('toggle', (e) => {
  const d = e.target; if (!d.matches?.('details.q')) return;
  d.open ? openQs.add(d.dataset.qid) : openQs.delete(d.dataset.qid);
}, true);

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, i = Number(el.dataset.i);
  const q = el.dataset.q ? qById()[el.dataset.q] : null;
  const f = cfg.fastMoney;
  const firstOf = (kind) => cfg.bank.find((b) => b.kind === kind)?.id;
  switch (act) {
    case 'save':
      if (cfg.rounds.some((r) => !qById()[r.qid]) || (f.enabled !== false && f.qids.some((id) => !qById()[id]))) return alert('Every round and Fast Money slot needs a question.');
      saveConfig(cfg) ? (dirty = false, savedMsg = '✓ Saved — applies on the next New game') : alert('Could not save (browser storage blocked?).');
      break;
    case 'discard': if (dirty && !confirm('Discard unsaved changes?')) return; cfg = loadConfig(); dirty = false; savedMsg = ''; break;
    case 'logout': try { sessionStorage.removeItem(AUTH_KEY); } catch {} return renderSignIn();
    case 'addRound': cfg.rounds.push({ qid: firstOf('round'), mult: 3, label: multLabel[3] }); markDirty(); break;
    case 'delRound': cfg.rounds.splice(i, 1); markDirty(); break;
    case 'addFm': f.qids.push(firstOf('fm')); markDirty(); break;
    case 'delFm': f.qids.splice(i, 1); markDirty(); break;
    case 'filter': bankFilter = el.dataset.f; break;
    case 'addQ': {
      const id = 'q-' + Date.now().toString(36);
      cfg.bank.unshift({ id, kind: el.dataset.kind, isNew: true, q: 'Name a…', answers: [['', 30], ['', 20], ['', 15], ['', 10]] });
      openQs.add(id); bankFilter = 'all'; markDirty(); break;
    }
    case 'delQ':
      if (usedIds().has(q.id)) return alert('This question is in the current lineup. Swap it out of the lineup first.');
      if (!confirm(`Delete "${q.q}"?`)) return;
      cfg.bank = cfg.bank.filter((b) => b.id !== q.id); markDirty(); break;
    case 'addAns': q.answers.push(['', 5]); markDirty(); break;
    case 'delAns': if (q.answers.length <= 1) return; q.answers.splice(Number(el.dataset.a), 1); markDirty(); break;
    case 'sortAns': q.answers.sort((a, b) => b[1] - a[1]); markDirty(); break;
    case 'export': {
      const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'anime-matsuri-feud-config.json' });
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); return;
    }
    case 'reset':
      if (!confirm('Reset all questions and settings to the defaults?')) return;
      cfg = resetConfig(); dirty = false; savedMsg = '✓ Reset to defaults'; break;
  }
  renderAdmin();
});

async function importFile(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.bank) || !Array.isArray(data.rounds) || !data.fastMoney) throw new Error('missing bank/rounds/fastMoney');
    const d = defaultConfig();
    cfg = { ...d, ...data, version: d.version, fastMoney: { ...d.fastMoney, ...data.fastMoney } };
    markDirty(); savedMsg = ''; renderAdmin();
  } catch (err) { alert('That file is not a valid game config: ' + err.message); }
}

window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

isAuthed() ? renderAdmin() : renderSignIn();
