import { Scene } from 'phaser';
import { Slots } from '../scripts/Slots';
import { UiContainer } from '../scripts/UiContainer';
import { UiPopups } from '../scripts/UiPopup';
import LineSymbols from '../scripts/LineSymbols';
import { 
    Globals, 
    ResultData, 
    currentGameData, 
    initData, 
} from '../scripts/Globals';
import { gameConfig } from '../scripts/appconfig';
import SoundManager from '../scripts/SoundManager';

export default class MainScene extends Scene {
    // Declare properties without explicit initialization
    gameBg!: Phaser.GameObjects.Sprite;
    greenLeftBorder!: Phaser.GameObjects.Sprite;
    greenRightBorder!: Phaser.GameObjects.Sprite;
    redLeftBorder!: Phaser.GameObjects.Sprite;
    redRightBorder!: Phaser.GameObjects.Sprite;
    greenFirstCircle!: Phaser.GameObjects.Sprite;
    greenSecondCircle!: Phaser.GameObjects.Sprite;
    greenHead!: Phaser.GameObjects.Sprite;
    redHead!: Phaser.GameObjects.Sprite;
    greenLogo!: Phaser.GameObjects.Sprite;
    greencenterFrame!: Phaser.GameObjects.Sprite
    whatUSeeText!: Phaser.GameObjects.Sprite
    taskbar!: Phaser.GameObjects.Sprite;
    slotBg!: Phaser.GameObjects.Sprite;
    playBtnBg!: Phaser.GameObjects.Sprite;
    slot!: Slots;
    soundManager!: SoundManager;
    uiContainer!: UiContainer;
    uiPopups!: UiPopups;    
    lineSymbols!: LineSymbols;
    private mainContainer!: Phaser.GameObjects.Container;
    private newmainContainer!: Phaser.GameObjects.Container;
    private betIndexImages: Phaser.GameObjects.Image[] = [];
    private hideReelsTimer: Phaser.Time.TimerEvent | null = null;
    private respinSprite: Phaser.GameObjects.Sprite | null = null;
    private Color: "red" | "green" = "green";
    private colorSprites: Phaser.GameObjects.Sprite[] = []; // Array to store color-dependent sprites
    constructor() {
        super({ key: 'MainScene' });
    }
    private createColorSprites(color: "red" | "green") {
        const { width, height } = this.cameras.main;
        // Destroy existing color sprites if any
        // this.colorSprites.forEach(sprite => {
        // const spriteKey = sprite.texture.key;
        // const spriteColor = spriteKey.includes("green") ? "green" : "red";
        //     if (spriteColor !== color) {
        //         sprite.destroy();
        //     }
        // });
        this.colorSprites = this.colorSprites.filter(sprite => sprite.active);this.colorSprites.forEach(sprite => {
            const spriteKey = sprite.texture.key;
            const spriteColor = spriteKey.includes("green") ? "green" : "red";
            if (spriteColor !== color) {
                sprite.destroy();
            }
        });

        this.colorSprites = this.colorSprites.filter(sprite => sprite.active);

        this.gameBg = this.add.sprite(width / 2, height / 2, `${color}Background`)
            .setDepth(0)
            .setDisplaySize(1920, 1080);
        this.greenLeftBorder = this.add.sprite(width * 0.07, height / 2.3, `${color}LeftBorder`).setScale(0.6)
        this.greenRightBorder = this.add.sprite(width * 0.93, height / 2.3, `${color}RightBorder`).setScale(0.6)
        this.greenHead = this.add.sprite(width / 2, height / 5.3, `${color}Head`).setScale(0.9);
        this.greenLogo = this.add.sprite(width / 2, height / 6.2, `${color}Logo`).setScale(0.8);
        this.greenFirstCircle = this.add.sprite(width * 0.25, height / 1.9, `${color}Circle`).setScale(0.7).setDepth(5);
        this.greenSecondCircle = this.add.sprite(width * 0.75, height / 1.9, `${color}Circle`).setScale(0.7).setDepth(5);
        this.greencenterFrame = this.add.sprite(width / 2, height / 1.8, `${color}CentreFrame`).setScale(0.48).setDepth(5);

        this.colorSprites.push( this.gameBg, this.greenLeftBorder, this.greenRightBorder, this.greenHead, this.greenLogo, this.greenFirstCircle, this.greenSecondCircle, this.greencenterFrame);
        this.newmainContainer.add(this.colorSprites); 
        // this.mainContainer.add([this.taskbar, this.slotBg, this.playBtnBg, this.whatUSeeText]); // Example, adjust as needed
    }
    create() {
        const { width, height } = this.cameras.main;
        this.newmainContainer = this.add.container();
        // Container for better organization and potential performance
        this.mainContainer = this.add.container();
        this.soundManager = new SoundManager(this);
        this.taskbar = this.add.sprite(width/2, height/1.1, "taskBar").setDepth(20);
        this.whatUSeeText = this.add.sprite(width/2, height/3.85, "whatUSeeText").setScale(0.3).setDepth(20);
        this.playBtnBg = this.add.sprite(width/1.12, height/1.15, "playButtonBg").setDepth(20);
        this.slotBg = this.add.sprite(width/2, height/1.8, "slotBg").setDepth(1);
        this.createColorSprites("green");
        this.mainContainer.add([this.slotBg, this.whatUSeeText, this.taskbar, this.playBtnBg]);
        this.soundManager.playSound("backgroundMusic");
        
        this.uiContainer = new UiContainer(this, () => this.onSpinCallBack(), this.soundManager);
        this.mainContainer.add(this.uiContainer);

        this.slot = new Slots(this, this.uiContainer, () => this.onResultCallBack(), this.soundManager);
        // this.lineGenerator = new LineGenerator(this, this.slot.slotSymbols[0][0].symbol.height + 50, this.slot.slotSymbols[0][0].symbol.width + 10);
        this.mainContainer.add([this.slot]);

        this.uiPopups = new UiPopups(this, this.uiContainer, this.soundManager);
        this.mainContainer.add(this.uiPopups);
        this.hideReels();
    }
   
