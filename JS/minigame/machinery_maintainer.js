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
// =========================================================
// ARQUIVO: JS/minigame/machinery_maintainer.js
// =========================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos da UI
const hud = document.getElementById("hud");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const risksCounterEl = document.getElementById("risksCounter");
const victoryScreen = document.getElementById("victoryScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startScreen = document.getElementById("startScreen");
const loadingScreen = document.getElementById("loadingScreen");
const identificationScreen = document.getElementById("identificationScreen");
const optionsContainer = document.getElementById("optionsContainer");
const infoText = document.getElementById("infoText");
const taskDescription = document.getElementById("taskDescription");

// Telas e Botões Extras
const machineCompleteScreen = document.getElementById("machineCompleteScreen");
const machineCompleteMessage = document.getElementById(
  "machineCompleteMessage"
);
const continueButton = document.getElementById("continueButton");
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
    gameState = previousGameState || "start";
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

// Imagem de Fundo do Menu
const overviewBackgroundImage = new Image();
overviewBackgroundImage.src = "./IMG/minigame_2/bg_2mg.png";
// NOVO: Imagem de Marcador para Riscos Corrigidos
const fixedMarkerImage = new Image(); // <--- LINHA ADICIONADA
fixedMarkerImage.src = "./IMG/minigame_2/check_bigger.png"; // <--- Caminho para sua imagem de check

// --- Configurações do Jogo ---
const GAME_TIME = 120;
const SHOW_HITBOXES = true; // Mantenha TRUE para configurar as posições, depois mude para FALSE
const IDENTIFICATION_PENALTY = 10;
const VICTORY_THRESHOLD = 0.7;

// --- Variáveis de Estado ---
let gameState = "loading";
let currentTime = 0;
let risksFoundTotal = 0;
let totalRisksGame = 0;
let timerInterval;
let currentMachineIndex = null;

// =========================================================
// ESTRUTURA DE DADOS: ANTES (Damaged) e DEPOIS (Normal)
// =========================================================
const machinery = [
  {
    id: 0,
    name: "Torno Mecânico",
    // Imagens
    imgDamaged: new Image(),
    imgNormal: new Image(),
    imgBackground: new Image(), // <--- ADICIONE ESTA LINHA EM TODAS AS MÁQUINAS!
    srcDamaged: "./IMG/minigame_2/maq_torno_errado.png", // Imagem com os defeitos
    srcNormal: "./IMG/minigame_2/maq_torno_certa.png", // Imagem 100% consertada
    srcBackground: "./IMG/minigame_2/bg_2mg_zoom_torno.png", // NOVO: Crie este arquivo de fundo

    // Posição no Menu
    overviewX: 50,
    overviewY: 480,
    overviewW: 350,
    overviewH: 300,

    completed: false,
    identified: false,
    risksFixedCount: 0,
    // Apenas coordenadas e descrição (sem imagem individual)
    risks: [
      {
        id: "r1",
        description: "Fiação exposta no motor",
        x: 250,
        y: 350,
        w: 80,
        h: 80,
        fixed: false,
      },
      {
        id: "r2",
        description: "Vasamento de óleo lubrificador",
        x: 550,
        y: 400,
        w: 60,
        h: 60,
        fixed: false,
      },
      {
        id: "r3",
        description: "Contra ponta entortada",
        x: 930,
        y: 250,
        w: 50,
        h: 100,
        fixed: false,
      },
      {
        id: "r4",
        description: "Manipulo entortado ",
        x: 1400,
        y: 300,
        w: 50,
        h: 100,
        fixed: false,
      },
      {
        id: "r5",
        description: "Base rachada",
        x: 260,
        y: 730,
        w: 100,
        h: 100,
        fixed: false,
      },
    ],
  },
  {
    id: 1,
    name: "Prensa Hidráulica",
    imgDamaged: new Image(),
    imgNormal: new Image(),
    imgBackground: new Image(), // <--- ADICIONE ESTA LINHA EM TODAS AS MÁQUINAS!
    srcDamaged: "./IMG/minigame_2/maq_prensahidraulica_errado.png",
    srcNormal: "./IMG/minigame_2/maq_prensahidraulica_certa.png",
    srcBackground: "./IMG/minigame_2/bg_2mg_zoom_prensahidraulica.png", // NOVO: Crie este arquivo de fundo

    overviewX: 410,
    overviewY: 360,
    overviewW: 300,
    overviewH: 380,

    completed: false,
    identified: false,
    risksFixedCount: 0,
    risks: [
      {
        id: "r1",
        description: "Fiação exposta no motor",
        x: 600,
        y: 50,
        w: 120,
        h: 60,
        fixed: false,
      },
      {
        id: "r2",
        description: "Prato de pressão descolado",
        x: 580,
        y: 400,
        w: 400,
        h: 150,
        fixed: false,
      },
      {
        id: "r3",
        description: "Base rachada",
        x: 580,
        y: 600,
        w: 400,
        h: 70,
        fixed: false,
      },
      {
        id: "r4",
        description: "Vasamento de óleo",
        x: 330,
        y: 700,
        w: 150,
        h: 100,
        fixed: false,
      },
    ],
  },
  {
    id: 2,
    name: "Caldeira Industrial",
    imgDamaged: new Image(),
    imgNormal: new Image(),
    imgBackground: new Image(), // <--- ADICIONE ESTA LINHA EM TODAS AS MÁQUINAS!
    srcDamaged: "./IMG/minigame_2/maq_caldeira_errado.png",
    srcNormal: "./IMG/minigame_2/maq_caldeira_certa.png",
    srcBackground: "./IMG/minigame_2/bg_2mg_zoom_caldeira.png", // NOVO: Crie este arquivo de fundo

    overviewX: 750,
    overviewY: 380,
    overviewW: 330,
    overviewH: 400,

    completed: false,
    identified: false,
    risksFixedCount: 0,
    risks: [
      {
        id: "r1",
        description: "Válvula de saída de vapor quebrada",
        x: 350,
        y: 130,
        w: 120,
        h: 100,
        fixed: false,
      },
      {
        id: "r2",
        description: "manômetro desencaixado",
        x: 1180,
        y: 200,
        w: 160,
        h: 80,
        fixed: false,
      },
      {
        id: "r3",
        description: "Painel de comando com defeito",
        x: 420,
        y: 420,
        w: 250,
        h: 100,
        fixed: false,
      },
      {
        id: "r4",
        description: "Tubulação quebrada",
        x: 1200,
        y: 750,
        w: 300,
        h: 100,
        fixed: false,
      },
    ],
  },
  {
    id: 3,
    name: "Serra de Fita",
    imgDamaged: new Image(),
    imgNormal: new Image(),
    imgBackground: new Image(), // <--- ADICIONE ESTA LINHA EM TODAS AS MÁQUINAS!
    srcDamaged: "./IMG/minigame_2/maq_serradefita_errado.png", // Você precisa criar esta imagem
    srcNormal: "./IMG/minigame_2/maq_serradefita_certa.png",
    srcBackground: "./IMG/minigame_2/bg_2mg__zoom_serradefita.png", // NOVO: Crie este arquivo de fundo

    overviewX: 1130,
    overviewY: 440,
    overviewW: 300,
    overviewH: 380,

    completed: false,
    identified: false,
    risksFixedCount: 0,
    risks: [
      {
        id: "r1",
        description: "Lâmina exposta",
        x: 460,
        y: 80,
        w: 100,
        h: 50,
        fixed: false,
      },
      {
        id: "r2",
        description: "Volante polia superior rachado",
        x: 300,
        y: 160,
        w: 500,
        h: 200,
        fixed: false,
      },
      {
        id: "r3",
        description: "Estrutura danificada",
        x: 1100,
        y: 200,
        w: 120,
        h: 120,
        fixed: false,
      },
      {
        id: "r4",
        description: "Lamina entortada",
        x: 480,
        y: 400,
        w: 100,
        h: 200,
        fixed: false,
      },
      {
        id: "r5",
        description: "Base rachada",
        x: 1200,
        y: 800,
        w: 150,
        h: 150,
        fixed: false,
      },
    ],
  },
];

// --- Carregamento ---
function preloadImages() {
  let assetsToLoad = 0;
  let assetsLoaded = 0;

  assetsToLoad++; // Background menu
  assetsToLoad++; // NOVO: Checkmark image <--- Adicionado

  machinery.forEach((m) => {
    assetsToLoad += 2; // 1 Normal + 1 Damaged
    totalRisksGame += m.risks.length;
  });

  const checkLoad = () => {
    assetsLoaded++;
    if (assetsLoaded === assetsToLoad) {
      setTimeout(() => {
        if (loadingScreen) {
          loadingScreen.classList.add("hidden");
        }
        if (startScreen) {
          startScreen.classList.remove("hidden");
          startScreen.classList.add("flex");
        }
        resizeCanvas();
        // Marca que o jogo está pronto para iniciar; não desenha o canvas
        // aqui para evitar que o overview seja renderizado antes do clique em Start.
        gameState = "start";
      }, 500);
    }
  };

  // Carrega Imagens Globais
  overviewBackgroundImage.onload = checkLoad;
  overviewBackgroundImage.src = "./IMG/minigame_2/bg_2mg.png";

  // --- NOVO: Carrega Checkmark ---
  fixedMarkerImage.onload = checkLoad;
  fixedMarkerImage.onerror = () => {
    console.warn("Imagem do Checkmark (fixedMarkerImage) não encontrada.");
    checkLoad();
  };

  // Carrega Máquinas (o resto continua igual...)
  machinery.forEach((m) => {
    // Aumenta a contagem de assets para cada imagem de fundo
    assetsToLoad++; // <--- NOVO

    m.imgDamaged.src = m.srcDamaged;
    m.imgDamaged.onload = checkLoad;
    m.imgDamaged.onerror = () => {
      console.error("Erro img damaged:", m.name);
      checkLoad();
    };

    m.imgNormal.src = m.srcNormal;
    m.imgNormal.onload = checkLoad;
    m.imgNormal.onerror = () => {
      console.error("Erro img normal:", m.name);
      checkLoad();
    };

    // --- NOVO: Carrega Imagem de Fundo da Máquina ---
    m.imgBackground.src = m.srcBackground;
    m.imgBackground.onload = checkLoad;
    m.imgBackground.onerror = () => {
      console.warn(`Imagem de fundo da máquina ${m.name} não encontrada.`);
      checkLoad(); // Garante que o jogo carrega mesmo sem a imagem
    };
  });
}

function resizeCanvas() {
  if (canvas.width !== 1500 || canvas.height !== 900) {
    canvas.width = 1500;
    canvas.height = 900;
  }
  // Só redesenha o canvas quando estivermos em um estado de jogo ativo
  // (evita desenhar o overview antes do jogador clicar em START)
  if (["select_machine", "inspecting", "identifying"].includes(gameState)) draw();
}
window.addEventListener("resize", resizeCanvas);

// --- Lógica de Jogo ---
function startGame() {
  startScreen.classList.add("hidden");
  startScreen.classList.remove("flex");
  hud.classList.remove("hidden");
  hud.classList.add("flex");

  currentTime = GAME_TIME;
  risksFoundTotal = 0;
  gameState = "select_machine";

  machinery.forEach((m) => {
    m.completed = false;
    m.identified = false;
    m.risksFixedCount = 0;
    m.risks.forEach((r) => (r.fixed = false));
  });

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(gameTimer, 1000);
  updateHUD();
  draw();
}

function gameTimer() {
  if (gameState === "game_over" || gameState === "won") return;
  currentTime--;
  updateHUD();
  if (currentTime <= 0) checkEndGameCondition(true);
}

function updateHUD() {
  timerEl.textContent = ` Tempo: ${currentTime}`;
  const percentage =
    totalRisksGame > 0
      ? Math.floor((risksFoundTotal / totalRisksGame) * 100)
      : 0;
  scoreEl.textContent = ` Progresso: ${percentage}%`;
  risksCounterEl.textContent = ` Total: ${risksFoundTotal}/${totalRisksGame}`;

  if (currentTime <= 10)
    timerEl.classList.replace("text-cyan-300", "text-red-500");
  else timerEl.classList.replace("text-red-500", "text-cyan-300");
}

function draw() {
  ctx.fillStyle = "#1a202c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gameState === "select_machine") {
    drawOverviewScreen();
  } else if (gameState === "identifying" || gameState === "inspecting") {
    drawMachineDetail();
  }
}

