import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Sparkles, 
  Award, 
  Flame, 
  Save, 
  RotateCcw,
  AlertCircle,
  Lightbulb,
  CheckSquare
} from 'lucide-react';
import { StudyPlan, StudyChecklistTask } from '../types';
import { generateStudyTimetable } from '../services/api';
import { saveStudyPlan, getSavedStudyPlans, deleteStudyPlan } from '../services/storage';

interface StudyPlannerViewProps {
  theme: 'dark' | 'light';
  onPlanSaved?: () => void;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  theme,
  onPlanSaved,
}) => {
  const isDark = theme === 'dark';

  const [subjects, setSubjects] = useState<string[]>(['Mathematics', 'Physics', 'Chemistry']);
  const [newSubject, setNewSubject] = useState('');
  const [topics, setTopics] = useState('Calculus Integration, Newton Mechanics, Organic Reaction Mechanisms');
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [examGoal, setExamGoal] = useState('Midterm Exams & Concept Mastery');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active plan state
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(() => {
    const saved = getSavedStudyPlans();
    return saved.length > 0 ? saved[0] : null;
  });

  const handleAddSubject = (name?: string) => {
    const val = name || newSubject.trim();
    if (!val || subjects.includes(val)) return;
    setSubjects([...subjects, val]);
    setNewSubject('');
  };

  const handleRemoveSubject = (name: string) => {
    setSubjects(subjects.filter((s) => s !== name));
  };

  const popularSubjects = ['Computer Science', 'Biology', 'History', 'English Literature', 'Economics'];

  const handleGeneratePlan = async () => {
    if (subjects.length === 0) {
      setErrorMessage('Please add at least one subject to your study routine.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await generateStudyTimetable({
        subjects,
        topics,
        availableHoursPerDay: availableHours,
        durationDays,
        examGoal,
      });

      if (response.plan) {
        const generatedPlan: StudyPlan = {
          id: `plan_${Date.now()}`,
          createdAt: Date.now(),
          planTitle: response.plan.planTitle || `${examGoal} Study Plan`,
          summary: response.plan.summary || 'Optimized multi-day timetable.',
          dailyTargetHours: response.plan.dailyTargetHours || availableHours,
          motivationalQuote: response.plan.motivationalQuote || 'Consistent effort creates mastery.',
          studyTips: response.plan.studyTips || [
            'Use 25-minute Pomodoro focus blocks with 5-minute rest.',
            'Review yesterday\'s concepts for 10 minutes before starting new topics.',
            'Stay hydrated and test yourself with flashcards.'
          ],
          dailySchedule: response.plan.dailySchedule || [],
          checklistTasks: (response.plan.checklistTasks || []).map((t: any, idx: number) => ({
            id: t.id || `task_${idx}`,
            title: t.title || `Task ${idx + 1}`,
            subject: t.subject || subjects[0],
            estimatedMinutes: t.estimatedMinutes || 45,
            priority: t.priority || 'medium',
            completed: false,
          })),
          subjects,
          topics,
          examGoal,
        };

        setCurrentPlan(generatedPlan);
        saveStudyPlan(generatedPlan);
        if (onPlanSaved) onPlanSaved();
      } else if (response.rawText) {
        // Fallback for unstructured text response
        const fallbackPlan: StudyPlan = {
          id: `plan_${Date.now()}`,
          createdAt: Date.now(),
          planTitle: `${examGoal} Study Plan`,
          summary: 'Generated customized study roadmap.',
          dailyTargetHours: availableHours,
          motivationalQuote: 'Every expert was once a beginner.',
          studyTips: ['Follow spaced repetition', 'Practice active recall daily'],
          dailySchedule: [],
          checklistTasks: [
            { id: '1', title: `Review ${subjects[0]} core definitions`, subject: subjects[0], estimatedMinutes: 45, priority: 'high', completed: false },
            { id: '2', title: `Solve practice questions for ${subjects[1] || subjects[0]}`, subject: subjects[1] || subjects[0], estimatedMinutes: 60, priority: 'high', completed: false },
          ],
          subjects,
          topics,
          examGoal,
          rawText: response.rawText,
        };
        setCurrentPlan(fallbackPlan);
        saveStudyPlan(fallbackPlan);
        if (onPlanSaved) onPlanSaved();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate study timetable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (!currentPlan) return;
    const updatedTasks = currentPlan.checklistTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedPlan = { ...currentPlan, checklistTasks: updatedTasks };
    setCurrentPlan(updatedPlan);
    saveStudyPlan(updatedPlan);
    if (onPlanSaved) onPlanSaved();
  };

  // Completed task progress calculation
  const totalTasks = currentPlan?.checklistTasks?.length || 0;
  const completedTasks = currentPlan?.checklistTasks?.filter((t) => t.completed).length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      {/* Header Info */}
      <div className={`p-5 rounded-3xl border ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Study Planner & Timetable</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Personalized schedules with subject time-blocking, checkpoints, and task tracking.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-4">
          {/* Subjects */}
          <div>
            <label className="text-xs font-semibold block mb-1.5">
              Subjects to Study:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {subjects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30"
                >
                  {s}
                  <button
                    onClick={() => handleRemoveSubject(s)}
                    className="hover:text-rose-400 ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                placeholder="Add custom subject (e.g. Organic Chemistry)..."
                className={`flex-1 py-2 px-3 text-xs rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
                }`}
              />
              <button
                onClick={() => handleAddSubject()}
                className="px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Quick add:
              </span>
              {popularSubjects.map((ps) => (
                <button
                  key={ps}
                  onClick={() => handleAddSubject(ps)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  + {ps}
                </button>
              ))}
            </div>
          </div>

          {/* Topics & Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">
                Target Exam / Goal:
              </label>
              <input
                type="text"
                value={examGoal}
                onChange={(e) => setExamGoal(e.target.value)}
                placeholder="e.g. Semester Finals, SAT, GATE, Board Exams"
                className={`w-full py-2 px-3 text-xs rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">
                Plan Duration:
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className={`w-full py-2 px-3 text-xs rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value={3}>3 Days (Crash Review)</option>
                <option value={7}>7 Days (Weekly Blueprint)</option>
                <option value={14}>14 Days (Bi-weekly Sprint)</option>
                <option value={30}>30 Days (Full Month Mastery)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1">
              Key Topics or Weak Areas:
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. Integration, Thermodynamics, Organic Reactions"
              className={`w-full py-2 px-3 text-xs rounded-xl border ${
                isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          {/* Available Study Hours Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold">Available Hours Per Day:</label>
              <span className="text-xs font-bold text-purple-400 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                {availableHours} Hours / day
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={0.5}
              value={availableHours}
              onChange={(e) => setAvailableHours(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>1h (Light)</span>
              <span>4h (Balanced)</span>
              <span>8h (Intensive)</span>
              <span>12h (Full Immersion)</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePlan}
            disabled={isLoading || subjects.length === 0}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Architecting Study Routine...' : 'Generate AI Study Timetable'}</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Generated Plan View */}
      {currentPlan && (
        <div className="space-y-5">
          {/* Plan Summary Card */}
          <div className={`p-5 rounded-3xl border space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-500/10">
              <div>
                <h3 className="font-bold text-base tracking-tight text-purple-400">{currentPlan.planTitle}</h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {currentPlan.summary}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {currentPlan.dailyTargetHours}h Daily Goal
                </span>
              </div>
            </div>

            {/* Motivational Quote */}
            {currentPlan.motivationalQuote && (
              <div className={`p-3 rounded-2xl text-xs italic flex items-center gap-2.5 ${
                isDark ? 'bg-purple-950/30 text-purple-200 border border-purple-500/20' : 'bg-purple-50 text-purple-900 border border-purple-100'
              }`}>
                <Flame className="w-4 h-4 text-purple-400 shrink-0" />
                <span>"{currentPlan.motivationalQuote}"</span>
              </div>
            )}

            {/* Scientific Study Tips */}
            {currentPlan.studyTips && currentPlan.studyTips.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold flex items-center gap-1.5 text-slate-300">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Proven Study Protocols</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {currentPlan.studyTips.map((tip, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl border ${
                      isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      • {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Task Checklist with Progress Bar */}
          <div className={`p-5 rounded-3xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm">Actionable Task Checklist</h4>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {completedTasks} / {totalTasks} Completed ({progressPercent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              {currentPlan.checklistTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                        : 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through'
                      : isDark
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                      : 'bg-slate-50 border-slate-200 hover:border-purple-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-semibold block">{task.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {task.subject} • ~{task.estimatedMinutes} mins
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold ${
                    task.priority === 'high'
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Schedule Breakdown */}
          {currentPlan.dailySchedule && currentPlan.dailySchedule.length > 0 && (
            <div className={`p-5 rounded-3xl border space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-sm">Daily Schedule & Time Blocks</h4>
              </div>

              <div className="space-y-4">
                {currentPlan.dailySchedule.map((day) => (
                  <div key={day.dayNumber} className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-500/10">
                      <span className="font-bold text-xs text-purple-400">
                        Day {day.dayNumber}: {day.dayName}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300">
                        Focus: {day.focusSubject}
                      </span>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-2">
                      {day.sessions.map((slot, sIdx) => (
                        <div key={sIdx} className="text-xs grid grid-cols-1 sm:grid-cols-4 gap-1 p-2 rounded-xl bg-slate-900/40">
                          <span className="font-mono text-purple-400 font-semibold">{slot.timeSlot}</span>
                          <span className="font-semibold text-slate-200">{slot.subject}: {slot.topic}</span>
                          <span className="text-slate-400 sm:col-span-2">{slot.objective} ({slot.suggestedTechnique})</span>
                        </div>
                      ))}
                    </div>

                    {/* Day Checkpoints */}
                    {day.checkpoints && day.checkpoints.length > 0 && (
                      <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-medium">Daily Goals:</span>
                        {day.checkpoints.map((cp, cpIdx) => (
                          <span key={cpIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✓ {cp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw text fallback if applicable */}
          {currentPlan.rawText && (
            <div className={`p-5 rounded-3xl border text-xs leading-relaxed whitespace-pre-wrap ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              {currentPlan.rawText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
