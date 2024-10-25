import Phaser from "phaser";
import { Globals, initData, ResultData } from "./Globals";
import { gameConfig } from "./appconfig";
import { UiContainer } from "./UiContainer";
import SoundManager from "./SoundManager";

export class UiPopups extends Phaser.GameObjects.Container {
    SoundManager: SoundManager;
    UiContainer: UiContainer
    menuBtn!: InteractiveBtn;
    openPopupBg!: Phaser.GameObjects.Sprite
    settingBtn!: InteractiveBtn;
    rulesBtn!: InteractiveBtn;
    infoBtn!: InteractiveBtn;
    voulmneAdjust!: InteractiveBtn;
    betControl!: InteractiveBtn;
    exitBtn!: InteractiveBtn
    yesBtn!: InteractiveBtn;
    noBtn!: InteractiveBtn
    isOpen: boolean = false;
    autoSpinCount!: Phaser.GameObjects.Text
    betLevel!: Phaser.GameObjects.Text
    settingClose!: InteractiveBtn;
    soundEnabled: boolean = true; // Track sound state
    musicEnabled: boolean = true; // Track sound state

    constructor(scene: Phaser.Scene, uiContainer: UiContainer, soundManager: SoundManager) {
        super(scene);
        this.setPosition(0, 0);
        // this.ruleBtnInit();
        this.purpleBg()
        this.settingBtnInit();
        this.menuBtnInit();
        this.exitButton();
        this.infoBtnInit();
        this.volumenButton();
        this.betSettingBtn();
        this.UiContainer = uiContainer
        this.SoundManager = soundManager
        scene.add.existing(this);
    }
    purpleBg(){
        this.openPopupBg = this.scene.add.sprite(gameConfig.scale.width * 0.075, gameConfig.scale.height * 0.75, "bgPurple").setScale(1.5, 1.7);
        this.openPopupBg.setVisible(false);
        this.add(this.openPopupBg);
    }

    menuBtnInit() {
        const menuBtnTextures = [
            this.scene.textures.get('MenuBtn'),
            this.scene.textures.get('MenuBtnH')
        ];
        this.menuBtn = new InteractiveBtn(this.scene, menuBtnTextures, () => {
            this.buttonMusic("buttonpressed")
            this.openPopUp();
        }, 0, true);
        this.menuBtn.setPosition( gameConfig.scale.width / 13, gameConfig.scale.height / 1.1 );
        this.add(this.menuBtn);
    }

    exitButton(){
        const exitButtonSprites = [
            this.scene.textures.get('exitButton'),
            this.scene.textures.get('exitButton')
        ];
        this.exitBtn = new InteractiveBtn(this.scene, exitButtonSprites, ()=>{
                this.buttonMusic("buttonpressed")
                this.openLogoutPopup();
        }, 0, true, ).setScale(0.2);
        this.exitBtn.setPosition(gameConfig.scale.width / 1.1 , gameConfig.scale.height / 7)
        this.add(this.exitBtn)
    }
    
    settingBtnInit() {
        const settingBtnSprites = [
            this.scene.textures.get('settingBtn'),
            this.scene.textures.get('settingBtnH')
        ];
        this.settingBtn = new InteractiveBtn(this.scene, settingBtnSprites, () => {
            this.buttonMusic("buttonpressed")
            // setting Button
            this.openPopUp();
            this.openSettingPopup();
           
        }, 1, false); // Adjusted the position index
        this.settingBtn.setPosition(gameConfig.scale.width - this.settingBtn.width * 2, gameConfig.scale.height/2).setScale(0.5).setDepth(5);
        this.add(this.settingBtn);
    }