    update(time: number, delta: number) {
        const isMoving = this.slot.isAnySymbolMoving();
        if (ResultData.gameData.hasRedSpin && !isMoving && this.Color !== "red") {
            this.changeColor("red");
        } else if (!ResultData.gameData.hasRedSpin && this.Color !== "green") {
            this.changeColor("green");
        }
        this.uiContainer.update();
    }

   

    private onResultCallBack() {
        if(ResultData.gameData.hasReSpin || ResultData.gameData.hasRedSpin){
            this.uiContainer.onSpin(true);
        }else{
            this.uiContainer.onSpin(false);
        }
        this.soundManager.stopSound("onSpin"); 
        // this.lineGenerator.showLines(ResultData.gameData.linesToEmit);
    }

    private onSpinCallBack() {
        this.soundManager.playSound("onSpin");
        this.slot.moveReel();
        if(ResultData.gameData.isReSpinRunning){
            this.time.delayedCall(1000, () => {
                this.slot.stopTween()
            })
        }
        // this.lineGenerator.hideLines();
    }

    hideReels() {
        const { width, height } = this.cameras.main;
        if (this.hideReelsTimer) {
            this.hideReelsTimer.remove(); // Cancel any pending timer
        }
       
        this.hideReelsTimer = this.time.delayedCall(50, () => { // 50ms delay
            this.hideReelsTimer = null; // Reset the timer
            // Now perform the image updates
            this.betIndexImages.forEach(img => img.destroy());
            this.betIndexImages = [];
            if (currentGameData.currentBetIndex === 0) {
                const centerOverlay = this.add.image(width / 2, height / 1.8, "centerOverLay");
                const rightOverlay = this.add.image(width * 0.75, height / 1.8, "rightOverLay");
                this.betIndexImages.push(centerOverlay, rightOverlay); // Add to array for tracking
            } else if (currentGameData.currentBetIndex === 1) {
                // ... (add image for index 1)
                const rightOverlay = this.add.image(width * 0.75, height / 1.8, "rightOverLay");
                this.betIndexImages.push(rightOverlay); // Add to array for tracking
            }
            this.greenFirstCircle = this.add.sprite(width * 0.25, height/1.9, `${this.Color}Circle`).setScale(0.7).setDepth(5);
            this.greenSecondCircle = this.add.sprite(width * 0.75, height/1.9, `${this.Color}Circle`).setScale(0.7).setDepth(5);
            this.greencenterFrame = this.add.sprite(width/2, height/1.8, `${this.Color}CentreFrame`).setScale(0.48).setDepth(5);
        })
    }

    private changeColor(newColor: "red" | "green") {
        console.log("changeColor MainScene");
        this.Color = newColor;
        this.createColorSprites(newColor); // Recreate sprites with the new color
        this.hideReels()
        if (this.slot) {
            this.slot.updateColor(newColor);
        }
        // Update respin animation if it's playing
        if (this.respinSprite) {
            this.respinSprite.stop();
            this.respinSprite.destroy();
            this.playRespinAnimation(); // Restart animation with new color
        }
    }


