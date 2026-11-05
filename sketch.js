// ==========================================
// 中信兄弟主題：黃金接球大賽（含完整音效版）- 全域變數區
// ==========================================
let gameState = "START"; // 遊戲狀態: "START", "PLAYING", "GAMEOVER"
let score = 0;           // 玩家得分
let lives = 3;           // 玩家生命值
let selectedTime = 30;   // 預設挑戰秒數為 30 秒
let gameTimer = 30;      // 當前剩餘秒數
let timerInterval;       // 倒數計時器物件

let player;              // 玩家控制的接球手套
let fallingItems = [];   // 掉落物陣列

// 豐富的掉落物題庫（所有掉落物視覺統一為黃金應援風格）
let goodItems = [
  "⚾ 兄弟勝利球", "🧢 黃衫軍球帽", "📣 猛象應援汽笛", 
  "🌭 球場熱狗", "🥤 冰涼可樂", "🏆 總冠軍獎盃", "🍱 勝利便當", "⭐ 江坤宇美技"
];

let badItems = [
  "⛈️ 暴雨延賽", "❌ 判決出局", "⚠️ 守備失誤", 
  "⚾ 擦棒界外", "💥 跑壘碰撞", "🛑 違規申訴"
];

let gameContainer, titleP, subtitleP, startBtn;
let timeButtons = [];
let audioCtx = null;

