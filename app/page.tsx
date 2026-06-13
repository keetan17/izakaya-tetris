"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { RotateCw, ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, BookOpen, Trash2, RefreshCcw, Utensils, Beer, Sparkles } from "lucide-react";
import { BoardView } from "@/components/BoardView";
import { Modal } from "@/components/Modal";
import { useIzakayaGame } from "@/hooks/useIzakayaGame";
import { useTetrisGame } from "@/hooks/useTetrisGame";
import { buildFreshIzakayaState, formatDuration, loadSavedState, saveState } from "@/lib/storage";
import { TETROMINO_LABELS, TETROMINO_KINDS, type TetrominoKind } from "@/lib/tetrominoes";
import type { AppMode, FoodDrinkKind, SavedGameState } from "@/lib/types";

const emptySaved: SavedGameState = {
  mode: "start",
  tetris: null,
  izakaya: null
};

export default function Home() {
  const [saved, setSaved] = useState<SavedGameState>(emptySaved);
  const [mode, setMode] = useState<AppMode>("start");
  const [rulesOpen, setRulesOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadSavedState();
    setSaved(loaded);
    setMode(loaded.mode ?? "start");
    setHydrated(true);
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({ ...saved, mode });
  }, [hydrated, mode, saved]);

  const beginNewTetris = () => {
    setSaved(emptySaved);
    setMode("tetris");
  };

  const continueSaved = () => {
    const loaded = loadSavedState();
    setSaved(loaded);
    setMode(loaded.mode === "start" ? (loaded.izakaya ? "izakaya" : "tetris") : loaded.mode);
  };

  const enterIzakaya = (board: SavedGameState["tetris"]) => {
    if (!board?.finalBoard) return;
    const izakaya = buildFreshIzakayaState(board.finalBoard);
    setSaved({ mode: "izakaya", tetris: board, izakaya });
    setMode("izakaya");
  };

  const resetAll = () => {
    localStorage.removeItem("izakaya-tetris-state");
    setSaved(emptySaved);
    setMode("start");
  };

  return (
    <main className="safe-bottom mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-3 py-4 sm:px-6 lg:px-8">
      {mode === "start" && (
        <StartScreen
          canContinue={Boolean(saved.tetris || saved.izakaya)}
          onStart={beginNewTetris}
          onContinue={continueSaved}
          onRules={() => setRulesOpen(true)}
        />
      )}

      {mode === "tetris" && (
        <TetrisScreen
          savedTetris={saved.tetris}
          onSave={(tetris) => setSaved((current) => ({ ...current, mode: "tetris", tetris }))}
          onEnterIzakaya={enterIzakaya}
          onBack={() => setMode("start")}
        />
      )}

      {mode === "izakaya" && saved.izakaya && (
        <IzakayaScreen
          state={saved.izakaya}
          onChange={(izakaya) => {
            setSaved((current) => ({ ...current, mode: izakaya.cleared ? "result" : "izakaya", izakaya }));
            if (izakaya.cleared) setMode("result");
          }}
          onResetIzakaya={() => saved.tetris?.finalBoard && setSaved((current) => ({ ...current, mode: "izakaya", izakaya: buildFreshIzakayaState(saved.tetris!.finalBoard) }))}
          onRestartTetris={beginNewTetris}
          onDeleteAll={resetAll}
        />
      )}

      {mode === "result" && saved.izakaya && (
        <ResultScreen
          state={saved.izakaya}
          onResetAll={resetAll}
          onRestart={beginNewTetris}
        />
      )}

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </main>
  );
}

function StartScreen({ canContinue, onStart, onContinue, onRules }: { canContinue: boolean; onStart: () => void; onContinue: () => void; onRules: () => void }) {
  return (
    <section className="flex min-h-[calc(100dvh-2rem)] flex-col justify-between gap-6">
      <div className="pt-8 text-center">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-900 bg-lantern shadow-neon">
          <span className="text-5xl">呑</span>
        </div>
        <h1 className="lantern-title text-5xl font-black tracking-normal sm:text-7xl">居酒屋テトリス</h1>
        <p className="mt-4 text-xl font-bold text-amber-100">食って、飲んで、ミノを消せ。</p>
      </div>
      <div className="wood-panel mx-auto grid w-full max-w-md gap-3 rounded-lg border border-amber-900/70 p-4 shadow-board">
        <BigButton onClick={onStart} label="ゲーム開始" />
        <BigButton onClick={onContinue} label="前回の続きから" disabled={!canContinue} variant="blue" />
        <button onClick={onRules} className="flex min-h-14 items-center justify-center gap-2 rounded-md border border-amber-500/40 bg-black/35 px-4 text-lg font-bold text-amber-100">
          <BookOpen size={22} />
          ルールを見る
        </button>
      </div>
    </section>
  );
}

