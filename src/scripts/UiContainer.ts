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
    betoptionBtn!: InteractiveBtn
    pBtn!: Phaser.GameObjects.Sprite;
    arrowOpener!: Phaser.GameObjects.Sprite;
    fadeDoubbleButton!: Phaser.GameObjects.Sprite;
    autoBetBg!: Phaser.GameObjects.Sprite
    betContainer!: Phaser.GameObjects.Container;
    zeroBetButton!: InteractiveBtn;
    tenBetButton!: InteractiveBtn;
    twentyFiveBetButton!: InteractiveBtn;
    fiftBetButton!: InteractiveBtn;
    hundredBetButton!: InteractiveBtn;
    public isAutoSpinning: boolean = false; // Flag to track if auto-spin is active
    betButtonDisable!: Phaser.GameObjects.Container;
    isOpen: boolean = false;
    private winTween: Phaser.Tweens.Tween | null = null; // Store the win tween

    constructor(scene: Scene, spinCallBack: () => void, soundManager: SoundManager) {
        super(scene);
        scene.add.existing(this); 
        // Initialize UI elements
        // this.maxBetInit();
        // this.spinBtnInit(spinCallBack);
        // this.autoSpinBtnInit(spinCallBack);
        this.lineBtnInit();
        this.winBtnInit();
        this.balanceBtnInit();
        this.littleArrow();
        this.BetBtnInit();
        this.zerofun();
        this.tenFun()
        this.twentyfiveFun();
        this.fiftyFun();
        this.hundredBetFun();
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
        }).setScale(0.2);
        container.add(this.pBtn);
        const betHeading = this.scene.add.text(-85, -30, "BET", {color: "#ffffff", align: "center", fontSize: "25px"}).setOrigin(0.5)
        this.CurrentLineText = new TextLabel(this.scene, -85, 10, initData.gameData.Bets[currentGameData.currentBetIndex], 40, "#ff0000").setOrigin(0.5);
        //Line Count
        container.add([betHeading, this.CurrentLineText ]).setDepth(1)
    }

    littleArrow(){
        const menuBtnTextures = [
            this.scene.textures.get('smallPlayBg'),
            this.scene.textures.get('smallPlayBgHover')
        ];
        this.betoptionBtn = new InteractiveBtn(this.scene, menuBtnTextures, () => {
            // this.buttonMusic("buttonpressed")
            this.openbetOptions()

        }, 0, true);
        this.betoptionBtn.setPosition(gameConfig.scale.width * 0.832, gameConfig.scale.height / 1.15 ).setScale(0.75);
        this.betoptionBtn.setDepth(2);
        this.add(this.betoptionBtn);
    }
    zerofun(){
        const zeroBtn = [
            this.scene.textures.get("zeroBetBtn"),
            this.scene.textures.get("zeroHoverBetBtn")
        ]
        this.zeroBetButton = new InteractiveBtn(this.scene, zeroBtn, () =>{
            this.openbetOptions()
        }, 1, false).setScale(0.4).setDepth(10);
        this.add(this.zeroBetButton)
    }

    tenFun(){
        const tenBtn = [
            this.scene.textures.get("tenBetBtn"),
            this.scene.textures.get("tenHoverBetBtn")
        ]
        this.tenBetButton = new InteractiveBtn(this.scene, tenBtn, () =>{
            this.openbetOptions
        }, 2, false).setScale(0.4).setDepth(10)
        this.add(this.tenBetButton)
    }

    twentyfiveFun(){
        const twentyFiveBtn = [
            this.scene.textures.get("TwentyFiveBetBtn"),
            this.scene.textures.get("TwentyFiveHoverBetBtn")
        ]
        this.twentyFiveBetButton = new InteractiveBtn(this.scene, twentyFiveBtn, () =>{
            this.openbetOptions()
        }, 3, false).setScale(0.4).setDepth(10);
        this.add(this.twentyFiveBetButton)
    }

    fiftyFun(){
        const fiftyBtn =[
            this.scene.textures.get("FiftyBetBtn"),
            this.scene.textures.get("FiftyHoverBetBtn")
         ]
         this.fiftBetButton = new InteractiveBtn(this.scene, fiftyBtn, ()=>{
             this.openbetOptions()
         }, 4, false).setScale(0.4).setDepth(10)
         this.add(this.fiftBetButton)
    }

    hundredBetFun(){
        const hundredBtn = [
            this.scene.textures.get("HundredBetBtn"),
            this.scene.textures.get("HundredHoverBetBtn"),
        ]
        this.hundredBetButton = new InteractiveBtn(this.scene, hundredBtn, ()=>{
            this.openbetOptions()
        }, 5, false).setScale(0.4).setDepth(10);
        this.add(this.hundredBetButton);
    }

    BetBtnInit(){
        this.autoBetBg =  this.scene.add.sprite(gameConfig.scale.width* 0.67, gameConfig.scale.height/1.19, "bgAutoSpin").setScale(0.45)
        .setDepth(5);
        this.autoBetBg.setVisible(false)
    }
    openbetOptions(){
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.tweenToPosition(this.zeroBetButton, 5);
            this.tweenToPosition(this.tenBetButton, 4);
            this.tweenToPosition(this.twentyFiveBetButton, 3);
            this.tweenToPosition(this.fiftBetButton, 2);
            this.tweenToPosition(this.hundredBetButton, 1);
        } else {
            this.tweenBack(this.zeroBetButton);
            this.tweenBack(this.tenBetButton);
            this.tweenBack(this.twentyFiveBetButton);
            this.tweenBack(this.fiftBetButton);
            this.tweenBack(this.hundredBetButton);
        }
    }

    tweenToPosition(button: InteractiveBtn, index: number) {
        this.autoBetBg.setVisible(true)
        const targetX =  (this.betoptionBtn.y * 1.7) - (index  * (this.betoptionBtn.height/1.1))
        // Calculate the x position with spacing
        button.setPosition(this.betoptionBtn.x, this.betoptionBtn.y)
         button.setVisible(true);

         this.scene.tweens.add({
            targets: this.autoBetBg,
            x: gameConfig.scale.width * 0.67,  // Adjust these values as needed
            duration: 600,
            ease: 'Elastic',
            easeParams: [1, 0.9]
        });
    
         this.scene.tweens.add({
             targets: button,
             x: targetX,
             duration: 600,
             ease: 'Elastic',
             easeParams: [1, 0.9],
             onComplete: () => {
                 button.setInteractive(true);
                 this.betoptionBtn.setInteractive(true);
             }
         });
     }
    // tweenToPosition(button: InteractiveBtn, index: number){
    //     const targetX = this.betoptionBtn.x - (this.betoptionBtn.width/2 );
    //     const baseY = this.betoptionBtn.y;
    //     const spacing = 60; // Adjust this value to control vertical spacing between buttons
    //     this.zeroBetButton.setVisible(true).setPosition(targetX, baseY - (spacing * 4));
    //     this.tenBetButton.setVisible(true).setPosition(targetX, baseY - (spacing * 3));
    //     this.twentyFiveBetButton.setVisible(true).setPosition(targetX, baseY - (spacing * 2));
    //     this.fiftBetButton.setVisible(true).setPosition(targetX, baseY - spacing);
    //     this.hundredBetButton.setVisible(true).setPosition(targetX, baseY);
    //     this.betContainer.setVisible(true);
    //     // Set container position
    //     this.betContainer.setPosition(this.betoptionBtn.x, this.betoptionBtn.y);
    
    //     // Debug logs to check positions
    //     console.log('Target X:', targetX);
    //     console.log('Base Y:', baseY);
    //     console.log('Container Position:', this.betContainer.x, this.betContainer.y);
    //     console.log('Zero Button Position:', this.zeroBetButton.x, this.zeroBetButton.y);
    

    //     this.scene.tweens.add({
    //         targets: this.betContainer,
    //         x: targetX,
    //         duration: 600,
    //         ease: 'Elastic',
    //         easeParams: [1, 0.9],
    //         onComplete: () => {
    //             [
    //                 this.zeroBetButton,
    //                 this.tenBetButton,
    //                 this.twentyFiveBetButton,
    //                 this.fiftBetButton,
    //                 this.hundredBetButton
    //             ].forEach(button => {
    //                 button.setVisible(true)
    //             });
    //         }
    //     });
    //     const buttons = [
    //         this.zeroBetButton,
    //         this.tenBetButton,
    //         this.twentyFiveBetButton,
    //         this.fiftBetButton,
    //         this.hundredBetButton
    //     ];
    
    //     buttons.forEach((button, index) => {
    //         button.setVisible(true); // Ensure button is visible before tween
    //         this.scene.tweens.add({
    //             targets: button,
    //             x: targetX,
    //             y: baseY - (spacing * (4 - index)),
    //             duration: 600,
    //             ease: 'Elastic',
    //             easeParams: [1, 0.9],
    //             delay: index * 100
    //         });
    //     });
    // }
    tweenBack(button: InteractiveBtn) {
        button.setInteractive(false);
        this.scene.tweens.add({
            targets: button,
            x: button,
            duration: 300,
            ease: 'Elastic',
            easeParams: [1, 0.9],
            onComplete: () => {
                // this.openPopupBg.setVisible(false)
                button.setVisible(false);
                this.autoBetBg.setVisible(false)
            }
        });
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
            this.spinBtn.setTexture("spinBtn");
            this.pBtn.disableInteractive();
            this.pBtn.setTexture("pBtnH")
           
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setTexture("pBtn")
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
           
            this.pBtn.disableInteractive();
            this.pBtn.setTexture("pBtnH")
            this.spinBtn.setAlpha(0.5)
            // this.autoBetBtn.setAlpha(0.5)
            
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.spinBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setTexture("pBtn")
            this.spinBtn.setScale(0.8);
            this.spinBtn.setAlpha(1)
          
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

class InteractiveBtn extends Phaser.GameObjects.Sprite {
    moveToPosition: number = -1;
    defaultTexture!: Phaser.Textures.Texture;
    hoverTexture!: Phaser.Textures.Texture

    constructor(scene: Phaser.Scene, textures: Phaser.Textures.Texture[], callback: () => void, endPos: number, visible: boolean) {
        super(scene, 0, 0, textures[0].key); // Use texture key
        this.defaultTexture = textures[0];
        this.hoverTexture = textures[1];        
        this.setOrigin(0.5);
        this.setInteractive();
        this.setVisible(visible);
        this.setDepth(10)
        this.moveToPosition = endPos;
        this.on('pointerover', () => {  // <-- Add this line
            this.setTexture(this.hoverTexture.key);
        });
        this.on('pointerdown', () => {
            this.setTexture(this.hoverTexture.key)
            // this.setFrame(1);
            callback();
        });
        this.on('pointerup', () => {
            this.setTexture(this.defaultTexture.key)
            // this.setFrame(0);
        });
        this.on('pointerout', () => {
            this.setTexture(this.defaultTexture.key)
            // this.setFrame(0);
        });
        // Set up animations if necessary
        this.anims.create({
            key: 'hover',
            frames: this.anims.generateFrameNumbers(textures[1].key),
            frameRate: 10,
            repeat: -1
        });
    }
}
