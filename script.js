document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------
    // 1. GAME DATA (THE "SCENARIO BANK")
    // ----------------------------------------------------------------
    
    // MODIFIED: All scenarios now have 3 choices with "Good / Trade-off / Bad" logic
    const scenarioBank = [
        {
            text: "A big storm is coming, and our sewage system is at capacity!",
            choices: [
                { text: "Build a state-of-the-art 'green' treatment plant.", effect: { env: +15, hap: +10, eco: -15 } }, // Good
                { text: "Build a standard, new treatment plant.", effect: { env: +5, eco: -10, hap: 0 } }, // Trade-off
                { text: "Do nothing. The current system is 'good enough'.", effect: { env: -20, eco: +5, hap: -10 } }  // Bad
            ]
        },
        {
            text: "A pipe has burst, leaking raw sewage into the river!",
            choices: [
                { text: "Full repair, cleanup, and infrastructure review.", effect: { env: +10, hap: +10, eco: -15 } }, // Good
                { text: "Send emergency crews to repair and clean.", effect: { env: +5, eco: -10, hap: 0 } }, // Trade-off
                { text: "Just patch the pipe. The river will wash it away.", effect: { env: -15, eco: 0, hap: -10 } }  // Bad
            ]
        },
        {
            text: "Farmers are reporting insects damaging their crops!",
            choices: [
                { text: "Subsidize organic farming & natural pest control.", effect: { env: +10, hap: +10, eco: -15 } }, // Good
                { text: "Approve broad use of powerful pesticides.", effect: { env: -15, eco: +20, hap: +5 } }, // Trade-off
                { text: "Do nothing. It's not the government's problem.", effect: { env: -5, eco: -15, hap: -10 } }  // Bad
            ]
        },
        {
            text: "We need a new power source for our growing town!",
            choices: [
                { text: "Fund a Solar Farm AND home efficiency rebates.", effect: { env: +15, hap: +10, eco: -15 } }, // Good
                { text: "Build a Nuclear Power Plant.", effect: { env: +5, eco: +20, hap: -5 } }, // Trade-off (Eco high, but people are nervous)
                { text: "Build a Coal-Fired Power Plant.", effect: { env: -25, eco: +15, hap: -10 } }  // Bad
            ]
        },
        {
            text: "Our landfill is filling up with old computers and phones!",
            choices: [
                { text: "Create a local e-waste recycling & repair program.", effect: { env: +10, hap: +10, eco: -10 } }, // Good
                { text: "Ship the e-waste to another country.", effect: { env: 0, eco: +5, hap: -10 } }, // Trade-off (Bad PR)
                { text: "Just build a bigger landfill.", effect: { env: -15, eco: -5, hap: -5 } }  // Bad
            ]
        },
        {
            text: "A local factory is dumping discolored water into the river.",
            choices: [
                { text: "Force filters + offer green tech subsidies.", effect: { env: +15, hap: +5, eco: -10 } }, // Good
                { text: "Force them to install filters (no help).", effect: { env: +15, eco: -5, hap: -5 } }, // Trade-off (they might cut jobs)
                { text: "Ignore it. They provide a lot of jobs.", effect: { env: -20, eco: +5, hap: -10 } }  // Bad
            ]
        },
        {
            text: "Our town's landfill is almost full!",
            choices: [
                { text: "Town composting + 'pay-as-you-throw' program.", effect: { env: +15, hap: +5, eco: -5 } }, // Good
                { text: "Invest in a modern 'waste-to-energy' incinerator.", effect: { env: -10, eco: +10, hap: -5 } }, // Trade-off (air pollution)
                { text: "Buy nearby farmland to expand the dump.", effect: { env: -15, eco: -5, hap: -10 } }  // Bad
            ]
        },
        {
            text: "Developers want to build a new subdivision on the old-growth forest.",
            choices: [
                { text: "Re-zone as park + invest in 'in-fill' housing.", effect: { env: +20, hap: +10, eco: -10 } }, // Good
                { text: "Approve the new housing development.", effect: { env: -15, eco: +15, hap: +5 } }, // Trade-off
                { text: "Do nothing. Let the developers build freely.", effect: { env: -20, eco: +10, hap: -15 } }  // Bad
            ]
        },
        {
            text: "The main highway is always jammed. People are complaining about traffic.",
            choices: [
                { text: "Build light-rail and protected bike lanes.", effect: { env: +15, hap: +10, eco: -15 } }, // Good
                { text: "Widen the highway by adding two more lanes.", effect: { env: -15, eco: -10, hap: +5 } }, // Trade-off (short-term fix)
                { text: "Do nothing. Traffic builds character.", effect: { env: -5, eco: 0, hap: -15 } }  // Bad
            ]
        },
        {
            text: "This year's new cell phone has been released. The old ones are piling up.",
            choices: [
                { text: "Run a 'Fix-it-Fair' + 'Right to Repair' law.", effect: { env: +10, hap: +10, eco: -5 } }, // Good
                { text: "Set up convenient e-waste drop-off bins.", effect: { env: +5, eco: -5, hap: 0 } }, // Trade-off
                { text: "Do nothing. People love new electronics.", effect: { env: -10, eco: 0, hap: +5 } }  // Bad
            ]
        },
        {
            text: "A neighboring town wants to buy our nuclear waste for reprocessing.",
            choices: [
                { text: "Invest in a new, super-safe, long-term storage facility.", effect: { env: +10, hap: +5, eco: -20 } }, // Good
                { text: "Sell it to them. It's a win-win.", effect: { env: 0, eco: +15, hap: -5 } }, // Trade-off (NIMBYism)
                { text: "Store it in the 'temporary' facility indefinitely.", effect: { env: -15, eco: +5, hap: -10 } }  // Bad
            ]
        },
        {
            text: "Our town's drinking water pipes are old and some are made of lead.",
            choices: [
                { text: "Start a 10-year project to replace them all.", effect: { env: +20, hap: +10, eco: -15 } }, // Good
                { text: "Subsidize water filters for all homes.", effect: { env: -5, eco: -5, hap: +5 } }, // Trade-off (doesn't fix problem)
                { text: "Do nothing. Just tell citizens to boil their water.", effect: { env: -10, eco: 0, hap: -20 } }  // Bad
            ]
        }
    ];

    let gameScenarios = []; 

    // ----------------------------------------------------------------
    // 2. GAME STATE (THE SCORE)
    // ----------------------------------------------------------------
    let gameData = {
        turn: 1,
        maxTurns: 10,
        env: 80,
        eco: 50,
        hap: 50,
        lastEffect: {} 
    };

    // ----------------------------------------------------------------
    // 3. GET HTML ELEMENTS (THE "CONTROLS")
    // ----------------------------------------------------------------
    const scenarioText = document.getElementById('scenario-text');
    const choicesContainer = document.getElementById('choices-container');
    const lastEffectContainer = document.getElementById('last-effect-container'); 
    
    // Meters
    const envMeterBar = document.getElementById('env-meter-bar');
    const ecoMeterBar = document.getElementById('eco-meter-bar');
    const hapMeterBar = document.getElementById('hap-meter-bar');
    const envValue = document.getElementById('env-value');
    const ecoValue = document.getElementById('eco-value');
    const hapValue = document.getElementById('hap-value');


    // ----------------------------------------------------------------
    // 4. GAME FUNCTIONS (THE "ENGINE")
    // ----------------------------------------------------------------

    // (createGameList is unchanged - it shuffles the bank and takes 10 unique)
    function createGameList() {
        let bankCopy = [...scenarioBank]; 
        let m = bankCopy.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = bankCopy[m];
            bankCopy[m] = bankCopy[i];
            bankCopy[i] = t;
        }
        gameScenarios = bankCopy.slice(0, gameData.maxTurns);

        if (gameScenarios.length < gameData.maxTurns) {
            console.error("Warning: Not enough scenarios in the bank for a 10-turn game! Add more.");
            gameData.maxTurns = gameScenarios.length;
        }
    }

    /**
     * This function shows the next turn
     */
    function showTurn() {
        if (gameData.turn > gameData.maxTurns) {
            endGame();
            return;
        }

        const currentScenario = gameScenarios[gameData.turn - 1];
        scenarioText.textContent = `Turn ${gameData.turn}: ${currentScenario.text}`;
        choicesContainer.innerHTML = '';

        // --- NEW LOGIC: SHUFFLE THE CHOICES ---
        // Create a shuffled copy of the choices array
        const shuffledChoices = [...currentScenario.choices].sort(() => Math.random() - 0.5);
        
        // Loop through the NEW shuffled array
        shuffledChoices.forEach((choice) => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.className = 'choice-button'; 
            // MODIFIED: Pass the *entire choice object* instead of an index
            button.onclick = () => handleChoice(choice);
            choicesContainer.appendChild(button);
        });
    }

    /**
     * This function runs when the player clicks a choice
     */
    // MODIFIED: Function now accepts the 'choice' object directly
    function handleChoice(choice) {
        // We no longer need to look up the choice!
        // const choice = gameScenarios[gameData.turn - 1].choices[choiceIndex]; // <-- This line is gone
        
        const effect = choice.effect;

        gameData.lastEffect = effect;

        gameData.env += (effect.env || 0);
        gameData.eco += (effect.eco || 0);
        gameData.hap += (effect.hap || 0);

        gameData.env = Math.max(0, Math.min(100, gameData.env));
        gameData.eco = Math.max(0, Math.min(100, gameData.eco));
        gameData.hap = Math.max(0, Math.min(100, gameData.hap));

        gameData.turn++; 
        
        updateUI(); 
        showTurn();
    }
    
    // (createEffectSpan is unchanged)
    function createEffectSpan(icon, value) {
        const span = document.createElement('span');
        span.className = 'effect-span';
        span.textContent = `${icon} ${value > 0 ? '+' : ''}${value}`; 
        span.style.color = value > 0 ? '#27ae60' : '#c0392b'; 
        return span;
    }

    // (updateUI is unchanged)
    function updateUI() {
        envMeterBar.style.width = gameData.env + '%';
        ecoMeterBar.style.width = gameData.eco + '%';
        hapMeterBar.style.width = gameData.hap + '%';
        envValue.textContent = gameData.env + '%';
        ecoValue.textContent = gameData.eco + '%';
        hapValue.textContent = gameData.hap + '%';

        lastEffectContainer.innerHTML = ''; 
        const effect = gameData.lastEffect;
        if (effect.env) {
            lastEffectContainer.appendChild(createEffectSpan('🌳', effect.env));
        }
        if (effect.eco) {
            lastEffectContainer.appendChild(createEffectSpan('💰', effect.eco));
        }
        if (effect.hap) {
            lastEffectContainer.appendChild(createEffectSpan('😊', effect.hap));
        }
    }

    // (endGame is unchanged)
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

        scenarioText.textContent = finalMessage;
        choicesContainer.innerHTML = '<button class="choice-button" onclick="location.reload()">Play Again?</button>';
        lastEffectContainer.innerHTML = ''; 
    }

    // ----------------------------------------------------------------
    // 5. START THE GAME
    // ----------------------------------------------------------------
    
    createGameList(); 
    updateUI(); 
    gameData.lastEffect = {}; 
    updateUI(); 
    showTurn(); 

});