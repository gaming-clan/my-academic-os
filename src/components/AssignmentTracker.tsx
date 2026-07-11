import { useState } from 'react';
import { Plus, Award, Calendar, Trash2, ShieldAlert, BarChart2, CheckCircle2, GraduationCap } from 'lucide-react';
import { Assignment, Course } from '../types';

interface AssignmentTrackerProps {
  assignments: Assignment[];
  courses: Course[];
  onAddAssignment: (assignment: Partial<Assignment>) => void;
  onUpdateAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  selectedCourseId: string | null;
  isUniversityMode?: boolean;
}

type GradeInputMode = 'nota' | 'pike';

// Shkalla zyrtare e konvertimit nga 100 pikë në notën shqiptare 4-10
const convertPointsToNota = (points: number) => {
  const p = Math.max(0, Math.min(100, points));
  if (p >= 90) return 10;
  if (p >= 80) return 9;
  if (p >= 70) return 8;
  if (p >= 60) return 7;
  if (p >= 50) return 6;
  if (p >= 40) return 5;
  return 4;
};

export default function AssignmentTracker({
  assignments,
  courses,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  selectedCourseId,
  isUniversityMode,
}: AssignmentTrackerProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newWeight, setNewWeight] = useState(10);
  const [gradeMode, setGradeMode] = useState<GradeInputMode>('nota');
  const [newGrade, setNewGrade] = useState('');
  const [newStatus, setNewStatus] = useState<Assignment['status']>('Pa Filluar');

  // Filter assignments based on selected course
  const filteredAssignments = assignments.filter((a) => {
    return selectedCourseId ? a.courseId === selectedCourseId : true;
  });

  const convertedPreview = newGrade !== '' && gradeMode === 'pike' ? convertPointsToNota(Number(newGrade)) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCourseId) return;

    const finalGrade =
      newGrade === '' ? undefined : gradeMode === 'pike' ? convertPointsToNota(Number(newGrade)) : Number(newGrade);

    onAddAssignment({
      title: newTitle,
      courseId: newCourseId,
      dueDate: newDueDate || undefined,
      weight: Number(newWeight),
      grade: finalGrade,
      status: newStatus,
    });

    setNewTitle('');
    setNewCourseId('');
    setNewDueDate('');
    setNewWeight(10);
    setGradeMode('nota');
    setNewGrade('');
    setNewStatus('Pa Filluar');
  };

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.name || 'Lëndë e Panjohur';
  };

  const getCourseColor = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.color || '#10b981';
  };

  const getCourseCredits = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.credits ?? 6;
  };

  // Llogaritja e Notave (Grade OS calculations, Albanian 4-10 scale)
  const calculateCourseGrade = (courseId: string) => {
    const courseAssignments = assignments.filter((a) => a.courseId === courseId && a.grade !== undefined);
    if (courseAssignments.length === 0) return null;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    courseAssignments.forEach((a) => {
      totalWeightedScore += (a.grade || 0) * (a.weight / 100);
      totalWeight += a.weight / 100;
    });

    if (totalWeight === 0) return null;
    return Math.round((totalWeightedScore / totalWeight) * 10) / 10;
  };

  // Cilësori përshkrues sipas notës (4-10), përdorur në sistemin arsimor shqiptar
  const getNotaCilesor = (nota: number) => {
    const rounded = Math.round(nota);
    if (rounded >= 10) return 'Shkëlqyeshëm';
    if (rounded === 9) return 'Shumë Mirë';
    if (rounded === 8) return 'Mirë';
    if (rounded === 7) return 'Mjaft Mirë';
    if (rounded === 6) return 'Mjaftueshëm';
    if (rounded === 5) return 'Kalues';
    return 'Mbetës';
  };

  // Mesatarja e Përgjithshme: në modalitetin Universitet ponderohet sipas kredite ECTS të çdo lënde;
  // në Shkollë e Mesme përdoret mesatarja e thjeshtë e notave të lëndëve.
  const calculateOverallAverage = () => {
    if (isUniversityMode) {
      let weightedSum = 0;
      let totalCredits = 0;

      courses.forEach((course) => {
        const grade = calculateCourseGrade(course.id);
        if (grade !== null) {
          const credits = course.credits && course.credits > 0 ? course.credits : 6;
          weightedSum += grade * credits;
          totalCredits += credits;
        }
      });

      if (totalCredits === 0) return null;
      return Math.round((weightedSum / totalCredits) * 100) / 100;
    }

    let totalNota = 0;
    let activeCourseCount = 0;

    courses.forEach((course) => {
      const grade = calculateCourseGrade(course.id);
      if (grade !== null) {
        totalNota += grade;
        activeCourseCount++;
      }
    });

    if (activeCourseCount === 0) return null;
    return Math.round((totalNota / activeCourseCount) * 100) / 100;
  };

  // Kreditet ECTS të grumbulluara (nota kaluese, >= 5) nga totali i lëndëve
  const calculateCreditsSummary = () => {
    let earned = 0;
    let total = 0;

    courses.forEach((course) => {
      const credits = course.credits && course.credits > 0 ? course.credits : 6;
      total += credits;
      const grade = calculateCourseGrade(course.id);
      if (grade !== null && grade >= 5) {
        earned += credits;
      }
    });

    return { earned, total };
  };

  const overallAverage = calculateOverallAverage();
  const creditsSummary = isUniversityMode ? calculateCreditsSummary() : null;

  return (
    <div id="assignment-tracker" className="space-y-6">
      {/* Paneli i Notave (Grade OS Banner) */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          isUniversityMode ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        } gap-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-5`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase">
              {isUniversityMode ? 'Mesatarja e Ponderuar (ECTS)' : 'Mesatarja e Përgjithshme'}
            </p>
            <h4 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-mono leading-tight">
              {overallAverage !== null ? `${overallAverage} (${getNotaCilesor(overallAverage)})` : 'N/A'}
            </h4>
          </div>
        </div>

        {isUniversityMode && creditsSummary && (
          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 sm:pl-4 pt-3 sm:pt-0">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase">Kreditet ECTS</p>
              <h4 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-mono leading-tight">
                {creditsSummary.earned} / {creditsSummary.total}
              </h4>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 sm:pl-4 pt-3 sm:pt-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase">Total i Vlerësuar</p>
            <h4 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-mono leading-tight">
              {assignments.filter((a) => a.grade !== undefined).length} / {assignments.length}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 sm:pl-4 pt-3 sm:pt-0">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase">Dorëzuar</p>
            <h4 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-mono leading-tight">
              {assignments.filter((a) => a.status === 'Dorëzuar' || a.status === 'Vlerësuar').length}
            </h4>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <div>
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 text-base">Detyra &amp; Provime</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
            Planifikoni peshat, regjistroni notat (shkalla 4-10) dhe shihni vlerësimin automatik
          </p>
        </div>
      </div>

      {/* Formulari i Shtimit të Detyrës */}
      <form onSubmit={handleSubmit} className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl p-4 border border-zinc-200/50 dark:border-zinc-800/50 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-3">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Emri i Detyrës / Provimit
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="p.sh. Provimi Ndërkohor, Raporti i Laboratorit..."
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Lënda *
          </label>
          <select
            required
            value={newCourseId}
            onChange={(e) => setNewCourseId(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Zgjidh Lëndën</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Pesha %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            required
            value={newWeight}
            onChange={(e) => setNewWeight(Number(e.target.value))}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500">Nota</label>
            <div className="flex gap-0.5 bg-zinc-200/50 dark:bg-zinc-900 p-0.5 rounded-md text-[9px] font-semibold">
              <button
                type="button"
                onClick={() => {
                  setGradeMode('nota');
                  setNewGrade('');
                }}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  gradeMode === 'nota'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                4-10
              </button>
              <button
                type="button"
                onClick={() => {
                  setGradeMode('pike');
                  setNewGrade('');
                }}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  gradeMode === 'pike'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
                title="Konverto nga 100 pikë në notë"
              >
                Pikë→Notë
              </button>
            </div>
          </div>
          {gradeMode === 'nota' ? (
            <input
              type="number"
              min="4"
              max="10"
              step="0.5"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              placeholder="N/A"
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="100"
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                placeholder="0-100"
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
              {convertedPreview !== null && (
                <span className="flex-shrink-0 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-1 rounded whitespace-nowrap">
                  → {convertedPreview}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Statusi
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as Assignment['status'])}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="Pa Filluar">Pa Filluar</option>
            <option value="Në Vazhdim">Në Vazhdim</option>
            <option value="Dorëzuar">Dorëzuar</option>
            <option value="Vlerësuar">Vlerësuar</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <button
            type="submit"
            className="w-full h-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm"
            title="Shto Detyrën"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Paneli i Mesatareve të Lëndëve */}
      {courses.length > 0 && (
        <div className="bg-zinc-50/40 dark:bg-zinc-950/10 rounded-2xl border border-zinc-100 dark:border-zinc-900 p-4">
          <h4 className="text-xs font-semibold font-mono text-zinc-400 uppercase tracking-wider mb-3">Mesatarja e Lëndëve</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {courses.map((course) => {
              const grade = calculateCourseGrade(course.id);
              return (
                <div key={course.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color || '#10b981' }} />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">{course.name}</span>
                    {isUniversityMode && (
                      <span className="text-[9px] font-mono text-zinc-400 flex-shrink-0">
                        ({course.credits ?? 6} KR)
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded">
                    {grade !== null ? `Nota ${grade}` : 'Pa nota'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista e Detyrave */}
      <div className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 font-mono font-semibold uppercase text-[10px] border-b border-zinc-100 dark:border-zinc-800">
                <th className="py-3 px-4">Titulli</th>
                <th className="py-3 px-4">Lënda</th>
                <th className="py-3 px-4">Pesha</th>
                <th className="py-3 px-4">Nota</th>
                <th className="py-3 px-4">Statusi</th>
                <th className="py-3 px-4 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-400 dark:text-zinc-500">
                    Nuk u gjetën detyra. Shtoni detyrën tuaj të parë për të llogaritur notat.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all text-zinc-700 dark:text-zinc-300">
                    <td className="py-3.5 px-4 font-medium">{a.title}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getCourseColor(a.courseId) }} />
                        <span className="truncate max-w-[120px]">{getCourseName(a.courseId)}</span>
                        {isUniversityMode && (
                          <span className="text-[9px] font-mono text-zinc-400 flex-shrink-0">
                            ({getCourseCredits(a.courseId)} KR)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{a.weight}%</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {a.grade !== undefined ? (
                        <span className={a.grade >= 9 ? 'text-emerald-600 dark:text-emerald-400' : a.grade >= 5 ? 'text-amber-600' : 'text-red-500'}>
                          {a.grade}
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={a.status}
                        onChange={(e) => onUpdateTaskOrAssignmentStatus(a, e.target.value as Assignment['status'])}
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${
                          a.status === 'Vlerësuar'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : a.status === 'Dorëzuar'
                            ? 'text-blue-500'
                            : 'text-zinc-500'
                        }`}
                      >
                        <option value="Pa Filluar">Pa Filluar</option>
                        <option value="Në Vazhdim">Në Vazhdim</option>
                        <option value="Dorëzuar">Dorëzuar</option>
                        <option value="Vlerësuar">Vlerësuar</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteAssignment(a.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 transition-colors inline-flex"
                        title="Fshi Detyrën"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  function onUpdateTaskOrAssignmentStatus(assignment: Assignment, status: Assignment['status']) {
    const updates: Partial<Assignment> = { status };
    if (status !== 'Vlerësuar') {
      updates.grade = undefined;
    }
    onUpdateAssignment(assignment.id, updates);
  }
}
