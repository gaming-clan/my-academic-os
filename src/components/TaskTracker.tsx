import { useState } from 'react';
import { Square, CheckSquare, Plus, Calendar, Filter, Trash2, Tag, Play } from 'lucide-react';
import { Task, Course } from '../types';

interface TaskTrackerProps {
  tasks: Task[];
  courses: Course[];
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  selectedCourseId: string | null;
}

export default function TaskTracker({
  tasks,
  courses,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  selectedCourseId,
}: TaskTrackerProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Të Gjitha' | 'Pa Filluar' | 'Në Vazhdim' | 'Përfunduar'>('Të Gjitha');

  const filteredTasks = tasks.filter((task) => {
    const courseMatches = selectedCourseId ? task.courseId === selectedCourseId : true;
    const statusMatches = statusFilter === 'Të Gjitha' ? true : task.status === statusFilter;
    return courseMatches && statusMatches;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle,
      courseId: newCourseId || undefined,
      dueDate: newDueDate || undefined,
      status: 'Pa Filluar',
    });
    setNewTitle('');
    setNewCourseId('');
    setNewDueDate('');
  };

  const getCourseName = (courseId?: string) => {
    if (!courseId) return null;
    return courses.find((c) => c.id === courseId)?.name;
  };

  const getCourseColor = (courseId?: string) => {
    if (!courseId) return '#71717a';
    return courses.find((c) => c.id === courseId)?.color || '#10b981';
  };

  return (
    <div id="task-tracker" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <div>
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 text-base">Lista e Detyrave</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
            Menaxhoni studimet e përditshme dhe listat e detyrave
          </p>
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs font-medium self-start">
          {(['Të Gjitha', 'Pa Filluar', 'Në Vazhdim', 'Përfunduar'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-1 rounded-md transition-all ${
                statusFilter === s
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/50 grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
        <div className="md:col-span-5">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Titulli i Detyrës së Re
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="p.sh. Lexo Kapitullin 4 të Matematikës..."
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Lënda e Lidhur
          </label>
          <select
            value={newCourseId}
            onChange={(e) => setNewCourseId(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Të Përgjithshme (Pa Lidhje)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 block mb-1">
            Afati
          </label>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="md:col-span-1">
          <button
            type="submit"
            className="w-full h-8 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-white/40 dark:bg-zinc-950/20">
            <Tag className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nuk u gjetën detyra aktive në këtë seksion.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const courseName = getCourseName(task.courseId);
            const courseColor = getCourseColor(task.courseId);
            return (
              <div
                key={task.id}
                className="group flex items-center justify-between p-3.5 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => {
                      // Ndrysho: Pa Filluar -> Në Vazhdim -> Përfunduar -> Pa Filluar
                      const nextStatusMap: Record<Task['status'], Task['status']> = {
                        'Pa Filluar': 'Në Vazhdim',
                        'Në Vazhdim': 'Përfunduar',
                        'Përfunduar': 'Pa Filluar',
                      };
                      onUpdateTask(task.id, { status: nextStatusMap[task.status] });
                    }}
                    className="text-zinc-400 hover:text-emerald-500 transition-colors"
                  >
                    {task.status === 'Përfunduar' ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                    ) : task.status === 'Në Vazhdim' ? (
                      <div className="w-5 h-5 rounded border border-emerald-500 flex items-center justify-center">
                        <Play className="w-3 h-3 text-emerald-500 fill-current" />
                      </div>
                    ) : (
                      <Square className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium text-zinc-700 dark:text-zinc-200 truncate ${
                        task.status === 'Përfunduar' ? 'line-through text-zinc-400 dark:text-zinc-600' : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {courseName && (
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full font-mono text-white"
                          style={{ backgroundColor: courseColor }}
                        >
                          {courseName}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Afati: {task.dueDate}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-semibold font-mono rounded px-1 ${
                          task.status === 'Përfunduar'
                            ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
                            : task.status === 'Në Vazhdim'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 transition-all ml-2"
                  title="Fshi Detyrën"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
