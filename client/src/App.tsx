
import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import ChatPanel from "./components/ChatPanel";
import Whiteboard from "./components/Whiteboard";
import LessonControls from "./components/LessonControls";
import { generateLesson, askTutor } from "./services/api";
import type { Lesson } from "./types/lesson";
import "./App.css";


export default function App() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tutorAnswer, setTutorAnswer] = useState("");

  const currentSegmentRef = useRef<string | null>(null);

  // Voice narration
  useEffect(() => {
    if (!lesson) return;

    if (!isPlaying) {
      window.speechSynthesis.pause();
      return;
    }

    const currentSegment = lesson.segments.find(
      (segment) =>
        currentTime >= segment.startTime &&
        currentTime < segment.startTime + segment.duration
    );

    if (!currentSegment) return;

    if (currentSegmentRef.current !== currentSegment.id) {
      window.speechSynthesis.cancel();
      currentSegmentRef.current = currentSegment.id;

      const utterance = new SpeechSynthesisUtterance(
        currentSegment.narration
      );

      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, [lesson, currentTime, isPlaying]);

  // Lesson timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setCurrentTime((time) =>
        Math.min(time + 1, lesson?.totalDuration ?? 0)
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying, lesson]);

  // Stop lesson at the end
  useEffect(() => {
    if (lesson && currentTime >= lesson.totalDuration) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      currentSegmentRef.current = null;
    }
  }, [currentTime, lesson]);


  // Generate lesson
  const handleGenerateLesson = async (topic: string) => {
    setIsLoading(true);
    setTutorAnswer("");
    setIsPlaying(false);

    window.speechSynthesis.cancel();
    currentSegmentRef.current = null;

    try {
      const generatedLesson = await generateLesson(topic);

      setLesson(generatedLesson);
      setCurrentTime(0);
    } catch (error) {
      console.error("Lesson generation failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to generate lesson. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  // Restart lesson
  const handleRestart = () => {
    window.speechSynthesis.cancel();
    currentSegmentRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // seek to a selected time
  const handleSeek = (time: number) => {
    const targetSegment = lesson?.segments.find(
      (segment) =>
        time >= segment.startTime &&
        time < segment.startTime + segment.duration
    );

    if (targetSegment?.id !== currentSegmentRef.current) {
      window.speechSynthesis.cancel();
      currentSegmentRef.current = null;
    }

    setCurrentTime(time);
  };

  // Ask a follow-up question
  const handleAskQuestion = async (question: string) => {
    if (!lesson) {
      setTutorAnswer("Please generate a lesson first, then ask your question.");
      return;
    }

    setIsLoading(true);
    setTutorAnswer("");

    const lessonContext = [
      lesson.title,
      lesson.description,
      ...lesson.segments.map((segment) => segment.narration),
    ].join("\n\n");

    try {
      const answer = await askTutor(
        lesson.topic,
        question,
        lessonContext
      );

      setTutorAnswer(answer);
    } catch (error) {
      console.error("Follow-up question failed:", error);

      setTutorAnswer(
        error instanceof Error
          ? error.message
          : "Unable to get an answer. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const boardActions =
    lesson?.segments.flatMap((segment) => segment.boardActions) ?? [];

  return (
    <div className="app-shell">
      <Header />

      <main className="content-layout">
        <section className="main-content">
          <div className="welcome-section">
            <p className="eyebrow">LEARN SOMETHING NEW</p>
            <h2>Your ideas, made visual.</h2>
            <p>
              Enter a topic and let your personal tutor explain it
              through a visual lesson.
            </p>
          </div>

          {lesson && (
            <div className="lesson-heading">
              <div>
                <h2>{lesson.title}</h2>
                <p>{lesson.description}</p>
              </div>
              <span className="lesson-duration">90 sec lesson</span>
            </div>
          )}

          <Whiteboard
            actions={boardActions}
            currentTime={currentTime}
          />

          {lesson && (
            <LessonControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              totalDuration={lesson.totalDuration}
              onPlayPause={() => {
                if (currentTime >= lesson.totalDuration) {
                  window.speechSynthesis.cancel();
                  currentSegmentRef.current = null;
                  setCurrentTime(0);
                  setIsPlaying(true);
                } else {
                  setIsPlaying(!isPlaying);
                }
              }}
              onRestart={handleRestart}
              onSeek={handleSeek}
            />
          )}
        </section>

        <aside className="sidebar">
          <ChatPanel
            onGenerateLesson={handleGenerateLesson}
            onAskQuestion={handleAskQuestion}
            isLoading={isLoading}
            answer={tutorAnswer}
          />
        </aside>
      </main>
    </div>
  );
}
