const sfx = {
  right: new Audio("./AUD/global/soundeffect_rightchoice.mp3"), // Acerto / Conserto
  wrong: new Audio("./AUD/global/soundeffect_wrongchoice.mp3"), // Erro na identificação
  taskDone: new Audio("./AUD/global/soundeffect_taskdone.mp3"), // Máquina completada
  victory: new Audio("./AUD/global/soundeffect_medalwin.mp3"), // Vitória final
  gameOver: new Audio("./AUD/global/soundeffect_gameover.mp3"), // Derrota
};

// Ajuste de volumes (opcional)
sfx.right.volume = 0.6;
sfx.wrong.volume = 0.5;
sfx.taskDone.volume = 0.7;
sfx.victory.volume = 0.8;

// Elementos do DOM
const loadingScreen = document.getElementById("loadingScreen");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const victoryScreen = document.getElementById("victoryScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const backToMenuButton = document.getElementById("backToMenuButton");
const epiItemsContainer = document.getElementById("epiItems");
const workerImage = document.getElementById("workerImage");
const workerDescription = document.getElementById("workerDescription");
const livesDisplay = document.getElementById("livesDisplay");
const levelDisplay = document.getElementById("levelDisplay");
const overlayText = document.getElementById("overlayText");
const gameOverMessage = document.getElementById("gameOverMessage");
const workerArea = document.getElementById("workerArea");
const epiOrderDisplay = document.getElementById("epiOrderDisplay");
const workerOverlays = document.getElementById("workerOverlays"); // Novo elemento

const backgroundMusic = document.getElementById("backgroundMusic");
if (backgroundMusic) {
  backgroundMusic.volume = 0.25;
  backgroundMusic.play().catch(() => {});
}

// Variáveis do Jogo
let gameState = "start";
let currentLevel = 0;
let currentWorkerIndex = 0;
let lives = 5;
const maxLives = 5;
let equippedEPIs = [];
let currentWorkerData = null;

// Definição de todos os EPIs disponíveis no "armário" (agora com imagens)
const allEPIs = [
  { name: "", id: "capacet", imageSrc: "./IMG/minigame_4/capacete.png" },
  { name: "", id: "oculos", imageSrc: "./IMG/minigame_4/oculos.png" },
  { name: "", id: "protetor_auditivo", imageSrc: "./IMG/minigame_4/protetorauricular.png" },
  { name: "", id: "mascara", imageSrc: "./IMG/minigame_4/mascara.png" },
  { name: "", id: "luvas", imageSrc: "./IMG/minigame_4/luvas.png" },
  { name: "", id: "calcado", imageSrc: "./IMG/minigame_4/calcadoseguranca.png" },
  { name: "", id: "cinto", imageSrc: "./IMG/minigame_4/cinto.png" },
  { name: "", id: "colete", imageSrc: "./IMG/minigame_4/colete.png" },
  { name: "", id: "protetor_facial", imageSrc: "./IMG/minigame_4/protetor_facial.png" },
  { name: "", id: "respirador_autonomo", imageSrc: "./IMG/minigame_4/respirador.png" },
  { name: "", id: "macacao", imageSrc: "./IMG/minigame_4/macacao.png" },
];

// -------------------------------------------------------------------------
// ⚠️ ATENÇÃO: EDITE OS CAMINHOS DAS IMAGENS AQUI ⚠️
// Mapeia o ID do EPI para a IMAGEM DE OVERLAY (que vai por cima do trabalhador)
// Os nomes dos arquivos são suposições! Altere para os seus nomes corretos.
// -------------------------------------------------------------------------
const epiOverlayPaths = {
  capacet: "./IMG/minigame_4/capacete_overlay.png",
  oculos: "./IMG/minigame_4/oculos_overlay.png",
  protetor_auditivo: "./IMG/minigame_4/protetorauricular_overlay.png",
  mascara: "./IMG/minigame_4/mascara_overlay.png",
  luvas: "./IMG/minigame_4/luvas_overlay.png",
  calcado: "./IMG/minigame_4/calcado_overlay.png",
  cinto: "./IMG/minigame_4/cinto_overlay.png",
  colete: "./IMG/minigame_4/colete_overlay.png",
  protetor_facial: "./IMG/minigame_4/protetor_facial_overlay.png",
  respirador_autonomo: "./IMG/minigame_4/respirador_overlay.png",
  macacao: "./IMG/minigame_4/macacao_overlay.png",
};

// Offsets por EPI para posicionamento fino dos overlays (valores em percentuais ou px)
// Ajuste os valores conforme necessário. Apenas 'colete' precisa de correção por enquanto.
const epiOverlayOffsets = {
  colete: { top: '17%', left: '18%', width: '65%', height: '65%' },
};

// --- Sistema antigo de combinações de imagens (REMOVIDO) ---
// const imageCombinations = { ... };
// function getWorkerImagePath(...) { ... };

// ===== Pause Menu System (mouse-driven) =====
const pauseMenu = document.getElementById("pauseMenu");
const pauseMenuItems = pauseMenu ? pauseMenu.querySelectorAll("li") : [];
console.log('pause init (industrial_dresscode):', pauseMenu, pauseMenuItems.length);
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
  if (e.key === "p" || e.key === "P" || e.key === "Escape") {
    togglePauseMenu();
  }
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

// Definição das fases (AGORA COM 5 TRABALHADORES POR FASE)
// NOTA: Eu copiei e colei os trabalhadores. Você deve editá-los!
// Definição das fases com profissões variadas
const gameLevels = [
  {
    name: "Fácil",
    // Foco: Riscos básicos e óbvios (3 EPIs em média)
    workers: [
      {
        workerType: "pedreiro",
        description:
          "Sou Pedreiro em obra aberta. Há risco de queda de materiais.",
        correctEPIs: ["capacet", "luvas", "calcado"],
        correctOrder: ["capacet", "luvas", "calcado"],
      },
      {
        workerType: "pintor",
        description:
          "Sou Pintor de interiores. A tinta solta cheiro forte e pode ser um problema em contato com a pele.",
        correctEPIs: ["oculos", "mascara", "luvas"],
        correctOrder: ["oculos", "mascara", "luvas"],
      },
      {
        workerType: "sinalizador",
        description:
          "Sou Controlador de Tráfego na pista. Preciso ser um destaque para eles.",
        correctEPIs: ["capacet", "colete", "calcado"],
        correctOrder: ["capacet", "colete", "calcado"],
      },
      {
        workerType: "carpinteiro",
        description:
          "Sou Carpinteiro lixando madeira. Há risco de lascas de madeira sair voando, contando com a poeira.",
        correctEPIs: ["oculos", "mascara", "luvas"],
        correctOrder: ["oculos", "mascara", "luvas"],
      },
      {
        workerType: "visitante",
        description:
          "Sou Engenheiro visitando a obra. Preciso do básico de segurança.",
        correctEPIs: ["capacet", "oculos", "calcado"],
        correctOrder: ["capacet", "oculos", "calcado"],
      },
    ],
  },
  {
    name: "Médio",
    // Foco: Riscos combinados (Ruído, Calor, Químicos - 4 a 5 EPIs)
    workers: [
      {
        workerType: "soldador",
        description: "Sou Soldador. Trabalho com faísca diretamente.",
        correctEPIs: [
          "protetor_facial",
          "mascara",
          "luvas",
          "macacao",
          "calcado",
        ], // Foco: Calor/Face
        correctOrder: [
          "protetor_facial",
          "mascara",
          "luvas",
          "macacao",
          "calcado",
        ],
      },
      {
        workerType: "quimico",
        description:
          "Manuseio Ácidos corrosivos no laboratório. Qualquer contato com qualquer parte do meu corpo pode causar grandes problemas.",
        correctEPIs: ["oculos", "mascara", "luvas", "macacao", "calcado"], // Foco: Químico
        correctOrder: ["oculos", "mascara", "luvas", "macacao", "calcado"],
      },
      {
        workerType: "britadeira",
        description:
          "Opero Britadeira no asfalto. As vezes pode voar pedras e o barulho é ensurdecedor.",
        correctEPIs: [
          "capacet",
          "protetor_auditivo",
          "oculos",
          "luvas",
          "calcado",
          "colete",
        ], // Foco: Ruído/Impacto
        correctOrder: [
          "capacet",
          "protetor_auditivo",
          "oculos",
          "luvas",
          "calcado",
          "colete",
        ],
      },
      {
        workerType: "eletricista",
        description:
          "Sou Eletricista Predial. Qualquer contato pode ser um grande problema, além da luz do curto-circuito.",
        correctEPIs: ["capacet", "oculos", "luvas", "calcado", "colete"],
        correctOrder: ["capacet", "oculos", "luvas", "calcado", "colete"],
      },
      {
        workerType: "motosserra",
        description:
          "Operador de Motosserra. Risco de corte, muito barulho e serragem voando no rosto.",
        correctEPIs: [
          "capacet",
          "protetor_facial",
          "protetor_auditivo",
          "luvas",
          "calcado",
        ], // Foco: Florestal
        correctOrder: [
          "capacet",
          "protetor_facial",
          "protetor_auditivo",
          "luvas",
          "calcado",
        ],
      },
    ],
  },
  {
    name: "Difícil",
    // Foco: Risco de vida iminente, Altura e Espaços Confinados (6+ EPIs ou itens complexos)
    workers: [
      {
        workerType: "tecnico_confinado",
        description:
          "Vou entrar em um Tanque Químico sem oxigênio. Risco de morte por asfixia e contato com pele.",
        correctEPIs: [
          "capacet",
          "respirador_autonomo",
          "macacao",
          "luvas",
          "calcado",
          "cinto",
        ], // Cinto para resgate
        correctOrder: [
          "capacet",
          "respirador_autonomo",
          "macacao",
          "luvas",
          "calcado",
          "cinto",
        ],
      },
      {
        workerType: "eletricista_altura",
        description:
          "Manutenção em Torre de Alta Tensão. Risco de queda fatal, choque elétrico e arco voltaico no rosto.",
        correctEPIs: [
          "capacet",
          "cinto",
          "luvas",
          "calcado",
          "protetor_facial",
          "macacao",
        ], // Macacão antichama
        correctOrder: [
          "capacet",
          "cinto",
          "luvas",
          "calcado",
          "protetor_facial",
          "macacao",
        ],
      },
      {
        workerType: "jateista",
        description:
          "Operador de Jateamento de Areia. A pressão é enorme, barulho alto e poeira extrema.",
        correctEPIs: [
          "macacao",
          "luvas",
          "calcado",
          "protetor_facial",
          "protetor_auditivo",
          "mascara",
        ],
        correctOrder: [
          "macacao",
          "luvas",
          "calcado",
          "protetor_facial",
          "protetor_auditivo",
          "mascara",
        ],
      },
      {
        workerType: "bombeiro_industrial",
        description:
          "Combate a Incêndio com fumaça tóxica. Preciso respirar de alguma forma.",
        correctEPIs: [
          "capacet",
          "respirador_autonomo",
          "macacao",
          "luvas",
          "calcado",
          "oculos",
        ],
        correctOrder: [
          "capacet",
          "respirador_autonomo",
          "macacao",
          "luvas",
          "calcado",
          "oculos",
        ],
      },
      {
        workerType: "montador_andaime",
        description:
          "Montagem de Andaime Suspenso. Risco altíssimo de queda, queda de ferramentas e muita exposição ao sol.",
        correctEPIs: [
          "capacet",
          "cinto",
          "oculos",
          "luvas",
          "calcado",
          "colete",
        ],
        correctOrder: [
          "capacet",
          "cinto",
          "oculos",
          "luvas",
          "calcado",
          "colete",
        ],
      },
    ],
  },
];

// --- Funções de Tela ---
function showScreen(screen) {
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";
  gameScreen.style.display = "none";

  if (screen === "start") startScreen.style.display = "flex";
  else if (screen === "playing") gameScreen.style.display = "flex";
  else if (screen === "game_over") gameOverScreen.style.display = "flex";
  else if (screen === "victory") victoryScreen.style.display = "flex";
}

function showOverlayText(message, isCorrect) {
  overlayText.textContent = message;
  overlayText.style.color = isCorrect ? "#48bb78" : "#e53e3e";
  overlayText.style.display = "block";
  setTimeout(() => (overlayText.style.display = "none"), 2000);
}

function updateLivesDisplay() {
  const heartsContainer = document.getElementById("livesDisplay");
  heartsContainer.innerHTML = "";

  for (let i = 0; i < maxLives; i++) {
    const heart = document.createElement("div");
    heart.className = `heart ${i < lives ? "full" : "empty"}`;
    heartsContainer.appendChild(heart);
  }

  if (lives <= 0) endGame("defeat");
}

function updateLevelDisplay() {
  // Não faz mais nada - removemos o display de nível
}

// ⚠️ MUDANÇA: Esta função agora apenas ESCONDE o elemento
function updateEPIOrderDisplay() {
  if (epiOrderDisplay) {
    // Verifica se o elemento existe (boa prática)
    epiOrderDisplay.style.display = "none";
  }
}

// --- Renderização dos EPIs como imagens ---
function renderEPIs() {
  epiItemsContainer.innerHTML = "";

  allEPIs.forEach((epi) => {
    const button = document.createElement("button");
    // Mantivemos suas classes originais
    button.className = `epi-item flex flex-col items-center justify-center bg-gray-800 rounded-xl p-2 hover:bg-gray-700 transition duration-200`;
    button.dataset.epiId = epi.id;
    button.draggable = true;

    const img = document.createElement("img");
    img.src = epi.imageSrc;
    img.alt = epi.name;
    // Importante: pointer-events-none garante que o arraste seja acionado pelo botão, não pela imagem isolada
    img.className = "w-16 h-16 object-contain mb-1 pointer-events-none";

    const label = document.createElement("span");
    label.textContent = epi.name;
    label.className = "text-xs text-white text-center pointer-events-none";

    button.appendChild(img);
    button.appendChild(label);

    if (equippedEPIs.includes(epi.id)) {
      button.classList.add("equipped");
      button.style.opacity = "0.5";
    }

    // --- A MÁGICA ACONTECE AQUI ---
    button.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", epi.id);

      // 1. Selecionamos a imagem dentro do botão
      const dragImage = button.querySelector("img");

      // 2. Definimos essa imagem como o "fantasma" que segue o mouse
      // Os valores 32, 32 são as coordenadas X e Y (metade de 64px) para centralizar o mouse na imagem
      if (dragImage) {
        e.dataTransfer.setDragImage(dragImage, 32, 32);
      }

      button.classList.add("is-dragging");
      button.style.opacity = "0.7";
    });

    button.addEventListener("dragend", () => {
      button.classList.remove("is-dragging");
      // Restaura a opacidade dependendo se já foi equipado ou não
      button.style.opacity = equippedEPIs.includes(epi.id) ? "0.5" : "1";
    });

    epiItemsContainer.appendChild(button);
  });
}

