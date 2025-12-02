const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameMenu = document.getElementById("gameMenu");
const startGameBtn = document.getElementById("startGameBtn");
const menuTitle = document.getElementById("menuTitle");
const menuDescription = document.getElementById("menuDescription");

// ===== SISTEMA DE MENU DA LOGO =====
const logoMenu = document.getElementById("logo-menu");
const logoDropdownMenu = document.getElementById("logoDropdownMenu");
const commandsScreen = document.getElementById("commandsScreen");
const closeCommandsBtn = document.getElementById("closeCommandsBtn");
const aboutBtn = document.getElementById("aboutBtn");
const commandsBtn = document.getElementById("commandsBtn");
const creditsBtn = document.getElementById("creditsBtn");
const muteBtn = document.getElementById("muteBtn");
const menuOverlay = document.getElementById("menuOverlay");

// Estado do menu
let isMenuOpen = false;
let isMusicMuted = false;

// Sistema de áudio
let audioContext = null;
let currentAudioSource = null;

// Músicas do jogo (substitua pelas suas próprias URLs)
const musicTracks = {
  track1: "./MUSIC/tema_principal.mp3", // Substitua pelo caminho real
  track2: "./MUSIC/ambientacao.mp3", // Substitua pelo caminho real
  track3: "./MUSIC/aventura.mp3", // Substitua pelo caminho real
};

// Função para inicializar áudio
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Função para tocar música
function playMusic(trackId) {
  initAudio();

  // Para a música atual
  if (currentAudioSource) {
    currentAudioSource.stop();
  }

  // Se estiver mutado, não toca
  if (isMusicMuted) return;

  // Simulação de carregamento de música (substitua pelo carregamento real)
  console.log(`Tocando música: ${trackId}`);

  // Atualiza a UI
  document.querySelectorAll(".music-track").forEach((track) => {
    track.classList.remove("active");
  });
  document
    .querySelector(`.music-track[data-track="${trackId}"]`)
    .classList.add("active");

  // Aqui você implementaria o carregamento real do áudio
  // usando fetch() e decodeAudioData() como no exemplo anterior
}

// Alternar menu da logo com animação
logoMenu.addEventListener("click", (e) => {
  e.stopPropagation();
  isMenuOpen = !isMenuOpen;

  if (isMenuOpen) {
    logoDropdownMenu.classList.add("show");
    menuOverlay.style.display = "block";
    setTimeout(() => {
      menuOverlay.style.opacity = "1";
    }, 10);
  } else {
    closeMenu();
  }
});

// Fechar menu
function closeMenu() {
  isMenuOpen = false;
  logoDropdownMenu.classList.remove("show");
  menuOverlay.style.opacity = "0";
  setTimeout(() => {
    menuOverlay.style.display = "none";
  }, 300);
}

// Fechar menu ao clicar no overlay
menuOverlay.addEventListener("click", closeMenu);

// Botão Sobre
aboutBtn.addEventListener("click", () => {
  closeMenu();
  // Aqui você pode colocar o link para o site do jogo
  setTimeout(() => {
    window.location.href = "https://seusite.com/sobre"; // ALTERE AQUI
  }, 400);
});

// Botão Comandos
commandsBtn.addEventListener("click", () => {
  closeMenu();
  setTimeout(() => {
    commandsScreen.style.display = "block";
    menuOverlay.style.display = "block";
    setTimeout(() => {
      menuOverlay.style.opacity = "1";
    }, 10);
  }, 400);
});

// Fechar tela de comandos
closeCommandsBtn.addEventListener("click", () => {
  commandsScreen.style.display = "none";
  menuOverlay.style.opacity = "0";
  setTimeout(() => {
    menuOverlay.style.display = "none";
  }, 300);
});

// Botão Créditos
creditsBtn.addEventListener("click", () => {
  closeMenu();
  setTimeout(() => {
    // Aqui você pode colocar informações de créditos
    alert(
      "Créditos:\n\nDesenvolvido por: [Seu Nome/Equipe]\nDesign: [Nome do Designer]\nMúsicas: [Nome do Compositor]\n\n© 2024 Todos os direitos reservados."
    ); // ALTERE AQUI
  }, 400);
});

