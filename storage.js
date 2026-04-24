const STORAGE_KEY = 'sportsDayData';

// Change this by hashing a new passphrase. In your browser console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-new-pass'))
//     .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')));
const PASSPHRASE_HASH = 'eeaa8e0ea19be83d04908ab9ee819b8bdd3a17ce2ce9a1456b3158a433451dc0';
const AUTH_SESSION_KEY = 'sportsDayAuth';

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function requireAuth() {
  if (sessionStorage.getItem(AUTH_SESSION_KEY) === PASSPHRASE_HASH) return true;
  for (let attempt = 0; attempt < 3; attempt++) {
    const entered = prompt('Enter passphrase:');
    if (entered === null) { window.location.href = 'index.html'; return false; }
    const hash = await sha256Hex(entered);
    if (hash === PASSPHRASE_HASH) {
      sessionStorage.setItem(AUTH_SESSION_KEY, hash);
      return true;
    }
    alert('Wrong passphrase.');
  }
  window.location.href = 'index.html';
  return false;
}


const DEFAULT_DATA = {
  title: 'Area 7',
  subtitle: 'Sport Day',
  live: false,
  teams: [
    { name: 'FDLP TITANS', score: '146', color: '#c8102e' },
    { name: 'AREA 2',      score: '43',  color: '#ffc72c' },
    { name: 'AREA 3',      score: '0',   color: '#009b3a' },
    { name: 'AREA 4',      score: '10',  color: '#ffffff' },
    { name: 'CTOC',        score: '78',  color: '#00b7eb' },
    { name: 'SOC',         score: '0',   color: '#888888' }
  ],
  history: []
};

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(DEFAULT_DATA);
  try {
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_DATA), ...parsed };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function recordHistory(data, teamName, oldScore, newScore, source) {
  const delta = (parseInt(newScore, 10) || 0) - (parseInt(oldScore, 10) || 0);
  data.history.unshift({
    timestamp: new Date().toISOString(),
    teamName,
    oldScore: String(oldScore),
    newScore: String(newScore),
    delta,
    source
  });
  if (data.history.length > 1000) data.history.length = 1000;
}

function adjustScore(index, delta, source = 'quick') {
  const data = loadData();
  const team = data.teams[index];
  if (!team) return;
  const oldScore = parseInt(team.score, 10) || 0;
  const newScore = oldScore + delta;
  team.score = String(newScore);
  recordHistory(data, team.name, oldScore, newScore, source);
  saveData(data);
  return data;
}