// --- Renderização do Trabalhador ---
function renderWorker() {
  currentWorkerData = gameLevels[currentLevel].workers[currentWorkerIndex];
  workerDescription.textContent = currentWorkerData.description;

  // --- LÓGICA ATUALIZADA ---
  // 1. Limpa os overlays de EPIs anteriores
  workerOverlays.innerHTML = "";

  // 2. Define a imagem BASE do trabalhador
  // ⚠️ ASSUMÇÃO: A imagem base é 'worker.png' dentro de 'minigame_4'
  // ⚠️ Se o caminho mudou, altere esta linha!
  workerImage.src = "./IMG/minigame_4/worker.png";

  // 3. Reseta os EPIs equipados
  equippedEPIs = [];

  // 4. Renderiza os botões de EPIs
  renderEPIs();

  // 5. Atualiza displays
  updateLivesDisplay();
  updateLevelDisplay();
  updateEPIOrderDisplay(); // ⚠️ Agora esta chamada vai ESCONDER o texto de ordem

  // Mostra a descrição no balão de fala acima da cabeça do trabalhador
  showSpeechBubble(currentWorkerData.description);
}

// Cria/atualiza um balão de fala posicionado na cabeça do worker
function showSpeechBubble(text) {
  if (!workerOverlays) return;

  // Remove balão anterior, se houver
  const existing = workerOverlays.querySelector('.speech-bubble');
  if (existing) existing.remove();

  // Caminho da imagem do balão (verifique o arquivo em IMG/minigame_4)
  const bubbleImgPath = './IMG/minigame_4/balloon.png';

  const container = document.createElement('div');
  container.className = 'speech-bubble';

  const img = document.createElement('img');
  img.src = bubbleImgPath;
  img.alt = 'balão de fala';

  const txt = document.createElement('div');
  txt.className = 'bubble-text';
  txt.textContent = text || '';

  container.appendChild(img);
  container.appendChild(txt);

  workerOverlays.appendChild(container);
}

