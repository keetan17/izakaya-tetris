import { BOARD_HEIGHT, BOARD_WIDTH, cloneBoard, createEmptyBoard, randomKind, shapeCells } from "./tetrominoes";
import type { Board, Piece, TetrisSave } from "./types";

export function createInitialTetris(): TetrisSave {
  const currentKind = randomKind();
  return {
    board: createEmptyBoard(),
    finalBoard: null,
    currentPiece: spawnPiece(currentKind),
    score: 0,
    lines: 0,
    nextKind: randomKind(),
    gameOver: false
  };
}

export function spawnPiece(nextKind: Piece["kind"]): Piece {
  return { kind: nextKind, x: 3, y: 0, rotation: 0 };
}

export function collides(board: Board, piece: Piece) {
  return shapeCells(piece.kind, piece.rotation).some((cell) => {
    const x = piece.x + cell.x;
    const y = piece.y + cell.y;
    return x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT || (y >= 0 && board[y][x] !== null);
  });
}

export function mergePiece(board: Board, piece: Piece): Board {
  const next = cloneBoard(board);
  shapeCells(piece.kind, piece.rotation).forEach((cell) => {
    const x = piece.x + cell.x;
    const y = piece.y + cell.y;
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) next[y][x] = piece.kind;
  });
  return next;
}

export function clearLines(board: Board) {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = BOARD_HEIGHT - remaining.length;
  const newRows = Array.from({ length: cleared }, () => Array.from({ length: BOARD_WIDTH }, () => null));
  return { board: [...newRows, ...remaining], cleared };
}

export function renderBoard(board: Board, piece: Piece | null): Board {
  if (!piece) return board;
  const next = cloneBoard(board);
  shapeCells(piece.kind, piece.rotation).forEach((cell) => {
    const x = piece.x + cell.x;
    const y = piece.y + cell.y;
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) next[y][x] = piece.kind;
  });
  return next;
}

export function lineScore(cleared: number) {
  return [0, 100, 300, 500, 800][cleared] ?? cleared * 250;
}