    recievedMessage(msgType: string, msgParams: any) {
        if (msgType === 'ResultData') {
            setTimeout(() => {
                this.handleResultData();
            }, 2000); 
            // Stop tween after a delay for visual effect
            setTimeout(() => {
                this.slot.stopTween();
            }, 1000);
            if(ResultData.gameData.hasReSpin || ResultData.gameData.hasRedSpin){
                this.uiContainer.onSpin(true)
                this.time.delayedCall(2000, () => {
                    if(this.greenLogo){
                        this.greenLogo.destroy()
                    }
                    this.playRespinAnimation();
                }, [], this);
                
                const totalNumberOfRespin = ResultData.gameData.resultSymbols.length - 1
                for(let i = 0; i<totalNumberOfRespin; i++){
                    setTimeout(() => {
                        ResultData.gameData.countReSpin += 1;
                        ResultData.gameData.isReSpinRunning = true;
                        if (i === totalNumberOfRespin - 1) {
                            // Set hasReSpin to false after a short delay
                            setTimeout(() => {
                                ResultData.gameData.hasReSpin = false;
                                ResultData.gameData.isReSpinRunning = false;
                                this.uiContainer.setRespinState(false); // This will now trigger the auto-spin to resume
                                ResultData.gameData.countReSpin = 0;
                                if(this.respinSprite){
                                    this.respinSprite.stop();
                                    this.respinSprite.destroy();
                                    this.respinSprite = null;
                                    this.changeColor("green")
                                    this.uiContainer.onSpin(false)
                                    // this.greenLogo = this.add.sprite(this.cameras.main.width/2, this.cameras.main.height/6.2, `${this.Color}Logo`).setScale(0.8);
                                }
                            }, 3000); // Short delay to ensure it runs after the last respin
                        }
                        this.onSpinCallBack()
                    }, 6000 * (i + 1));
                }
            }else{
                if(this.greenLogo){

                }else{
                    this.greenLogo = this.add.sprite(this.cameras.main.width/2, this.cameras.main.height/6.2, `${this.Color}Logo`).setScale(0.8);
                }
                if(ResultData.gameData.isReSpinRunning || ResultData.gameData.countReSpin > 0){
                    ResultData.gameData.isReSpinRunning = false;
                    ResultData.gameData.countReSpin = 0;
                    ResultData.gameData.hasReSpin = false
                }
            }
        } 
        if(msgType === "betChange"){
            this.hideReels();
        }
    }
    playRespinAnimation() {
        const respinFrames: Phaser.Types.Animations.AnimationFrame[] = [];
        for (let i = 0; i < 60; i++) {
            respinFrames.push({ key: `${this.Color}respin${i}` });
        }
        this.anims.create({
            key: 'respinAnimation',
            frames: respinFrames,
            frameRate: 24, // Adjust as needed
            repeat: -1 // Play only once
        });
        this.respinSprite = this.add.sprite(
            this.cameras.main.width / 2,
            this.cameras.main.height / 6.8,
            `${this.Color}respin0` // Initial frame
        ).setDepth(15).setScale(1.1); // Ensure it's on top
        this.respinSprite.play('respinAnimation');
    }

    // Handle ResultData logic separately
    private handleResultData() {
        this.uiContainer.currentWiningText.updateLabelText(ResultData.playerData.currentWining.toString());
        currentGameData.currentBalance = Number(ResultData.playerData.Balance);
        let betValue = (initData.gameData.Bets[currentGameData.currentBetIndex]) * 20;
        let winAmount = ResultData.gameData.WinAmout;
        this.uiContainer.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
        if (winAmount >= 5 * betValue) {
            this.showWinPopup(winAmount, 'hugeWinPopup');
        } 
    }

    // Function to show win popup
    private showWinPopup(winAmount: number, spriteKey: string) {
        const inputOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(9)
            .setInteractive();

        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation(); 
        });

        const coinFrames = [];
        for (let i = 1; i < 138; i++) {
            coinFrames.push({ key: `nicewin${i}` });
        }

        this.anims.create({
            key: `niceWin`,
            frames: coinFrames,
            frameRate: 20,
            repeat: 0
        });
    

        const winningSprite = this.add.sprite(gameConfig.scale.width / 2, gameConfig.scale.height/2, `nicewin1`)
        .setDepth(13)
        .play('niceWin');

        this.tweens.addCounter({
            from: 0,
            to: winAmount,
            duration: 1000,
            onUpdate: (tween) => {
            },
            onComplete: () => {
                this.time.delayedCall(4000, () => {
                    inputOverlay.destroy();
                    winningSprite.stop();
                    winningSprite.destroy();
                });
            }
        });
    }

   
}
