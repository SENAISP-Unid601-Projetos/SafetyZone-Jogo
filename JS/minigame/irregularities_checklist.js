const sfx = {
  right: new Audio("./AUD/global/soundeffect_rightchoice.mp3"), // Acerto / Conserto
  wrong: new Audio("./AUD/global/soundeffect_wrongchoice.mp3"), // Erro na identificação
  taskDone: new Audio("./AUD/global/soundeffect_taskdone.mp3"), // Máquina completada
  victory: new Audio("./AUD/global/soundeffect_medalwin.mp3"),  // Vitória final
  gameOver: new Audio("./AUD/global/soundeffect_gameover.mp3")  // Derrota
};

// Ajuste de volumes (opcional)
sfx.right.volume = 0.6;
sfx.wrong.volume = 0.5;
sfx.taskDone.volume = 0.7;
sfx.victory.volume = 0.8;

// Elementos do DOM
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const victoryScreen = document.getElementById("victoryScreen");
const gameScreen = document.getElementById("gameScreen");
const loadingScreen = document.getElementById("loadingScreen");
const phaseTransitionScreen = document.getElementById("phaseTransitionScreen");

// Botões
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const backToMenuButton = document.getElementById("backToMenuButton");

const backgroundMusic = document.getElementById("backgroundMusic");
if (backgroundMusic) {
  backgroundMusic.volume = 0.25;
  backgroundMusic.play().catch(() => {});
}

