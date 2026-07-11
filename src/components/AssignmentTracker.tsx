import { useState } from 'react';
import { Plus, Award, Calendar, Trash2, ShieldAlert, BarChart2, CheckCircle2 } from 'lucide-react';
import { Assignment, Course } from '../types';

interface AssignmentTrackerProps {
  assignments: Assignment[];
  courses: Course[];
  onAddAssignment: (assignment: Partial<Assignment>) => void;
  onUpdateAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  selectedCourseId: string | null;
}

export default function AssignmentTracker({
  assignments,
  courses,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  selectedCourseId,
}: AssignmentTrackerProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newWeight, setNewWeight] = useState(10);
  const [newGrade, setNewGrade] = useState('');
  const [newStatus, setNewStatus] = useState<Assignment['status']>('Not Started');

  // Filter assignments based on selected course
  const filteredAssignments = assignments.filter((a) => {
    return selectedCourseId ? a.courseId === selectedCourseId : true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCourseId) return;

    onAddAssignment({
      title: newTitle,
      courseId: newCourseId,
      dueDate: newDueDate || undefined,
      weight: Number(newWeight),
      grade: newGrade !== '' ? Number(newGrade) : undefined,
      status: newStatus,
    });

    setNewTitle('');
    setNewCourseId('');
    setNewDueDate('');
    setNewWeight(10);
    setNewGrade('');
    setNewStatus('Not Started');
  };

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.name || 'Unknown Course';
  };

  const getCourseColor = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.color || '#10b981';
  };

  // Grade OS calculations
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

  const convertGradeToGPA = (grade: number) => {
    if (grade >= 90) return 4.0;
    if (grade >= 80) return 3.0;
    if (grade >= 70) return 2.0;
    if (grade >= 60) return 1.0;
    return 0.0;
  };

  const getGPALetter = (gpa: number) => {
    if (gpa >= 4.0) return 'A';
    if (gpa >= 3.0) return 'B';
    if (gpa >= 2.0) return 'C';
    if (gpa >= 1.0) return 'D';
    return 'F';
  };

  // Calculate overall GPA
  const calculateOverallGPA = () => {
    let totalGPAValues = 0;
    let activeCourseCount = 0;

    courses.forEach((course) => {
      const grade = calculateCourseGrade(course.id);
      if (grade !== null) {
        totalGPAValues += convertGradeToGPA(grade);
        activeCourseCount++;
      }
    });

    if (activeCourseCount === 0) return null;
    return Math.round((totalGPAValues / activeCourseCount) * 100) / 100;
  };

  const overallGPA = calculateOverallGPA();

  return (
    <div id="assignment-tracker" className="space-y-6">
      {/* Grade OS Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase">Calculated GPA</p>
            <h4 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-mono leading-tight">
              {overallGPA !== null ? `${overallGPA} (${getGPALetter(overallGPA)})` : 'N/A'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 sm:pl-4 pt-3 sm:pt-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase">Total Graded</p>
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
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase">Submitted</p>
            <h4 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 font-mono leading-tight">
              {assignments.filter((a) => a.status === 'Submitted' || a.status === 'Graded').length}
            </h4>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <div>
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 text-base">Assignments &amp; Schedule</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
            Plan grade weights, record score percentages, and see automatic grading
          </p>
        </div>
      </div>

      {/* Assignment Entry Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl p-4 border border-zinc-200/50 dark:border-zinc-800/50 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-3">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Assignment / Exam Name
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Midterm Paper, Lab Report..."
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Course *
          </label>
          <select
            required
            value={newCourseId}
            onChange={(e) => setNewCourseId(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Weight %
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

        <div className="md:col-span-1">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Grade %
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={newGrade}
            onChange={(e) => setNewGrade(e.target.value)}
            placeholder="N/A"
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Status
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as Assignment['status'])}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Graded">Graded</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full h-8 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </form>

      {/* Course Averages Panel */}
      {courses.length > 0 && (
        <div className="bg-zinc-50/40 dark:bg-zinc-950/10 rounded-2xl border border-zinc-100 dark:border-zinc-900 p-4">
          <h4 className="text-xs font-semibold font-mono text-zinc-400 uppercase tracking-wider mb-3">Course Averages</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {courses.map((course) => {
              const grade = calculateCourseGrade(course.id);
              return (
                <div key={course.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course.color || '#10b981' }} />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">{course.name}</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded">
                    {grade !== null ? `${grade}%` : 'No grades'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assignment List */}
      <div className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 font-mono font-semibold uppercase text-[10px] border-b border-zinc-100 dark:border-zinc-800">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-400 dark:text-zinc-500">
                    No assignments found. Add your first assignment to calculate grades.
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
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{a.weight}%</td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {a.grade !== undefined ? (
                        <span className={a.grade >= 90 ? 'text-emerald-600 dark:text-emerald-400' : a.grade >= 70 ? 'text-amber-600' : 'text-red-500'}>
                          {a.grade}%
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
                          a.status === 'Graded'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : a.status === 'Submitted'
                            ? 'text-blue-500'
                            : 'text-zinc-500'
                        }`}
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Graded">Graded</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteAssignment(a.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 transition-colors inline-flex"
                        title="Delete Assignment"
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
    if (status !== 'Graded') {
      updates.grade = undefined;
    }
    onUpdateAssignment(assignment.id, updates);
  }
}
