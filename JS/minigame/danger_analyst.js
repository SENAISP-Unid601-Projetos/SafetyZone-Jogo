// --- ADICIONE ISTO: CARREGAMENTO DOS EFEITOS SONOROS ---
const sfx = {
  steps: new Audio("./AUD/global/soundeffect_steps1mg.m4a"),
  right: new Audio("./AUD/global/soundeffect_rightchoice.mp3"),
  wrong: new Audio("./AUD/global/soundeffect_wrongchoice.mp3"),
  taskDone: new Audio("./AUD/global/soundeffect_taskdone.mp3"),
  victory: new Audio("./AUD/global/soundeffect_medalwin.mp3"),
  gameOver: new Audio("./AUD/global/soundeffect_gameover.mp3"),
  endGame: new Audio("./AUD/global/soundeffect_endgame.mp3"), // Se for diferente do gameover
};

// Configura o som de passos para repetir
sfx.steps.loop = true;
sfx.steps.volume = 0.6;
// -------------------------------------------------------
/* -------------------------------------------------------------------------- */
/* Image Preloader System                           */
/* -------------------------------------------------------------------------- */

function createFallbackImage(color, text = "") {
  const canvas = document.createElement("canvas");
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, TILE_SIZE, TILE_SIZE);

  if (text) {
    ctx.fillStyle = "#FFF";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, TILE_SIZE / 2, TILE_SIZE / 2);
  }
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

function loadImages(callback) {
  const keys = Object.keys(imageSources);
  let loadedCount = 0;
  let errorCount = 0;

  if (keys.length === 0) {
    callback();
    return;
  }

  keys.forEach((key) => {
    const img = new Image();
    img.src = imageSources[key];

    img.onload = () => {
      loadedCount++;
      // image loaded (debug logs removed)
      images[key] = img;

      if (loadedCount + errorCount === keys.length) {
        // image preloading completed (debug log removed)
        callback();
      }
    };

    img.onerror = () => {
      errorCount++;
      // failed to load image (debug logs removed)

      // Cria fallback baseado no tipo de tile
      let fallbackColor = "#666";
      let fallbackText = key;
      if (key === "tile2") {
        fallbackColor = "#555";
        fallbackText = "PAREDE";
      }
      if (key === "tile3") {
        fallbackColor = "#8B4513";
        fallbackText = "PORTA";
      }
      if (key === "task_tile") {
        fallbackColor = "#FF9900";
        fallbackText = "TASK";
      }

      images[key] = createFallbackImage(fallbackColor, fallbackText);

      if (loadedCount + errorCount === keys.length) {
        // image preloading summary (debug logs removed)
        callback();
      }
    };
  });
}

/* -------------------------------------------------------------------------- */

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const tasksCounter = document.getElementById("tasksCounter");
const victoryScreen = document.getElementById("victoryScreen");
const taskContainer = document.getElementById("taskContainer");

// Elementos da tela de carregamento e do conteúdo principal
const loadingScreen = document.getElementById("loadingScreen");
const gameContent = document.getElementById("gameContent");

const backgroundMusic = document.getElementById("backgroundMusic");
if (backgroundMusic) {
  backgroundMusic.volume = 0.3; // Define um volume mais baixo (30%)
}

const musicPlaylist = [
  { src: "MUTED", name: "Mutado" },
  { src: "SND/Pix - Lava monsters.mp3", name: "Welcome Space Traveler" },
  { src: "SND/Big Helmet.mp3", name: "Big Helmet" },
  { src: "SND/No Worries.mp3", name: "No Worries" },
  { src: "SND/No Destination.mp3", name: "No Destination" },
  { src: "SND/A Lonely Cherry Tree 🌸.mp3", name: "A Lonely Cherry Tree" },
  { src: "SND/Pix - Lava monsters.mp3", name: "Pix - Lava monsters" },
];

let currentMusicIndex = 1;

// Elementos para cada tarefa
const dragAndDropTask = document.getElementById("dragAndDropTask");
let dragItemsContainer = document.getElementById("dragItemsContainer");
let dropTargetsContainer = document.getElementById("dropTargetsContainer");
const dragDropCompleteBtn = document.getElementById("dragDropCompleteBtn");

const orderTask = document.getElementById("orderTask");
const orderStepsContainer = document.getElementById("orderStepsContainer");
const orderCompleteBtn = document.getElementById("orderCompleteBtn");

const fastActionTask = document.getElementById("fastActionTask");
const fastActionBtn = document.getElementById("fastActionBtn");
const fastActionMessage = document.getElementById("fastActionMessage");
const fastActionCompleteBtn = document.getElementById("fastActionCompleteBtn");

// Novos elementos do menu de pausa
const pauseMenu = document.getElementById("pauseMenu");
const menuOptions = document
  .getElementById("menuOptions")
  .querySelectorAll("li");
const musicNameEl = document.getElementById("musicName");

// Tile types used in collision checks
const TILE_TYPES = {
  tile0: 0, //floor
  tile1: 1, //
  tile2: 2, //
  tile3: 3, //
};

// Use the single authoritative tileMap and TILE_SIZE exposed by `bg_matriz_map.js`.
// If for any reason those aren't set yet, fall back to reasonable defaults.
let TILE_SIZE =
  typeof window !== "undefined" && window.TILE_SIZE ? window.TILE_SIZE : 32;
let tileMap =
  typeof window !== "undefined" && window.tileMap ? window.tileMap : [];

let mapWidth =
  tileMap[0] && tileMap[0].length ? tileMap[0].length * TILE_SIZE : 0;
let mapHeight = tileMap.length ? tileMap.length * TILE_SIZE : 0;

// Image preloader collections (may be populated later)
let imageSources = {};
const images = {};

// Definição de todos os EPIs disponíveis com imagens
const allEPIs = [
  { name: "Capacete de segurança", id: "capacete", imageSrc: "./IMG/minigame_4/capacete.png" },
  { name: "Cinto", id: "cinto", imageSrc: "./IMG/minigame_4/cinto.png" },
  { name: "Colete", id: "colete", imageSrc: "./IMG/minigame_4/colete.png" },
  { name: "Luvas", id: "luvas", imageSrc: "./IMG/minigame_4/luvas.png" },
  { name: "Macacão", id: "macacao", imageSrc: "./IMG/minigame_4/macacao.png" },
  { name: "Óculos de proteção", id: "oculos", imageSrc: "./IMG/minigame_4/oculos.png" },
  { name: "Sapatos de proteção", id: "calcado", imageSrc: "./IMG/minigame_4/calcadoseguranca.png" },
  // EPIs adicionados para a Task: Respirador, Escudo, Máscara, Protetor auditivo
];

// Popula imageSources com os EPIs
allEPIs.forEach(epi => {
  imageSources[epi.id] = epi.imageSrc;
});

