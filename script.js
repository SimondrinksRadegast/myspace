// Counter-Strike Tactical Casino & Lootboxes Logic

// AUDIO SYNTHESIZER FOR CS SOUND EFFECTS
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSoundEffect(type) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'tick') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'win') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.12, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + idx * 0.08);
        o.stop(now + idx * 0.08 + 0.25);
      });
    } else if (type === 'jackpot') {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(freq, now + idx * 0.1);
        g.gain.setValueAtTime(0.15, now + idx * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + idx * 0.1);
        o.stop(now + idx * 0.1 + 0.35);
      });
    } else if (type === 'spin') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {
    console.log("Audio play error:", e);
  }
}

// PLAYER STATE & PERSISTENCE
let playerBalance = 1000;
let inventory = [];
let currentBet = 10;
let isOpeningCase = false;
let isSpinningSlots = false;
let pendingDropItem = null;

function loadState() {
  const savedBalance = localStorage.getItem('cs_balance');
  if (savedBalance !== null) {
    playerBalance = parseInt(savedBalance, 10);
  }
  const savedInv = localStorage.getItem('cs_inventory');
  if (savedInv) {
    inventory = JSON.parse(savedInv);
  }
  updateUI();
}

function saveState() {
  localStorage.setItem('cs_balance', playerBalance);
  localStorage.setItem('cs_inventory', JSON.stringify(inventory));
  updateUI();
}

function updateUI() {
  const balanceEl = document.getElementById('player-balance');
  if (balanceEl) balanceEl.innerText = playerBalance.toLocaleString('cs-CZ');

  const invCountEl = document.getElementById('inv-count');
  if (invCountEl) invCountEl.innerText = inventory.length;

  renderInventory();
}

// CS CASE DATABASE & ITEMS
const rarityConfig = {
  milspec: { name: 'Mil-Spec', colorClass: 'rarity-milspec', chance: 70 },
  restricted: { name: 'Restricted', colorClass: 'rarity-restricted', chance: 20 },
  classified: { name: 'Classified', colorClass: 'rarity-classified', chance: 7 },
  covert: { name: 'Covert', colorClass: 'rarity-covert', chance: 2.5 },
  gold: { name: 'Special Rare Knife', colorClass: 'rarity-gold', chance: 0.5 }
};

