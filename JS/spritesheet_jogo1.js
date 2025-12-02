// Sistema de Spritesheet para o Personagem - CORRIGIDO
class PlayerSprite {
    constructor() {
        // Carregar a spritesheet
        this.spritesheet = new Image();
        this.spritesheet.src = "./IMG/spritesheet_worker_mg1.png";
        
        // CONFIGURAÇÃO CORRIGIDA - 4 colunas × 4 linhas
        this.frameWidth = 40;
        this.frameHeight = 60;
        this.cols = 4; // 4 colunas (frames de animação)
        this.rows = 4; // 4 linhas (direções: baixo, esquerda, direita, cima)
        
        // Estados da animação - CORRIGIDO
        this.currentDirection = 0; // 0=baixo, 1=esquerda, 2=direita, 3=cima
        this.currentFrame = 0;
        this.frameCount = 4; // 4 frames por direção (0,1,2,3)
        this.animationSpeed = 8; // Velocidade da animação
        this.frameTimer = 0;
        
        // Controle de movimento
        this.isMoving = false;
        this.lastDirection = 0; // 0=baixo
        
        // Callback quando a spritesheet carregar
        this.spritesheet.onload = () => {
            console.log('✅ Spritesheet do player carregada!');
            console.log(`📊 Spritesheet: ${this.cols} colunas × ${this.rows} linhas`);
        };
        
        this.spritesheet.onerror = () => {
            console.warn('⚠️ Erro ao carregar spritesheet do player. Usando fallback.');
        };
    }
    
    // Atualizar animação baseada no movimento - CORRIGIDO
    update(deltaTime, keys) {
        // Determinar direção atual
        let moving = false;
        let newDirection = this.lastDirection;
        
        if (keys['w'] || keys['W']) {
            newDirection = 3; // Cima
            moving = true;
        } else if (keys['s'] || keys['S']) {
            newDirection = 0; // Baixo
            moving = true;
        } else if (keys['a'] || keys['A']) {
            newDirection = 1; // Esquerda
            moving = true;
        } else if (keys['d'] || keys['D']) {
            newDirection = 2; // Direita
            moving = true;
        }
        
        // Se a direção mudou, resetar animação
        if (newDirection !== this.currentDirection) {
            this.currentDirection = newDirection;
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
        
        this.isMoving = moving;
        this.lastDirection = newDirection;
        
        // CORREÇÃO: Atualizar animação se estiver se movendo
        if (moving) {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= 1000 / this.animationSpeed) {
                this.frameTimer = 0;
                // CORREÇÃO: Usar TODOS os frames (0,1,2,3) incluindo a última coluna
                this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            }
        } else {
            // Quando parado, usar frame 0 (parado)
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }
    
    // Desenhar o personagem - CORRIGIDO
    draw(ctx, x, y, width, height) {
        if (!this.spritesheet.complete) {
            // Fallback: desenhar retângulo azul
            ctx.fillStyle = '#1976d2';
            ctx.fillRect(x, y, width, height);
            
            // Indicador de direção no fallback
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const dirText = ['↓', '←', '→', '↑'][this.currentDirection];
            ctx.fillText(dirText, x + width/2, y + height/2);
            
            ctx.strokeStyle = '#000';
            ctx.strokeRect(x, y, width, height);
            return;
        }
        
        // CORREÇÃO: Calcular posição na spritesheet
        // Frame X = coluna (0-3), Frame Y = linha/direção (0-3)
        const spriteX = this.currentFrame * this.frameWidth;
        const spriteY = this.currentDirection * this.frameHeight;
        
        // Desenhar frame da spritesheet
        ctx.drawImage(
            this.spritesheet,
            spriteX, spriteY, this.frameWidth, this.frameHeight,
            x, y, width, height
        );
    }
    
    // Reiniciar animação
    reset() {
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.isMoving = false;
        this.currentDirection = 0;
    }
}