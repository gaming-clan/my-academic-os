import { useState } from 'react';
import { BookOpen, User, Calendar, Award, Trash2, Edit2, Plus, X } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelect: (courseId: string) => void;
  isSelected: boolean;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  isUniversityMode?: boolean;
}

export default function CourseCard({ course, onSelect, isSelected, onEdit, onDelete, isUniversityMode }: CourseCardProps) {
  return (
    <div
      onClick={() => onSelect(course.id)}
      className={`group relative rounded-2xl border bg-white dark:bg-zinc-950 p-5 shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col justify-between h-44 overflow-hidden ${
        isSelected
          ? 'border-emerald-500 ring-1 ring-emerald-500/30'
          : 'border-zinc-200/60 dark:border-zinc-800/60'
      }`}
    >
      {/* Aesthetic Color Ribbon */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: course.color || '#10b981' }}
      />

      <div className="flex justify-between items-start pt-1">
        <div>
          <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400">
            {course.code || 'PA-KOD'}
          </span>
          {isUniversityMode && (
            <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400 ml-1.5">
              {course.credits ?? 6} KR
            </span>
          )}
          <h4 className="font-semibold text-zinc-800 dark:text-zinc-100 text-base mt-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {course.name}
          </h4>
        </div>
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(course)}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            title="Ndrysho Lëndën"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(course.id)}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-red-500 transition-colors"
            title="Fshi Lëndën"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        {course.instructor && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate">{course.instructor}</span>
          </div>
        )}
        {course.semester && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>{course.semester}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/60">
        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400 font-mono mb-1">
          <span>Progresi i Lëndës</span>
          <span>{course.progress || 0}%</span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${course.progress || 0}%`,
              backgroundColor: course.color || '#10b981',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Dialog Modal to Create/Edit Course
interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Partial<Course>) => void;
  initialCourse?: Course | null;
  isUniversityMode?: boolean;
}

export function CourseModal({ isOpen, onClose, onSave, initialCourse, isUniversityMode }: CourseModalProps) {
  const [name, setName] = useState(initialCourse?.name || '');
  const [code, setCode] = useState(initialCourse?.code || '');
  const [instructor, setInstructor] = useState(initialCourse?.instructor || '');
  const [semester, setSemester] = useState(initialCourse?.semester || '');
  const [progress, setProgress] = useState(initialCourse?.progress || 0);
  const [color, setColor] = useState(initialCourse?.color || '#10b981');
  const [credits, setCredits] = useState(initialCourse?.credits ?? 6);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initialCourse?.id,
      name,
      code,
      instructor,
      semester,
      progress: Number(progress),
      color,
      credits: isUniversityMode ? Number(credits) : initialCourse?.credits,
    });
  };

  const colors = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#14b8a6', // Teal
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
          {initialCourse ? 'Ndrysho Lëndën' : 'Krijo Lëndë të Re'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono block mb-1">
              Emri i Lëndës *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="p.sh. Matematikë e Lartë ose Biologji"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono block mb-1">
                Kodi i Lëndës
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={20}
                placeholder="p.sh. MAT101"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono block mb-1">
                Semestri
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                maxLength={50}
                placeholder="p.sh. Semestri I, Viti Akademik 2025-2026"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono block mb-1">
              Mësuesi / Pedagogu
            </label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              maxLength={100}
              placeholder="p.sh. Prof. Dr. Agron Nishani"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {isUniversityMode && (
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono block mb-1">
                Kreditet ECTS
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={credits}
                onChange={(e) => setCredits(Math.max(1, Number(e.target.value)))}
                placeholder="p.sh. 6"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-zinc-400 font-mono mt-1">
                Peshon lëndën në mesataren e ponderuar të universitetit
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono block mb-1">
                Progresi i Programit (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono block mb-1">
                Ngjyra e Temës
              </label>
              <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      color === c ? 'scale-125 border-zinc-800 dark:border-zinc-100' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-sm font-medium"
            >
              Anulo
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all text-sm font-medium"
            >
              Ruaj Lëndën
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
