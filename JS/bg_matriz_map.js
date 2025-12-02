class MinigameMap {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.tileSize = 32; // Tamanho base do tile (32x32)

    // Definição dos IDs, caminhos de imagem e PROPRIEDADES PERSONALIZADAS
    // Cada tile pode ter: src (imagem), width, height, isWall (colisão)
    this.tileConfigs = {
      0: {
        src: "IMG/minigame_1/tiles/tile_floor_main.png",
        width: 32,
        height: 32,
        isWall: false,
        description: "Piso",
      },
      1: {
        src: "IMG/minigame_1/tiles/tile_wall_top.png",
        width: 32,
        height: 96, // Parede com profundidade!
        isWall: true,
        description: "Parede (topo)",
      },
      2: {
        src: "IMG/minigame_1/tiles/tile_wall_top1_right.png",
        width: 32,
        height: 96,
        isWall: true,
        description: "Parede (topo, direita)",
      },
      3: {
        src: "IMG/minigame_1/tiles/tile_wall_top1_left.png",
        width: 32,
        height: 96,
        isWall: true,
        description: "Parede (topo, esquerda)",
      },
      4: {
        src: "IMG/minigame_1/tiles/tile_wall_left.png",
        width: 32,
        height: 32,
        isWall: true,
        description: "Parede (esquerda)",
      },
      5: {
        src: "IMG/minigame_1/tiles/tile_wall_right.png",
        width: 32,
        height: 32,
        isWall: true,
        description: "Parede (direita)",
      },
      6: {
        src: "IMG/minigame_1/tiles/tile_wall_bottom.png",
        width: 32,
        height: 32,
        isWall: true,
        description: "Parede (baixo)",
      },
      7: {
        src: "IMG/minigame_1/tiles/tile_wall_bottom_left.png",
        width: 32,
        height: 32,
        isWall: true,
        description: "Parede (baixo, esquerda)",
      },
      8: {
        src: "IMG/minigame_1/tiles/tile_wall_bottom_right.png",
        width: 32,
        height: 32,
        isWall: true,
        description: "Parede (baixo, direita)",
      },
      9: {
        src: "IMG/minigame_1/tiles/tile_floor_bottom.png",
        width: 32,
        height: 32,
        isWall: false,
        description: "Piso (rodapé)",
      },
      ".": {
        src: "IMG/minigame_1/tiles/tile_floor_bottom_left.png",
        width: 32,
        height: 32,
        isWall: false,
        description: "Piso (rodapé,baixo, esquerda)",
      },
      "-": {
        src: "IMG/minigame_1/tiles/tile_floor_bottom_right.png",
        width: 32,
        height: 32,
        isWall: false,
        description: "Piso (rodapé, direita)",
      },
      "l": {
        src: "IMG/minigame_1/tiles/tile_floor_left.png",
        width: 32,
        height: 32,
        isWall: false,
        description: "Piso (rodapé, esquerda)",
      },
      "d": {
        src: "IMG/minigame_1/tiles/tile_floor_right.png",
        width: 32,
        height: 32,
        isWall: false,
        description: "Piso (rodapé, direita)",
      },
      "e": {
        src: "IMG/minigame_1/tiles/tile_floor_top_left.png",
        width: 32,
        height: 32,
        isWall: false,
        description: "Piso (rodapé, direita)",
      },
      "r": {
        src: "IMG/minigame_1/tiles/tile_floor_top_right.png",
        width: 32,
        height: 32,
        isWall: false,
        description: "Piso (rodapé, direita)",
      },
      "t": {
        src: "IMG/minigame_1/tiles/tile_floor_top.png",
        width: 32,
        height: 32,
        isWall: false,
        description: "Piso (rodapé, direita)",
      },
    };

    this.sprites = {};
    this.loadSprites();

    this.map = [
  [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
  [4, 'e', 't', 't', 't', 't', 't', 't', 't', 't', 'r', 5, 4, 'e', 't', 't', 't', 't', 't', 't', 'r', 5, 4, 'e', 't', 't', 't', 't', 'r', 5, 4, 'e', 't', 't', 't', 't', 't', 't', 't', 't', 't', 'r', 5, 4, 'e', 't', 't', 't', 't', 't', 'r', 5, 4, 'e', 't', 't', 't', 't', 't', 't', 't', 't', 'r', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 't', 't', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 9, 9, 9, 9, 9, 9, '-', 5, 4, '.', 9, 9, 9, 9, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 'd', 0, 6, 6, 6, 6, 6, 6, 8, 7, 6, 6, 6, 6, 0, 'l', 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 'd', 5, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 4, 'l', 0, 'd', 5, 4, 'l', 0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, '-', 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 'd', 5, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 4, 'l', 0, 'd', 5, 4, 'l', 0, 0, 'd', 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 'd', 5, 2, 1, 1, 1, 1, 1, 3, 2, 1, 1, 1, 3, 4, 'l', 0, 'd', 5, 4, 'l', 0, 0, 'd', 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 'd', 9, 9, 9, 9, 9, 9, 0, 5, 4, 0, 9, 9, 9, 9, 'l', 0, 'd', 5, 4, 'l', 0, 0, 'd', 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'r', 5, 4, 'e', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 'd', 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 4, 'l', 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 9, 9, '-', 5, 4, '.', 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 'd', 5, 6, 6, 8, 7, 6, 6, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 'd', 5, 0, 0, 5, 4, 0, 0, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 'd', 5, 0, 0, 5, 4, 0, 0, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 'd', 0, 1, 1, 1, 1, 1, 1, 0, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 't', 't', 't', 't', 't', 't', 't', 't', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 'd', 't', 't', 't', 5, 4, 't', 't', 't', 'r', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, '-', 5, 4, '.', 9, 9, 9, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 'd', 5, 6, 6, 8, 7, 6, 6, 4, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 5, 6, 6, 8, 7, 6, 6, 4, 'd', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 'd', 5, 0, 5, 4, 0, 0, 0, 4, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 5, 0, 0, 5, 4, 0, 0, 4, 'd', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 'd', 5, 0, 5, 4, 0, 0, 0, 4, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 5, 0, 0, 5, 4, 0, 0, 4, 'd', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 'd', 0, 1, 1, 1, 1, 1, 1, 0, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 0, 1, 1, 1, 1, 1, 1, 0, 'd', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 't', 't', 't', 't', 't', 't', 't', 't', 't', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 'e', 't', 't', 't', 't', 't', 't', 't', 't', 'r', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 5, 6, 6, 'd', 6, 6, 6, 4, 'd', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 'l', 5, 6, 6, 6, 6, 6, 6, 4, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 5, 5, 5, 5, 5, 5, 6, 4, 'd', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 'l', 5, 6, 6, 6, 6, 6, 6, 4, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 5, 1, 1, 3, 2, 1, 1, 4, 'd', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 'l', 5, 1, 1, 3, 2, 1, 1, 4, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 't', 't', 't', 'r', 5, 4, 'e', 't', 't', 't', 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 't', 't', 't', 'r', 5, 4, 'e', 't', 't', 't', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 'e', 't', 't', 't', 't', 't', 't', 't', 't', 'r', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'e', 't', 't', 't', 't', 't', 't', 't', 't', 'r', 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 'l', 5, 6, 6, 6, 6, 6, 6, 4, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 5, 6, 6, 6, 6, 6, 6, 4, 'd', 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 'l', 5, 6, 6, 6, 6, 6, 6, 4, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 5, 6, 6, 6, 6, 6, 6, 4, 'd', 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 'l', 5, 1, 1, 3, 2, 1, 1, 4, 'd', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'l', 5, 1, 1, 3, 2, 1, 1, 4, 'd', 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 't', 't', 't', 'r', 5, 4, 'e', 't', 't', 't', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 't', 't', 't', 'r', 5, 4, 'e', 't', 't', 't', 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 'd', 5, 4, 'l', 0, 0, 0, 0, 0, 0, 0, 0, 'd', 5],
  [4, '.', 9, 9, 9, 9, 9, 9, 9, 9, '-', 5, 4, '.', 9, 9, 9, 9, 9, 9, '-', 5, 4, '.', 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, '-', 5, 4, '.', 9, 9, 9, 9, 9, 9, '-', 5, 4, '.', 9, 9, 9, 9, 9, 9, 9, 9, '-', 5],
  [7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 7, 6, 6, 6, 6, 6, 6, 6, 6, 8, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8, 7, 6, 6, 6, 6, 6, 6, 6, 6, 8, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 8]
]
    // Expose the authoritative tileMap and tileSize globally so other scripts use the same data
    try {
      window.tileMap = this.map;
      window.TILE_SIZE = this.tileSize;
    } catch (e) {
      console.warn("Não foi possível expor tileMap/TILE_SIZE globalmente", e);
    }
  }

  loadSprites() {
    for (const [id, config] of Object.entries(this.tileConfigs)) {
      const img = new Image();
      img.src = config.src;
      img.onload = () =>
        console.log(
          `✅ Tile ${id} carregado: ${config.src} (${config.width}x${config.height}px, colisão: ${config.isWall})`
        );
      img.onerror = () =>
        console.error(`❌ Erro ao carregar tile ${id}: ${config.src}`);
      this.sprites[id] = img;
    }
  }

  // Função para modificar propriedades de um tile em tempo de execução
  setTileConfig(tileId, newConfig) {
    if (this.tileConfigs[tileId]) {
      this.tileConfigs[tileId] = { ...this.tileConfigs[tileId], ...newConfig };
      console.log(`🔧 Tile ${tileId} atualizado:`, this.tileConfigs[tileId]);
    } else {
      console.warn(`⚠️ Tile ${tileId} não existe!`);
    }
  }

  // Função para obter propriedades de um tile
  getTileConfig(tileId) {
    return this.tileConfigs[tileId] || null;
  }

  // Função para verificar se um tile é uma parede
  isTileWall(tileId) {
    const config = this.tileConfigs[tileId];
    return config ? config.isWall : false;
  }

  // Função para obter as dimensões de um tile
  getTileDimensions(tileId) {
    const config = this.tileConfigs[tileId];
    if (!config) return { width: this.tileSize, height: this.tileSize };
    return { width: config.width, height: config.height };
  }
  draw(
    cameraX = 0,
    cameraY = 0,
    viewWidth = this.canvas.width,
    viewHeight = this.canvas.height
  ) {
    const rows = this.map.length;
    const cols = this.map[0].length;
    // Apenas desenha tiles que caem na viewport (com base na câmera)
    const startCol = Math.max(0, Math.floor(cameraX / this.tileSize));
    const endCol = Math.min(
      cols - 1,
      Math.floor((cameraX + viewWidth) / this.tileSize)
    );
    const startRow = Math.max(0, Math.floor(cameraY / this.tileSize));
    const endRow = Math.min(
      rows - 1,
      Math.floor((cameraY + viewHeight) / this.tileSize)
    );

    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        const tileId = this.map[y][x];
        if (tileId === undefined || tileId === null) continue;

        const img = this.sprites[tileId];
        const config = this.tileConfigs[tileId];

        if (img && img.complete && config) {
          const posX = x * this.tileSize - cameraX;
          const posY = y * this.tileSize - cameraY;
          const tileWidth = config.width;
          const tileHeight = config.height;

          // Renderiza o tile com suas dimensões personalizadas
          // Se a altura for maior que a altura base, desenha a partir de cima
          if (tileHeight > this.tileSize) {
            const yOffset = tileHeight - this.tileSize;
            this.ctx.drawImage(
              img,
              posX,
              posY - yOffset,
              tileWidth,
              tileHeight
            );
          } else {
            this.ctx.drawImage(img, posX, posY, tileWidth, tileHeight);
          }
        }
      }
    }
  }

  // Método extra para verificar colisão (se você precisar impedir o jogador de andar nas paredes)
  isWalkable(x, y) {
    // Converte posição de pixel para índice da matriz
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);

    // Verifica limites do mapa
    if (
      row < 0 ||
      row >= this.map.length ||
      col < 0 ||
      col >= this.map[0].length
    ) {
      return false;
    }

    const tileId = this.map[row][col];
    // Verifica se o tile é uma parede baseado na configuração
    return !this.isTileWall(tileId);
  }
}
