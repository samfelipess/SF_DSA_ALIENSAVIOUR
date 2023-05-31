// -------------------------------------------------------------------------------------------------------------------------- //
// Global Variable declarations
let gameConfig;
let game;
let currScene;

let popFX
let backgroundMusic;
let player;
let tractorEmitter
let platform;
let canMove = true;
let canMoveG= true; 

let cursors;
let counter = 0;
let somethingSpawnTimer;
let enemyGroup;
let ghostGroup;

let ghostList;
let enemiesList
let scoreText
let score
let lives
let lostLife

let bulletGroup;

let lastLifeImage
let gameMode
let splashText
// -------------------------------------------------------------------------------------------------------------------------- //
// Game Setup
window.onload = function ()
{
    gameConfig =
    {
        width: 1280,
        height: 640,
        backgroundColor: 0xccccff,
        physics:
        {
            default: "arcade",
            arcade:
            {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene:
        {
            preload: Preload,
            create: Create,
            update: Update
        }
    }
    game = new Phaser.Game(gameConfig)
}

// -------------------------------------------------------------------------------------------------------------------------- //
// Special Functions
function Preload()
{
     currScene = this

    this.load.image("background", "assets/background1.png")
    this.load.image("lives", "assets/ship-lives.png")

    this.load.spritesheet("ship", "assets/ship.png", { frameWidth: 136, frameHeight: 64 });
    this.load.image("ground", "assets/platform.png")
    this.load.spritesheet('alien', 'assets/alien1.png', { frameWidth: 40, frameHeight: 46 });
    this.load.spritesheet('ghost', 'assets/ghostsprite.png', { frameWidth: 34, frameHeight: 43 });
    this.load.spritesheet('ghost2', 'assets/ghost2sprite.png', { frameWidth: 31, frameHeight: 28 });
    this.load.audio("laserSound", "sounds/laser.wav")
    this.load.audio("mBackground", "sounds/backgroundMusic.mp3")
    this.load.audio("lostLife", "sounds/LostLife.mp3")
    this.load.image("bullet", "assets/bullet.png")
    this.load.image("lightSp", "assets/light.png")
}

function Create()
{
    console.log("Phaser version: " + Phaser.VERSION)

    // CREATION OF THE DIFFERENT SCREENS
    gameMode = 0;

    //background
    this.add.image(gameConfig.width / 2, gameConfig.height /2,"background")
    
    // 3 lives pictures


        lives = [ ];
        lives.push(this.add.image(1100,50, "lives"))
        lives.push(this.add.image(1155,50, "lives"))
        lives.push(this.add.image(1210,50, "lives"))

    //platforms for the aliens and ghosts
    platform = this.physics.add.staticGroup();
    platform.create(gameConfig.width -580, gameConfig.height -100,"ground").setScale(1).refreshBody();
    platform.create(gameConfig.width -1280, gameConfig.height -100,"ground");
    platform.create(gameConfig.width -980, gameConfig.height -100,"ground");
    platform.create(gameConfig.width -180, gameConfig.height -100,"ground");
    
   
   
   
    // Enemy
    enemiesList = [ ]
    enemyGroup =this.physics.add.group();

    // animation enemy 
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('alien', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'alien', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('alien', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    cursors = this.input.keyboard.createCursorKeys();


    // Ghost
    ghostList = [ ]
    ghostGroup = this.physics.add.group()

    const spawnSomethingConfig =
    {
        delay : 5000,
        callback: spawnSomething,
        repeat : -1
    }
    somethingSpawnTimer = this.time.addEvent(spawnSomethingConfig)

    // ghost animation
    this.anims.create({
        key: 'leftG',
        frames: this.anims.generateFrameNumbers('ghost', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turnG',
        frames: [ { key: 'ghost', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'rightG',
        frames: this.anims.generateFrameNumbers('ghost', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // GHOST 2
    this.anims.create({
        key: 'leftGr',
        frames: this.anims.generateFrameNumbers('ghost2', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turnGr',
        frames: [ { key: 'ghost2', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'rightGr',
        frames: this.anims.generateFrameNumbers('ghost2', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });


    
            
    // Player
    player = this.physics.add.sprite(gameConfig.width / 2, gameConfig.height -500, "ship");
    
    player.body.allowGravity =false;



    // Bullet Group

    bulletGroup = this.physics.add.group()
    // keyboard trigger for the bulleets
    this.input.keyboard.on('keydown-SPACE', spawnBullet);

   // partcile emitter
    var tractorParticle = this.add.particles("lightSp");

    tractorEmitter = tractorParticle.createEmitter({
        x: 400,
        y: 300,
        speed: 100,
        lifespan: 3000,
        alpha: { start: 1, end: 0},
        //gravityY: 300,
        angle: { min: 60, max: 120 },
        });

    tractorEmitter.startFollow(player, 0, 30)
    tractorEmitter.stop()      

      // Player tap to move the space ship

    this.input.on("pointerdown", playerTap)

   // Collider between platforms and enemy

   this.physics.add.collider(enemyGroup, platform)
   this.physics.add.collider(ghostGroup, platform)
   this.physics.add.collider(enemyGroup, ghostGroup)
   this.physics.add.collider(ghostList, ghostGroup)
   this.physics.add.overlap(enemyGroup, player, gotContact);
   this.physics.add.overlap(ghostGroup, player, gotContactGhost);
   this.physics.add.overlap(ghostGroup,bulletGroup, gotContactBullet)
   this.physics.add.overlap(bulletGroup,platform,gotContactBGround);
    // sounds
    popFX = this.sound.add("laserSound")
    backgroundMusic = this.sound.add("mBackground")
    backgroundMusic.play() ;
    backgroundMusic.loop = true ;
    lostLife = this.sound.add("lostLife")
    // score text
    score = 0;
    scoreText = this.add.text(10, 10, `Saved aliens: ${score}`, { fontSize: '20px', fill: 'white' });
}
   

    
    
    
    
   


function Update()
{
    // Game management step:
    // Add anything you want to happen every frame of your game here.
    
    // Checks and updates the momvement of the aliens and ghosts
    for (let i = 0; i < enemiesList.length; i++) 
    {
        if (enemiesList[i].moving == false)
        {
            x = Phaser.Math.Between(0,gameConfig.width)
            moveTo(enemiesList[i], x)
        }

        // If the enemy is close to the player 
        if(Math.abs(player.x - enemiesList[i].x) <=40)
        {
            // suck them into the air
            enemiesList[i].setGravityY(-1000)
            // light tractoremitter
            tractorEmitter.start()
        }
        else
        {
            // give them normal gravity
            enemiesList[i].setGravityY(300)
            tractorEmitter.stop()
            
            

            // else tracktor emitter 
        }

       
    }

    

    for (let e = 0 ; e < ghostList.length; e++)
    {
        if (ghostList[e].moving == false)
        {
            y= Phaser.Math.Between(0,gameConfig.width)
            moveGhost(ghostList[e], y)

        }
        if(Math.abs(player.x - ghostList[e].x) <=40)
        {
            // suck them into the air
            ghostList[e].setGravityY(-1000)
        }
        else
        {
            // give them normal gravity
            ghostList[e].setGravityY(300)
        }


    }

}
    


// -------------------------------------------------------------------------------------------------------------------------- //
// Custom Functions

function playerTap(tapInfo)
{
    // Set up the tween settings so that:
    const tweenConfig =
    {
        // The tween will affect the player object
        targets: player,
        // It is changing the x value of the player and changing it to be the x of where the player tapped or clicked
        x: tapInfo.x
    }
    // Actually trigger that tween
    currScene.tweens.add(tweenConfig)
}


function spawnSomething()
{
    console.log("Doing a spawn!")
    if (Phaser.Math.Between(0,1) == 1)
    {
        spawnGhost()
    }
    else
    {
        spawnEnemy()
    }
}

function spawnEnemy()
{
    startX = gameConfig.width/Phaser.Math.Between(12,1);
    let enemy = currScene.physics.add.sprite(startX , gameConfig.height -150, "alien");
    enemy.setBounce(0.2)
    enemy.setCollideWorldBounds(true);
    enemy.setTint(Phaser.Math.Between(0xbcf927, 0xFFFF00))
    enemy.moving = false
    
    enemyGroup.add(enemy)

    

    enemiesList.push(enemy)
}


function spawnGhost()
{
        startX = gameConfig.width/Phaser.Math.Between(0,1280);
        let ghost = currScene.physics.add.sprite(startX , gameConfig.height -150, "ghost");
        ghost.setCollideWorldBounds(true);
        ghost.setBounce(0.2);
        ghostGroup.add(ghost);
        ghost.moving= false
        

        if(Phaser.Math.Between(0,1) == 1)
        {
            ghost.art = "leftG"
            ghost.speed = 12000
            
        }   
        else 
        {   
            ghost.art = "leftGr"
            ghost.speed = 3000
            ghost.setMass(100)
            
        }
        ghostList.push (ghost);
}

function moveTo(enemy, destinationX)
{
    console.log("Moving enemy!")
    enemy.moving = true;
    enemy.setVelocityY(-50)
    
    enemy.anims.play('right', true);
    
    if (destinationX < enemy.x)
    {
        enemy.flipX = true;
    }
    else
    {
        enemy.flipX = false;
    }

    // Set up the tween settings so that:
    const tweenConfig =
    {
        // The tween will affect the player object
        targets: enemy,
        x: destinationX,
        duration: 3000,
        onComplete: () => {
            console.log('Arrived!')
            enemy.moving = false
            enemy.setVelocity(0, 500)
            
        }
    }
    // Actually trigger that tween
    enemy.moveTween = currScene.tweens.add(tweenConfig)
    
}

function moveGhost(ghost, destinationX)
{
    console.log("Moving ghost!")
    ghost.moving = true;
    ghost.setVelocityY(-50)

    ghost.anims.play(ghost.art, true);

    if (destinationX < ghost.x)
    {
        ghost.flipX = true;
    }
    else
    {
        ghost.flipX = false;
    }

    // Set up the tween settings so that:
    const tweenConfigG =
    {
        // The tween will affect the player object
        targets: ghost,
        x: destinationX,
        duration: ghost.speed,
        onComplete: () => {
            console.log('Arrived!')
            ghost.moving = false
            ghost.setVelocity(0, 500)
            
        }
    }
    // Actually trigger that tween
    
    ghost.moveTweenG =  currScene.tweens.add(tweenConfigG)
}

function gotContact(player, enemy) {
    
  if (enemy && enemy.body ) {
    const index = enemiesList.indexOf(enemy);
    if (index !== -1) {
      enemiesList.splice(index, 1)
      
    }
    lightSpawn(enemy);
    popFX.play()
    enemy.moveTween.remove()
    enemy.destroy();
    
  }

  score++;
  scoreText.setText(`Saved aliens:` +  score);
}
// Fuction that destroys the ghost when theres is contact bt ghost and the ship
// Its important to remove the ghost from the array and delete the moving tween so it
// does not collapse

function gotContactGhost( player, ghost){

    if (ghost && ghost.body )
    {
            const indexG = ghostList.indexOf(ghost);
            if (indexG !==-1){
                ghostList.splice(indexG,1)
            }
        lostLife.play()
        ghost.moveTweenG.remove()
        ghost.destroy();

    // When theres coctact bt player and enemy u lose a life, 
    // using splice to delete data ( image == life) from the array
        const lastLifeImage = lives.pop();
        if (lastLifeImage) {
        
        lastLifeImage.destroy();
        }
        if (lives.length === 0) {
            gameOver();
        }

       

    }
   
    }

    // light spawn 

function lightSpawn(spawnPoint)
{
    let newLight = currScene.add.image(spawnPoint.x, spawnPoint.y,"lightSp")
    newLight.alpha= 0.95

    // tween of the light
    const tweenConfigLight =
    {
        targets : newLight,
        alpha: 0
    }
    let lightTween = currScene.tweens.add(tweenConfigLight)
    
}
// fuction that spawns a bullet 

function spawnBullet(){
    let newBullet = currScene.physics.add.image(player.x,player.y, "bullet")
    
    newBullet.setCircle(5, 2, 0)
    newBullet.setGravity(1000);
    bulletGroup.add(newBullet);
    
    newBullet.onComplete = function () {newBullet.destroy}
    newBullet.setCollideWorldBounds(true)
  
}

function gotContactBullet(ghost, bullet)
{
    if (ghost && ghost.body)

        {
                const indexGB = ghostList.indexOf(ghost);
                if (indexGB !==-1){
                    ghostList.splice(indexGB,1)
                }
            
           ghost.moveTweenG.remove()
            ghost.destroy()
            bullet.destroy()
        
    }
}

function gotContactBGround(bulletGroup,platform){
    bulletGroup.destroy()
}
{

}

function gameOver(){
    {

        window.location.href = "gameover.html";
    }
   }  





