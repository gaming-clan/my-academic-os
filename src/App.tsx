import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  Cloud,
  CloudOff,
  LogOut,
  UserCheck,
  Plus,
  BookOpen,
  CheckCircle,
  FileText,
  Calendar,
  Layers,
  X,
  AlertCircle,
  Maximize,
  Minimize,
} from 'lucide-react';

import { db, auth, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { Course, Assignment, Note, Task, Profile } from './types';
import coverImage from './assets/images/academic_os_cover_1783785015939.jpg';
import { useFullscreen } from './hooks/useFullscreen';

// Import our modular widgets and components
import ClockWidget from './components/ClockWidget';
import PomodoroTimer from './components/PomodoroTimer';
import ProfileCard from './components/ProfileCard';
import CourseCard, { CourseModal } from './components/CourseCard';
import TaskTracker from './components/TaskTracker';
import AssignmentTracker from './components/AssignmentTracker';
import NoteEditor from './components/NoteEditor';

// Të Dhëna Shembull për Poliruar Estetikën e Menjëhershme
const SEED_COURSES: Course[] = [
  {
    id: 'math-101',
    userId: 'local-user',
    name: 'Matematikë e Lartë',
    code: 'MAT201',
    instructor: 'Prof. Asoc. Dr. Ilir Kaçani',
    semester: 'Semestri II',
    progress: 60,
    color: '#3b82f6',
    credits: 7,
  },
  {
    id: 'prog-102',
    userId: 'local-user',
    name: 'Sisteme Programimi',
    code: 'INF204',
    instructor: 'Dr. Elona Hoxha',
    semester: 'Semestri II',
    progress: 70,
    color: '#10b981',
    credits: 6,
  },
];

const SEED_TASKS: Task[] = [
  {
    id: 'task-1',
    userId: 'local-user',
    courseId: 'math-101',
    title: 'Rishiko Kapitullin 4.2 - Përcaktorët e Matricave',
    status: 'Në Vazhdim',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  },
  {
    id: 'task-2',
    userId: 'local-user',
    courseId: 'prog-102',
    title: 'Zbato Detyrën e Pemëve Binare të Kërkimit',
    status: 'Pa Filluar',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
  },
];

const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    userId: 'local-user',
    courseId: 'math-101',
    title: 'Provimi Ndërkohor i Algjebrës Lineare',
    weight: 30,
    grade: 9,
    status: 'Vlerësuar',
    dueDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
  },
  {
    id: 'assign-2',
    userId: 'local-user',
    courseId: 'prog-102',
    title: 'Projekti i Menaxhimit të Memories',
    weight: 20,
    grade: 8.5,
    status: 'Vlerësuar',
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
  },
];

const SEED_NOTES: Note[] = [
  {
    id: 'note-1',
    userId: 'local-user',
    courseId: 'math-101',
    title: 'Përcaktorët dhe Inversi i Matricave',
    folder: 'Leksione',
    content: `# Përcaktorët dhe Inversi i Matricave\n\n## Përkufizimi i Përcaktorit\n\nPërcaktori i një matrice $2\\times2$ $A$ llogaritet si:\n\n$$\\det(A) = ad - bc$$\n\n## Gjetja e Inversit\n\nPër një matricë katrore $A$:\n\n$$A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)$$\n\n### Rregulla Thelbësore\n- Një matricë është e invertueshme **atëherë dhe vetëm atëherë kur** përcaktori i saj është i ndryshëm nga zero.`,
  },
  {
    id: 'note-2',
    userId: 'local-user',
    courseId: 'prog-102',
    title: 'Alokimi Dinamik i Memories',
    folder: 'Laborator',
    content: `# Alokimi Dinamik i Memories në C/C++\n\n## Konceptet Kryesore\n- **Memoria Heap**: Ruhet në mënyrë dinamike gjatë ekzekutimit.\n- **Operatorët**: \`malloc\`, \`free\` në C, dhe \`new\`, \`delete\` në C++.\n\n## Shembull nga Laboratori\n\`\`\`cpp\nint* array = (int*)malloc(5 * sizeof(int));\nfor(int i = 0; i < 5; ++i) {\n    array[i] = i * 10;\n}\nfree(array);\n\`\`\``,
  },
];

