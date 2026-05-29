import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RefreshCw,
  Home,
  CheckCircle2,
  Trophy,
  Dices,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Play,
  Music,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  PlayerColor,
  Player,
  Token,
  LogEntry,
  GameState,
  COLOR_THEMES,
  START_INDEX,
  SAFE_ZONES,
  GridCoord
} from './types';
import {
  getDiceRoll,
  getMovableTokens,
  getTokenCoordinates,
  canMoveToken,
  isSafeCoordinate
} from './utils/ludoHelpers';
import { gameAudio } from './utils/audio';
import { announceGameEvent } from './utils/speech';

// Modular Subcomponents
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import SidebarPanel from './components/SidebarPanel';
import { ParticleCelebration } from './components/ParticleCelebration';
import GoogleChatPanel from './components/GoogleChatPanel';

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    players: {
      RED: { color: 'RED', name: 'Player 1', type: 'human', isActive: true },
      GREEN: { color: 'GREEN', name: 'Bot 1', type: 'bot', isActive: true },
      YELLOW: { color: 'YELLOW', name: 'Player 2', type: 'inactive', isActive: false },
      BLUE: { color: 'BLUE', name: 'Bot 2', type: 'bot', isActive: true }
    },
    tokens: {
      RED: [
        { id: 0, color: 'RED', step: 0 },
        { id: 1, color: 'RED', step: 0 },
        { id: 2, color: 'RED', step: 0 },
        { id: 3, color: 'RED', step: 0 }
      ],
      GREEN: [
        { id: 0, color: 'GREEN', step: 0 },
        { id: 1, color: 'GREEN', step: 0 },
        { id: 2, color: 'GREEN', step: 0 },
        { id: 3, color: 'GREEN', step: 0 }
      ],
      YELLOW: [
        { id: 0, color: 'YELLOW', step: 0 },
        { id: 1, color: 'YELLOW', step: 0 },
        { id: 2, color: 'YELLOW', step: 0 },
        { id: 3, color: 'YELLOW', step: 0 }
      ],
      BLUE: [
        { id: 0, color: 'BLUE', step: 0 },
        { id: 1, color: 'BLUE', step: 0 },
        { id: 2, color: 'BLUE', step: 0 },
        { id: 3, color: 'BLUE', step: 0 }
      ]
    },
    currentTurn: 'RED',
    diceValue: 6,
    isRolling: false,
    hasRolled: false,
    consecutiveSixes: 0,
    gameStatus: 'setup',
    winnerList: [],
    logs: [],
    voiceEnabled: true,
    language: 'odia'
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeMessage, setActiveMessage] = useState<string>(''); // Odia toast or prompt
  const [activeMessageEng, setActiveMessageEng] = useState<string>(''); // English toast
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationInProgressRef = useRef<boolean>(false);

  // Sync volume state with engine
  useEffect(() => {
    gameAudio.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Translate basic system values
  const textDict = {
    title: gameState.language === 'odia' ? 'ଓଡ଼ିଆ ଲୁଡୋ ସାମ୍ରାଜ୍ୟ' : 'Odia Ludo Empire',
    yourTurn: gameState.language === 'odia' ? 'ଆପଣଙ୍କ ପାଳି' : 'Your Turn',
    botTurn: gameState.language === 'odia' ? 'ରୋବୋଟ୍ କାମ କରୁଛି...' : "Bot's Turn Calculating...",
    rolled: gameState.language === 'odia' ? 'ପକାଇଲେ' : 'rolled a',
    noMoves: gameState.language === 'odia' ? 'କୌଣସି ଚାଲ୍ ସମ୍ଭବ ନାହିଁ!' : 'No moves possible!',
    backToSetup: gameState.language === 'odia' ? 'ସେଟଅପ୍‌କୁ ଫେରନ୍ତୁ' : 'Back to Menu',
    resetGame: gameState.language === 'odia' ? 'ରିସେଟ୍' : 'Reset Match',
    winsText: gameState.language === 'odia' ? 'ଜିତିଲେ!' : 'Won the Match!',
    voicePrompt: gameState.language === 'odia' ? 'ଭଏସ୍ ଅନ୍' : 'Speech On',
    soundPrompt: gameState.language === 'odia' ? 'ଶବ୍ଦ ଅନ୍' : 'Sounds On',
    diceBtnPromptColor: gameState.language === 'odia' ? 'ଗଡ଼ାନ୍ତୁ' : 'Roll Dice'
  };

  // Fullscreen state and change event listeners
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle non-fatal error:', err);
    }
  };

  // Google Chat share states
  const [chatBroadcastEnabled, setChatBroadcastEnabled] = useState(false);
  const [chatSelectedSpace, setChatSelectedSpace] = useState<string | null>(null);

  // Folklore Character Active Dialogue Bubbles
  const [activeDialogue, setActiveDialogue] = useState<{
    characterId: string;
    color: PlayerColor;
    textOdia: string;
    textEng: string;
    emoji: string;
    name: string;
  } | null>(null);
  const dialogueTimeoutRef = useRef<any>(null);

  const maybeBroadcastToChat = async (odiaMsg: string, engMsg: string) => {
    if (!chatBroadcastEnabled || !chatSelectedSpace) return;
    try {
      const { getAccessToken, postChatMessage } = await import('./utils/googleAuth');
      const token = getAccessToken();
      if (token) {
        const payload = gameState.language === 'odia'
          ? `📢 *[ଲୁଡୋ ସୁପ୍ରିମ ଐତିହାସିକ]*: ${odiaMsg}`
          : `📢 *[Ludo Supreme Folklore Logs]*: ${engMsg}`;
        await postChatMessage(token, chatSelectedSpace, payload);
      }
    } catch (e) {
      console.warn('Background chat broadcast failed', e);
    }
  };

  const triggerCharacterDialogue = (
    char: any,
    color: PlayerColor,
    type: 'rollSix' | 'capturing' | 'getCaptured' | 'reachHome' | 'winGame'
  ) => {
    const dialogueSet = char.dialogues[type];
    if (!dialogueSet) return;

    setActiveDialogue({
      characterId: char.id,
      color,
      textOdia: dialogueSet.odia,
      textEng: dialogueSet.eng,
      emoji: char.avatarEmoji,
      name: gameState.language === 'odia' ? char.nameOdia : char.nameEng
    });

    speak(dialogueSet.odia, dialogueSet.eng);

    // Broadcast highlights to Google Chat space automatically
    maybeBroadcastToChat(
      `*${char.nameOdia}*: "${dialogueSet.odia}"`,
      `*${char.nameEng}*: "${dialogueSet.eng}"`
    );

    if (dialogueTimeoutRef.current) clearTimeout(dialogueTimeoutRef.current);
    dialogueTimeoutRef.current = setTimeout(() => {
      setActiveDialogue(null);
    }, 5500);
  };

  // Log write utility helper
  const addLog = (odia: string, eng: string, type: LogEntry['type']) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const newEntry: LogEntry = {
      id: Math.random().toString(),
      timestamp: timeStr,
      messageOdia: odia,
      messageEnglish: eng,
      type
    };
    setGameState((prev) => ({
      ...prev,
      logs: [...prev.logs, newEntry]
    }));
  };

  // Announce Speech
  const speak = (odia: string, eng: string) => {
    announceGameEvent(
      gameState.language === 'odia' ? odia : eng,
      gameState.language,
      gameState.voiceEnabled
    );
  };

  // Start the actual game post configuration details
  const handleStartGame = (
    playerConfigs: Record<PlayerColor, Player>,
    voiceOn: boolean,
    selectedLang: 'odia' | 'english'
  ) => {
    // Find the first active player color
    const colors: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    const firstActive = colors.find((c) => playerConfigs[c].isActive) || 'RED';

    // Reset tokens
    const freshTokens: Record<PlayerColor, Token[]> = {
      RED: [
        { id: 0, color: 'RED', step: 0 },
        { id: 1, color: 'RED', step: 0 },
        { id: 2, color: 'RED', step: 0 },
        { id: 3, color: 'RED', step: 0 }
      ],
      GREEN: [
        { id: 0, color: 'GREEN', step: 0 },
        { id: 1, color: 'GREEN', step: 0 },
        { id: 2, color: 'GREEN', step: 0 },
        { id: 3, color: 'GREEN', step: 0 }
      ],
      YELLOW: [
        { id: 0, color: 'YELLOW', step: 0 },
        { id: 1, color: 'YELLOW', step: 0 },
        { id: 2, color: 'YELLOW', step: 0 },
        { id: 3, color: 'YELLOW', step: 0 }
      ],
      BLUE: [
        { id: 0, color: 'BLUE', step: 0 },
        { id: 1, color: 'BLUE', step: 0 },
        { id: 2, color: 'BLUE', step: 0 },
        { id: 3, color: 'BLUE', step: 0 }
      ]
    };

    setGameState({
      players: playerConfigs,
      tokens: freshTokens,
      currentTurn: firstActive,
      diceValue: 6,
      isRolling: false,
      hasRolled: false,
      consecutiveSixes: 0,
      gameStatus: 'playing',
      winnerList: [],
      logs: [],
      voiceEnabled: voiceOn,
      language: selectedLang
    });

    // Speak initial match greeting
    const welcomeOdia = `ଓଡ଼ିଆ ଲୁଡୋକୁ ସ୍ୱାଗତ। ${playerConfigs[firstActive].name}ଙ୍କ ପାଳି ପ୍ରଥମେ ଆରମ୍ଭ କରନ୍ତୁ।`;
    const welcomeEng = `Welcome to Odia Ludo. ${playerConfigs[firstActive].name}'s turn is first.`;
    speak(welcomeOdia, welcomeEng);
    
    // Tiny delay to avoid overlapping the speaker
    setTimeout(() => {
      addLog('ଲୁଡୋ ମ୍ୟାଚ୍ ଆରମ୍ଭ ହେଲା!', 'Ludo Match Started!', 'status');
    }, 400);
  };

  // Cycle current active turns clockwise
  const advanceTurn = (overrideColor?: PlayerColor) => {
    if (gameState.gameStatus === 'winner') return;

    const colors: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    let nextIndex = colors.indexOf(overrideColor || gameState.currentTurn);

    // Find next active player who hasn't finished the game
    let foundNext = false;
    let attempts = 0;

    while (!foundNext && attempts < 4) {
      nextIndex = (nextIndex + 1) % 4;
      const proposedColor = colors[nextIndex];
      const player = gameState.players[proposedColor];

      // Check if player is active & has not finished (i.e. not all 4 tokens are home at step 57)
      const isFinished = gameState.tokens[proposedColor].every((t) => t.step === 57);

      if (player.isActive && !isFinished) {
        foundNext = true;
        setGameState((prev) => ({
          ...prev,
          currentTurn: proposedColor,
          hasRolled: false,
          consecutiveSixes: 0
        }));

        const nextName = player.name;
        // Text-to-speech announcement
        const odiaAnnounce = `${nextName} ର ପାଳି, ତୁମର ଗୁଟି ଗଡ଼ାନ୍ତୁ।`;
        const engAnnounce = `${nextName}'s turn, roll the dice.`;
        speak(odiaAnnounce, engAnnounce);
        break;
      }
      attempts++;
    }

    // If nobody found, then the game has naturally ended
    if (!foundNext) {
      setGameState((prev) => ({ ...prev, gameStatus: 'winner' }));
      speak('ଖେଳ ଶେଷ ହେଲା। ସମସ୍ତ ଖେଳାଳି ସମ୍ପୂର୍ଣ୍ଣ କଲେ।', 'Game Over. All players finished.');
    }
  };

  // Core dice roll event
  const rollDice = () => {
    if (gameState.isRolling || gameState.hasRolled || animationInProgressRef.current) return;

    setGameState((prev) => ({ ...prev, isRolling: true }));
    gameAudio.playRoll();

    // Roll duration
    setTimeout(() => {
      const rolled = getDiceRoll();
      setGameState((prev) => {
        const activeColor = prev.currentTurn;
        const player = prev.players[activeColor];
        const nextConsecSix = rolled === 6 ? prev.consecutiveSixes + 1 : 0;

        // Auto cancel turn if 3 consecutive sixes are rolled
        if (nextConsecSix === 3) {
          const skipOdia = `୩ଥର କ୍ରମାଗତ ଛକା ପଡ଼ିବାରୁ ${player.name}ଙ୍କ ପାଳି ବାତିଲ ହେଲା!`;
          const skipEng = `Three consecutive sixes! ${player.name}'s turn is forfeited.`;
          
          speak(skipOdia, skipEng);

          // Return state with consecutive cancelled and trigger turn change
          setTimeout(() => {
            advanceTurn(activeColor);
          }, 1800);

          return {
            ...prev,
            diceValue: rolled,
            isRolling: false,
            hasRolled: true,
            consecutiveSixes: 0,
            logs: [
              ...prev.logs,
              {
                id: Math.random().toString(),
                timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5),
                messageOdia: skipOdia,
                messageEnglish: skipEng,
                type: 'roll'
              }
            ]
          };
        }

        // Custom Commentary for high roll values
        const isSix = rolled === 6;
        const logOdia = `${player.name} ପକାଇଲେ: ${isSix ? 'ଛକା (୬)' : rolled}`;
        const logEng = `${player.name} rolled: ${rolled}`;

        // Dialogue overrides if a folklore hero rolled 6
        if (isSix && player.characterId) {
          import('./data/characters').then(({ ODIA_FOLKLORE_CHARACTERS }) => {
            const char = ODIA_FOLKLORE_CHARACTERS.find((c) => c.id === player.characterId);
            if (char) {
              triggerCharacterDialogue(char, activeColor, 'rollSix');
            }
          });
        } else {
          // Dynamic Speeches
          let speechOdia = `${player.name} ${rolled === 6 ? 'ଛକା' : rolled}`;
          let speechEng = `${player.name} rolled ${rolled}`;

          announceGameEvent(
            prev.language === 'odia' ? speechOdia : speechEng,
            prev.language,
            prev.voiceEnabled
          );
        }

        // Silent tracking post
        if (!isSix || !player.characterId) {
          maybeBroadcastToChat(
            `${player.name} ଗୋଟି ଚଲାଇ ମିଳିଲା: ${rolled}`,
            `${player.name} rolled and got: ${rolled}`
          );
        }

        // Check if there are any legal moves
        const playerTokens = prev.tokens[activeColor];
        const movable = getMovableTokens(playerTokens, rolled);

        if (movable.length === 0) {
          toastMessage(
            prev.language === 'odia' ? 'କୌଣସି ଚାଲ୍ ସମ୍ଭବ ନାହିଁ!' : 'No moves possible!',
            prev.language === 'odia' ? 'ଚାଲୁ ଫେରିଗଲା...' : 'Forfeiting turn...'
          );

          // Force advance turn after 1.5 seconds so they are not locked
          setTimeout(() => {
            advanceTurn(activeColor);
          }, 1500);
        }

        return {
          ...prev,
          diceValue: rolled,
          isRolling: false,
          hasRolled: true,
          consecutiveSixes: nextConsecSix,
          logs: [
            ...prev.logs,
            {
              id: Math.random().toString(),
              timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5),
              messageOdia: logOdia,
              messageEnglish: logEng,
              type: 'roll'
            }
          ]
        };
      });
    }, 750);
  };

  // Setup auxiliary toast messages
  const toastMessage = (odia: string, eng: string) => {
    setActiveMessage(odia);
    setActiveMessageEng(eng);
    setTimeout(() => {
      setActiveMessage('');
      setActiveMessageEng('');
    }, 1800);
  };

  // Perform surgical capture detection
  const handleCaptureCheck = (
    color: PlayerColor,
    targetStep: number,
    tokenId: number
  ): { capturedColor: PlayerColor | null; capTokenId: number | null } => {
    const coord = getTokenCoordinates(color, targetStep, tokenId);
    
    // If target coordinate is inside a Safe Zone, capture is strictly impossible!
    if (isSafeCoordinate(coord[0], coord[1])) {
      return { capturedColor: null, capTokenId: null };
    }

    // Scan all other active colors
    const colors: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    for (let c of colors) {
      if (c === color) continue; // Do not cut own tokens
      if (!gameState.players[c].isActive) continue;

      const oppTokens = gameState.tokens[c];
      for (let t of oppTokens) {
        // Only potential target on track can be captured (step 1 to 51)
        if (t.step > 0 && t.step < 52) {
          const oppCoord = getTokenCoordinates(c, t.step, t.id);
          if (oppCoord[0] === coord[0] && oppCoord[1] === coord[1]) {
            // We found a collision!
            return { capturedColor: c, capTokenId: t.id };
          }
        }
      }
    }

    return { capturedColor: null, capTokenId: null };
  };

  // Core movement step-by-step controller
  const makeTokenMove = async (color: PlayerColor, tokenId: number) => {
    if (!gameState.hasRolled || animationInProgressRef.current) return;

    const rollValue = gameState.diceValue;
    const token = gameState.tokens[color].find((t) => t.id === tokenId);
    if (!token || !canMoveToken(token, rollValue)) return;

    animationInProgressRef.current = true;
    const startStep = token.step;
    const finalStep = startStep === 0 ? 1 : startStep + rollValue;

    // Execute iterative cells movements to simulate realistic board glide!
    let currentStep = startStep;

    const animateStep = () => {
      if (currentStep < finalStep) {
        currentStep = currentStep === 0 ? 1 : currentStep + 1;
        
        // Update state per frame step
        setGameState((prev) => {
          const list = prev.tokens[color].map((t) => (t.id === tokenId ? { ...t, step: currentStep } : t));
          return {
            ...prev,
            tokens: { ...prev.tokens, [color]: list }
          };
        });

        gameAudio.playStep();

        // Recursively trigger next step
        setTimeout(animateStep, 150);
      } else {
        // Animation finished! Complete transaction logic
        completeMoveTransaction(color, tokenId, finalStep, rollValue);
      }
    };

    // If launching from yard, jump immediately with launch fanfare
    if (startStep === 0) {
      currentStep = 1;
      setGameState((prev) => {
        const list = prev.tokens[color].map((t) => (t.id === tokenId ? { ...t, step: 1 } : t));
        return {
          ...prev,
          tokens: { ...prev.tokens, [color]: list }
        };
      });
      gameAudio.playStep();
      setTimeout(() => {
        completeMoveTransaction(color, tokenId, 1, rollValue);
      }, 200);
    } else {
      animateStep();
    }
  };

  // Handles captures, base entries, and winner leaderboards after a token slide ends
  const completeMoveTransaction = (
    color: PlayerColor,
    tokenId: number,
    finalStep: number,
    rollVal: number
  ) => {
    let triggeredBonus = false;
    let didCapture = false;
    let capturedPlayerName = '';

    // Save logs to write
    let logsToWrite: LogEntry[] = [];
    const player = gameState.players[color];

    setGameState((prev) => {
      const currentTokens = { ...prev.tokens };
      let updatedWinnerList = [...prev.winnerList];

      // 1. Check home entry triggers (step 57)
      const tokenRef = currentTokens[color].find((t) => t.id === tokenId);
      if (tokenRef && tokenRef.step === 57) {
        triggeredBonus = true; // Complete token entry rewards another turn
        gameAudio.playHome();

        const homeOdia = `ସୁନ୍ଦର ଚାଲ୍! ${player.name}ଙ୍କ ଗୋଟି ହୋମ୍‌ରେ ସମ୍ପୂର୍ଣ୍ଣ ପ୍ରବେଶ କଲା।`;
        const homeEng = `Great move! ${player.name}'s token entered the Home Goal.`;

        if (player.characterId) {
          import('./data/characters').then(({ ODIA_FOLKLORE_CHARACTERS }) => {
            const char = ODIA_FOLKLORE_CHARACTERS.find((c) => c.id === player.characterId);
            if (char) {
              triggerCharacterDialogue(char, color, 'reachHome');
            }
          });
        } else {
          speak(homeOdia, homeEng);
          maybeBroadcastToChat(homeOdia, homeEng);
        }

        logsToWrite.push({
          id: Math.random().toString(),
          timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5),
          messageOdia: homeOdia,
          messageEnglish: homeEng,
          type: 'home'
        });

        // Check if player has finished overall (all 4 tokens step === 57)
        const allFinished = currentTokens[color].every((t) => t.step === 57);
        if (allFinished && !updatedWinnerList.includes(color)) {
          updatedWinnerList.push(color);
          gameAudio.playFanfare();

          const winOdia = `ତାଳି ବଜାନ୍ତୁ! ${player.name} ସମସ୍ତ ଗୋଟି ହୋମ୍ କରି ବିଜେତା ବିଶ୍ଵସ୍ତରୀୟ ତାଲିକାରେ ସ୍ଥାନ ପାଇଲେ!`;
          const winEng = `Applause! ${player.name} has finished all tokens and won a place on the leaderboard!`;

          if (player.characterId) {
            import('./data/characters').then(({ ODIA_FOLKLORE_CHARACTERS }) => {
              const char = ODIA_FOLKLORE_CHARACTERS.find((c) => c.id === player.characterId);
              if (char) {
                triggerCharacterDialogue(char, color, 'winGame');
              }
            });
          } else {
            speak(winOdia, winEng);
            maybeBroadcastToChat(winOdia, winEng);
          }

          logsToWrite.push({
            id: Math.random().toString(),
            timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5),
            messageOdia: winOdia,
            messageEnglish: winEng,
            type: 'win'
          });
        }
      }

      // 2. Scan Capture Collisions (only if NOT home finished)
      if (tokenRef && tokenRef.step > 0 && tokenRef.step < 52) {
        const { capturedColor, capTokenId } = handleCaptureCheck(color, tokenRef.step, tokenId);
        if (capturedColor !== null && capTokenId !== null) {
          didCapture = true;
          triggeredBonus = true;

          // Push target back to yard (step = 0)
          currentTokens[capturedColor] = currentTokens[capturedColor].map((t) =>
            t.id === capTokenId ? { ...t, step: 0 } : t
          );

          gameAudio.playKill();

          const oppName = prev.players[capturedColor].name;
          capturedPlayerName = oppName;

          const capOdia = `ଚମତ୍କାର! ${player.name} (${COLOR_THEMES[color].nameOdia}) ${oppName}ଙ୍କ ଗୋଟିକୁ କାଟି ୟାର୍ଡକୁ ପଠାଇଦେଲେ!`;
          const capEng = `Incredible! ${player.name} captured ${oppName}'s token!`;

          if (player.characterId) {
            import('./data/characters').then(({ ODIA_FOLKLORE_CHARACTERS }) => {
              const char = ODIA_FOLKLORE_CHARACTERS.find((c) => c.id === player.characterId);
              if (char) {
                triggerCharacterDialogue(char, color, 'capturing');
              }
            });
          } else {
            speak(capOdia, capEng);
            maybeBroadcastToChat(capOdia, capEng);
          }

          // Opponent dialogue scream when captured!
          const oppPlayer = prev.players[capturedColor];
          if (oppPlayer && oppPlayer.characterId) {
            setTimeout(() => {
              import('./data/characters').then(({ ODIA_FOLKLORE_CHARACTERS }) => {
                const char = ODIA_FOLKLORE_CHARACTERS.find((c) => c.id === oppPlayer.characterId);
                if (char) {
                  triggerCharacterDialogue(char, capturedColor, 'getCaptured');
                }
              });
            }, 1400);
          }

          logsToWrite.push({
            id: Math.random().toString(),
            timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5),
            messageOdia: capOdia,
            messageEnglish: capEng,
            type: 'kill'
          });
        }
      }

      // 3. Fallback moves log
      if (logsToWrite.length === 0) {
        const plainOdia = `${player.name} ଗୋଟିକୁ ${rollVal} ଘର ଆଗକୁ ଚଲାଇଲେ।`;
        const plainEng = `${player.name} advanced token by ${rollVal} spaces.`;
        logsToWrite.push({
          id: Math.random().toString(),
          timestamp: new Date().toTimeString().split(' ')[0].substring(0, 5),
          messageOdia: plainOdia,
          messageEnglish: plainEng,
          type: 'move'
        });
      }

      return {
        ...prev,
        tokens: currentTokens,
        winnerList: updatedWinnerList,
        logs: [...prev.logs, ...logsToWrite]
      };
    });

    animationInProgressRef.current = false;

    // Turn progress rule: sixes or home-ins or captures gives a bonus turn
    const activeColor = gameState.currentTurn;
    const isSix = rollVal === 6;

    setTimeout(() => {
      if (isSix || triggeredBonus) {
        const bonusMsgOdia = isSix
          ? 'ଛକା ଯୋଗୁଁ ଆଉ ଏକ ପାଳି!'
          : 'ଗୋଟି କାଟିବା ବା ହୋମ୍ ପ୍ରବେଶ ଯୋଗୁଁ ବୋନସ୍ ପାଳି!';
        const bonusMsgEng = isSix ? 'Bonus turn for rolling a 6!' : 'Bonus turn awarded!';
        toastMessage(bonusMsgOdia, bonusMsgEng);

        setGameState((prev) => ({
          ...prev,
          hasRolled: false
        }));

        const rollPromptOdia = `${gameState.players[activeColor].name}, ଗୁଟି ଗଡ଼ାନ୍ତୁ।`;
        const rollPromptEng = `${gameState.players[activeColor].name}, roll again.`;
        speak(rollPromptOdia, rollPromptEng);
      } else {
        advanceTurn();
      }
    }, 1200);
  };

  // Bot Smart AI Engine
  const runBotHeuristics = () => {
    const color = gameState.currentTurn;
    const rollValue = gameState.diceValue;
    const botTokens = gameState.tokens[color];
    const movableList = getMovableTokens(botTokens, rollValue);

    if (movableList.length === 0) return; // No moves possible, turn advanced by roll click automatically

    // 1. Priority 1: Pick a token that can capture immediately
    for (let t of movableList) {
      const nextStep = t.step === 0 ? 1 : t.step + rollValue;
      if (nextStep < 52) {
        const { capturedColor } = handleCaptureCheck(color, nextStep, t.id);
        if (capturedColor !== null) {
          makeTokenMove(color, t.id);
          return;
        }
      }
    }

    // 2. Priority 2: Pick a token that can reach Home (step 57)
    for (let t of movableList) {
      if (t.step + rollValue === 57) {
        makeTokenMove(color, t.id);
        return;
      }
    }

    // 3. Priority 3: Save a token from immediate capture (inside adjacent 5 cells of any opponent)
    // Run simple checks if an opponent is behind or default to forwarding outer track pieces
    const outerTrackTokens = movableList.filter((t) => t.step > 0 && t.step < 52);
    if (outerTrackTokens.length > 0) {
      // Sort to forward the one furthest advanced on board
      outerTrackTokens.sort((a, b) => b.step - a.step);
      makeTokenMove(color, outerTrackTokens[0].id);
      return;
    }

    // 4. Priority 4: Default to releasing token on 6
    const yardTokens = movableList.filter((t) => t.step === 0);
    if (yardTokens.length > 0 && rollValue === 6) {
      makeTokenMove(color, yardTokens[0].id);
      return;
    }

    // 5. Absolute fallback: pick any first movable token
    makeTokenMove(color, movableList[0].id);
  };

  // Active BOT trigger loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;

    const currPlayer = gameState.players[gameState.currentTurn];
    if (currPlayer.type === 'bot') {
      // Ensure no double timers or concurrent actions
      if (botTimerRef.current) clearTimeout(botTimerRef.current);

      botTimerRef.current = setTimeout(() => {
        // Step 1: Roll the dice if bot hasn't rolled yet
        if (!gameState.hasRolled && !gameState.isRolling && !animationInProgressRef.current) {
          rollDice();
        } 
        // Step 2: bot has rolled, make smart move
        else if (gameState.hasRolled && !gameState.isRolling && !animationInProgressRef.current) {
          const movable = getMovableTokens(gameState.tokens[gameState.currentTurn], gameState.diceValue);
          if (movable.length > 0) {
            // Delay 1000ms to allow human player to read the rolled number
            setTimeout(() => {
              runBotHeuristics();
            }, 1000);
          }
        }
      }, 1200);
    }

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [gameState.currentTurn, gameState.hasRolled, gameState.isRolling, gameState.gameStatus]);

  // Handle visual Dice dots styles
  const renderDiceFaceDots = (val: number) => {
    switch (val) {
      case 1:
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-950 shadow" />
          </div>
        );
      case 2:
        return (
          <div className="absolute inset-0 p-2.5 flex flex-col justify-between items-stretch">
            <div className="flex justify-start">
              <div className="w-3 h-3 rounded-full bg-slate-950 shadow" />
            </div>
            <div className="flex justify-end">
              <div className="w-3 h-3 rounded-full bg-slate-950 shadow" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="absolute inset-0 p-2 flex flex-col justify-between items-stretch">
            <div className="flex justify-start">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
            <div className="flex justify-center -translate-y-[2px]">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
            <div className="flex justify-end">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="absolute inset-0 p-2.5 flex flex-col justify-between gap-1">
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="absolute inset-0 p-1.5 flex flex-col justify-between gap-1">
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
            <div className="flex justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="absolute inset-0 p-2 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
            <div className="flex justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Main UI components render routing
  const activeColor = gameState.currentTurn;
  const activePlayer = gameState.players[activeColor];
  const isBotActive = activePlayer.type === 'bot';

  // Find movable tokens for board clicks reference
  const movableTokens = gameState.hasRolled && !isBotActive ? getMovableTokens(gameState.tokens[activeColor], gameState.diceValue) : [];

  // Find best move token ID for human recommendation (path highlight / fast gameplay assistant)
  let humanBestTokenId: number | null = null;
  if (gameState.hasRolled && !isBotActive && movableTokens.length > 0) {
    const color = gameState.currentTurn;
    const rollValue = gameState.diceValue;

    // 1. Priority 1: Pick a token that can capture immediately
    let foundCaptureId: number | null = null;
    for (let t of movableTokens) {
      const nextStep = t.step === 0 ? 1 : t.step + rollValue;
      if (nextStep < 52) {
        const { capturedColor } = handleCaptureCheck(color, nextStep, t.id);
        if (capturedColor !== null) {
          foundCaptureId = t.id;
          break;
        }
      }
    }

    if (foundCaptureId !== null) {
      humanBestTokenId = foundCaptureId;
    } else {
      // 2. Priority 2: Pick a token that can reach Home (step 57)
      let foundHomeId: number | null = null;
      for (let t of movableTokens) {
        if (t.step + rollValue === 57) {
          foundHomeId = t.id;
          break;
        }
      }

      if (foundHomeId !== null) {
        humanBestTokenId = foundHomeId;
      } else {
        // 3. Priority 3: Save a token from capture OR forward the one furthest advanced on board
        const outerTrackTokens = movableTokens.filter((t) => t.step > 0 && t.step < 52);
        if (outerTrackTokens.length > 0) {
          const sortedTokens = [...outerTrackTokens].sort((a, b) => b.step - a.step);
          humanBestTokenId = sortedTokens[0].id;
        } else {
          // 4. Priority 4: Default to releasing token on 6
          const yardTokens = movableTokens.filter((t) => t.step === 0);
          if (yardTokens.length > 0 && rollValue === 6) {
            humanBestTokenId = yardTokens[0].id;
          } else {
            // 5. Absolute fallback: pick any first movable token
            humanBestTokenId = movableTokens[0].id;
          }
        }
      }
    }
  }

  // Extract list of active gameplay color presets
  const activeColorsList = (['RED', 'GREEN', 'YELLOW', 'BLUE'] as PlayerColor[]).filter(
    (c) => gameState.players[c].isActive
  );

  const getPlayerProgress = (color: PlayerColor) => {
    const tokenList = gameState.tokens[color];
    if (!tokenList) return 0;
    const totalSteps = tokenList.reduce((sum, t) => sum + t.step, 0);
    const percent = Math.round((totalSteps / 228) * 100);
    return Math.min(100, percent);
  };

  const toOdiaDigits = (num: number | string): string => {
    const odiaDigits = ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'];
    return num
      .toString()
      .split('')
      .map((char) => {
        const parsed = parseInt(char, 10);
        return isNaN(parsed) ? char : odiaDigits[parsed];
      })
      .join('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans p-4 md:p-6 lg:p-8">
      {/* Dynamic Cosmic Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-950/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-950/10 blur-[130px] pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-slate-900/50 p-5 rounded-3xl border border-slate-800 relative z-10 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20 text-white shrink-0">
            <span className="text-2xl font-black">ଲ</span>
          </div>
          <div className="text-left">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{gameState.language === 'odia' ? 'ଲୁଡୋ ସୁପ୍ରିମ' : 'Ludo Supreme'}</span>
              <span className="text-orange-500 text-xs font-bold leading-none bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-lg">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              {gameState.language === 'odia' ? 'ଲୁଡୋ ସୁପ୍ରିମ • ଓଡ଼ିଶାର ନିଜର ଖେଳ' : 'Ludo Supreme • Odisha\'s Favorite Board Game'}
            </p>
          </div>
        </div>

        {/* Global Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Always show Fullscreen toggle button for an immersive experience */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? (gameState.language === 'odia' ? 'ସମ୍ପୂର୍ଣ୍ଣ ସ୍କ୍ରିନ ବନ୍ଦ କରନ୍ତୁ' : 'Exit Fullscreen') : (gameState.language === 'odia' ? 'ସମ୍ପୂର୍ଣ୍ଣ ସ୍କ୍ରିନ କରନ୍ତୁ' : 'Fullscreen Mode')}
            className={`p-2 rounded-2xl border transition cursor-pointer text-slate-300 shadow-sm ${
              isFullscreen
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold'
                : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {gameState.gameStatus === 'playing' && (
            <>
              {/* Lang switch */}
              <button
                onClick={() =>
                  setGameState((g) => ({ ...g, language: g.language === 'odia' ? 'english' : 'odia' }))
                }
                className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-2xl text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>{gameState.language === 'odia' ? 'English' : 'ଓଡ଼ିଆ'}</span>
              </button>

              {/* Voice toggle */}
              <button
                onClick={() => setGameState((g) => ({ ...g, voiceEnabled: !g.voiceEnabled }))}
                title={textDict.voicePrompt}
                className={`p-2 rounded-2xl border transition cursor-pointer ${
                  gameState.voiceEnabled
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                {gameState.voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              {/* Sound toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={textDict.soundPrompt}
                className={`p-2 rounded-2xl border transition cursor-pointer ${
                  soundEnabled
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Classical Odia BGM Toggle */}
              <button
                onClick={() => {
                  const playing = gameAudio.getIsBgmPlaying();
                  if (playing) {
                    gameAudio.stopTraditionalBGM();
                  } else {
                    gameAudio.playTraditionalBGM();
                  }
                  setGameState((g) => ({ ...g }));
                }}
                title={gameState.language === 'odia' ? 'ଓଡ଼ିଆ ପାରମ୍ପରିକ ବାଦ୍ୟ ସଙ୍ଗୀତ' : 'Traditional Classical BGM'}
                className={`p-2 rounded-2xl border transition cursor-pointer ${
                  gameAudio.getIsBgmPlaying()
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                <Music className="w-4 h-4" />
              </button>

              {/* Return to setup */}
              <button
                onClick={() => setGameState((g) => ({ ...g, gameStatus: 'setup' }))}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{textDict.backToSetup}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Body Routing Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full flex items-center justify-center relative z-10 py-2">
        <AnimatePresence mode="wait">
          {/* SECTION A: Setup Configurations Screens */}
          {gameState.gameStatus === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex justify-center py-6"
            >
              <GameSetup onStartGame={handleStartGame} defaultLang={gameState.language} />
            </motion.div>
          )}

          {/* SECTION B: Real Active Match Play Panels */}
          {gameState.gameStatus === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Turn controller & Interactive Dice side (lg:span-3) */}
              <div className="lg:col-span-3 flex flex-col gap-5">
                {/* 1. Interactive Turn card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 backdrop-blur flex flex-col justify-between relative overflow-hidden text-center select-none ring-1 ring-white/5 shadow-2xl">
                  {/* Glowing core orb indicating active card turn color */}
                  <div
                    className={`absolute -top-16 -left-16 w-32 h-32 rounded-full opacity-25 blur-2xl transition-all duration-500 ${
                      COLOR_THEMES[activeColor].primary
                    }`}
                  />

                  {/* Active player display section */}
                  <div className="border-b border-slate-800/80 pb-4 pt-1 flex flex-col items-center">
                    <span
                      className={`w-6 h-6 rounded-full ${COLOR_THEMES[activeColor].primary} border-2 border-white/20 shadow-md shadow-black/50 mb-3 animate-pulse`}
                    />
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                      {isBotActive ? textDict.botTurn : textDict.yourTurn}
                    </h3>
                    <h2 className="text-lg font-black text-white mt-1 max-w-full truncate drop-shadow">
                      {activePlayer.name}
                    </h2>
                    <span
                      className={`mt-2 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                        isBotActive
                          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isBotActive
                        ? (gameState.language === 'odia' ? 'ରୋବୋଟ୍' : 'Computer Bot')
                        : (gameState.language === 'odia' ? 'ମୋ ଚାଲ୍' : 'Local Human')}
                    </span>
                  </div>

                  {/* High visual dice container */}
                  <div className="flex-1 flex flex-col items-center justify-center py-5">
                    {/* Dice 3D frame wrapper */}
                    <motion.div
                      onClick={() => {
                        if (!isBotActive && !gameState.hasRolled && !gameState.isRolling) {
                          rollDice();
                        }
                      }}
                      className={`w-16 h-16 rounded-2xl bg-white border border-slate-300 relative shadow-xl flex items-center justify-center cursor-pointer select-none ring-offset-4 ring-offset-slate-950 transition-all ${
                        !isBotActive && !gameState.hasRolled && !gameState.isRolling
                          ? 'ring-2 ring-amber-500/70 hover:scale-105 active:scale-95'
                          : ''
                      } ${gameState.isRolling ? 'animate-bounce' : ''}`}
                      animate={
                        gameState.isRolling
                          ? {
                              rotate: [0, 90, 180, 270, 360],
                              scale: [1, 1.15, 0.9, 1.1, 1]
                            }
                          : {}
                      }
                      transition={{ duration: 0.75, ease: 'easeInOut' }}
                    >
                      {renderDiceFaceDots(gameState.diceValue)}
                    </motion.div>

                    {/* Status label under dice */}
                    <div className="mt-4 h-5">
                      {gameState.isRolling ? (
                        <p className="text-xs text-amber-400 font-bold animate-pulse">
                          {gameState.language === 'odia' ? 'ଘୂରୁଛି...' : 'Rolling dice...'}
                        </p>
                      ) : (
                        <p className="text-xs font-black text-slate-100 flex items-center justify-center gap-1.5 leading-none">
                          <span
                            className="font-black text-sm"
                            style={{ color: COLOR_THEMES[activeColor].hex }}
                          >
                            {gameState.diceValue === 6 && gameState.language === 'odia' ? 'ଛକା' : gameState.diceValue}
                          </span>
                          <span className="text-[10px] text-slate-400">{textDict.rolled}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Manual Click roll label trigger */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      disabled={isBotActive || gameState.hasRolled || gameState.isRolling}
                      onClick={rollDice}
                      className={`w-full py-3 text-xs font-black uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
                        isBotActive || gameState.hasRolled || gameState.isRolling
                          ? 'bg-slate-900/60 border border-slate-805 text-slate-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-md active:scale-[0.98]'
                      }`}
                    >
                      <Dices className="w-3.5 h-3.5 fill-white shrink-0" />
                      <span>{textDict.diceBtnPromptColor}</span>
                    </button>
                    <p className="text-[9px] text-slate-500 mt-2 font-mono leading-tight">
                      {isBotActive
                        ? (gameState.language === 'odia' ? 'ଖେଳାଳି କମ୍ପ୍ୟୁଟର ଚାଲ ବଛାଯାଉଛି...' : 'AI Bot making smart path choice...')
                        : (gameState.language === 'odia' ? 'ଗୁଟିଗୁଡ଼ିକ ଉପରେ କ୍ଲିକ୍ କରି ଚଲାନ୍ତୁ' : 'Click active glowing coin to advance')}
                    </p>
                  </div>
                </div>

                {/* 2. Roster players bento elements */}
                <div className="flex flex-col gap-3">
                  {activeColorsList.map((color) => {
                    const player = gameState.players[color];
                    const isCurrent = color === activeColor;
                    const progress = getPlayerProgress(color);
                    const theme = COLOR_THEMES[color];

                    let bentoBgStyles = 'bg-slate-900/40 border-slate-800/60';
                    let textAccentClass = 'text-slate-400';
                    let progressHex = '#64748b';

                    if (color === 'RED') {
                      bentoBgStyles = isCurrent ? 'bg-rose-955/20 border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'bg-rose-950/10 border-rose-500/15';
                      textAccentClass = 'text-rose-450';
                      progressHex = '#f43f5e';
                    } else if (color === 'GREEN') {
                      bentoBgStyles = isCurrent ? 'bg-emerald-955/20 border-emerald-500/40 shadow-[0_0_15px_rgba(34,197,94,0.05)]' : 'bg-emerald-950/10 border-emerald-500/15';
                      textAccentClass = 'text-emerald-450';
                      progressHex = '#10b981';
                    } else if (color === 'YELLOW') {
                      bentoBgStyles = isCurrent ? 'bg-amber-955/20 border-amber-500/40 shadow-[0_0_15px_rgba(234,179,8,0.05)]' : 'bg-amber-950/10 border-amber-500/15';
                      textAccentClass = 'text-amber-450';
                      progressHex = '#eab308';
                    } else if (color === 'BLUE') {
                      bentoBgStyles = isCurrent ? 'bg-cyan-955/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.05)]' : 'bg-cyan-950/10 border-cyan-500/15';
                      textAccentClass = 'text-cyan-450';
                      progressHex = '#06b6d4';
                    }

                    return (
                      <div
                        key={color}
                        className={`relative rounded-2xl border p-3.5 flex flex-col justify-between overflow-hidden transition-all duration-300 ${bentoBgStyles} ${isCurrent ? 'ring-1 ring-white/10' : ''}`}
                      >
                        {isCurrent && (
                          <div className={`absolute top-0 right-0 w-12 h-12 ${theme.primary}/10 rounded-bl-full animate-pulse`} />
                        )}
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <div className={`w-8 h-8 rounded-full border-2 ${theme.secondary} p-0.5 shadow-sm`}>
                              <div className={`w-full h-full ${theme.primary} rounded-full flex items-center justify-center text-[10px] font-bold text-white`}>
                                {color.substring(0, 1)}
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                              </span>
                            )}
                          </div>
                          <div className="text-left overflow-hidden flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {gameState.language === 'odia' ? (color === 'RED' ? 'ଖେଳାଳି ୧' : color === 'GREEN' ? 'ଖେଳାଳି ୨' : color === 'YELLOW' ? 'ଖେଳାଳି ୩' : 'ଖେଳାଳି ୪') : `Player ${color}`}
                              </p>
                              {player.type === 'human' && (
                                <span className="text-[8px] leading-none px-1 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 font-extrabold uppercase tracking-widest border border-amber-500/30 flex items-center gap-0.5 shadow-sm scale-90 origin-left">
                                  ⭐ {gameState.language === 'odia' ? 'ଟ୍ରାଏଲ୍' : 'TRIAL'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-100 truncate flex items-center gap-1">
                              {player.name}
                              {player.type === 'human' && (
                                <Sparkles className="w-3 h-3 text-amber-400 shrink-0 inline animate-pulse" />
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Progress meter bar */}
                        <div className="mt-2.5">
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mb-1">
                            <span>{gameState.language === 'odia' ? 'ପ୍ରଗତି' : 'Progress'}</span>
                            <span className="font-mono font-bold">{gameState.language === 'odia' ? toOdiaDigits(progress) : progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900 p-[1px]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: progressHex
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Google Chat Stream Panel integration */}
                <GoogleChatPanel
                  language={gameState.language}
                  onAutoBroadcastToggle={(enabled, space) => {
                    setChatBroadcastEnabled(enabled);
                    setChatSelectedSpace(space);
                  }}
                  gameStateLogs={gameState.logs}
                />
              </div>

              {/* Central high resolution board panel (lg:span-6) */}
              <div className="lg:col-span-6 bg-slate-900/50 rounded-[32px] md:rounded-[40px] border border-slate-800 p-4 md:p-6 flex flex-col items-center justify-center relative shadow-2xl backdrop-blur-sm self-stretch min-h-[460px]">
                <div className="w-full h-full flex items-center justify-center">
                  <GameBoard
                    tokens={gameState.tokens}
                    currentTurn={gameState.currentTurn}
                    movableTokens={movableTokens}
                    bestTokenId={humanBestTokenId}
                    diceValue={gameState.diceValue}
                    onTokenClick={(token) => makeTokenMove(token.color, token.id)}
                    gameStatus={gameState.gameStatus}
                    activePlayersColors={activeColorsList}
                  />
                </div>

                {/* Micro Dialogue Speech card for Folklore Characters */}
                {activeDialogue && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="absolute bottom-5 left-5 right-5 z-20 bg-slate-950/95 border-2 border-amber-500/40 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 backdrop-blur-md"
                  >
                    <span className="text-3xl p-1 bg-amber-500/10 border border-amber-500/20 rounded-xl leading-none shrink-0">
                      {activeDialogue.emoji}
                    </span>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase text-amber-405 tracking-widest leading-none">
                        {activeDialogue.name} {gameState.language === 'odia' ? 'କହୁଛନ୍ତି:' : 'says:'}
                      </p>
                      <p className="text-xs font-bold text-slate-100 mt-1 leading-snug drop-shadow hover:text-white transition font-sans">
                        "{gameState.language === 'odia' ? activeDialogue.textOdia : activeDialogue.textEng}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Logs & Stats side panel (lg:span-3) */}
              <div className="lg:col-span-3 flex flex-col items-stretch">
                <SidebarPanel
                  logs={gameState.logs}
                  tokens={gameState.tokens}
                  players={gameState.players}
                  language={gameState.language}
                  winnerList={gameState.winnerList}
                />
              </div>
            </motion.div>
          )}

          {/* SECTION C: Standard Custom Winners Panel (just if finished) */}
          {gameState.gameStatus === 'winner' && (
            <>
              <ParticleCelebration />
              <motion.div
                key="winner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto text-center bg-slate-900/90 border border-slate-700/40 rounded-3xl p-8 shadow-2xl backdrop-blur relative overflow-hidden"
              >
              {/* Golden confetti orbs */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-500 pointer-events-none" />
              <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-amber-500/10 blur-[50px] pointer-events-none animate-pulse" />

              <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>

              <h1 className="text-3xl font-black text-slate-100 tracking-tight">
                {gameState.language === 'odia' ? 'ଖେଳ ସମାପ୍ତ!' : 'Match Finished!'}
              </h1>
              <p className="text-xs text-slate-400 mt-2">
                {gameState.language === 'odia'
                  ? 'ଅଭିନନ୍ଦନ! ସମସ୍ତ ବିଜେତା ଖେଳ ସମ୍ପୂର୍ଣ୍ଣ କଲେ।'
                  : 'Congratulations to the champions for finishing the board.'}
              </p>

              {/* Leaderboard Stack */}
              <div className="my-6 space-y-2.5">
                {gameState.winnerList.map((col, idx) => {
                  const theme = COLOR_THEMES[col];
                  const player = gameState.players[col];
                  return (
                    <div
                      key={col}
                      className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-amber-400">#{idx + 1}</span>
                        <span className={`w-3.5 h-3.5 rounded-full ${theme.primary} shadow-md`} />
                        <span className="text-sm font-bold text-slate-200">{player.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#f59e0b] bg-amber-500/10 px-2.5 py-1 rounded-full font-extrabold border border-amber-500/20">
                        {idx === 0
                          ? (gameState.language === 'odia' ? 'ପ୍ରଥମ ବିଜେତା' : '1ST PLACE')
                          : (gameState.language === 'odia' ? 'ସମ୍ପୂର୍ଣ୍ଣ' : 'COMPLETED')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <button
                onClick={() => setGameState((g) => ({ ...g, gameStatus: 'setup' }))}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 hover:from-amber-600 hover:to-cyan-600 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-amber-950/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 shrink-0" />
                <span>{gameState.language === 'odia' ? 'ସେଟଅପ୍‌କୁ ଫେରନ୍ତୁ' : 'Back to Setup Menu'}</span>
              </button>
            </motion.div>
          </>
          )}
        </AnimatePresence>
      </main>

      {/* Footer system status */}
      <footer className="max-w-7xl mx-auto w-full border-t border-slate-900/65 pt-3.5 text-center text-[10px] font-mono text-slate-500 shrink-0 select-none">
        <div>
          {gameState.language === 'odia' ? (
            <span>ଓଡ଼ିଆ ଲୁଡୋ ସାମ୍ରାଜ୍ୟ © ୨୦୨୬ | ନୂତନ ଗେମପ୍ଲେ ଡିଜାଇନ୍ | Cloud Server Native</span>
          ) : (
            <span>Odia Ludo Empire © 2026 | New Crafted Experience | Cloud Server Native</span>
          )}
        </div>
      </footer>

      {/* Floating System Dialog / Toast notifications wrapper */}
      <AnimatePresence>
        {activeMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 border border-slate-700/40 backdrop-blur px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <div className="text-left leading-tight">
              <p className="text-xs font-black text-slate-100">
                {gameState.language === 'odia' ? activeMessage : activeMessageEng}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {gameState.language === 'odia' ? activeMessageEng : activeMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