// Imagens de tiles para indicar tarefas pendentes/concluídas
imageSources['tile_floor_task'] = './IMG/minigame_1/tiles/tile_floor_task.png';
imageSources['tile_floor_task_done'] = './IMG/minigame_1/tiles/tile_floor_task_done.png';

// Inicializa o renderizador de tiles baseado em MinigameMap (se a classe estiver disponível)
try {
  if (typeof MinigameMap !== "undefined") {
    window.minigameMap = new MinigameMap(canvas, ctx);
    // MinigameMap initialized (debug log removed)
  }
  } catch (err) {
    // MinigameMap initialization failed (debug log removed)
}

// If MinigameMap was created, adopt its tile size and map for collisions/rendering
if (window.minigameMap) {
  try {
    TILE_SIZE = window.minigameMap.tileSize || TILE_SIZE;
    if (Array.isArray(window.minigameMap.map)) {
      tileMap = window.minigameMap.map;
    }
    mapWidth = tileMap[0].length * TILE_SIZE;
    mapHeight = tileMap.length * TILE_SIZE;
    // Synchronized MinigameMap values (debug log removed)
    } catch (e) {
    // MinigameMap sync error (debug log removed)
  }
}

//Sprite do jogador
const playerSprite = new PlayerSprite();
let lastTime = 0;

// Variáveis do Jogo
let gameState = "playing";
let player = { x: 1020, y: 1900, w: 40, h: 60, speed: 5 };
const world = { width: mapWidth, height: mapHeight };

// ======= SISTEMA DE SALAS E PORTAS =======
const rooms = [
  {
    id: "sala_maquinas",
    x: 5 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    width: (33 - 5 + 1) * TILE_SIZE,
    height: (28 - 7 + 1) * TILE_SIZE,
    isDark: false,
  },
];

const doors = [
  {
    tileX: 10,
    tileY: 20,
    x: 6 * TILE_SIZE,
    y: 7 * TILE_SIZE,
    w: TILE_SIZE * 3,
    h: TILE_SIZE,
    isOpen: false,
    isLocked: false,
    roomId: "sala_maquinas",
  },
];

let currentDoorInteraction = null;
// debugFrameCount removed for production