// ===== Pause Menu System (mouse-driven) =====
const pauseMenu = document.getElementById("pauseMenu");
const pauseMenuItems = pauseMenu ? pauseMenu.querySelectorAll("li") : [];
let previousGameState = null;
if (pauseMenuItems.length) {
  pauseMenuItems.forEach((item, idx) => {
    item.addEventListener("click", () => executePauseMenuItem(idx));
    item.addEventListener("mouseenter", () => {
      pauseMenuItems.forEach((it) => it.classList.remove("selected"));
      item.classList.add("selected");
    });
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P" || e.key === "Escape") togglePauseMenu();
});

function togglePauseMenu() {
  if (!pauseMenu) return;
  if (gameState !== "paused") {
    previousGameState = gameState;
    gameState = "paused";
    pauseMenu.style.display = "flex";
    setTimeout(() => pauseMenu.classList.add("active"), 10);
  } else {
    pauseMenu.classList.remove("active");
    setTimeout(() => (pauseMenu.style.display = "none"), 400);
    gameState = previousGameState || "playing";
  }
}

function executePauseMenuItem(index) {
  const selectedId = pauseMenuItems[index] ? pauseMenuItems[index].id : null;
  switch (selectedId) {
    case "menuResume":
      togglePauseMenu();
      break;
    case "menuMainBtn":
      window.location.href = "lobby.html";
      break;
    default:
      break;
  }
}

// Elementos de Jogo
const gameArea = document.getElementById("gameArea");
const checklistItemsContainer = document.getElementById("checklistItems");
const overlayText = document.getElementById("overlayText");
const phaseDisplay = document.getElementById("phaseDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const gameOverTitle = document.getElementById("gameOverTitle");
const gameOverMessage = document.getElementById("gameOverMessage");

// Variáveis do Jogo
let gameState = "loading";
let currentScenarioIndex = 0;
let identifiedNrs = [];

// Variáveis do Sistema de Vidas
let maxLives = 5;
let currentLives = maxLives;
let bonusLives = 0;

// Variáveis do Cronômetro
let timerInterval;
const phaseTimeLimit = 120; // 2 minutos
let timeRemaining = phaseTimeLimit;

let currentPhase = 1;
const scenariosPerPhase = 5;

// CONFIGURAÇÃO DOS CENÁRIOS
// ATENÇÃO: Certifique-se que essas imagens existem na pasta IMG/cenario/
const allScenarios = [
  // === FASE 1 ===
  {
    imageSrc: "./IMG/minigame_3/map_irreg_kitchen.png",
    correctNrs: ["NR2", "NR9"],
    description: "Cozinha industrial mal cuidada, a ponto de afetar os trabalhadores.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_oldbuilding.png",
    correctNrs: ["NR2", "NR3", "NR9"],
    description: "Situação esporádica, porém perigosa ao trabalhador, que precisa adentrar uma área desconhecida sem aviso prévio.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_smoke.png",
    correctNrs: ["NR1", "NR2", "NR9"],
    description: "Maquinário apresenta defeito em cenário mal preparado para acidentes.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_bathroom.png",
    correctNrs: ["NR2", "NR9"],
    description: "Único banheiro disponível para ser usado em uma empresa.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_office.png",
    correctNrs: ["NR2", "NR6", "NR9"],
    description: "Escritório antigo, de forma que os recursos oferecidos causam dores nos trabalhadores.",
  },

  // === FASE 2 ===
  {
    imageSrc: "./IMG/minigame_3/map_irreg_construction.png",
    correctNrs: ["NR2", "NR3", "NR6", "NR8", "NR9"],
    description: "Apesar de planejada, tal obra não oferece todos os recursos necessários aos trabalhadores.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_dust.png",
    correctNrs: ["NR2", "NR7", "NR9"],
    description: "Local abafado e enclausurado, causando estresse e alergias.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_radioactive.png",
    correctNrs: ["NR2", "NR3", "NR4", "NR9"],
    description: "O trabalhador utiliza os equipamentos corretos, mas os mesmos só foram oferecidos após muitas reclamações. Sem tais equipamentos, quais seriam as condições que o trabalhador teria de encarar?",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_fire.png",
    correctNrs: ["NR1", "NR2", "NR3", "NR4", "NR9"],
    description: "Falta de planejamento e treinamento corretos geraram tal incêndio.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_electricity.png",
    correctNrs: ["NR1", "NR5", "NR6", "NR9"],
    description: "Encanamento hidráulico próximo a disjuntor de alta tensão. Cenário propício para acidentes.",
  },

  // === FASE 3 ===
  {
    imageSrc: "./IMG/minigame_3/map_irreg_mine.png",
    correctNrs: ["NR1", "NR2", "NR4", "NR7", "NR9"],
    description: "Dispostos de maneira incorreta, os equipamentos facilmente causam acidentes graves.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_furnace.png",
    correctNrs: ["NR1", "NR2", "NR4", "NR9"],
    description: "Esse cenário é rotineiro. A fábrica precisa oferecer melhores condições de trabalho para seus operários.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_machine.png",
    correctNrs: ["NR2", "NR3", "NR4", "NR9"],
    description: "Um vazamento inesperado pode ameaçar milhares de vidas. Quais condições facilitariam o mesmo.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_welding.png",
    correctNrs: ["NR2", "NR3", "NR4", "NR5", "NR9"],
    description: "Mesmo com treinamento e instruções, os trabalhadores são expostos a riscos por excesso de demanda.",
  },
  {
    imageSrc: "./IMG/minigame_3/map_irreg_electricians.png",
    correctNrs: ["NR2", "NR3", "NR4", "NR5", "NR9"],
    description: "Novamente, com demanda excessiva, trabalhadores acabam não utilizando EPIs e seguindo treinamentos corretamente.",
  },
];

const checklist = [
  {
    nr: "NR1",
    description:
      "Ausência de proteção contra incêndios (extintores, rotas de fuga, alarmes, etc.);",
  },
  {
    nr: "NR2",
    description:
      "Exposição a agentes insalubres (ruído, calor, poeira, produtos químicos, etc.);",
  },
  {
    nr: "NR3",
    description: "Execução de atividades perigosas sem proteção adequada;",
  },
  {
    nr: "NR4",
    description:
      "Manuseio incorreto de materiais inflamáveis, explosivos, corrosivos, tóxicos, e outros;",
  },
  {
    nr: "NR5",
    description:
      "Fiação exposta, podendo causar choque elétrico, queimaduras, incêndios, explosões, quedas, e outros;",
  },
  {
    nr: "NR6",
    description:
      "Falta de ergonomia no posto de trabalho (mobiliário inadequado, ritmo de trabalho excessivamente estressante, transporte de cargas sem suporte)",
  },
  {
    nr: "NR7",
    description:
      "Problemas de segurança em mineração (riscos de acidentes por desmoronamentos, quedas, explosões e incêndios, e exposição a agentes insalubres)",
  },
  { nr: "NR8", description: "Trabalho a céu aberto sem abrigo;" },
  {
    nr: "NR9",
    description:
      "Condições inseguras (desorganização, má iluminação, piso escorregadio/danificado, riscos de quedas, etc.).",
  },
];

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  preloadImages();
});