// Botão Mutar
muteBtn.addEventListener("click", () => {
  isMusicMuted = !isMusicMuted;

  if (isMusicMuted) {
    muteBtn.textContent = "🔊 Som";
    muteBtn.style.background = "linear-gradient(135deg, #28a745, #20c997)";
    if (currentAudioSource) {
      currentAudioSource.stop();
      currentAudioSource = null;
    }
  } else {
    muteBtn.textContent = "🔇 Mutar";
    muteBtn.style.background = "linear-gradient(135deg, #ff8c00, #ffa500)";
    // Toca a música ativa atual
    const activeTrack = document.querySelector(".music-track.active");
    if (activeTrack) {
      playMusic(activeTrack.dataset.track);
    }
  }
});

// Seleção de músicas
document.querySelectorAll(".music-track").forEach((track) => {
  track.addEventListener("click", () => {
    playMusic(track.dataset.track);
  });
});

// Inicia com a primeira música (após um clique do usuário, devido às políticas de autoplay)
document.addEventListener(
  "click",
  () => {
    initAudio();
    if (!currentAudioSource && !isMusicMuted) {
      playMusic("track1");
    }
  },
  { once: true }
);

// Fechar menu com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (commandsScreen.style.display === "block") {
      commandsScreen.style.display = "none";
      menuOverlay.style.opacity = "0";
      setTimeout(() => {
        menuOverlay.style.display = "none";
      }, 300);
    } else if (isMenuOpen) {
      closeMenu();
    }
  }
});

// Imagem de fundo (construção panorâmica)
const bgImg = new Image();
bgImg.src = "./IMG/bg_lobby.png";
let bgLoaded = false;
bgImg.onload = () => {
  bgLoaded = true;
};
bgImg.onerror = () => {
  console.error("Erro ao carregar a imagem de fundo.");
};

// Imagem do Jogador
const playerImg = new Image();
playerImg.src = "./IMG/spritesheet_worker_lobby_and_1stminigame.png";
let playerLoaded = false;
playerImg.onload = () => {
  playerLoaded = true;
};
playerImg.onerror = () => {
  console.error("Erro ao carregar o spritesheet do jogador.");
};

// Objeto do Personagem
let player = {
  // Tamanho de exibição no canvas
  w: 40,
  h: 60,

  // Propriedades de Movimento (Corrigido)
  initialSpeed: 7,
  currentSpeed: 3,
  maxSpeed: 7,
  accel: 0.5,

  // Propriedades do Sprite
  sW: 40, // LARGURA do frame na imagem (Suposição!)
  sH: 60, // ALTURA do frame na imagem (Suposição!)
  frameX: 0, // Frame atual da animação (0 a 3)
  frameY: 0, // Linha da spritesheet (0=Parado, 1=Esquerda, 2=Direita)
  frameCount: 0, // Contador para velocidade da animação
  animationSpeed: 6, // Mudar de frame a cada 6 loops
  isMoving: false,
};

// Estado do Jogo
let gameState = "playing";
let currentArea = null; // Armazena a área em que o jogador está

// Array com todas as áreas do jogo
const gameAreas = [
  {
    x: 2000,
    w: 250,
    h: 300,
    name: "Área de EPIs",
    minigame: "minigame_epis",
    page: "./jogo1.html",
  },
  {
    x: 4500,
    w: 250,
    h: 300,
    name: "Sinalização de Segurança",
    minigame: "minigame_sinalizacao",
    page: "./jogo2.html",
  },
  {
    x: 7000,
    w: 250,
    h: 300,
    name: "Análise de Risco",
    minigame: "minigame_risco",
    page: "./jogo3.html",
  },
  {
    x: 9500,
    w: 250,
    h: 300,
    name: "Primeiros Socorros",
    minigame: "minigame_socorros",
    page: "jogo4.html",
  },
  {
    x: 12000,
    w: 250,
    h: 300,
    name: "Área de Construção",
    minigame: "minigame_construcao",
    page: "jogo5.html",
  },
];

// Calcula o limite do mundo com base na última área e adiciona 200px de padding
const lastArea = gameAreas[gameAreas.length - 1];
const worldLimit = lastArea.x + lastArea.w + 200;

// Posição da "câmera" no mundo do jogo
let cameraX = 0;

// Controle
let keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === " " && gameState === "playing" && currentArea) {
    showMenu(currentArea);
  } else if (e.key === " " && gameState === "menu") {
    hideMenu();
  }
});
document.addEventListener("keyup", (e) => (keys[e.key] = false));

// Funções do Menu
function showMenu(area) {
  gameState = "menu";
  menuTitle.textContent = area.name;
  menuDescription.textContent = `Aprenda sobre ${area.name}! Clique para jogar.`;
  gameMenu.style.display = "block";
}

function hideMenu() {
  gameState = "playing";
  gameMenu.style.display = "none";
}

