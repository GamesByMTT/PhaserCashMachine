import Phaser from 'phaser';
import { Globals, ResultData, initData } from "./Globals";
import { gameConfig } from './appconfig';
import { UiContainer } from './UiContainer';
import SoundManager from './SoundManager';
import Disconnection from './Disconecction';
import { currentGameData } from './Globals';
export class Slots extends Phaser.GameObjects.Container {
    slotMask: Phaser.GameObjects.Graphics;
    SoundManager: SoundManager
    slotSymbols: any[][] = [];
    moveSlots: boolean = false;
    uiContainer!: UiContainer;
    // winingMusic!: Phaser.Sound.BaseSound
    resultCallBack: () => void;
    slotFrame!: Phaser.GameObjects.Sprite;
    private maskWidth: number;
    private maskHeight: number;
    private symbolKeys: string[];
    private symbolWidth: number;
    private symbolHeight: number;
    private spacingX: number;
    private spacingY: number;
    private winningContainer!: Phaser.GameObjects.Container;
    private symbolsContainer!: Phaser.GameObjects.Container;
    leftCircleWinning!: Phaser.GameObjects.Sprite;
    rightCircleWinning!: Phaser.GameObjects.Sprite;
    centerWining!: Phaser.GameObjects.Sprite;
    private reelContainers: Phaser.GameObjects.Container[] = [];
    private connectionTimeout!: Phaser.Time.TimerEvent;
    private reelTweens: Phaser.Tweens.Tween[] = []; // Array for reel tweens
    private totalVisibleSymbols: number = 3; // Number of visible symbols on the reel
    private Color: "red" | "green" = "green"
    constructor(scene: Phaser.Scene, uiContainer: UiContainer, callback: () => void, SoundManager : SoundManager) {
        super(scene);
        this.resultCallBack = callback;
        this.uiContainer = uiContainer;
        this.SoundManager = SoundManager;
        this.winningContainer = new Phaser.GameObjects.Container(scene);
        this.winningContainer.setDepth(1);
        this.add(this.winningContainer);
        this.createWinningSprites();
        this.symbolsContainer = new Phaser.GameObjects.Container(scene);
        this.symbolsContainer.setDepth(2);
        this.add(this.symbolsContainer);
        this.slotMask = new Phaser.GameObjects.Graphics(scene);
        this.maskWidth = gameConfig.scale.width;
        this.maskHeight = 420;
        // this.slotMask.fillStyle(0xffffff, 1);
        this.slotMask.fillRoundedRect(0, 0, this.maskWidth, this.maskHeight, 20);
        // mask Position set
        this.slotMask.setPosition(
            gameConfig.scale.width / 6,
            gameConfig.scale.height / 2.8
        );
        // this.add(this.slotMask);
        // Filter and pick symbol keys based on the criteria
        this.symbolKeys = this.getFilteredSymbolKeys();
        
        // Assume all symbols have the same width and height
        const exampleSymbol = new Phaser.GameObjects.Sprite(scene, 0, 0, this.getRandomSymbolKey());
        this.symbolWidth = exampleSymbol.displayWidth/ 3;
        this.symbolHeight = exampleSymbol.displayHeight/3;
        this.spacingX = this.symbolWidth * 3.25; // Add some spacing
        this.spacingY = this.symbolHeight * 2.5; // Add some spacing
        const startPos = {
            x: gameConfig.scale.width /4.1,
            y: gameConfig.scale.height /1.85    
        };
        const totalSymbol = 18;
        const visibleSymbol = 1;
        const startIndex = 1;
        const initialYOffset = (totalSymbol - startIndex - visibleSymbol) * this.spacingY;
        const totalSymbolsPerReel = 36; 
        for (let i = 0; i < 3; i++) { 
            const reelContainer = new Phaser.GameObjects.Container(this.scene);
            this.reelContainers.push(reelContainer); // Store the container for future use
            
            this.slotSymbols[i] = [];
            for (let j = 0; j < totalSymbolsPerReel; j++) { // 3 rows
                let symbolKey = this.getRandomSymbolKey(); // Get a random symbol key
                // console.log(symbolKey);
                let slot = new Symbols(scene, symbolKey, { x: i, y: j }, reelContainer);
                slot.symbol.setMask(new Phaser.Display.Masks.GeometryMask(scene, this.slotMask));
                slot.symbol.setPosition(
                    startPos.x + i * this.spacingX,
                    startPos.y + j * this.spacingY 
                );
                slot.symbol.setScale(0.6, 0.6).setDepth(2)
                slot.startX = slot.symbol.x;
                slot.startY = slot.symbol.y;
                this.slotSymbols[i].push(slot);
                reelContainer.add(slot.symbol)
            }
            reelContainer.height = this.slotSymbols[i].length * this.spacingY;
            reelContainer.setPosition(reelContainer.x, -initialYOffset);
            this.symbolsContainer.add(reelContainer);
            // this.add(reelContainer); 
        }
       
    }

