// pages/teacher/student/[id].jsx — Individual student detail view
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import AppShell from '../../../components/layout/AppShell';
import Spinner from '../../../components/ui/Spinner';
import { ArrowLeft, BookOpen, Brain, Flame, TrendingUp, Target, AlertTriangle } from 'lucide-react';

const STUDENTS = {
  '1': { name: 'Aarav Sharma',  cls: '8', score: 92, quizzes: 12, streak: 7,  xp: 620, subjects: { math: 95, science: 88, english: 93 }, weakAreas: ['Organic Chemistry', 'Trigonometry'] },
  '2': { name: 'Priya Patel',   cls: '7', score: 85, quizzes: 9,  streak: 5,  xp: 440, subjects: { math: 82, science: 90, english: 83 }, weakAreas: ['Fractions', 'Grammar'] },
  '3': { name: 'Rohan Gupta',   cls: '9', score: 78, quizzes: 6,  streak: 3,  xp: 280, subjects: { math: 75, science: 82, english: 77 }, weakAreas: ['Quadratic Equations', 'Magnetism'] },
  '4': { name: 'Sneha Verma',   cls: '8', score: 95, quizzes: 15, streak: 12, xp: 820, subjects: { math: 97, science: 92, english: 96 }, weakAreas: [] },
  '5': { name: 'Arjun Singh',   cls: '10', score: 63, quizzes: 4, streak: 0,  xp: 150, subjects: { math: 58, science: 70, english: 61 }, weakAreas: ['Calculus', 'Physics Numericals', 'Comprehension'] },
  '6': { name: 'Diya Mehta',    cls: '6', score: 88, quizzes: 10, streak: 8,  xp: 510, subjects: { math: 90, science: 85, english: 89 }, weakAreas: ['Decimals'] },
  '7': { name: 'Kabir Joshi',   cls: '7', score: 71, quizzes: 7,  streak: 2,  xp: 310, subjects: { math: 65, science: 78, english: 70 }, weakAreas: ['Algebra', 'Vocabulary'] },
  '8': { name: 'Ananya Reddy',  cls: '9', score: 90, quizzes: 11, streak: 9,  xp: 580, subjects: { math: 88, science: 94, english: 88 }, weakAreas: ['Coordinate Geometry'] },
};

const QUIZ_HISTORY = [
  { date: 'Today', subject: 'Math', score: 4, total: 5 },
  { date: 'Yesterday', subject: 'Science', score: 3, total: 5 },
  { date: '2 days ago', subject: 'English', score: 5, total: 5 },
  { date: '3 days ago', subject: 'Math', score: 2, total: 5 },
  { date: '5 days ago', subject: 'Science', score: 4, total: 5 },
];

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) router.replace('/home');
  }, [user, loading, router]);

  if (loading || !user || !id) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const student = STUDENTS[id];
  if (!student) {
    return (
      <AppShell title="Student">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
          <p className="text-slate-500 text-lg">Student not found</p>
          <button onClick={() => router.back()} className="mt-4 text-indigo-500 font-700 text-sm">Go back</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={student.name}
      left={
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={20} />
        </button>
      }
    >
      <div className="px-5 pt-5 pb-4 space-y-5">
        {/* Header Card */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500 to-indigo-700 animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-white font-display font-900 text-2xl">{student.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-white font-display font-900 text-xl">{student.name}</h2>
              <p className="text-indigo-200 text-sm mt-0.5">Class {student.cls}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-lg font-700">{student.xp} XP</span>
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-lg font-700">{student.streak}-day streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '60ms' }}>
          {[
            { label: 'Score', value: `${student.score}%`, icon: Target, color: student.score >= 80 ? 'text-emerald-500' : 'text-amber-500', bg: student.score >= 80 ? 'bg-emerald-50' : 'bg-amber-50' },
            { label: 'Quizzes', value: student.quizzes, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Streak', value: student.streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card text-center py-4">
              <div className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${bg} mx-auto mb-2`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`font-display font-900 text-xl ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Subject Performance */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Subject Performance</h3>
          <div className="card space-y-4">
            {Object.entries(student.subjects).map(([subj, score]) => (
              <div key={subj}>
                <div className="flex justify-between mb-1.5">
                  <p className="text-sm font-700 text-slate-700 capitalize">{subj}</p>
                  <p className={`text-sm font-800 ${score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{score}%</p>
                </div>
                <div className="progress-track h-2">
                  <div className={`progress-fill ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        {student.weakAreas.length > 0 && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '160ms' }}>
            <h3 className="font-display font-800 text-slate-700 text-base">Weak Areas</h3>
            <div className="flex flex-wrap gap-2">
              {student.weakAreas.map(area => (
                <span key={area} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-700">
                  <AlertTriangle size={12} /> {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quiz History */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display font-800 text-slate-700 text-base">Recent Quizzes</h3>
          <div className="card p-0 overflow-hidden">
            {QUIZ_HISTORY.map((q, i) => (
              <div key={i} className={`flex items-center justify-between p-4 ${i < QUIZ_HISTORY.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div>
                  <p className="text-sm font-700 text-slate-800">{q.subject}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{q.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-800 ${q.score/q.total >= 0.8 ? 'text-emerald-500' : q.score/q.total >= 0.6 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {q.score}/{q.total}
                  </span>
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-full rounded-full ${q.score/q.total >= 0.8 ? 'bg-emerald-500' : q.score/q.total >= 0.6 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${(q.score/q.total)*100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