    infoBtnInit() {
        const infoBtnSprites = [
            this.scene.textures.get('infoBtn'),
            this.scene.textures.get('infoBtnH'),
        ];
        this.infoBtn = new InteractiveBtn(this.scene, infoBtnSprites, () => {
            // info button 
            this.buttonMusic("buttonpressed")
            this.openPopUp();
            this.openPage();
            
        }, 2, false); // Adjusted the position index
        this.infoBtn.setPosition(gameConfig.scale.width/ 2 - this.infoBtn.width * 5, this.infoBtn.height * 0.7).setScale(0.5).setDepth(5);
        this.add(this.infoBtn);
    }
    volumenButton() {
        const volumneSprites = [
            this.scene.textures.get('volumneSpeaker'),
            this.scene.textures.get('volumneSpeakerH'),
        ];
        this.voulmneAdjust = new InteractiveBtn(this.scene, volumneSprites, () => {
            // info button 
            this.buttonMusic("buttonpressed")
            // this.openPage();
        }, 2, false); // Adjusted the position index
        this.voulmneAdjust.setPosition(gameConfig.scale.width/ 2 - this.voulmneAdjust.width * 5, this.voulmneAdjust.height * 0.7).setDepth(5).setScale(0.5);
        this.add(this.voulmneAdjust);
    }

    betSettingBtn(){
        const betAdjustBtn = [
            this.scene.textures.get('betCoins'),
            this.scene.textures.get('betCoinsH'),
        ];
        this.betControl = new InteractiveBtn(this.scene, betAdjustBtn, () => {
            // info button 
            this.buttonMusic("buttonpressed")
            this.openPopUp();
            this.UiContainer.openbetSettingpopup();
           
            // this.openPage();
        }, 2, false); // Adjusted the position index
        this.betControl.setPosition(gameConfig.scale.width/ 2 - this.betControl.width * 5, this.betControl.height * 0.7).setScale(0.5);
        this.add(this.betControl);
    }

    openPopUp() {
        // Toggle the isOpen boolean
        this.isOpen = !this.isOpen;
        this.menuBtn.setInteractive(false);
       
        if (this.isOpen) {
             // Depth below buttons
            this.openPopupBg.setVisible(true);
            this.tweenToPosition(this.settingBtn, 4);
            this.tweenToPosition(this.infoBtn, 3);
            this.tweenToPosition(this.betControl, 2);
            this.tweenToPosition(this.voulmneAdjust, 1);
            
        } else {
            this.tweenBack(this.settingBtn);
            this.tweenBack(this.infoBtn);
            this.tweenBack(this.voulmneAdjust);
            this.tweenBack(this.betControl);
        }
    }

    tweenToPosition(button: InteractiveBtn, index: number) {
       const targetY =  this.menuBtn.y - (index * (this.menuBtn.height/1.4))
       // Calculate the x position with spacing
       button.setPosition(this.menuBtn.x, this.menuBtn.y)
        button.setVisible(true);
        this.scene.tweens.add({
            targets: button,
            y: targetY,
            duration: 600,
            ease: 'Elastic',
            easeParams: [1, 0.9],
            onComplete: () => {
                button.setInteractive(true);
                button.setDepth(10);
                this.menuBtn.setInteractive(true);
            }
        });
    }
    tweenBack(button: InteractiveBtn) {
        button.setInteractive(false);
        this.scene.tweens.add({
            targets: button,
            y: button,
            duration: 300,
            ease: 'Elastic',
            easeParams: [1, 0.9],
            onComplete: () => {
                this.openPopupBg.setVisible(false)
                button.setVisible(false);
                this.menuBtn.setInteractive(true);
            }
        });
    }

