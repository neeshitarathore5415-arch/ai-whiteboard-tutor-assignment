
import type { Lesson } from "../types/lesson";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const generateLesson = async (topic: string): Promise<Lesson> => {
    const response = await fetch(`${API_BASE_URL}/lessons/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate lesson");
    }

    return data.lesson as Lesson;
};


export const askTutor = async (
    topic: string,
    question: string,
    lessonContext?: string
): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/chat/ask`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            topic,
            question,
            lessonContext,
        }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to get tutor response");
    }

    return data.answer;
};
