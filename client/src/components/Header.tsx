
import { GraduationCap, Sparkles } from "lucide-react";

export default function Header() {
    return (
        <header className="app-header">
            <div className="brand">
                <div className="brand-icon">
                    <GraduationCap size={25} />
                </div>

                <div>
                    <h1>LearnBoard AI</h1>
                    <p>Your personal visual tutor</p>
                </div>
            </div>

            <div className="header-status">
                <Sparkles size={16} />
                <span>AI tutor ready</span>
            </div>
        </header>
    );
}
