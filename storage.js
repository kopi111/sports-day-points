const STORAGE_KEY = 'sportsDayData';

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