// Tasks baseadas nos tiles do mapa
const tasks = [
  // Task 1 - Extintores de Incêndio
  {
    tileX: 12,
    tileY: 10,
    x: 8 * TILE_SIZE,
    y: 14 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "dragAndDrop",
    content: {
      items: [
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/extintor_tipoA.png",
          target: "tipoA",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/extintor_tipoB.png",
          target: "tipoB",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/extintor_tipoC.png",
          target: "tipoC",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/extintor_tipoD.png",
          target: "tipoD",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/extintor_tipoK.png",
          target: "tipoK",
          width: 50,
          height: 50,
        },
      ],
      targets: [
        {
          id: "tipoA",
          name: "Cessa incêndios em sólidos combustíveis (madeira, papel, tecido)",
        },
        {
          id: "tipoB",
          name: "Cessa incêndios em líquidos inflamáveis (gasolina, óleo, álcool)",
        },
        {
          id: "tipoC",
          name: "Cessa incêndios em equipamentos elétricos energizados",
        },
        {
          id: "tipoD",
          name: "Cessa incêndios em metais pirofóricos (magnésio, sódio, lítio)",
        },
        {
          id: "tipoK",
          name: "Cessa incêndios em óleos e gorduras de cozinha",
        },
      ],
    },
    taskCompletedMessage: "Extintores corretamente associados!",
  },
  // Task 2 - Placas de Segurança Parte 1
  {
    tileX: 4,
    tileY: 60,
    x: 55 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "dragAndDrop",
    content: {
      items: [
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_quadroeletrico.png",
          target: "quadroeletrico",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_altatensao.png",
          target: "altatensao",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_raiolaser.png",
          target: "raiolaser",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_atencao.png",
          target: "atencao",
          width: 50,
          height: 50,
        },
      ],
      targets: [
        { id: "quadroeletrico", name: "Quadro elétrico" },
        { id: "altatensao", name: "Alta tensão" },
        { id: "raiolaser", name: "Raio Laser" },
        { id: "atencao", name: "Atenção" },
      ],
    },
    taskCompletedMessage: "Placas de segurança Parte 1 associadas corretamente!",
  },
  // Task 3 - Placas de Segurança Parte 2
  {
    tileX: 12,
    tileY: 50,
    x: 60 * TILE_SIZE,
    y: 52 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "dragAndDrop",
    content: {
      items: [
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_substanciainflamavel.png",
          target: "inflamavel",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_substanciaexplosiva.png",
          target: "explosiva",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_perigodemorte.png",
          target: "morte",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_pisoescorregadio.png",
          target: "escorregadio",
          width: 50,
          height: 50,
        },
      ],
      targets: [
        { id: "inflamavel", name: "Substância inflamável" },
        { id: "explosiva", name: "Substância explosiva" },
        { id: "morte", name: "Perigo de morte" },
        { id: "escorregadio", name: "Piso escorregadio" },
      ],
    },
    taskCompletedMessage: "Placas de segurança Parte 2 associadas corretamente!",
  },
  // Task 4 - Placas de Segurança Parte 3
  {
    tileX: 24,
    tileY: 18,
    x: 5 * TILE_SIZE,
    y: 23 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "dragAndDrop",
    content: {
      items: [
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_radiacao.png",
          target: "radiacao",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_substanciacorrosiva.png",
          target: "corrosiva",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_irradiacaodecalor.png",
          target: "calor",
          width: 50,
          height: 50,
        },
        {
          type: "image",
          src: "./IMG/minigame_1/tasks/sign_perigosoparaomeioambiente.png",
          target: "ambiente",
          width: 50,
          height: 50,
        },
      ],
      targets: [
        { id: "radiacao", name: "Radiação" },
        { id: "corrosiva", name: "Substância corrosiva" },
        { id: "calor", name: "Irradiação de calor" },
        { id: "ambiente", name: "Substância perigosa para o meio ambiente" },
      ],
    },
    taskCompletedMessage: "Placas de segurança Parte 3 associadas corretamente!",
  },
  // Task 5 - Fios Primeira Tarefa
  {
    tileX: 22,
    tileY: 36,
    x: 5 * TILE_SIZE,
    y: 36 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "wiring",
    content: {
      difficulty: "easy",
    },
    taskCompletedMessage: "Fios conectados corretamente na primeira tarefa!",
  },
  // Task 6 - Fios Segunda Tarefa
  {
    tileX: 22,
    tileY: 58,
    x: 5 * TILE_SIZE,
    y: 60 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "wiring",
    content: {
      difficulty: "medium",
    },
    taskCompletedMessage: "Fios conectados corretamente na segunda tarefa!",
  },
  // Task 7 - Voltagem das Tomadas
  {
    tileX: 28,
    tileY: 2,
    x: 5 * TILE_SIZE,
    y: 2 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "socketVoltage",
    content: {
      sockets: [
        { id: "socket1", voltage: 110, x: 100, y: 150 },
        { id: "socket2", voltage: 220, x: 400, y: 150 },
      ],
      stickers: [
        { id: "sticker1", voltage: 110, src: "./IMG/minigame_1/tasks/tomada_adesivo_110V.png" },
        { id: "sticker2", voltage: 220, src: "./IMG/minigame_1/tasks/tomada_adesivo_220V.png" },
      ],
    },
    taskCompletedMessage: "Adesivos de voltagem colocados corretamente!",
  },
  
  // Task 9 - Lixeiras Parte 1
  {
    tileX: 44,
    tileY: 22,
    x: 57 * TILE_SIZE,
    y: 22 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "dragAndDrop",
    content: {
      items: [
        { type: "image", src: "./IMG/minigame_1/tasks/resid_papel_folha.png", target: "azul", width: 50, height: 50 },
        { type: "image", src: "./IMG/minigame_1/tasks/resid_metal_lata1.png", target: "amarela", width: 50, height: 50 },
        { type: "image", src: "./IMG/minigame_1/tasks/resid_plast_garrafa.png", target: "vermelha", width: 50, height: 50 },
        { type: "image", src: "./IMG/minigame_1/tasks/resid_vidro_garrafa1.png", target: "verde", width: 50, height: 50 },
        { type: "image", src: "./IMG/minigame_1/tasks/resid_org_maca.png", target: "marrom", width: 50, height: 50 },
      ],
      targets: [
        { id: "azul", name: "Lixeira Azul", color: "#2196F3", trashImg: "./IMG/minigame_1/tasks/trashcan_paper.png" },
        { id: "amarela", name: "Lixeira Amarela", color: "#FFC107", trashImg: "./IMG/minigame_1/tasks/trashcan_metal.png" },
        { id: "vermelha", name: "Lixeira Vermelha", color: "#F44336", trashImg: "./IMG/minigame_1/tasks/trashcan_plastic.png" },
        { id: "verde", name: "Lixeira Verde", color: "#4CAF50", trashImg: "./IMG/minigame_1/tasks/trashcan_glass.png" },
        { id: "marrom", name: "Lixeira Marrom", color: "#795548", trashImg: "./IMG/minigame_1/tasks/trashcan_organic.png" },
      ],
    },
    taskCompletedMessage: "Resíduos Parte 1 classificados corretamente!",
  },
  // Task 10 - Lixeiras Parte 2
  {
    tileX: 36,
    tileY: 40,
    x: 31 * TILE_SIZE,
    y: 35 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "dragAndDrop",
    content: {
      items: [
        { type: "image", src: "./IMG/minigame_1/tasks/resid_naoreci_cigarro.png", target: "cinza", width: 50, height: 50 },
        { type: "image", src: "./IMG/minigame_1/tasks/resid_mad_colher.png", target: "preta", width: 50, height: 50 },
        { type: "image", src: "./IMG/minigame_1/tasks/resid_infect_luvas.png", target: "branca", width: 50, height: 50 },
        { type: "image", src: "./IMG/minigame_1/tasks/resid_rad_frasco.png", target: "roxa", width: 50, height: 50 },
        { type: "image", src: "./IMG/minigame_1/tasks/resid_elet_celular.png", target: "laranja", width: 50, height: 50 },
      ],
      targets: [
        { id: "cinza", name: "Lixeira Cinza", color: "#9E9E9E", trashImg: "./IMG/minigame_1/tasks/trashcan_non-recyclable.png" },
        { id: "preta", name: "Lixeira Preta", color: "#212121", trashImg: "./IMG/minigame_1/tasks/trashcan_wood.png" },
        { id: "branca", name: "Lixeira Branca", color: "#FFFFFF", trashImg: "./IMG/minigame_1/tasks/trashcan_infectante.png" },
        { id: "roxa", name: "Lixeira Roxa", color: "#9C27B0", trashImg: "./IMG/minigame_1/tasks/trashcan_radioactive.png" },
        { id: "laranja", name: "Lixeira Laranja", color: "#FF9800", trashImg: "./IMG/minigame_1/tasks/trashcan_electronics.png" },
      ],
    },
    taskCompletedMessage: "Resíduos Parte 2 classificados corretamente!",
  },
  // Task 11 - EPIs Parte 1
  {
    tileX: 40,
    tileY: 52,
    x: 29.5 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "dragAndDrop",
    content: {
      items: [
        {
          type: "image",
          src: "./IMG/minigame_4/capacete.png",
          target: "capacete",
          width: 80,
          height: 80,
        },
        {
          type: "image",
          src: "./IMG/minigame_4/oculos.png",
          target: "oculos",
          width: 80,
          height: 80,
        },
        {
          type: "image",
          src: "./IMG/minigame_4/calcadoseguranca.png",
          target: "calcado",
          width: 80,
          height: 80,
        },
        {
          type: "image",
          src: "./IMG/minigame_4/luvas.png",
          target: "luvas",
          width: 80,
          height: 80,
        },
      ],
      targets: [
        {
          id: "capacete",
          name: "Protege contra impactos, quedas, choques elétricos",
        },
        {
          id: "oculos",
          name: "Protege de partículas, respingos químicos, poeira, radiação",
        },
        {
          id: "calcado",
          name: "Protege de quedas, perfurações, choques, temperaturas",
        },
        {
          id: "luvas",
          name: "Protege de cortes, abrasões, perfurações, agentes químicos",
        },
      ],
    },
    taskCompletedMessage: "EPIs Parte 1 associados corretamente!",
  },
  // Task 12 - EPIs Parte 2
  {
    tileX: 50,
    tileY: 6,
    x: 47 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "dragAndDrop",
    content: {
      items: [
        {
          type: "image",
          src: "./IMG/minigame_4/macacao.png",
          target: "macacao",
          width: 80,
          height: 80,
        },
        {
          type: "image",
          src: "./IMG/minigame_4/cinto.png",
          target: "cinto",
          width: 80,
          height: 80,
        },
        {
          type: "image",
          src: "./IMG/minigame_4/colete.png",
          target: "colete",
          width: 80,
          height: 80,
        },
      ],
      targets: [
        {
          id: "macacao",
          name: "Barreira contra poeiras, respingos, contaminação, temperaturas",
        },
        { id: "cinto", name: "Protege o trabalhador de quedas súbitas" },
        {
          id: "colete",
          name: "Aumenta visibilidade em ambientes de baixo risco",
        },
      ],
    },
    taskCompletedMessage: "EPIs Parte 2 associados corretamente!",
  },
  // Task 13 - EPIs Parte 3
  {
    tileX: 50,
    tileY: 42,
    x: 47 * TILE_SIZE,
    y: 60 * TILE_SIZE,
    w: 32,
    h: 32,
    isCompleted: false,
    type: "dragAndDrop",
    content: {
      items: [
        { type: "image", src: "./IMG/minigame_1/tasks/respirador.png", target: "respirador", width: 80, height: 80 },
        { type: "image", src: "./IMG/minigame_1/tasks/protetor_facial.png", target: "escudo", width: 80, height: 80 },
        { type: "image", src: "./IMG/minigame_1/tasks/mascara.png", target: "mascara", width: 80, height: 80 },
        { type: "image", src: "./IMG/minigame_1/tasks/protetorauricular.png", target: "protetor", width: 80, height: 80 },
      ],
      targets: [
        {
          id: "respirador",
          name: "Protege em condições extremas, IPVS (ar imediatamente perigoso)",
        },
        {
          id: "escudo",
          name: "Protege de respingos químicos, fluidos, poeira, radiações",
        },
        {
          id: "mascara",
          name: "Protege sistema respiratório de poeira, vírus, gases, vapores",
        },
        {
          id: "protetor",
          name: "Protege contra ruídos excessivos, prevenindo danos à audição",
        },
      ],
    },
    taskCompletedMessage: "EPIs Parte 3 associados corretamente!",
  },
];

