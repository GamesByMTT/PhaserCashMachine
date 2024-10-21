import Phaser from 'phaser';
import { Scene, GameObjects, Types } from 'phaser';
import { Globals, ResultData, currentGameData, initData } from './Globals';
import { TextLabel } from './TextLabel';
import { gameConfig } from './appconfig';
import SoundManager from './SoundManager';
// Define UiContainer as a Phaser Scene class
export class UiContainer extends Phaser.GameObjects.Container {
    SoundManager: SoundManager
    spinBtn!: Phaser.GameObjects.Sprite;
    maxbetBtn!: Phaser.GameObjects.Sprite;
    autoBetBtn!: Phaser.GameObjects.Sprite;
    CurrentBetText!: TextLabel;
    currentWiningText!: TextLabel;
    WiningText!: Phaser.GameObjects.Text;
    currentBalanceText!: TextLabel;
    CurrentLineText!: TextLabel;
    pBtn!: Phaser.GameObjects.Sprite;
    fadeDoubbleButton!: Phaser.GameObjects.Sprite;
    public isAutoSpinning: boolean = false; // Flag to track if auto-spin is active
    betButtonDisable!: Phaser.GameObjects.Container
    private winTween: Phaser.Tweens.Tween | null = null; // Store the win tween

    constructor(scene: Scene, spinCallBack: () => void, soundManager: SoundManager) {
        super(scene);
        scene.add.existing(this); 
        // Initialize UI elements
        // this.maxBetInit();
        this.spinBtnInit(spinCallBack);
        // this.autoSpinBtnInit(spinCallBack);
        this.lineBtnInit();
        this.winBtnInit();
        this.balanceBtnInit();
        // this.BetBtnInit();
        this.SoundManager = soundManager;
    }

    /**
     * @method lineBtnInit Shows the number of lines for example 1 to 20
     */
    lineBtnInit() { 
        const container = this.scene.add.container(gameConfig.scale.width / 1.75, gameConfig.scale.height / 1.075);
    
        // container.add(lineText);
        this.pBtn = this.createButton('pBtn', 0, 0, () => {
            this.bnuttonMusic("buttonpressed");
            this.pBtn.setTexture('pBtnH');
            this.pBtn.disableInteractive();
            if (!currentGameData.isMoving) {
                currentGameData.currentBetIndex++;
                if (currentGameData.currentBetIndex >= initData.gameData.Bets.length) {
                    currentGameData.currentBetIndex = 0;
                }
                const betAmount = initData.gameData.Bets[currentGameData.currentBetIndex];
                Globals.emitter?.Call("betChange");
                this.CurrentLineText.updateLabelText(betAmount);
               
                // this.CurrentBetText.updateLabelText(updatedBetAmount.toString());
            }
            this.scene.time.delayedCall(200, () => {
                this.pBtn.setTexture('pBtn');
                this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            });
        }).setDepth(8).setScale(0.2);
        container.add(this.pBtn);
        const betHeading = this.scene.add.text(-85, -30, "BET", {color: "#ffffff", align: "center", fontSize: "25px"}).setOrigin(0.5)
        this.CurrentLineText = new TextLabel(this.scene, -85, 10, initData.gameData.Bets[currentGameData.currentBetIndex], 40, "#ff0000").setOrigin(0.5);
        //Line Count
        container.add([betHeading, this.CurrentLineText ]).setDepth(1)
    }

    /**
     * @method winBtnInit add sprite and text
     * @description add the sprite/Placeholder and text for winning amount 
     */
    winBtnInit() {
        const winPanelChild = this.scene.add.container(gameConfig.scale.width / 1.35, gameConfig.scale.height / 1.075)
        const currentWining: any = ResultData.playerData.currentWining;
        this.currentWiningText = new TextLabel(this.scene, 0, 10, currentWining, 40, "#ff0000").setOrigin(0.5);
        this.WiningText = this.scene.add.text(0, -30, "WIN", {color:"#ffffff", fontSize: "25px", align:"center"}).setOrigin(0.5)
        
        winPanelChild.add([this.WiningText, this.currentWiningText, ]);
    }

