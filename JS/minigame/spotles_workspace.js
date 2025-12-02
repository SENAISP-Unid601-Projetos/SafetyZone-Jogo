const sfx = {
  right: new Audio("./AUD/global/soundeffect_rightchoice.mp3"), // Acerto / Conserto
  wrong: new Audio("./AUD/global/soundeffect_wrongchoice.mp3"), // Erro na identificaÃ§Ã£o
  taskDone: new Audio("./AUD/global/soundeffect_taskdone.mp3"), // MÃ¡quina completada
  victory: new Audio("./AUD/global/soundeffect_medalwin.mp3"), // VitÃ³ria final
  gameOver: new Audio("./AUD/global/soundeffect_gameover.mp3"), // Derrota
  nextLevel: new Audio("./AUD/global/soundeffect_next.mp3"), // Som opcional ao avanÃ§ar de fase (se tiver, senÃ£o use taskDone)
};

// Ajuste de volumes (opcional)
sfx.right.volume = 0.6;
sfx.wrong.volume = 0.5;
sfx.taskDone.volume = 0.7;
sfx.victory.volume = 0.8;
sfx.gameOver.volume = 0.8;

// --- Path fixer para IMG (roteiro mÃ­nimo, nÃ£o altera estruturas existentes) ---
// Mapeia caminhos usados no cÃ³digo para os nomes reais em `IMG/minigame_5/`.
(() => {
  const mapBasename = {
    // metal
    "lataamassada1.png": "resid_metal_lata1.png",
    "lataamassada2.png": "resid_metal_lata2.png",
    "refrirosa.png": "resid_metal_lata3.png",
    "refriverde.png": "resid_metal_lata4.png",
    // plÃ¡stico
    "garrafaplastico.png": "resid_plast_garrafa.png",
    "poteplastico.png": "resid_plast_pote.png",
    "sacoplastico.png": "resid_plast_saco.png",
    // orgÃ¢nico
    "maca.png": "resid_org_maca.png",
    "banana.png": "resid_org_banana.png",
    "ovoquebrado.png": "resid_org_ovo.png",
    // papel
    "boladepapel.png": "resid_papel_bola.png",
    "papelrasgado.png": "resid_papel_folha.png",
    // vidro
    "garrafa1.png": "resid_vidro_garrafa1.png",
    "garrafa2.png": "resid_vidro_garrafa2.png",
    "cacodevidro.png": "resid_vidro_caco.png",
    // eletrÃ´nicos
    "monitorquebrado.png": "resid_elet_monitor.png",
    "cameraquebrada.png": "resid_elet_camera.png",
    "celularquebrado.png": "resid_elet_celular.png",
    "foneouvido.png": "resid_elet_fone.png",
    "pilha.png": "resid_elet_pilha.png",
    "bateria.png": "resid_elet_bateria.png",
    // nÃ£o reciclÃ¡vel
    "cigarro.png": "resid_naoreci_cigarro.png",
    "esponja.png": "resid_naoreci_esponja.png",
    "fitaadesiva.png": "resid_naoreci_fita.png",
    // madeira / mad
    "colher.png": "resid_mad_colher.png",
    "palitos.png": "resid_mad_palito.png",
    // infectante
    "mascaradescartavel.png": "resid_infect_mascara.png",
    "luvadescartavel.png": "resid_infect_luvas.png",
    "avental.png": "resid_infect_avental.png",
    "seringa.png": "resid_infect_seringa.png",
    // radioativo
    "rotuloradioativo.png": "resid_rad_barril.png",
    "garrafaradioativa.png": "resid_rad_garrafa.png",
    "barrilradioativo.png": "resid_rad_barril.png"
  };

  function fixPath(src) {
    if (typeof src !== 'string') return src;
    // Normaliza caminhos que comeÃ§am com ./IMG/
    if (!src.startsWith('./IMG/')) return src;
    const parts = src.replace(/^\.\/IMG\//, '').split('/');
    // Se jÃ¡ for um arquivo direto (ex: map_bg_*.png, trashcan_*.png, clean_*.png)
    if (parts.length === 1) {
      return './IMG/minigame_5/' + parts[0];
    }
    // Se estava em residuos/<file>
    if (parts[0] === 'residuos' && parts[1]) {
      const mapped = mapBasename[parts[1]] || parts[1];
      return './IMG/minigame_5/' + mapped;
    }
    // Para outros casos (mapas, trashcans, clean_*) apenas prefixa a pasta minigame_5
    return './IMG/minigame_5/' + parts.slice(-1)[0];
  }

  const imgDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (imgDesc && imgDesc.set) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      get: imgDesc.get,
      set: function (v) {
        try {
          const fixed = fixPath(v);
          imgDesc.set.call(this, fixed);
        } catch (e) {
          imgDesc.set.call(this, v);
        }
      }
    });
  }
})();