let tasksCompleted = 0;
let totalTasks = tasks.length;
let currentTaskMessage = null;
let currentActiveTask = null;
let selectedMenuItem = 0;
let keys = {};

loadImages(() => {
  // Image load verification logs removed for production

  hideLoadingScreen();
  gameLoop();
});

// ======= CONTROLES DO JOGO =======
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === "p" || e.key === "P" || e.key === "Escape") {
    if (gameState === "playing" || gameState === "paused") {
      togglePauseMenu();
    }
  }
  if (gameState === "paused") {
    if (e.key === "ArrowUp") {
      selectedMenuItem = Math.max(0, selectedMenuItem - 1);
      updatePauseMenuSelection();
    } else if (e.key === "ArrowDown") {
      selectedMenuItem = Math.min(menuOptions.length - 1, selectedMenuItem + 1);
      updatePauseMenuSelection();
    } else if (e.key === "Enter") {
      executePauseMenuItem(selectedMenuItem);
    } else if (selectedMenuItem === 1) {
      if (e.key === "ArrowLeft") {
        changeMusic(-1);
      } else if (e.key === "ArrowRight") {
        changeMusic(1);
      }
    }
  } else if (gameState === "playing" && (e.key === " " || e.key === "Enter")) {
    let taskActivated = false;
    tasks.forEach((task) => {
        if (!task.isCompleted && isColliding(player, task)) {
          activateTask(task);
          taskActivated = true;
        }
    });

      if (!taskActivated && currentDoorInteraction) {
        toggleDoor(currentDoorInteraction);
        // door toggle debug log removed
      }
  }
});

document.addEventListener("keyup", (e) => (keys[e.key] = false));

