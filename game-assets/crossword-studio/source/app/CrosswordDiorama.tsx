"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { crosswordOrbitDrag, isCrosswordOrbitDrag, clampCrosswordElevation, type CrosswordOrbit } from './crossword-orbit';
import type { CrosswordScene, CrosswordSceneState } from "./crossword-scene";

export type CrosswordDioramaCell = {
  key: string; row: number; col: number; value: string; number?: number;
  active: boolean; solved: boolean; wrong: boolean; focused?: boolean;
};
type Props = {
  size: number; cells: CrosswordDioramaCell[]; flat: boolean; angle: number; elevation?: number; chapter?: number; completed?: boolean;
  label: string; cellLabel: string; solvedLabel: string;
  onOrbit?: (orbit: CrosswordOrbit) => void; onSelect: (key: string) => void; onFailure: () => void;
};

/** The canvas paints only; real DOM buttons own input, labels and focus. */
export function CrosswordDiorama({ size, cells, flat, angle, elevation = 44, onOrbit, chapter = 1, completed = false, label, cellLabel, solvedLabel, onSelect, onFailure }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const scene = useRef<CrosswordScene | null>(null);
  const latest = useRef<CrosswordSceneState>({ size, cells, angle, elevation, chapter, completed });
  const failed = useRef(onFailure);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{id:number;x:number;y:number;angle:number;elevation:number;moved:boolean}|null>(null);
  const suppressClick = useRef(false);
  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if(drag.current?.id!==event.pointerId)return;
    if(drag.current.moved)suppressClick.current=true;
    drag.current=null;setDragging(false);
    if(event.currentTarget.hasPointerCapture?.(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  }
  useLayoutEffect(() => {
    latest.current = { size, cells, angle, elevation, chapter, completed };
    failed.current = onFailure;
    scene.current?.update(latest.current);
  }, [size, cells, angle, elevation, chapter, completed, onFailure]);

  useEffect(() => {
    if (flat || !host.current || !overlay.current) return;
    const canvasHost = host.current, controls = overlay.current;
    let disposed = false;
    let instance: CrosswordScene | null = null;
    const fail = () => {
      if (disposed) return;
      setReady(false);
      failed.current();
    };
    void import("./crossword-scene").then(async ({ createCrosswordScene }) => {
      if (disposed) return;
      instance = await createCrosswordScene(canvasHost, controls, latest.current, fail);
      if (disposed) { instance.dispose(); return; }
      scene.current = instance;
      instance.update(latest.current);
      setReady(true);
    }).catch(fail);
    return () => { disposed = true; instance?.dispose(); scene.current = null; };
  }, [flat, size]);

  const dimensional = !flat && ready;
  const minRow = Math.min(...cells.map(cell => cell.row));
  const minCol = Math.min(...cells.map(cell => cell.col));
  const rows = Math.max(...cells.map(cell => cell.row)) - minRow + 1;
  const cols = Math.max(...cells.map(cell => cell.col)) - minCol + 1;
  return (
    <div className={`crossword-diorama ${dimensional ? "is-dimensional" : "is-flat"} ${dragging ? "is-orbiting" : ""}`} data-renderer={dimensional ? "webgl" : "dom"} data-orbit-angle={angle} data-orbit-elevation={elevation}
      tabIndex={dimensional ? 0 : undefined} aria-label={label}
      onKeyDown={event => {
        if(!dimensional||event.target!==event.currentTarget||!onOrbit)return;
        const change={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,5],ArrowDown:[0,-5]}[event.key];
        if(change){event.preventDefault();onOrbit({angle:angle+change[0],elevation:clampCrosswordElevation(elevation+change[1])});}
      }}
      onPointerDownCapture={event => {
        if(!dimensional||event.button!==0||!event.isPrimary||!onOrbit)return;
        suppressClick.current=false;
        drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,angle,elevation,moved:false};
      }}
      onPointerMove={event => {
        const start=drag.current;if(!start||start.id!==event.pointerId)return;
        if(event.buttons===0){endDrag(event);return;}
        const dx=event.clientX-start.x,dy=event.clientY-start.y;
        if(!start.moved&&!isCrosswordOrbitDrag(dx,dy))return;
        start.moved=true;setDragging(true);event.preventDefault();
        if(!event.currentTarget.hasPointerCapture?.(event.pointerId))event.currentTarget.setPointerCapture?.(event.pointerId);
        onOrbit?.(crosswordOrbitDrag(start,dx,dy));
      }}
      onPointerUp={endDrag} onPointerCancel={endDrag}
      onLostPointerCapture={event=>{if(drag.current?.id===event.pointerId){suppressClick.current=drag.current.moved;drag.current=null;setDragging(false);}}}
      onClickCapture={event=>{if(suppressClick.current&&event.detail!==0){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}}
      style={{ "--crossword-size": Math.max(rows, cols), touchAction:dimensional?"none":undefined, cursor:dimensional?(dragging?"grabbing":"grab"):undefined, ...(!dimensional ? { aspectRatio: `${cols} / ${rows}` } : {}) } as CSSProperties}>
      <div className="crossword-canvas" ref={host} aria-hidden="true" />
      <div className="crossword-grid" ref={overlay} role="group" aria-label={label}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
        {cells.map(cell => (
          <button type="button" key={cell.key} data-cell={cell.key} data-active-word={cell.active} data-input-position={cell.active && !!cell.focused}
            className={`crossword-cell ${cell.active ? "active-word" : ""} ${cell.active && cell.focused ? "input-position" : ""} ${cell.solved ? "correct" : ""} ${cell.wrong ? "wrong" : ""} ${cell.value ? "filled" : ""}`}
            style={dimensional ? undefined : { gridRow: cell.row - minRow + 1, gridColumn: cell.col - minCol + 1 }}
            aria-label={`${cellLabel} ${cell.row + 1}, ${cell.col + 1}${cell.value ? `: ${cell.value}` : ""}${cell.solved ? `, ${solvedLabel}` : ""}`}
            aria-pressed={cell.active}
            aria-current={cell.active && cell.focused ? "location" : undefined}
            tabIndex={cell.active ? 0 : -1}
            onClick={() => onSelect(cell.key)}>
            {cell.number && <small>{cell.number}</small>}
            <strong lang="ko">{cell.value}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
