function askMultipleChoiceQuestion() {
  const question = "What is 6 x 7?";
  const choices = [36, 42, 48, 52];
  const correct = 42;

  let choiceStr = question + "\n";
  for (let i = 0; i < choices.length; i++) {
    choiceStr += `${i + 1}: ${choices[i]}\n`;
  }

  let answer = prompt(choiceStr);
  if (choices[parseInt(answer) - 1] === correct) {
    enemyHealth -= 20;
    document.getElementById("result").innerText = "Correct! You hit the enemy.";
  } else {
    playerHealth -= 15;
    document.getElementById("result").innerText = "Wrong! The enemy hit you.";
  }

  updateHealth();
  checkGameOver();
}
