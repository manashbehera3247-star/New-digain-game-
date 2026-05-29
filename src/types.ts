export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export type PlayerType = 'human' | 'bot' | 'inactive';

export interface Player {
  color: PlayerColor;
  name: string;
  type: PlayerType;
  isActive: boolean;
  characterId?: string;
}

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // 0 (yard), 1-51 (outer track), 52-56 (home path), 57 (finished/home)
}

export interface LogEntry {
  id: string;
  timestamp: string;
  messageOdia: string;
  messageEnglish: string;
  type: 'roll' | 'move' | 'kill' | 'home' | 'status' | 'win';
}

export interface GameState {
  players: Record<PlayerColor, Player>;
  tokens: Record<PlayerColor, Token[]>;
  currentTurn: PlayerColor;
  diceValue: number;
  isRolling: boolean;
  hasRolled: boolean;
  consecutiveSixes: number;
  gameStatus: 'setup' | 'playing' | 'winner';
  winnerList: PlayerColor[];
  logs: LogEntry[];
  voiceEnabled: boolean;
  language: 'odia' | 'english';
}

// 15x15 board definitions
export type GridCoord = [number, number]; // [row, col]

export const OUTER_PATH: GridCoord[] = [
  [6, 1],   // 0: Red Start
  [6, 2],   // 1
  [6, 3],   // 2
  [6, 4],   // 3
  [6, 5],   // 4
  [5, 6],   // 5
  [4, 6],   // 6
  [3, 6],   // 7
  [2, 6],   // 8 (Safe Zone)
  [1, 6],   // 9
  [0, 6],   // 10
  [0, 7],   // 11 (Apex/Green Home Adjacency)
  [0, 8],   // 12
  [1, 8],   // 13: Green Start (Safe Zone)
  [2, 8],   // 14
  [3, 8],   // 15
  [4, 8],   // 16
  [5, 8],   // 17
  [6, 9],   // 18
  [6, 10],  // 19
  [6, 11],  // 20
  [6, 12],  // 21 (Safe Zone)
  [6, 13],  // 22
  [6, 14],  // 23
  [7, 14],  // 24 (Apex/Yellow Home Adjacency)
  [8, 14],  // 25
  [8, 13],  // 26: Yellow Start (Safe Zone)
  [8, 12],  // 27
  [8, 11],  // 28
  [8, 10],  // 29
  [8, 9],   // 30
  [9, 8],   // 31
  [10, 8],  // 32
  [11, 8],  // 33
  [12, 8],  // 34 (Safe Zone)
  [13, 8],  // 35
  [14, 8],  // 36
  [14, 7],  // 37 (Apex/Blue Home Adjacency)
  [14, 6],  // 38
  [13, 6],  // 39: Blue Start (Safe Zone)
  [12, 6],  // 40
  [11, 6],  // 41
  [10, 6],  // 42
  [9, 6],   // 43
  [8, 5],   // 44
  [8, 4],   // 45
  [8, 3],   // 46
  [8, 2],   // 47 (Safe Zone)
  [8, 1],   // 48
  [8, 0],   // 49
  [7, 0],   // 50 (Apex/Red Home Adjacency)
  [6, 0]    // 51
];

// Start offsets
export const START_INDEX: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39
};

// Home entrance indices on the absolute OUTER_PATH (last cell before home path)
export const HOME_ENTRANCE_INDEX: Record<PlayerColor, number> = {
  RED: 50,
  GREEN: 11,
  YELLOW: 24,
  BLUE: 37
};

// Safe zones indices on the absolute OUTER_PATH
export const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home paths for each player (5 steps each)
export const HOME_PATHS: Record<PlayerColor, GridCoord[]> = {
  RED: [
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5]
  ],
  GREEN: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7]
  ],
  YELLOW: [
    [7, 13],
    [7, 12],
    [7, 11],
    [7, 10],
    [7, 9]
  ],
  BLUE: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7]
  ]
};

// Yard coords for the 4 tokens of each player in their base
export const YARD_COORDS: Record<PlayerColor, GridCoord[]> = {
  RED: [
    [2, 2],
    [2, 3],
    [3, 2],
    [3, 3]
  ],
  GREEN: [
    [2, 11],
    [2, 12],
    [3, 11],
    [3, 12]
  ],
  YELLOW: [
    [11, 11],
    [11, 12],
    [12, 11],
    [12, 12]
  ],
  BLUE: [
    [11, 2],
    [11, 3],
    [12, 2],
    [12, 3]
  ]
};

// Home Triangles grid areas or target positions (row, col) at center of 15x15 grid
export const HOME_TRIANGLE_COORDS: Record<PlayerColor, GridCoord> = {
  RED: [7, 6],
  GREEN: [6, 7],
  YELLOW: [7, 8],
  BLUE: [8, 7]
};

export const COLOR_THEMES: Record<PlayerColor, {
  nameOdia: string;
  nameEng: string;
  primary: string;
  secondary: string;
  bgLight: string;
  text: string;
  hex: string;
  btnHover: string;
}> = {
  RED: {
    nameOdia: 'ଲାଲ୍',
    nameEng: 'Red',
    primary: 'bg-rose-600',
    secondary: 'border-rose-400',
    bgLight: 'bg-rose-50',
    text: 'text-rose-600',
    hex: '#e11d48',
    btnHover: 'hover:bg-rose-700'
  },
  GREEN: {
    nameOdia: 'ସବୁଜ',
    nameEng: 'Green',
    primary: 'bg-emerald-600',
    secondary: 'border-emerald-400',
    bgLight: 'bg-emerald-50',
    text: 'text-emerald-700',
    hex: '#059669',
    btnHover: 'hover:bg-emerald-700'
  },
  YELLOW: {
    nameOdia: 'ହଳଦିଆ',
    nameEng: 'Yellow',
    primary: 'bg-amber-500',
    secondary: 'border-amber-300',
    bgLight: 'bg-amber-50',
    text: 'text-amber-600',
    hex: '#f59e0b',
    btnHover: 'hover:bg-amber-600'
  },
  BLUE: {
    nameOdia: 'ନୀଳ',
    nameEng: 'Blue',
    primary: 'bg-cyan-600',
    secondary: 'border-cyan-400',
    bgLight: 'bg-cyan-50',
    text: 'text-cyan-700',
    hex: '#0891b2',
    btnHover: 'hover:bg-cyan-700'
  }
};