function drawOverviewScreen() {
  infoText.classList.remove("hidden");
  infoText.classList.add("visible");
  infoText.textContent = "SELECIONE UM EQUIPAMENTO PARA INICIAR A MANUTENÇÃO";
  taskDescription.classList.add("hidden");
  taskDescription.classList.remove("visible");
  identificationScreen.classList.add("hidden");
  identificationScreen.classList.remove("flex");

  // Fundo da Fábrica
  if (
    overviewBackgroundImage.complete &&
    overviewBackgroundImage.naturalWidth !== 0
  ) {
    ctx.drawImage(overviewBackgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Título
  // Título agora é um elemento DOM para permitir estilização via CSS
  const titleEl = document.getElementById("factoryOverviewTitle");
  if (titleEl) {
    titleEl.textContent = "VISÃO GERAL DA FÁBRICA";
    titleEl.classList.remove("hidden");
  }

  // Desenha Cards das Máquinas
  machinery.forEach((m) => {
    // Lógica: Se completou, mostra a imgNormal, se não, mostra imgDamaged (ou Normal para ícone limpo)
    // Normalmente no menu mostramos a "Meta" (Normal)
    ctx.drawImage(
      m.imgNormal,
      m.overviewX,
      m.overviewY,
      m.overviewW,
      m.overviewH
    );

    if (!m.completed) {
      // Ícone de Alerta
      ctx.font = "40px Arial";
      ctx.fillStyle = "orange";
      ctx.fillText("", m.overviewX + m.overviewW - 30, m.overviewY + 40);
    }

    if (m.completed) {
      // Desenha apenas um ícone de check (imagem) quando a máquina estiver completa
      const iconSize = Math.min(m.overviewW, m.overviewH) * 0.6;
      const iconX = m.overviewX + (m.overviewW - iconSize) / 2;
      const iconY = m.overviewY + (m.overviewH - iconSize) / 2;

      if (fixedMarkerImage && fixedMarkerImage.complete && fixedMarkerImage.naturalWidth !== 0) {
        ctx.drawImage(fixedMarkerImage, iconX, iconY, iconSize, iconSize);
      } else {
        // Fallback: pequeno check em texto caso a imagem não carregue
        ctx.font = "bold 60px Arial";
        ctx.fillStyle = "#48bb78";
        ctx.textAlign = "center";
        ctx.fillText("✔", m.overviewX + m.overviewW / 2, m.overviewY + m.overviewH / 2 + 20);
      }
    }
  });
}

function drawMachineDetail() {
  const m = machinery[currentMachineIndex];
  // Esconde o título DOM quando estiver inspecionando uma máquina
  const titleEl = document.getElementById("factoryOverviewTitle");
  if (titleEl) titleEl.classList.add("hidden");
  // --- NOVO: Desenha a Imagem de Fundo ---
  if (m.imgBackground.complete && m.imgBackground.naturalWidth !== 0) {
    // 1. Define o filtro (Blur) antes de desenhar
    ctx.filter = "blur(10px)"; // <-- NOVO: Altere '5px' para o nível de desfoque desejado

    // 2. Desenha o fundo preenchendo o canvas (COM BLUR)
    ctx.drawImage(m.imgBackground, 0, 0, canvas.width, canvas.height);

    // 3. Reseta o filtro para que o resto do desenho (máquina, hitboxes, checks) não tenha blur
    ctx.filter = "none"; // <-- NOVO: Reseta o filtro
  } else {
    // Se a imagem de fundo não carregar, usa a cor sólida padrão
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  // ------------------------------------------

  // 1. Definição da Imagem a ser usada (Damaged para inspeção)
  const imageToDraw = m.completed ? m.imgNormal : m.imgDamaged;

  // --- CÁLCULO DA PROPORÇÃO (Aspect Ratio) ---
  let imgW = imageToDraw.naturalWidth;
  let imgH = imageToDraw.naturalHeight;

  // Se a imagem não carregou, usamos um fallback para evitar erros
  if (imgW === 0 || imgH === 0) {
    console.warn(
      `Imagem da máquina ${m.name} não carregada. Usando canvas inteiro.`
    );
    imgW = canvas.width;
    imgH = canvas.height;
  }

  // Relação de proporção do canvas (1500/900 = 1.666)
  const canvasRatio = canvas.width / canvas.height;

  // Relação de proporção da imagem (Largura / Altura)
  const imageRatio = imgW / imgH;

  let newW, newH, startX, startY;

  // Decide se o ajuste será pela altura ou largura
  if (imageRatio > canvasRatio) {
    // A imagem é mais 'larga' que o canvas, ajusta pela largura
    newW = canvas.width;
    newH = canvas.width / imageRatio;
    startX = 0;
    startY = (canvas.height - newH) / 2; // Centraliza verticalmente
  } else {
    // A imagem é mais 'alta' que o canvas, ajusta pela altura
    newH = canvas.height;
    newW = canvas.height * imageRatio;
    startX = (canvas.width - newW) / 2; // Centraliza horizontalmente
    startY = 0;
  }

  // 1. Desenha a Imagem da Máquina na nova proporção (Centralizada)
  ctx.drawImage(imageToDraw, startX, startY, newW, newH);

  // 2. Feedback de Riscos (Marcador de Imagem ou Hitbox)
  if (gameState === "inspecting" || gameState === "identifying") {
    // Calcula o fator de escala (para reposicionar os hitboxes)
    const scaleFactorX = newW / 1500; // 1500 é a largura base original
    const scaleFactorY = newH / 900; // 900 é a altura base original

    m.risks.forEach((risk) => {
      // Reposiciona as coordenadas do Hitbox com base na nova escala e posição inicial
      const scaledX = startX + risk.x * scaleFactorX;
      const scaledY = startY + risk.y * scaleFactorY;
      const scaledW = risk.w * scaleFactorX;
      const scaledH = risk.h * scaleFactorY;

      // --- Desenhar a Imagem de Check ---
      if (risk.fixed) {
        const iconSize = 100 * scaleFactorX; // Escala o tamanho do ícone também

        // Centraliza a imagem do check na área escalonada do defeito
        const iconX = scaledX + scaledW / 2 - iconSize / 2;
        const iconY = scaledY + scaledH / 2 - iconSize / 2;

        if (fixedMarkerImage.complete && fixedMarkerImage.naturalWidth !== 0) {
          ctx.drawImage(fixedMarkerImage, iconX, iconY, iconSize, iconSize);
        } else {
          // Fallback
          ctx.fillStyle = "#00ff00";
          ctx.font = `bold ${40 * scaleFactorX}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText(
            "✓",
            iconX + iconSize / 2,
            iconY + iconSize / 2 + 10 * scaleFactorY
          );
        }
      }
    });
  }

  // 3. UI e Textos
  if (gameState === "identifying") {
    infoText.textContent = "Identifique o equipamento no painel para começar.";
    infoText.classList.add("hidden");
    infoText.classList.remove("visible");
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (gameState === "inspecting") {
    infoText.classList.add("hidden");
    infoText.classList.remove("visible");
    updateTaskTable(m);

    // Nome da Máquina (sem fundo). Adiciona sombra para legibilidade
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#fbd38d";
    ctx.font = "bold 30px font_title2";
    ctx.textAlign = "center";
    ctx.fillText(m.name.toUpperCase(), canvas.width / 2, 40);
    ctx.shadowBlur = 0;
  }
}

// --- Função de Tabela (Bloco de Notas) ---
function updateTaskTable(machine) {
  // Mostra o bloco de notas apenas durante a inspeção
  if (gameState === "inspecting") {
    taskDescription.classList.remove("hidden");
    taskDescription.classList.add("visible");
  } else {
    taskDescription.classList.add("hidden");
    taskDescription.classList.remove("visible");
  }

  // Design: Bloco de Notas com classes CSS
  let html = `
    <div class="task-header">
      <h3>📋 Manutenção</h3>
      <p>${machine.name}</p>
    </div>

    <div class="task-items">
  `;

  machine.risks.forEach((r) => {
    const isFixed = r.fixed;
    const icon = isFixed ? "✓" : "☐";
    const itemClass = isFixed ? "task-item completed" : "task-item pending";

    html += `
      <div class="${itemClass}">
        <span class="task-icon">${icon}</span>
        <span class="task-description">${r.description}</span>
      </div>
    `;
  });

  html += `
    </div>

    <div class="task-footer">
      NR-12/13/14 • v2.0
    </div>
  `;

  taskDescription.innerHTML = html;
}

// --- Interação ---
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clickX = (e.clientX - rect.left) * scaleX;
  const clickY = (e.clientY - rect.top) * scaleY;

  if (gameState === "select_machine") {
    machinery.forEach((m, index) => {
      if (
        clickX >= m.overviewX &&
        clickX <= m.overviewX + m.overviewW &&
        clickY >= m.overviewY &&
        clickY <= m.overviewY + m.overviewH
      ) {
        if (!m.completed) enterMachine(index);
      }
    });
  } else if (gameState === "inspecting") {
    checkRiskClick(clickX, clickY);
  }
});

function enterMachine(index) {
  currentMachineIndex = index;
  const m = machinery[index];
  if (!m.identified) {
    gameState = "identifying";
    showIdentificationUI(m);
  } else {
    gameState = "inspecting";
  }
  draw();
}

function showIdentificationUI(machine) {
  optionsContainer.innerHTML = "";
  const allNames = machinery.map((ma) => ma.name);
  const fakeNames = [
    "Gerador Elétrico",
    "Compressor",
    "Esteira",
    "Robô Soldador",
  ];
  let options = [machine.name];
  while (options.length < 3) {
    let rand = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    if (!options.includes(rand) && !allNames.includes(rand)) options.push(rand);
  }
  options.sort(() => Math.random() - 0.5);

  options.forEach((name) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className =
      "w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 border-2 border-blue-400 shadow-md mb-2";
    btn.onclick = () => {
      if (name === machine.name) {
        sfx.right.play(); // <--- ADICIONE AQUI (ACERTOU O NOME)
        machine.identified = true;
        gameState = "inspecting";
        identificationScreen.classList.add("hidden");
        identificationScreen.classList.remove("flex");
        draw();
      } else {
        sfx.wrong.play(); // <--- ADICIONE AQUI (ERROU O NOME)
        currentTime = Math.max(0, currentTime - IDENTIFICATION_PENALTY);
        updateHUD();
        btn.classList.replace("bg-blue-600", "bg-red-600");
        btn.textContent = "❌ INCORRETO";
        setTimeout(() => {
          btn.classList.replace("bg-red-600", "bg-blue-600");
          btn.textContent = name;
        }, 800);
      }
    };
    optionsContainer.appendChild(btn);
  });
  identificationScreen.classList.remove("hidden");
  identificationScreen.classList.add("flex");
}

function checkRiskClick(clickX, clickY) {
  const m = machinery[currentMachineIndex];
  let somethingFixed = false;

  // --- NOVO: RECALCULA PROPORÇÃO DA IMAGEM ---
  const imageToDraw = m.completed ? m.imgNormal : m.imgDamaged;
  let imgW = imageToDraw.naturalWidth;
  let imgH = imageToDraw.naturalHeight;
  if (imgW === 0 || imgH === 0) {
    imgW = 1500;
    imgH = 900;
  } // Fallback

  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = imgW / imgH;

  let newW, newH, startX, startY;

  if (imageRatio > canvasRatio) {
    newW = canvas.width;
    newH = canvas.width / imageRatio;
    startX = 0;
    startY = (canvas.height - newH) / 2;
  } else {
    newH = canvas.height;
    newW = canvas.height * imageRatio;
    startX = (canvas.width - newW) / 2;
    startY = 0;
  }

  // Fatores de escala
  const scaleFactorX = newW / 1500;
  const scaleFactorY = newH / 900;
  // --- FIM DO RECALCULO ---

  m.risks.forEach((r) => {
    if (!r.fixed) {
      // Reposiciona o Hitbox (coordenadas escalonadas)
      const scaledX = startX + r.x * scaleFactorX;
      const scaledY = startY + r.y * scaleFactorY;
      const scaledW = r.w * scaleFactorX;
      const scaledH = r.h * scaleFactorY;

      // Verifica se o clique está dentro da nova área escalonada
      if (
        clickX >= scaledX &&
        clickX <= scaledX + scaledW &&
        clickY >= scaledY &&
        clickY <= scaledY + scaledH
      ) {
        sfx.right.play(); // <--- ADICIONE AQUI (CONSERTOU DEFEITO)
        r.fixed = true;
        m.risksFixedCount++;
        risksFoundTotal++;
        somethingFixed = true;
        // Não remova o updateHUD, ele atualiza a pontuação!
        updateHUD();
      }
    }
  });

  // NOVO TRECHO:
  if (somethingFixed) {
    if (m.risksFixedCount === m.risks.length) {
      sfx.taskDone.play(); // <--- ADICIONE AQUI (MÁQUINA 100% PRONTA)
      // ✅ NOVIDADE: Marca como COMPLETA AQUI para que drawMachineDetail use a imgNormal
      m.completed = true;
      draw(); // Redesenha com a imagem normal/corrigida
      // Pequeno atraso para o jogador ver a troca da imagem antes do modal
      setTimeout(() => {
        showMachineCompleteModal(m);

        // Se todas as máquinas estiverem completas, encerra automaticamente
        // após um pequeno atraso e salva o progresso.
        const allDone = machinery.every((ma) => ma.completed);
        if (allDone) {
          setTimeout(() => {
            const currentProgress = JSON.parse(
              localStorage.getItem("safetyGameProgress") || "{}"
            );
            currentProgress["machinery"] = true;
            localStorage.setItem(
              "safetyGameProgress",
              JSON.stringify(currentProgress)
            );
            checkEndGameCondition(false);
          }, 1200);
        }
      }, 600);
    } else {
      draw();
    }
  }
}

function showMachineCompleteModal(machine) {
  machineCompleteMessage.textContent = `Manutenção do equipamento "${machine.name}" finalizada com sucesso.`;
  // Garante que o modal fique acima de outros elementos e bloqueie a interação
  machineCompleteScreen.style.zIndex = 1200;
  machineCompleteScreen.classList.remove("hidden");
  machineCompleteScreen.classList.add("flex");
  // Define um estado específico para modal, caso outras rotinas precisem checar
  gameState = "machine_complete";
  // Tenta focar o botão continuar para melhor acessibilidade
  if (continueButton && typeof continueButton.focus === "function") {
    continueButton.focus();
  }
}

continueButton.onclick = () => {
  machineCompleteScreen.classList.add("hidden");
  machineCompleteScreen.classList.remove("flex");
  machinery[currentMachineIndex].completed = true;
  gameState = "select_machine";
  const allDone = machinery.every((ma) => ma.completed);
  if (allDone) checkEndGameCondition(false);
  else draw();
};

function checkEndGameCondition(timeIsUp) {
  clearInterval(timerInterval);
  hud.classList.add("hidden");
  hud.classList.remove("flex");
  infoText.classList.add("hidden");
  infoText.classList.remove("visible");
  taskDescription.classList.add("hidden");
  taskDescription.classList.remove("visible");

  const percentage = totalRisksGame > 0 ? risksFoundTotal / totalRisksGame : 0;
  const disp = Math.floor(percentage * 100);

  if (percentage >= VICTORY_THRESHOLD) {
    gameState = "won";
    sfx.victory.play(); // <--- ADICIONE AQUI (VITÓRIA / MEDALHA)
    victoryScreen.classList.remove("hidden");
    victoryScreen.classList.add("flex");
    document.getElementById(
      "finalPercentWon"
    ).textContent = `${disp}% de Eficiência`;
    document.getElementById("victoryMessage").textContent = timeIsUp
      ? "Tempo esgotado, mas meta atingida!"
      : "Excelente trabalho na manutenção!";
    // Salva automaticamente o progresso ao vencer
    try {
      const currentProgress = JSON.parse(
        localStorage.getItem("safetyGameProgress") || "{}"
      );
      currentProgress["machinery"] = true;
      localStorage.setItem("safetyGameProgress", JSON.stringify(currentProgress));
    } catch (err) {
      console.warn("Não foi possível salvar o progresso:", err);
    }
  } else {
    gameState = "game_over";
    sfx.gameOver.play(); // <--- ADICIONE AQUI (GAME OVER)
    gameOverScreen.classList.remove("hidden");
    gameOverScreen.classList.add("flex");
    document.getElementById(
      "finalPercentLost"
    ).textContent = `${disp}% Concluído`;
  }
}

startButton.onclick = startGame;
restartButton.onclick = () => window.location.reload();
backToMenuButton.onclick = () => {
  // 1. Recupera o save atual (ou cria um objeto vazio se não existir)
  const currentProgress = JSON.parse(
    localStorage.getItem("safetyGameProgress") || "{}"
  );

  // 2. Marca este minigame específico como concluído
  // O ID 'machinery' será usado no index para identificar este jogo
  currentProgress["machinery"] = true;

  // 3. Salva de volta no navegador
  localStorage.setItem("safetyGameProgress", JSON.stringify(currentProgress));

  // 4. Redireciona
  window.location.href = "lobby.html"; // Certifique-se que o caminho está correto para sua pasta
};

preloadImages();
