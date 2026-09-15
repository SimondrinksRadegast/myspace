// MySpace 2005 Interactive Scripts - CS Meme Troll Edition (Jolanda & Friends)

// 1. Web Audio API Sound & Music Engine
let audioCtx = null;
let isPlaying = false;
let currentTrackIndex = 0;
let musicInterval = null;
let musicNoteIndex = 0;
let masterVolume = 0.3;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Retro Chiptune / Synth Melodies for MySpace Music Player
const tracks = [
    {
        name: "▶ Jolanda - Velký Špatný (Retro Beat)",
        notes: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 196.00, 220.00, 277.18, 329.63, 440.00],
        durations: [200, 200, 200, 400, 200, 200, 200, 200, 200, 200, 200, 400]
    },
    {
        name: "▶ Jiří Kára - Olšanský Svatbostyl",
        notes: [146.83, 146.83, 293.66, 220.00, 196.00, 146.83, 174.61, 220.00, 146.83, 110.00],
        durations: [150, 150, 300, 300, 150, 150, 300, 300, 300, 600]
    },
    {
        name: "▶ Věra Pohlová - Ty Intěrněty (Chiptune)",
        notes: [440.00, 493.88, 523.25, 587.33, 659.25, 587.33, 523.25, 493.88, 440.00, 329.63],
        durations: [180, 180, 180, 180, 360, 180, 180, 180, 180, 360]
    },
    {
        name: "▶ Bába Pod Kořenem - Dark Ambient 2005",
        notes: [110.00, 116.54, 110.00, 103.83, 110.00, 130.81, 110.00, 98.00],
        durations: [500, 500, 500, 500, 500, 500, 500, 1000]
    }
];

function playSynthTone(freq, type = 'square', duration = 0.2) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(masterVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
}

function togglePlay() {
    const playBtn = document.getElementById('playBtn');
    const eq = document.getElementById('equalizer');

    if (isPlaying) {
        stopMusic();
    } else {
        isPlaying = true;
        playBtn.innerText = '⏸ PAUSE';
        playBtn.style.background = '#ff00ff';
        eq.classList.add('playing');
        startTrackLoop();
    }
}

function startTrackLoop() {
    if (musicInterval) clearInterval(musicInterval);

    const track = tracks[currentTrackIndex];
    musicNoteIndex = 0;

    function step() {
        if (!isPlaying) return;
        const note = track.notes[musicNoteIndex];
        const dur = track.durations[musicNoteIndex] / 1000;

        playSynthTone(note, 'sawtooth', dur);

        musicNoteIndex = (musicNoteIndex + 1) % track.notes.length;
        musicInterval = setTimeout(step, track.durations[musicNoteIndex]);
    }

    step();
}

function stopMusic() {
    isPlaying = false;
    if (musicInterval) clearTimeout(musicInterval);
    const playBtn = document.getElementById('playBtn');
    const eq = document.getElementById('equalizer');
    playBtn.innerText = '▶ PLAY';
    playBtn.style.background = '#222';
    eq.classList.remove('playing');
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    document.getElementById('trackSelect').value = currentTrackIndex;
    updateTrackDisplay();
    if (isPlaying) {
        startTrackLoop();
    }
}

function changeTrack(index) {
    currentTrackIndex = parseInt(index, 10);
    updateTrackDisplay();
    if (isPlaying) {
        startTrackLoop();
    }
}

function updateTrackDisplay() {
    document.getElementById('trackTitle').innerText = tracks[currentTrackIndex].name;
}

function setVolume(val) {
    masterVolume = parseFloat(val);
}

// 2. CS Meme Soundboard Audio Synthesis
function playSound(type) {
    const ctx = getAudioContext();

    if (type === 'vypatlat') {
        // "Hodně budeš někde!" - Arpeggio ascending
        [261.63, 329.63, 392.00, 523.25, 659.25, 783.99].forEach((freq, idx) => {
            setTimeout(() => playSynthTone(freq, 'triangle', 0.2), idx * 80);
        });
        showFloatingText("✨ HODNĚ BUDEŠ NĚKDE! ✨");
    } else if (type === 'spatny') {
        // "Velký špatný!" - Low alarm drop
        playSynthTone(150, 'sawtooth', 0.4);
        setTimeout(() => playSynthTone(100, 'sawtooth', 0.6), 150);
        showFloatingText("⚠️ VELKÝ ŠPATNÝ!");
    } else if (type === 'kara') {
        // Jiří Kára - Beer synth clink
        playSynthTone(800, 'sine', 0.1);
        playSynthTone(1200, 'sine', 0.15);
        showFloatingText("🍻 TO JE MATERIÁL!");
    } else if (type === 'internet') {
        // Věra Pohlová - Computer error glitch
        for (let i = 0; i < 6; i++) {
            setTimeout(() => playSynthTone(Math.random() * 800 + 200, 'square', 0.05), i * 50);
        }
        showFloatingText("💻 ZAKÁZAT INTĚRNĚTY!");
    } else if (type === 'koren') {
        // Bába pod kořenem - Muffled bass rumble
        playSynthTone(60, 'triangle', 0.8);
        showFloatingText("🌲 POMOC, KOŘEN!");
    } else if (type === 'hvezda') {
        // Jolanda - Fanfare
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            setTimeout(() => playSynthTone(freq, 'sine', 0.25), idx * 100);
        });
        showFloatingText("⭐ JÁ JSEM TADY ZA HVĚZDU!");
    }
}

