"use client";

import { useEffect, useMemo, useState } from "react";
import { freshDeck, placementKeys, removeMinoAt, validRemovalAnchors } from "@/lib/izakaya";
import { hasEmptyColumn, pointKey, type TetrominoKind } from "@/lib/tetrominoes";
import type { Card, FoodDrinkKind, IzakayaSave } from "@/lib/types";

export function useIzakayaGame(state: IzakayaSave, onChange: (state: IzakayaSave) => void) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!state.activeMino || state.cleared) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [state.activeMino, state.cleared]);

  useEffect(() => {
    if (!state.activeMino || state.cleared) return;
    if (now < state.activeMino.deadline) return;
    onChange({
      ...state,
      activeMino: null,
      message: "時間切れ！"
    });
  }, [now, onChange, state]);

  const activePlacement = useMemo(() => {
    if (!state.activeMino) return undefined;
    const anchors = validRemovalAnchors(state.board, state.activeMino.kind, state.activeMino.rotation);
    const keys = new Set<string>();
    anchors.forEach((anchor) => {
      placementKeys(state.activeMino!.kind, state.activeMino!.rotation, anchor.x, anchor.y).forEach((key) => keys.add(key));
    });
    return keys;
  }, [state.activeMino, state.board]);

  const validAnchors = useMemo(() => {
    if (!state.activeMino) return [];
    return validRemovalAnchors(state.board, state.activeMino.kind, state.activeMino.rotation);
  }, [state.activeMino, state.board]);

  const remainingSeconds = state.activeMino ? Math.max(0, Math.ceil((state.activeMino.deadline - now) / 1000)) : 0;
  const neededStock = 1 + state.excludedKinds.length;
  const canDraw = !state.cleared && !state.activeMino && !state.awaitingAce && state.stock >= neededStock && eligibleDeck(state.deck, state.excludedKinds).length > 0;

  const update = (patch: Partial<IzakayaSave>) => onChange({ ...state, ...patch });

  const addStock = (kind: FoodDrinkKind, text: string) => {
    const clean = text.trim();
    onChange({
      ...state,
      stock: state.stock + 1,
      foodHistory: kind === "food" ? [...state.foodHistory, clean] : state.foodHistory,
      drinkHistory: kind === "drink" ? [...state.drinkHistory, clean] : state.drinkHistory,
      mixedHistory: [...state.mixedHistory, { kind, text: clean }],
      stats: {
        ...state.stats,
        totalStockEarned: state.stats.totalStockEarned + 1,
        foodCount: state.stats.foodCount + (kind === "food" ? 1 : 0),
        drinkCount: state.stats.drinkCount + (kind === "drink" ? 1 : 0)
      },
      message: clean ? `${clean} を記録しました` : "ストックを追加しました"
    });
  };

  const toggleExcluded = (kind: TetrominoKind) => {
    const exists = state.excludedKinds.includes(kind);
    const excludedKinds = exists ? state.excludedKinds.filter((item) => item !== kind) : [...state.excludedKinds, kind];
    update({ excludedKinds });
  };

  const drawCard = () => {
    if (!canDraw) return;
    let deck = state.deck;
    let deckCycles = state.stats.deckCycles;
    if (deck.length === 0) {
      deck = freshDeck();
      deckCycles += 1;
    }
    const eligibleIndices = eligibleDeckIndices(deck, state.excludedKinds);
    if (eligibleIndices.length === 0) {
      update({ message: "抽選できるカードがありません" });
      return;
    }
    const removeIndex = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
    const picked = deck[removeIndex] as Card;
    const nextDeck = deck.filter((_, index) => index !== removeIndex);
    const base = {
      ...state,
      deck: nextDeck.length === 0 ? freshDeck() : nextDeck,
      stock: state.stock - neededStock,
      excludedKinds: [],
      filterOpen: false,
      stats: { ...state.stats, deckCycles: nextDeck.length === 0 ? deckCycles + 1 : deckCycles }
    };

    if (picked === "joker") {
      onChange({
        ...base,
        message: "食べ損・飲み損！",
        stats: {
          ...base.stats,
          jokerCount: base.stats.jokerCount + 1
        }
      });
      return;
    }
    if (picked === "ace") {
      onChange({
        ...base,
        awaitingAce: true,
        message: "エース！好きなミノを選べます",
        stats: {
          ...base.stats,
          aceCount: base.stats.aceCount + 1
        }
      });
      return;
    }
    activateMino(base, picked);
  };

  const chooseAce = (kind: TetrominoKind) => {
    if (!state.awaitingAce) return;
    activateMino({ ...state, awaitingAce: false }, kind);
  };

  const activateMino = (nextState: IzakayaSave, kind: TetrominoKind) => {
    const deadline = Date.now() + 3000;
    const anchors = validRemovalAnchors(nextState.board, kind, 0);
    onChange({
      ...nextState,
      activeMino: { kind, rotation: 0, deadline },
      message: anchors.length > 0 ? `${kind}ミノ確定。3秒以内に選択！` : "削除可能な場所がありません",
      stats: {
        ...nextState.stats,
        usedMinoCount: nextState.stats.usedMinoCount + 1
      }
    });
  };

  const rotateActive = () => {
    if (!state.activeMino) return;
    update({ activeMino: { ...state.activeMino, rotation: state.activeMino.rotation + 1 } });
  };

  const tryRemoveAt = (x: number, y: number) => {
    if (!state.activeMino || state.cleared) return;
    const anchorKey = pointKey(x, y);
    if (!validAnchors.some((anchor) => pointKey(anchor.x, anchor.y) === anchorKey)) return;
    const result = removeMinoAt(state.board, state.activeMino.kind, state.activeMino.rotation, x, y);
    onChange({
      ...state,
      board: result.board,
      activeMino: null,
      cleared: result.cleared || hasEmptyColumn(result.board),
      clearedAt: result.cleared || hasEmptyColumn(result.board) ? Date.now() : state.clearedAt,
      message: result.cleared || hasEmptyColumn(result.board) ? "居酒屋テトリス成功！" : "4マス削除しました"
    });
  };

  return {
    addStock,
    toggleExcluded,
    setFilterOpen: (filterOpen: boolean) => update({ filterOpen }),
    drawCard,
    chooseAce,
    rotateActive,
    tryRemoveAt,
    activePlacement,
    validAnchors,
    remainingSeconds,
    canDraw
  };
}

function eligibleDeck(deck: Card[], excluded: TetrominoKind[]) {
  return deck.filter((card) => card === "ace" || card === "joker" || !excluded.includes(card));
}

function eligibleDeckIndices(deck: Card[], excluded: TetrominoKind[]) {
  return deck.flatMap((card, index) => (card === "ace" || card === "joker" || !excluded.includes(card) ? [index] : []));
}