    updateColor(newColor: "red" | "green") {
        this.Color = newColor;
        // Update symbol keys
        this.symbolKeys = this.getFilteredSymbolKeys();

        for (let i = 0; i < this.slotSymbols.length; i++) {
            for (let j = 0; j < this.slotSymbols[i].length; j++) {
                const symbol = this.slotSymbols[i][j];
                // Stop any current animation
                if (symbol.symbol.anims.isPlaying) {
                    symbol.symbol.anims.stop();
                }
                
                // Remove the animation if it exists
                const currentKey = symbol.symbol.texture.key;
                const match = currentKey.match(/^(red|green)slots(\d+)_(\d+)$/);
                if (match) {
                    const [, , symbolNum] = match;
                    const animKey = `symbol_anim_${symbolNum}_${this.Color}`;
                    if (this.scene.anims.exists(animKey)) {
                        this.scene.anims.remove(animKey);
                    }
                }
            }
        }
        // Update all symbols
        this.updateSymbolTextures();
        // Update winning sprites
        this.updateWinningSprites(); 
    }

    private createWinningSprites() {
        const { width, height } = this.scene.cameras.main;
        
        this.leftCircleWinning = this.scene.add.sprite(width * 0.25, height/1.8, `${this.Color}CircleWinning`)
            .setVisible(false);
        
        this.centerWining = this.scene.add.sprite(width / 2, height / 1.8, `${this.Color}CenterWinning`)
            .setVisible(false);
        
        this.rightCircleWinning = this.scene.add.sprite(width * 0.75, height / 1.8, `${this.Color}CircleWinning`)
            .setVisible(false);
        
        // Add to winning container instead of this
        this.winningContainer.add([
            this.leftCircleWinning,
            this.centerWining,
            this.rightCircleWinning
        ]);
    }
    getFilteredSymbolKeys(): string[] {
        // // Filter symbols based on the pattern
        // const allSprites = Globals.resources;
        const allSpriteKeys = Object.keys(Globals.resources); // Get all keys from Globals.resources
        const filteredSprites = allSpriteKeys.filter(spriteName => {
            const regex = new RegExp(`^${this.Color}slots\\d+_\\d+$`);
            return regex.test(spriteName);
        });
        
        return filteredSprites;
    }

    getRandomSymbolKey(): string {
        const randomIndex = Phaser.Math.Between(0, this.symbolKeys.length - 1);        
        return this.symbolKeys[randomIndex];
    }

    moveReel() {   
        this.leftCircleWinning.setVisible(false); 
        this.centerWining.setVisible(false);
        this.rightCircleWinning.setVisible(false);
        if(!ResultData.gameData.isReSpinRunning){
            const initialYOffset = (this.slotSymbols[0][0].totalSymbol - this.slotSymbols[0][0].visibleSymbol - this.slotSymbols[0][0].startIndex) * this.slotSymbols[0][0].spacingY;
            setTimeout(() => {
                    for (let i = 0; i < this.reelContainers.length; i++) {
                        this.reelContainers[i].setPosition(
                            this.reelContainers[i].x,
                            -initialYOffset // Set the reel's position back to the calculated start position
                        );
                    }    
            }, 100);
        }
        for (let i = 0; i < this.reelContainers.length; i++) {
            for (let j = 0; j < this.reelContainers[i].list.length; j++) {
                setTimeout(() => {
                    this.slotSymbols[i][j].startMoving = true;
                    if (j < 20) this.slotSymbols[i][j].stopAnimation();
                }, 100 * i);
            }
        }
        this.moveSlots = true;
        if(!ResultData.gameData.hasReSpin){
            setTimeout(() => {
                for (let i = 0; i < this.reelContainers.length; i++) {
                    this.startReelSpin(i);
                }
            }, 100);
        }else{
            for (let y = 1; y < ResultData.gameData.resultSymbols.length; y++) {
                const row = ResultData.gameData.resultSymbols[y];
                for (let x = 0; x < row.length; x++) {
                    const elementId = row[x];
                    if (elementId == '0') { 
                        this.startReelSpin(x);
                    }
                }
            }
        }

        // //Setting the Timer for response wait
        // this.connectionTimeout = this.scene.time.addEvent({
        //     delay: 20000, // 20 seconds (adjust as needed)
        //     callback: this.showDisconnectionScene,
        //     callbackScope: this // Important for the 'this' context
        // });
        // this.uiContainer.maxbetBtn.disableInteractive();
    }