type ActiveTab = 'detyra' | 'vleresime' | 'shenime';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core database collections
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Navigation and filtering
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('detyra');

  // Tracks the student's academic level (reported by ProfileCard) to gate university-only features like ECTS credits
  const [academicLevel, setAcademicLevel] = useState<Profile['academicLevel']>('Universitet');
  const isUniversityMode = academicLevel === 'Universitet';

  // Modals and creating states
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // App-wide fullscreen toggle
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync data (Firestore vs LocalStorage)
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Local state - Load cache
      const cachedCourses = localStorage.getItem('academic_os_courses');
      const cachedAssignments = localStorage.getItem('academic_os_assignments');
      const cachedNotes = localStorage.getItem('academic_os_notes');
      const cachedTasks = localStorage.getItem('academic_os_tasks');

      if (cachedCourses) {
        setCourses(JSON.parse(cachedCourses));
        setAssignments(cachedAssignments ? JSON.parse(cachedAssignments) : []);
        setNotes(cachedNotes ? JSON.parse(cachedNotes) : []);
        setTasks(cachedTasks ? JSON.parse(cachedTasks) : []);
      } else {
        // Seed first-time local state
        localStorage.setItem('academic_os_courses', JSON.stringify(SEED_COURSES));
        localStorage.setItem('academic_os_assignments', JSON.stringify(SEED_ASSIGNMENTS));
        localStorage.setItem('academic_os_notes', JSON.stringify(SEED_NOTES));
        localStorage.setItem('academic_os_tasks', JSON.stringify(SEED_TASKS));

        setCourses(SEED_COURSES);
        setAssignments(SEED_ASSIGNMENTS);
        setNotes(SEED_NOTES);
        setTasks(SEED_TASKS);
      }
      return;
    }

    // ONLINE MODE: Fetch from Firestore
    const uid = user.uid;

    const pathCourses = 'courses';
    const unsubCourses = onSnapshot(
      query(collection(db, pathCourses), where('userId', '==', uid)),
      async (snap) => {
        const list: Course[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Course));

        if (list.length === 0) {
          // Sync seed data to user's first cloud login
          try {
            for (const c of SEED_COURSES) {
              await setDoc(doc(db, 'courses', c.id), { ...c, userId: uid });
            }
            for (const a of SEED_ASSIGNMENTS) {
              await setDoc(doc(db, 'assignments', a.id), { ...a, userId: uid });
            }
            for (const n of SEED_NOTES) {
              await setDoc(doc(db, 'notes', n.id), { ...n, userId: uid });
            }
            for (const t of SEED_TASKS) {
              await setDoc(doc(db, 'tasks', t.id), { ...t, userId: uid });
            }
          } catch (e) {
            console.error('Error writing cloud seed data:', e);
          }
        } else {
          setCourses(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, pathCourses);
      }
    );

    const pathAssignments = 'assignments';
    const unsubAssignments = onSnapshot(
      query(collection(db, pathAssignments), where('userId', '==', uid)),
      (snap) => {
        const list: Assignment[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Assignment));
        setAssignments(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, pathAssignments);
      }
    );

    const pathNotes = 'notes';
    const unsubNotes = onSnapshot(
      query(collection(db, pathNotes), where('userId', '==', uid)),
      (snap) => {
        const list: Note[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Note));
        setNotes(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, pathNotes);
      }
    );

    const pathTasks = 'tasks';
    const unsubTasks = onSnapshot(
      query(collection(db, pathTasks), where('userId', '==', uid)),
      (snap) => {
        const list: Task[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Task));
        setTasks(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, pathTasks);
      }
    );

    return () => {
      unsubCourses();
      unsubAssignments();
      unsubNotes();
      unsubTasks();
    };
  }, [user, authLoading]);

  // Auth controls
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Google Sign In failed:', e);
    }
  };

  const handleLogout = async () => {
    if (confirm('Jeni i sigurt që doni të dilni?')) {
      await signOut(auth);
      setCourses([]);
      setAssignments([]);
      setNotes([]);
      setTasks([]);
      setSelectedCourseId(null);
    }
  };

  // Course handlers
  const handleSaveCourse = async (courseData: Partial<Course>) => {
    const uid = user ? user.uid : 'local-user';
    const courseId = courseData.id || `course-${Date.now()}`;
    const newCourse: Course = {
      id: courseId,
      userId: uid,
      name: courseData.name || '',
      code: courseData.code || '',
      instructor: courseData.instructor || '',
      semester: courseData.semester || '',
      progress: courseData.progress || 0,
      color: courseData.color || '#10b981',
      credits: courseData.credits,
      createdAt: new Date().toISOString(),
    };

    if (user) {
      const path = `courses/${courseId}`;
      try {
        await setDoc(doc(db, 'courses', courseId), newCourse);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const updated = editingCourse
        ? courses.map((c) => (c.id === editingCourse.id ? newCourse : c))
        : [...courses, newCourse];
      setCourses(updated);
      localStorage.setItem('academic_os_courses', JSON.stringify(updated));
    }
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Jeni i sigurt që doni ta fshini këtë lëndë? Të dhënat e lidhura do të mbeten por të pashkëputura.')) return;

    if (user) {
      const path = `courses/${courseId}`;
      try {
        await deleteDoc(doc(db, 'courses', courseId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      const updated = courses.filter((c) => c.id !== courseId);
      setCourses(updated);
      localStorage.setItem('academic_os_courses', JSON.stringify(updated));
    }
    if (selectedCourseId === courseId) setSelectedCourseId(null);
  };

  // Tasks handlers
  const handleAddTask = async (taskData: Partial<Task>) => {
    const uid = user ? user.uid : 'local-user';
    const taskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      userId: uid,
      courseId: taskData.courseId,
      title: taskData.title || '',
      status: 'Pa Filluar',
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
    };

    if (user) {
      const path = `tasks/${taskId}`;
      try {
        await setDoc(doc(db, 'tasks', taskId), newTask);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const updated = [...tasks, newTask];
      setTasks(updated);
      localStorage.setItem('academic_os_tasks', JSON.stringify(updated));
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (user) {
      const path = `tasks/${taskId}`;
      try {
        await updateDoc(doc(db, 'tasks', taskId), updates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
      setTasks(updated);
      localStorage.setItem('academic_os_tasks', JSON.stringify(updated));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (user) {
      const path = `tasks/${taskId}`;
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      const updated = tasks.filter((t) => t.id !== taskId);
      setTasks(updated);
      localStorage.setItem('academic_os_tasks', JSON.stringify(updated));
    }
  };

  // Assignments handlers
  const handleAddAssignment = async (assignData: Partial<Assignment>) => {
    const uid = user ? user.uid : 'local-user';
    const assignId = `assign-${Date.now()}`;
    const newAssign: Assignment = {
      id: assignId,
      userId: uid,
      courseId: assignData.courseId || '',
      title: assignData.title || '',
      dueDate: assignData.dueDate,
      weight: assignData.weight || 0,
      grade: assignData.grade,
      status: assignData.status || 'Pa Filluar',
      createdAt: new Date().toISOString(),
    };

    if (user) {
      const path = `assignments/${assignId}`;
      try {
        await setDoc(doc(db, 'assignments', assignId), newAssign);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const updated = [...assignments, newAssign];
      setAssignments(updated);
      localStorage.setItem('academic_os_assignments', JSON.stringify(updated));
    }
  };

  const handleUpdateAssignment = async (assignId: string, updates: Partial<Assignment>) => {
    if (user) {
      const path = `assignments/${assignId}`;
      try {
        await updateDoc(doc(db, 'assignments', assignId), updates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      const updated = assignments.map((a) => (a.id === assignId ? { ...a, ...updates } : a));
      setAssignments(updated);
      localStorage.setItem('academic_os_assignments', JSON.stringify(updated));
    }
  };

  const handleDeleteAssignment = async (assignId: string) => {
    if (user) {
      const path = `assignments/${assignId}`;
      try {
        await deleteDoc(doc(db, 'assignments', assignId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      const updated = assignments.filter((a) => a.id !== assignId);
      setAssignments(updated);
      localStorage.setItem('academic_os_assignments', JSON.stringify(updated));
    }
  };

  // Notes handlers
  const handleAddNote = async (noteData: Partial<Note>) => {
    const uid = user ? user.uid : 'local-user';
    const noteId = `note-${Date.now()}`;
    const newNote: Note = {
      id: noteId,
      userId: uid,
      courseId: noteData.courseId || '',
      title: noteData.title || '',
      content: noteData.content || '',
      folder: noteData.folder || 'Lectures',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      const path = `notes/${noteId}`;
      try {
        await setDoc(doc(db, 'notes', noteId), newNote);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const updated = [...notes, newNote];
      setNotes(updated);
      localStorage.setItem('academic_os_notes', JSON.stringify(updated));
    }
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    if (user) {
      const path = `notes/${noteId}`;
      try {
        await updateDoc(doc(db, 'notes', noteId), updates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    } else {
      const updated = notes.map((n) => (n.id === noteId ? { ...n, ...updates } : n));
      setNotes(updated);
      localStorage.setItem('academic_os_notes', JSON.stringify(updated));
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (user) {
      const path = `notes/${noteId}`;
      try {
        await deleteDoc(doc(db, 'notes', noteId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      const updated = notes.filter((n) => n.id !== noteId);
      setNotes(updated);
      localStorage.setItem('academic_os_notes', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 flex flex-col">
      {/* 1. Header Banner Cover Area */}
      <div className="relative h-64 w-full overflow-hidden flex items-end">
        <img
          src={coverImage}
          alt="Kopertinë Estetike Malore"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-zinc-900/20 to-transparent" />

        {/* Top-right Authentication Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-all shadow-lg"
            title={isFullscreen ? 'Dil nga Ekrani i Plotë' : 'Ekrani i Plotë'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          {authLoading ? (
            <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-2xl pl-3 pr-2 py-1.5 border border-white/10 text-white shadow-lg">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold">{user.displayName || 'I Sinkronizuar'}</span>
              <button
                onClick={handleLogout}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Dilni"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold px-4 py-2 rounded-2xl shadow-lg border border-zinc-200 text-xs transition-all cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-500 animate-bounce" />
              Lidhu me Google
            </button>
          )}
        </div>

        {/* Bottom banner details: Graduation hat and OS Title */}
        <div className="max-w-7xl mx-auto w-full px-6 md:px-8 pb-6 relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/95 dark:bg-zinc-950/95 shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center transform -translate-y-2 md:-translate-y-4">
            <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              Sistemi Im Akademik <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </h1>
            <p className="text-zinc-200 text-xs font-medium md:text-sm">
              Një hapësirë pune për të organizuar lëndët, notat, orarin dhe shënimet e studimit.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-8 py-8 space-y-8">
        {/* Sync Reminder Banner */}
        {!user && !authLoading && (
          <div className="flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-3 rounded-2xl text-xs font-medium">
            <div className="flex items-center gap-2">
              <CloudOff className="w-4 h-4 text-amber-500" />
              <span>Aktualisht jeni në modalitetin Lokal Jashtë Linje. Lidhuni me Google për sinkronizim të vazhdueshëm në cloud.</span>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-xl shadow-xs transition-all font-semibold"
            >
              Identifikohu
            </button>
          </div>
        )}

        {/* 2. Top-level Bento Grid Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ClockWidget />
          <PomodoroTimer />
          <ProfileCard userId={user ? user.uid : null} onAcademicLevelChange={setAcademicLevel} />
        </div>

        {/* 3. "Classes & Subjects" Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                Lëndët
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                Klikoni një lëndë për të filtruar shënimet, detyrat dhe vlerësimet më poshtë
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsCourseModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Shto Lëndë
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/40 dark:bg-zinc-950/20">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <h4 className="font-semibold text-zinc-700 dark:text-zinc-300">Nuk ka Lëndë të Shtuara</h4>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                Krijoni një lëndë për të filluar organizimin e programit tuaj akademik.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onSelect={(id) => setSelectedCourseId(selectedCourseId === id ? null : id)}
                  isSelected={selectedCourseId === course.id}
                  onEdit={(c) => {
                    setEditingCourse(c);
                    setIsCourseModalOpen(true);
                  }}
                  onDelete={handleDeleteCourse}
                  isUniversityMode={isUniversityMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* 4. Filter Indicator & Bottom Tabs Segment */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3.5">
            {/* Tabs Trigger */}
            <div className="flex gap-1.5 bg-zinc-200/50 dark:bg-zinc-900 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('detyra')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'detyra'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <CheckCircle className="w-4 h-4" /> Lista e Detyrave ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('vleresime')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'vleresime'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <Calendar className="w-4 h-4" /> Detyra &amp; Notat ({assignments.length})
              </button>
              <button
                onClick={() => setActiveTab('shenime')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'shenime'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <FileText className="w-4 h-4" /> Shënime Studimi ({notes.length})
              </button>
            </div>

            {/* Active course filters */}
            {selectedCourseId && (
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 px-3 py-1.5 rounded-2xl text-xs font-semibold border border-emerald-500/20 shadow-xs animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Filtruar sipas Lëndës</span>
                <button
                  onClick={() => setSelectedCourseId(null)}
                  className="p-0.5 rounded-full hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 transition-colors"
                  title="Hiq Filtrin"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive view container */}
          <div className="bg-white/40 dark:bg-zinc-950/20 rounded-2xl">
            {activeTab === 'detyra' && (
              <TaskTracker
                tasks={tasks}
                courses={courses}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                selectedCourseId={selectedCourseId}
              />
            )}

            {activeTab === 'vleresime' && (
              <AssignmentTracker
                assignments={assignments}
                courses={courses}
                onAddAssignment={handleAddAssignment}
                onUpdateAssignment={handleUpdateAssignment}
                onDeleteAssignment={handleDeleteAssignment}
                selectedCourseId={selectedCourseId}
                isUniversityMode={isUniversityMode}
              />
            )}

            {activeTab === 'shenime' && (
              <NoteEditor
                notes={notes}
                courses={courses}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                selectedCourseId={selectedCourseId}
              />
            )}
          </div>
        </div>
      </main>

      {/* Dynamic Course Creation / Editing modal popup */}
      <CourseModal
        key={editingCourse ? editingCourse.id : 'new-course'}
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        initialCourse={editingCourse}
        isUniversityMode={isUniversityMode}
      />

      {/* Footer credits bar */}
      <footer className="border-t border-zinc-200/50 dark:border-zinc-800/50 py-6 mt-12 bg-white/40 dark:bg-zinc-950/10 flex items-center justify-center text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
        Sistemi Akademik • Ndërtuar me React, Tailwind &amp; Cloud Firestore
      </footer>
    </div>
  );
}