function drawBackgroundCorrected(cameraX, cameraY) {
  // Use tile-based renderer if available
  if (typeof MinigameMap !== "undefined" && window.minigameMap) {
    window.minigameMap.draw(cameraX, cameraY, canvas.width, canvas.height);
    return;
  }

  // No tiled map available: draw a neutral solid background
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ======= FUNÇÕES DO MENU DE PAUSA =======

function changeMusic(direction) {
  currentMusicIndex += direction;

  if (currentMusicIndex < 0) {
    currentMusicIndex = musicPlaylist.length - 1;
  } else if (currentMusicIndex >= musicPlaylist.length) {
    currentMusicIndex = 0;
  }

  const selectedTrack = musicPlaylist[currentMusicIndex];

  if (selectedTrack.src === "MUTED") {
    backgroundMusic.pause();
    backgroundMusic.src = "";
  } else {
    backgroundMusic.src = selectedTrack.src;
    backgroundMusic.play();
  }

  if (musicNameEl) {
    musicNameEl.textContent = selectedTrack.name;
  }

  const arrows = document.querySelectorAll(`#menuMusic .music-arrow`);
  arrows.forEach((arrow) => {
    arrow.style.transform = "scale(1.5)";
    setTimeout(() => {
      if (document.getElementById("menuMusic").classList.contains("selected")) {
        arrow.style.transform = "scale(1.2)";
      }
    }, 150);
  });
}

// Função para alternar o menu de pausa
function togglePauseMenu() {
  const pauseMenu = document.getElementById("pauseMenu");
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

// Função para executar ações do menu de pausa
function executePauseMenuItem(index) {
  const pauseMenuItems = document.querySelectorAll("#pauseMenu li");
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

// Adiciona eventos aos itens do menu de pausa
const pauseMenuItems = document.querySelectorAll("#pauseMenu li");
if (pauseMenuItems.length) {
  pauseMenuItems.forEach((item, idx) => {
    item.addEventListener("click", () => executePauseMenuItem(idx));
    item.addEventListener("mouseenter", () => {
      pauseMenuItems.forEach((it) => it.classList.remove("selected"));
      item.classList.add("selected");
    });
  });
}

function updatePauseMenuSelection() {
  menuOptions.forEach((item, index) => {
    item.classList.remove("selected");
    item.style.transform = "scale(1)";
    item.style.opacity = "0.6";
    item.style.letterSpacing = "0px";

    const musicArrows = item.querySelectorAll(".music-arrow");
    if (musicArrows.length > 0) {
      musicArrows.forEach((arrow) => {
        arrow.style.color = "rgba(255, 255, 255, 0.4)";
        arrow.style.transform = "scale(1)";
      });
    }

    if (index === selectedMenuItem) {
      item.classList.add("selected");
      item.style.transform = "scale(1.15)";
      item.style.opacity = "1";
      item.style.letterSpacing = "5px";

      if (musicArrows.length > 0) {
        musicArrows.forEach((arrow) => {
          arrow.style.color = "#00ffff";
          arrow.style.transform = "scale(1.2)";
        });
      }
    } else if (Math.abs(index - selectedMenuItem) === 1) {
      item.style.transform = "translateY(10px) scale(0.95)";
      item.style.opacity = "0.8";
    } else {
      item.style.transform = "translateY(20px) scale(0.9)";
      item.style.opacity = "0.5";
    }
  });
}

// ======= FUNÇÕES DE TAREFAS =======

function activateTask(task) {
  currentActiveTask = task;
  if (backgroundMusic) backgroundMusic.volume = 0.1;

  document
    .querySelectorAll(".task-content")
    .forEach((el) => (el.style.display = "none"));

  const htmlTaskTypes = [
    "dragAndDrop",
    "orderSteps",
    "fastAction",
    "socketVoltage",
  ];

  if (htmlTaskTypes.includes(task.type)) {
    gameState = "task_active";
    taskContainer.style.display = "block";

    if (task.type === "dragAndDrop")
      setupDragAndDropTask(task.content),
        (dragAndDropTask.style.display = "block");
    else if (task.type === "orderSteps")
      setupOrderTask(task.content), (orderTask.style.display = "block");
    else if (task.type === "fastAction")
      setupFastActionTask(task.content),
        (fastActionTask.style.display = "block");
    else if (task.type === "socketVoltage")
      setupSocketVoltage(task.content);
  } else if (task.type === "wiring") {
    gameState = "minigame_active";
    taskContainer.style.display = "none";
    miniGameManager.start(task);
  }
}

function completeCurrentTask() {
  if (!currentActiveTask) return;
  sfx.taskDone.play(); // <--- SOM DE TAREFA CONCLUÍDA
  currentActiveTask.isCompleted = true;
  tasksCompleted++;
  currentTaskMessage = currentActiveTask.taskCompletedMessage;

  taskContainer.style.display = "none";

  gameState = "playing";
  currentActiveTask = null;

  if (backgroundMusic) backgroundMusic.volume = 0.3;

  updateHUD();
  checkWinCondition();
}

function setupDragAndDropTask(content) {
  dragItemsContainer.innerHTML = "";
  dropTargetsContainer.innerHTML = "";
  let correctDrops = 0;

  content.items.forEach((item) => {
    const el = document.createElement("div");

    if (item.type === "image") {
      const img = document.createElement("img");
      img.src = item.src;
      img.style.width = item.width + "px";
      img.style.height = item.height + "px";
      img.style.objectFit = "contain";
      el.appendChild(img);
    } else {
      el.textContent = item.text;
    }

    el.draggable = true;
    el.className = "drag-item";
    el.dataset.target = item.target;
    dragItemsContainer.appendChild(el);
  });

  // Embaralha a ordem dos alvos para que apareçam aleatoriamente
  const shuffledTargets = [...content.targets].sort(() => Math.random() - 0.5);
  shuffledTargets.forEach((target) => {
    const el = document.createElement("div");
    el.className = "drop-target";
    el.dataset.id = target.id;
    
    // Se houver imagem de lixeira, renderiza; senão apenas texto
    if (target.trashImg) {
      const img = document.createElement("img");
      img.src = target.trashImg;
      img.style.width = "60px";
      img.style.height = "60px";
      img.style.objectFit = "contain";
      el.appendChild(img);
    } else {
      el.textContent = target.name;
    }
    
    dropTargetsContainer.appendChild(el);
  });

  let currentDraggedItem = null;

  const dragItems = dragItemsContainer.querySelectorAll(".drag-item");
  dragItems.forEach((item) => {
    item.addEventListener("dragstart", function (e) {
      currentDraggedItem = this;
      e.dataTransfer.setData("text/plain", this.dataset.target);
      this.style.opacity = "0.5";
    });

    item.addEventListener("dragend", function () {
      this.style.opacity = "1";
      currentDraggedItem = null;
    });
  });

  const dropTargets = dropTargetsContainer.querySelectorAll(".drop-target");
  dropTargets.forEach((target) => {
    target.addEventListener("dragover", function (e) {
      e.preventDefault();
      if (!this.classList.contains("drag-drop-correct")) {
        this.style.border = "2px dashed #00ffff";
      }
    });

    target.addEventListener("dragleave", function () {
      if (!this.classList.contains("drag-drop-correct")) {
        this.style.border = "2px dashed #777";
      }
    });

    target.addEventListener("drop", function (e) {
      e.preventDefault();
      if (!this.classList.contains("drag-drop-correct")) {
        this.style.border = "2px dashed #777";
      }

      if (currentDraggedItem && !this.classList.contains("drag-drop-correct")) {
        const dragTargetId = currentDraggedItem.dataset.target;
        const dropTargetId = this.dataset.id;

        if (dragTargetId === dropTargetId) {
          correctDrops++;
          currentDraggedItem.style.display = "none";
          this.classList.add("drag-drop-correct");

          if (currentDraggedItem.querySelector("img")) {
            const img = currentDraggedItem.querySelector("img").cloneNode(true);
            this.innerHTML = "";
            this.appendChild(img);
          } else {
            this.textContent = `${currentDraggedItem.textContent} → ${target.name}`;
          }

          if (correctDrops === content.items.length) {
            dragDropCompleteBtn.style.display = "block";
          }
        } else {
          this.style.border = "2px dashed #ff0000";
          setTimeout(() => {
            if (!this.classList.contains("drag-drop-correct")) {
              this.style.border = "2px dashed #777";
            }
          }, 500);
        }
      }
    });
  });

  dragDropCompleteBtn.onclick = completeCurrentTask;
  dragDropCompleteBtn.style.display = "none";
}

function setupOrderTask(content) {
  orderStepsContainer.innerHTML = "";
  let availableSteps = [...content.steps];
  let userOrder = [];

  orderCompleteBtn.style.display = "none";

  const updateDisplay = () => {
    orderStepsContainer.innerHTML = "";

    const orderDisplay = document.createElement("p");
    orderDisplay.textContent =
      "Sua Ordem: " +
      (userOrder.length > 0
        ? userOrder.join(" > ")
        : "Nenhum passo selecionado.");
    orderStepsContainer.appendChild(orderDisplay);

    availableSteps.forEach((step, index) => {
      const btn = document.createElement("button");
      btn.textContent = step;
      btn.className = "option-btn";
      btn.onclick = () => {
        userOrder.push(step);
        availableSteps.splice(index, 1);
        updateDisplay();
        if (content.order && userOrder.length === content.order.length) {
          checkOrder();
        } else if (!content.order) {
          // orderSteps task missing 'order' definition (debug log removed)
        }
      };
      orderStepsContainer.appendChild(btn);
    });

    if (userOrder.length > 0) {
      const resetBtn = document.createElement("button");
      resetBtn.textContent = "Resetar Ordem";
      resetBtn.onclick = () => {
        userOrder.length = 0;
        availableSteps = [...content.steps];
        updateDisplay();
      };
      orderStepsContainer.appendChild(resetBtn);
    }
  };

  const checkOrder = () => {
    if (!content.order) return;

    const isCorrect = userOrder.every(
      (step, index) => step === content.order[index]
    );
    if (isCorrect) {
      // correct order (debug log removed)
      orderCompleteBtn.style.display = "block";
    } else {
      // incorrect order (debug log removed)
      userOrder.length = 0;
      availableSteps = [...content.steps];
      updateDisplay();
    }
  };

  orderCompleteBtn.onclick = completeCurrentTask;
  updateDisplay();
}

function setupFastActionTask(content) {
  fastActionBtn.textContent = "Desativar Perigo";
  fastActionMessage.textContent = "";
  fastActionCompleteBtn.style.display = "none";
  fastActionBtn.disabled = false;

  let clicks = 0;
  const requiredClicks = 5;

  fastActionBtn.onclick = () => {
    clicks++;
    fastActionMessage.textContent = `Cliques: ${clicks}/${requiredClicks}`;
    if (clicks >= requiredClicks) {
      fastActionBtn.disabled = true;
      fastActionMessage.textContent = "Perigo desativado! Tarefa concluída.";
      fastActionCompleteBtn.style.display = "block";
    }
  };

  fastActionCompleteBtn.onclick = completeCurrentTask;
}

function setupSocketVoltage(content) {
  // Esta tarefa requer um elemento HTML específico
  if (!document.getElementById("socketVoltageTask")) {
    const taskEl = document.createElement("div");
    taskEl.id = "socketVoltageTask";
    taskEl.className = "task-content";
    taskEl.style.display = "none";
    taskEl.innerHTML = `
      <h3>Voltagem das Tomadas</h3>
      <p>Cole os adesivos de voltagem nas tomadas corretas!</p>
      <div id="socketContainer" style="display: flex; gap: 50px; justify-content: center; align-items: center; margin: 20px 0;">
        <div id="socket1-area" style="border: 2px solid #ccc; padding: 20px; text-align: center; min-width: 150px; min-height: 150px; background: #f9f9f9;">
          <p>Tomada 110V</p>
          <div id="socket1-image" style="height: 80px; display: flex; align-items: center; justify-content: center;">
            <img src="./IMG/minigame_1/tasks/tomada_110V.png" style="max-height: 80px; object-fit: contain;">
          </div>
          <p id="socket1-sticker" style="margin-top: 10px; color: #999;">Esperando adesivo...</p>
        </div>
        <div id="socket2-area" style="border: 2px solid #ccc; padding: 20px; text-align: center; min-width: 150px; min-height: 150px; background: #f9f9f9;">
          <p>Tomada 220V</p>
          <div id="socket2-image" style="height: 80px; display: flex; align-items: center; justify-content: center;">
            <img src="./IMG/minigame_1/tasks/tomada_220V.png" style="max-height: 80px; object-fit: contain;">
          </div>
          <p id="socket2-sticker" style="margin-top: 10px; color: #999;">Esperando adesivo...</p>
        </div>
      </div>
      <div id="stickerDragArea" style="display: flex; gap: 30px; justify-content: center; margin: 20px 0;">
        <div id="sticker-110V" draggable="true" style="border: 2px dashed #2196F3; padding: 15px; text-align: center; cursor: move; background: rgba(33, 150, 243, 0.1);">
          <img src="./IMG/minigame_1/tasks/tomada_adesivo_110V.png" style="max-height: 60px; object-fit: contain;">
          <p>Adesivo 110V</p>
        </div>
        <div id="sticker-220V" draggable="true" style="border: 2px dashed #FF9800; padding: 15px; text-align: center; cursor: move; background: rgba(255, 152, 0, 0.1);">
          <img src="./IMG/minigame_1/tasks/tomada_adesivo_220V.png" style="max-height: 60px; object-fit: contain;">
          <p>Adesivo 220V</p>
        </div>
      </div>
      <button id="socketVoltageCompleteBtn" style="display: none; margin-top: 20px;">Concluir</button>
    `;
    taskContainer.appendChild(taskEl);
  }

  const socketVoltageTask = document.getElementById("socketVoltageTask");
  socketVoltageTask.style.display = "block";

  let stickersPlaced = {};

  const sticker110 = document.getElementById("sticker-110V");
  const sticker220 = document.getElementById("sticker-220V");
  const socket1Area = document.getElementById("socket1-area");
  const socket2Area = document.getElementById("socket2-area");
  const completeBtn = document.querySelector("#socketVoltageTask #socketVoltageCompleteBtn");

  [sticker110, sticker220].forEach((sticker) => {
    sticker.addEventListener("dragstart", function (e) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", this.id);
    });
  });

  [socket1Area, socket2Area].forEach((socket) => {
    socket.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      socket.style.backgroundColor = "#e3f2fd";
    });

    socket.addEventListener("dragleave", (e) => {
      socket.style.backgroundColor = "#f9f9f9";
    });

    socket.addEventListener("drop", (e) => {
      e.preventDefault();
      const stickerId = e.dataTransfer.getData("text/plain");
      const socket1 = content.sockets.find((s) => s.voltage === 110);
      const socket2 = content.sockets.find((s) => s.voltage === 220);

      let isCorrect = false;
      if (socket.id === "socket1-area" && stickerId === "sticker-110V") {
        isCorrect = true;
        stickersPlaced["110"] = true;
        document.getElementById("socket1-sticker").textContent = "✓ Adesivo 110V aplicado";
        document.getElementById("socket1-sticker").style.color = "#4CAF50";
      } else if (socket.id === "socket2-area" && stickerId === "sticker-220V") {
        isCorrect = true;
        stickersPlaced["220"] = true;
        document.getElementById("socket2-sticker").textContent = "✓ Adesivo 220V aplicado";
        document.getElementById("socket2-sticker").style.color = "#4CAF50";
      } else {
        sfx.wrong.play();
        socket.style.backgroundColor = "#ffebee";
        setTimeout(() => {
          socket.style.backgroundColor = "#f9f9f9";
        }, 500);
      }

      if (isCorrect) {
        sfx.right.play();
        if (stickersPlaced["110"] && stickersPlaced["220"]) {
          completeBtn.style.display = "block";
        }
      }

      socket.style.backgroundColor = "#f9f9f9";
    });
  });

  completeBtn.onclick = completeCurrentTask;
}

