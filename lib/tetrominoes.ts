import type { Board } from "./types";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINO_KINDS = ["I", "O", "T", "S", "Z", "J", "L"] as const;
export type TetrominoKind = (typeof TETROMINO_KINDS)[number];
export type Point = { x: number; y: number };

export const TETROMINO_LABELS: Record<TetrominoKind, string> = {
  I: "Iミノ",
  O: "Oミノ",
  T: "Tミノ",
  S: "Sミノ",
  Z: "Zミノ",
  J: "Jミノ",
  L: "Lミノ"
};

const BASE_SHAPES: Record<TetrominoKind, Point[]> = {
  I: [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 }
  ],
  O: [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 }
  ],
  T: [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 }
  ],
  S: [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
  ],
  Z: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 }
  ],
  J: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 }
  ],
  L: [
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 }
  ]
};

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => null));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function randomKind(): TetrominoKind {
  return TETROMINO_KINDS[Math.floor(Math.random() * TETROMINO_KINDS.length)];
}

export function shapeCells(kind: TetrominoKind, rotation: number): Point[] {
  const turns = ((rotation % 4) + 4) % 4;
  let cells = BASE_SHAPES[kind].map((cell) => ({ ...cell }));
  for (let index = 0; index < turns; index += 1) {
    cells = cells.map((cell) => ({ x: 3 - cell.y, y: cell.x }));
  }
  const minX = Math.min(...cells.map((cell) => cell.x));
  const minY = Math.min(...cells.map((cell) => cell.y));
  return cells.map((cell) => ({ x: cell.x - minX, y: cell.y - minY }));
}

export function pointKey(x: number, y: number) {
  return `${x}:${y}`;
}

export function hasEmptyColumn(board: Board) {
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (board.every((row) => row[x] === null)) return true;
  }
  return false;
}