// --- Elementos do DOM ---
const loadingScreen = document.getElementById("loadingScreen");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const victoryScreen = document.getElementById("victoryScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const nextLevelButton = document.getElementById("nextLevelButton"); // NOVO BOTÃƒO (Crie no HTML depois)
const backToMenuButton = document.getElementById("backToMenuButton");
const gameArea = document.getElementById("gameArea");
const overlayMessage = document.getElementById("overlayMessage");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const remainingEl = document.getElementById("remaining");
const levelIndicatorEl = document.getElementById("levelIndicator"); // NOVO: Indicador de nÃ­vel

const trashItemsContainer = document.getElementById("trashItemsContainer");
const binContainer = document.getElementById("binContainer");

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

// --- VARIÃVEIS DE ESTADO DO JOGO ---
let currentPhase = 1;
let currentScenario = 1;
const maxPhases = 3;
const scenariosPerPhase = 5;

let gameState = "start";
let timeRemaining = 60;
let score = 0;
let timerInterval;
let gameRunning = false; // evita reinÃ­cios automÃ¡ticos concorrentes
let placedProducts = [];
let residuosRestantes = 0;
let totalProductsToPlace = 0;
let totalResiduosToBin = 0;

// --- DADOS DOS NÃVEIS (15 CenÃ¡rios) ---
// Estrutura: gameLevels[fase][cenario]
const gameLevels = {
  1: {
    description: "Fase 1: EscritÃ³rio e Ãreas Comuns",
    scenarios: [
      // --- CENÃRIO A: ÃREA DE DESCANSO ---
      {
        id: 1,
        name: "Ãrea de Descanso",
        backgroundImg: "./IMG/minigame_5/map_bg_areadedescanso.png",
        time: 60,
        products: [], // Nenhum produto para organizar neste, apenas lixo
        waste: [
          {
            type: "metal",
            name: "Lata Amassada 1",
            resImg: "./IMG/residuos/lataamassada1.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Lata Amassada 2",
            resImg: "./IMG/residuos/lataamassada2.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Garrafa PlÃ¡stico",
            resImg: "./IMG/residuos/garrafaplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "MaÃ§Ã£",
            resImg: "./IMG/residuos/maca.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "Banana",
            resImg: "./IMG/residuos/banana.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 650,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Saco PlÃ¡stico",
            resImg: "./IMG/residuos/sacoplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "MÃ¡scara Desc.",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Refri Rosa",
            resImg: "./IMG/residuos/refrirosa.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Refri Verde",
            resImg: "./IMG/residuos/refriverde.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 700,
            y: 650,
            points: 10,
            
          },
          
        ],
        // ...existing code...
        
      },
      // --- CENÃRIO B: PORTARIA ---
      {
        id: 2,
        name: "Portaria",
        backgroundImg: "./IMG/minigame_5/map_bg_portaria.png",
        time: 60,
        products: [],
        waste: [
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Cigarro",
            resImg: "./IMG/residuos/cigarro.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 80,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Monitor Queb.",
            resImg: "./IMG/residuos/monitorquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha A",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha B",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha C",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "papel",
            name: "Bola Papel",
            resImg: "./IMG/residuos/boladepapel.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Saco PlÃ¡stico",
            resImg: "./IMG/residuos/sacoplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Pote PlÃ¡stico",
            resImg: "./IMG/residuos/poteplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "papel",
            name: "Papel Rasgado",
            resImg: "./IMG/residuos/papelrasgado.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 600,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "Banana",
            resImg: "./IMG/residuos/banana.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 750,
            y: 650,
            points: 10,
          },
        ],
      },
      // --- CENÃRIO C: VESTIÃRIO ---
      {
        id: 3,
        name: "VestiÃ¡rio",
        backgroundImg: "./IMG/minigame_5/map_bg_vestiario.png",
        time: 60,
        products: [],
        waste: [
          {
            type: "infectante",
            name: "MÃ¡scara A",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "MÃ¡scara B",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Celular Queb.",
            resImg: "./IMG/residuos/celularquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Avental",
            resImg: "./IMG/residuos/avental.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 650,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Garrafa PET",
            resImg: "./IMG/residuos/garrafaplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "CÃ¢mera",
            resImg: "./IMG/residuos/cameraquebrada.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Esponja",
            resImg: "./IMG/residuos/esponja.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Saco PlÃ¡stico",
            resImg: "./IMG/residuos/sacoplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Lata Amassada",
            resImg: "./IMG/residuos/lataamassada1.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 700,
            y: 650,
            points: 10,
          },
        ],
      },
      // --- CENÃRIO D: ARMAZÃ‰M ---
      {
        id: 4,
        name: "ArmazÃ©m",
        backgroundImg: "./IMG/minigame_5/map_bg_armazem.png",
        time: 60,
        products: [],
        waste: [
          {
            type: "eletrÃ´nico",
            name: "Bateria Carro",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 80,
            y: 650,
            points: 10,
          },
          {
            type: "radioativo",
            name: "Barril TÃ³xico",
            resImg: "./IMG/residuos/barrilradioativo.png",
            binImg: "./IMG/trashcan_radioactive.png",
            x: 250,
            y: 650,
            points: 20,
          }, // Pontos extras
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita A",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita B",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 1",
            resImg: "./IMG/residuos/garrafa1.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 2",
            resImg: "./IMG/residuos/garrafa1.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 3",
            resImg: "./IMG/residuos/garrafa2.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 4",
            resImg: "./IMG/residuos/garrafa2.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Monitor Queb.",
            resImg: "./IMG/residuos/monitorquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 650,
            y: 650,
            points: 10,
          },
          {
            type: "madeira",
            name: "Palitos",
            resImg: "./IMG/residuos/palitos.png",
            binImg: "./IMG/trashcan_wood.png",
            x: 800,
            y: 650,
            points: 10,
          },
        ],
      },
      // --- CENÃRIO E: SANITÃRIO (Limpeza + Lixo) ---
      {
        id: 5,
        name: "SanitÃ¡rio",
        backgroundImg: "./IMG/minigame_5/map_bg_sanitario.png",
        time: 90, // Tempo extra pois tem limpeza
        products: [],
        // ...existing code...
        waste: [
          {
            type: "infectante",
            name: "MÃ¡scara",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Seringa",
            resImg: "./IMG/residuos/seringa.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 100,
            y: 650,
            points: 15,
          },
          {
            type: "papel",
            name: "Bola Papel",
            resImg: "./IMG/residuos/boladepapel.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Luva",
            resImg: "./IMG/residuos/luvadescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Avental",
            resImg: "./IMG/residuos/avental.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Esponja Velha",
            resImg: "./IMG/residuos/esponja.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 700,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Esponja Velha",
            resImg: "./IMG/residuos/esponja.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 750,
            y: 650,
            points: 10,
          },
        ],
      },
    ],
  },
  2: {
    description: "Fase 2: Ãreas Operacionais e Lazer",
    scenarios: [
      // --- A. COZINHA ---
      {
        id: 1,
        name: "Cozinha",
        backgroundImg: "./IMG/minigame_5/map_bg_cozinha.png", // Certifique-se de ter essa imagem ou o fundo ficarÃ¡ verde
        time: 70,
        products: [],
        waste: [
          {
            type: "madeira",
            name: "Colher Madeira 1",
            resImg: "./IMG/residuos/colher.png",
            binImg: "./IMG/trashcan_wood.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "madeira",
            name: "Colher Madeira 2",
            resImg: "./IMG/residuos/colher.png",
            binImg: "./IMG/trashcan_wood.png",
            x: 150,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "MaÃ§Ã£",
            resImg: "./IMG/residuos/maca.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "Ovo Quebrado 1",
            resImg: "./IMG/residuos/ovoquebrado.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "Ovo Quebrado 2",
            resImg: "./IMG/residuos/ovoquebrado.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "Banana 1",
            resImg: "./IMG/residuos/banana.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "Banana 2",
            resImg: "./IMG/residuos/banana.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Esponja",
            resImg: "./IMG/residuos/esponja.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 650,
            y: 650,
            points: 10,
          },
          {
            type: "madeira",
            name: "Palito",
            resImg: "./IMG/residuos/palitos.png",
            binImg: "./IMG/trashcan_wood.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Luva Desc.",
            resImg: "./IMG/residuos/luvadescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "MÃ¡scara",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Caco de Vidro",
            resImg: "./IMG/residuos/cacodevidro.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 450,
            y: 650,
            points: 15,
          }, // Mais pontos por perigo
          {
            type: "plÃ¡stico",
            name: "Saco PlÃ¡stico",
            resImg: "./IMG/residuos/sacoplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 600,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Refri Verde",
            resImg: "./IMG/residuos/refriverde.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 700,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Refri Rosa",
            resImg: "./IMG/residuos/refrirosa.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 750,
            y: 650,
            points: 10,
          },
        ],
      },
      // --- B. ESTACIONAMENTO ---
      {
        id: 2,
        name: "Estacionamento",
        backgroundImg: "./IMG/minigame_5/map_bg_estacionamento.png",
        time: 70,
        products: [],
        waste: [
          {
            type: "eletrÃ´nico",
            name: "Bateria 1",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 80,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria 2",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 140,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Cigarro 1",
            resImg: "./IMG/residuos/cigarro.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Cigarro 2",
            resImg: "./IMG/residuos/cigarro.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 230,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Cigarro 3",
            resImg: "./IMG/residuos/cigarro.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 260,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Celular Queb.",
            resImg: "./IMG/residuos/celularquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "Banana",
            resImg: "./IMG/residuos/banana.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 1",
            resImg: "./IMG/residuos/garrafa1.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 2",
            resImg: "./IMG/residuos/garrafa2.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 160,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Garrafa PET 1",
            resImg: "./IMG/residuos/garrafaplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Garrafa PET 2",
            resImg: "./IMG/residuos/garrafaplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "MÃ¡scara",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Lata 1",
            resImg: "./IMG/residuos/lataamassada1.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 650,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Lata 2",
            resImg: "./IMG/residuos/lataamassada2.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 700,
            y: 650,
            points: 10,
          },
        ],
      },
      // --- C. OFICINA DE MANUTENÃ‡ÃƒO ---
      {
        id: 3,
        name: "Oficina de ManutenÃ§Ã£o",
        backgroundImg: "./IMG/minigame_5/map_bg_oficinademanutencao.png",
        time: 100,
        products: [],
        // ...existing code...
        waste: [
          {
            type: "eletrÃ´nico",
            name: "Fone Ouvido",
            resImg: "./IMG/residuos/foneouvido.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Monitor",
            resImg: "./IMG/residuos/monitorquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 200,
            y: 650,
            points: 15,
          },
          {
            type: "papel",
            name: "Bola Papel",
            resImg: "./IMG/residuos/boladepapel.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "papel",
            name: "Papel Rasgado",
            resImg: "./IMG/residuos/papelrasgado.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha A",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Saco PlÃ¡stico",
            resImg: "./IMG/residuos/sacoplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha B",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Avental",
            resImg: "./IMG/residuos/avental.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 650,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Luva",
            resImg: "./IMG/residuos/luvadescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Pote PlÃ¡stico",
            resImg: "./IMG/residuos/poteplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 750,
            y: 650,
            points: 10,
          },
        ],
      },
      // --- D. REFEITÃ“RIO ---
      {
        id: 4,
        name: "RefeitÃ³rio",
        backgroundImg: "./IMG/minigame_5/map_bg_refeitorio.png",
        time: 70,
        products: [],
        waste: [
          {
            type: "plÃ¡stico",
            name: "Garrafa PET 1",
            resImg: "./IMG/residuos/garrafaplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 80,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Garrafa PET 2",
            resImg: "./IMG/residuos/garrafaplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 120,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Garrafa PET 3",
            resImg: "./IMG/residuos/garrafaplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 160,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Saco PlÃ¡stico 1",
            resImg: "./IMG/residuos/sacoplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Saco PlÃ¡stico 2",
            resImg: "./IMG/residuos/sacoplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Refri Verde",
            resImg: "./IMG/residuos/refriverde.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Refri Rosa",
            resImg: "./IMG/residuos/refrirosa.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Lata 1",
            resImg: "./IMG/residuos/lataamassada1.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Lata 2",
            resImg: "./IMG/residuos/lataamassada2.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 600,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "MaÃ§Ã£ 1",
            resImg: "./IMG/residuos/maca.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "MaÃ§Ã£ 2",
            resImg: "./IMG/residuos/maca.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 150,
            y: 650,
            points: 10,
          },
          {
            type: "orgÃ¢nico",
            name: "Banana",
            resImg: "./IMG/residuos/banana.png",
            binImg: "./IMG/trashcan_organic.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "madeira",
            name: "Colher",
            resImg: "./IMG/residuos/colher.png",
            binImg: "./IMG/trashcan_wood.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "madeira",
            name: "Palitos",
            resImg: "./IMG/residuos/palitos.png",
            binImg: "./IMG/trashcan_wood.png",
            x: 600,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Caco Vidro",
            resImg: "./IMG/residuos/cacodevidro.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 700,
            y: 650,
            points: 15,
          },
        ],
      },
      // --- E. LOGÃSTICA ---
      {
        id: 5,
        name: "LogÃ­stica",
        backgroundImg: "./IMG/minigame_5/map_bg_logistica.png",
        time: 75,
        products: [],
        waste: [
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva 1",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 80,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Cigarro 1",
            resImg: "./IMG/residuos/cigarro.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 150,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Cigarro 2",
            resImg: "./IMG/residuos/cigarro.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 180,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Cigarro 3",
            resImg: "./IMG/residuos/cigarro.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 210,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria A",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria B",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "radioativo",
            name: "Barril TÃ³xico 1",
            resImg: "./IMG/residuos/barrilradioativo.png",
            binImg: "./IMG/trashcan_radioactive.png",
            x: 80,
            y: 650,
            points: 20,
          },
          {
            type: "radioativo",
            name: "Barril TÃ³xico 2",
            resImg: "./IMG/residuos/barrilradioativo.png",
            binImg: "./IMG/trashcan_radioactive.png",
            x: 200,
            y: 650,
            points: 20,
          },
          {
            type: "metal",
            name: "Lata 1",
            resImg: "./IMG/residuos/lataamassada1.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Lata 2",
            resImg: "./IMG/residuos/lataamassada2.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Celular Queb.",
            resImg: "./IMG/residuos/celularquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Caco Vidro 1",
            resImg: "./IMG/residuos/cacodevidro.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 600,
            y: 650,
            points: 15,
          },
          {
            type: "vidro",
            name: "Caco Vidro 2",
            resImg: "./IMG/residuos/cacodevidro.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 650,
            y: 650,
            points: 15,
          },
          {
            type: "infectante",
            name: "MÃ¡scara",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 700,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva 2",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 750,
            y: 650,
            points: 10,
          },
        ],
      },
    ],
  },
  3: {
    description: "Fase 3: CenÃ¡rios Finais e Limpeza Profunda",
    scenarios: [
      // --- A. LINHA DE MONTAGEM (20 ITENS) ---
      {
        id: 1,
        name: "Linha de Montagem",
        backgroundImg: "./IMG/minigame_5/map_bg_linhademontagem.png",
        time: 100, // Tempo extra por limpeza
        products: [],
        // ...existing code...
        waste: [
          {
            type: "eletrÃ´nico",
            name: "Pilha 1",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha 2",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 150,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva 1",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva 2",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria 1",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria 2",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Caco de Vidro",
            resImg: "./IMG/residuos/cacodevidro.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 400,
            y: 650,
            points: 15,
          },
          {
            type: "infectante",
            name: "MÃ¡scara",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Luva Desc.",
            resImg: "./IMG/residuos/luvadescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Avental",
            resImg: "./IMG/residuos/avental.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 700,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Fone Ouvido",
            resImg: "./IMG/residuos/foneouvido.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 1",
            resImg: "./IMG/residuos/garrafa1.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 2",
            resImg: "./IMG/residuos/garrafa2.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Garrafa PET",
            resImg: "./IMG/residuos/garrafaplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "papel",
            name: "Papel Rasgado 1",
            resImg: "./IMG/residuos/papelrasgado.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "papel",
            name: "Papel Rasgado 2",
            resImg: "./IMG/residuos/papelrasgado.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 600,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Monitor",
            resImg: "./IMG/residuos/monitorquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 700,
            y: 650,
            points: 15,
          },
        ],
      },
      // --- B. LABORATÃ“RIO (20 ITENS) ---
      {
        id: 2,
        name: "LaboratÃ³rio",
        backgroundImg: "./IMG/minigame_5/map_bg_laboratorio.png",
        time: 85,
        products: [],
        waste: [
          {
            type: "infectante",
            name: "Seringa 1",
            resImg: "./IMG/residuos/seringa.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 80,
            y: 650,
            points: 15,
          },
          {
            type: "infectante",
            name: "Seringa 2",
            resImg: "./IMG/residuos/seringa.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 120,
            y: 650,
            points: 15,
          },
          {
            type: "radioativo",
            name: "RÃ³tulo R.",
            resImg: "./IMG/residuos/rotuloradioativo.png",
            binImg: "./IMG/trashcan_radioactive.png",
            x: 180,
            y: 650,
            points: 20,
          },
          {
            type: "radioativo",
            name: "Garrafa R. 1",
            resImg: "./IMG/residuos/garrafaradioativa.png",
            binImg: "./IMG/trashcan_radioactive.png",
            x: 250,
            y: 650,
            points: 20,
          },
          {
            type: "radioativo",
            name: "Garrafa R. 2",
            resImg: "./IMG/residuos/garrafaradioativa.png",
            binImg: "./IMG/trashcan_radioactive.png",
            x: 300,
            y: 650,
            points: 20,
          },
          {
            type: "radioativo",
            name: "Barril R. 1",
            resImg: "./IMG/residuos/barrilradioativo.png",
            binImg: "./IMG/trashcan_radioactive.png",
            x: 380,
            y: 650,
            points: 20,
          },
          {
            type: "radioativo",
            name: "Barril R. 2",
            resImg: "./IMG/residuos/barrilradioativo.png",
            binImg: "./IMG/trashcan_radioactive.png",
            x: 450,
            y: 650,
            points: 20,
          },
          {
            type: "vidro",
            name: "Caco de Vidro 1",
            resImg: "./IMG/residuos/cacodevidro.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 500,
            y: 650,
            points: 15,
          },
          {
            type: "vidro",
            name: "Caco de Vidro 2",
            resImg: "./IMG/residuos/cacodevidro.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 550,
            y: 650,
            points: 15,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 1",
            resImg: "./IMG/residuos/garrafa1.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 600,
            y: 650,
            points: 10,
          },
          {
            type: "vidro",
            name: "Garrafa Vidro 2",
            resImg: "./IMG/residuos/garrafa2.png",
            binImg: "./IMG/trashcan_glass.png",
            x: 650,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha 1",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 700,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha 2",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 750,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Pote PlÃ¡stico",
            resImg: "./IMG/residuos/poteplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 80,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Avental 1",
            resImg: "./IMG/residuos/avental.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 150,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Avental 2",
            resImg: "./IMG/residuos/avental.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Luva 1",
            resImg: "./IMG/residuos/luvadescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Luva 2",
            resImg: "./IMG/residuos/luvadescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "MÃ¡scara 1",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "MÃ¡scara 2",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 550,
            y: 650,
            points: 10,
          },
        ],
      },
      // --- C. ESCRITÃ“RIO (20 ITENS, INCLUI PRODUTOS) ---
      {
        id: 3,
        name: "EscritÃ³rio",
        backgroundImg: "./IMG/minigame_5/map_bg_escritorio.png",
        time: 110,
        products: [],
        waste: [
          {
            type: "eletrÃ´nico",
            name: "Monitor",
            resImg: "./IMG/residuos/monitorquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 80,
            y: 650,
            points: 15,
          },
          {
            type: "papel",
            name: "Papel Rasgado 1",
            resImg: "./IMG/residuos/papelrasgado.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 150,
            y: 650,
            points: 10,
          },
          {
            type: "papel",
            name: "Papel Rasgado 2",
            resImg: "./IMG/residuos/papelrasgado.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "papel",
            name: "Bola de Papel 1",
            resImg: "./IMG/residuos/boladepapel.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "papel",
            name: "Bola de Papel 2",
            resImg: "./IMG/residuos/boladepapel.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Lata 1",
            resImg: "./IMG/residuos/lataamassada1.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "metal",
            name: "Lata 2",
            resImg: "./IMG/residuos/lataamassada2.png",
            binImg: "./IMG/trashcan_metal.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Fone Ouvido",
            resImg: "./IMG/residuos/foneouvido.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha 1",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha 2",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 550,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 600,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Celular Queb.",
            resImg: "./IMG/residuos/celularquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 650,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Pote PlÃ¡stico",
            resImg: "./IMG/residuos/poteplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 700,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "MÃ¡scara",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 750,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Saco PlÃ¡stico",
            resImg: "./IMG/residuos/sacoplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 80,
            y: 650,
            points: 10,
          },
          {
            type: "madeira",
            name: "Palitos",
            resImg: "./IMG/residuos/palitos.png",
            binImg: "./IMG/trashcan_wood.png",
            x: 150,
            y: 650,
            points: 10,
          },
        ],
      },
      // --- D. SALA DE MAQUINÃRIOS (20 ITENS, INCLUI PRODUTOS) ---
      {
        id: 4,
        name: "Sala de MaquinÃ¡rios",
        backgroundImg: "./IMG/minigame_5/map_bg_salademaquinarios.png",
        time: 120,
        products: [],
        waste: [
          {
            type: "eletrÃ´nico",
            name: "Bateria 1",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria 2",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 150,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria 3",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 200,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha 1",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha 2",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Luva 1",
            resImg: "./IMG/residuos/luvadescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Luva 2",
            resImg: "./IMG/residuos/luvadescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Saco PlÃ¡stico",
            resImg: "./IMG/residuos/sacoplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "plÃ¡stico",
            name: "Garrafa PET",
            resImg: "./IMG/residuos/garrafaplastico.png",
            binImg: "./IMG/trashcan_plastic.png",
            x: 500,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Monitor",
            resImg: "./IMG/residuos/monitorquebrado.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 550,
            y: 650,
            points: 15,
          },
          {
            type: "papel",
            name: "Papel Rasgado",
            resImg: "./IMG/residuos/papelrasgado.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 100,
            y: 650,
            points: 10,
          },
          {
            type: "radioativo",
            name: "Barril R.",
            resImg: "./IMG/residuos/barrilradioativo.png",
            binImg: "./IMG/trashcan_radioactive.png",
            x: 200,
            y: 650,
            points: 20,
          },
          {
            type: "eletrÃ´nico",
            name: "CÃ¢mera Queb.",
            resImg: "./IMG/residuos/cameraquebrada.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "MÃ¡scara",
            resImg: "./IMG/residuos/mascaradescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 400,
            y: 650,
            points: 10,
          },
          // D15 e D16 agora em 'products' acima
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Sujeira ChÃ£o 3",
            resImg: "./IMG/residuos/pocadeagua.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 600,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Sujeira ChÃ£o 4",
            resImg: "./IMG/residuos/pocadeagua.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 700,
            y: 650,
            points: 10,
          },
        ],
      },
      // --- E. SALA DE FERRAMENTAS (20 ITENS, INCLUI PRODUTOS) ---
      {
        id: 5,
        name: "Sala de Ferramentas",
        backgroundImg: "./IMG/minigame_5/map_bg_saladeferramentas.png",
        time: 130,
        products: [
          // PRODUTO: Produto de Limpeza para colocar no suporte
          {
            type: "produto",
            name: "Produto Limpeza 1",
            resImg: "./IMG/residuos/produtolimpeza.png",
            actionType: "putOnHolder",
            binImg: "./IMG/holder_clean.png",
            x: 500,
            y: 650,
            points: 15,
          },
          {
            type: "produto",
            name: "Produto Limpeza 2",
            resImg: "./IMG/residuos/produtolimpeza.png",
            actionType: "putOnHolder",
            binImg: "./IMG/holder_clean.png",
            x: 550,
            y: 650,
            points: 15,
          },
        ],
        products: [],
        waste: [
          {
            type: "madeira",
            name: "Colher",
            resImg: "./IMG/residuos/colher.png",
            binImg: "./IMG/trashcan_wood.png",
            x: 80,
            y: 650,
            points: 10,
          },
          {
            type: "madeira",
            name: "Palitos",
            resImg: "./IMG/residuos/palitos.png",
            binImg: "./IMG/trashcan_wood.png",
            x: 120,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Fone Ouvido",
            resImg: "./IMG/residuos/foneouvido.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 180,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria 1",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 250,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Bateria 2",
            resImg: "./IMG/residuos/bateria.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 300,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha 1",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 350,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "Pilha 2",
            resImg: "./IMG/residuos/pilha.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 400,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva 1",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 450,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Fita Adesiva 2",
            resImg: "./IMG/residuos/fitaadesiva.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 700,
            y: 650,
            points: 10,
          },
          {
            type: "eletrÃ´nico",
            name: "CÃ¢mera Queb.",
            resImg: "./IMG/residuos/cameraquebrada.png",
            binImg: "./IMG/trashcan_electronics.png",
            x: 750,
            y: 650,
            points: 10,
          },
          {
            type: "nÃ£o-reciclÃ¡vel",
            name: "Esponja",
            resImg: "./IMG/residuos/esponja.png",
            binImg: "./IMG/trashcan_non-recyclable.png",
            x: 80,
            y: 650,
            points: 10,
          },
          {
            type: "papel",
            name: "Papel Rasgado",
            resImg: "./IMG/residuos/papelrasgado.png",
            binImg: "./IMG/trashcan_paper.png",
            x: 150,
            y: 650,
            points: 10,
          },
          {
            type: "infectante",
            name: "Luva",
            resImg: "./IMG/residuos/luvadescartavel.png",
            binImg: "./IMG/trashcan_infectante.png",
            x: 200,
            y: 650,
            points: 10,
          },
        ],
      },
    ],
  },
};