function showFloatingText(txt) {
    const el = document.createElement('div');
    el.className = 'floating-beer';
    el.innerText = txt;
    el.style.left = (window.innerWidth / 2 - 100) + 'px';
    el.style.top = (window.innerHeight / 2) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}

// 3. Jolanda Crystal Ball Fortune Teller
const prophecies = [
    "🔮 Vidím velký špatný! Ale když dáš pivo Jiřímu Károvi, všechno se spraví!",
    "🔮 Hodně budeš někde! Bude to daleko, ale výplata tam bude!",
    "🔮 Karty říkají: Zítra ti intěrněty fungovat budou, ale Věra Pohlová z toho nebude mít radost!",
    "🔮 Deset tisíc mých očí vidí, že jsi dnes ještě nevypil ani jedno pivo!",
    "🔮 Pozor! Věštím, že pod kořenem žádné peníze nenajdeš, tam je jenom bába!",
    "🔮 Cikánské karty nelžou: Zítra potkáš někoho, kdo je tu za hvězdu!",
    "🔮 Vidím světlou budoucnost, ale nesmíš zapomenout zaplatit účet na Olšanech!",
    "🔮 Výborná zpráva! Tvoje hvězdy jsou v konjunkci s Láďou Hruškou - udělej si kůžičky!"
];

const moods = [
    "🔮 Dívám se do budoucna",
    "⚡ Velký špatný v ovzduší",
    "✨ Vytahuji cikánské karty",
    "🍻 Na pivu s Károu",
    "💻 Bojuji proti intěrnětům",
    "⭐ Jsem tady za hvězdu"
];

function readCards() {
    const q = document.getElementById('fortuneQuestion').value;
    const sphere = document.getElementById('ballSphere');
    const resultBox = document.getElementById('fortuneResult');
    const ballText = document.getElementById('ballText');

    playSound('vypatlat');

    sphere.style.transform = 'scale(1.15) rotate(10deg)';
    ballText.innerText = 'Míchám karty...';
    resultBox.innerHTML = '<em>Jolanda nahlíží do časoprostoru...</em>';

    setTimeout(() => {
        sphere.style.transform = 'scale(1)';
        const randomProphecy = prophecies[Math.floor(Math.random() * prophecies.length)];
        ballText.innerText = 'ZJEVOVALO SE!';
        resultBox.innerText = `Otázka: "${q || 'Co mě čeká?'}" \n👉 ${randomProphecy}`;

        // Randomly change mood
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        document.getElementById('currentMood').innerText = randomMood;
    }, 1000);
}

// 4. Interactive Beer Counter
let beerCount = 104;

function giveBeer() {
    beerCount++;
    document.getElementById('beerCount').innerText = beerCount;
    document.getElementById('beerCountStat').innerText = `${beerCount} 🍺`;

    // Trigger floating beer emoji animation
    const beer = document.createElement('div');
    beer.className = 'floating-beer';
    beer.innerText = '🍺 +1 Pivo pre Káru!';
    beer.style.left = (Math.random() * (window.innerWidth - 100)) + 'px';
    beer.style.top = (window.innerHeight - 150) + 'px';
    document.body.appendChild(beer);

    setTimeout(() => beer.remove(), 1500);
    playSound('kara');
}

// 5. Myspace Theme Switcher
function setTheme(themeName) {
    document.body.className = `theme-${themeName}`;

    // Update active button state
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    playSound('hvezda');
}

// 6. Interactive Comment Box
function addComment() {
    const author = document.getElementById('commentAuthor').value.trim();
    const text = document.getElementById('commentText').value.trim();

    if (!author || !text) {
        alert('Prosím vyplň jméno i vzkaz!');
        return;
    }

    const commentsList = document.getElementById('commentsList');
    const now = new Date();
    const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()} o ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.style.animation = 'fadeIn 0.5s ease-in';

    // Random avatar seed based on author
    const avatarSeed = encodeURIComponent(author);

    newComment.innerHTML = `
        <div class="comment-avatar">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}" alt="${author}">
        </div>
        <div class="comment-body">
            <div class="comment-meta">
                <strong>${escapeHtml(author)}</strong> - ${dateStr}
            </div>
            <div class="comment-text">
                ${escapeHtml(text)}
            </div>
        </div>
    `;

    commentsList.prepend(newComment);
    document.getElementById('commentText').value = '';

    playSound('vypatlat');
    alert('Komentář byl úspěšně přidán na profil Jolandy!');
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function sendMsg(msg) {
    alert(msg);
    playSound('hvezda');
}

// 7. Interactive Glitter Mouse Trail
function triggerGlitter() {
    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'glitter-particle';
            particle.style.left = (Math.random() * window.innerWidth) + 'px';
            particle.style.top = (Math.random() * window.innerHeight) + 'px';
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }, i * 30);
    }
    playSound('vypatlat');
}

document.addEventListener('mousemove', function(e) {
    if (Math.random() < 0.15) { // 15% chance to spawn particle on move
        const particle = document.createElement('div');
        particle.className = 'glitter-particle';
        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
});

// Auto-increment visitor counter for authenticity
setInterval(() => {
    const el = document.getElementById('visitorCounter');
    let count = parseInt(el.innerText, 10);
    count += Math.floor(Math.random() * 3) + 1;
    el.innerText = count.toString().padStart(7, '0');
}, 4000);
