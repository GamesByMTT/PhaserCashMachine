import { Scene } from 'phaser';
import { Slots } from '../scripts/Slots';
import { UiContainer } from '../scripts/UiContainer';
import { LineGenerator } from '../scripts/Lines';
import { UiPopups } from '../scripts/UiPopup';
import LineSymbols from '../scripts/LineSymbols';
import { 
    Globals, 
    ResultData, 
    currentGameData, 
    initData, 
    gambleResult 
} from '../scripts/Globals';
import { gameConfig } from '../scripts/appconfig';
import BonusScene from './BonusScene';
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
    slot!: Slots;
    lineGenerator!: LineGenerator;
    soundManager!: SoundManager;
    uiContainer!: UiContainer;
    uiPopups!: UiPopups;    
    lineSymbols!: LineSymbols;
    private mainContainer!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Container for better organization and potential performance
        this.mainContainer = this.add.container();

        this.soundManager = new SoundManager(this);
        console.log("MainScene Loaded on Cash Machine");

        this.gameBg = this.add.sprite(width / 2, height / 2, 'greenBackground')
            .setDepth(0)
            .setDisplaySize(1920, 1080);
        this.greenLeftBorder = this.add.sprite(width * 0.07, height/2.3, "greenLeftBorder").setScale(0.6)
        this.greenRightBorder = this.add.sprite(width * 0.93, height/2.3, "greenRightBorder").setScale(0.6)
        this.greenFirstCircle = this.add.sprite(width * 0.25, height/1.9, "greenCircle").setScale(0.7);
        this.greenSecondCircle = this.add.sprite(width * 0.75, height/1.9, "greenCircle").setScale(0.7);
        this.greenHead = this.add.sprite(width/2, height / 5.3, "greenHead").setScale(0.9); 
        this.greenLogo = this.add.sprite(width/2, height/6.2, "greenLogo").setScale(0.8);
        this.taskbar = this.add.sprite(width/2, height/1.1, "taskBar");
        this.greencenterFrame = this.add.sprite(width/2, height/1.8, "greenCentreFrame").setScale(0.48)
        this.whatUSeeText = this.add.sprite(width/2, height/3.85, "whatUSeeText").setScale(0.3 );
        this.slotBg = this.add.sprite(width/2, height/1.8, "slotBg")
        this.mainContainer.add([this.gameBg, this.greenLeftBorder, this.slotBg, this.greenRightBorder, this.greenFirstCircle, this.greenSecondCircle, this.greenHead, this.greenLogo, this.whatUSeeText, this.greencenterFrame, this.taskbar]);
        this.soundManager.playSound("backgroundMusic");

        this.uiContainer = new UiContainer(this, () => this.onSpinCallBack(), this.soundManager);
        this.mainContainer.add(this.uiContainer);

        this.slot = new Slots(this, this.uiContainer, () => this.onResultCallBack(), this.soundManager);
        this.lineGenerator = new LineGenerator(this, this.slot.slotSymbols[0][0].symbol.height + 50, this.slot.slotSymbols[0][0].symbol.width + 10);
        this.mainContainer.add([this.lineGenerator, this.slot]);

        this.uiPopups = new UiPopups(this, this.uiContainer, this.soundManager);
        this.mainContainer.add(this.uiPopups);

        // this.lineSymbols = new LineSymbols(this, 10, 12, this.lineGenerator);
        // this.mainContainer.add(this.lineSymbols);
    }

 

    update(time: number, delta: number) {
        this.uiContainer.update();
    }

    private onResultCallBack() {
        this.uiContainer.onSpin(false);
        this.soundManager.stopSound("onSpin"); 
        this.lineGenerator.showLines(ResultData.gameData.linesToEmit);
    }

    private onSpinCallBack() {
        this.soundManager.playSound("onSpin");
        this.slot.moveReel();
        this.lineGenerator.hideLines();
    }

    recievedMessage(msgType: string, msgParams: any) {
        if (msgType === 'ResultData') {
            // Use setTimeout for better performance in this case
            setTimeout(() => {
                this.handleResultData();
            }, 3000); 

            // Stop tween after a delay for visual effect
            setTimeout(() => {
                this.slot.stopTween();
            }, 1000);
        } else if (msgType === 'GambleResult') {
            this.uiContainer.currentWiningText.updateLabelText(gambleResult.gamleResultData.currentWining.toString());
        }
    }

    // Handle ResultData logic separately
    private handleResultData() {
        if (ResultData.gameData.isBonus) {
            if (this.uiContainer.isAutoSpinning) {
                // Emit events directly instead of simulating clicks
                this.uiContainer.autoBetBtn.emit('pointerdown');
                this.uiContainer.autoBetBtn.emit('pointerup'); 
            }
            Globals.SceneHandler?.addScene('BonusScene', BonusScene, true);
        }

        this.uiContainer.currentWiningText.updateLabelText(ResultData.playerData.currentWining.toString());
        currentGameData.currentBalance = ResultData.playerData.Balance;
        let betValue = (initData.gameData.Bets[currentGameData.currentBetIndex]) * 20;
        let winAmount = ResultData.gameData.WinAmout;
        this.uiContainer.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));

        if (winAmount >= 15 * betValue && winAmount < 20 * betValue) {
            this.showWinPopup(winAmount, 'hugeWinPopup');
        } else if (winAmount >= 20 * betValue && winAmount < 25 * betValue) {
            this.showWinPopup(winAmount, 'megaWinPopup');
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

        const megaWinBg = this.add.sprite(gameConfig.scale.width / 2, gameConfig.scale.height / 2, "megawinAnimBg")
            .setDepth(10)
            .setOrigin(0.5);

        const megaWinStar = this.add.sprite(gameConfig.scale.width / 2, gameConfig.scale.height / 2, "megawinStar")
            .setDepth(12)
            .setOrigin(0.5)
            .setScale(0); 

        this.tweens.add({
            targets: megaWinStar,
            scale: 1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 250 
        });

        // Create coin flip animation once
        this.createCoinFlipAnimation();

        const winningSprite = this.add.sprite(gameConfig.scale.width / 4, gameConfig.scale.height * 0.8, `coin0`)
            .setDepth(13)
            .setScale(0.7)
            .play('coinFlip');

        const winSprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY - 50, spriteKey)
            .setScale(0.8)
            .setDepth(13);

        this.tweens.addCounter({
            from: 0,
            to: winAmount,
            duration: 1000,
            onUpdate: (tween) => {
                // You might want to do something with the incrementing value here
                // For example, update a text object
            },
            onComplete: () => {
                this.time.delayedCall(4000, () => {
                    inputOverlay.destroy();
                    megaWinBg.destroy();
                    megaWinStar.destroy();
                    winSprite.destroy();
                    winningSprite.stop();
                    winningSprite.destroy();
                });
            }
        });
    }

    // Separate function for coin flip animation
    private createCoinFlipAnimation() {
        const coinFrames = [];
        for (let i = 0; i < 19; i++) {
            coinFrames.push({ key: `coin${i}` });
        }

        this.anims.create({
            key: `coinFlip`,
            frames: coinFrames,
            frameRate: 10,
            repeat: -1
        });
    }
}