// --- FunÃ§Ãµes Auxiliares ---

function showScreen(screen) {
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";
  gameScreen.style.display = "none";
  binContainer.style.display = "none";

  switch (screen) {
    case "start":
      startScreen.style.display = "flex";
      // Ao voltar para a tela de inÃ­cio, garantimos que nenhum timer continue rodando
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      gameRunning = false;
      break;
    case "game":
      gameScreen.style.display = "flex";
      binContainer.style.display = "flex";
      gameState = "playing";
      break;
    case "game_over":
      gameOverScreen.style.display = "flex";
      gameState = "ended";
      // Parar estado de execuÃ§Ã£o para evitar reentrÃ¢ncia automÃ¡tica
      gameRunning = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      break;
    case "victory":
      // Verifica se acabou tudo ou se tem mais fases
      const isLastLevel =
        currentPhase === maxPhases && currentScenario === scenariosPerPhase;

      document.getElementById("victoryTitle").textContent = isLastLevel
        ? "JOGO FINALIZADO!"
        : "Cenário Concluido!";
      document.getElementById(
        "victoryScore"
      ).textContent = `Pontuação: ${score}`;

      // Mostra medalha apenas no final
      const medalImg = victoryScreen.querySelector("img");
      if (medalImg) {
        if (isLastLevel) {
          medalImg.classList.add("show-medal");
          sfx.victory.play();
        } else {
          medalImg.classList.remove("show-medal");
        }
      }

      // Configura o botão de próximo
      if (isLastLevel) {
        nextLevelButton.style.display = "none"; // Acabou o jogo
      } else {
        nextLevelButton.style.display = "inline-block";
        nextLevelButton.textContent = "Próximo Cenário >>";
        nextLevelButton.onclick = goToNextLevel;
      }

      victoryScreen.style.display = "flex";
      gameState = "ended";
      gameRunning = false;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      break;
  }
}

