// MySpace 2005 Interactive Script - Jolanda & Czech Meme Trolls

// WEB AUDIO SYNTHESIZER FOR 2005 RETRO SOUNDS & MUSIC
let audioCtx = null;
let isPlayingMusic = false;
let musicInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// BEEP & SOUND EFFECT GENERATOR
function playSynthBeep(freq = 440, duration = 0.2, type = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log("Audio play error:", e);
  }
}

// CZECH MEME SOUNDBOARD HANDLER
const soundDescriptions = {
  velkyspatny: { text: 'Jolanda říká: "Moc vidím velký špatný!" 🔮', freqs: [300, 250, 200, 150] },
  hodnebudes: { text: 'Jolanda věští: "Hodně budeš někde!" ✨', freqs: [400, 500, 600, 700] },
  pohlova: { text: 'Věra Pohlová: "Já bych všechny ty internety zakázala!" 💻', freqs: [800, 400, 200, 100] },
  kara: { text: 'Jiří Kára: "Ty vole, kde je to moje pivo?!" 🍺', freqs: [150, 180, 120, 90] },
  babica: { text: 'Zdeněk Babica: "Když nemáte limetky, dejte tam citrón!" 🍋', freqs: [523, 659, 783, 1046] },
  hruska: { text: 'Láďa Hruška: "Kůžičková mňamka za 5 Kč!" 🧀', freqs: [350, 450, 550, 400] },
  matus: { text: 'Bohuš Matuš: "To je málo milostné, přitlač!" 🎤', freqs: [440, 493, 523, 587] },
  troll: { text: 'Český Meme Troll: "Už jste všichni v mé pasti!" 🤡', freqs: [100, 300, 100, 300] }
};

function playSound(key) {
  const item = soundDescriptions[key];
  if (!item) return;

  const statusEl = document.getElementById('sound-status');
  if (statusEl) {
    statusEl.innerText = item.text;
  }

  // Play a sequence of retro chiptune tones for each meme sound
  item.freqs.forEach((freq, idx) => {
    setTimeout(() => {
      playSynthBeep(freq, 0.15, 'sawtooth');
    }, idx * 120);
  });
}

// INTERACTIVE MUSIC PLAYER (SYNTH RETRO 2005 BEAT)
const songs = {
  jolanda: {
    title: "Jolanda - Velký Špatný (Retro Techno Remix 2005)",
    notes: [261, 329, 392, 523, 392, 329, 261, 196]
  },
  kara: {
    title: "Jiří Kára - Pivo & Oltář Anthem (Rock Beat)",
    notes: [146, 164, 196, 220, 196, 164, 146, 110]
  },
  pohlova: {
    title: "Věra Pohlová - Internety Zakázat (Synthwave 2005)",
    notes: [440, 440, 523, 523, 587, 587, 659, 523]
  },
  babica: {
    title: "Babica - Když Nemáte Limetky (8-Bit Beat)",
    notes: [523, 587, 659, 698, 783, 880, 987, 1046]
  }
};

let currentSongKey = 'jolanda';
let noteIndex = 0;

function startMusic() {
  if (isPlayingMusic) return;
  isPlayingMusic = true;
  getAudioContext();

  musicInterval = setInterval(() => {
    const song = songs[currentSongKey];
    if (!song) return;

    const freq = song.notes[noteIndex % song.notes.length];
    playSynthBeep(freq, 0.18, 'square');

    // Animate visualizer bars
    const bars = document.querySelectorAll('.sound-visualizer .bar');
    bars.forEach((bar) => {
      const randomHeight = Math.floor(Math.random() * 80) + 20;
      bar.style.height = randomHeight + '%';
    });

    noteIndex++;
  }, 250);
}

function pauseMusic() {
  isPlayingMusic = false;
  if (musicInterval) clearInterval(musicInterval);
  resetVisualizer();
}

function stopMusic() {
  pauseMusic();
  noteIndex = 0;
}

function resetVisualizer() {
  const bars = document.querySelectorAll('.sound-visualizer .bar');
  bars.forEach((bar) => {
    bar.style.height = '20%';
  });
}

// FORTUNE TELLER (JOLANDA CARDS)
const fortunes = [
  "🔮 'Vidím velký dobrý! Zítra potkáš někoho, kdo ti nabídne pivo zadarmo!'",
  "🔮 'Karty říkají: Hodně budeš někde! Ale musíte věřit na bílou magii.'",
  "🔮 'Pozor! Věra Pohlová ti zítra vypne Wi-Fi router. Budeš muset zpátky na dial-up!'",
  "🔮 'Dneska ti Babica doporučuje: Když nemáš štěstí, dej tam naději!'",
  "🔮 'Vidím velký špatný... Někdo ti na ICQ pošle vir Nuke2005, buď opatrný!'",
  "🔮 'Hvězdy prahnou po radosti! Láďa Hruška pro tě upeče chlebové kůžičky!'"
];

function tellFortune() {
  const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  const fortuneResult = document.getElementById('fortune-result');
  if (fortuneResult) {
    fortuneResult.style.display = 'block';
    fortuneResult.innerText = randomFortune;
    playSynthBeep(600, 0.3, 'sine');
  }
}

// CHANGE PROFILE AVATAR
const avatars = [
  "https://picsum.photos/id/1025/250/250",
  "https://picsum.photos/id/1062/250/250",
  "https://picsum.photos/id/1005/250/250",
  "https://picsum.photos/id/1027/250/250"
];
let avatarIndex = 0;

function changeProfileAvatar() {
  avatarIndex = (avatarIndex + 1) % avatars.length;
  const img = document.getElementById('profile-img');
  if (img) {
    img.src = avatars[avatarIndex];
    playSynthBeep(500, 0.1, 'triangle');
  }
}