    /**
     * @method balanceBtnInit Remaning balance after bet (total)
     * @description added the sprite/placeholder and Text for Total Balance 
     */
    balanceBtnInit() {
        const container = this.scene.add.container(gameConfig.scale.width / 3.5, gameConfig.scale.height/1.05);
        // container.add(balancePanel);
        currentGameData.currentBalance = initData.playerData.Balance;
        const creditHeading = this.scene.add.text(-65, -60, "BALANCE", {color: "#ffffff", align: "center", fontSize: "25px"})
        this.currentBalanceText = new TextLabel(this.scene, -15, -10, currentGameData.currentBalance.toFixed(2), 40, "#ff0000").setOrigin(0.5);
        container.add([creditHeading, this.currentBalanceText]);
    }
    /**
     * @method spinBtnInit Spin the reel
     * @description this method is used for creating and spin button and on button click the a SPIn emit will be triggered to socket and will deduct the amout according to the bet
     */
    spinBtnInit(spinCallBack: () => void) {
        this.spinBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "spinBtn");
        this.spinBtn = this.createButton('spinBtn', gameConfig.scale.width / 1.1, gameConfig.scale.height/1.1, () => {
                this.bnuttonMusic("spinButton");
               
            // checking if autoSpining is working or not if it is auto Spining then stop it
            if(this.isAutoSpinning){
                // this.autoBetBtn.emit('pointerdown'); // Simulate the pointerdown event
                // this.autoBetBtn.emit('pointerup'); // Simulate the pointerup event (if needed)
                return;
            }
        // tween added to scale traINnsition
            this.scene.tweens.add({
                targets: this.spinBtn,
                duration: 100,
                onComplete: () => {
                    // Send message and update the balance
                    Globals.Socket?.sendMessage("SPIN", { currentBet: currentGameData.currentBetIndex, matrixX: currentGameData.currentBetIndex + 1, currentLines: 1});
                    currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                    this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                    // Trigger the spin callback
                    this.onSpin(true);
                    spinCallBack();
                }
            });
        }).setDepth(1);
        this.spinBtn.setScale(0.8)
    }

    /**
     * @method autoSpinBtnInit 
     * @param spinCallBack 
     * @description crete and auto spin button and on that spin button click it change the sprite and called a recursive function and update the balance accroding to that
     */
    autoSpinBtnInit(spinCallBack: () => void) {
        this.autoBetBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "autoSpin");
        this.autoBetBtn = this.createButton(
            'autoSpin',
            this.autoBetBtn.width * 1.1,
            gameConfig.scale.height/1.1,
            () => {
                // this.normalButtonSound.play()
                this.scene.tweens.add({
                    targets: this.autoBetBtn,
                    duration: 100,
                    onComplete: () =>{
                        this.isAutoSpinning = !this.isAutoSpinning; // Toggle auto-spin state
                        if (this.isAutoSpinning && currentGameData.currentBalance > 0) {
                            Globals.Socket?.sendMessage("SPIN", {
                                currentBet: currentGameData.currentBetIndex,
                                currentLines : 20
                            });
                            currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                            this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                            this.autoSpinRec(true)
                            spinCallBack(); // Callback to indicate the spin has started
                            // Start the spin recursion
                            this.startSpinRecursion(spinCallBack);
                        } else {
                            // Stop the spin if auto-spin is turned off
                            this.autoSpinRec(false);
                        }
                    }
                })
            }
        ).setDepth(0);
        this.autoBetBtn.setScale(0.8)
    }
   
    /**
     * @method startSpinRecursion
     * @param spinCallBack 
     */
    startSpinRecursion(spinCallBack: () => void) {
        if (this.isAutoSpinning && currentGameData.currentBalance > 0) {
            // this.startFireAnimation();
            // Delay before the next spin
            const delay = currentGameData.isMoving && (ResultData.gameData.symbolsToEmit.length > 0) ? 3000 : 5000;
            this.scene.time.delayedCall(delay, () => {
                if (this.isAutoSpinning && currentGameData.currentBalance >= 0) {
                    Globals.Socket?.sendMessage("SPIN", {
                        currentBet: currentGameData.currentBetIndex,
                        currentLines : 20
                    });
                    currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                    this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                    spinCallBack();
                    // Call the spin recursively
                    this.spinRecursively(spinCallBack);
                }
            });
        }
    }

    spinRecursively(spinCallBack: () => void) {
        if (this.isAutoSpinning) {
            // Perform the spin
            this.autoSpinRec(true);
            if (currentGameData.currentBalance < initData.gameData.Bets[currentGameData.currentBetIndex]) {
                // Stop the spin when a winning condition is met or balance is insufficient
                this.autoSpinRec(false);
                spinCallBack();
            } else {
                // Continue spinning if no winning condition is met and balance is sufficient
                this.startSpinRecursion(spinCallBack);
            }
        }
    }
    
    createButton(key: string, x: number, y: number, callback: () => void): Phaser.GameObjects.Sprite {
        const button = this.scene.add.sprite(x, y, key).setInteractive({ useHandCursor: true, pixelPerfect: true });
        button.on('pointerdown', callback);
        return button;
    }
   
    autoSpinRec(spin: boolean){
        if(spin){
            // this.spinBtn.setTexture("spinBtnOnPressed"); 
            this.spinBtn.setTexture("spinBtn");
            // this.autoBetBtn.setTexture("autoSpinOnPressed");
            // this.autoBetBtn.setTexture("autoSpin");
            // this.maxbetBtn.disableInteractive();
            // this.maxbetBtn.setTexture("maxBetBtOnPressed");
            this.pBtn.disableInteractive();
            this.pBtn.setTexture("pBtnH")
            // this.spinBtn.setAlpha(0.5)
            // this.autoBetBtn.setAlpha(0.5)
        }else{
            this.spinBtn.setTexture("spinBtn");
            // this.autoBetBtn.setTexture("autoSpin");
            // this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            // this.autoBetBtn.setAlpha(1)
            this.pBtn.setTexture("pBtn")
            // this.maxbetBtn.setTexture("maxBetBtn");
           
        }        
    }

    onSpin(spin: boolean) {
        // Handle spin functionality
        if(this.isAutoSpinning){
            return
        }
        if(spin){
            this.spinBtn.disableInteractive();
            // this.spinBtn.setTexture("spinBtnOnPressed");
            this.spinBtn.setTexture("spinBtn");
            // this.autoBetBtn.setTexture("autoSpin")
            // this.autoBetBtn.setTexture("autoSpinOnPressed")
            // this.autoBetBtn.disableInteractive();
            // this.maxbetBtn.disableInteractive();
            // this.maxbetBtn.setTexture("maxBetBtOnPressed");
            this.pBtn.disableInteractive();
            this.pBtn.setTexture("pBtnH")
            this.spinBtn.setAlpha(0.5)
            // this.autoBetBtn.setAlpha(0.5)
            
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.spinBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            // this.autoBetBtn.setTexture("autoSpin");
            // this.autoBetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            // this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            // this.maxbetBtn.setTexture("maxBetBtn");
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setTexture("pBtn")
            this.spinBtn.setScale(0.8);
            // this.autoBetBtn.setScale(0.8);
            this.spinBtn.setAlpha(1)
            // this.autoBetBtn.setAlpha(1)
        }        
    }

    bnuttonMusic(key: string){
        this.SoundManager.playSound(key)
    }
    update() {          
            if(parseFloat(this.currentWiningText.text) === 0){
                if(this.winTween){
                    this.winTween.stop();
                }
            }                    
    }
    
}