function showOverlayText(message) {
  overlayMessage.textContent = message;
  // Aplica fonte Consolas apenas para a mensagem especÃ­fica "Lixeira errada!"
  try {
    const msgStr = message ? message.toString() : "";
    // Aplica Consolas para mensagens especÃ­ficas: erro, acerto ou indicador de fase/cenÃ¡rio
    const isTrashWrong = msgStr.includes("Lixeira errada");
    const isDiscardOk = msgStr.includes("Descartado corretamente");
    const isPhaseIndicator = msgStr.includes("Fase") && msgStr.includes("Cenário");

    if (isTrashWrong || isDiscardOk || isPhaseIndicator) {
      overlayMessage.style.fontFamily = "Consolas, 'Consola', monospace";
    } else {
      overlayMessage.style.fontFamily = "";
    }
  } catch (e) {
    // Em caso de qualquer problema, nÃ£o bloquear a exibiÃ§Ã£o da mensagem
  }

  overlayMessage.style.display = "block";
  setTimeout(() => {
    overlayMessage.style.display = "none";
    try {
      overlayMessage.style.fontFamily = ""; // reset apÃ³s ocultar
    } catch (e) {}
  }, 1500);
}

function updateHUD() {
  timerEl.textContent = `Tempo: ${timeRemaining}s`;
  scoreEl.textContent = `Pontos: ${score}`;

  // Atualiza indicador de nÃ­vel (Ex: Fase 1 - 2/5)
  const levelText = document.getElementById("levelIndicator");
  if (levelText) {
    levelText.textContent = `Fase ${currentPhase} | Cenário ${currentScenario}/${scenariosPerPhase}`;
  }

  const itemsRestantes = totalProductsToPlace - placedProducts.length;
  const statusText = `Residuos: ${residuosRestantes}`;
  
  remainingEl.textContent = statusText;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateHUD();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      sfx.gameOver.play();
      showScreen("game_over");
    }
  }, 1000);
}

