document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------
    // 1. GLOBAL STATE & SETTINGS
    // ----------------------------------------------------------------
    
    const gameState = {
        musicOn: true,
        soundOn: true
    };
    let audioContext;
    let gameData; 
    let gameScenarios = [];
    
    // (Scenario bank is unchanged)
    const SCENARIO_BANK = [
        {
            text: "A big storm is coming, and our sewage system is at capacity!",
            choices: [
                { text: "Build a state-of-the-art 'green' treatment plant.", effect: { env: +15, hap: +10, eco: -15 } },
                { text: "Build a standard, new treatment plant.", effect: { env: +5, eco: -10, hap: 0 } },
                { text: "Do nothing. The current system is 'good enough'.", effect: { env: -20, eco: +5, hap: -10 } }
            ]
        },
        {
            text: "A pipe has burst, leaking raw sewage into the river!",
            choices: [
                { text: "Full repair, cleanup, and infrastructure review.", effect: { env: +10, hap: +10, eco: -15 } },
                { text: "Send emergency crews to repair and clean.", effect: { env: +5, eco: -10, hap: 0 } },
                { text: "Just patch the pipe. The river will wash it away.", effect: { env: -15, eco: 0, hap: -10 } }
            ]
        },
        {
            text: "Farmers are reporting insects damaging their crops!",
            choices: [
                { text: "Subsidize organic farming & natural pest control.", effect: { env: +10, hap: +10, eco: -15 } },
                { text: "Approve broad use of powerful pesticides.", effect: { env: -15, eco: +20, hap: +5 } },
                { text: "Do nothing. It's not the government's problem.", effect: { env: -5, eco: -15, hap: -10 } }
            ]
        },
        {
            text: "We need a new power source for our growing town!",
            choices: [
                { text: "Fund a Solar Farm AND home efficiency rebates.", effect: { env: +15, hap: +10, eco: -15 } },
                { text: "Build a Nuclear Power Plant.", effect: { env: +5, eco: +20, hap: -5 } },
                { text: "Build a Coal-Fired Power Plant.", effect: { env: -25, eco: +15, hap: -10 } }
            ]
        },
        {
            text: "Our landfill is filling up with old computers and phones!",
            choices: [
                { text: "Create a local e-waste recycling & repair program.", effect: { env: +10, hap: +10, eco: -10 } },
                { text: "Ship the e-waste to another country.", effect: { env: 0, eco: +5, hap: -10 } },
                { text: "Just build a bigger landfill.", effect: { env: -15, eco: -5, hap: -5 } }
            ]
        },
        {
            text: "A local factory is dumping discolored water into the river.",
            choices: [
                { text: "Force filters + offer green tech subsidies.", effect: { env: +15, hap: +5, eco: -10 } },
                { text: "Force them to install filters (no help).", effect: { env: +15, eco: -5, hap: -5 } },
                { text: "Ignore it. They provide a lot of jobs.", effect: { env: -20, eco: +5, hap: -10 } }
            ]
        },
        {
            text: "Our town's landfill is almost full!",
            choices: [
                { text: "Town composting + 'pay-as-you-throw' program.", effect: { env: +15, hap: +5, eco: -5 } },
                { text: "Invest in a modern 'waste-to-energy' incinerator.", effect: { env: -10, eco: +10, hap: -5 } },
                { text: "Buy nearby farmland to expand the dump.", effect: { env: -15, eco: -5, hap: -10 } }
            ]
        },
        {
            text: "Developers want to build a new subdivision on the old-growth forest.",
            choices: [
                { text: "Re-zone as park + invest in 'in-fill' housing.", effect: { env: +20, hap: +10, eco: -10 } },
                { text: "Approve the new housing development.", effect: { env: -15, eco: +15, hap: +5 } },
                { text: "Do nothing. Let the developers build freely.", effect: { env: -20, eco: +10, hap: -15 } }
            ]
        },
        {
            text: "The main highway is always jammed. People are complaining about traffic.",
            choices: [
                { text: "Build light-rail and protected bike lanes.", effect: { env: +15, hap: +10, eco: -15 } },
                { text: "Widen the highway by adding two more lanes.", effect: { env: -15, eco: -10, hap: +5 } },
                { text: "Do nothing. Traffic builds character.", effect: { env: -5, eco: 0, hap: -15 } }
            ]
        },
        {
            text: "This year's new cell phone has been released. The old ones are piling up.",
            choices: [
                { text: "Run a 'Fix-it-Fair' + 'Right to Repair' law.", effect: { env: +10, hap: +10, eco: -5 } },
                { text: "Set up convenient e-waste drop-off bins.", effect: { env: +5, eco: -5, hap: 0 } },
                { text: "Do nothing. People love new electronics.", effect: { env: -10, eco: 0, hap: +5 } }
            ]
        },
        {
            text: "A neighboring town wants to buy our nuclear waste for reprocessing.",
            choices: [
                { text: "Invest in a new, super-safe, long-term storage facility.", effect: { env: +10, hap: +5, eco: -20 } },
                { text: "Sell it to them. It's a win-win.", effect: { env: 0, eco: +15, hap: -5 } },
                { text: "Store it in the 'temporary' facility indefinitely.", effect: { env: -15, eco: +5, hap: -10 } }
            ]
        },
        {
            text: "Our town's drinking water pipes are old and some are made of lead.",
            choices: [
                { text: "Start a 10-year project to replace them all.", effect: { env: +20, hap: +10, eco: -15 } },
                { text: "Subsidize water filters for all homes.", effect: { env: -5, eco: -5, hap: +5 } },
                { text: "Do nothing. Just tell citizens to boil their water.", effect: { env: -10, eco: 0, hap: -20 } }
            ]
        }
    ];

    // ----------------------------------------------------------------
    // 2. HTML ELEMENT REFERENCES
    // ----------------------------------------------------------------
    
    // Screens
    const screens = {
        preSplash: document.getElementById('pre-splash-screen'), // NEW
        splash: document.getElementById('splash-screen'),
        title: document.getElementById('title-screen'),
        menu: document.getElementById('menu-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen')
    };

    // Audio
    const audioElements = {
        menu: document.getElementById('menu-music'),
        game: document.getElementById('game-music')
    };

    // Buttons
    const beginBtn = document.getElementById('begin-btn'); // NEW
    const startGameBtn = document.getElementById('start-game-btn');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const returnMenuBtn = document.getElementById('return-menu-btn');

    // Game Elements
    const scenarioText = document.getElementById('scenario-text');
    const choicesContainer = document.getElementById('choices-container');
    const lastEffectContainer = document.getElementById('last-effect-container');
    const envMeterBar = document.getElementById('env-meter-bar');
    const ecoMeterBar = document.getElementById('eco-meter-bar');
    const hapMeterBar = document.getElementById('hap-meter-bar');
    const envValue = document.getElementById('env-value');
    const ecoValue = document.getElementById('eco-value');
    const hapValue = document.getElementById('hap-value');

    // End Screen Elements
    const endSummaryText = document.getElementById('end-summary-text');
    
    // ----------------------------------------------------------------
    // 3. AUDIO & SOUND FUNCTIONS
    // ----------------------------------------------------------------

    // (All audio functions are unchanged)
    
    function initAudio() {
        if (audioContext) return; 
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
        }
    }

    function playSfx(type) {
        if (!gameState.soundOn || !audioContext) return;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); 

        switch (type) {
            case 'click':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime); 
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'positive':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); 
                oscillator.frequency.linearRampToValueAtTime(783.99, audioContext.currentTime + 0.2); 
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'negative':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime); 
                oscillator.frequency.linearRampToValueAtTime(110, audioContext.currentTime + 0.3); 
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
        }
    }

    function playMusic(track) {
        if (!audioContext) {
            console.log("Audio not yet initialized by user. Deferring play.");
            return; 
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audioElements.menu.muted = !gameState.musicOn;
        audioElements.game.muted = !gameState.musicOn;
        
        if (!gameState.musicOn) {
            audioElements.menu.pause();
            audioElements.game.pause();
            return;
        }

        if (track === 'menu') {
            audioElements.game.pause();
            audioElements.menu.currentTime = 0; 
            audioElements.menu.play().catch(e => console.error("Menu music play failed:", e));
        } else if (track === 'game') {
            audioElements.menu.pause();
            audioElements.game.currentTime = 0; 
            audioElements.game.play().catch(e => console.error("Game music play failed:", e));
        } else if (track === 'stop') {
            audioElements.menu.pause();
            audioElements.game.pause();
        }
    }

    // --- Audio Toggle Listeners ---
    musicToggleBtn.addEventListener('click', () => {
        initAudio(); 
        gameState.musicOn = !gameState.musicOn;
        musicToggleBtn.textContent = `Music: ${gameState.musicOn ? 'ON' : 'OFF'}`;
        musicToggleBtn.classList.toggle('off', !gameState.musicOn);
        playSfx('click');
        
        if (screens.menu.classList.contains('active') || screens.end.classList.contains('active')) {
            playMusic('menu');
        } else if (screens.game.classList.contains('active')) {
            playMusic('game');
        }
    });

    soundToggleBtn.addEventListener('click', () => {
        initAudio(); 
        gameState.soundOn = !gameState.soundOn;
        soundToggleBtn.textContent = `Sound: ${gameState.soundOn ? 'ON' : 'OFF'}`;
        soundToggleBtn.classList.toggle('off', !gameState.soundOn);
        playSfx('click');
    });

    // ----------------------------------------------------------------
    // 4. SCREEN & GAME FLOW MANAGEMENT
    // ----------------------------------------------------------------

    function showScreen(screenName) {
        for (const key in screens) {
            screens[key].classList.remove('active');
        }
        screens[screenName].classList.add('active');

        // Manage music (but only if audio is initialized)
        if (audioContext) { 
            if (screenName === 'game') {
                playMusic('game');
            } else if (screenName === 'menu' || screenName === 'end') {
                playMusic('menu');
            }
        }
    }

    function startGame() {
        playSfx('click');
        // Audio is already initialized by the 'begin' button, so we just play

        gameData = {
            turn: 1,
            maxTurns: 10,
            env: 80,
            eco: 50,
            hap: 50,
            lastEffect: {}
        };

        createGameList(); 
        updateUI(); 
        
        lastEffectContainer.innerHTML = '';
        gameData.lastEffect = {}; 
        
        showScreen('game');
        showTurn(); 
    }
    
    // --- Game Flow Button Listeners ---
    startGameBtn.addEventListener('click', startGame);
    playAgainBtn.addEventListener('click', startGame);
    returnMenuBtn.addEventListener('click', () => {
        playSfx('click');
        showScreen('menu');
    });

    // ----------------------------------------------------------------
    // 5. CORE GAME LOGIC (Unchanged)
    // ----------------------------------------------------------------

    // (All game logic functions: createGameList, showTurn, handleChoice,
    // createEffectSpan, updateUI, endGame are IDENTICAL to the
    // previous version and do not need to be changed.)

    function createGameList() {
        let bankCopy = [...SCENARIO_BANK];
        let m = bankCopy.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = bankCopy[m];
            bankCopy[m] = bankCopy[i];
            bankCopy[i] = t;
        }
        gameScenarios = bankCopy.slice(0, gameData.maxTurns);

        if (gameScenarios.length < gameData.maxTurns) {
            console.warn(`Only ${gameScenarios.length} scenarios in bank. Game will be shorter.`);
            gameData.maxTurns = gameScenarios.length;
        }
    }

    function showTurn() {
        if (gameData.turn > gameData.maxTurns) {
            endGame();
            return;
        }
        const currentScenario = gameScenarios[gameData.turn - 1];
        scenarioText.textContent = `Turn ${gameData.turn}: ${currentScenario.text}`;
        choicesContainer.innerHTML = '';

        const shuffledChoices = [...currentScenario.choices].sort(() => Math.random() - 0.5);
        
        shuffledChoices.forEach((choice) => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.className = 'choice-button'; 
            button.onclick = () => handleChoice(choice);
            choicesContainer.appendChild(button);
        });
    }

    function handleChoice(choice) {
        const effect = choice.effect;
        gameData.lastEffect = effect;
        gameData.env += (effect.env || 0);
        gameData.eco += (effect.eco || 0);
        gameData.hap += (effect.hap || 0);
        gameData.env = Math.max(0, Math.min(100, gameData.env));
        gameData.eco = Math.max(0, Math.min(100, gameData.eco));
        gameData.hap = Math.max(0, Math.min(100, gameData.hap));
        const totalEffect = (effect.env || 0) + (effect.eco || 0) + (effect.hap || 0);
        playSfx(totalEffect >= 0 ? 'positive' : 'negative');
        gameData.turn++; 
        updateUI(); 
        showTurn();
    }
    
    function createEffectSpan(icon, value) {
        const span = document.createElement('span');
        span.className = 'effect-span';
        span.textContent = `${icon} ${value > 0 ? '+' : ''}${value}`; 
        span.style.color = value > 0 ? '#27ae60' : '#c0392b'; 
        return span;
    }

    function updateUI() {
        envMeterBar.style.width = gameData.env + '%';
        ecoMeterBar.style.width = gameData.eco + '%';
        hapMeterBar.style.width = gameData.hap + '%';
        envValue.textContent = gameData.env + '%';
        ecoValue.textContent = gameData.eco + '%';
        hapValue.textContent = gameData.hap + '%';
        lastEffectContainer.innerHTML = ''; 
        const effect = gameData.lastEffect;
        if (effect.env) lastEffectContainer.appendChild(createEffectSpan('🌳', effect.env));
        if (effect.eco) lastEffectContainer.appendChild(createEffectSpan('💰', effect.eco));
        if (effect.hap) lastEffectContainer.appendChild(createEffectSpan('😊', effect.hap));
    }

    function endGame() {
        let finalMessage = "The 10-year challenge is over!\n\n";
        const { env, eco, hap } = gameData;
        if (env > 80 && eco > 80 && hap > 80) {
            finalMessage += "A Golden Era! You've built a thriving, happy, and sustainable utopia. You'll be remembered as the greatest manager in history!";
        } else if (env < 20 && eco < 20 && hap < 20) {
            finalMessage += "A Total Collapse. The economy is in ruins, the environment is a wasteland, and the people have fled. The town is a ghost story.";
        } else if (env > 80 && eco < 30) {
            finalMessage += "A Pristine Wilderness... with no jobs. You protected the environment, but the economy collapsed. The town is beautiful, but empty.";
        } else if (env < 20 && eco > 80) {
            finalMessage += "An Industrial Wasteland. The factories are booming, but the air is toxic and the river is sludge. People are rich, but sick.";
        } else if (hap < 20) {
            finalMessage += "A Miserable Population. Despite a stable economy and environment, your policies made everyone unhappy. There are riots in the streets!";
        } else if (hap > 80 && env < 30 && eco < 30) {
            finalMessage += "Strangely Happy. The town is broke and polluted, but somehow, the people love you. Maybe you built a lot of parks?";
        }
        else if (env > 60 && eco > 60 && hap > 60) {
            finalMessage += "A Resounding Success! You've balanced the needs of the people, the economy, and the planet. The town is a shining example for all others.";
        } else if (env < 40 && eco < 40) {
            finalMessage += "A Tough Decade. You struggled to balance the budget and protect the environment, and both suffered. It's time to rebuild.";
        } else if (env > 60 && eco > 60 && hap < 50) {
            finalMessage += "A Productive but Grumpy Town. The economy and environment are fine, but you've ignored the people, and they're not happy about it.";
        } else {
            finalMessage += "A Manager's Life. You've survived 10 years of tough choices. The town is still standing, which is a victory in itself. You kept it all from falling apart... mostly.";
        }
        endSummaryText.textContent = finalMessage;
        showScreen('end');
    }

    // ----------------------------------------------------------------
    // 6. INITIALIZE THE APP
    // ----------------------------------------------------------------
    
    function init() {
        // Start by showing the new "pre-splash" screen
        showScreen('preSplash');
        
        // This is the new main click handler that starts everything
        beginBtn.addEventListener('click', () => {
            // THIS is the user action we need!
            initAudio();
            playMusic('menu'); // Start menu music
            playSfx('click');
            
            // Now, start the splash sequence
            showScreen('splash');
            
            setTimeout(() => {
                if (screens.splash.classList.contains('active')) {
                    showScreen('title');
                }
            }, 3500); 

            setTimeout(() => {
                if (screens.title.classList.contains('active')) {
                    showScreen('menu');
                }
            }, 7000); 
        });

        // Add skip functionality to the original splash screens
        screens.splash.addEventListener('click', () => {
            playSfx('click');
            showScreen('menu');
        });
        screens.title.addEventListener('click', () => {
            playSfx('click');
            showScreen('menu');
        });
    }

    init(); // Run the app
});