const casesData = {
  bravo: {
    name: "Operation Bravo Case",
    price: 250,
    drops: [
      { name: "AK-47 | Fire Serpent", icon: "🔫", rarity: "covert", wear: "Factory New", price: 4500 },
      { name: "AWP | Graphite", icon: "🎯", rarity: "classified", wear: "Minimal Wear", price: 1200 },
      { name: "P90 | Emerald Dragon", icon: "🐉", rarity: "classified", wear: "Field-Tested", price: 850 },
      { name: "USP-S | Overgrowth", icon: "🔫", rarity: "restricted", wear: "Factory New", price: 350 },
      { name: "MAC-10 | Graven", icon: "🔫", rarity: "restricted", wear: "Minimal Wear", price: 280 },
      { name: "SG 553 | Wave Spray", icon: "🔫", rarity: "milspec", wear: "Field-Tested", price: 80 },
      { name: "Galil AR | Shattered", icon: "🔫", rarity: "milspec", wear: "Well-Worn", price: 60 },
      { name: "★ Karambit | Fade", icon: "🔪", rarity: "gold", wear: "Factory New • StatTrak™", price: 12500 }
    ]
  },
  cobblestone: {
    name: "Cobblestone Souvenir",
    price: 500,
    drops: [
      { name: "AWP | Dragon Lore", icon: "🐉", rarity: "covert", wear: "Factory New Souvenir", price: 25000 },
      { name: "M4A1-S | Knight", icon: "🛡️", rarity: "classified", wear: "Factory New", price: 6500 },
      { name: "Desert Eagle | Hand Cannon", icon: "🔫", rarity: "classified", wear: "Minimal Wear", price: 2200 },
      { name: "CZ75-Auto | Chalice", icon: "🔫", rarity: "restricted", wear: "Factory New", price: 750 },
      { name: "MP9 | Dark Age", icon: "🔫", rarity: "restricted", wear: "Field-Tested", price: 400 },
      { name: "P2000 | Chainmail", icon: "🔫", rarity: "milspec", wear: "Minimal Wear", price: 150 },
      { name: "USP-S | Royal Blue", icon: "🔫", rarity: "milspec", wear: "Field-Tested", price: 120 },
      { name: "★ Butterfly Knife | Lore", icon: "🔪", rarity: "gold", wear: "Factory New", price: 18000 }
    ]
  },
  revolution: {
    name: "Revolution Case",
    price: 150,
    drops: [
      { name: "M4A4 | Temukau", icon: "🎯", rarity: "covert", wear: "Factory New", price: 1800 },
      { name: "AK-47 | Head Shot", icon: "💥", rarity: "covert", wear: "Minimal Wear", price: 1500 },
      { name: "AWP | Duality", icon: "🎯", rarity: "classified", wear: "Field-Tested", price: 450 },
      { name: "P90 | Neoqueen", icon: "🔫", rarity: "classified", wear: "Minimal Wear", price: 320 },
      { name: "MAC-10 | Sakkaku", icon: "🔫", rarity: "restricted", wear: "Factory New", price: 180 },
      { name: "Glock-18 | Umbral Rabbit", icon: "🔫", rarity: "milspec", wear: "Field-Tested", price: 50 },
      { name: "MP7 | Insomnia", icon: "🔫", rarity: "milspec", wear: "Well-Worn", price: 40 },
      { name: "★ Sport Gloves | Vice", icon: "🧤", rarity: "gold", wear: "Minimal Wear", price: 9500 }
    ]
  },
  knife: {
    name: "Specialist Knife Case",
    price: 1000,
    drops: [
      { name: "★ Karambit | Doppler Black Pearl", icon: "🔪", rarity: "gold", wear: "Factory New", price: 30000 },
      { name: "★ M9 Bayonet | Crimson Web", icon: "🔪", rarity: "gold", wear: "Minimal Wear", price: 15000 },
      { name: "★ Butterfly Knife | Marble Fade", icon: "🔪", rarity: "gold", wear: "Factory New", price: 22000 },
      { name: "★ Skeleton Knife | Case Hardened Blue Gem", icon: "🔪", rarity: "gold", wear: "Field-Tested", price: 28000 },
      { name: "★ Specialist Gloves | Crimson Kimono", icon: "🧤", rarity: "gold", wear: "Factory New", price: 16000 }
    ]
  }
};

let selectedCaseKey = 'bravo';

function renderCasePreview() {
  const container = document.getElementById('case-drops-preview');
  if (!container) return;

  const caseObj = casesData[selectedCaseKey];
  if (!caseObj) return;

  container.innerHTML = '';
  caseObj.drops.forEach(item => {
    const card = document.createElement('div');
    const colorClass = rarityConfig[item.rarity]?.colorClass || 'rarity-milspec';
    card.className = `drop-preview-card ${colorClass}`;
    card.innerHTML = `
      <div class="icon">${item.icon}</div>
      <div class="name">${item.name}</div>
      <div class="val">🪙 ${item.price.toLocaleString('cs-CZ')}</div>
    `;
    container.appendChild(card);
  });

  const priceEl = document.getElementById('selected-case-price');
  if (priceEl) priceEl.innerText = caseObj.price;
}