function checkPhaseComplete() {
  // Verifica as condiÃ§Ãµes: produtos organizados e lixo descartado
  const productsComplete = placedProducts.length === totalProductsToPlace;
  const wasteComplete = residuosRestantes === 0;

  if (productsComplete && wasteComplete) {
    clearInterval(timerInterval);
    sfx.taskDone.play();
    // Pequeno delay para o jogador ver a Ãºltima aÃ§Ã£o
    setTimeout(() => {
      showScreen("victory");
    }, 500);
  }
}

// --- CARREGAMENTO DE NÃVEL (LÃ³gica Principal) ---

function loadLevel(phase, scenario) {
  // Garante que nÃ£o quebre se a fase nÃ£o existir
  if (!gameLevels[phase] || !gameLevels[phase].scenarios[scenario - 1]) {
    alert("Fim da Fase ou Fase em construÃ§Ã£o!");
    backToMenuButton.click();
    return;
  }

  const phaseData = gameLevels[phase];
  const levelData = phaseData.scenarios[scenario - 1];
  // --- NOVO CÃ“DIGO PARA O BACKGROUND ---
  const workspaceEl = document.getElementById("gameArea");

  if (levelData.backgroundImg) {
    // Aplica a imagem definida no JSON
    workspaceEl.style.backgroundImage = `url('${levelData.backgroundImg}')`;
    workspaceEl.style.backgroundSize = "cover";
  } else {
    // Fallback: se nÃ£o tiver imagem, deixa verde claro ou outra cor padrÃ£o
    workspaceEl.style.backgroundImage = "none";
    workspaceEl.style.backgroundColor = "#90ee90";
  }
  // -------------------------------------
  // Reset
  timeRemaining = levelData.time;
  placedProducts = [];
  const currentProducts = levelData.products || []; // ProteÃ§Ã£o contra null
  const currentWaste = levelData.waste || []; // ProteÃ§Ã£o contra null

  totalProductsToPlace = currentProducts.length;
  totalResiduosToBin = currentWaste.length;
  residuosRestantes = totalResiduosToBin;

  // Targets/suportes removidos (nÃ£o necessÃ¡rios neste fluxo).

  // 2. Bins (Lixeiras na direita)
  binContainer.innerHTML = "";
  // Pega tipos Ãºnicos de lixo presentes neste nÃ­vel
  const allPossibleBins = [
    { type: "metal", label: "", img: "./IMG/minigame_5/trashcan_metal.png" },
    { type: "plÃ¡stico", label: "", img: "./IMG/minigame_5/trashcan_plastic.png" },
    { type: "papel", label: "", img: "./IMG/minigame_5/trashcan_paper.png" },
    { type: "orgÃ¢nico", label: "", img: "./IMG/minigame_5/trashcan_organic.png" },
    { type: "vidro", label: "", img: "./IMG/minigame_5/trashcan_glass.png" },
    { type: "infectante", label: "", img: "./IMG/minigame_5/trashcan_infectante.png" },
    {
      type: "nÃ£o-reciclÃ¡vel",
      label: "",
      img: "./IMG/minigame_5/trashcan_non-recyclable.png",
    },
    { type: "eletrÃ´nico", label: "", img: "./IMG/minigame_5/trashcan_electronics.png" },
    { type: "madeira", label: "", img: "./IMG/minigame_5/trashcan_wood.png" },
    { type: "radioativo", label: "", img: "./IMG/minigame_5/trashcan_radioactive.png" },
  ];
  const uniqueBinTypes = [...new Set(currentWaste.map((w) => w.type))];

  allPossibleBins.forEach((binData) => {
    const binDiv = document.createElement("div");
    binDiv.id = binData.type + "Bin";
    binDiv.className = "bin-slot";
    binDiv.dataset.type = binData.type;

    binDiv.innerHTML = `
            <img src="${binData.img}" alt="Lixeira ${binData.label}" class="bin-image">
            <span class="text-xs text-center capitalize">${binData.label}</span>
        `;

    binDiv.addEventListener("dragover", handleTargetDragOver);
    binDiv.addEventListener("dragleave", handleTargetDragLeave);
    binDiv.addEventListener("drop", handleBinDrop);

    binContainer.appendChild(binDiv);
  });

  // 3. Renderiza Itens (Produtos de Limpeza no centro, Lixo em baixo)
  trashItemsContainer.innerHTML = "";

  // ResÃ­duos (lixo tradicional)
  currentWaste.forEach((residuo, index) => {
    // Passamos o index para identificar unicamente qual pedaÃ§o de lixo Ã©
    createItemElement(residuo, "residuo", trashItemsContainer, index);
  });

  updateHUD();
}

