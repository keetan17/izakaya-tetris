import { BOARD_HEIGHT, BOARD_WIDTH, cloneBoard, hasEmptyColumn, pointKey, shapeCells, TETROMINO_KINDS, type TetrominoKind } from "./tetrominoes";
import type { Board, Card } from "./types";

export function freshDeck(): Card[] {
  return shuffle([...TETROMINO_KINDS, "ace", "ace", "joker"]);
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function validRemovalAnchors(board: Board, kind: TetrominoKind, rotation: number) {
  const shape = shapeCells(kind, rotation);
  const anchors: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const valid = shape.every((cell) => {
        const tx = x + cell.x;
        const ty = y + cell.y;
        return tx >= 0 && tx < BOARD_WIDTH && ty >= 0 && ty < BOARD_HEIGHT && board[ty][tx] !== null;
      });
      if (valid) anchors.push({ x, y });
    }
  }
  return anchors;
}

export function removeMinoAt(board: Board, kind: TetrominoKind, rotation: number, x: number, y: number) {
  const valid = validRemovalAnchors(board, kind, rotation).some((anchor) => anchor.x === x && anchor.y === y);
  if (!valid) return { board, cleared: hasEmptyColumn(board), removed: false };
  const next = cloneBoard(board);
  shapeCells(kind, rotation).forEach((cell) => {
    next[y + cell.y][x + cell.x] = null;
  });
  return { board: next, cleared: hasEmptyColumn(next), removed: true };
}

export function placementKeys(kind: TetrominoKind, rotation: number, x: number, y: number) {
  return new Set(shapeCells(kind, rotation).map((cell) => pointKey(x + cell.x, y + cell.y)));
}
