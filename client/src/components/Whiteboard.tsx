import type { BoardAction, LessonSegment } from "../types/lesson";

interface WhiteboardProps {
    segments: LessonSegment[];
    currentTime: number;
    hasLesson: boolean;
}

const ROW_H = 34;
const LINE_H = 26;

type Box = { cx: number; cy: number; w: number; h: number; round: boolean };

// Size/center of anything an arrow can attach to
function getBox(a: BoardAction): Box | null {
    if (a.type === "circle") {
        const r = a.width || 45;
        return { cx: a.x, cy: a.y, w: r * 2, h: r * 2, round: true };
    }
    if (a.type === "rectangle") {
        const w = a.width || 150;
        const h = a.height || 70;
        return { cx: a.x + w / 2, cy: a.y + h / 2, w, h, round: false };
    }
    if (a.type === "table") {
        const w = a.width || 300;
        const h = ((a.rows?.length ?? 0) + 1) * ROW_H;
        return { cx: a.x + w / 2, cy: a.y + h / 2, w, h, round: false };
    }
    return null;
}

// Point on a shape's edge, facing (tx, ty)
function edgePoint(box: Box, tx: number, ty: number, gap = 4) {
    const dx = tx - box.cx;
    const dy = ty - box.cy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    let dist: number;
    if (box.round) {
        dist = box.w / 2;
    } else {
        const sx = ux === 0 ? Infinity : box.w / 2 / Math.abs(ux);
        const sy = uy === 0 ? Infinity : box.h / 2 / Math.abs(uy);
        dist = Math.min(sx, sy);
    }

    return { x: box.cx + ux * (dist + gap), y: box.cy + uy * (dist + gap) };
}

