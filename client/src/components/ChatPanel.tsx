
import { useEffect, useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatPanelProps {
    onGenerateLesson: (topic: string) => void;
    onAskQuestion: (question: string) => void;
    isLoading: boolean;
    answer: string;
}

export default function ChatPanel({
    onGenerateLesson,
    onAskQuestion,
    isLoading,
    answer,
}: ChatPanelProps) {
    const [topic, setTopic] = useState("");
    const [question, setQuestion] = useState("");

    const [messages, setMessages] = useState<
        { role: "user" | "assistant"; content: string }[]
    >([]);

    useEffect(() => {
        if (answer) {
            setMessages((previous) => [
                ...previous,
                { role: "assistant", content: answer },
            ]);
        }
    }, [answer]);

    const handleGenerate = () => {
        if (!topic.trim() || isLoading) return;
        setMessages([]);
        onGenerateLesson(topic.trim());
    };

    const handleQuestion = () => {
        if (!question.trim() || isLoading) return;
        const currentQuestion = question.trim();

        setMessages((previous) => [
            ...previous,
            { role: "user", content: currentQuestion },
        ]);

        onAskQuestion(currentQuestion);
        setQuestion("");
    };

    return (
        <div className="chat-panel">
            <h2>
                <MessageCircle size={20} /> Your AI Tutor
            </h2>

            <p className="chat-description">
                What would you like to learn today?
            </p>

            <div className="topic-input">
                <input
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") handleGenerate();
                    }}
                    placeholder="e.g. JavaScript Event Loop"
                />

                <button onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Teach me"}
                </button>
            </div>

            <div className="suggestions">
                <span>Try:</span>
                {["React Lifecycle", "SQL Joins", "Node.js Event Loop"].map(
                    (item) => (
                        <button key={item} onClick={() => setTopic(item)}>
                            {item}
                        </button>
                    )
                )}
            </div>

            <hr />

            <h3>Ask a follow-up question</h3>
            {messages.length > 0 && (
                <div className="chat-history">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={
                                message.role === "user"
                                    ? "user-message"
                                    : "tutor-answer"
                            }
                        >
                            <strong>
                                {message.role === "user" ? "You" : "Your AI Tutor"}
                            </strong>

                            {message.role === "assistant" ? (
                                <div className="markdown-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p>{message.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="question-input">
                <input
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") handleQuestion();
                    }}
                    placeholder="I'm confused about..."
                />

                <button onClick={handleQuestion} disabled={isLoading}>
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