// Toolbox task removed per request (all related UI and logic deleted)

// ======= FUNÇÕES GERAIS =======
function isColliding(a, b) {
  const margin = b.tileX !== undefined ? 40 : 30;

  const isCollidingNow =
    a.x + a.w > b.x - margin &&
    a.x < b.x + b.w + margin &&
    a.y + a.h > b.y - margin &&
    a.y < b.y + b.h + margin;

  // debug checks removed for production

  return isCollidingNow;
}

function isWall(x, y) {
  if (x < 0 || x >= world.width || y < 0 || y >= world.height) {
    return true;
  }

  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);

  if (row < 0 || row >= tileMap.length || col < 0 || col >= tileMap[0].length) {
    return true;
  }

  const tile = tileMap[row][col];

  if (tile === TILE_TYPES.tile3) {
    const door = doors.find(
      (d) =>
        col >= d.tileX && col < d.tileX + d.w / TILE_SIZE && row === d.tileY
    );

    if (door && door.isOpen) {
      return false;
    }
    return true;
  }

  // Usa o sistema de configuração de tiles da MinigameMap
  if (window.minigameMap) {
    return window.minigameMap.isTileWall(tile);
  }

  // Fallback: tile0 é o chão (caminhável), tile1 é parede (não caminhável)
  const isPassable = tile === TILE_TYPES.tile0;
  return !isPassable;
}

function updateHUD() {
  tasksCounter.textContent = `${tasksCompleted}/${totalTasks}`;
}