// FunÃ§Ã£o auxiliar para criar itens (DRY - Don't Repeat Yourself)
function createItemElement(data, category, container, index = null) {
  const item = document.createElement("img");
  item.src = data.resImg || data.itemImg; // Suporta os dois nomes de propriedade
  item.alt = data.name;
  item.title = data.name; // Tooltip

  // Classes CSS baseadas na categoria
  item.className = category === "product" ? "product-item" : "residuo-item";

  // Dados
  item.dataset.points = data.points;
  item.draggable = true;

  // PosiÃ§Ã£o
  item.style.left = `${data.x}px`;
  item.style.top = `${data.y}px`;

  // Identificadores Ãºnicos
  if (category === "product") {
    item.id = data.id + "Item";
    item.dataset.type = data.id;
    item.addEventListener(
      "dragstart",
      createDragStartHandler(item, data.id, "product")
    );
  } else {
    // ResÃ­duos precisam de ID Ãºnico (index) pois podem ter vÃ¡rios do mesmo tipo
    item.dataset.type = data.type;
    item.dataset.index = index;
    item.addEventListener(
      "dragstart",
      createDragStartHandler(item, `residuo-${index}`, data.type)
    );
  }

  item.addEventListener("dragend", createDragEndHandler(item));
  container.appendChild(item);
}

