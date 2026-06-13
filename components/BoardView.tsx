import { pointKey } from "@/lib/tetrominoes";
import type { Board } from "@/lib/types";

const colors: Record<string, string> = {
  I: "bg-cyan-300",
  O: "bg-yellow-300",
  T: "bg-purple-400",
  S: "bg-green-400",
  Z: "bg-red-400",
  J: "bg-blue-500",
  L: "bg-orange-400"
};

export function BoardView({ board, mode, active, validAnchors = [], onCellClick }: { board: Board; mode: "tetris" | "izakaya"; active?: Set<string>; validAnchors?: Array<{ x: number; y: number }>; onCellClick?: (x: number, y: number) => void }) {
  const anchors = new Set(validAnchors.map((anchor) => pointKey(anchor.x, anchor.y)));
  return (
    <div className="board-grid mx-auto grid aspect-[10/20] w-full max-w-[min(92vw,25rem)] grid-cols-10 gap-[2px] rounded-lg border-4 border-black bg-black p-2 shadow-board">
      {board.map((row, y) =>
        row.map((cell, x) => {
          const key = pointKey(x, y);
          const filled = cell ? colors[cell] : "bg-stone-900";
          const activeStyle = active?.has(key) ? "ring-2 ring-yellow-200 brightness-125" : "";
          const anchorStyle = anchors.has(key) ? "outline outline-2 outline-offset-[-3px] outline-white" : "";
          return (
            <button
              key={key}
              onClick={() => onCellClick?.(x, y)}
              aria-label={`${x},${y}`}
              className={`relative aspect-square rounded-[2px] ${filled} ${activeStyle} ${anchorStyle} ${mode === "izakaya" ? "cursor-pointer" : "cursor-default"} transition`}
            >
              {anchors.has(key) && <span className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white" />}
            </button>
          );
        })
      )}
    </div>
  );
}