function preloadImages() {
  let imagesLoaded = 0;
  const totalImages = allScenarios.length;
  let imagesFailed = 0;

  if (totalImages === 0) {
    hideLoadingScreen();
    return;
  }

  allScenarios.forEach((scenario) => {
    const img = new Image();
    img.src = scenario.imageSrc;
    img.onload = () => checkLoad();
    img.onerror = () => {
      console.warn("Falha ao carregar imagem: " + scenario.imageSrc);
      imagesFailed++;
      checkLoad();
    };
  });

  function checkLoad() {
    imagesLoaded++;
    if (imagesLoaded >= totalImages) {
      // Pequeno delay para garantir visualização
      setTimeout(hideLoadingScreen, 500);
    }
  }
}

function hideLoadingScreen() {
  if (loadingScreen) loadingScreen.style.display = "none";
  showScreen("start");
}

function showScreen(screenName) {
  // Esconde tudo primeiro
  [
    startScreen,
    gameOverScreen,
    victoryScreen,
    gameScreen,
    phaseTransitionScreen,
  ].forEach((el) => {
    if (el) el.style.display = "none";
  });

  // Mostra a tela desejada
  if (screenName === "start" && startScreen) startScreen.style.display = "flex";
  else if (screenName === "playing" && gameScreen)
    gameScreen.style.display = "flex";
  else if (screenName === "game_over" && gameOverScreen)
    gameOverScreen.style.display = "flex";
  else if (screenName === "victory" && victoryScreen)
    victoryScreen.style.display = "flex";
  else if (screenName === "phase_transition" && phaseTransitionScreen)
    phaseTransitionScreen.style.display = "flex";
}

function startGame() {
  gameState = "playing";
  currentScenarioIndex = 0;
  currentLives = maxLives;
  currentPhase = 1;
  bonusLives = 0;

  showScreen("playing");
  renderScenario();
  renderHearts();
  startTimer();
  updatePhaseDisplay();
}

function renderScenario() {
  if (currentScenarioIndex >= allScenarios.length) {
    endGame("victory");
    return;
  }

  const currentScenario = allScenarios[currentScenarioIndex];

  // Define a imagem de fundo e garante que ela seja visível
  if (gameArea) {
    gameArea.style.backgroundImage = `url('${currentScenario.imageSrc}')`;
  }

  identifiedNrs = [];

  // Mostra a descrição do cenário de forma desenhada/visual para o player
  renderScenarioDescription(currentScenario);

  // Renderiza checklist
  if (checklistItemsContainer) {
    checklistItemsContainer.innerHTML = "";
    checklist.forEach((item) => {
      const button = document.createElement("button");
      button.className = "checklist-item";
      button.dataset.nr = item.nr;
      button.dataset.identified = "false";

      // Texto à esquerda
      const textSpan = document.createElement("span");
      textSpan.className = "check-text";
      textSpan.textContent = item.description;

      // Quadrado à direita
      const square = document.createElement("div");
      square.className = "check-square";

      const squareImg = document.createElement("img");
      squareImg.className = "square-img";
      squareImg.src = "./IMG/minigame_3/square.png";
      square.appendChild(squareImg);

      // Overlay do check (inicialmente oculto)
      const checkOverlay = document.createElement("img");
      checkOverlay.className = "check-overlay";
      checkOverlay.src = "./IMG/minigame_3/check.png";
      square.appendChild(checkOverlay);

      // Coloca o quadrado à esquerda e o texto à direita
      button.appendChild(square);
      button.appendChild(textSpan);

      button.onclick = () => handleChecklistClick(item.nr);
      checklistItemsContainer.appendChild(button);
    });
  }
}

