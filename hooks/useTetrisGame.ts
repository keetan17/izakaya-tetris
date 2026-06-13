"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collides, createInitialTetris, clearLines, lineScore, mergePiece, renderBoard, spawnPiece } from "@/lib/tetris";
import { randomKind } from "@/lib/tetrominoes";
import type { Piece, TetrisSave } from "@/lib/types";

export function useTetrisGame(saved?: TetrisSave) {
  const initial = saved ?? createInitialTetris();
  const [board, setBoard] = useState(initial.board);
  const [current, setCurrent] = useState<Piece | null>(() => (initial.gameOver ? null : initial.currentPiece));
  const [nextKind, setNextKind] = useState(initial.nextKind);
  const [score, setScore] = useState(initial.score);
  const [lines, setLines] = useState(initial.lines);
  const [gameOver, setGameOver] = useState(initial.gameOver);
  const [finalBoard, setFinalBoard] = useState(initial.finalBoard);

  const lockAndSpawn = useCallback((piece: Piece) => {
    setBoard((lockedBoard) => {
      const merged = mergePiece(lockedBoard, piece);
      const result = clearLines(merged);
      if (result.cleared > 0) {
        setScore((value) => value + lineScore(result.cleared));
        setLines((value) => value + result.cleared);
      }
      const kindForSpawn = nextKind;
      const nextPiece = spawnPiece(kindForSpawn);
      const upcoming = randomKind();
      setNextKind(upcoming);
      if (collides(result.board, nextPiece)) {
        setCurrent(null);
        setGameOver(true);
        setFinalBoard(result.board);
      } else {
        setCurrent(nextPiece);
      }
      return result.board;
    });
  }, [nextKind]);

  const softDrop = useCallback(() => {
    if (gameOver || !current) return;
    const moved = { ...current, y: current.y + 1 };
    if (collides(board, moved)) lockAndSpawn(current);
    else setCurrent(moved);
    setScore((value) => value + 1);
  }, [board, current, gameOver, lockAndSpawn]);

  const move = useCallback((direction: -1 | 1) => {
    if (gameOver || !current) return;
    const moved = { ...current, x: current.x + direction };
    if (!collides(board, moved)) setCurrent(moved);
  }, [board, current, gameOver]);

  const rotate = useCallback(() => {
    if (gameOver || !current) return;
    const rotated = { ...current, rotation: current.rotation + 1 };
    const kicks = [0, -1, 1, -2, 2];
    const candidate = kicks.map((kick) => ({ ...rotated, x: rotated.x + kick })).find((piece) => !collides(board, piece));
    if (candidate) setCurrent(candidate);
  }, [board, current, gameOver]);

  const hardDrop = useCallback(() => {
    if (gameOver || !current) return;
    let dropped = current;
    let distance = 0;
    while (!collides(board, { ...dropped, y: dropped.y + 1 })) {
      dropped = { ...dropped, y: dropped.y + 1 };
      distance += 1;
    }
    setScore((value) => value + distance * 2);
    lockAndSpawn(dropped);
  }, [board, current, gameOver, lockAndSpawn]);

  useEffect(() => {
    if (gameOver) return;
    const id = window.setInterval(softDrop, 720);
    return () => window.clearInterval(id);
  }, [gameOver, softDrop]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowDown") softDrop();
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "z") rotate();
      if (event.code === "Space") {
        event.preventDefault();
        hardDrop();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hardDrop, move, rotate, softDrop]);

  const displayBoard = useMemo(() => renderBoard(board, current), [board, current]);

  const savedSnapshot = useMemo<TetrisSave>(() => ({
    board,
    finalBoard,
    currentPiece: current,
    score,
    lines,
    nextKind,
    gameOver
  }), [board, current, finalBoard, gameOver, lines, nextKind, score]);

  return {
    displayBoard,
    savedSnapshot,
    nextKind,
    score,
    lines,
    gameOver,
    move,
    rotate,
    softDrop,
    hardDrop
  };
}
