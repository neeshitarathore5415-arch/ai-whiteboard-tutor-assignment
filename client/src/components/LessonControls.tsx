
import { Play, Pause, RotateCcw } from "lucide-react";

interface LessonControlsProps {
    isPlaying: boolean;
    currentTime: number;
    totalDuration: number;
    onPlayPause: () => void;
    onRestart: () => void;
    onSeek: (time: number) => void;
}

export default function LessonControls({
    isPlaying,
    currentTime,
    totalDuration,
    onPlayPause,
    onRestart,
    onSeek,
}: LessonControlsProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, "0")}`;
    };

    return (
        <div className="lesson-controls">
            <button onClick={onRestart} title="Restart lesson">
                <RotateCcw size={18} />
            </button>

            <button
                onClick={onPlayPause}
                className="play-button"
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <span>{formatTime(currentTime)}</span>

            <input
                type="range"
                min={0}
                max={totalDuration || 1}
                value={currentTime}
                onChange={(event) => onSeek(Number(event.target.value))}
                aria-label="Lesson progress"
            />

            <span>{formatTime(totalDuration)}</span>
        </div>
    );
}