// --- Função REMOVIDA ---
// function updateWorkerImage() { ... } (Não é mais necessária)

// --- NOVA FUNÇÃO: Adiciona um overlay de EPI ---
function addWorkerOverlay(epiId) {
  const path = epiOverlayPaths[epiId];
  if (!path) {
    console.error(`Caminho da imagem de overlay não encontrado para: ${epiId}`);
    return;
  }
  const img = document.createElement("img");
  img.src = path;
  img.className = "worker-overlay"; // Classe CSS para posicionar
  img.dataset.epiId = epiId;
  // Aplica offsets específicos se existirem (posicionamento fino)
  const offs = epiOverlayOffsets[epiId];
  if (offs) {
    if (offs.top) img.style.top = offs.top;
    if (offs.left) img.style.left = offs.left;
    if (offs.width) img.style.width = offs.width;
    if (offs.height) img.style.height = offs.height;
  } else {
    // padrão: ocupar todo o container
    img.style.top = '0';
    img.style.left = '0';
    img.style.width = '100%';
    img.style.height = '100%';
  }

  workerOverlays.appendChild(img);
}

// ⚠️ MUDANÇA: Lógica de verificação totalmente alterada
function checkEPI(epiId) {
  const currentWorkerData =
    gameLevels[currentLevel].workers[currentWorkerIndex];

  // Usamos a lista 'correctEPIs' para verificar, e não 'correctOrder'
  const correctEPIsList = currentWorkerData.correctEPIs;

  // Verificamos se o EPI arrastado está NA LISTA de EPIs corretos
  if (correctEPIsList.includes(epiId)) {
    // Se chegamos aqui, o 'drop' listener já confirmou que
    // este EPI não foi equipado ainda.
    sfx.right.currentTime = 0;
    sfx.right.play();

    equippedEPIs.push(epiId);
    const epiElement = document.querySelector(
      `.epi-item[data-epi-id="${epiId}"]`
    );
    if (epiElement) epiElement.classList.add("equipped");

    showOverlayText("EPI correto! Bem feito.", true);

    addWorkerOverlay(epiId);

    // A chamada para updateEPIOrderDisplay() foi removida daqui

    // Verificamos se a contagem de EPIs equipados é
    // igual à contagem de EPIs corretos necessários
    if (equippedEPIs.length === correctEPIsList.length) {
      setTimeout(() => {
        sfx.taskDone.play();
        showOverlayText("Trabalhador concluído!", true);
        setTimeout(() => advanceWorkerOrLevel(), 1800);
      }, 600);
    }
    return true;
  } else {
    sfx.wrong.currentTime = 0;
    sfx.wrong.play();
    // O EPI arrastado não está na lista de EPIs corretos
    lives--;
    updateLivesDisplay();
    showOverlayText("EPI incorreto! Perdeu uma vida.", false);
    return false;
  }
}