function TetrisScreen({ savedTetris, onSave, onEnterIzakaya, onBack }: { savedTetris: SavedGameState["tetris"]; onSave: (state: NonNullable<SavedGameState["tetris"]>) => void; onEnterIzakaya: (state: SavedGameState["tetris"]) => void; onBack: () => void }) {
  const game = useTetrisGame(savedTetris ?? undefined);

  useEffect(() => {
    onSave(game.savedSnapshot);
  }, [game.savedSnapshot]);

  return (
    <section className="mx-auto grid w-full max-w-4xl gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Header title="通常テトリス" onBack={onBack} />
      <div className="grid gap-4 lg:col-start-1">
        <BoardView board={game.displayBoard} mode="tetris" />
        <div className="grid grid-cols-5 gap-2">
          <ControlButton icon={<ArrowLeft />} label="左" onClick={() => game.move(-1)} disabled={game.gameOver} />
          <ControlButton icon={<RotateCw />} label="回転" onClick={game.rotate} disabled={game.gameOver} />
          <ControlButton icon={<ArrowRight />} label="右" onClick={() => game.move(1)} disabled={game.gameOver} />
          <ControlButton icon={<ArrowDown />} label="下" onClick={game.softDrop} disabled={game.gameOver} />
          <ControlButton icon={<ChevronsDown />} label="落下" onClick={game.hardDrop} disabled={game.gameOver} />
        </div>
      </div>
      <aside className="wood-panel grid gap-4 rounded-lg border border-amber-900/70 p-4 shadow-board lg:col-start-2 lg:row-start-2">
        <StatLine label="スコア" value={game.score.toLocaleString("ja-JP")} />
        <StatLine label="ライン" value={String(game.lines)} />
        <div>
          <p className="mb-2 text-sm font-bold text-amber-200">次のミノ</p>
          <MiniMino kind={game.nextKind} />
        </div>
        {game.gameOver ? (
          <div className="grid gap-3 rounded-md border border-red-400/60 bg-red-950/55 p-3">
            <p className="text-xl font-black text-red-100">ゲームオーバー</p>
            <button onClick={() => onEnterIzakaya(game.savedSnapshot)} className="min-h-14 rounded-md bg-lantern px-4 text-lg font-black text-white shadow-neon">
              居酒屋モードへ進む
            </button>
          </div>
        ) : (
          <p className="rounded-md bg-black/25 p-3 text-sm leading-6 text-amber-100">スマホは下の大きなボタン、PCは矢印・Space・Z/↑で操作できます。</p>
        )}
      </aside>
    </section>
  );
}