// SPINNER INITIALIZATION & CASE OPENING LOGIC
function populateSpinnerTrack(winningItem = null) {
  const track = document.getElementById('spinner-track');
  if (!track) return;

  const caseObj = casesData[selectedCaseKey];
  const drops = caseObj.drops;

  track.innerHTML = '';
  const totalItems = 50;
  const targetIndex = 38; // Winning item index

  for (let i = 0; i < totalItems; i++) {
    let item;
    if (i === targetIndex && winningItem) {
      item = winningItem;
    } else {
      item = drops[Math.floor(Math.random() * drops.length)];
    }

    const colorClass = rarityConfig[item.rarity]?.colorClass || 'rarity-milspec';
    const itemEl = document.createElement('div');
    itemEl.className = `spin-item ${colorClass}`;
    itemEl.innerHTML = `
      <div class="spin-item-icon">${item.icon}</div>
      <div class="spin-item-name">${item.name}</div>
      <div class="spin-item-wear">${item.wear}</div>
    `;
    track.appendChild(itemEl);
  }

  // Reset track position
  track.style.transition = 'none';
  track.style.transform = 'translateX(0px)';
}

function getRandomDrop(caseKey) {
  const caseObj = casesData[caseKey];
  const rand = Math.random() * 100;

  // Filter drops by rolled rarity, or fallback to uniform random
  let rolledRarity = 'milspec';
  if (rand < 0.5) rolledRarity = 'gold';
  else if (rand < 3) rolledRarity = 'covert';
  else if (rand < 10) rolledRarity = 'classified';
  else if (rand < 30) rolledRarity = 'restricted';
  else rolledRarity = 'milspec';

  const matchingDrops = caseObj.drops.filter(d => d.rarity === rolledRarity);
  if (matchingDrops.length > 0) {
    return matchingDrops[Math.floor(Math.random() * matchingDrops.length)];
  }
  return caseObj.drops[Math.floor(Math.random() * caseObj.drops.length)];
}

function openCase() {
  if (isOpeningCase) return;

  const caseObj = casesData[selectedCaseKey];
  if (playerBalance < caseObj.price) {
    alert("Nemáš dostatek CS Mincí na otevření této bedny!");
    return;
  }

  playerBalance -= caseObj.price;
  saveState();
  isOpeningCase = true;

  const winningItem = getRandomDrop(selectedCaseKey);
  pendingDropItem = winningItem;

  populateSpinnerTrack(winningItem);

  const track = document.getElementById('spinner-track');
  const viewportWidth = document.querySelector('.spinner-viewport').offsetWidth;

  // Item width (140px) + margin (10px total) = 150px
  const itemWidth = 150;
  const targetIndex = 38;
  const targetOffset = targetIndex * itemWidth + itemWidth / 2 - viewportWidth / 2;
  const randomJitter = (Math.random() - 0.5) * 80;
  const finalTransform = -(targetOffset + randomJitter);

  // Animate spinner
  setTimeout(() => {
    track.style.transition = 'transform 5s cubic-bezier(0.1, 0.9, 0.2, 1)';
    track.style.transform = `translateX(${finalTransform}px)`;

    // Tick sounds during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      playSoundEffect('tick');
      tickCount++;
      if (tickCount >= 25) clearInterval(tickInterval);
    }, 180);

  }, 50);

  // Complete spin and open modal
  setTimeout(() => {
    isOpeningCase = false;
    playSoundEffect('win');
    showDropModal(winningItem);
  }, 5200);
}

function showDropModal(item) {
  const modal = document.getElementById('drop-modal');
  const badge = document.getElementById('modal-item-rarity-badge');
  const icon = document.getElementById('modal-item-icon');
  const name = document.getElementById('modal-item-name');
  const wear = document.getElementById('modal-item-sub');
  const price = document.getElementById('modal-item-price');

  const rarityInfo = rarityConfig[item.rarity] || rarityConfig.milspec;
  badge.className = `rarity-badge ${rarityInfo.colorClass}`;
  badge.innerText = rarityInfo.name.toUpperCase();

  icon.innerText = item.icon;
  name.innerText = item.name;
  wear.innerText = item.wear;
  price.innerText = `🪙 ${item.price.toLocaleString('cs-CZ')}`;

  modal.classList.remove('hidden');
}