// --- Função ATUALIZADA com Animação ---
function advanceWorkerOrLevel() {
  // 1. Adiciona classe para "fade-out"
  workerArea.classList.add("is-transitioning");

  // 2. Espera a animação terminar (500ms)
  setTimeout(() => {
    currentWorkerIndex++;
    if (currentWorkerIndex < gameLevels[currentLevel].workers.length) {
      // 3. Renderiza o PRÓXIMO trabalhador (já "invisível")
      renderWorker();
    } else {
      // Avança de nível
      currentLevel++;
      if (currentLevel < gameLevels.length) {
        showOverlayText(
          `Fase ${currentLevel + 1} concluída! Próxima: ${
            gameLevels[currentLevel].name
          }`,
          true
        );
        setTimeout(() => {
          lives = maxLives;
          currentWorkerIndex = 0;
          renderWorker(); // Renderiza o primeiro da nova fase
        }, 2000); // Espera o texto sumir
      } else {
        endGame("victory");
      }
    }

    // 4. Remove a classe para "fade-in"
    workerArea.classList.remove("is-transitioning");
  }, 500); // Tempo deve bater com a transição do CSS
}

function startGame() {
  gameState = "playing";
  currentLevel = 0;
  currentWorkerIndex = 0;
  lives = maxLives;
  equippedEPIs = [];
  showScreen("playing");
  renderWorker();
}

