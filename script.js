let playerHp = 100;
let playerEnergy = 0;
let enemyHp = 100;
let currentAnswer = 0;
let questionCount = 0;
let correctAnswers = 0;
let actionUsed = false;

let attackCooldowns = {
  basic: 0,
  heal: 0,
  spell: 0
};

function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('visible'));
  document.getElementById(screenId).classList.add('visible');
}

function goToBattle() {
  resetBattle();
  startQuestionPhase();
}

function resetBattle() {
  playerHp = 100;
  playerEnergy = 0;
  enemyHp = 100;
  updateUI();
  log('');
  enableActionButtons(false);
}

function updateUI() {
  document.getElementById("playerHp").innerText = playerHp;
  document.getElementById("enemyHp").innerText = enemyHp;
  document.getElementById("playerEnergy").innerText = playerEnergy;
}

function log(msg) {
  document.getElementById("battleLog").innerText = msg;
}

function enableActionButtons(enable) {
  const buttons = ["attackBtn", "healBtn", "spellBtn"];
  buttons.forEach(id => {
    const btn = document.getElementById(id);
    if (enable) {
      btn.classList.remove("disabled");
      btn.disabled = false;
    } else {
      btn.classList.add("disabled");
      btn.disabled = true;
    }
  });
}

// === QUESTIONS ===
function startQuestionPhase() {
  questionCount = 0;
  correctAnswers = 0;
  switchScreen("questionScreen");
  nextQuestion();
}

function nextQuestion() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  currentAnswer = a + b;
  document.getElementById("questionText").innerText = `What is ${a} + ${b}?`;
  document.getElementById("userAnswer").value = '';
  document.getElementById("feedback").innerText = '';
}

function submitAnswer() {
  const input = document.getElementById("userAnswer").value.trim();
  if (input === '') {
    alert("Please enter an answer.");
    return;
  }

  const user = parseInt(input);
  const feedback = document.getElementById("feedback");

  if (user === currentAnswer) {
    correctAnswers++;
    feedback.innerText = "✅ Correct!";
  } else {
    feedback.innerText = `❌ Incorrect. The correct answer was ${currentAnswer}.`;
  }

  questionCount++;
  if (questionCount < 3) {
    setTimeout(nextQuestion, 1500);
  } else {
    setTimeout(() => {
      const gained = correctAnswers * 10;
      playerEnergy += gained;
      updateUI();
      log(`You gained ${gained} energy from answering ${correctAnswers}/3 correctly.`);
      actionUsed = false;
      switchScreen("battleScreen");
      enableActionButtons(true);
    }, 2000);
  }
}

// === ACTIONS ===
function attack(type) {
  const now = Date.now();
  if (actionUsed) return log("You already acted this turn!");

  const cooldownTime = 5000;
  const attackData = {
    basic: { cost: 10, dmg: 20 },
    heal: { cost: 10, heal: 15 },
    spell: { cost: 20, dmg: 35 }
  };

  const data = attackData[type];
  if (playerEnergy < data.cost) return log("❌ Not enough energy!");
  if (now < attackCooldowns[type]) return log("❌ That move is on cooldown!");

  playerEnergy -= data.cost;
  if (data.dmg) enemyHp -= data.dmg;
  if (data.heal) playerHp = Math.min(100, playerHp + data.heal);
  attackCooldowns[type] = now + cooldownTime;

  updateUI();
  log(data.dmg ? `You dealt ${data.dmg} damage!` : `You healed for ${data.heal} HP!`);

  actionUsed = true;
  enableActionButtons(false);

  if (enemyHp <= 0) return setTimeout(() => alert("🎉 You win!"), 500);
  if (playerEnergy <= 0) {
    log("You're out of energy! Monster is attacking...");
    setTimeout(monsterAttack, 2000);
  } else {
    setTimeout(() => {
      startQuestionPhase();
    }, 2000);
  }
}

function monsterAttack() {
  const damage = Math.floor(Math.random() * 20) + 5;
  playerHp -= damage;
  updateUI();
  log(`👹 Monster attacked and dealt ${damage} damage!`);
  if (playerHp <= 0) {
    alert("💀 You lost!");
    goToBattle();
  } else {
    setTimeout(() => {
      startQuestionPhase();
    }, 1500);
  }
}