// CHANGE STATUS
const statusOptions = [
  'Status: "Prostě sem hodně někde!"',
  'Status: "Vidím velký špatný!"',
  'Status: "Piju pivo s Jiříkem Károu!"',
  'Status: "Internety zakázat!"',
  'Status: "Když nemáte limetky..."'
];
let statusIdx = 0;

function toggleStatus() {
  statusIdx = (statusIdx + 1) % statusOptions.length;
  const statusEl = document.getElementById('live-status');
  if (statusEl) {
    statusEl.innerText = statusOptions[statusIdx];
  }
}

// ACTION TRIGGER HELPER
function triggerAction(actionName, resultMsg) {
  playSynthBeep(700, 0.15, 'sine');
  alert(`[MySpace 2005] ${actionName}: ${resultMsg}`);
}

// TOP 8 FRIEND MODAL
function showFriendInfo(name, desc, img) {
  const modal = document.getElementById('friend-modal');
  const modalName = document.getElementById('modal-friend-name');
  const modalDesc = document.getElementById('modal-friend-desc');
  const modalImg = document.getElementById('modal-friend-img');

  if (modal && modalName && modalDesc && modalImg) {
    modalName.innerText = name;
    modalDesc.innerText = desc;
    modalImg.src = img;
    modal.classList.remove('hidden');
    playSynthBeep(450, 0.2, 'sine');
  }
}

function closeModal() {
  const modal = document.getElementById('friend-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// COMMENTS / GUESTBOOK
const defaultComments = [
  {
    author: "Pařmen_Pepa_2005",
    avatar: "🍺",
    date: "14.10.2005 o 18:42",
    text: "Jolando, tvoje karty mi předpověděly, že dostanu z matematiky 1 a fakt to vyšlo!! Ty jsi nejlepší na MySpace!"
  },
  {
    author: "Věra_Pohlová_Official",
    avatar: "💻",
    date: "13.10.2005 o 11:15",
    text: "A stejně bych všechny ty vaše internety a MySpace zakázala! Ale profil máš hezkej..."
  },
  {
    author: "Zdeněk_Babica_Fan",
    avatar: "🍋",
    date: "12.10.2005 o 20:05",
    text: "Místo magické koule tam dej citrón a bude to perfektní gurmánský zážitek!"
  }
];

function renderComments() {
  const listEl = document.getElementById('comments-list');
  if (!listEl) return;

  const stored = localStorage.getItem('myspace_comments');
  const comments = stored ? JSON.parse(stored) : defaultComments;

  listEl.innerHTML = '';
  comments.forEach(c => {
    const card = document.createElement('div');
    card.className = 'comment-card';
    card.innerHTML = `
      <div class="comment-left">
        <span class="comment-avatar">${c.avatar}</span>
        <span class="comment-author-name">${escapeHTML(c.author)}</span>
      </div>
      <div class="comment-right">
        <div class="comment-date">${c.date}</div>
        <div class="comment-body">${escapeHTML(c.text)}</div>
      </div>
    `;
    listEl.appendChild(card);
  });
}

function addComment() {
  const authorInput = document.getElementById('comment-author');
  const avatarSelect = document.getElementById('comment-avatar');
  const textInput = document.getElementById('comment-text');

  const author = authorInput.value.trim() || 'Anonymní Trolle2005';
  const avatar = avatarSelect.value || '🔮';
  const text = textInput.value.trim();

  if (!text) {
    alert('Napiš prosím nějaký vzkaz!');
    return;
  }

  const now = new Date();
  const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} o ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

  const newComment = {
    author,
    avatar,
    date: dateStr,
    text
  };

  const stored = localStorage.getItem('myspace_comments');
  const comments = stored ? JSON.parse(stored) : [...defaultComments];
  comments.unshift(newComment);

  localStorage.setItem('myspace_comments', JSON.stringify(comments));

  textInput.value = '';
  renderComments();
  playSynthBeep(800, 0.25, 'triangle');
  alert('Tůj vzkaz byl úspěšně přidán do Návštěvní knihy!');
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  renderComments();

  // Fortune button
  const fortuneBtn = document.getElementById('fortune-btn');
  if (fortuneBtn) {
    fortuneBtn.addEventListener('click', tellFortune);
  }

  // Change status button
  const statusBtn = document.getElementById('change-status-btn');
  if (statusBtn) {
    statusBtn.addEventListener('click', toggleStatus);
  }

  // Submit comment
  const submitBtn = document.getElementById('submit-comment-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', addComment);
  }

  // Music controls
  document.getElementById('btn-play')?.addEventListener('click', () => {
    startMusic();
    document.getElementById('song-title').innerText = songs[currentSongKey].title;
  });

  document.getElementById('btn-pause')?.addEventListener('click', pauseMusic);
  document.getElementById('btn-stop')?.addEventListener('click', stopMusic);

  document.getElementById('btn-next')?.addEventListener('click', () => {
    const keys = Object.keys(songs);
    const currIndex = keys.indexOf(currentSongKey);
    currentSongKey = keys[(currIndex + 1) % keys.length];
    document.getElementById('playlist-select').value = currentSongKey;
    document.getElementById('song-title').innerText = songs[currentSongKey].title;
    if (isPlayingMusic) {
      stopMusic();
      startMusic();
    }
  });

  document.getElementById('playlist-select')?.addEventListener('change', (e) => {
    currentSongKey = e.target.value;
    document.getElementById('song-title').innerText = songs[currentSongKey].title;
    if (isPlayingMusic) {
      stopMusic();
      startMusic();
    }
  });
});
