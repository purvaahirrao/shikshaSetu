import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Brain, ArrowLeft, CheckCircle2, XCircle, Trophy, Sparkles, Flame } from "lucide-react";
<<<<<<< HEAD
import { useGameSystem } from '../hooks/useGameSystem';

export default function Quiz() {
    const router = useRouter();
=======
import { useAuth } from '../hooks/useAuth';
import { useStudentProgress } from '../hooks/useStudentProgress';
import { getProgressUserId, recordQuizSession } from '../services/userProgress';
import { pickQuizQuestions, pickDailyQuestions } from '../services/quizDummyData';

export default function Quiz() {
    const router = useRouter();
    const { user } = useAuth();
    const st = useStudentProgress(user);
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
    const [gameState, setGameState] = useState("setup"); // 'setup', 'loading', 'playing', 'result'
    const [classLevel, setClassLevel] = useState("5");
    const [subject, setSubject] = useState("math");
    const [questions, setQuestions] = useState([]);
<<<<<<< HEAD
    const game = useGameSystem();
=======
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
    const xpEarnedRef = useRef(0);

    // Playing state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [score, setScore] = useState(0);
<<<<<<< HEAD
    const [xpEarned, setXpEarned] = useState(0);

=======
    const scoreRef = useRef(0);
    const [xpEarned, setXpEarned] = useState(0);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
    // Support ?mode=daily for the daily challenge (3 random questions)
    useEffect(() => {
        if (router.query.mode === 'daily') {
            fetchQuiz(true);
        }
    }, [router.query.mode]);

<<<<<<< HEAD
    const fetchQuiz = async (isDaily = false) => {
        setGameState("loading");
        try {
            let url;
            if (isDaily) {
                url = `http://localhost:8000/daily-challenge?class_level=${classLevel}`;
            } else {
                url = `http://localhost:8000/quiz?class_level=${classLevel}&subject=${subject}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
=======
    const fetchQuiz = (isDaily = false) => {
        setGameState("loading");
        try {
            const list = isDaily
                ? pickDailyQuestions(classLevel, 3)
                : pickQuizQuestions(classLevel, subject, 5);
            if (list.length > 0) {
                setQuestions(list);
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
                setCurrentIndex(0);
                setScore(0);
                setSelectedOption(null);
                setIsAnswerChecked(false);
                setXpEarned(0);
                xpEarnedRef.current = 0;
                setGameState("playing");
            } else {
                alert("No questions found.");
                setGameState("setup");
            }
        } catch (error) {
<<<<<<< HEAD
            console.error("Quiz fetch error:", error);
            alert("Error loading quiz. Is the Python backend server running on port 8000?");
=======
            console.error("Quiz load error:", error);
            alert("Could not load quiz.");
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
            setGameState("setup");
        }
    };

    const handleSelect = (opt) => {
        if (!isAnswerChecked) {
            setSelectedOption(opt);
        }
    };

    const checkAnswer = () => {
        if (!selectedOption) return;
        setIsAnswerChecked(true);
        if (selectedOption === questions[currentIndex].answer) {
            setScore(prev => prev + 1);
<<<<<<< HEAD
            game.recordQuestion();
            xpEarnedRef.current += 5;
            setXpEarned(xpEarnedRef.current);
=======
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswerChecked(false);
        } else {
<<<<<<< HEAD
            // Quiz complete — award bonus XP
            game.recordQuizComplete();
            xpEarnedRef.current += 20;
            setXpEarned(xpEarnedRef.current);
=======
            const total = questions.length;
            const sc = scoreRef.current;
            const bonus = sc === total ? 40 : 0;
            xpEarnedRef.current = sc * 8 + bonus;
            setXpEarned(xpEarnedRef.current);
            const pid = getProgressUserId(user);
            if (pid && total > 0) {
                recordQuizSession(pid, { correct: sc, total, subject }, user);
                st.refresh();
            }
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
            setGameState("result");
        }
    };

    const quitQuiz = () => {
        if (confirm("Are you sure you want to quit?")) {
            router.push('/home');
        }
    };

    if (gameState === "setup") {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto p-5 pb-safe">
                <header className="flex items-center gap-3 pt-6 mb-8">
                    <button onClick={() => router.push('/home')} className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-200">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="font-display font-800 text-slate-800 text-xl flex-1">Start Quiz</h1>
                </header>
                
                <div className="card text-center mb-6 animate-fade-up">
                    <div className="inline-flex items-center justify-center p-4 bg-purple-100 rounded-3xl mb-4 text-purple-600">
                        <Brain size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="font-display font-800 text-2xl text-slate-800 mb-2">Ready to test yourself?</h2>
                    <p className="text-slate-500 text-sm">Choose your level and subject to start earning XP.</p>
                </div>

                <div className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
                    <div>
                        <label className="block text-sm font-700 text-slate-700 mb-2">Class Level</label>
                        <select className="input" value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
                            {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-700 text-slate-700 mb-2">Subject</label>
                        <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
                            <option value="math">Mathematics</option>
                            <option value="science">Science</option>
                            <option value="english">English</option>
                        </select>
                    </div>
                </div>

                <div className="mt-auto pt-6">
                    <button className="btn-primary w-full bg-purple-500 hover:bg-purple-600 shadow-glow-purple text-lg py-4 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 transition-all" onClick={fetchQuiz}>
                        Let's Go!
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === "loading") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center animate-pulse">
                    <Brain className="text-purple-500 mx-auto mb-4 animate-bounce" size={48} />
                    <p className="font-display font-800 text-slate-600 text-lg">Loading challenges...</p>
                </div>
            </div>
        );
    }

    if (gameState === "result") {
        const percentage = Math.round((score / questions.length) * 100);
        let message = "Good effort!";
        if (percentage === 100) message = "Perfect Score!";
        else if (percentage >= 80) message = "Amazing Job!";
        else if (percentage >= 50) message = "Well Done!";

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto p-5 pb-safe justify-center items-center">
                <div className="card text-center w-full animate-fade-up border-b-4 border-slate-200">
                    <div className="inline-flex justify-center items-center w-24 h-24 bg-amber-100 rounded-full mb-6">
                        <Trophy size={48} className="text-amber-500" />
                    </div>
                    <h1 className="font-display font-900 text-3xl text-slate-800 mb-2">{message}</h1>
                    <p className="text-slate-500 mb-4">You scored</p>
                    <div className="text-6xl font-display font-900 text-brand-500 mb-4">
                        {score} <span className="text-2xl text-slate-300">/ {questions.length}</span>
                    </div>

                    {/* XP Earned */}
                    <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
                        <Sparkles size={18} className="text-amber-500" />
                        <span className="font-display font-900 text-amber-600 text-lg">+{xpEarned} XP</span>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Sparkles size={14} className="text-amber-500" />
<<<<<<< HEAD
                            <span className="font-700">Level {game.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Flame size={14} className="text-orange-500" />
                            <span className="font-700">{game.streak}-day streak</span>
=======
                            <span className="font-700">Level {st.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Flame size={14} className="text-orange-500" />
                            <span className="font-700">{st.streak}-day streak</span>
>>>>>>> db035c6d0eb09b2f2db99afa0a5d94b8794cb69e
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button className="btn-primary w-full py-4 text-base font-800 border-b-4 border-brand-700 active:border-b-0 active:translate-y-1" onClick={() => setGameState('setup')}>
                            Play Again
                        </button>
                        <button className="btn-secondary w-full py-4 text-base font-800" onClick={() => router.push('/home')}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Playing State
    const currentQ = questions[currentIndex];
    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto pb-safe">
            {/* Top Bar with Progress */}
            <div className="flex items-center gap-4 px-5 pt-6 pb-4">
                <button onClick={quitQuiz} className="text-slate-400 hover:text-slate-600">
                    <XCircle size={28} />
                </button>
                <div className="flex-1 progress-track bg-slate-100 h-3">
                    <div className="progress-fill bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="font-800 text-brand-500 min-w-8 text-right">
                    {currentIndex + 1}<span className="text-slate-300">/{questions.length}</span>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 px-5 flex flex-col pt-4 overflow-y-auto">
                <h2 className="font-display font-800 text-2xl text-slate-800 mb-8 animate-fade-in leading-snug">
                    {currentQ.question}
                </h2>

                <div className="space-y-3 pb-8">
                    {currentQ.options.map((opt, i) => {
                        const isSelected = selectedOption === opt;
                        const isCorrect = opt === currentQ.answer;
                        
                        let stateClass = "border-slate-200 hover:bg-slate-50 text-slate-700";
                        if (isSelected && !isAnswerChecked) {
                            stateClass = "border-purple-400 bg-purple-50 text-purple-700 ring-2 ring-purple-100";
                        } else if (isAnswerChecked) {
                            if (isCorrect) {
                                stateClass = "border-brand-500 bg-brand-50 text-brand-700 scale-[1.02]";
                            } else if (isSelected && !isCorrect) {
                                stateClass = "border-rose-400 bg-rose-50 text-rose-700 opacity-80";
                            } else {
                                stateClass = "border-slate-200 text-slate-400 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={i}
                                disabled={isAnswerChecked}
                                onClick={() => handleSelect(opt)}
                                className={`w-full text-left p-4 rounded-2xl border-2 font-600 text-lg transition-all active:scale-[.98] ${stateClass} flex items-center justify-between animate-fade-up`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <span>{opt}</span>
                                {isAnswerChecked && isCorrect && <CheckCircle2 className="text-brand-500 animate-bounce-sm" />}
                                {isAnswerChecked && isSelected && !isCorrect && <XCircle className="text-rose-500" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Action Area */}
            <div className="p-5 border-t border-slate-100 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.04)] pb-8">
                {!isAnswerChecked ? (
                    <button 
                        className="btn w-full py-4 text-lg font-800 shadow-none border-b-4 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed bg-brand-500 text-white border-brand-700 hover:bg-brand-600"
                        disabled={!selectedOption}
                        onClick={checkAnswer}
                    >
                        Check
                    </button>
                ) : (
                    <div className={`p-4 rounded-2xl -mx-5 -mt-5 -mb-8 px-5 pt-5 pb-8 ${selectedOption === currentQ.answer ? 'bg-brand-100' : 'bg-rose-100'} animate-fade-up`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm ${selectedOption === currentQ.answer ? 'text-brand-500' : 'text-rose-500'}`}>
                                {selectedOption === currentQ.answer ? <CheckCircle2 size={24} strokeWidth={3}/> : <XCircle size={24} strokeWidth={3}/>}
                            </div>
                            <div>
                                <h3 className={`font-display font-900 text-xl ${selectedOption === currentQ.answer ? 'text-brand-700' : 'text-rose-700'}`}>
                                    {selectedOption === currentQ.answer ? 'Awesome!' : 'Correct Answer:'}
                                </h3>
                                {selectedOption !== currentQ.answer && (
                                    <p className="text-rose-600 font-600">{currentQ.answer}</p>
                                )}
                            </div>
                        </div>
                        <button 
                            className={`w-full btn py-4 text-lg font-800 shadow-none border-b-4 active:border-b-0 active:translate-y-1 transition-all text-white ${selectedOption === currentQ.answer ? 'bg-brand-500 border-brand-700 hover:bg-brand-600' : 'bg-rose-500 border-rose-700 hover:bg-rose-600'}`}
                            onClick={nextQuestion}
                        >
                            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Continue'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}