function closeDropModal(keepItem) {
  const modal = document.getElementById('drop-modal');
  modal.classList.add('hidden');

  if (pendingDropItem) {
    if (keepItem) {
      inventory.push({ ...pendingDropItem, id: Date.now() });
      saveState();
      playSoundEffect('click');
    } else {
      playerBalance += pendingDropItem.price;
      saveState();
      playSoundEffect('win');
    }
    pendingDropItem = null;
  }
}

// INVENTORY SYSTEM
function renderInventory() {
  const grid = document.getElementById('inventory-grid');
  const emptyMsg = document.getElementById('empty-inventory-msg');
  const totalValEl = document.getElementById('inv-total-value');

  if (!grid || !emptyMsg) return;

  if (inventory.length === 0) {
    grid.innerHTML = '';
    emptyMsg.style.display = 'block';
    if (totalValEl) totalValEl.innerText = '0 Coins';
    return;
  }

  emptyMsg.style.display = 'none';
  grid.innerHTML = '';

  let totalVal = 0;
  inventory.forEach(item => {
    totalVal += item.price;
    const colorClass = rarityConfig[item.rarity]?.colorClass || 'rarity-milspec';

    const card = document.createElement('div');
    card.className = `inventory-card ${colorClass}`;
    card.innerHTML = `
      <div class="icon">${item.icon}</div>
      <div class="title">${item.name}</div>
      <div class="sub">${item.wear}</div>
      <div class="price">🪙 ${item.price.toLocaleString('cs-CZ')}</div>
      <button class="cs-btn cs-btn-gold" style="font-size: 13px; padding: 4px 10px;" onclick="sellInventoryItem(${item.id})">
        💰 PRODAT
      </button>
    `;
    grid.appendChild(card);
  });

  if (totalValEl) totalValEl.innerText = `🪙 ${totalVal.toLocaleString('cs-CZ')} Coins`;
}

function sellInventoryItem(itemId) {
  const idx = inventory.findIndex(i => i.id === itemId);
  if (idx !== -1) {
    const item = inventory[idx];
    playerBalance += item.price;
    inventory.splice(idx, 1);
    saveState();
    playSoundEffect('win');
  }
}

function sellAllInventory() {
  if (inventory.length === 0) return;
  const totalVal = inventory.reduce((sum, item) => sum + item.price, 0);
  playerBalance += totalVal;
  inventory = [];
  saveState();
  playSoundEffect('jackpot');
  alert(`Prodáno vše za 🪙 ${totalVal.toLocaleString('cs-CZ')} CS Mincí!`);
}

// SLOT MACHINE SYSTEM
const slotSymbols = [
  { char: '🐉', name: 'AWP Dragon Lore', mult: 50 },
  { char: '🔪', name: 'Karambit Doppler', mult: 30 },
  { char: '💣', name: 'C4 Bomb Explode', mult: 20 },
  { char: '✂️', name: 'Defuse Kit', mult: 15 },
  { char: '🎯', name: 'Headshot AK-47', mult: 10 },
  { char: '⚡', name: 'StatTrak', mult: 5 }
];

function spinSlots() {
  if (isSpinningSlots) return;

  if (playerBalance < currentBet) {
    alert("Nemáš dostatek CS Mincí na tuto sázku!");
    return;
  }

  playerBalance -= currentBet;
  saveState();
  isSpinningSlots = true;

  const resultMsg = document.getElementById('slot-result-msg');
  if (resultMsg) resultMsg.innerText = "Válce se točí...";

  const reelStrips = [
    document.querySelector('#reel-1 .reel-strip'),
    document.querySelector('#reel-2 .reel-strip'),
    document.querySelector('#reel-3 .reel-strip')
  ];

  const finalSymbols = [];

  // Spin each reel
  reelStrips.forEach((strip, index) => {
    // Generate random sequence of symbols
    strip.innerHTML = '';
    const numSymbols = 20 + index * 5;
    for (let i = 0; i < numSymbols; i++) {
      const sym = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
      if (i === numSymbols - 2) {
        finalSymbols[index] = sym; // Middle payline symbol
      }
      const symEl = document.createElement('div');
      symEl.className = 'slot-symbol';
      symEl.innerText = sym.char;
      strip.appendChild(symEl);
    }

    strip.style.transition = 'none';
    strip.style.transform = 'translateY(0px)';

    setTimeout(() => {
      playSoundEffect('spin');
      strip.style.transition = `transform ${1.5 + index * 0.4}s cubic-bezier(0.1, 0.8, 0.3, 1)`;
      const targetY = -((numSymbols - 3) * 80);
      strip.style.transform = `translateY(${targetY}px)`;
    }, 50);
  });

  // Calculate results after spinning finishes
  setTimeout(() => {
    isSpinningSlots = false;
    evaluateSlotResult(finalSymbols);
  }, 2400);
}

