window.addEventListener('load', function(){
    // canvas setup
// canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    // Bu fonksiyonu ve olay izleyiciyi en başa koyuyoruz
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    // Geri kalan Game, Player sınıfların ve animate fonksiyonun burada devam edecek...
// Canvası tarayıcı penceresine eşitle


    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                this.game.sound.bgm();
                if ((   (e.key === 'ArrowUp') ||
                        (e.key === 'ArrowDown')
                ) && this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key);
                    
                } else if ( e.key === ' '){
                    this.game.player.shootTop();
                } else if ( e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
            });
            window.addEventListener('keyup', e =>{
                if (this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }
    class SoundController {
        constructor(){
            this.powerUpSound = document.getElementById('powerup');
            this.powerDownSound = document.getElementById('powerdown');
            this.explosionSound = document.getElementById('explosion');
            this.shotSound = document.getElementById('shot');
            this.hitSound = document.getElementById('hit');
            this.shieldSound = document.getElementById('shieldSound');
            this.backgroundMusic = document.getElementById('bgmusic');
            this.backgroundMusic.loop = true;
        }
        bgm(){
            
            this.backgroundMusic.play();
        }
        powerUp(){
            this.powerUpSound.currentTime = 0;
            this.powerUpSound.play();
        }
        powerDown(){
            this.powerDownSound.currentTime = 0;
            this.powerDownSound.play();
        }
        explosion(){
            this.explosionSound.currentTime = 0;
            this.explosionSound.play();
        }
        shot(){
            this.shotSound.currentTime = 0;
            this.shotSound.play();
        }
        hit(){
            this.hitSound.currentTime = 0;
            this.hitSound.play();
        }
        shield(){
            this.shieldSound.currentTime = 0;
            this.shieldSound.play();
        }
    }
    class Shield {
    constructor(game){
        this.game = game;
        this.width = this.game.player.width;
        this.height = this.game.player.height;
        this.frameX = 0;
        this.maxFrame = 24;
        this.image = document.getElementById('shield2');
        this.fps = 60;
        this.timer = 0;
        this.interval = 1000/this.fps;

        // --- AKIL SAĞLIĞI SİSTEMİ ---
        this.power = 100;      // Şu anki Akıl Sağlığı
        this.maxPower = 100;   // Maksimum Akıl Sağlığı
        this.regenSpeed = 0.1; // Toparlanma hızı (Sayıyı artırırsan daha hızlı dolar)
    }

    update(deltaTime){
        // Kalkan animasyonu (Darbe alındığında başlar)
        if (this.frameX <= this.maxFrame) {
            if (this.timer > this.interval) {
                this.frameX++;
                this.timer = 0;
            } else {
                this.timer += deltaTime;
            }
        }
        
        // Akıl sağlığının zamanla yavaşça toparlanması
        if (this.power < this.maxPower) {
            this.power += this.regenSpeed;
        }
        
        // Değerin 0'ın altına düşmesini engelle
        if (this.power < 0) this.power = 0;
    }

    draw(context){
        // Sadece animasyon devam ederken kalkanı çiz
        if (this.frameX < this.maxFrame) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.game.player.x, this.game.player.y, this.game.player.width, this.game.player.height);
        }
    }

    // Bu fonksiyon darbe aldığında çağrılacak
    reset(){
        this.frameX = 0; // Kalkan efekti başlasın
        this.power -= 15; // Darbe başına giden akıl sağlığı miktarı
    }
}
    class Projectile {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 62;
            this.height = 38;
            this.speed = Math.random() * 0.2 + 2.8;
            this.markedForDeletion = false;
            this.image = document.getElementById('fireball222');
            this.frameX = 0;
            this.maxFrame = 3;
            this.fps = 10;
            this.timer = 0;
            this.interval = 1000/this.fps;
        }
        update(deltaTime){
            this.x += this.speed;
            if (this.timer > this.interval){
                if (this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
                this.timer = 0;
            } else {
                this.timer += deltaTime;
            }
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context){
    // Resmin tek bir karesinin genişliğini otomatik hesaplayalım
    const singleFrameWidth = this.image.width / (this.maxFrame + 1);
    
    context.drawImage(
        this.image, 
        this.frameX * singleFrameWidth, 0, // Kaynak koordinatlar
        singleFrameWidth, this.image.height, // Kaynak boyutlar
        this.x, this.y, // Ekran koordinatları
        this.width, this.height // Ekran boyutları (Genişletmek istersen bunları büyütebilirsin)
    );
}
    }
    class Particle {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 80 + 60;
        }
        update(){
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            if (this.y > this.game.height + this.size || this.x < 0 - this.size) this.markedForDeletion = true;
            if (this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 5){
                this.bounced++;
                this.speedY *= -0.7;
            }
        }
        draw(context){
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size, this.size);
            context.restore();
        }
    }
    class Player {
        constructor(game){
            this.game = game;
            this.width = 188;
            this.height = 190;
            this.x = 20;
            this.y = 110;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 8;
            this.speedY = 0;
            this.maxSpeed = this.game.height * 0.015;
            this.projectiles = [];
            this.image = document.getElementById('playerfalanxyz33iki12');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }
        update(deltaTime){
           // 1. ADIM: Tuşlara basılma durumuna göre hızı kademeli artır/azalt
            // Sabit hız yerine ivme (acceleration) ekliyoruz (Örn: 0.5)
            if (this.game.keys.includes('ArrowUp')) {
                this.speedY -= 0.5; 
            } else if (this.game.keys.includes('ArrowDown')) {
                this.speedY += 0.5;
            } else {
                // 2. ADIM: Tuş bırakıldığında sürtünme (friction) etkisi
                // Hızı her karede %10 azaltarak yumuşak bir duruş sağlar
                this.speedY *= 0.9; 
            }

            // 3. ADIM: Hızın kontrolden çıkmaması için sınırla (Max Speed)
            if (this.speedY > this.maxSpeed) this.speedY = this.maxSpeed;
            if (this.speedY < -this.maxSpeed) this.speedY = -this.maxSpeed;

            // Pozisyonu güncelle
            this.y += this.speedY;

            // --- BURADAN AŞAĞISI MEVCUT KODLARININ DEVAMI ---
            // vertical boundaries
            if (this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
            else if (this.y < -this.height * 0.5) this.y = -this.height * 0.5;
            // handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update(deltaTime);
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            // sprite animation
            if (this.frameX < this.maxFrame){
                this.frameX++;
            } else {
                this.frameX = 0;
            }
            // power up
            if (this.powerUp){
                if (this.powerUpTimer > this.powerUpLimit){
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                    this.game.sound.powerDown();
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }
        }
        draw(context){
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        shootTop(){
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
            } 
            
            
            this.game.sound.shot();
            if (this.powerUp) this.shootBottom();
        }
        shootBottom(){
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
            }
        }
        enterPowerUp(){
            this.powerUpTimer = 0;
            this.powerUp = true;
            if (this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo;
            this.game.sound.powerUp();
        }
    }
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }
        update(){
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) this.markedForDeletion = true;
            // sprite animation
            if (this.frameX < this.maxFrame){
                this.frameX++;
            } else this.frameX = 0;
        }
        draw(context){
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            if (this.game.debug){
                context.font = '20px Helvetica';
                context.fillText(this.lives, this.x, this.y);
            }
        }
    }
    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('anglertry');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 5;
            this.score = this.lives;
        }
    }
    class Angler2 extends Enemy {
        constructor(game){
            super(game);
            this.width = 169;
            this.height = 149;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler2v122');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 6;
            this.score = this.lives;
        }
    }
    class LuckyFish extends Enemy {
        constructor(game){
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('lucky33');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 5;
            this.score = 15;
            this.type = 'lucky';
        }
    }
    class HiveWhale extends Enemy {
        constructor(game){
            super(game);
            this.width =386;
            this.height = 500;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('hivewhale333');
            this.frameY = 0;
            this.lives = 20;
            this.score = this.lives;
            this.type = 'hive';
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    }
    class Drone extends Enemy {
        constructor(game, x, y){
            super(game);
            this.width = 163;
            this.height = 149;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('droneyeni22');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = this.lives;
            this.type = 'drone2';
            this.speedX = Math.random() * -4.2 - 0.5;
        }
    }
    
    class BulbWhale extends Enemy {
        constructor(game){
            super(game);
            this.width = 163;
            this.height = 149;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('droneyeni22');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 20;
            this.score = this.lives;
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    }
    class MoonFish extends Enemy {
        constructor(game){
            super(game);
            this.width = 227;
            this.height = 240;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('moon22');
            this.frameY = 0;
            this.lives = 10;
            this.score = this.lives;
            this.speedX = Math.random() * -1.2 - 2;
            this.type = 'moon';
        }
    }
    class Stalker extends Enemy {
        constructor(game){
            super(game);
            this.width = 98;
            this.height = 123;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('stalker2d22');
            this.frameY = 0;
            this.lives = 5;
            this.score = this.lives;
            this.speedX = Math.random() * -1 - 1;
        }
    }
   class Razorfin extends Enemy {
        constructor(game){
            super(game);
            this.width = 176;
            this.height = 149;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('razordeneme');
            this.frameY = 0;
            this.lives = 7;
            this.score = this.lives;
            this.speedX = Math.random() * -1 - 1;
        }
    }
   
    
       class Layer {
    constructor(game, image, speedModifier){
        this.game = game;
        this.image = image;
        this.speedModifier = speedModifier;
        this.width = this.game.width; // Statik rakam yerine ekran genişliği
        this.height = this.game.height; // Ekran yüksekliği
        this.x = 0;
        this.y = 0;
    }
    update(){
        if (this.x <= -this.width) this.x = 0;
        this.x -= this.game.speed * this.speedModifier;
    }
    draw(context){
        // Buradaki 5 parametreli drawImage yerine 9 parametreli olanı kullanıyoruz 
        // ki resmi canvas boyutuna zorla yayalım (stretch)
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
}

    class Background {
        constructor(game){
            this.game = game;
             this.image1 = document.getElementById('layer1');
      this.image2 = document.getElementById('layer2deneme');
      this.image3 = document.getElementById('devilslayerson');
      this.image4 = document.getElementById('layer4');
      this.layer1 = new Layer(this.game, this.image1, 0.2);

      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.devilslayerson = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.3);
      this.layers = [this.layer1, this.layer2, this.devilslayerson];
        }
        update(){
            this.layers.forEach(layer => layer.update());
            
            
        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    }

    class Explosion {
        constructor(game, x, y){
            this.game = game;
            this.frameX = 0;
            this.spriteWidth = 200;
            this.spriteHeight = 200;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
            this.fps = 30;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.markedForDeletion = false;
            this.maxFrame = 8;
        }
        update(deltaTime){
            this.x -= this.game.speed;
            if (this.timer > this.interval){
                this.frameX++;
                this.timer = 0;
            } else {
                this.timer += deltaTime;
            }
            if (this.frameX > this.maxFrame) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }
    
    class SmokeExplosion extends Explosion {
        constructor(game, x, y){
            super(game, x, y);
            this.image = document.getElementById('smokeExplosion2');
        }
    }

    class FireExplosion extends Explosion {
        constructor(game, x, y){
            super(game, x, y);
            this.image = document.getElementById('fireExplosion2');
        }
    }

    class UI {
        
    constructor(game) {
        this.game = game;
        this.fontSize = 50; // Senin font boyutun
        this.fontFamily = 'Bangers'; // Kullandığın font
        this.color = 'white';
    }
  draw(context) {
    context.save();
    
    // 1. GENEL STİL AYARLARI
    context.fillStyle = 'white';
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = 'black';
    context.font = '50px Bangers';

    // 2. SKOR VE TIMER (Zaten sendeki mevcut yapı)
    context.fillText('SKORUN: ' + this.game.score, 20, 50);
    context.fillText('UYKU SÜREN: ' + (this.game.gameTime * 0.001).toFixed(1), 20, 105);

    // --- 3. YENİ KAOTİK AKIL SAĞLIĞI SİSTEMİ ---
    const currentPower = (this.game.shield && this.game.shield.power) ? this.game.shield.power : 0;
    const maxPower = (this.game.shield && this.game.shield.maxPower) ? this.game.shield.maxPower : 100;
    
    // Akıl sağlığı azaldıkça artan panik/titreme miktarı
    let panicLevel = (1 - currentPower / maxPower) * 7; 
    let shakeX = Math.random() * panicLevel - (panicLevel / 2);
    let shakeY = Math.random() * panicLevel - (panicLevel / 2);

    // Yazı: AKIL SAĞLIĞI (Çift katmanlı kırmızı efekti)
    context.font = '55px Bangers';
    context.fillStyle = '#8B0000'; // Koyu kan kırmızısı (Gölge katmanı)
    context.fillText('AKIL SAĞLIĞI', 20 + shakeX, 160 + shakeY);
    context.fillStyle = '#ff0000'; // Parlak kırmızı (Üst katman)
    context.fillText('AKIL SAĞLIĞI', 18 + shakeX, 158 + shakeY);

    // Bar Çizimi
    context.save();
    context.shadowColor = 'transparent'; // Barın içini temiz tut
    
    // Bar Arka Planı (Koyu Kırmızı/Siyah Boşluk)
    context.fillStyle = 'rgba(30, 0, 0, 0.7)';
    context.fillRect(20, 175, maxPower * 2, 30);

    // Barın Kendisi (Gradyanlı ve Glitchli Çizim)
    let gradient = context.createLinearGradient(20, 0, 20 + (maxPower * 2), 0);
    gradient.addColorStop(0, '#4a0000');
    gradient.addColorStop(0.5, '#ff0000');
    gradient.addColorStop(1, '#8B0000');
    context.fillStyle = gradient;

    // Barı dikey parçalarla pürüzlü çizme
    for (let i = 0; i < currentPower * 2; i += 4) {
        let roughness = Math.random() * 6; // Üstten rastgele tırtıklar
        context.fillRect(20 + i + shakeX, 175 + roughness, 3, 30 - roughness);
    }

    // Beyaz Çerçeve
    context.strokeStyle = 'white';
    context.lineWidth = 2;
    context.strokeRect(20, 175, maxPower * 2, 30);
    context.restore();

    // --- 4. SON 5 SANİYE EFEKTİ ---
    if (this.game.gameTime > 25000 && this.game.gameTime < 30000 && !this.game.gameOver) {
        context.save();
        context.fillStyle = 'rgba(255, 0, 0, ' + (Math.random() * 0.2) + ')'; 
        context.fillRect(0, 0, this.game.width, this.game.height);
        context.textAlign = 'center';
        context.font = '80px Bangers';
        context.fillStyle = 'white';
        context.fillText('AZ KALDI... UYAN!', this.game.width * 0.5 + (Math.random() * 10 - 5), 250);
        context.restore();
    }
    if (this.game.score > 0 && this.game.score % 2 === 0) {
    context.save();
    context.font = '70px Bangers';
    context.fillStyle = '#ffff00'; // Parlak Sarı
    context.textAlign = 'center';
    context.fillText('HARİKA!', this.game.width * 0.5, 200 + Math.sin(Date.now() * 0.01) * 10);
    context.restore();
}

    // --- 5. OYUN BİTİŞ MESAJLARI ---
    if (this.game.gameOver) {
        context.textAlign = 'center';
        let message1, message2;
        if (this.game.score >= this.game.winningScore) {
            message1 = "UYANABİLDİN!";
            message2 = "Gerçek dünya seni bekliyor.";
        } else {
            message1 = "KABUS SENİ YUTTU!";
            message2 = "Sonsuza kadar 'UYAN' diyeceksin...";
        }
        context.font = '100px Bangers';
        context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
        context.font = '40px Bangers';
        context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
    }

    context.restore();
}
}
    class Game {
        constructor(width, height){
             // Yazıların başlangıç yüksekliği (ekranın en altı)
this.showCreditsMode = false;
this.credits = [
    "KABUS SENİ YUTTU",
    "",
    "TASARIM VE KODLAMA",
    "Mete - St0lenVeh1cle- Bingöl",
    "",
   
    "",
    "UYANAMADIN..."
];
            this.width = width;
            this.height = height;
            this.creditY = this.height
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            
            this.sound = new SoundController();
            this.shield = new Shield(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];
            this.explosions = [];
            this.enemyTimer = 0;
            this.enemyInterval = 2000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 350;
            this.gameOver = true;
            this.score = 0;
            this.winningScore = 80;
            this.gameTime = 0;
            this.timeLimit = 60000;
            this.speed = 1; 
            this.debug = false;
            // Kabus Etkinliği (Gözün İzleme Etkinliği) Değişkenleri
        this.eventTimer = 0;
        this.eventInterval = 15000; // Her 15 saniyede bir tetiklenir (milisaniye cinsinden)
        this.eventActive = false;
        this.eventDuration = 5000;  // Etkinlik 5 saniye sürer
        this.eventCountdown = 0;
        
        // Orijinal düşman hızını korumak için yedek
        this.baseEnemySpeedModifier = 1;
// Kombo ve Öfke (Rage) Sistemi Değişkenleri
        this.combo = 0;
        this.rageActive = false;
        this.rageTimer = 0;
        this.rageDuration = 6000; // Öfke modu 6 saniye sürer

        }
       
    update(deltaTime){
            // 1. ZAMANLAYICI VE CREDITS HAREKETİ
            if (this.gameOver) return;

        // Uyku süresini veya oyun süresini akan deltaTime kadar arttır
        this.gameTime += deltaTime;
        // Eğer sleepTime veya başka bi

        // =================================================================
        // ÖFKE (RAGE) MODU SÜRE KONTROLÜ
        // =================================================================
        if (this.rageActive) {
            this.rageTimer -= deltaTime;
            if (this.rageTimer <= 0) {
                this.rageActive = false;
                this.combo = 0; // Öfke bitince komboyu sıfırla
            }
        }
            
            if (this.showCreditsMode) {
                this.creditY -= 1.5; // Yazıları yukarı kaydır
            }

            // 2. OYUN MANTIĞI (Sadece oyun devam ederken çalışır)
            if (!this.gameOver) {
                this.background.update();
                this.background.layer4.update();
                this.player.update(deltaTime);
                
                // Cephane dolumu
                if (this.ammoTimer > this.ammoInterval){
                    if (this.ammo < this.maxAmmo) this.ammo++;
                    this.ammoTimer = 0;
                } else {
                    this.ammoTimer += deltaTime;
                }
                
                this.shield.update(deltaTime);
                
                // Patlamalar ve Parçacıklar
                this.particles.forEach(particle => particle.update());
                this.particles = this.particles.filter(particle => !particle.markedForDeletion);
                this.explosions.forEach(explosion => explosion.update(deltaTime));
                this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);

                // =================================================================
        // KABUS ETKİNLİĞİ: GÖZ SENİ İZLİYOR!
        // =================================================================
        if (!this.eventActive) {
            this.eventTimer += deltaTime;
            if (this.eventTimer >= this.eventInterval) {
                // Etkinliği başlat!
                this.eventActive = true;
                this.eventTimer = 0;
                this.eventCountdown = this.eventDuration;
                
                // Düşmanları çıldırt: Hepsini hızlandır ve oyuncuya depar attır!
                this.enemies.forEach(enemy => {
                    if (enemy.speed) enemy.speed *= 2.5; // Düşman hızlarını 2.5 katına çıkar
                });
                
                // Eğer oyunda bir ses motorun varsa buraya korkunç bir çığlık/uyarı sesi ekleyebilirsin:
                // this.sound.playEyeScare();
            }
        } else {
            // Etkinlik aktifken süreden düş
            this.eventCountdown -= deltaTime;
            
            // Etkinlik esnasında yeni doğan düşmanlar da hızlı doğsun
            this.enemies.forEach(enemy => {
                if (!enemy.speedBoosted) {
                    enemy.speed *= 2.5;
                    enemy.speedBoosted = true; // Sonsuz döngüde katlanmasın diye işaretliyoruz
                }
            });

            if (this.eventCountdown <= 0) {
                // Etkinlik bitti, her şeyi normale döndür
                this.eventActive = false;
                this.enemies.forEach(enemy => {
                    enemy.speed /= 2.5;
                    enemy.speedBoosted = false;
                });
            }
        }

                // Düşman Güncellemeleri ve Çarpışma Kontrolü
                this.enemies.forEach(enemy => {
                    enemy.update();
                    
                    // Karakter düşmana çarparsa
                    if (this.checkCollision(this.player, enemy)){
                        enemy.markedForDeletion = true;
                        this.addExplosion(enemy);
                        this.sound.hit();
                        this.shield.reset();
                        // Parçacık efekti
                        for (let i = 0; i < enemy.score; i++){
                            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        }
                        if (enemy.type === 'lucky') this.player.enterPowerUp();
                        else if (!this.gameOver) this.score--;
                    }

                    // Mermi düşmana çarparsa
                    this.player.projectiles.forEach(projectile => {
                        if (this.checkCollision(projectile, enemy)){

                            this.combo++; 
                if (this.combo >= 10 && !this.rageActive) {
                    this.rageActive = true;
                    this.rageTimer = this.rageDuration;
                }
                            enemy.lives--;
                            projectile.markedForDeletion = true;
                            if (enemy.lives <= 0){
                                enemy.markedForDeletion = true;
                                this.addExplosion(enemy);
                                this.sound.explosion();
                                if (this.score > 0 && this.score % 10 === 0) {
    this.speed += 0.01; // Oyun her 10 puanda bir tık hızlanır
}
                                if (!this.gameOver) this.score += enemy.score;
                            }
                        }
                    });
                });

                this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

                // Yeni düşman ekleme
                if (this.enemyTimer > this.enemyInterval && !this.gameOver){
                    this.addEnemy();
                    this.enemyTimer = 0;
                } else { 
                    this.enemyTimer += deltaTime;
                }

                // 3. OYUN BİTİŞ KONTROLÜ
                if (this.gameTime > this.timeLimit) {
                    this.gameOver = true;
                    // Eğer kazanma puanının altındaysa "Kabus Kazandı" ve Credits başlasın
                    if (this.score < this.winningScore) {
                        this.showCredits();
                    }
                }
            }
        }
        addEnemy(){
            const randomize = Math.random();
            if (randomize < 0.1) this.enemies.push(new Angler1(this));
            else if (randomize < 0.3) this.enemies.push(new Stalker(this));
            else if (randomize < 0.5) this.enemies.push(new Razorfin(this));
            else if (randomize < 0.6) this.enemies.push(new Angler2(this));
            else if (randomize < 0.7) this.enemies.push(new HiveWhale(this));
            else if (randomize < 0.8) this.enemies.push(new BulbWhale(this));
            else if (randomize < 0.9) this.enemies.push(new MoonFish(this));
            else this.enemies.push(new LuckyFish(this));
        }
        addExplosion(enemy){
            const randomize = Math.random();
            if (randomize < 0.5) {
                this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            } else {
                this.explosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            }
        }
   showCredits() {
    this.showCreditsMode = true;
    // Eğer SoundController içinde müzik tanımlıysa hızını düşürür
    if (this.sound && this.sound.bgmusic) {
        this.sound.bgmusic.playbackRate = 0.6;
    }
}
draw(context){
        // 1. OYUNUN KENDİSİNİ ÇİZ (Arka plan ve nesneler)
        this.background.draw(context);
        this.ui.draw(context);
        this.player.draw(context);
        this.shield.draw(context);
        this.particles.forEach(particle => particle.draw(context));
        this.enemies.forEach(enemy => enemy.draw(context));
        this.explosions.forEach(explosion => explosion.draw(context));
        this.background.layer4.draw(context);

        // =================================================================
        // 🔥 DOĞRU YER: 4. ADIM KOMBO VE ÖFKE ARAYÜZ ÇİZİMİ
        // =================================================================
        context.save();
        context.font = '24px monospace';
        context.textAlign = 'left';

        if (this.rageActive) {
            // ÖFKE MODU AKTİFKEN: Sol üstte alevli yazı ve kalan süre sayacı
            context.fillStyle = '#ff3300';
            const rageGlitch = Math.random() * 2;
            context.fillText(`🔥 ÖFKE MODU: ${(this.rageTimer / 1000).toFixed(1)}s`, 40 + rageGlitch, 180);
            
            // Ekranın etrafına siber-turuncu hafif bir öfke parlaması katıyoruz
            context.fillStyle = 'rgba(255, 68, 0, 0.08)';
            context.fillRect(0, 0, this.width, this.height);
        } else {
            // NORMAL MODDA: Kombo varsa sadece mevcut kombo sayısını ve barını çiz
            if (this.combo > 0) {
                context.fillStyle = '#ffffff';
                context.fillText(`KOMBO: X${this.combo}`, 40, 180);
                
                // Küçük kombo ilerleme çubuğu arka planı
                context.fillStyle = '#444444';
                context.fillRect(40, 195, 100, 6);
                
                // Kombo ilerleme çubuğunun kendisi (10'a yaklaştıkça dolar)
                context.fillStyle = '#ffcc00';
                context.fillRect(40, 195, this.combo * 10, 6);
            }
        }
        context.restore();

        // =================================================================
        // 👁️ KABUS ETKİNLİĞİ GÖRSEL EFEKTLERİ (GÖZ SENİ İZLİYOR)
        // =================================================================
        if (this.eventActive) {
            context.save();
            
            // Ekranın etrafına hafif kırmızı, saydam bir panik havası katıyoruz
            context.fillStyle = 'rgba(255, 0, 0, 0.15)';
            context.fillRect(0, 0, this.width, this.height);
            
            // Glitch efekti yaratmak için yazıyı rastgele titretiyoruz
            const glitchX = Math.random() * 4 - 2;
            const glitchY = Math.random() * 4 - 2;
            
            context.font = 'bold 40px monospace';
            context.textAlign = 'center';
            
            // Yazının gölgesi (Siber Kırmızı)
            context.fillStyle = '#800000';
            context.fillText("GÖZ SENİ İZLİYOR !", this.width / 2 + glitchX + 2, 100 + glitchY + 2);
            
            // Yazının kendisi (Saf Kan Kırmızısı)
            context.fillStyle = '#ff0000';
            context.fillText("GÖZ SENİ İZLİYOR !", this.width / 2 + glitchX, 100 + glitchY);
            
            context.restore();
        }

    } // 👈 DRAW FONKSİYONUNUN GERÇEK KAPANIŞ PARANTEZİ
    

        // Çarpışma kontrol fonksiyonun (Eğer sınıfta yoksa bunu da eklemelisin)
        checkCollision(rect1, rect2){
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y
            )
        }
    // class Game burada bitiyor


        checkCollision(rect1, rect2){
            return (        rect1.x < rect2.x + rect2.width &&
                            rect1.x + rect1.width > rect2.x &&
                            rect1.y < rect2.y + rect2.height &&
                            rect1.height + rect1.y > rect2.y)
        }
    }

    let game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // animation loop
    function animate(timeStamp) {
        // 1. Tarayıcının çizim motorunu her zaman canlı tutuyoruz
        requestAnimationFrame(animate);

        // 2. Tuval henüz yüklenmediyse bu kareyi pas geç
        if (!canvas || !ctx) return;

        // 3. MENÜ KONTROLÜ: Eğer oyuncu henüz BAŞLA'ya basmadıysa arkada hiçbir şeyi çizme
        const menu = document.getElementById('gameMenu');
        if (menu && menu.style.display !== 'none') {
            return; 
        }

        // 4. GÜVENLİK DUVARI: Eğer game nesnesi henüz kurulmadıysa (undefined ise) çökme, dön
        if (!game) return;

        // 5. OYUN BİTTİ KONTROLÜ: Sadece game nesnesi VSA ve oyun bittiyse draw'a izin ver
        if (game && game.gameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            game.draw(ctx);
            return;
        }

        // =================================================================
        // 6. ASIL OYUN DÖNGÜSÜ
        // =================================================================
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        game.update(deltaTime);
        game.draw(ctx);
    }
  
const startButton = document.getElementById('startButton');
const gameMenu = document.getElementById('gameMenu');

startButton.addEventListener('click', function() {
    // 1. Önce menüyü gizle (Yukarıdaki esnek kilit menünün gizlendiğini görecek)
    if (gameMenu) gameMenu.style.display = 'none'; 

    // 2. Tuvali boyutlandır
    resizeCanvas();

    // 3. Yepyeni bir oyun nesnesi fırlat
    game = new Game(canvas.width, canvas.height);
    
    // 4. Durumları ve süreleri sıfırla
    game.gameTime = 0; 
    if (game.sleepTime) game.sleepTime = 0;
    game.gameOver = false; // Kilidi tamamen açtık!
    
    // 5. Motoru çalıştır
    lastTime = performance.now();
    animate(performance.now()); 
});
});