    startReelSpin(reelIndex: number) {
        if (this.reelTweens[reelIndex]) {
            this.reelTweens[reelIndex].stop(); 
        }
        const reel = this.reelContainers[reelIndex];
        
        const spinDistance = this.spacingY * 4; // Adjust this value for desired spin amount 

        let spinDirection = ResultData.gameData.hasReSpin ? '-=' : '+=';
        // reel.y -= 1;
        this.reelTweens[reelIndex] = this.scene.tweens.add({
            targets: reel,
            y: `${spinDirection}${spinDistance}`, // Spin relative to current position
            duration: 300, 
            repeat: -1, 
            onComplete: () => {},
        });
    }

    showDisconnectionScene(){
        Globals.SceneHandler?.addScene("Disconnection", Disconnection, true)
    }

    update(time: number, delta: number) {
        if (this.slotSymbols && this.moveSlots) {
            for (let i = 0; i < this.reelContainers.length; i++) {
            }
        }
    }
    
    stopTween() {
        for (let i = 0; i < this.reelContainers.length; i++) { 
            this.stopReel(i);   
        }
    }

    stopReel(reelIndex: number) {
        const reel = this.reelContainers[reelIndex];
        const reelDelay = 300 * (reelIndex + 1);
        const targetSymbolIndex = 0; // Example: Align the first symbol
        const targetY = -targetSymbolIndex * this.symbolHeight; 
        this.scene.tweens.add({
            targets: reel,
            y: targetY, // Animate relative to the current position
            duration: 300,
            ease: 'Bounce.easeOut',
            // ease: 'Cubic.easeOut',
            onComplete: () => {
                if (this.reelTweens[reelIndex]) {
                    this.reelTweens[reelIndex].stop(); 
                }
                if (reelIndex === this.reelContainers.length - 1) {
                    this.playWinAnimations();
                    this.moveSlots = false;
                }
            },
            delay: reelDelay
        });

        if (this.connectionTimeout) { 
            this.connectionTimeout.remove(false);
        }
        for (let j = 0; j < this.slotSymbols[reelIndex].length; j++) {
            this.slotSymbols[reelIndex][j].endTween();
         }
    } 

    // Function to play win animations
    playWinAnimations() {
        const { width, height } = this.scene.cameras.main;
        this.resultCallBack(); // Call the result callback
        if(ResultData.gameData.isReSpinRunning){
            const row = ResultData.gameData.resultSymbols[ResultData.gameData.countReSpin - 1];
            for (let x = 0; x < row.length; x++) {
                const elementId = row[x];
                if (elementId !== '0') {
                    if (this.slotSymbols[0] && this.slotSymbols[0][x]) {
                        this.playSymbolAnimation(x, 0, elementId);
                        if(x == 0){
                            this.leftCircleWinning.setVisible(true);
                        } else if(x == 1){
                            this.centerWining.setVisible(true);
                        } else if(x == 2){
                            this.rightCircleWinning.setVisible(true);
                        }
                    }
                    // Play win sound for each non-zero symbol
                    this.winMusic("winMusic");
                } else {
                    // console.log(`Skipping animation for symbol at (${y}, ${x})`);
                }
            }
            if(ResultData.gameData.countReSpin == 0){
                this.uiContainer.setRespinState(true)
            }
        }else{
                let y = 0;
                const row = ResultData.gameData.resultSymbols[y];
                for (let x = 0; x < row.length; x++) {
                    const elementId = row[x];
                    if (elementId !== '0') {
                        if (this.slotSymbols[y] && this.slotSymbols[y][x]) {
                            this.playSymbolAnimation(x, y, elementId);
                            // console.log(x, "column");
                            if(x == 0){
                                this.leftCircleWinning.setVisible(true);
                            } else if(x == 1){
                                this.centerWining.setVisible(true);
                            } else if(x == 2){
                                this.rightCircleWinning.setVisible(true);
                            }
                        }
                        // Play win sound for each non-zero symbol
                        this.winMusic("winMusic");
                    } else {
                        // console.log(`Skipping animation for symbol at (${y}, ${x})`);
                    }
                }
        }
        
    }