// --- FunÃ§Ãµes para Sujeira ---
function createDirtElement(data, container, index) {
  // Usamos uma <div> com background-image para suportar spritesheets
  const item = document.createElement("div");
  item.className = "residuo-item dirt-item dirt-sprite";
  item.dataset.type = "dirt";
  item.dataset.dirtId = data.id;
  item.dataset.dirtIndex = index;
  item.dataset.points = data.points || 10;
  item.draggable = false; // A sujeira nÃ£o Ã© arrastada, Ã© o produto que vai atÃ© ela

  // PosiÃ§Ã£o no cenÃ¡rio
  item.style.left = `${data.x}px`;
  item.style.top = `${data.y}px`;
  item.title = data.name + " (clique ou arraste produto para limpar)";
  item.style.cursor = "pointer";
  item.style.opacity = "0.95";

  // DimensÃµes (permite override via data.width/data.height)
  const w = data.width || 120;
  const h = data.height || 120;
  item.style.width = `${w}px`;
  item.style.height = `${h}px`;

  // Configura spritesheet como background
  const frames = data.frames && Number(data.frames) > 0 ? Number(data.frames) : 4;
  const frameDelay = data.frameDelay || 250; // ms
  item.style.backgroundImage = `url('${data.img}')`;
  // Ajusta background-size para que cada frame ocupe 1/frame da largura
  item.style.backgroundSize = `${frames * 100}% 100%`;
  item.style.backgroundRepeat = 'no-repeat';
  item.style.backgroundPosition = '0% 0%';

  // AnimaÃ§Ã£o: ciclar frames
  let frameIndex = 0;
  const animId = setInterval(() => {
    frameIndex = (frameIndex + 1) % frames;
    // cada deslocamento Ã© -frameIndex * 100%
    item.style.backgroundPosition = `-${frameIndex * 100}% 0%`;
  }, frameDelay);
  // Guarda id para limpeza posterior
  item.dataset.animId = animId;

  // Adicionar drop listener para aceitar produtos de limpeza
  item.addEventListener("dragover", handleDirtDragOver);
  item.addEventListener("dragleave", handleDirtDragLeave);
  item.addEventListener("drop", handleDirtClean);

  container.appendChild(item);
}

// --- Handlers para Drag-Drop de Limpeza ---
function handleDirtDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-hover");
  e.currentTarget.style.filter = "brightness(1.2)";
}

function handleDirtDragLeave(e) {
  e.currentTarget.classList.remove("drag-hover");
  e.currentTarget.style.filter = "brightness(0.9)";
}

function handleDirtClean(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-hover");
  e.currentTarget.style.filter = "brightness(0.9)";

  const itemType = e.dataTransfer.getData("item-type");
  const itemId = e.dataTransfer.getData("item-id");
  const dirtIndex = e.currentTarget.dataset.dirtIndex;

  // Verifica se Ã© um produto de limpeza
  if (itemType === "cleaning-product") {
    sfx.right.currentTime = 0;
    sfx.right.play();

    const points = parseInt(e.currentTarget.dataset.points) || 10;
    score += points;
    dirtCleaned++;
    dirtRestantes--;

    // Encontrar o elemento de sujeira e remover
    const dirtEl = trashItemsContainer.querySelector(
      `[data-dirt-index="${dirtIndex}"]`
    );
    if (dirtEl) {
      // limpar animaÃ§Ã£o se houver
      const animId = dirtEl.dataset.animId;
      if (animId) {
        try {
          clearInterval(Number(animId));
        } catch (e) {}
      }
      dirtEl.style.transition = "opacity 0.3s ease-out";
      dirtEl.style.opacity = "0";
      setTimeout(() => dirtEl.remove(), 300);
    }

    showOverlayText(
      `${e.currentTarget.dataset.name || "Sujeira"} limpa! +${points} pts`
    );
    updateHUD();
    checkPhaseComplete();
  } else {
    sfx.wrong.currentTime = 0;
    sfx.wrong.play();
    showOverlayText("Use um produto de limpeza!");
  }
}

