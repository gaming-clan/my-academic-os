import { useState, useEffect } from 'react';
import { Plus, Folder, Book, FileText, Search, Edit3, Eye, Trash2, Calendar, Layout, ChevronRight, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Note, Course } from '../types';

interface NoteEditorProps {
  notes: Note[];
  courses: Course[];
  onAddNote: (note: Partial<Note>) => void;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  selectedCourseId: string | null;
}

const FOLDERS = ['Shënime Klase', 'Udhëzues Studimi', 'Detyra Shtëpie', 'Laborator', 'Leksione', 'Të Përgjithshme'];

export default function NoteEditor({
  notes,
  courses,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  selectedCourseId,
}: NoteEditorProps) {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);

  // Form states for the currently active note
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [courseId, setCourseId] = useState('');
  const [folder, setFolder] = useState('Shënime Klase');

  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Set active note on initial load
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  // Sync active note fields with component state
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setCourseId(activeNote.courseId);
      setFolder(activeNote.folder || 'Shënime Klase');
    } else {
      setTitle('');
      setContent('');
      setCourseId('');
      setFolder('Shënime Klase');
    }
  }, [activeNote]);

  const handleCreateNote = () => {
    const tempId = `temp-${Date.now()}`;
    const defaultCourseId = selectedCourseId || (courses.length > 0 ? courses[0].id : '');
    if (!defaultCourseId) {
      alert('Ju lutem krijoni një lëndë përpara se të shtoni shënime.');
      return;
    }

    const newNote: Partial<Note> = {
      title: 'Shënim pa Titull',
      content: '# Shënim pa Titull\n\nShkruani shënimet tuaja të studimit këtu duke përdorur markdown standarde.',
      courseId: defaultCourseId,
      folder: 'Shënime Klase',
    };

    onAddNote(newNote);
  };

  const handleSave = () => {
    if (!activeNoteId) return;
    onUpdateNote(activeNoteId, {
      title: title || 'Shënim pa Titull',
      content,
      courseId,
      folder,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDelete = () => {
    if (!activeNoteId) return;
    if (confirm('Jeni i sigurt që doni ta fshini këtë shënim studimi?')) {
      onDeleteNote(activeNoteId);
      setActiveNoteId(null);
    }
  };

  const getCourseName = (cId: string) => {
    return courses.find((c) => c.id === cId)?.name || 'Lëndë e Panjohur';
  };

  const getCourseColor = (cId: string) => {
    return courses.find((c) => c.id === cId)?.color || '#10b981';
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const courseMatches = selectedCourseId ? n.courseId === selectedCourseId : true;
    const folderMatches = selectedFolder ? n.folder === selectedFolder : true;
    const searchMatches = searchQuery
      ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return courseMatches && folderMatches && searchMatches;
  });

  return (
    <div id="note-editor" className="grid grid-cols-1 md:grid-cols-12 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 h-[600px] shadow-sm">
      {/* Sidebar: Notes List */}
      <div className="md:col-span-4 border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col h-full bg-zinc-50/30 dark:bg-zinc-900/10">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Shënime Studimi
            </span>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm flex items-center gap-1 text-[10px] font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Shto Shënim
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Kërko shënime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          {/* Folder Filter Pill Box */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`px-2 py-0.5 rounded-md border flex-shrink-0 transition-all ${
                !selectedFolder
                  ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent'
                  : 'border-zinc-200/60 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Të Gjitha Kategoritë
            </button>
            {FOLDERS.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                className={`px-2 py-0.5 rounded-md border flex-shrink-0 transition-all ${
                  selectedFolder === f
                    ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent'
                    : 'border-zinc-200/60 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Nuk u gjetën shënime.</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const active = note.id === activeNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`p-3.5 cursor-pointer transition-all flex flex-col justify-between ${
                    active
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-l-2 border-emerald-500'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h5 className={`text-xs font-semibold truncate ${active ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {note.title}
                    </h5>
                    <span className="text-[9px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 px-1 rounded-sm flex items-center gap-1">
                      <Folder className="w-2.5 h-2.5" />
                      {note.folder || 'Shënime Klase'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-1 truncate font-sans">
                    {note.content.replace(/[#*`]/g, '').slice(0, 60)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getCourseColor(note.courseId) }}
                    />
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono truncate max-w-[120px]">
                      {getCourseName(note.courseId)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Panel: Note Content Reader / Editor */}
      <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-zinc-950">
        {activeNote ? (
          <div className="flex flex-col h-full">
            {/* Header / Actions bar */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between flex-shrink-0">
              <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setIsEditMode(true)}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    isEditMode
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Ndrysho
                </button>
                <button
                  onClick={() => {
                    handleSave();
                    setIsEditMode(false);
                  }}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    !isEditMode
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Shiko
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all text-xs font-semibold shadow-sm flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Ruaj Ndryshimet
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 transition-colors"
                  title="Fshi Shënimin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editing / Reading Arena */}
            <div className="flex-1 overflow-y-auto p-6">
              {isEditMode ? (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                        Kategoria
                      </label>
                      <select
                        value={folder}
                        onChange={(e) => setFolder(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        {FOLDERS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                        Lënda e Lidhur
                      </label>
                      <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                      Titulli i Shënimit
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      placeholder="p.sh. Leksioni 1: Hyrje në Algjebër..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col min-h-[300px]">
                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                      Përmbajtja (Markdown)
                    </label>
                    <textarea
                      placeholder="Shkruani shënimet e studimit në markdown..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={50000}
                      className="flex-1 w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <article className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                  <div className="border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4">
                    <span
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full font-mono text-white inline-block mb-2"
                      style={{ backgroundColor: getCourseColor(courseId) }}
                    >
                      {getCourseName(courseId)}
                    </span>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {title || 'Shënim pa Titull'}
                    </h1>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 mt-1">
                      <Folder className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{folder}</span>
                      <span className="mx-1">•</span>
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Përditësuar: {activeNote.updatedAt ? new Date(activeNote.updatedAt).toLocaleDateString('sq-AL') : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Markdown Renderer Body */}
                  <div className="markdown-body text-xs font-sans space-y-4">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {content || '*Ende pa përmbajtje.*'}
                    </Markdown>
                  </div>
                </article>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-400">
            <Layout className="w-12 h-12 opacity-30 mb-2 text-zinc-400" />
            <h4 className="font-semibold text-zinc-800 dark:text-zinc-300">Asnjë Shënim i Zgjedhur</h4>
            <p className="text-xs mt-1">Zgjidhni një shënim nga lista, ose krijoni një të ri për të filluar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
