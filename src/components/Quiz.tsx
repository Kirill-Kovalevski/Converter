import React, { useState } from "react";

type QuizProps = {
  lang: string;
  forceTab?: "quiz" | "learn";
};

const Quiz: React.FC<QuizProps> = ({ lang, forceTab }) => {
  // if forceTab is passed, use it as default, otherwise start with "quiz"
  const [activeTab, setActiveTab] = useState<"quiz" | "learn">(forceTab || "quiz");

  return (
    <div className="quiz" data-lang={lang}>
      {/* Tabs */}
      <div className="quiz-tabs">
        <button
          className={`qtab ${activeTab === "quiz" ? "on" : ""}`}
          onClick={() => setActiveTab("quiz")}
        >
          Quiz
        </button>
        <button
          className={`qtab ${activeTab === "learn" ? "on" : ""}`}
          onClick={() => setActiveTab("learn")}
        >
          Learn
        </button>
      </div>

      {/* Content */}
      <div className="quiz-content">
        {activeTab === "quiz" && (
          <div>
            <h3>Quiz Mode</h3>
            <p>Put your quiz questions here…</p>
          </div>
        )}

        {activeTab === "learn" && (
          <div>
            <h3>Learn Mode</h3>
            <p>Put your learning materials here…</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