function IzakayaScreen({ state, onChange, onResetIzakaya, onRestartTetris, onDeleteAll }: { state: NonNullable<SavedGameState["izakaya"]>; onChange: (state: NonNullable<SavedGameState["izakaya"]>) => void; onResetIzakaya: () => void; onRestartTetris: () => void; onDeleteAll: () => void }) {
  const game = useIzakayaGame(state, onChange);
  const [memoKind, setMemoKind] = useState<FoodDrinkKind | null>(null);
  const [memo, setMemo] = useState("");
  const elapsed = formatDuration((state.clearedAt ?? Date.now()) - state.startedAt);
  const stockDots = useMemo(() => Array.from({ length: Math.min(state.stock, 24) }), [state.stock]);

  const submitMemo = (skip: boolean) => {
    if (!memoKind) return;
    game.addStock(memoKind, skip ? "" : memo.trim());
    setMemo("");
    setMemoKind(null);
  };

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <Header title="居酒屋モード" />
      <div className="grid gap-4 lg:col-start-1">
        <div className="wood-panel rounded-lg border border-amber-900/70 p-3 shadow-board">
          <BoardView board={state.board} mode="izakaya" active={game.activePlacement} validAnchors={game.validAnchors} onCellClick={game.tryRemoveAt} />
        </div>
        {state.activeMino && !state.cleared && (
          <div className="grid gap-3 rounded-lg border border-yellow-300/50 bg-yellow-950/55 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-black">{TETROMINO_LABELS[state.activeMino.kind]}で削除</p>
              <p className="rounded-full bg-black/40 px-3 py-1 text-xl font-black text-yellow-200">{game.remainingSeconds}</p>
            </div>
            <button onClick={game.rotateActive} className="min-h-12 rounded-md bg-amber-300 px-4 font-black text-black">回転</button>
            <p className="text-sm text-amber-100">{game.validAnchors.length > 0 ? "光っている左上位置をタップして削除します。" : "削除可能な場所がありません"}</p>
          </div>
        )}
      </div>
      <aside className="grid gap-4 lg:col-start-2 lg:row-start-2">
        <div className="wood-panel rounded-lg border border-amber-900/70 p-4 shadow-board">
          <p className="text-sm font-bold text-amber-200">現在のストック</p>
          <div className="mt-2 flex flex-wrap gap-1" aria-label={`ストック${state.stock}`}>
            {stockDots.map((_, index) => <span key={index} className="h-7 w-7 rounded-full border-2 border-sky-100 bg-magnet shadow-[inset_0_2px_6px_rgba(255,255,255,.55)]" />)}
            {state.stock > 24 && <span className="ml-1 text-lg font-black">+{state.stock - 24}</span>}
            {state.stock === 0 && <span className="text-amber-100">なし</span>}
          </div>
          <p className="mt-2 text-3xl font-black">{state.stock}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <BigButton label="食った！" icon={<Utensils />} onClick={() => setMemoKind("food")} />
          <BigButton label="飲んだ！" icon={<Beer />} onClick={() => setMemoKind("drink")} variant="blue" />
        </div>

        <div className="wood-panel rounded-lg border border-amber-900/70 p-4 shadow-board">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-black">カード</p>
            <p className="text-sm text-amber-100">残り {state.deck.length} 枚</p>
          </div>
          {state.message && <p className="mb-3 rounded-md bg-black/35 p-3 text-center font-black text-yellow-100">{state.message}</p>}
          <button onClick={() => game.setFilterOpen(!state.filterOpen)} className="mb-3 min-h-12 w-full rounded-md border border-sky-300/50 bg-black/35 px-4 font-black">
            候補を絞る
          </button>
          {state.filterOpen && (
            <div className="mb-3 grid gap-3 rounded-md bg-black/25 p-3">
              <div className="grid grid-cols-4 gap-2">
                {TETROMINO_KINDS.map((kind) => (
                  <label key={kind} className="flex min-h-11 items-center justify-center gap-1 rounded-md border border-amber-500/40 bg-soy/80 text-sm font-bold">
                    <input type="checkbox" checked={state.excludedKinds.includes(kind)} onChange={() => game.toggleExcluded(kind)} />
                    {kind}
                  </label>
                ))}
              </div>
              <p className="text-sm text-amber-100">必要ストック: {1 + state.excludedKinds.length}</p>
            </div>
          )}
          <button onClick={game.drawCard} disabled={!game.canDraw} className="min-h-14 w-full rounded-md bg-lantern px-4 text-lg font-black text-white shadow-neon">
            カードを引く
          </button>
          {state.awaitingAce && (
            <div className="mt-3 grid gap-2 rounded-md border border-yellow-300/60 bg-yellow-950/50 p-3">
              <p className="font-black">エース！好きなミノを選択</p>
              <div className="grid grid-cols-4 gap-2">
                {TETROMINO_KINDS.map((kind) => <button key={kind} onClick={() => game.chooseAce(kind)} className="min-h-11 rounded-md bg-amber-200 font-black text-black">{kind}</button>)}
              </div>
            </div>
          )}
        </div>

        <HistoryPanel mixed={state.mixedHistory} />
        <StatsPanel state={state} elapsed={elapsed} />

        <div className="grid gap-2">
          <button onClick={onResetIzakaya} className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-black/45 px-4 font-bold"><RefreshCcw size={18} />居酒屋モードだけリセット</button>
          <button onClick={onRestartTetris} className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-black/45 px-4 font-bold"><RefreshCcw size={18} />最初のテトリスから</button>
          <button onClick={onDeleteAll} className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-red-400/60 bg-red-950/60 px-4 font-bold"><Trash2 size={18} />全データ削除</button>
        </div>
      </aside>

      <Modal open={memoKind !== null} onClose={() => setMemoKind(null)} title={memoKind === "food" ? "何食べた？" : "何飲んだ？"}>
        <div className="grid gap-3">
          <input value={memo} onChange={(event) => setMemo(event.target.value)} autoFocus className="min-h-12 rounded-md border border-amber-600 bg-black/45 px-3 text-lg text-white outline-none focus:border-yellow-300" placeholder={memoKind === "food" ? "唐揚げ" : "ハイボール"} />
          <button onClick={() => submitMemo(false)} className="min-h-12 rounded-md bg-lantern font-black text-white">追加</button>
          <button onClick={() => submitMemo(true)} className="min-h-12 rounded-md bg-black/45 font-bold">スキップ</button>
        </div>
      </Modal>
    </section>
  );
}