function checkWinCondition() {
  if (tasksCompleted === totalTasks) {
    gameState = "won";

    // Para a música de fundo e toca a vitória
    if (backgroundMusic) backgroundMusic.pause();
    sfx.steps.pause(); // Garante que os passos parem
    sfx.victory.play(); // <--- SOM DE VITÓRIA / MEDALHA

    // Salva o progresso automaticamente
    const currentProgress = JSON.parse(
      localStorage.getItem("safetyGameProgress") || "{}"
    );
    currentProgress["danger"] = true;
    localStorage.setItem("safetyGameProgress", JSON.stringify(currentProgress));

    victoryScreen.style.display = "block";
  }
}

// ======= FUNÇÕES DO SISTEMA DE PORTAS =======
function isPlayerInRoom(room) {
  return (
    player.x >= room.x &&
    player.x + player.w <= room.x + room.width &&
    player.y >= room.y &&
    player.y + player.h <= room.y + room.height
  );
}

function toggleDoor(door) {
  if (door.isLocked) {
    // Porta trancada (debug log removed)
    return;
  }

  door.isOpen = !door.isOpen;
  // Door toggled (debug log removed)

  if (!door.isOpen) {
    currentDoorInteraction = null;
  }
}

function checkDoorInteraction() {
  currentDoorInteraction = null;
  doors.forEach((door) => {
    if (isColliding(player, door)) {
      currentDoorInteraction = door;
      // debug door proximity logs removed
    }
  });
}

// ======= LOOP PRINCIPAL =======

function update(deltaTime) {
  if (gameState === "playing") {
    const hitboxHeight = 20;
    const hitboxYOffset = player.h - hitboxHeight;

    let newX = player.x;
    let newY = player.y;

    if (keys["w"] || keys["W"]) newY -= player.speed;
    if (keys["s"] || keys["S"]) newY += player.speed;
    if (keys["a"] || keys["A"]) newX -= player.speed;
    if (keys["d"] || keys["D"]) newX += player.speed;

    const isMoving =
      keys["w"] ||
      keys["W"] ||
      keys["s"] ||
      keys["S"] ||
      keys["a"] ||
      keys["A"] ||
      keys["d"] ||
      keys["D"];
    if (isMoving) {
      if (sfx.steps.paused) sfx.steps.play().catch(() => {});
    } else {
      sfx.steps.pause();
      sfx.steps.currentTime = 0;
    }

    if (newX !== player.x) {
      let canMoveX = true;

      const hitboxTopY = player.y + hitboxYOffset;
      const hitboxBottomY = player.y + player.h - 1;

      if (newX < player.x) {
        canMoveX = !isWall(newX, hitboxTopY) && !isWall(newX, hitboxBottomY);
      } else {
        canMoveX =
          !isWall(newX + player.w, hitboxTopY) &&
          !isWall(newX + player.w, hitboxBottomY);
      }

      if (canMoveX) {
        player.x = newX;
      }
    }

    if (newY !== player.y) {
      let canMoveY = true;

      const newHitboxTopY = newY + hitboxYOffset;
      const newHitboxBottomEdge = newY + player.h;

      if (newY < player.y) {
        canMoveY =
          !isWall(player.x, newHitboxTopY) &&
          !isWall(player.x + player.w - 1, newHitboxTopY);
      } else {
        canMoveY =
          !isWall(player.x, newHitboxBottomEdge) &&
          !isWall(player.x + player.w - 1, newHitboxBottomEdge);
      }

      if (canMoveY) {
        player.y = newY;
      }
    }

    player.x = Math.max(0, Math.min(player.x, world.width - player.w));
    player.y = Math.max(0, Math.min(player.y, world.height - player.h));

    checkDoorInteraction();
  } else if (gameState === "minigame_active") {
    miniGameManager.update(deltaTime);
  }
}

function draw() {
  if (gameState === "minigame_active") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    miniGameManager.draw(ctx);
  } else {
    let cameraX = player.x - canvas.width / 2 + player.w / 2;
    let cameraY = player.y - canvas.height / 2 + player.h / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackgroundCorrected(cameraX, cameraY);

    let collisionDetected = false;
    let currentTaskType = "";

    tasks.forEach((task) => {
      let taskX = task.x - cameraX;
      let taskY = task.y - cameraY;

      // Desenha um tile específico para tarefas pendentes/concluídas
      const tileKey = task.isCompleted ? 'tile_floor_task_done' : 'tile_floor_task';
      const tileImg = images[tileKey];
      if (tileImg && tileImg.complete && tileImg.naturalWidth > 0) {
        try {
          ctx.drawImage(tileImg, taskX, taskY, task.w, task.h);
        } catch (e) {
          // fallback para contorno caso drawImage falhe
          ctx.strokeStyle = task.isCompleted ? "#00ff00" : "#ff0000";
          ctx.lineWidth = 2;
          ctx.strokeRect(taskX, taskY, task.w, task.h);
        }
      } else {
        // fallback visual quando a imagem ainda não estiver disponível
        ctx.strokeStyle = task.isCompleted ? "#00ff00" : "#ff0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(taskX, taskY, task.w, task.h);
      }

      // Removed debug text for task type and tile coordinates

      const isCollidingNow = isColliding(player, task);

      if (!task.isCompleted && isCollidingNow) {
        collisionDetected = true;
        currentTaskType = task.type;

        const messageX = taskX + task.w / 2;
        const messageY = taskY - 25;
        const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;

        ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔼 Pressione ESPAÇO", messageX, messageY);
      }
    });

    let playerOnScreenX = canvas.width / 2 - player.w / 2;
    let playerOnScreenY = canvas.height / 2 - player.h / 2;

    playerSprite.draw(
      ctx,
      playerOnScreenX,
      playerOnScreenY,
      player.w,
      player.h
    );

    // Removed on-canvas debug HUD texts for production

    // Removed connection line from player to task (visual debug removed)
  }
}

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime || 0;
  lastTime = timestamp;

  // occasional debug logging removed

  if (gameState === "playing") {
    playerSprite.update(deltaTime, keys);
  }

  update(deltaTime);
  draw();
  requestAnimationFrame(gameLoop);
}

function hideLoadingScreen() {
  // If loadingScreen element exists, hide it with fade; otherwise just show content.
  if (typeof loadingScreen !== "undefined" && loadingScreen) {
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      loadingScreen.style.display = "none";
      if (gameContent) gameContent.style.display = "block";
      // Ensure background music initialization occurs regardless of loadingScreen
      initializeBackgroundMusic();
    }, 300);
  } else {
    if (gameContent) gameContent.style.display = "block";
    initializeBackgroundMusic();
  }
}

function initializeBackgroundMusic() {
  const initialSong = musicPlaylist[currentMusicIndex];
  if (musicNameEl) {
    musicNameEl.textContent = initialSong.name;
  }

  if (backgroundMusic) {
    backgroundMusic.src = initialSong.src;
    backgroundMusic
      .play()
      .catch(() => {
        // Autoplay prevented (debug warning removed) - wait for user interaction
        const playOnFirstInteraction = () => {
          if (musicPlaylist[currentMusicIndex].src !== "MUTED") {
            backgroundMusic.play();
          }
          document.body.removeEventListener("click", playOnFirstInteraction);
          document.body.removeEventListener("keydown", playOnFirstInteraction);
        };
        document.body.addEventListener("click", playOnFirstInteraction);
        document.body.addEventListener("keydown", playOnFirstInteraction);
      });
  }
}

