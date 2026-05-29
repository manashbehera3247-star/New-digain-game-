import { motion, AnimatePresence } from 'motion/react';
import { Star, ArrowRight, CornerDownRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import {
  PlayerColor,
  Token,
  GridCoord,
  COLOR_THEMES,
  SAFE_ZONES,
  OUTER_PATH
} from '../types';
import {
  getTokenCoordinates,
  isSafeCoordinate,
  calculateTokenStackOffsets
} from '../utils/ludoHelpers';

interface GameBoardProps {
  tokens: Record<PlayerColor, Token[]>;
  currentTurn: PlayerColor;
  movableTokens: Token[];
  bestTokenId?: number | null;
  diceValue?: number;
  onTokenClick: (token: Token) => void;
  gameStatus: 'setup' | 'playing' | 'winner';
  activePlayersColors: PlayerColor[];
}

export default function GameBoard({
  tokens,
  currentTurn,
  movableTokens,
  bestTokenId,
  diceValue,
  onTokenClick,
  gameStatus,
  activePlayersColors
}: GameBoardProps) {
  // Compute stacking offsets
  const tokenOffsets = calculateTokenStackOffsets(tokens);

  // Best path highlight calculations for fast gameplay assistance (Heuristic Sync)
  const bestToken = bestTokenId !== undefined && bestTokenId !== null ? tokens[currentTurn]?.find((t) => t.id === bestTokenId) : null;
  let bestTargetCoord: GridCoord | null = null;
  let bestTargetStep: number | null = null;
  if (bestToken && diceValue) {
    bestTargetStep = bestToken.step === 0 ? 1 : bestToken.step + diceValue;
    if (bestTargetStep <= 57) {
      bestTargetCoord = getTokenCoordinates(currentTurn, bestTargetStep, bestToken.id);
    }
  }

  const isBestTargetHome = bestTargetStep === 57;

  // Helper to check if a token is highlight/movable
  const isMovable = (color: PlayerColor, id: number) => {
    return movableTokens.some((t) => t.color === color && t.id === id);
  };

  // Helper to determine if cell is a standard track cell
  const isYardCell = (r: number, c: number) => {
    if (r >= 0 && r <= 5 && c >= 0 && c <= 5) return 'RED';
    if (r >= 0 && r <= 5 && c >= 9 && c <= 14) return 'GREEN';
    if (r >= 9 && r <= 14 && c >= 0 && c <= 5) return 'BLUE';
    if (r >= 9 && r <= 14 && c >= 9 && c <= 14) return 'YELLOW';
    return null;
  };

  const isCenterCell = (r: number, c: number) => {
    return r >= 6 && r <= 8 && c >= 6 && c <= 8;
  };

  // Check if a coordinate matches home paths or starts
  const getCellColorCustom = (r: number, c: number): PlayerColor | null => {
    // Check Red Home Path: row 7, cols 1..5
    if (r === 7 && c >= 1 && c <= 5) return 'RED';
    // Green Home Path: row 1..5, col 7
    if (c === 7 && r >= 1 && r <= 5) return 'GREEN';
    // Yellow Home Path: row 7, cols 9..13
    if (r === 7 && c >= 9 && c <= 13) return 'YELLOW';
    // Blue Home Path: row 9..13, col 7
    if (c === 7 && r >= 9 && r <= 13) return 'BLUE';

    // Start Squares
    if (r === 6 && c === 1) return 'RED';
    if (r === 1 && c === 8) return 'GREEN';
    if (r === 8 && c === 13) return 'YELLOW';
    if (r === 13 && c === 6) return 'BLUE';

    return null;
  };

  // Render specific star cells on track
  const getStarCell = (r: number, c: number): boolean => {
    // Check if matching any of the 8 safe zones
    const trackIdx = OUTER_PATH.findIndex((p) => p[0] === r && p[1] === c);
    return trackIdx !== -1 && SAFE_ZONES.includes(trackIdx);
  };

  // Direction indicators for start cells to make it look highly designed
  const getStartCellIcon = (color: PlayerColor) => {
    switch (color) {
      case 'RED': return <ArrowRight className="w-2.5 h-2.5 text-white/80" />;
      case 'GREEN': return <ArrowDown className="w-2.5 h-2.5 text-white/80" />;
      case 'YELLOW': return <ArrowLeft className="w-2.5 h-2.5 text-white/80" />;
      case 'BLUE': return <ArrowUp className="w-2.5 h-2.5 text-white/80" />;
    }
  };

  // Render grid individual track square
  const renderTrackCell = (r: number, c: number) => {
    const specialColor = getCellColorCustom(r, c);
    const hasStar = getStarCell(r, c);

    let cellBg = 'bg-slate-900 border-slate-800/65';
    let cellGlowColors = '';

    if (specialColor === 'RED') {
      cellBg = 'bg-rose-950/45 border-rose-800/50';
      cellGlowColors = 'after:bg-rose-500/10';
    } else if (specialColor === 'GREEN') {
      cellBg = 'bg-emerald-950/45 border-emerald-800/50';
      cellGlowColors = 'after:bg-emerald-500/10';
    } else if (specialColor === 'YELLOW') {
      cellBg = 'bg-amber-950/40 border-amber-800/40';
      cellGlowColors = 'after:bg-amber-500/10';
    } else if (specialColor === 'BLUE') {
      cellBg = 'bg-cyan-950/45 border-cyan-800/50';
      cellGlowColors = 'after:bg-cyan-500/10';
    }

    const isBestPathDestination = bestTargetCoord && bestTargetCoord[0] === r && bestTargetCoord[1] === c;

    return (
      <div
        key={`cell-${r}-${c}`}
        style={{ gridRowStart: r + 1, gridColumnStart: c + 1 }}
        className={`relative aspect-square border ${cellBg} flex items-center justify-center transition-all duration-300 shadow-inner rounded-md m-[1px] select-none ${cellGlowColors}`}
      >
        {/* Subtle grid coords for debugging or mono aesthetic */}
        <span className="absolute bottom-[1px] right-[1px] text-[6px] font-mono text-slate-700/60 leading-none">
          {r},{c}
        </span>

        {/* Dynamic best path target highlight inside track cell */}
        {isBestPathDestination && (
          <motion.div
            initial={{ opacity: 0, scale: 0.55 }}
            animate={{ opacity: 1, scale: [0.93, 1.05, 0.93] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="absolute inset-[1px] z-10 border border-dashed border-amber-400 rounded-lg bg-amber-500/15 pointer-events-none flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.25)]"
          >
            <div className="w-1 h-1 rounded-full bg-amber-400 animate-ping absolute" />
            <span className="text-[6.5px] font-black text-amber-300 uppercase tracking-wider scale-90 select-none bg-slate-950/95 px-1 py-0.5 rounded leading-none border border-amber-500/20 translate-y-1.5 shadow">
              GOAL
            </span>
          </motion.div>
        )}

        {/* Start cell indication */}
        {specialColor && (r === 6 && c === 1 || r === 1 && c === 8 || r === 8 && c === 13 || r === 13 && c === 6) && (
          <div className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: COLOR_THEMES[specialColor].hex }}>
            {getStartCellIcon(specialColor)}
          </div>
        )}

        {/* Safe Star indication */}
        {hasStar && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]"
          >
            <Star className="w-4 h-4 fill-amber-500/80 stroke-amber-400" />
          </motion.div>
        )}
      </div>
    );
  };

  // Render 6x6 player yard card
  const renderYard = (color: PlayerColor) => {
    const theme = COLOR_THEMES[color];
    const isOwnerActive = activePlayersColors.includes(color);

    const positionStyles = {
      RED: { gridArea: '1 / 1 / 7 / 7' },
      GREEN: { gridArea: '1 / 10 / 7 / 16' },
      BLUE: { gridArea: '10 / 1 / 16 / 7' },
      YELLOW: { gridArea: '10 / 10 / 16 / 16' }
    };

    return (
      <div
        key={`yard-${color}`}
        style={positionStyles[color]}
        className={`relative rounded-3xl border-2 transition-all duration-500 shadow-xl overflow-hidden backdrop-blur flex items-center justify-center ${
          isOwnerActive
            ? `${theme.secondary}/40 bg-slate-900/40`
            : 'border-slate-800/15 bg-slate-950/20 grayscale opacity-40'
        }`}
      >
        {/* Abstract design elements */}
        <div className={`absolute -top-12 -left-12 w-28 h-28 rounded-full ${theme.primary}/10 blur-xl`} />
        <div className={`absolute -bottom-12 -right-12 w-28 h-28 rounded-full ${theme.primary}/10 blur-xl`} />

        {/* High design launcher base */}
        <div className={`w-3/4 h-3/4 rounded-2xl border ${theme.secondary}/45 bg-slate-950/70 p-3 shadow-inner flex flex-col items-center justify-center gap-2`}>
          <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5 w-full justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${theme.primary} shadow-md`} />
            <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-sans">
              {color} BASE
            </h4>
          </div>

          {/* Slots for 4 tokens to sit neatly in yard */}
          <div className="grid grid-cols-2 gap-3 p-1">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-9 h-9 rounded-full border border-slate-800 bg-slate-900/60 flex items-center justify-center relative shadow-inner`}
              >
                {/* Visual copper alignment rings */}
                <div className={`absolute inset-1.5 rounded-full border border-dashed ${theme.secondary}/10`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Clean Meeting Triangles in the center 3x3
  const renderHomeTriangle = () => {
    return (
      <div
        style={{ gridArea: '7 / 7 / 10 / 10' }}
        className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl m-[1.5px]"
      >
        {/* Dynamic center diamond core */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-5 h-5 bg-slate-900 border border-amber-500/50 rounded-full flex items-center justify-center shadow-lg transform rotate-45 select-none animate-pulse">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </div>
        </div>

        {/* Red Home Triangle - Left */}
        <div
          className={`absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r border-slate-850 transition-colors duration-300 ${
            isBestTargetHome && currentTurn === 'RED'
              ? 'bg-rose-500/35 border-amber-400 ring-2 ring-amber-400/40 animate-pulse'
              : 'bg-rose-600/15'
          }`}
          style={{ clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)' }}
        >
          <div className="absolute top-1/2 left-3 transform -translate-y-1/2 flex flex-col items-center gap-0.5">
            <span className={`text-[8px] font-black ${isBestTargetHome && currentTurn === 'RED' ? 'text-amber-300' : 'text-rose-400/80'}`}>RED</span>
          </div>
        </div>

        {/* Green Home Triangle - Top */}
        <div
          className={`absolute inset-x-0 top-0 h-1/2 overflow-hidden border-b border-slate-850 transition-colors duration-300 ${
            isBestTargetHome && currentTurn === 'GREEN'
              ? 'bg-emerald-500/35 border-amber-400 ring-2 ring-amber-400/40 animate-pulse'
              : 'bg-emerald-600/15'
          }`}
          style={{ clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)' }}
        >
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-0.5">
            <span className={`text-[8px] font-black ${isBestTargetHome && currentTurn === 'GREEN' ? 'text-amber-300' : 'text-emerald-400/80'}`}>GREEN</span>
          </div>
        </div>

        {/* Yellow Home Triangle - Right */}
        <div
          className={`absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l border-slate-850 transition-colors duration-300 ${
            isBestTargetHome && currentTurn === 'YELLOW'
              ? 'bg-amber-500/35 border-amber-400 ring-2 ring-amber-400/40 animate-pulse'
              : 'bg-amber-500/15'
          }`}
          style={{ clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)' }}
        >
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2 flex flex-col items-center gap-0.5">
            <span className={`text-[8px] font-black ${isBestTargetHome && currentTurn === 'YELLOW' ? 'text-amber-300' : 'text-amber-400/80'}`}>YELLOW</span>
          </div>
        </div>

        {/* Blue Home Triangle - Bottom */}
        <div
          className={`absolute inset-x-0 bottom-0 h-1/2 overflow-hidden border-t border-slate-850 transition-colors duration-300 ${
            isBestTargetHome && currentTurn === 'BLUE'
              ? 'bg-cyan-500/35 border-amber-400 ring-2 ring-amber-400/40 animate-pulse'
              : 'bg-cyan-600/15'
          }`}
          style={{ clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)' }}
        >
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-0.5">
            <span className={`text-[8px] font-black ${isBestTargetHome && currentTurn === 'BLUE' ? 'text-amber-300' : 'text-cyan-400/80'}`}>BLUE</span>
          </div>
        </div>
      </div>
    );
  };

  // Generate 2D array coordinates for rendering track cells
  const getTrackCellsCoords = (): { r: number; c: number }[] => {
    const list: { r: number; c: number }[] = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (!isYardCell(r, c) && !isCenterCell(r, c)) {
          list.push({ r, c });
        }
      }
    }
    return list;
  };

  const trackCells = getTrackCellsCoords();

  return (
    <div className="relative w-full aspect-square max-w-[500px] bg-slate-950 p-2.5 md:p-4 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden self-center">
      {/* Visual cyber mesh wallpaper */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      {/* Grid container */}
      <div className="relative w-full h-full grid grid-cols-15 grid-rows-15">
        {/* 1. Large Yard Groups */}
        {renderYard('RED')}
        {renderYard('GREEN')}
        {renderYard('YELLOW')}
        {renderYard('BLUE')}

        {/* 2. Middle Triangle Group */}
        {renderHomeTriangle()}

        {/* 3. Individual track squares */}
        {trackCells.map(({ r, c }) => renderTrackCell(r, c))}

        {/* 4. Active Interactive Tokens Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none w-full h-full">
          <div className="relative w-full h-full grid grid-cols-15 grid-rows-15">
            <AnimatePresence>
              {(['RED', 'GREEN', 'YELLOW', 'BLUE'] as PlayerColor[]).map((color) => {
                const theme = COLOR_THEMES[color];

                return tokens[color].map((token) => {
                  const coord = getTokenCoordinates(color, token.step, token.id);
                  const isTokenMovable = isMovable(color, token.id);
                  const offset = tokenOffsets[`${color}_${token.id}`] || {
                    scale: 1,
                    translateX: 0,
                    translateY: 0
                  };

                  // Layout calculations in 15x15 percentage positions
                  const colPercentage = (coord[1] / 15) * 100;
                  const rowPercentage = (coord[0] / 15) * 100;

                  const isBestMove = color === currentTurn && token.id === bestTokenId;

                  return (
                    <motion.div
                      key={`token-${color}-${token.id}`}
                      initial={{ opacity: 0, scale: 0.1 }}
                      animate={{
                        opacity: 1,
                        x: `calc(${colPercentage}% + ${offset.translateX}px)`,
                        y: `calc(${rowPercentage}% + ${offset.translateY}px)`,
                        scale: offset.scale,
                        zIndex: isBestMove ? 60 : (isTokenMovable ? 50 : 30)
                      }}
                      exit={{ opacity: 0, scale: 0.2 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                      style={{
                        position: 'absolute',
                        width: 'calc(100% / 15 - 2px)',
                        aspectRatio: '1',
                        left: '1px',
                        top: '1px'
                      }}
                      className="flex items-center justify-center p-[2px]"
                    >
                      <motion.button
                        disabled={!isTokenMovable}
                        onClick={() => onTokenClick(token)}
                        className={`pointer-events-auto rounded-full aspect-square w-full shadow-lg border border-white/20 transition-all flex items-center justify-center relative cursor-pointer ${theme.primary} ${
                          isTokenMovable
                            ? isBestMove
                              ? 'ring-4 ring-amber-450 ring-offset-2 ring-offset-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.85)]'
                              : 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 shadow-amber-500/20'
                            : ''
                        }`}
                        // Bounces and sparkles if player needs to move this specific token!
                        animate={
                          isTokenMovable
                            ? isBestMove
                              ? {
                                  y: [-5, 5, -5],
                                  scale: [1.1, 1.18, 1.1]
                                }
                              : {
                                  y: [-3, 3, -3],
                                  scale: [1.02, 1.08, 1.02]
                                }
                            : {}
                        }
                        transition={
                          isTokenMovable
                            ? {
                                y: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
                                scale: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }
                              }
                            : {}
                        }
                      >
                        {/* Token Core */}
                        <div className="w-4 h-4 rounded-full bg-white/30 backdrop-blur-sm shadow-inner flex items-center justify-center border border-white/20">
                          {/* Inner gold circular core */}
                          <div className="w-1.5 h-1.5 rounded-full bg-white/95" />
                        </div>

                        {/* Recommendation label for fast play assist */}
                        {isBestMove && (
                          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[6.5px] font-black px-1.5 py-[1px] rounded-full uppercase tracking-wider shadow-md border border-amber-300 flex items-center gap-0.5 z-50 pointer-events-none select-none">
                            ⭐ BEST
                          </span>
                        )}

                        {/* Sparkle ring for active movable token */}
                        {isTokenMovable && (
                          <span className={`absolute -inset-0.5 rounded-full bg-white/25 animate-ping opacity-75 ${isBestMove ? 'bg-amber-400/45' : ''}`} />
                        )}

                        {/* Small number count on top of coin to identify which coin it is */}
                        <span className="absolute bottom-[1px] right-[2px] text-[7px] font-black text-white/50 select-none font-mono">
                          {token.id + 1}
                        </span>
                      </motion.button>
                    </motion.div>
                  );
                });
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
