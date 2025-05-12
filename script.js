// Global Variables
let playerHp = 100;
let playerEnergy = 0;
let enemyHp = 100;
let currentAnswer = 0;
let questionCount = 0;
let correctAnswers = 0;
let actionUsed = false;
let currentQuestionType = "input";  // Track question type
let attackCooldowns = {
  basic: 0,
  heal: 0,
  spell: 0
};

// Switch Screens
function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('visible'));
  document.getElementById(screenId).classList.add('visible');
}

// Start the Battle
function goToBattle() {
  resetBattle();
  startQuestionPhase();
}

// Reset Battle Stats
function resetBattle() {
  playerHp = 100;
  playerEnergy = 0;
  enemyHp = 100;
  updateUI();
  log('');
  enableActionButtons(false);
}

// Update UI
function updateUI() {
  document.getElementById("playerHp").innerText = playerHp;
  document.getElementById("enemyHp").innerText = enemyHp;
  document.getElementById("playerEnergy").innerText = playerEnergy;
}

// Log Battle Information
function log(msg) {
  const logElement = document.getElementById("battleLog");
  logElement.innerText = msg;

  // Apply classes for transitions
  if (msg.includes("Correct")) {
    logElement.classList.add('correct');
    setTimeout(() => logElement.classList.remove('correct'), 1000);
  } else if (msg.includes("Incorrect")) {
    logElement.classList.add('incorrect');
    setTimeout(() => logElement.classList.remove('incorrect'), 1000);
  } else if (msg.includes("energy")) {
    logElement.classList.add('energy');
    setTimeout(() => logElement.classList.remove('energy'), 1000);
  } else if (msg.includes("damage")) {
    logElement.classList.add('damage');
    setTimeout(() => logElement.classList.remove('damage'), 1000);
  } else if (msg.includes("heal")) {
    logElement.classList.add('heal');
    setTimeout(() => logElement.classList.remove('heal'), 1000);
  } else if (msg.includes("Monster")) {
    logElement.classList.add('monsterAttack');
    setTimeout(() => logElement.classList.remove('monsterAttack'), 1000);
  }
}

// Enable Action Buttons
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

// === QUESTION PHASE ===

// Start Question Phase
function startQuestionPhase() {
  questionCount = 0;
  correctAnswers = 0;
  switchScreen("questionScreen");
  nextQuestion();
}

// Generate and Show Next Question
function nextQuestion() {
  if (Math.random() > 0.5) {
    // Input question
    currentQuestionType = "input";
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    currentAnswer = a + b;
    document.getElementById("questionText").innerText = `What is ${a} + ${b}?`;
    document.getElementById("userAnswer").value = '';
    document.getElementById("feedback").innerText = '';
    document.getElementById("inputQuestion").style.display = "block";
    document.getElementById("mcQuestion").style.display = "none";
  } else {
    // Multiple choice question
    currentQuestionType = "mc";
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    currentAnswer = a + b;
    const options = [currentAnswer, currentAnswer + 1, currentAnswer - 1, currentAnswer + 2];
    shuffle(options);
    document.getElementById("questionText").innerText = `What is ${a} + ${b}?`;
    document.getElementById("mcOptions").innerText = `Choose the correct answer:`;
    document.getElementById("inputQuestion").style.display = "none";
    document.getElementById("mcQuestion").style.display = "block";

    // Set multiple choice options
    document.querySelectorAll("#mcQuestion button").forEach((btn, idx) => {
      btn.innerText = options[idx];
      btn.onclick = () => submitMCAnswer(options[idx]);
    });
  }
}

// Submit Answer for Input Question
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

// Submit Answer for Multiple Choice Question
function submitMCAnswer(selected) {
  if (selected === currentAnswer) {
    correctAnswers++;
    log("✅ Correct!");
  } else {
    log(`❌ Incorrect. The correct answer was ${currentAnswer}.`);
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

// Shuffle Multiple Choice Options
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// === ACTION PHASE ===

// Perform Action (Attack, Heal, Spell)
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
  
  // Monster attacks back
  setTimeout(monsterAttack, 2000);
}

// Monster Attacks
function monsterAttack() {
  if (playerEnergy === 0) {
    log("👹 Monster attacks!");
    const damage = Math.floor(Math.random() * 20) + 5;
    playerHp -= damage;
    updateUI();
    log(`👹 Monster dealt ${damage} damage!`);

    if (playerHp <= 0) {
      alert("💀 You lost!");
      goToBattle();
    } else {
      setTimeout(() => {
        startQuestionPhase();
      }, 1500);
    }
  }
}
