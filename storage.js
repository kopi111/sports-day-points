const firebaseConfig = {
  apiKey: "AIzaSyCDohnrSGL1yQfWeISuoPtptFVFJ2G0_Gk",
  authDomain: "sportday-6d832.firebaseapp.com",
  databaseURL: "https://sportday-6d832-default-rtdb.firebaseio.com",
  projectId: "sportday-6d832",
  storageBucket: "sportday-6d832.firebasestorage.app",
  messagingSenderId: "771412755301",
  appId: "1:771412755301:web:ed07e49ce4de10364c178c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const dataRef = db.ref('scoreboard');

const DEFAULT_DATA = {
  title: 'Area 7',
  subtitle: 'Sport Day',
  motto: 'THE ULTIMATE SHOWDOWN',
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

let cache = structuredClone(DEFAULT_DATA);
let hasInitialSnapshot = false;

dataRef.on('value', snap => {
  const val = snap.val();
  if (val === null) {
    dataRef.set(DEFAULT_DATA);
    cache = structuredClone(DEFAULT_DATA);
  } else {
    cache = {
      ...structuredClone(DEFAULT_DATA),
      ...val,
      teams: val.teams || DEFAULT_DATA.teams,
      history: val.history || []
    };
  }
  hasInitialSnapshot = true;
  window.dispatchEvent(new CustomEvent('datachanged'));
});

function loadData() {
  return structuredClone(cache);
}

function saveData(data) {
  dataRef.set(data);
}

function recordHistory(data, teamName, oldScore, newScore, source) {
  const delta = (parseInt(newScore, 10) || 0) - (parseInt(oldScore, 10) || 0);
  data.history = data.history || [];
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