function evaluateSlotResult(symbols) {
  const resultMsg = document.getElementById('slot-result-msg');
  const s1 = symbols[0];
  const s2 = symbols[1];
  const s3 = symbols[2];

  // Check 3 matching symbols
  if (s1.char === s2.char && s2.char === s3.char) {
    const winAmount = currentBet * s1.mult;
    playerBalance += winAmount;
    saveState();

    if (s1.mult >= 30) {
      playSoundEffect('jackpot');
      if (resultMsg) resultMsg.innerText = `🔥 MEGA JACKPOT! 3x ${s1.char} (${s1.name})! Výhra 🪙 ${winAmount.toLocaleString('cs-CZ')} Mincí!`;
    } else {
      playSoundEffect('win');
      if (resultMsg) resultMsg.innerText = `🎉 SKVĚLÁ VÝHRA! 3x ${s1.char}! Vyhráváš 🪙 ${winAmount.toLocaleString('cs-CZ')} Mincí!`;
    }
  }
  // Check 2 matching symbols
  else if (s1.char === s2.char || s2.char === s3.char || s1.char === s3.char) {
    const winAmount = currentBet * 2;
    playerBalance += winAmount;
    saveState();
    playSoundEffect('win');
    if (resultMsg) resultMsg.innerText = `✨ Dvojitý Zásah! Výhra 🪙 ${winAmount.toLocaleString('cs-CZ')} Mincí!`;
  }
  // No match
  else {
    playSoundEffect('click');
    if (resultMsg) resultMsg.innerText = `❌ Žádný zásah. Zkus to znovu!`;
  }
}

// INITIALIZATION & EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Tab switcher
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSoundEffect('click');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(`tab-${tabId}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Case Selector Cards
  document.querySelectorAll('.case-card').forEach(card => {
    card.addEventListener('click', () => {
      playSoundEffect('click');
      document.querySelectorAll('.case-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedCaseKey = card.getAttribute('data-case');
      renderCasePreview();
      populateSpinnerTrack();
    });
  });

  // Render initial case preview & track
  renderCasePreview();
  populateSpinnerTrack();

  // Open Case button
  document.getElementById('btn-open-case')?.addEventListener('click', openCase);

  // Modal action buttons
  document.getElementById('btn-modal-keep')?.addEventListener('click', () => closeDropModal(true));
  document.getElementById('btn-modal-sell')?.addEventListener('click', () => closeDropModal(false));

  // Daily bonus button
  document.getElementById('btn-daily-bonus')?.addEventListener('click', () => {
    playerBalance += 500;
    saveState();
    playSoundEffect('win');
    alert("🎁 Získal jsi +500 CS Mincí zdarma!");
  });

  // Sell all inventory
  document.getElementById('btn-sell-all')?.addEventListener('click', sellAllInventory);

  // Slot bet buttons
  document.querySelectorAll('.bet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSoundEffect('click');
      document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const val = btn.getAttribute('data-bet');
      if (val === 'max') {
        currentBet = Math.max(10, Math.floor(playerBalance));
      } else {
        currentBet = parseInt(val, 10);
      }
      document.getElementById('current-bet-display').innerText = currentBet;
    });
  });

  // Spin slots button
  document.getElementById('btn-spin-slots')?.addEventListener('click', spinSlots);
});
