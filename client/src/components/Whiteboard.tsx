
import type { BoardAction } from "../types/lesson";

interface WhiteboardProps {
    actions: BoardAction[];
    currentTime: number;
}

export default function Whiteboard({
    actions,
    currentTime,
}: WhiteboardProps) {
    const visibleActions = actions.filter((action) => {
        const startTime = action.startTime;
        const duration = action.duration || 10;

        return (
            currentTime >= startTime &&
            currentTime < startTime + duration
        );
    });

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
                {visibleActions.map((action) => {
                    if (action.type === "title" || action.type === "text") {
                        return (
                            <text
                                key={action.id}
                                x={action.x}
                                y={action.y}
                                fill={action.color || "#26334a"}
                                fontSize={action.type === "title" ? 30 : 21}
                                fontWeight={action.type === "title" ? "bold" : "normal"}
                            >
                                {action.content}
                            </text>
                        );
                    }

                    if (action.type === "circle") {
                        return (
                            <circle
                                key={action.id}
                                cx={action.x}
                                cy={action.y}
                                r={action.width || 45}
                                fill="none"
                                stroke={action.color || "#6366f1"}
                                strokeWidth="3"
                            />
                        );
                    }

                    if (action.type === "rectangle") {
                        return (
                            <rect
                                key={action.id}
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

                    if (action.type === "arrow") {
                        return (
                            <line
                                key={action.id}
                                x1={action.x}
                                y1={action.y}
                                x2={action.width || action.x + 100}
                                y2={action.height || action.y}
                                stroke={action.color || "#f59e0b"}
                                strokeWidth="3"
                                markerEnd="url(#arrowhead)"
                            />
                        );
                    }

                    return null;
                })}

                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="8"
                        refY="3"
                        orient="auto"
                    >
                        <path d="M0,0 L0,6 L9,3 z" fill="#f59e0b" />
                    </marker>
                </defs>
            </svg>

            {visibleActions.length === 0 && (
                <div className="board-empty">
                    Your visual lesson will appear here.
                </div>
            )}
        </div>
    );
}
