import { freshDeck } from "./izakaya";
import { cloneBoard } from "./tetrominoes";
import type { Board, IzakayaSave, SavedGameState } from "./types";

const STORAGE_KEY = "izakaya-tetris-state";

const fallbackState: SavedGameState = {
  mode: "start",
  tetris: null,
  izakaya: null
};

export function loadSavedState(): SavedGameState {
  if (typeof window === "undefined") return fallbackState;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallbackState;
  try {
    const parsed = JSON.parse(raw) as SavedGameState;
    return { ...fallbackState, ...parsed };
  } catch {
    return fallbackState;
  }
}

export function saveState(state: SavedGameState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function buildFreshIzakayaState(board: Board): IzakayaSave {
  return {
    board: cloneBoard(board),
    stock: 0,
    foodHistory: [],
    drinkHistory: [],
    mixedHistory: [],
    stats: {
      totalStockEarned: 0,
      foodCount: 0,
      drinkCount: 0,
      usedMinoCount: 0,
      jokerCount: 0,
      aceCount: 0,
      deckCycles: 1
    },
    deck: freshDeck(),
    excludedKinds: [],
    filterOpen: false,
    awaitingAce: false,
    activeMino: null,
    message: "",
    startedAt: Date.now(),
    cleared: false,
    clearedAt: null
  };
}

export function formatDuration(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}分`;
  return `${hours}時間${minutes}分`;
}