// ==========================================
// 預先載入函數：注入 Google Fonts 與完美對齊的 CSS
// ==========================================
function preload() {
  let cssStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Isometra&family=LXGW+WenKai+Mono+TC&display=swap');

    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Isometra', 'LXGW WenKai Mono TC', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
    }

    /* 遊戲主容器：使用 Flexbox 嚴格置中與垂直排列，解決跑版問題 */
    #game-container {
      background: rgba(255, 255, 255, 0.98);
      padding: 30px 40px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      width: 90%;
      max-width: 550px;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
      z-index: 10;
      text-align: center;
    }

    .game-title {
      font-size: clamp(1.3rem, 2.8vw, 1.7rem);
      font-weight: bold;
      color: #1e3a8a;
      margin: 0 0 10px 0;
    }

    .game-desc {
      font-size: clamp(0.9rem, 2vw, 1.1rem);
      color: #64748b;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    /* 秒數選擇按鈕容器與按鈕樣式 */
    .time-selector-box {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 25px;
      width: 100%;
    }

    .time-btn {
      padding: 10px 20px;
      font-size: 1rem;
      font-weight: bold;
      background-color: #f1f5f9;
      color: #475569;
      border: 2px solid #cbd5e1;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Isometra', 'LXGW WenKai Mono TC', sans-serif;
    }

    .time-btn:hover {
      background-color: #e2e8f0;
    }

    .time-btn.selected {
      background-color: #facc15;
      color: #1e3a8a;
      border-color: #eab308;
      box-shadow: 0 0 12px rgba(250, 204, 21, 0.5);
    }

    /* 開始/重新挑戰按鈕樣式 */
    .game-ui-btn {
      padding: 12px 35px;
      font-size: 1.1rem;
      font-weight: bold;
      background-color: #facc15;
      color: #1e3a8a;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(250, 204, 21, 0.4);
      transition: all 0.2s ease;
      font-family: 'Isometra', 'LXGW WenKai Mono TC', sans-serif;
      margin-top: 10px;
    }

    .game-ui-btn:hover {
      background-color: #eab308;
      transform: scale(1.03);
    }

    @media (max-width: 480px) {
      #game-container { padding: 20px; width: 95%; }
    }
  `;

  let styleElement = document.createElement('style');
  styleElement.innerHTML = cssStyles;
  document.head.appendChild(styleElement);
}

// ==========================================
// 初始化函數：建立畫布與 UI 介面
// ==========================================
function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');

  player = {
    w: 140,
    h: 30,
    y: height - 60
  };

  // 建立外框容器（完美置中對齊）
  gameContainer = createDiv();
  gameContainer.id('game-container');

  titleP = createP("⚾ 黃金接球大賽：應援挑戰");
  titleP.parent(gameContainer);
  titleP.addClass('game-title');

  subtitleP = createP("請選擇挑戰秒數，左右移動手套接住黃色應援好物！避開雨勢與失誤！");
  subtitleP.parent(gameContainer);
  subtitleP.addClass('game-desc');

  // 建立秒數選擇按鈕區
  let timeBox = createDiv();
  timeBox.parent(gameContainer);
  timeBox.addClass('time-selector-box');

  let times = [15, 30, 60];
  for (let t of times) {
    let btn = createButton(`${t} 秒`);
    btn.parent(timeBox);
    btn.addClass('time-btn');
    if (t === selectedTime) btn.addClass('selected');
    btn.mousePressed(() => selectTime(t));
    timeButtons.push({ btn: btn, time: t });
  }

  // 建立遊戲主按鈕
  startBtn = createButton("上場接球！");
  startBtn.parent(gameContainer);
  startBtn.addClass('game-ui-btn');
  startBtn.mousePressed(startGame);
}

// ==========================================
// 繪圖函數：背景動態特效
// ==========================================
function draw() {
  background(15, 23, 42);

  if (gameState === "PLAYING") {
    playGameLogic();
  } else {
    noStroke();
    fill(255, 255, 255, 10);
    ellipse(width * 0.2, height * 0.3, 250, 250);
    ellipse(width * 0.8, height * 0.7, 350, 350);
  }
}

// ==========================================
// 視窗大小改變時自動調整
// ==========================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  player.y = height - 60;
}

// ==========================================
// 遊戲進行中的核心邏輯
// ==========================================
function playGameLogic() {
  if (frameCount % 35 === 0) {
    spawnItem();
  }

  for (let i = fallingItems.length - 1; i >= 0; i--) {
    let item = fallingItems[i];
    item.y += item.speed;

    push();
    rectMode(CENTER);
    // 所有掉落物統一採用黃色應援風格外觀
    fill(250, 204, 21, 230);
    stroke(202, 138, 4);
    strokeWeight(2);
    rect(item.x, item.y, item.w, item.h, 10);

    fill(15, 23, 42);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text(item.text, item.x, item.y);
    pop();

    let playerX = constrain(mouseX, player.w / 2, width - player.w / 2);
    if (
      item.y + item.h / 2 >= player.y - player.h / 2 &&
      item.y - item.h / 2 <= player.y + player.h / 2 &&
      item.x >= playerX - player.w / 2 &&
      item.x <= playerX + player.w / 2
    ) {
      if (item.type === 'good') {
        score += 10;
        playAudioEffect('score'); // 播放加分音效
      } else {
        lives -= 1;
        playAudioEffect('hurt');  // 播放受傷/扣血音效
        if (lives <= 0) {
          endGame();
        }
      }
      fallingItems.splice(i, 1);
      continue;
    }

    if (item.y > height + 30) {
      fallingItems.splice(i, 1);
    }
  }

  // 繪製玩家控制的手套
  let currentX = constrain(mouseX, player.w / 2, width - player.w / 2);
  push();
  rectMode(CENTER);
  fill(30, 58, 138);
  stroke(250, 204, 21);
  strokeWeight(3);
  rect(currentX, player.y, player.w, player.h, 12);
  fill(255);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text("⚾ 應援手套", currentX, player.y);
  pop();

  // 繪製頂部 HUD 計分板
  push();
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text(`🏆 得分: ${score}`, 30, 30);
  text(`❤️ 生命: ${lives}`, 30, 60);
  textAlign(RIGHT, TOP);
  text(`⏳ 倒數: ${gameTimer}s`, width - 30, 30);
  pop();
}

// ==========================================
// 產生掉落物
// ==========================================
function spawnItem() {
  let isGood = random(1) > 0.35;
  let itemType = isGood ? 'good' : 'bad';
  let textContent = isGood ? random(goodItems) : random(badItems);
  
  let newItem = {
    x: random(70, width - 70),
    y: -30,
    w: textContent.length * 13 + 20,
    h: 36,
    speed: random(3.5, 6.5),
    text: textContent,
    type: itemType
  };
  fallingItems.push(newItem);
}

// ==========================================
// 選擇秒數函數
// ==========================================
function selectTime(t) {
  selectedTime = t;
  for (let item of timeButtons) {
    if (item.time === t) {
      item.btn.addClass('selected');
    } else {
      item.btn.removeClass('selected');
    }
  }
}

// ==========================================
// 瀏覽器內建 Web Audio API 音效播放函數
// ==========================================
function playAudioEffect(type) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  let osc = audioCtx.createOscillator();
  let gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  let now = audioCtx.currentTime;

  if (type === 'score') {
    // 高音叮咚聲（加分）
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'hurt') {
    // 低沉警示音（扣血）
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.25);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'gameover') {
    // 遊戲結束音效（下降音階）
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    osc.start(now);
    osc.stop(now + 0.45);
  }
}

// ==========================================
// 開始遊戲
// ==========================================
function startGame() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  gameState = "PLAYING";
  score = 0;
  lives = 3;
  gameTimer = selectedTime;
  fallingItems = [];

  gameContainer.style('display', 'none');

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    gameTimer--;
    if (gameTimer <= 0) {
      endGame();
    }
  }, 1000);
}

// ==========================================
// 結束遊戲（顯示結算畫面）
// ==========================================
function endGame() {
  gameState = "GAMEOVER";
  clearInterval(timerInterval);
  fallingItems = [];

  playAudioEffect('gameover'); // 播放遊戲結束音效

  titleP.html("🏆 比賽結束！精彩好球");
  subtitleP.html(`挑戰時間：<b>${selectedTime} 秒</b><br>最終應援總分：<span style="color: #2563eb; font-size: 1.2rem;">${score} 分</span>`);
  subtitleP.show();

  startBtn.html("再玩一次");
  gameContainer.style('display', 'flex');
}