// --- Handlers GenÃ©ricos (Mantidos iguais, pequena alteraÃ§Ã£o no drop produto) ---

function createDragStartHandler(itemEl, itemId, itemType = "product") {
  return (e) => {
    e.dataTransfer.setData("item-id", itemId);
    e.dataTransfer.setData("item-type", itemType);
    e.dataTransfer.setData("residuo-type", itemEl.dataset.type);
    e.dataTransfer.setData("name", itemEl.alt);
    itemEl.classList.add("is-dragging");
  };
}

function createDragEndHandler(itemEl) {
  return () => {
    itemEl.classList.remove("is-dragging");
  };
}

function handleTargetDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drag-hover");
}

function handleTargetDragLeave(e) {
  e.currentTarget.classList.remove("drag-hover");
}

// Recebe a lista de produtos do nÃ­vel atual para buscar dados
function handleProductDrop(e, currentLevelProducts) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-hover");
  const itemId = e.dataTransfer.getData("item-id");
  const itemType = e.dataTransfer.getData("item-type");
  const targetType = e.currentTarget.dataset.type;

  if (itemType !== "product" || placedProducts.includes(itemId)) return;

  if (itemId === targetType) {
    sfx.right.currentTime = 0;
    sfx.right.play();
    const productData = currentLevelProducts.find((p) => p.id === itemId);
    placedProducts.push(itemId);
    score += parseInt(productData.points);
    showOverlayText(`${productData.name} organizado!`);

    e.currentTarget.querySelector(".target-image").src =
      productData.targetFullImg;
    const itemEl = document.getElementById(itemId + "Item");
    if (itemEl) itemEl.remove(); // Remove do DOM completamente

    updateHUD();
    checkPhaseComplete();
  } else {
    sfx.wrong.currentTime = 0;
    sfx.wrong.play();
    showOverlayText("Suporte errado!");
  }
}

function handleBinDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-hover");
  const draggedType = e.dataTransfer.getData("residuo-type");
  const itemId = e.dataTransfer.getData("item-id");
  const targetBinType = e.currentTarget.dataset.type;

  if (!itemId.startsWith("residuo-")) return;

  if (draggedType === targetBinType) {
    sfx.right.currentTime = 0;
    sfx.right.play();
    const draggedIndex = itemId.split("-")[1];
    const itemToRemove = trashItemsContainer.querySelector(
      `[data-index="${draggedIndex}"]`
    );

    if (itemToRemove) {
      score += parseInt(itemToRemove.dataset.points);
      residuosRestantes--;
      itemToRemove.remove();
      showOverlayText(`Descartado corretamente!`);
    }
  } else {
    sfx.wrong.currentTime = 0;
    sfx.wrong.play();
    showOverlayText(`Lixeira errada!`);
    score = Math.max(0, score - 5); // Penalidade opcional
  }

  updateHUD();
  checkPhaseComplete();
}

// --- Controle de Fluxo do Jogo ---

function startGame() {
  // Reinicia do zero, sÃ³ se nÃ£o estiver rodando
  if (gameRunning) return;
  gameRunning = true;
  currentPhase = 1;
  currentScenario = 1;
  score = 0;
  startLevel();
}

function startLevel() {
  // Protege contra chamadas redundantes
  if (gameRunning === false) gameRunning = true;
  loadLevel(currentPhase, currentScenario);
  showOverlayText(`Fase ${currentPhase}: Cenário ${currentScenario}`);
  startTimer();
  showScreen("game");
}

function goToNextLevel() {
  currentScenario++;
  if (currentScenario > scenariosPerPhase) {
    currentScenario = 1;
    currentPhase++;
  }

  if (currentPhase > maxPhases) {
    // Vitória Final
    alert("Você completou todo o treinamento!");
    // Redirecionar ou resetar
    backToMenuButton.click();
  } else {
    startLevel();
  }
}

// --- BotÃµes ---
startButton.onclick = startGame;

// Reiniciar NÃ­vel Atual (nÃ£o o jogo todo)
restartButton.onclick = () => {
  // ReinÃ­cio intencional pelo jogador
  score = 0; // Opcional: zerar score ao reiniciar nÃ­vel
  gameRunning = true;
  startLevel();
};

// BotÃ£o Voltar ao Menu
backToMenuButton.onclick = () => {
  const currentProgress = JSON.parse(
    localStorage.getItem("safetyGameProgress") || "{}"
  );
  currentProgress["construction"] = true; // Marca como feito
  localStorage.setItem("safetyGameProgress", JSON.stringify(currentProgress));
  window.location.href = "lobby.html";
};

// InicializaÃ§Ã£o
document.addEventListener("DOMContentLoaded", () => {
  // Loading screen removed â€” directly show start screen. If loadingScreen exists, hide it.
  if (typeof loadingScreen !== "undefined" && loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
      showScreen("start");
    }, 500);
  } else {
    showScreen("start");
  }
});

// ======= DEBUG: Pular Fase =======
window.skipPhase = function() {
  console.log(`🎮 Pulando de Fase ${currentPhase}, Cenário ${currentScenario}...`);
  goToNextLevel();
  console.log(`✅ Avançado para Fase ${currentPhase}, Cenário ${currentScenario}`);
};

window.skipToPhase = function(phase, scenario = 1) {
  if (phase < 1 || phase > maxPhases) {
    console.log(`❌ Fase inválida! Use entre 1 e ${maxPhases}`);
    return;
  }
  if (scenario < 1 || scenario > scenariosPerPhase) {
    console.log(`❌ Cenário inválido! Use entre 1 e ${scenariosPerPhase}`);
    return;
  }
  
  console.log(`🎮 Pulando para Fase ${phase}, Cenário ${scenario}...`);
  currentPhase = phase;
  currentScenario = scenario;
  startLevel();
  console.log(`✅ Agora em Fase ${currentPhase}, Cenário ${currentScenario}`);
};

window.skipToEnd = function() {
  console.log("🎮 Pulando para o final do jogo...");
  currentPhase = maxPhases;
  currentScenario = scenariosPerPhase;
  startLevel();
  console.log(`✅ Agora na última fase: Fase ${currentPhase}, Cenário ${currentScenario}`);
};



