class MenuScene extends Phaser.Scene{
    constructor(){
        super('MenuScene');
    }

    create(){
        this.add.text(400, 200, 'SIÊU NHÂN NHẶT SAO', {fontSize:'48px', fill:'#ffffff'}).setOrigin(0.5);

        let startBtn = this.add.text(400, 350, '> BẤM VÀO ĐÂY ĐỂ CHƠI <',  {fontSize: "32px", fill: "#00f00"}).setOrigin(0.5);  
        
        startBtn.setInteractive();

        startBtn.on('pointerdown', () => {
            this.scene.start('PlayScene'); // Lệnh chuyển sang màn chơi chính
        });
    }
}

class PlayScene extends Phaser.Scene{

    constructor(){
        super('PlayScene');
        this.score = 0;
        this.gameOver = false;
        this.hp = 3;
        this.isInvulnerable = false; // Cờ theo dõi trạng thái bất tử
    }

    preload() {

        this.load.spritesheet('dude', "https://labs.phaser.io/assets/sprites/dude.png", {frameWidth: 32, frameHeight: 48});

        this.load.image('star', 'https://labs.phaser.io/assets/demoscene/star3.png');
        this.load.image('bomb', 'https://labs.phaser.io/assets/demoscene/bomb.png');

        // this.load.audio('amTien', 'https://labs.phaser.io/assets/audio/SoundEffects/pickup.wav');
        // this.load.audio('amBan', 'https://labs.phaser.io/assets/audio/SoundEffects/blaster.wav');
        // this.load.audio('amNo', 'https://labs.phaser.io/assets/audio/SoundEffects/explosion.wav');


    }

    create(){
        this.score = 0;
        this.hp = 3;
        this.gameOver = false;
        this.isInvulnerable = false;
        this.hpText = this.add.text(16, 50, 'Máu: 3', {fontSize: '32px', fill: '#ff0000'});

        this.player = this.physics.add.sprite(400, 300, 'dude');
        this.player.setCollideWorldBounds(true);

        this.coin = this.physics.add.sprite(200, 200, 'star');

        this.bombs = this.physics.add.group();

        this.scoreText = this.add.text(16, 16, 'Điểm: 0', {fontSize: '32px', fill: '#fff'});

        this.cursors = this.input.keyboard.createCursorKeys ();

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1 // Lặp lại vô hạn
        })

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.overlap(this.player, this.coin, this.collectCoin, null, this);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);   
        
        const gBullet = this.add.graphics();
        gBullet.fillStyle(0x00ffff);
        gBullet.fillRect(0, 0, 15, 4);
        gBullet.generateTexture('dan', 15, 4);
        gBullet.destroy();

        this.bullets = this.physics.add.group();

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerDirection = 'right';

        this.physics.add.overlap(this.bullets, this.bombs, this.destroyBombs, null, this);

        // this.soundTien = this.sound.add('amTien');
        // this.soundBan = this.sound.add('amBan');
        // this.soundNo = this.sound.add('amNo');
    }

    update(){
        if (this.gameOver) return;

        this.player.setVelocity(0);

        if(this.cursors.left.isDown){
            this.player.setVelocityX(-250);
            this.player.anims.play('left', true);
            this.playerDirection = 'left';
        }
        else if(this.cursors.right.isDown){
            this.player.setVelocityX(250);
            this.player.anims.play('right', true);
            this.playerDirection = 'right';
            
        }
        else{
            this.player.anims.play('turn');
        }

        if(this.cursors.up.isDown){
            this.player.setVelocityY(-250);
        }else if(this.cursors.down.isDown){
            this.player.setVelocityY(250);
        }

        if(Phaser.Input.Keyboard.JustDown(this.spacebar)){
            this.shoot();
        }
    }

    collectCoin(player, coin){
        coin.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText("Điểm: " + this.score);
        // this.soundTien.play();

        let randomX = Phaser.Math.Between(50, 750);
        let randomY = Phaser.Math.Between(50, 550);
        coin.enableBody(true, randomX, randomY, true, true);

        let bombX = (player.x < 400) ? Phaser.Math.Between(400, 800) :Phaser.Math.Between(0, 400);
        let bomb = this.bombs.create(bombX, 50, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200),  Phaser.Math.Between(-200, 200));
    }

    hitBomb(player, bomb){

        if (this.isInvulnerable){
            return;
        }

        this.hp -= 1;
        this.hpText.setText('Máu: ' + this.hp);

        if (this.hp <= 0){
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.play('turn');
            this.gameOver = true;
            this.time.delayedCall(1500, () => {
                this.scene.start("GameOverScene", {score: this.score});
            });
        }else{

            this.isInvulnerable = true;
            player.setTint(0xff0000);

            player.setVelocityY(-200);

            this.time.delayedCall(1500, () => {
                this.isInvulnerable = false;
                player.clearTint(); // Trả lại màu gốc cho nhân vật
            });

        }

        
    }
    
    shoot(){
        let bullet = this.bullets.create(this.player.x, this.player.y, 'dan');

        if(this.playerDirection === 'left'){
            bullet.setVelocityX(-500);
        }else{
            bullet.setVelocityX(500);
        }
    }

    destroyBombs(bullet, bomb){
        bullet.destroy();
        bomb.destroy();
        // this.soundNo.play();
        this.score += 5;
        this.scoreText.setText('Điểm: ' + this.score);
    }

    
}

class GameOverScene extends Phaser.Scene{
    constructor(){
        super('GameOverScene');
    }

    init(data){
        this.finalScore = data.score;
    }

    create(){
        this.add.text(400, 250, 'GAME OVER', { fontSize:'64px', fill: '#ff0000'}).setOrigin(0.5);

        this.add.text(400, 330, "Tổng điểm: " + this.finalScore, {fontSize: '32px', fill:'#ffffff'}).setOrigin(0.5);

        let restartBtn = this.add.text(400, 420, 'CHƠI LẠI', { fontSize: '32px', fill: '#00ff00' }).setOrigin(0.5);

        restartBtn.setInteractive();
        restartBtn.on('pointerdown', () => {
            this.scene.start('PlayScene'); // Quay lại màn chơi chính để cày lại từ đầu
        });
    }
}



const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1d212d',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    // Chuyền Class PlayScene vào danh sách các màn chơi
    scene: [MenuScene, PlayScene, GameOverScene] 
};

const game = new Phaser.Game(config);