function endGame(outcome) {
  gameState = outcome;
  if (outcome === "defeat") {
    sfx.gameOver.play();
    gameOverMessage.textContent = `O trabalhador precisava de ajuda urgente!`;
    showScreen("game_over");
  } else if (outcome === "victory") {
    sfx.victory.play();
    showScreen("victory");
  }
}

function restartGame() {
  // Soft restart: reset game variables and re-render without reloading
  currentLevel = 0;
  currentWorkerIndex = 0;
  lives = maxLives;
  equippedEPIs = [];
  gameState = "playing";
  showScreen("playing");
  renderWorker();
}

// --- Drag and Drop ---
workerArea.addEventListener("dragover", (e) => e.preventDefault());
workerArea.addEventListener("drop", (e) => {
  e.preventDefault();
  if (gameState !== "playing") return;
  const epiId = e.dataTransfer.getData("text/plain");
  if (equippedEPIs.includes(epiId)) {
    showOverlayText("EPI já equipado!", false);
    return;
  }
  checkEPI(epiId);
});

// --- Botões ---
startButton.onclick = startGame;
restartButton.onclick = restartGame;
backToMenuButton.onclick = () => {
  // 1. Recupera o save
  const currentProgress = JSON.parse(
    localStorage.getItem("safetyGameProgress") || "{}"
  );

  // 2. Marca o jogo 4 (firstaid) como feito
  currentProgress["firstaid"] = true;

  // 3. Salva
  localStorage.setItem("safetyGameProgress", JSON.stringify(currentProgress));

  // 4. Redireciona
  window.location.href = "lobby.html";
};

// Loading screen removed — provide safe no-op helpers and show start screen
function showLoadingScreen() {
  if (typeof loadingScreen !== "undefined" && loadingScreen) {
    loadingScreen.style.display = "flex";
    loadingScreen.style.opacity = "1";
    loadingScreen.style.backgroundColor = "#1a202c";
    loadingScreen.style.color = "white";
    loadingScreen.style.fontFamily = "'Inter', sans-serif";
    const spinner = loadingScreen.querySelector(".spinner");
    if (spinner) spinner.style.borderTopColor = "#f97316";
  }
}

function hideLoadingScreen() {
  // If loadingScreen exists, hide it. Otherwise simply show the start screen.
  if (typeof loadingScreen !== "undefined" && loadingScreen) {
    loadingScreen.style.display = "none";
  }
  showScreen("start");
}

// Immediately show the start screen when DOM is ready (no loading screen)
document.addEventListener("DOMContentLoaded", () => {
  showScreen("start");
});
