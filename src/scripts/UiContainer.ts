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
    newSpinButton!: InteractiveBtn;
    AutoSpinCountSprite!: Phaser.GameObjects.Sprite
    playTraingle!: Phaser.GameObjects.Sprite
    betLevel!: Phaser.GameObjects.Text
    numberOfAutoSpin!:TextLabel;
    settingClose!: Phaser.GameObjects.Sprite
    public isAutoSpinning: boolean = false; // Flag to track if auto-spin is active
    betButtonDisable!: Phaser.GameObjects.Container;
    autoSpinBorder!: Phaser.GameObjects.Sprite;
    isOpen: boolean = false;
    delayTime: number = 6000;
    private autoSpinDelay: number = 0; // Time to delay the next auto spin
    private isRespinActive: boolean = false;
    private lastSpinCallback: (() => void) | null = null;
    private pendingAutoSpinCount: number = 0;   
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
        this.BetBtnInit();
       
        this.zerofun();
        this.tenFun()
        this.twentyfiveFun();
        this.fiftyFun();
        this.hundredBetFun();
        this.littleArrow();
        this.newSpinSprite(spinCallBack)

        this.SoundManager = soundManager;
    }

    /**
     * @method lineBtnInit Shows the number of lines for example 1 to 20
     */
    lineBtnInit() { 
        const x = gameConfig.scale.width / 1.75;
        const y = gameConfig.scale.height / 1.075
        this.pBtn = this.createButton('pBtn', x, y, () => {
            this.bnuttonMusic("buttonpressed");
            this.pBtn.setTexture('pBtnH');
            this.pBtn.disableInteractive();
          
            if (!currentGameData.isMoving) {
                this.openbetSettingpopup()
            }
            this.scene.time.delayedCall(200, () => {
                this.pBtn.setTexture('pBtn');
                this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            });
        }).setScale(0.2);
        this.add(this.pBtn);
        const betHeading = this.scene.add.text(x -85, y - 30, "BET", {color: "#ffffff", align: "center", fontSize: "25px", fontFamily: "Arial"}).setOrigin(0.5).setDepth(0)
        this.CurrentLineText = new TextLabel(this.scene, x -85, y + 10, initData.gameData.Bets[currentGameData.currentBetIndex], 40, "#ff0000").setOrigin(0.5);
        //Line Count
        this.add([betHeading, this.CurrentLineText ])
    }
    BetBtnInit(){
        this.autoBetBg =  this.scene.add.sprite(gameConfig.scale.width* 0.67, gameConfig.scale.height/1.18, "bgAutoSpin").setScale(0.51)
        .setDepth(9);
        this.autoBetBg.setVisible(false)
        this.add(this.autoBetBg)
    }
    
    zerofun(){
        const zeroBtn = [
            this.scene.textures.get("zeroBetBtn"),
            this.scene.textures.get("zeroHoverBetBtn")
        ]
        this.zeroBetButton = new InteractiveBtn(this.scene, zeroBtn, () =>{
            this.setNumberofAutoSpin(0)
            this.openbetOptions()
        }, 1, false).setScale(0.45).setDepth(10);
        this.add(this.zeroBetButton)
    }

    tenFun(){
        const tenBtn = [
            this.scene.textures.get("tenBetBtn"),
            this.scene.textures.get("tenHoverBetBtn")
        ]
        this.tenBetButton = new InteractiveBtn(this.scene, tenBtn, () =>{
            this.setNumberofAutoSpin(10);
            this.openbetOptions();
        }, 2, false).setScale(0.45).setDepth(10)
        this.add(this.tenBetButton)
    }

    twentyfiveFun(){
        const twentyFiveBtn = [
            this.scene.textures.get("TwentyFiveBetBtn"),
            this.scene.textures.get("TwentyFiveHoverBetBtn")
        ]
        this.twentyFiveBetButton = new InteractiveBtn(this.scene, twentyFiveBtn, () =>{
            this.setNumberofAutoSpin(25)
            this.openbetOptions()
        }, 3, false).setScale(0.45).setDepth(10);
        this.add(this.twentyFiveBetButton)
    }

    fiftyFun(){
        const fiftyBtn =[
            this.scene.textures.get("FiftyBetBtn"),
            this.scene.textures.get("FiftyHoverBetBtn")
         ]
         this.fiftBetButton = new InteractiveBtn(this.scene, fiftyBtn, ()=>{
            this.setNumberofAutoSpin(50)
             this.openbetOptions()
         }, 4, false).setScale(0.45).setDepth(10)
         this.add(this.fiftBetButton)
    }

    hundredBetFun(){
        const hundredBtn = [
            this.scene.textures.get("HundredBetBtn"),
            this.scene.textures.get("HundredHoverBetBtn"),
        ]
        this.hundredBetButton = new InteractiveBtn(this.scene, hundredBtn, ()=>{
            this.setNumberofAutoSpin(100)
            this.openbetOptions()
        }, 5, false).setScale(0.45).setDepth(10);
        this.add(this.hundredBetButton);
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
        const targetX =  (this.betoptionBtn.y * 1.69) - (index  * (this.betoptionBtn.width * 1.05))
        // Calculate the x position with spacing
        button.setPosition(this.betoptionBtn.x, this.betoptionBtn.y)
         button.setVisible(true);
         if(!this.autoBetBg.visible){
            this.autoBetBg.setVisible(true)
         }
         this.scene.tweens.add({
            targets: this.autoBetBg,
            x: gameConfig.scale.width * 0.655,  // Adjust these values as needed
            duration: 600,
            ease: 'Elastic',
            easeParams: [1, 0.9],
            onComplete: () => {
            }
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
    littleArrow(){
        const menuBtnTextures = [
            this.scene.textures.get('smallPlayBg'),
            this.scene.textures.get('smallPlayBgHover')
        ];
        const arrowImage = this.scene.add.sprite(gameConfig.scale.width * 0.832, gameConfig.scale.height / 1.15, "betArrow").setScale(0.45)
        this.betoptionBtn = new InteractiveBtn(this.scene, menuBtnTextures, () => {
            // this.buttonMusic("buttonpressed")
            this.openbetOptions()
        }, 0, true);
        
        this.betoptionBtn.setPosition(gameConfig.scale.width * 0.832, gameConfig.scale.height / 1.15 ).setScale(0.7);
        this.betoptionBtn.setDepth(10);
        this.add([this.betoptionBtn, arrowImage]);
    }


    openbetSettingpopup(){
        const inputOverlay = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(16)
            .setInteractive();
    
        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        });
        const numSteps = 3
        let betLevelNumber = 2
        const infopopupContainer = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        ).setDepth(17); // Set depth higher than inputOverlay
        const betSettingPopup = this.scene.add.image(0, 0, 'messagePopup').setDepth(18);
        const betSettingsHeading = this.scene.add.sprite(0, -100, "betSettingsHeading").setScale(0.4)
        const betScrollBar = this.scene.add.image(0, 0, 'sounProgress').setOrigin(0, 0.5);
        const betHandle = this.scene.add.image(0, 0, 'indicatorSprite').setOrigin(0.5, 0.5).setScale(0.4);
        const PlusButton = this.scene.add.image( 380, 150, "pBtn").setScale(0.2).setInteractive()
        const minusButton = this.scene.add.image(-380, 150, "pBtn").setScale(0.2).setInteractive()
        const betLabel = this.scene.add.text(0, 30, "BET LEVEL", {color: "#ffffff", fontSize: "25px", fontFamily: 'Arial'}).setOrigin(0.5)
        this.betLevel = this.scene.add.text(0, 70, initData.gameData.Bets[currentGameData.currentBetIndex], {color: "#ffffff", fontSize: "40px", fontFamily: 'Arial'}).setOrigin(0.5);
        const betScrollbarContainer = this.scene.add.container(-320, 150);
        betScrollbarContainer.add([betScrollBar, betHandle]);

        const updateScrollbar = (handle: Phaser.GameObjects.Image, scrollBar: Phaser.GameObjects.Image, level: number) => {
            const minX = 0;
            const maxX = scrollBar.width;
            // Calculate position based on discrete steps
            handle.x = minX + (level / (numSteps - 1)) * maxX;
        };

        PlusButton.on('pointerdown', () => {
            if (betLevelNumber < numSteps - 1) {
                betLevelNumber++;
                console.log(betLevelNumber, "betLevelNumber");
                updateScrollbar(betHandle, betScrollBar, betLevelNumber);
                currentGameData.currentBetIndex = betLevelNumber
                this.betLevel.setText(initData.gameData.Bets[currentGameData.currentBetIndex])
                // updateLevel(betLevelNumber, betHandle, betScrollBar, false);
            }
        });
    
        // Minus button click handler
        minusButton.on('pointerdown', () => {
            if (betLevelNumber > 0) {
                console.log(betLevelNumber);
                betLevelNumber--;
                updateScrollbar(betHandle, betScrollBar, betLevelNumber);
                currentGameData.currentBetIndex = betLevelNumber
                this.betLevel.setText(initData.gameData.Bets[currentGameData.currentBetIndex])
                // updateLevel(betLevelNumber, betHandle, betScrollBar, false);
            }
        });
        const updateLevel = (localX: number, handle: Phaser.GameObjects.Image, scrollBar: Phaser.GameObjects.Image, isSound: boolean) => {
            const minX = 0;
            const maxX = scrollBar.width;
            const stepWidth = maxX / (numSteps - 1);
            // Calculate the nearest step based on the x position
            let step = Math.round(localX / stepWidth);
            step = Phaser.Math.Clamp(step, 0, numSteps - 1);
            // Set handle position to exact step position
            handle.x = step * stepWidth;
            betLevelNumber = step;
            // You can map these steps to your desired values (0, 50, 100) like this:
            const values = [0, 1, 2];
            currentGameData.currentBetIndex = values[step]
            this.betLevel.setText(initData.gameData.Bets[currentGameData.currentBetIndex]); // Update the text display
            console.log(`Selected value: ${values[step]}`, currentGameData.currentBetIndex);
            const betAmount = initData.gameData.Bets[currentGameData.currentBetIndex];
            Globals.emitter?.Call("betChange");
            this.CurrentLineText.updateLabelText(betAmount);
        };
        betHandle.setInteractive({ draggable: true });
        betHandle.on('drag', (pointer: Phaser.Input.Pointer, dragX: number) => {
            const localX = dragX;
            updateLevel(localX, betHandle, betScrollBar, false);
        });
        betScrollBar.setInteractive();
        betScrollBar.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const localX = pointer.x - betScrollbarContainer.x;
            updateLevel(localX, betHandle, betScrollBar, false);
        });

        const exitButtonSprites = [
            this.scene.textures.get('exitButton'),
            this.scene.textures.get('exitButtonPressed')
        ];
        
        this.settingClose = new InteractiveBtn(this.scene, exitButtonSprites, () => {
            infopopupContainer.destroy();
            inputOverlay.destroy();
            inputOverlay.destroy();
            // this.buttonMusic("buttonpressed");
        }, 0, true);
        
        this.settingClose.setPosition(400, -250).setScale(0.2);
        // Initialize scrollbar position
        updateScrollbar(betHandle, betScrollBar, betLevelNumber);
        // betScrollbarContainer.setPosition(-320, 140);
        infopopupContainer.add([betSettingPopup, betSettingsHeading, betLabel, this.betLevel, this.settingClose, PlusButton, minusButton, betScrollbarContainer]);
    }

    /**
     * @method winBtnInit add sprite and text
     * @description add the sprite/Placeholder and text for winning amount 
     */
    winBtnInit() {
        const x = gameConfig.scale.width / 1.35;
        const y = gameConfig.scale.height / 1.075
        const currentWining: any = ResultData.playerData.currentWining;
        this.currentWiningText = new TextLabel(this.scene, x, y + 10, currentWining, 40, "#ff0000").setOrigin(0.5);
        this.WiningText = this.scene.add.text(x, y-30, "WIN", {color:"#ffffff", fontSize: "25px", align:"center", fontFamily: "Arial"}).setOrigin(0.5).setDepth(1)
        this.add([this.WiningText, this.currentWiningText, ]);
    }

    newSpinSprite(spinCallBack: () => void){
        const largeSpin =[
            this.scene.textures.get("largePlayBg"),
            this.scene.textures.get("largePlayHover"),
         ]
         this.newSpinButton = new InteractiveBtn(this.scene, largeSpin, ()=>{
           this.bnuttonMusic("spinButton");
                // checking if autoSpining is working or not if it is auto Spining then stop it
                if(this.isAutoSpinning){
                    this.stopAutoSpin();
                    return;
                }
                if(ResultData.gameData.autoSpinCount > 0){
                    this.isAutoSpinning = true; // Set auto-spinning flag
                    this.autoSpin(ResultData.gameData.autoSpinCount, spinCallBack); // Start auto-spin
                }else{
                   this.singleSpin(spinCallBack)
                }
         }, 0, true)
         this.playTraingle = this.scene.add.sprite(gameConfig.scale.width / 1.1, gameConfig.scale.height/1.152, "PlayTriangle").setScale(0.2)
         this.newSpinButton.setPosition(gameConfig.scale.width / 1.102, gameConfig.scale.height/1.152 ).setScale(0.7);
         this.add([this.newSpinButton, this.playTraingle])
    }

    singleSpin(spinCallBack: () => void) {
        console.log("vdfvvfbjfbgbghbghbk");
        this.scene.tweens.add({
            targets: this.newSpinButton,
            duration: 100,
            onComplete: () => {
                spinCallBack();
                Globals.Socket?.sendMessage("SPIN", {
                    currentBet: currentGameData.currentBetIndex,
                    matrixX: currentGameData.currentBetIndex + 1,
                    // currentLines: 1
                });
                currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                this.onSpin(true);
                
            }
        });
    }

    setNumberofAutoSpin(autoSpinCount: number){
        ResultData.gameData.autoSpinCount = autoSpinCount;
        if(autoSpinCount == 0){
            if(this.numberOfAutoSpin && this.autoSpinBorder){
                this.numberOfAutoSpin.destroy()
                this.autoSpinBorder.destroy()
                this.AutoSpinCountSprite.destroy();
            }
            if(!this.playTraingle.active){
                this.playTraingle = this.scene.add.sprite(gameConfig.scale.width / 1.1, gameConfig.scale.height/1.152, "PlayTriangle").setScale(0.2)
            }
            return
        }else{
            if(this.numberOfAutoSpin){
                this.numberOfAutoSpin.destroy()
            }
            if(this.playTraingle){
                this.playTraingle.destroy()
            }
            if(!this.autoSpinBorder || !this.autoSpinBorder.active){
                this.autoSpinBorder = this.scene.add.sprite(gameConfig.scale.width / 1.1, gameConfig.scale.height/1.14, "autoSpinCircle").setScale(0.55);
                this.AutoSpinCountSprite = this.scene.add.sprite(gameConfig.scale.width / 1.1, gameConfig.scale.height/1.15, "AutoSpinCountBg").setScale(0.5)
            }
            this.numberOfAutoSpin = new TextLabel(this.scene, gameConfig.scale.width / 1.102, gameConfig.scale.height/1.152, ResultData.gameData.autoSpinCount.toString(), 30, "#ff0000").setOrigin(0.5);
        }
    }
    /**
     * @method balanceBtnInit Remaning balance after bet (total)
     * @description added the sprite/placeholder and Text for Total Balance 
     */
    balanceBtnInit() {
        const x = gameConfig.scale.width / 3.5;
        const y = gameConfig.scale.height/1.05
        currentGameData.currentBalance = initData.playerData.Balance;
        const creditHeading = this.scene.add.text(x - 65, y - 60, "BALANCE", {color: "#ffffff", align: "center", fontSize: "25px", fontFamily: "Arial"})
        this.currentBalanceText = new TextLabel(this.scene, x - 15, y - 10, currentGameData.currentBalance.toFixed(2), 40, "#ff0000").setOrigin(0.5);
        this.add([creditHeading, this.currentBalanceText]);
    }

    autoSpin(count: number, spinCallBack: () => void) {
        this.lastSpinCallback = spinCallBack; // Store callback for later use
        
        if (count <= 0 || currentGameData.currentBalance < initData.gameData.Bets[currentGameData.currentBetIndex]) {
            this.isAutoSpinning = false;
            this.setNumberofAutoSpin(0);
            this.autoSpinDelay = 0;
            this.isRespinActive = false; 
            return;
        }
    
        if (this.isRespinActive) {
            this.pendingAutoSpinCount = count; // Store the count for later
            return;
        }
    
        const isFirstSpin = this.autoSpinDelay === 0;
        
        this.singleSpin(() => {
            spinCallBack();
            const newCount = count - 1;
            ResultData.gameData.autoSpinCount = newCount;
            this.setNumberofAutoSpin(newCount);
    
            if (ResultData.gameData.hasReSpin) {
                this.isRespinActive = true;
                this.pendingAutoSpinCount = newCount;
                this.autoSpinDelay = ResultData.gameData.resultSymbols.length * 6000;
            } else if (newCount > 0) {
                this.scene.time.delayedCall(this.delayTime, () => {
                    this.autoSpin(newCount, spinCallBack);
                });
            }
        });
    }
    
    // Add this new method to resume auto-spin
    resumeAutoSpin() {
        if (this.pendingAutoSpinCount > 0 && this.lastSpinCallback && this.isAutoSpinning) {
            this.isRespinActive = false;
            this.scene.time.delayedCall(this.delayTime, () => {
                this.autoSpin(this.pendingAutoSpinCount, this.lastSpinCallback!);
            });
        }
    }

    // Add a method to manually control respin state if needed
    setRespinState(isActive: boolean) {
        console.error(isActive, "isActive");
        this.isRespinActive = isActive;
        
        if (!isActive && this.isAutoSpinning) {
            this.resumeAutoSpin();
        }
    }

    // Update your update method to handle respin state
    update() {
        if (ResultData.gameData.hasReSpin && !this.isRespinActive) {
            this.isRespinActive = true;
        }
    }

    stopAutoSpin() {
        this.isAutoSpinning = false;
        this.isRespinActive = false;
        ResultData.gameData.autoSpinCount = 0;
        this.setNumberofAutoSpin(0);
        this.autoSpinDelay = 0;
        
        this.newSpinButton.setTexture(this.newSpinButton.defaultTexture.key);
        this.newSpinButton.setAlpha(1);
        
        this.newSpinButton.setInteractive({ useHandCursor: true, pixelPerfect: true });
        this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
        this.pBtn.setTexture("pBtn");
    
        this.scene.time.removeAllEvents();
    }

    createButton(key: string, x: number, y: number, callback: () => void): Phaser.GameObjects.Sprite {
        const button = this.scene.add.sprite(x, y, key).setInteractive({ useHandCursor: true, pixelPerfect: true });
        button.on('pointerdown', callback);
        return button;
    }
   
    autoSpinRec(spin: boolean){
        if(spin){
            // this.spinBtn.setTexture("spinBtn");
            this.pBtn.disableInteractive();
            this.pBtn.setTexture("pBtnH")
           
        }else{
            // this.spinBtn.setTexture("spinBtn");
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
            this.newSpinButton.disableInteractive();
            this.pBtn.disableInteractive();
            this.pBtn.setTexture("pBtnH")
            this.newSpinButton.setAlpha(0.5)
            
        }else{
            this.newSpinButton.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setTexture("pBtn")
            this.newSpinButton.setAlpha(1)
        }        
    }

    bnuttonMusic(key: string){
        this.SoundManager.playSound(key)
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
