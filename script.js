let playerHp = 100;
let playerEnergy = 0;
let enemyHp = 100;
let currentAnswer = 0;
let questionCount = 0;
let correctAnswers = 0;
let actionUsed = false;
let num1 = 0;
let num2 = 0;

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('visible'));
    document.getElementById(screenId).classList.add('visible');
}

function startGame() {
    switchScreen('questionScreen');
    nextQuestion();
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
    const logElement = document.getElementById("battleLog");
    logElement.innerText = msg;

    logElement.className = ''; // Reset classes
    if (msg.includes("Correct")) logElement.classList.add('correct');
    else if (msg.includes("Incorrect")) logElement.classList.add('incorrect');
    else if (msg.includes("energy")) logElement.classList.add('energy');
    else if (msg.includes("damage")) logElement.classList.add('damage');
    else if (msg.includes("heal")) logElement.classList.add('heal');
    else if (msg.includes("Monster")) logElement.classList.add('monsterAttack');
}

function enableActionButtons(enable) {
    ["attackBtn", "healBtn", "spellBtn"].forEach(id => {
        const btn = document.getElementById(id);
        btn.disabled = !enable;
        btn.classList.toggle("disabled", !enable);
    });
}

function nextQuestion() {
    if (questionCount === 0) correctAnswers = 0;

    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    currentAnswer = num1 + num2;

    const isMC = Math.random() > 0.5;

    document.getElementById("questionText").innerText = `What is ${num1} + ${num2}?`;
    document.getElementById("feedback").innerText = '';

    if (isMC) {
        const options = shuffle([currentAnswer, currentAnswer + 1, currentAnswer - 1, currentAnswer + 2]);
        const mcOptions = document.getElementById("mcOptions");
        mcOptions.innerHTML = '';
        options.forEach(option => {
            const btn = document.createElement("button");
            btn.innerText = option;
            btn.onclick = () => submitMCAnswer(option);
            mcOptions.appendChild(btn);
        });
        document.getElementById("inputQuestion").style.display = "none";
        document.getElementById("mcQuestion").style.display = "block";
    } else {
        document.getElementById("userAnswer").value = '';
        document.getElementById("inputQuestion").style.display = "block";
        document.getElementById("mcQuestion").style.display = "none";
    }
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
        feedback.className = 'correct';
    } else {
        feedback.innerText = `❌ Incorrect. Correct answer: ${currentAnswer}`;
        feedback.className = 'incorrect';
    }

    questionCount++;
    setTimeout(checkQuestionProgress, 1500);
}

function submitMCAnswer(selected) {
    const feedback = document.getElementById("feedback");

    if (selected === currentAnswer) {
        correctAnswers++;
        feedback.innerText = "✅ Correct!";
        feedback.className = 'correct';
    } else {
        feedback.innerText = `❌ Incorrect. Correct answer: ${currentAnswer}`;
        feedback.className = 'incorrect';
    }

    questionCount++;
    setTimeout(checkQuestionProgress, 1500);
}

function checkQuestionProgress() {
    if (questionCount >= 3) {
        const gained = correctAnswers * 10;
        playerEnergy += gained;
        updateUI();
        log(`You gained ${gained} energy from ${correctAnswers} correct answers.`);
        actionUsed = false;
        switchScreen("battleScreen");
        enableActionButtons(true);

        if (playerEnergy === 0) {
            setTimeout(monsterAttack, 1000);
            setTimeout(() => {
                switchScreen("questionScreen");
                questionCount = 0;
                nextQuestion();
            }, 2500);
        }
    } else {
        nextQuestion();
    }
}

function attack(type) {
    if (actionUsed) return log("❌ You already used an action!");

    const attackData = {
        basic: { cost: 10, dmg: 20 },
        heal: { cost: 10, heal: 15 },
        spell: { cost: 20, dmg: 35 }
    };

    const data = attackData[type];
    if (playerEnergy < data.cost) return log("❌ Not enough energy!");

    playerEnergy -= data.cost;
    let msg = "";

    if (data.dmg) {
        enemyHp = Math.max(0, enemyHp - data.dmg);
        msg = `You dealt ${data.dmg} damage!`;
    } else if (data.heal) {
        playerHp = Math.min(100, playerHp + data.heal);
        msg = `You healed ${data.heal} HP!`;
    }

    updateUI();
    log(msg);
    actionUsed = true;
    enableActionButtons(false);

    if (enemyHp <= 0) {
        log("🎉 You win!");
        setTimeout(resetBattle, 2000);
        return;
    }

    setTimeout(() => {
        monsterAttack();
        setTimeout(() => {
            switchScreen("questionScreen");
            questionCount = 0;
            nextQuestion();
        }, 2000);
    }, 2000);
}

function monsterAttack() {
    const dmg = Math.floor(Math.random() * 10) + 10;
    playerHp = Math.max(0, playerHp - dmg);
    updateUI();
    log(`👹 Monster dealt ${dmg} damage!`);

    if (playerHp <= 0) {
        log("💀 You lost! Resetting...");
        setTimeout(resetBattle, 2000);
    }
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