    openPage() {
        const inputOverlay = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(5)
            .setInteractive();

        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        });
        const popupContainer = this.scene.add.container(0, 0).setDepth(11); 
        const popupBackground = this.scene.add.sprite( gameConfig.scale.width / 2, gameConfig.scale.height / 2, "InfoPopupBg"); 
        popupContainer.add(popupBackground); 
     
        // 4. Add a close button to the popup 
        const closeButton = this.scene.add.sprite( gameConfig.scale.width / 2 + 400, gameConfig.scale.height / 2 - 350, 'exitButton' ).setInteractive(); 
        closeButton.setScale(0.2);
        closeButton.on('pointerdown', () => { popupContainer.destroy(); 
            // Destroy the popup when the close button is clicked 
            inputOverlay.destroy();
            scrollContainer.destroy(); 
            // Destroy the scroll container when the popup is closed
            }); 
            popupContainer.add(closeButton); 
            // 5. Create a mask to define the visible area for scrolling 
            const maskShape = this.scene.make.graphics().fillRect( 
                0, // Adjust X position to center 
                gameConfig.scale.height/2 - 300, // Adjust Y position 
                gameConfig.scale.width - 100, // Full width minus some padding 
                600 // Desired height of the scrollable area 
            ); 
            const mask = maskShape.createGeometryMask(); 
            // 6. Add the scrollable container to the popup container 
            const scrollContainer = this.scene.add.container(
                0, // Adjust X position to align with the mask
                gameConfig.scale.height / 2 - 300 // Adjust Y position
            );
            scrollContainer.setMask(mask); // Apply the mask to the scroll container 
            popupContainer.add(scrollContainer); 
            // console.log("initData", initData.UIData.symbols);
            
            // 7. Add the content that will be scrolled 
            const contentHeight = 3000; // Example content height, adjust as needed 
            // const content = this.scene.add.image( gameConfig.scale.width / 2, 100, 'minorSymbolsHeading' ).setOrigin(0.5).setDepth(2); 
            const content = this.scene.add.image( gameConfig.scale.width / 2, 0, 'payHelp' ).setScale(0.6);
            const line1 = this.scene.add.text(gameConfig.scale.width / 2.9, 100, "All pays shown in credits",  { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: "Arial" } )
            const winWhatUSee = this.scene.add.text(gameConfig.scale.width / 2, 170, "Win What You See",  { fontSize: '30px', color: '#FF0000', align: "Center", fontFamily: "Arial" } ).setOrigin(0.5)
            const paragraphText = this.scene.add.text(gameConfig.scale.width / 2.9, 220, `The total win of each spin is equal to the concatenated numbers that land centered on the single center payline. 1-"Blank"-0-5 pays 5 credits. 1-0-"Blank" pays 10 credits. 1-"Blank"-0 pays 10 credits. The Diamond Symbol has no credit value and represents a "Blank". \r\n Example shown at Max Bet.`,  { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: 'Arial',  wordWrap: { width: 600, useAdvancedWrap: true }})
            const winningSymbol1 = this.scene.add.image(gameConfig.scale.width / 2.03, 450, "winningSample").setScale(1.1)
            const winningSymbol2 = this.scene.add.image(gameConfig.scale.width / 2, 550, "winningSampleTwo").setScale(1.1)
            const gameRules = this.scene.add.image( gameConfig.scale.width / 2, 650, 'gameRules' ).setScale(0.5);
            const gemeRulesLine = this.scene.add.text(gameConfig.scale.width / 2, 750, "Reel Activation",  { fontSize: '30px', color: '#ff0000', align: "center", fontFamily: "Arial" } ).setOrigin(0.5)
            // 
            const secondparagraphText = this.scene.add.text(gameConfig.scale.width / 2.9, 800, `Each bet level corresponds to a number of active reels. Bet 1 credit to play on the 1st reel only with a maximum possible award of 10 credits. Bet 5 credits to play reels 1 and 2 only with a maximum possible award of 105 credits. Max bet to play all 3 reels with a maximum possible award of 10,500 credits. Number symbols available on Reel 1 are 1, 2, 5, and 10. Number symbols available on Reel 2 are 0 and 5. Number symbols available on Reel 3 are 0, 5, and 00. Available credit prizes include 1, 2, 5, 10, 15, 20, 25, 50, 55, 100, 105, 150, 155, 200, 205, 250, 255, 500, 505, 550, 555, 1,000, 1,005, 1,050, 1,055, 1,500, 2,000, 2,500, 5,000, 5,500, 10,000, and 10,500. Only the Highest displayed prize is paid.`, { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: 'Arial',  wordWrap: { width: 600, useAdvancedWrap: true }})
            const redSpinheading = this.scene.add.text(gameConfig.scale.width / 2, 1150, "RED SPIN", { fontSize: '30px', color: '#FF0000', align: "Center", fontFamily: "Arial" } ).setOrigin(0.5)
            const redSpinPara = this.scene.add.text(gameConfig.scale.width / 2.9, 1200, `The Red Respin bonus is triggered randomly after certain spins showing a winning reel stop. Any active reels have a prize >0 and <=5 may respin one time to reveal an award that is greater than the initial spin. Only the respin value is awarded. The Red Respin Bonus cannot occur on a 1 credit bet. The Red Respin bonus cannot occur on the same play as the Zero Respin bonus. Reels are weighted differently during the Red Respin bonus. The odds of winning the Red Respin bonus are different as bet level varies.`,  { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: 'Arial',  wordWrap: { width: 600, useAdvancedWrap: true }})
            const zeroSpinheading = this.scene.add.text(gameConfig.scale.width / 2, 1450, "ZERO SPIN", { fontSize: '30px', color: '#FF0000', align: "Center", fontFamily: "Arial" } ).setOrigin(0.5)
            const zeroParagraph = this.scene.add.text(gameConfig.scale.width/2.9, 1500, `The Zero Respin bonus is triggered after a losing spin with at least one active reel displaying at least one Zero or Double Zero symbol on the payline. Any active reels that do not have a Zero or Double Zero symbol on the payline will respin once. If the respin is a losing spin and any of the reels that participated in the respin display a Zero or Double Zero symbol on the payline, any remaining active reels will respin once more. The Zero Respin bonus ends after any winning spin or a losing spin with no additional Zero or Double Zero symbol landing on the payline. The Zero Respin bonus cannot occur on the same play as the Red Respin bonus. Reel 1 does not contain any Zero or Double Zero symbols. Reel 2 does not contain any Double Zero symbols. The Zero Respin bonus cannot occur on a 1 credit bet. The maximum number of total spins at 5 credits bet is 2. The maximum number of total spins at Max Bet is 3. Reels are weighted differently during the Zero Respin bonus. The odds of winning the Zero Respin bonus are different as bet level varies.`, { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: 'Arial',  wordWrap: { width: 600, useAdvancedWrap: true }})
            const additionalInfoHeading = this.scene.add.sprite(gameConfig.scale.width/2, 2000, "additionalInfoHeading").setScale(0.3)

            const menuIcon = this.scene.add.sprite(gameConfig.scale.width/2.8, 2090, "MenuBtn").setScale(0.7)
            const menuText = this.scene.add.text(gameConfig.scale.width/2.6, 2050, `MENU \r\n Press to open and close game settings and view game information`, { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: 'Arial',  wordWrap: { width: 600, useAdvancedWrap: true }})
            //Special Symbol
            const plusButton = this.scene.add.sprite(gameConfig.scale.width/2.8, 2180, "pBtn").setScale(0.23);
            const plusText = this.scene.add.text(gameConfig.scale.width/2.6, 2160, `BET \r\nPress to access Bet Setting without opening the Menu`, { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: "Arial" });
            const arrowWithBet = this.scene.add.sprite(gameConfig.scale.width/2.8, 2270, "ArrowWithOption").setScale(0.7)
            const arrowWithBetText = this.scene.add.text(gameConfig.scale.width/2.6, 2240, "AUTO SPIN\r\nPress to access auto spin settings witout opening the menu", { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: "Arial", wordWrap: { width: 550, useAdvancedWrap: true } })
            const spinPlay = this.scene.add.sprite(gameConfig.scale.width/2.8, 2360, "spinPlay").setScale(0.65)
            const spinPlayText = this.scene.add.text(gameConfig.scale.width/2.6, 2340, "SPIN\r\nPress to start playing with current bet settings.", { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: "Arial", wordWrap: { width: 550, useAdvancedWrap: true } })
            const sounOnOff = this.scene.add.sprite(gameConfig.scale.width/2.8, 2450, "soundonOff").setScale(0.7)
            const sounOnOffText = this.scene.add.text(gameConfig.scale.width/2.6, 2420, "SOUND\r\nPress to enable or disable sound", { fontSize: '22px', color: '#ffffff', align: "left", fontFamily: "Arial", wordWrap: { width: 550, useAdvancedWrap: true } })
            const settingIcon = this.scene.add.sprite(gameConfig.scale.width/2.8, 2540, "settingBtn").setScale(0.65)
            const settingIconText = this.scene.add.text(gameConfig.scale.width/2.6, 2510, `SETTINGS \r\nPress to access game settings.`, {fontSize: '22px', color: '#ffffff', align: "left", fontFamily: "Arial", wordWrap: { width: 550, useAdvancedWrap: true } })
            const betSetting = this.scene.add.sprite(gameConfig.scale.width/2.8, 2630, "betCoins").setScale(0.65);
            const betSettingText = this.scene.add.text(gameConfig.scale.width/2.6, 2600, `BET SETTINGS \r\nPress to access bet settings.`, {fontSize: '22px', color: '#ffffff', align: "left", fontFamily: "Arial", wordWrap: { width: 550, useAdvancedWrap: true } })
            const infoSetting = this.scene.add.sprite(gameConfig.scale.width/2.8, 2720, "infoBtn").setScale(0.65);
            const infoSettingText = this.scene.add.text(gameConfig.scale.width/2.6, 2690, `PAYS/HELP \r\nPress to view game and help information.`, {fontSize: '22px', color: '#ffffff', align: "left", fontFamily: "Arial", wordWrap: { width: 550, useAdvancedWrap: true } })
            const lastPara = this.scene.add.text(gameConfig.scale.width/2.8, 2810, `Game will automatically complete after 24 - 48 hours if left in a feature. \r\n
Line wins must occur on adjacent reels, beginning with the leftmost reel.\r\n
All wins occur on active lines.\r\n
Wins on multiple active paylines are added together. Only highest winner paid per line.\r\n
Misuse or malfunction voids all pays and plays.`, {fontSize: '22px', color: '#ffffff', align: "left", fontFamily: "Arial", wordWrap: { width: 600, useAdvancedWrap: true } })
            scrollContainer.add([content, line1, winWhatUSee, paragraphText, winningSymbol1, winningSymbol2, gameRules, gemeRulesLine, secondparagraphText, redSpinheading, redSpinPara, zeroSpinheading, zeroParagraph, additionalInfoHeading, 
                menuIcon, menuText, plusButton, plusText, arrowWithBet, arrowWithBetText, spinPlay, spinPlayText, sounOnOff, sounOnOffText, settingIcon, settingIconText, betSetting, betSettingText, infoSetting, infoSettingText, lastPara
            ]); 
            // 8. Scrollbar background 
            const scrollbarBg = this.scene.add.sprite( gameConfig.scale.width/1.5, // Positioned on the right side 
                gameConfig.scale.height / 2, 'scrollerViewBg' ).setOrigin(0.5).setDisplaySize(50, 600); // Adjust height as needed 
            popupContainer.add(scrollbarBg); 
            // 9. Roller image for the scrollbar 
            const roller = this.scene.add.image( gameConfig.scale.width/1.5, gameConfig.scale.height / 2 - 200, 'scrollerView' ).setOrigin(0.5).setInteractive({ draggable: true }); 
            popupContainer.add(roller); 
            // 10. Add drag event listener to the roller 
            this.scene.input.setDraggable(roller); 
            roller.on('drag', (pointer: any, dragX: number, dragY: number) => {
                // Keep the roller within the scrollbar bounds
                const minY = scrollbarBg.getTopCenter().y + roller.height / 2;
                const maxY = scrollbarBg.getBottomCenter().y - roller.height / 2;
        
                // Clamp roller position
                dragY = Phaser.Math.Clamp(dragY, minY, maxY);
                roller.y = dragY;
        
                // Calculate the scroll percentage (0 to 1)
                const scrollPercent = (dragY - minY) / (maxY - minY);
        
                // Map the scroll percentage to the content's Y position range
                const contentMaxY = 300; // The top position of content (relative to mask)
                const contentMinY = -(contentHeight - 600); // The bottom position of content relative to mask
        
                // Update scroll container's Y position based on scroll percentage
                scrollContainer.y = Phaser.Math.Interpolation.Linear([contentMaxY, contentMinY], scrollPercent);
            });

            this.scene.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
                const minY = scrollbarBg.getTopCenter().y + roller.height / 2;
                const maxY = scrollbarBg.getBottomCenter().y - roller.height / 2;
        
                // Adjust roller Y position based on mouse wheel movement
                let newY = roller.y + deltaY * 0.1; // Adjust speed of scroll
                newY = Phaser.Math.Clamp(newY, minY, maxY);
                roller.y = newY;
                // Calculate the scroll percentage (0 to 1)
                const scrollPercent = (newY - minY) / (maxY - minY);
                // Map the scroll percentage to the content's Y position range
                const contentMaxY = 300; // The top position of content (relative to mask)
                const contentMinY = -(contentHeight - 600); // The bottom position of content relative to mask
                // Update scroll container's Y position based on scroll percentage
                scrollContainer.y = Phaser.Math.Interpolation.Linear([contentMaxY, contentMinY], scrollPercent);
            });
    }

    /**
     * 
     */
    openSettingPopup() {
        const inputOverlay = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(16)
            .setInteractive();
    
        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        });
    
        const numSteps = 100; // 10 steps for 0.0 to 1.0
        let soundLevel = Math.round(this.SoundManager.getMasterVolume() * (numSteps - 1));
        let musicLevel = Math.round(this.SoundManager.getSoundVolume("backgroundMusic") * (numSteps - 1));
    
        const infopopupContainer = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        ).setDepth(17); // Set depth higher than inputOverlay

         // Create scrollbar container
        const popupBg = this.scene.add.image(0, 0, 'messagePopup').setDepth(13).setScale(1.8);
        const settingText = this.scene.add.sprite(0, -150, 'SettingHeading').setScale(0.4);
        const autoSpinText = this.scene.add.sprite(0, -40, "autoSpinHeading")
        this.autoSpinCount = this.scene.add.text(0, 70, "0", {color: "#ffffff", fontSize: "40px", fontFamily: 'Arial'}).setOrigin(0.5);
       
        const musicScrollbarContainer = this.scene.add.container(-300, 100);

            const musicScrollBar = this.scene.add.image(0, 0, 'sounProgress').setOrigin(0, 0.5);

            const musicHandle = this.scene.add.image(0, 0, 'indicatorSprite').setOrigin(0.5, 0.5).setScale(0.4);

            musicScrollbarContainer.add([musicScrollBar, musicHandle]);

            const updateScrollbar = (handle: Phaser.GameObjects.Image, scrollBar: Phaser.GameObjects.Image, level: number) => {
                const minX = 0;
                const maxX = scrollBar.width;
                handle.x = minX + (level / (numSteps - 1)) * maxX;
            };
            const updateLevel = (localX: number, handle: Phaser.GameObjects.Image, scrollBar: Phaser.GameObjects.Image, isSound: boolean) => {
                const minX = 0;
                const maxX = scrollBar.width;
                // Clamp the handle's x position to the scrollbar bounds
                let newX = Phaser.Math.Clamp(localX, minX, maxX);
                // Update handle position
                handle.x = newX;
                // Calculate the new level based on the handle's position
                let newLevel = (newX / maxX) * (numSteps - 1);
                newLevel = Phaser.Math.Clamp(newLevel, 0, numSteps - 1);

                const normalizedLevel = newLevel / (numSteps - 1);
                if (isSound) {
                    soundLevel = newLevel;
                    this.adjustSoundVolume(normalizedLevel);
                } else {
                    musicLevel = newLevel;
                    this.adjustMusicVolume(normalizedLevel);
                }
            };

            updateScrollbar(musicHandle, musicScrollBar, musicLevel);
            musicHandle.setInteractive({ draggable: true });
            musicHandle.on('drag', (pointer: Phaser.Input.Pointer, dragX: number) => {
                const localX = dragX;
                updateLevel(localX, musicHandle, musicScrollBar, false);
            });
            musicScrollBar.setInteractive();
            musicScrollBar.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                const localX = pointer.x - musicScrollbarContainer.x;
                updateLevel(localX, musicHandle, musicScrollBar, false);
            });

            musicScrollbarContainer.setPosition(-320, 140);

        const exitButtonSprites = [
            this.scene.textures.get('exitButton'),
            this.scene.textures.get('exitButtonPressed')
        ];
        
        this.settingClose = new InteractiveBtn(this.scene, exitButtonSprites, () => {
            infopopupContainer.destroy();
            inputOverlay.destroy();
            inputOverlay.destroy();
            this.buttonMusic("buttonpressed");
        }, 0, true);
        
        this.settingClose.setPosition(400, -250).setScale(0.2);
    
        popupBg.setOrigin(0.5);
        popupBg.setScale(0.9);
        popupBg.setAlpha(1);
        infopopupContainer.add([popupBg, settingText, autoSpinText, this.settingClose,  this.autoSpinCount, 
            musicScrollbarContainer]);
    }

   // Function to adjust sound volume
    adjustSoundVolume(level: number) {
        this.SoundManager.setMasterVolume(level);
    }

    // Function to adjust music volume
    adjustMusicVolume(level: number) {
        let count = Math.ceil(Number(level * 100));
        ResultData.gameData.autoSpinCount = count;
        this.UiContainer.setNumberofAutoSpin(count);
        this.autoSpinCount.setText(count.toString()); // Update the text of autoSpinCount
    }
    
    buttonMusic(key: string){
        this.SoundManager.playSound(key)
    }

    /**
     * @method openLogoutPopup
     * @description creating an container for exitPopup 
     */
    openLogoutPopup() {
        // Create a semi-transparent background for the popup
        const blurGraphic = this.scene.add.graphics().setDepth(1); // Set depth lower than popup elements
        blurGraphic.fillStyle(0x000000, 0.5); // Black with 50% opacity
        blurGraphic.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height); // Cover entire screen
        
        this.UiContainer.onSpin(true);
        // Create a container for the popup
        const popupContainer = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        ).setDepth(8); // Set depth higher than blurGraphic
    
        // Popup background image
        const popupBg = this.scene.add.image(0, 0, 'messagePopup').setDepth(10);
        popupBg.setOrigin(0.5);
        popupBg.setDisplaySize(900, 671); // Set the size for your popup background
        popupBg.setAlpha(1); // Set background transparency
        this.exitBtn.disableInteractive();
        // Add text to the popup
        const popupText = this.scene.add.text(0, -40, "Do you really want \n to exit?", {color:"#809ed9", fontSize: "50px", fontFamily: 'Arial', align:"center" }).setOrigin(0.5);
        
        // Yes and No buttons
        const logoutButtonSprite = [
            this.scene.textures.get("yesButton"),
            this.scene.textures.get("yesButton")
        ];
        this.yesBtn = new InteractiveBtn(this.scene, logoutButtonSprite, () => {
            
            this.UiContainer.onSpin(false);
            popupContainer.destroy();
            blurGraphic.destroy(); // Destroy blurGraphic when popup is closed
            window.parent.postMessage("onExit", "*");   
            Globals.Socket?.socket.emit("EXIT", {});
        }, 0, true);
        const logoutNoButtonSprite = [
            this.scene.textures.get("noButton"),
            this.scene.textures.get("noButton")
        ];
        this.noBtn = new InteractiveBtn(this.scene, logoutNoButtonSprite, () => {
            this.UiContainer.onSpin(false);
            this.exitBtn.setInteractive()
            popupContainer.destroy();
            blurGraphic.destroy(); // Destroy blurGraphic when popup is closed
        }, 0, true);
        // const yesText = this.scene.add.text(-130, 140, "YES", {color:"#000000", fontFamily:"crashLandingItalic", fontSize:"50px"}).setOrigin(0.5)
        // const noText = this.scene.add.text(130, 140, "NO", {color:"#000000", fontFamily:"crashLandingItalic", fontSize:"50px"}).setOrigin(0.5)
        this.yesBtn.setPosition(-130, 150).setScale(1.3)
        this.noBtn.setPosition(130, 150).setScale(1.3)
       
        // Add all elements to popupContainer
        // popupContainer.add([popupBg, popupText, this.yesBtn,yesText, this.noBtn, noText]);
        popupContainer.add([popupBg, popupText, this.yesBtn, this.noBtn ]);

        // Add popupContainer to the scene
        this.scene.add.existing(popupContainer);       
    }
    
    buttonInteraction(press: boolean){
        if(press){
            this.menuBtn.disableInteractive();
            this.settingBtn.disableInteractive()
            this.rulesBtn.disableInteractive();
            this.menuBtn.disableInteractive();
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
        this.moveToPosition = endPos;
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
        this.on('pointerover', () => {  // <-- Add this line
            this.setTexture(this.hoverTexture.key);
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