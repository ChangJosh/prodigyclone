        logElement.classList.remove('monsterAttack');
    }, 1000);
}

function nextQuestion() {
    questionCount = 0;
    correctAnswers = 0;

    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    currentAnswer = num1 + num2;

    const isMC = Math.random() > 0.5;

    document.getElementById("questionText").innerText = `What is ${num1} + ${num2}?`;

    if (isMC) {
        const options = shuffle([currentAnswer, currentAnswer + 1, currentAnswer - 1, currentAnswer + 2]);
        document.getElementById("mcOptions").innerHTML = '';
        options.forEach(option => {
            const btn = document.createElement("button");
            btn.innerText = option;
            btn.onclick = () => submitMCAnswer(option);
            document.getElementById("mcOptions").appendChild(btn);
        });
        document.getElementById("inputQuestion").style.display = "none";
        document.getElementById("mcQuestion").style.display = "block";
    } else {
        document.getElementById("userAnswer").value = '';
        document.getElementById("inputQuestion").style.display = "block";
        document.getElementById("mcQuestion").style.display = "none";
    }

    document.getElementById("feedback").innerText = '';
}

function submitAnswer() {
    const input = document.getElementById("userAnswer").value.trim();
    if (input === '') {
        alert("Please enter a number.");
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

        // If energy is still 0, monster attacks immediately
        if (playerEnergy === 0) {
            setTimeout(monsterAttack, 1000);
            setTimeout(() => {
                switchScreen("questionScreen");
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
    let logMsg = "";

    if (data.dmg) {
        enemyHp = Math.max(0, enemyHp - data.dmg);
        logMsg = `You dealt ${data.dmg} damage!`;
    } else if (data.heal) {
        playerHp = Math.min(100, playerHp + data.heal);
        logMsg = `You healed ${data.heal} HP!`;
    }

    updateUI();
    log(logMsg);
    actionUsed = true;
    enableActionButtons(false);

    if (enemyHp <= 0) {
        log("🎉 You win!");
        return setTimeout(() => resetBattle(), 2000);
    }

    setTimeout(() => {
        monsterAttack();
        setTimeout(() => {
            switchScreen("questionScreen");
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
        setTimeout(() => resetBattle(), 2000);
    }
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}