updateHUD();
checkDoorInteraction();

setTimeout(() => {
    // Initial door debug logs removed
}, 1000);
// Initial debug dump removed

/* ========================================================================== */
/* MUDANÇA: MINIGAME WIRING                                   */
/* ========================================================================== */

class WiringGame {
  setup(item) {
    this.nodes = [];
    this.timeLimit = 10000; // 15 seconds
    this.isDragging = false;
    this.startNode = null;
    this.mousePos = { x: 0, y: 0 };

    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];
    const startY = canvas.height / 2 - 100;
    const endY = canvas.height / 2 + 100;

    colors.forEach((color, i) => {
      const xPos = canvas.width / 2 - 150 + i * 100;
      this.nodes.push({
        x: xPos,
        y: startY,
        color: color,
        isStart: true,
        isConnected: false,
        connectedTo: null,
      });
      this.nodes.push({
        x: xPos,
        y: endY,
        color: color,
        isStart: false,
        isConnected: false,
        connectedTo: null,
      });
    });
    for (let i = 0; i < 4; i++) {
      let rand = Math.floor(Math.random() * 4);
      let tempX = this.nodes[i * 2 + 1].x;
      this.nodes[i * 2 + 1].x = this.nodes[rand * 2 + 1].x;
      this.nodes[rand * 2 + 1].x = tempX;
    }
  }

  update(dt) {
    this.timeLimit -= dt;
    if (this.timeLimit <= 0) {
      miniGameManager.onComplete(false);
    }
  }

  draw() {
    ctx.fillStyle = "#1d1f21";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.nodes.forEach((node) => {
      if (node.connectedTo) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.connectedTo.x, node.connectedTo.y);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      if (!node.isConnected) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    if (this.isDragging && this.startNode) {
      ctx.beginPath();
      ctx.moveTo(this.startNode.x, this.startNode.y);
      ctx.lineTo(this.mousePos.x, this.mousePos.y);
      ctx.strokeStyle = this.startNode.color;
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    ctx.fillStyle = "white";
    ctx.font = "24px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
      ctx.fillText(`Conecte os fios !`, canvas.width / 2, 120);
    ctx.fillText(
      `Tempo restante: ${(this.timeLimit / 1000).toFixed(1)}s`,
      canvas.width / 2,
      80
    );
  }

  handleMouseDown(x, y) {
    this.nodes.forEach((node) => {
      if (
        node.isStart &&
        !node.isConnected &&
        Math.hypot(x - node.x, y - node.y) < 15
      ) {
        this.isDragging = true;
        this.startNode = node;
      }
    });
  }

  handleMouseUp(x, y) {
    if (!this.isDragging) return;

    let success = false;
    this.nodes.forEach((node) => {
      if (
        !node.isStart &&
        !node.isConnected &&
        node.color === this.startNode.color &&
        Math.hypot(x - node.x, y - node.y) < 15
      ) {
        this.startNode.isConnected = true;
        node.isConnected = true;
        this.startNode.connectedTo = node;
        success = true;
      }
    });

    this.isDragging = false;
    this.startNode = null;

    const allConnected =
      this.nodes.filter((n) => n.isStart && n.isConnected).length === 4;
    if (allConnected) {
      miniGameManager.onComplete(true);
    }
  }

  handleMouseMove(x, y) {
    this.mousePos = { x, y };
  }
}

const miniGameManager = {
  currentMiniGame: null,

  start(task) {
    // starting minigame (debug log removed)
    if (task.type === "wiring") {
      this.currentMiniGame = new WiringGame();
      this.currentMiniGame.setup(task);
      this.attachMouseListeners();
    }
  },

  onComplete(isSuccess) {
    // minigame completion (debug log removed)
    this.detachMouseListeners();
    this.currentMiniGame = null;

    if (isSuccess) {
      completeCurrentTask();
    } else {
      gameState = "playing";
      if (backgroundMusic) backgroundMusic.volume = 0.3;
      currentActiveTask = null;
    }
  },

  update(dt) {
    if (this.currentMiniGame) {
      this.currentMiniGame.update(dt);
    }
  },

  draw(ctx) {
    if (this.currentMiniGame) {
      this.currentMiniGame.draw(ctx);
    }
  },

  attachMouseListeners() {
    canvas.addEventListener("mousedown", this.handleCanvasMouseDown);
    canvas.addEventListener("mouseup", this.handleCanvasMouseUp);
    canvas.addEventListener("mousemove", this.handleCanvasMouseMove);
  },

  detachMouseListeners() {
    canvas.removeEventListener("mousedown", this.handleCanvasMouseDown);
    canvas.removeEventListener("mouseup", this.handleCanvasMouseUp);
    canvas.removeEventListener("mousemove", this.handleCanvasMouseMove);
  },

  handleCanvasMouseDown(e) {
    if (miniGameManager.currentMiniGame) {
      const { x, y } = miniGameManager.getMousePos(e);
      miniGameManager.currentMiniGame.handleMouseDown(x, y);
    }
  },

  handleCanvasMouseUp(e) {
    if (miniGameManager.currentMiniGame) {
      const { x, y } = miniGameManager.getMousePos(e);
      miniGameManager.currentMiniGame.handleMouseUp(x, y);
    }
  },

  handleCanvasMouseMove(e) {
    if (miniGameManager.currentMiniGame) {
      const { x, y } = miniGameManager.getMousePos(e);
      miniGameManager.currentMiniGame.handleMouseMove(x, y);
    }
  },

  getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  },
};
const victoryBtn = document.querySelector("#victoryScreen button");

if (victoryBtn) {
  // Remove o evento inline do HTML (se houver) para não dar conflito
  victoryBtn.onclick = null;

  victoryBtn.addEventListener("click", () => {
    // Progress já foi salvo em checkWinCondition - apenas redireciona
    window.location.href = "lobby.html";
  });
}

// ======= DEBUG: Finalizador de Todos os Minigames =======
window.finishAllGames = function() {
  console.log("🎮 Finalizando TODOS os minigames...");
  
  // Marca todos os minigames como concluídos no localStorage
  const gamesProgress = {
    "danger": true,
    "machinery": true,
    "risk": true,
    "firstaid": true,
    "construction": true
  };
  
  localStorage.setItem("safetyGameProgress", JSON.stringify(gamesProgress));
  
  console.log("✅ Todos os minigames foram marcados como concluídos!");
  console.log("📊 Progresso salvo:", gamesProgress);
  console.log("🔗 Para voltar ao menu: window.location.href = 'lobby.html'");
};