    playSymbolAnimation(y: number, x: number, elementId: string) {
        const symbol = this.slotSymbols[y][x];
        const animationColor = ResultData.gameData.hasRedSpin ? "red" : this.Color;
        // const animationId = `symbol_anim_${elementId}`;
        const animationId = `symbol_anim_${elementId}_${animationColor}`;
         // Remove existing animation if it exists
        if (this.scene.anims.exists(animationId)) {
            this.scene.anims.remove(animationId);
        }
        if (!this.scene.anims.exists(animationId)) {
            let textureKeys: string[] = [];
            for (let i = 0; i < 36; i++) {
                const textureKey = `${animationColor}slots${elementId}_${i}`; // Use animationColor here
                if (this.scene.textures.exists(textureKey)) {
                    textureKeys.push(textureKey);
                }
            }
            if (textureKeys.length > 0) {
                this.scene.anims.create({
                    key: animationId,
                    frames: textureKeys.map(key => ({ key })),
                    frameRate: 20,
                    repeat: -1
                });
            }
        }

        if (this.scene.anims.exists(animationId)) {
            symbol.Color = animationColor;
            symbol.playAnimation(animationId);
        } else {
        }
    }
    winMusic(key: string){
        this.SoundManager.playSound(key)
    }

    isAnySymbolMoving(): boolean {
        for (let i = 0; i < this.slotSymbols.length; i++) {
            for (let j = 0; j < this.slotSymbols[i].length; j++) {
                if (this.slotSymbols[i][j].startMoving) {
                    return true;
                }
            }
        }
        return false;
    }
    private updateSymbolTextures() {
        for (let i = 0; i < this.slotSymbols.length; i++) {
            for (let j = 0; j < this.slotSymbols[i].length; j++) {
                const symbol = this.slotSymbols[i][j];
                
                // Get current symbol number
                const currentKey = symbol.symbol.texture.key;
                const match = currentKey.match(/^(red|green)slots(\d+)_(\d+)$/);
                
                if (match) {
                    const [, , symbolNum, frameNum] = match;
                    // Update to new color
                    const newKey = `${this.Color}slots${symbolNum}_${frameNum}`;
                    if (this.scene.textures.exists(newKey)) {
                        symbol.symbol.setTexture(newKey);
                    }
                }
                
                // Update symbol's color property
                symbol.Color = this.Color;
            }
        }
    }
    private updateWinningSprites() {
        const { width, height } = this.scene.cameras.main;
        
        // Remove from container before destroying
        this.winningContainer.remove(this.leftCircleWinning);
        this.winningContainer.remove(this.centerWining);
        this.winningContainer.remove(this.rightCircleWinning);
        
        // Destroy old sprites
        this.leftCircleWinning.destroy();
        this.centerWining.destroy();
        this.rightCircleWinning.destroy();
        
        // Create new sprites
        this.leftCircleWinning = this.scene.add.sprite(width * 0.25, height/1.8, `${this.Color}CircleWinning`)
            .setVisible(false);
        
        this.centerWining = this.scene.add.sprite(width / 2, height / 1.8, `${this.Color}CenterWinning`)
            .setVisible(false);
        
        this.rightCircleWinning = this.scene.add.sprite(width * 0.75, height / 1.8, `${this.Color}CircleWinning`)
            .setVisible(false);
        
        // Add to winning container
        this.winningContainer.add([
            this.leftCircleWinning,
            this.centerWining,
            this.rightCircleWinning
        ]);
    }
    
    
}

