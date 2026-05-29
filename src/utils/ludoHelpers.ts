import {
  PlayerColor,
  Token,
  START_INDEX,
  HOME_ENTRANCE_INDEX,
  OUTER_PATH,
  HOME_PATHS,
  YARD_COORDS,
  HOME_TRIANGLE_COORDS,
  SAFE_ZONES,
  GridCoord
} from '../types';

/**
 * Calculates the exact row and column coordinate for a token
 */
export function getTokenCoordinates(color: PlayerColor, step: number, tokenId: number): GridCoord {
  // Yard position
  if (step === 0) {
    return YARD_COORDS[color][tokenId];
  }

  // Absolute finished home position
  if (step === 57) {
    return HOME_TRIANGLE_COORDS[color];
  }

  // Home path (steps 52 to 56)
  if (step >= 52 && step <= 56) {
    const index = step - 52;
    return HOME_PATHS[color][index];
  }

  // Outer track (steps 1 to 51)
  const startIndex = START_INDEX[color];
  const absoluteIndex = (startIndex + (step - 1)) % 52;
  return OUTER_PATH[absoluteIndex];
}

/**
 * Checks if a token can legally move with a specific roll value
 */
export function canMoveToken(token: Token, rollValue: number): boolean {
  if (token.step === 57) {
    return false; // Already finished
  }

  if (token.step === 0) {
    return rollValue === 6; // To move out of yard requires a six
  }

  return token.step + rollValue <= 57; // Cannot overshoot the home slot
}

/**
 * Returns a list of tokens that can move for a player
 */
export function getMovableTokens(tokensList: Token[], rollValue: number): Token[] {
  return tokensList.filter((token) => canMoveToken(token, rollValue));
}

/**
 * Structure to represent a cell key for stacking calculation
 */
export interface StackOffset {
  scale: number;
  translateX: number;
  translateY: number;
}

/**
 * Computes rendering size scaling and relative pixel offsets for overlapping tokens
 */
export function calculateTokenStackOffsets(
  tokens: Record<PlayerColor, Token[]>
): Record<string, StackOffset> {
  // Map coordinator key to lists of token descriptive strings
  const coordinateMap: Record<string, { color: PlayerColor; id: number }[]> = {};

  // Group tokens by coordinate
  Object.keys(tokens).forEach((colorKey) => {
    const color = colorKey as PlayerColor;
    tokens[color].forEach((t) => {
      const coord = getTokenCoordinates(color, t.step, t.id);
      // Key format: rX_cY
      let key = `r${coord[0]}c${coord[1]}`;
      
      // If yard, make it unique to avoid stacking across different yards even if same grid, 
      // though yards are naturally physically separated.
      if (t.step === 0) {
        key = `yard_${color}_${t.id}`;
      }
      
      // For finished tokens, stack them nicely in the home triangle area
      if (t.step === 57) {
        key = `home_${color}`;
      }

      if (!coordinateMap[key]) {
        coordinateMap[key] = [];
      }
      coordinateMap[key].push({ color, id: t.id });
    });
  });

  const offsets: Record<string, StackOffset> = {};

  // For each coordinate, compute positions
  Object.keys(coordinateMap).forEach((coordKey) => {
    const grouped = coordinateMap[coordKey];
    const len = grouped.length;

    if (len === 1) {
      const item = grouped[0];
      offsets[`${item.color}_${item.id}`] = { scale: 1.0, translateX: 0, translateY: 0 };
    } else {
      // Arrange multiple tokens in a tiny circular pattern or grid within the cell
      grouped.forEach((item, index) => {
        let translateX = 0;
        let translateY = 0;
        let scale = 0.85;

        if (coordKey.startsWith('home_')) {
          // Inside home triangle, display them fanned or offset
          scale = 0.75;
          const angle = (index * 2 * Math.PI) / len;
          // Radius in pixels
          const radius = 12;
          translateX = Math.round(Math.cos(angle) * radius);
          translateY = Math.round(Math.sin(angle) * radius);
        } else {
          // On cells or safe zones
          scale = len > 3 ? 0.6 : 0.75;
          const angle = (index * 2 * Math.PI) / len;
          const radius = len > 3 ? 10 : 8;
          translateX = Math.round(Math.cos(angle) * radius);
          translateY = Math.round(Math.sin(angle) * radius);
        }

        offsets[`${item.color}_${item.id}`] = { scale, translateX, translateY };
      });
    }
  });

  return offsets;
}

/**
 * Get random dice value [1-6]
 */
export function getDiceRoll(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Checks if a coordinate is a double/safe spot
 */
export function isSafeCoordinate(row: number, col: number): boolean {
  for (let s of OUTER_PATH) {
    // If it falls inside the standard outer path safe indices
    const idx = OUTER_PATH.findIndex((p) => p[0] === row && p[1] === col);
    if (idx !== -1 && SAFE_ZONES.includes(idx)) {
      return true;
    }
  }
  return false;
}