// Cria/atualiza o cartão de descrição do cenário (visual) no gameArea
function renderScenarioDescription(scenario) {
  if (!gameArea || !scenario) return;

  let desc = document.getElementById("scenarioDescription");
  if (!desc) {
    desc = document.createElement("div");
    desc.id = "scenarioDescription";
    desc.style.position = "absolute";
    desc.style.left = "20px";
    desc.style.top = "20px";
    desc.style.maxWidth = "320px";
    desc.style.padding = "12px 14px";
    desc.style.background = "rgba(0,0,0,0.65)";
    desc.style.color = "#fff";
    desc.style.borderRadius = "10px";
    desc.style.boxShadow = "0 6px 18px rgba(0,0,0,0.6)";
    desc.style.fontFamily = "Inter, sans-serif";
    desc.style.zIndex = 30;
    desc.style.lineHeight = "1.2";

    const title = document.createElement("div");
    title.id = "scenarioDescriptionTitle";
    title.style.fontWeight = "700";
    title.style.marginBottom = "6px";
    title.style.fontSize = "16px";
    desc.appendChild(title);

    const body = document.createElement("div");
    body.id = "scenarioDescriptionBody";
    body.style.fontSize = "13px";
    desc.appendChild(body);

    const hint = document.createElement("div");
    hint.id = "scenarioDescriptionHint";
    hint.style.marginTop = "8px";
    hint.style.fontSize = "12px";
    hint.style.opacity = "0.85";
    hint.style.color = "#ffd";
    desc.appendChild(hint);

    gameArea.appendChild(desc);
  }

  const titleEl = document.getElementById("scenarioDescriptionTitle");
  const bodyEl = document.getElementById("scenarioDescriptionBody");
  const hintEl = document.getElementById("scenarioDescriptionHint");

  titleEl.textContent = scenario.name || "Cenário";
  bodyEl.textContent = scenario.description || "Observações do cenário.";
  // Dica com os NRs esperados (mostra em forma amigável, sem entregar tudo)
  if (Array.isArray(scenario.correctNrs) && scenario.correctNrs.length > 0) {
    hintEl.textContent = `Procure ${scenario.correctNrs.length} irregularidade(s). Clique na planilha à esquerda.`;
  } else {
    hintEl.textContent = "Nenhuma irregularidade esperada neste cenário.";
  }

  // animação simples: aparece com transição e some após alguns segundos
  desc.style.opacity = 0;
  desc.style.transition = "opacity 300ms ease";
  requestAnimationFrame(() => (desc.style.opacity = 1));

  // remove automaticamente após 5s
  if (desc._hideTimeout) clearTimeout(desc._hideTimeout);
  desc._hideTimeout = setTimeout(() => {
    desc.style.opacity = 0;
    setTimeout(() => {
      if (desc && desc.parentNode) desc.parentNode.removeChild(desc);
    }, 350);
  }, 5000);
}