// @Sybols CLass
class Symbols {
    symbol: Phaser.GameObjects.Sprite;
    startY: number = 0;
    startX: number = 0;
    startMoving: boolean = false;
    index: { x: number; y: number };
    totalSymbol : number = 7;
    visibleSymbol: number = 3;
    startIndex: number = 1;
    spacingY : number = 204;
    scene: Phaser.Scene;
    private isMobile: boolean;
    reelContainer: Phaser.GameObjects.Container
    winningSprite: Phaser.GameObjects.Sprite | null = null; 
    Color: "red" | "green" = "green"
    constructor(scene: Phaser.Scene, symbolKey: string, index: { x: number; y: number }, reelContainer: Phaser.GameObjects.Container) {
        this.scene = scene;
        this.index = index;
        this.reelContainer = reelContainer
        const updatedSymbolKey = this.updateKeyToZero(symbolKey)
        this.symbol = new Phaser.GameObjects.Sprite(scene, 0, 0, updatedSymbolKey);
        this.symbol.setOrigin(0.5, 0.5);
        this.isMobile = scene.sys.game.device.os.android || scene.sys.game.device.os.iOS;
        this.Color = symbolKey.includes("red") ? "red" : "green";
        // Load textures and create animation
        const textures: string[] = [];
        for (let i = 0; i < 20; i++) {
            textures.push(`${symbolKey}`);
        }  
        this.scene.anims.create({
            key: `${symbolKey}`,
            frames: textures.map((texture) => ({ key: texture })),
            frameRate: 10,
            repeat: -1,
        });        
    }

    // to update the slotx_0 to show the 0 index image at the end
    updateKeyToZero(symbolKey: string): string {
        
        const match = symbolKey.match(/^slots(\d+)_\d+$/);
        if (match) {
            const xValue = match[1];
            return `${this.Color}slots${xValue}_0`;
        } else {            
            return symbolKey; // Return the original key if format is incorrect
        }
    }
    // to update the slotx_0 to show the 0 index image at the en

    playAnimation(animationId: any) {
        if (this.symbol.anims.isPlaying) {
            this.symbol.anims.stop();
        }
        // Update the symbol's texture color if needed
        if (ResultData.gameData.hasRedSpin && !this.symbol.texture.key.includes('red')) {
            const currentKey = this.symbol.texture.key;
            const match = currentKey.match(/^(red|green)slots(\d+)_(\d+)$/);
            if (match) {
                const [, , symbolNum, frameNum] = match;
                const newKey = `redslots${symbolNum}_${frameNum}`;
                if (this.scene.textures.exists(newKey)) {
                    this.symbol.setTexture(newKey);
                }
            }
        }

        this.symbol.play(animationId);
    }
    stopAnimation() {
        if (this.symbol.anims.isPlaying) {
            this.symbol.anims.stop();
        } 
    }
    endTween() {
        let mynumber = currentGameData.currentBetIndex + 1
        if (this.index.y < 1) {
            let textureKeys: string[] = [];
            // Retrieve the elementId based on index
            let elementId
            if(ResultData.gameData.isReSpinRunning && ResultData.gameData.countReSpin > 0){
                elementId = ResultData.gameData.resultSymbols[ResultData.gameData.countReSpin][this.index.x];
            }else{
                elementId = ResultData.gameData.resultSymbols[this.index.y][this.index.x];
            }
                for (let i = 0; i < 36; i++) {
                    const textureKey = `${this.Color}slots${elementId}_${i}`;
                    // Check if the texture exists in cache
                    if (this.scene.textures.exists(textureKey)) {
                        textureKeys.push(textureKey);                        
                    } 
                }
                // Check if we have texture keys to set
                    if (textureKeys.length > 0) {
                    // Create animation with the collected texture keys
                        this.scene.anims.create({
                            key: `symbol_anim_${elementId}`,
                            frames: textureKeys.map(key => ({ key })),
                            frameRate: 20,
                            repeat: -1
                        });
                    // Set the texture to the first key and start the animation
                        this.symbol.setTexture(textureKeys[0]);           
                    }
                    this.startMoving = true; 
        }
        // Stop moving and start tweening the sprite's position
        this.scene.time.delayedCall(10, () => { // Example: 50ms delay
            this.startMoving = false; 
        });
    }
}