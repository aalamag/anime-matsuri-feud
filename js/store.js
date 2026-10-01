import { DEFAULT_CONFIG } from './data.js';

const CONFIG_KEY = 'amff.config.v1';
const GAME_KEY = 'amff.game.v1';

const clone = (o) => JSON.parse(JSON.stringify(o));

function read(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

export function loadConfig() {
  const saved = read(CONFIG_KEY);
  if (!saved || saved.version !== DEFAULT_CONFIG.version) return clone(DEFAULT_CONFIG);
  return { ...clone(DEFAULT_CONFIG), ...saved, fastMoney: { ...DEFAULT_CONFIG.fastMoney, ...saved.fastMoney } };
}
export const saveConfig = (cfg) => write(CONFIG_KEY, cfg);
export function resetConfig() { try { localStorage.removeItem(CONFIG_KEY); } catch {} return clone(DEFAULT_CONFIG); }
export const defaultConfig = () => clone(DEFAULT_CONFIG);

export const loadGame = () => read(GAME_KEY);
export const saveGame = (g) => write(GAME_KEY, g);
export function clearGame() { try { localStorage.removeItem(GAME_KEY); } catch {} }

// Host <-> audience-board sync (same browser, different windows/tabs).
export function openChannel(onMessage) {
  let bc = null;
  try { bc = new BroadcastChannel('amff'); bc.onmessage = (e) => onMessage(e.data); } catch {}
  return { post: (msg) => { try { bc && bc.postMessage(msg); } catch {} } };
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