function handleChecklistClick(nr) {
  const currentScenario = allScenarios[currentScenarioIndex];
  const button = document.querySelector(`[data-nr="${nr}"]`);

  if (!button || button.dataset.identified === "true") return;

  const squareEl = button.querySelector('.check-square');

  if (currentScenario.correctNrs.includes(nr)) {
    if (!identifiedNrs.includes(nr)) {
      sfx.right.currentTime = 0; // Reinicia o som se clicar rápido
      sfx.right.play();

      identifiedNrs.push(nr);
      showOverlayText("Correto!", true);

      // Marca visualmente apenas o square com o check overlay
      button.dataset.identified = "true";
      if (squareEl) squareEl.classList.add('checked');
    }

    if (identifiedNrs.length === currentScenario.correctNrs.length) {
      sfx.taskDone.play();
      // Cenário concluído
      setTimeout(() => {
        currentScenarioIndex++;
        checkPhaseTransition();
      }, 1500);
    }
  } else {
    sfx.wrong.currentTime = 0;
    sfx.wrong.play();

    currentLives--;
    renderHearts();
    showOverlayText("Incorreto! -1 Vida", false);

    // Animação de erro apenas no square (não muda todo o item)
    if (squareEl) {
      squareEl.classList.add('wrong');
      setTimeout(() => squareEl.classList.remove('wrong'), 700);
    }

    if (currentLives <= 0) {
      setTimeout(() => endGame("game_over"), 1000);
    }
  }
}

function checkPhaseTransition() {
  const totalScenarios = allScenarios.length;

  if (currentScenarioIndex < totalScenarios) {
    const nextPhase = Math.floor(currentScenarioIndex / scenariosPerPhase) + 1;

    if (nextPhase > currentPhase) {
      currentPhase = nextPhase;
      startNextPhase();
    } else {
      renderScenario();
    }
  } else {
    endGame("victory");
  }
}

function startNextPhase() {
  stopTimer();
  bonusLives = currentLives;
  currentLives = maxLives + bonusLives; // Bônus

  showScreen("phase_transition");

  setTimeout(() => {
    showScreen("playing");
    renderScenario();
    renderHearts();
    startTimer();
    updatePhaseDisplay();
    showOverlayText(`FASE ${currentPhase} INICIADA!`, true);
  }, 2000);
}

// --- Funções Auxiliares de UI ---

function renderHearts() {
  const heartsContainer = document.getElementById("hearts");
  if (!heartsContainer) return;

  heartsContainer.innerHTML = "";
  for (let i = 0; i < maxLives; i++) {
    const heart = document.createElement("img");
    heart.className = i < currentLives ? "heart-full" : "heart-empty";
    // Certifique-se que essas imagens existem
    heart.src =
      i < currentLives
        ? "./IMG/heart_full_single.png"
        : "./IMG/heart_empty.png";
    heartsContainer.appendChild(heart);
  }
}

function showOverlayText(message, isCorrect) {
  if (!overlayText) return;
  overlayText.textContent = message;
  overlayText.style.color = isCorrect ? "#48bb78" : "#e53e3e";
  overlayText.style.display = "block";
  setTimeout(() => {
    overlayText.style.display = "none";
  }, 2000);
}

function updatePhaseDisplay() {
  if (phaseDisplay) phaseDisplay.textContent = `${currentPhase}/3`;
}

// --- Timer ---

function startTimer() {
  stopTimer();
  timeRemaining = phaseTimeLimit;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      stopTimer();
      endGame("game_over", "time_out");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  if (!timerDisplay) return;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function endGame(outcome, reason) {
  stopTimer();
  if (outcome === "victory") {
    sfx.victory.play();
    showScreen("victory");
  } else {
    sfx.gameOver.play();
    if (gameOverTitle && gameOverMessage) {
      if (reason === "time_out") {
        gameOverTitle.textContent = "Tempo Esgotado!";
        gameOverMessage.textContent = "Você não terminou a tempo.";
      } else {
        gameOverTitle.textContent = "Fim de Jogo!";
        gameOverMessage.textContent = "Você perdeu todas as vidas!";
      }
    }
    showScreen("game_over");
  }
}

function restartGame() {
  window.location.reload();
}

// Event Listeners
if (startButton) startButton.onclick = startGame;
if (restartButton) restartButton.onclick = restartGame;
if (backToMenuButton)
  backToMenuButton.onclick = () => {
    // Salva progresso mergeando com dados existentes
    const currentProgress = JSON.parse(
      localStorage.getItem("safetyGameProgress") || "{}"
    );
    currentProgress["risk"] = true;
    localStorage.setItem("safetyGameProgress", JSON.stringify(currentProgress));
    window.location.href = "lobby.html";
  };