function startGame() {
  hideMenu();

  // Redireciona para a página do jogo correspondente
  if (currentArea && currentArea.page) {
    window.location.href = currentArea.page;
  } else {
    // Se não houver página, apenas exibe uma mensagem
    console.log(`Você clicou em uma área sem jogo ainda: ${currentArea.name}`);
  }
}

startGameBtn.addEventListener("click", startGame);

// Loop Principal do Jogo
function update() {
  if (gameState !== "playing") return;

  let isMoving = keys["d"] || keys["D"] || keys["a"] || keys["A"];
  player.isMoving = isMoving;

  if (isMoving) {
    if (player.currentSpeed < player.maxSpeed) {
      player.currentSpeed += player.accel;
    }
  } else {
    player.currentSpeed = player.initialSpeed;
  }

  // Move a câmera para a direita, mas com um limite
  if ((keys["d"] || keys["D"]) && cameraX < worldLimit) {
    cameraX += player.currentSpeed;
    player.frameY = 2; // Linha 3 (índice 2) = Direita
  }
  // Move a câmera para a esquerda, mas com um limite
  else if ((keys["a"] || keys["A"]) && cameraX > 0) {
    cameraX -= player.currentSpeed;
    player.frameY = 1; // Linha 2 (índice 1) = Esquerda
  } else {
    // Não está se movendo
    player.frameY = 0; // Linha 1 (índice 0) = Parado
  }

  // Lógica de Animação
  if (player.isMoving) {
    player.frameCount++;
    if (player.frameCount >= player.animationSpeed) {
      player.frameCount = 0;
      player.frameX = (player.frameX + 1) % 4; // 4 frames por linha
    }
  } else {
    player.frameX = 0; // Se parado, fica no primeiro frame
  }

  currentArea = null;
  let playerOnScreenX = canvas.width / 2;
  for (const area of gameAreas) {
    let areaOnScreenX = area.x - cameraX;
    if (
      playerOnScreenX + player.w / 2 > areaOnScreenX &&
      playerOnScreenX - player.w / 2 < areaOnScreenX + area.w
    ) {
      currentArea = area;
      break;
    }
  }
}

// Função de Desenho
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // LÓGICA DE REPETIÇÃO DO FUNDO
  if (bgLoaded) {
    // Variáveis necessárias para o cálculo
    let scale = canvas.height / bgImg.height;
    let drawWidth = bgImg.width * scale;
    let bgX = -cameraX * 0.5; // Efeito parallax

    // Lógica de repetição (tiling)
    let startX = bgX % drawWidth;

    // Corrige se o startX for positivo (movendo para a esquerda)
    if (startX > 0) {
      startX -= drawWidth;
    }

    // Loop para desenhar as imagens lado a lado
    for (let x = startX; x < canvas.width; x += drawWidth) {
      ctx.drawImage(bgImg, x, 0, drawWidth, canvas.height);
    }
  }

  // Desenha as áreas do jogo
  for (const area of gameAreas) {
    let areaOnScreenX = area.x - cameraX;
    let areaOnScreenY = canvas.height / 2 - area.h / 2;
    ctx.fillStyle = "#bdb76b";
    ctx.fillRect(areaOnScreenX, areaOnScreenY, area.w, area.h);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(areaOnScreenX, areaOnScreenY, area.w, area.h);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText(area.name, areaOnScreenX + area.w / 2, areaOnScreenY + 30);
  }

  // Texto de interação
  if (currentArea && gameState === "playing") {
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText(
      "Pressione ESPAÇO para entrar",
      canvas.width / 2,
      canvas.height / 2 - 100
    );
    ctx.fillText(
      "Pressione ESPAÇO para entrar",
      canvas.width / 2,
      canvas.height / 2 - 100
    );
  }

  // Desenha o player (sprite)
  let playerX = canvas.width / 2 - player.w / 2;
  let playerY = canvas.height / 2 - player.h / 2;

  if (playerLoaded) {
    ctx.drawImage(
      playerImg,
      player.frameX * player.sW, // sx (source x)
      player.frameY * player.sH, // sy (source y)
      player.sW, // sWidth (source width)
      player.sH, // sHeight (source height)
      playerX, // dx (destination x)
      playerY + 319, // dy (destination y)
      player.w, // dWidth (destination width)
      player.h // dHeight (destination height)
    );
  } else {
    // Fallback: desenha o retângulo azul se a imagem não carregou
    ctx.fillStyle = "#1976d2";
    ctx.fillRect(playerX, playerY, player.w, player.h);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(playerX, playerY, player.w, player.h);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Inicia o jogo
gameLoop();
