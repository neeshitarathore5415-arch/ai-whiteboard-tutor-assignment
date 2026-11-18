
export interface BoardAction {
    id: string;
    type: "title" | "text" | "circle" | "rectangle" | "arrow";
    content?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    startTime: number;
    duration: number;
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