function ResultScreen({ state, onResetAll, onRestart }: { state: NonNullable<SavedGameState["izakaya"]>; onResetAll: () => void; onRestart: () => void }) {
  const elapsed = formatDuration((state.clearedAt ?? Date.now()) - state.startedAt);
  return (
    <section className="mx-auto grid w-full max-w-2xl gap-4">
      <div className="wood-panel rounded-lg border border-yellow-300/60 p-5 text-center shadow-board">
        <Sparkles className="mx-auto mb-3 text-yellow-200" size={42} />
        <h1 className="lantern-title text-4xl font-black">居酒屋テトリス成功！</h1>
      </div>
      <StatsPanel state={state} elapsed={elapsed} large />
      <div className="wood-panel rounded-lg border border-amber-900/70 p-4">
        <p className="mb-2 font-black">食べたもの</p>
        <p className="text-amber-100">{state.foodHistory.filter(Boolean).join("、") || "記録なし"}</p>
        <p className="mb-2 mt-4 font-black">飲んだもの</p>
        <p className="text-amber-100">{state.drinkHistory.filter(Boolean).join("、") || "記録なし"}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <BigButton label="もう一戦" onClick={onRestart} />
        <BigButton label="全データ削除" onClick={onResetAll} variant="dark" />
      </div>
    </section>
  );
}

function RulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="ルール">
      <div className="space-y-3 text-sm leading-6 text-amber-50">
        <p>まず通常テトリスを遊び、ゲームオーバー盤面を作ります。</p>
        <p>居酒屋では「食った！」「飲んだ！」でストックを獲得。ストック1でカードを引き、出たミノ形状と同じ4マスを盤面から削除します。</p>
        <p>カード確定後は3秒勝負。縦1列が完全に空になったら成功です。</p>
        <p>エースは好きなミノを選択、ジョーカーは「食べ損・飲み損！」です。</p>
      </div>
    </Modal>
  );
}

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="flex items-center justify-between gap-3 lg:col-span-2">
      <h1 className="lantern-title text-3xl font-black">{title}</h1>
      {onBack && <button onClick={onBack} className="rounded-md bg-black/45 px-3 py-2 font-bold">戻る</button>}
    </header>
  );
}

function BigButton({ label, onClick, disabled, variant = "red", icon }: { label: string; onClick: () => void; disabled?: boolean; variant?: "red" | "blue" | "dark"; icon?: ReactNode }) {
  const styles = variant === "blue" ? "bg-magnet text-white" : variant === "dark" ? "bg-black/55 text-white" : "bg-lantern text-white shadow-neon";
  return (
    <button onClick={onClick} disabled={disabled} className={`flex min-h-16 items-center justify-center gap-2 rounded-md px-4 text-lg font-black ${styles}`}>
      {icon}
      {label}
    </button>
  );
}

function ControlButton({ icon, label, onClick, disabled }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="flex aspect-square items-center justify-center rounded-md bg-amber-200 text-black shadow-board">
      {icon}
    </button>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-900/50 py-2">
      <span className="text-amber-200">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniMino({ kind }: { kind: TetrominoKind }) {
  const cells = TETROMINO_LABELS[kind];
  return <div className="rounded-md bg-black/35 p-4 text-center text-3xl font-black text-yellow-100">{cells}</div>;
}

function HistoryPanel({ mixed }: { mixed: Array<{ kind: FoodDrinkKind; text: string }> }) {
  const entries = mixed.slice(-8).reverse().map((entry) => ({ icon: entry.kind === "food" ? "🍢" : "🍺", item: entry.text }));
  return (
    <div className="wood-panel rounded-lg border border-amber-900/70 p-4 shadow-board">
      <p className="mb-3 font-black">メモ履歴</p>
      <div className="grid gap-2 text-sm">
        {entries.length === 0 ? <p className="text-amber-100">まだ記録なし</p> : entries.map((entry, index) => <p key={`${entry.item}-${index}`}>{entry.icon} {entry.item || "メモなし"}</p>)}
      </div>
    </div>
  );
}

function StatsPanel({ state, elapsed, large = false }: { state: NonNullable<SavedGameState["izakaya"]>; elapsed: string; large?: boolean }) {
  const className = large ? "text-lg" : "text-sm";
  return (
    <div className={`wood-panel rounded-lg border border-amber-900/70 p-4 shadow-board ${className}`}>
      <p className="mb-2 font-black">統計情報</p>
      <StatLine label="総注文数" value={String(state.stats.totalStockEarned)} />
      <StatLine label="食った回数" value={String(state.stats.foodCount)} />
      <StatLine label="飲んだ回数" value={String(state.stats.drinkCount)} />
      <StatLine label="使用ミノ数" value={String(state.stats.usedMinoCount)} />
      <StatLine label="ジョーカー回数" value={String(state.stats.jokerCount)} />
      <StatLine label="エース回数" value={String(state.stats.aceCount)} />
      <StatLine label="デッキ周回数" value={String(state.stats.deckCycles)} />
      <StatLine label="所要時間" value={elapsed} />
    </div>
  );
}

function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
