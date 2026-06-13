import type { TetrominoKind } from "./tetrominoes";

export type AppMode = "start" | "tetris" | "izakaya" | "result";
export type Cell = TetrominoKind | null;
export type Board = Cell[][];
export type FoodDrinkKind = "food" | "drink";
export type Card = TetrominoKind | "ace" | "joker";

export type Piece = {
  kind: TetrominoKind;
  x: number;
  y: number;
  rotation: number;
};

export type TetrisSave = {
  board: Board;
  finalBoard: Board | null;
  currentPiece: Piece | null;
  score: number;
  lines: number;
  nextKind: TetrominoKind;
  gameOver: boolean;
};

export type IzakayaStats = {
  totalStockEarned: number;
  foodCount: number;
  drinkCount: number;
  usedMinoCount: number;
  jokerCount: number;
  aceCount: number;
  deckCycles: number;
};

export type ActiveMino = {
  kind: TetrominoKind;
  rotation: number;
  deadline: number;
};

export type IzakayaSave = {
  board: Board;
  stock: number;
  foodHistory: string[];
  drinkHistory: string[];
  mixedHistory: Array<{ kind: FoodDrinkKind; text: string }>;
  stats: IzakayaStats;
  deck: Card[];
  excludedKinds: TetrominoKind[];
  filterOpen: boolean;
  awaitingAce: boolean;
  activeMino: ActiveMino | null;
  message: string;
  startedAt: number;
  cleared: boolean;
  clearedAt: number | null;
};

export type SavedGameState = {
  mode: AppMode;
  tetris: TetrisSave | null;
  izakaya: IzakayaSave | null;
};
