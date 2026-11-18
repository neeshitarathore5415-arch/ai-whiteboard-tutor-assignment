export type BoardActionType =
    | "title"
    | "text"
    | "circle"
    | "rectangle"
    | "arrow"
    | "table"
    | "highlight";

export interface BoardAction {
    id: string;
    type: BoardActionType;
    content?: string;

    x: number;
    y: number;
    width?: number;
    height?: number;

    from?: string;
    to?: string;
    x2?: number;
    y2?: number;

    headers?: string[];
    rows?: string[][];

    target?: string;
    highlightRows?: number[];

    anchor?: "start" | "middle" | "end";

    startTime: number;
    endTime?: number;
    persist?: boolean;
    duration?: number;

    color?: string;
}

export interface LessonSegment {
    id: string;
    narration: string;
    startTime: number;
    duration: number;
    boardActions: BoardAction[];
}

export interface Lesson {
    id: string;
    topic: string;
    title: string;
    description: string;
    totalDuration: number;
    segments: LessonSegment[];
}