export default function Whiteboard({
    segments,
    currentTime,
    hasLesson,
}: WhiteboardProps) {
    // An element is visible from its startTime until:
    //  - endTime (if given), or
    //  - the lesson end (titles / persist), or
    //  - the end of ITS OWN segment.
    // So every scene change clears the board automatically.
    // Defensive: never crash if the lesson has no segments / boardActions
    const safeSegments = Array.isArray(segments) ? segments : [];

    const visibleActions: BoardAction[] = safeSegments.flatMap((segment) => {
        const segmentEnd = segment.startTime + segment.duration;
        const actions = Array.isArray(segment.boardActions)
            ? segment.boardActions
            : [];

        return actions.filter((action) => {
            if (currentTime < action.startTime) return false;
            if (action.endTime !== undefined) return currentTime < action.endTime;
            if (action.type === "title" || action.persist) return true;
            return currentTime < segmentEnd;
        });
    });

    const byId = new Map(visibleActions.map((a) => [a.id, a]));

    return (
        <div className="whiteboard">
            <div className="board-heading">
                <span>✦</span> Interactive Learning Board
            </div>

            <svg
                viewBox="0 0 800 500"
                className="board-canvas"
                role="img"
                aria-label="Animated lesson whiteboard"
            >
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="8"
                        refY="3"
                        orient="auto"
                    >
                        <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
                    </marker>
                </defs>

                {visibleActions.map((action) => {
                    // ---------- Title / text ----------
                    if (action.type === "title" || action.type === "text") {
                        const isTitle = action.type === "title";
                        const lines = (action.content ?? "").split("\n");

                        return (
                            <text
                                key={action.id}
                                className="board-item"
                                x={action.x}
                                y={action.y}
                                textAnchor={action.anchor ?? (isTitle ? "start" : "middle")}
                                dominantBaseline={isTitle ? "auto" : "central"}
                                fill={action.color || (isTitle ? "#5b3fd0" : "#26334a")}
                                fontSize={isTitle ? 30 : 21}
                                fontWeight={isTitle ? "bold" : "normal"}
                            >
                                {lines.map((line, i) => (
                                    <tspan
                                        key={i}
                                        x={action.x}
                                        dy={i === 0 ? 0 : LINE_H}
                                    >
                                        {line}
                                    </tspan>
                                ))}
                            </text>
                        );
                    }

                    // ---------- Circle ----------
                    if (action.type === "circle") {
                        return (
                            <circle
                                key={action.id}
                                className="board-item draw"
                                pathLength={1}
                                cx={action.x}
                                cy={action.y}
                                r={action.width || 45}
                                fill="none"
                                stroke={action.color || "#6366f1"}
                                strokeWidth="3"
                            />
                        );
                    }

                    // ---------- Rectangle ----------
                    if (action.type === "rectangle") {
                        return (
                            <rect
                                key={action.id}
                                className="board-item draw"
                                pathLength={1}
                                x={action.x}
                                y={action.y}
                                width={action.width || 150}
                                height={action.height || 70}
                                rx="10"
                                fill="none"
                                stroke={action.color || "#6366f1"}
                                strokeWidth="3"
                            />
                        );
                    }

                    // ---------- Table ----------
                    if (action.type === "table") {
                        const headers = action.headers ?? [];
                        const allRows = [headers, ...(action.rows ?? [])];
                        const cols = Math.max(headers.length, 1);
                        const w = action.width || 300;
                        const colW = w / cols;

                        return (
                            <g key={action.id} className="board-item">
                                {allRows.map((row, ri) =>
                                    row.map((cell, ci) => (
                                        <g key={`${ri}-${ci}`}>
                                            <rect
                                                x={action.x + ci * colW}
                                                y={action.y + ri * ROW_H}
                                                width={colW}
                                                height={ROW_H}
                                                fill={ri === 0 ? "#ece9fb" : "#ffffff"}
                                                stroke="#c9cdd8"
                                                strokeWidth="1.5"
                                            />
                                            <text
                                                x={action.x + ci * colW + colW / 2}
                                                y={action.y + ri * ROW_H + ROW_H / 2}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fontSize="16"
                                                fontWeight={ri === 0 ? "bold" : "normal"}
                                                fill="#26334a"
                                            >
                                                {cell}
                                            </text>
                                        </g>
                                    ))
                                )}
                            </g>
                        );
                    }

                    // ---------- Highlight rows of a table ----------
                    if (action.type === "highlight") {
                        const table = action.target ? byId.get(action.target) : undefined;
                        if (!table || table.type !== "table") return null;

                        return (
                            <g key={action.id} className="board-item">
                                {(action.highlightRows ?? []).map((row) => (
                                    <rect
                                        key={row}
                                        x={table.x}
                                        y={table.y + (row + 1) * ROW_H}
                                        width={table.width || 300}
                                        height={ROW_H}
                                        rx="4"
                                        fill={action.color || "#f59e0b"}
                                        fillOpacity="0.28"
                                        stroke={action.color || "#f59e0b"}
                                        strokeWidth="2.5"
                                    />
                                ))}
                            </g>
                        );
                    }

                    // ---------- Arrow ----------
                    if (action.type === "arrow") {
                        let x1 = action.x;
                        let y1 = action.y;
                        // x2/y2 first; width/height kept only so old lessons still render
                        let x2 = action.x2 ?? action.width ?? action.x + 100;
                        let y2 = action.y2 ?? action.height ?? action.y;

                        const fromShape = action.from ? byId.get(action.from) : undefined;
                        const toShape = action.to ? byId.get(action.to) : undefined;
                        const fromBox = fromShape ? getBox(fromShape) : null;
                        const toBox = toShape ? getBox(toShape) : null;

                        if (fromBox && toBox) {
                            const p1 = edgePoint(fromBox, toBox.cx, toBox.cy);
                            const p2 = edgePoint(toBox, fromBox.cx, fromBox.cy, 6);
                            x1 = p1.x;
                            y1 = p1.y;
                            x2 = p2.x;
                            y2 = p2.y;
                        }

                        return (
                            <line
                                key={action.id}
                                className="board-item draw"
                                pathLength={1}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={action.color || "#f59e0b"}
                                strokeWidth="3"
                                markerEnd="url(#arrowhead)"
                            />
                        );
                    }

                    return null;
                })}
            </svg>

            {!hasLesson && (
                <div className="board-empty">
                    Your visual lesson will appear here.
                </div>
            )}
        </div>
    );
}