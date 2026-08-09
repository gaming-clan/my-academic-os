import { useState, useRef } from 'react';
import { Upload, FileText, Check, X, BookOpen, FileUp, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Course, Note } from '../types';

interface MaterialUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  selectedCourseId: string | null;
  onAddNote: (note: Partial<Note>) => void;
}

const MATERIAL_FOLDERS = [
  'Libër Mësimor',
  'Material Mësimor',
  'Shënime Klase',
  'Leksione',
  'Udhëzues Studimi',
  'Laborator',
  'Të Përgjithshme',
];

interface ProcessedFile {
  id: string;
  file: File;
  title: string;
  content: string;
  courseId: string;
  folder: string;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
}

export default function MaterialUploaderModal({
  isOpen,
  onClose,
  courses,
  selectedCourseId,
  onAddNote,
}: MaterialUploaderModalProps) {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const defaultCourseId = selectedCourseId || (courses.length > 0 ? courses[0].id : '');

  const processFile = async (file: File) => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    // Add placeholder item
    const initialItem: ProcessedFile = {
      id: fileId,
      file,
      title: cleanTitle,
      content: '',
      courseId: defaultCourseId,
      folder: 'Libër Mësimor',
      status: 'processing',
    };

    setProcessedFiles((prev) => [...prev, initialItem]);
    setActiveFileId(fileId);

    try {
      let extractedText = '';
      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      if (['txt', 'md', 'markdown', 'json', 'csv', 'log', 'html', 'htm'].includes(extension)) {
        extractedText = await readAsText(file);
      } else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) {
        const dataUrl = await readAsDataUrl(file);
        extractedText = `> 🖼️ **Imazh i Materialit Mësimor / Shënimeve**\n> - **Skedari:** \`${file.name}\`\n\n![${cleanTitle}](${dataUrl})\n\n## Përmbledhje & Shënime mbi Imazhin\n- *Shtoni përmbledhjen apo shënimet tuaja për këtë imazh këtu...*`;
      } else if (extension === 'pdf') {
        extractedText = await readPdfText(file);
      } else {
        // Fallback for docx/doc or other file types
        extractedText = await readAsTextFallback(file);
      }

      const formattedContent = formatToMarkdown(file.name, extractedText, extension);

      setProcessedFiles((prev) =>
        prev.map((item) =>
          item.id === fileId
            ? { ...item, content: formattedContent, status: 'ready' }
            : item
        )
      );
    } catch (err: any) {
      setProcessedFiles((prev) =>
        prev.map((item) =>
          item.id === fileId
            ? {
                ...item,
                status: 'error',
                errorMessage: err?.message || 'Ndodhi një gabim gjatë leximit të skedarit.',
              }
            : item
        )
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => processFile(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => processFile(file));
    }
  };

  const handleImportSingle = (item: ProcessedFile) => {
    if (!item.courseId) {
      alert('Ju lutem zgjidhni një lëndë për këtë material.');
      return;
    }

    onAddNote({
      title: item.title || 'Material i Ngarkuar',
      content: item.content,
      courseId: item.courseId,
      folder: item.folder || 'Libër Mësimor',
    });

    setProcessedFiles((prev) => prev.filter((f) => f.id !== item.id));
    if (activeFileId === item.id) {
      const remaining = processedFiles.filter((f) => f.id !== item.id);
      setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
    }

    if (processedFiles.length <= 1) {
      onClose();
    }
  };

  const handleImportAll = () => {
    const readyItems = processedFiles.filter((item) => item.status === 'ready');
    if (readyItems.length === 0) return;

    readyItems.forEach((item) => {
      onAddNote({
        title: item.title || 'Material i Ngarkuar',
        content: item.content,
        courseId: item.courseId || defaultCourseId,
        folder: item.folder || 'Libër Mësimor',
      });
    });

    setProcessedFiles([]);
    setActiveFileId(null);
    onClose();
  };

  const activeItem = processedFiles.find((f) => f.id === activeFileId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                Ngarko Materiale Mësimore <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                Importoni libra, shënime &amp; dokumente dhe kthejini automatikisht në shënime me formatim të duhur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 bg-zinc-50/30 dark:bg-zinc-900/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.markdown,.doc,.docx,.png,.jpg,.jpeg,.webp,.json,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-10 h-10 mx-auto text-emerald-500 mb-3 animate-bounce" />
            <h4 className="font-bold text-sm text-zinc-700 dark:text-zinc-200">
              Tërhiqni skedarët këtu ose klikoni për të shfletuar
            </h4>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-md mx-auto">
              Mbështet skedarë teksti (<strong>.txt, .md</strong>), libra e dokumente (<strong>.pdf, .docx</strong>) dhe imazhe (<strong>.png, .jpg</strong>)
            </p>
          </div>

          {/* Processed Files List & Formatter */}
          {processedFiles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 border-t border-zinc-100 dark:border-zinc-900 pt-6">
              {/* File list sidebar */}
              <div className="md:col-span-4 space-y-2 max-h-80 overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 font-mono mb-2">
                  <span>Skedarët e Zgjedhur ({processedFiles.length})</span>
                </div>
                {processedFiles.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveFileId(item.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      activeFileId === item.id
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.status === 'processing' ? (
                      <span className="text-[10px] text-amber-500 font-mono animate-pulse">Duke u përpunuar...</span>
                    ) : item.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Active File Formatter & Editor */}
              <div className="md:col-span-8 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl p-4 border border-zinc-200/60 dark:border-zinc-800/60 space-y-4">
                {activeItem ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                          Titulli i Shënimit
                        </label>
                        <input
                          type="text"
                          value={activeItem.title}
                          onChange={(e) =>
                            setProcessedFiles((prev) =>
                              prev.map((f) => (f.id === activeItem.id ? { ...f, title: e.target.value } : f))
                            )
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 font-semibold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                          Lënda e Caktuar
                        </label>
                        <select
                          value={activeItem.courseId}
                          onChange={(e) =>
                            setProcessedFiles((prev) =>
                              prev.map((f) => (f.id === activeItem.id ? { ...f, courseId: e.target.value } : f))
                            )
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                        >
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                          Kategoria e Shënimit
                        </label>
                        <select
                          value={activeItem.folder}
                          onChange={(e) =>
                            setProcessedFiles((prev) =>
                              prev.map((f) => (f.id === activeItem.id ? { ...f, folder: e.target.value } : f))
                            )
                          }
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                        >
                          {MATERIAL_FOLDERS.map((fold) => (
                            <option key={fold} value={fold}>
                              {fold}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                        Teksti i Nxjerrë &amp; Formatuar në Markdown
                      </label>
                      <textarea
                        value={activeItem.content}
                        onChange={(e) =>
                          setProcessedFiles((prev) =>
                            prev.map((f) => (f.id === activeItem.id ? { ...f, content: e.target.value } : f))
                          )
                        }
                        rows={8}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleImportSingle(activeItem)}
                        disabled={activeItem.status !== 'ready'}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Krijo Shënimin për Këtë Material
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-zinc-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Zgjidhni një skedar nga lista majtas për ta parashikuar ose modifikuar.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <span className="text-xs text-zinc-400 font-mono">
            {processedFiles.length > 0 ? `${processedFiles.length} skedar(ë) gati për importim` : 'Asnjë skedar i zgjedhur'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
            >
              Anulo
            </button>
            {processedFiles.length > 0 && (
              <button
                onClick={handleImportAll}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Importo të Gjitha në Shënime
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers for file reading
async function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readPdfText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const decoded = decoder.decode(bytes);

        const textMatches: string[] = [];
        const tjRegex = /\(([^)]+)\)\s*T[jJ]/g;
        let match;
        while ((match = tjRegex.exec(decoded)) !== null) {
          if (match[1] && match[1].trim().length > 0) {
            textMatches.push(match[1]);
          }
        }

        if (textMatches.length > 5) {
          resolve(textMatches.join(' '));
          return;
        }

        // Fallback: extract continuous printable lines
        const cleanLines = decoded
          .replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, ' ')
          .split(/[\r\n]+/)
          .map((line) => line.trim())
          .filter(
            (line) =>
              line.length > 3 &&
              !line.startsWith('%PDF') &&
              !line.includes('endobj') &&
              !line.includes('stream') &&
              !line.includes('xref')
          );

        resolve(cleanLines.length > 0 ? cleanLines.join('\n') : `[U analizua struktura e PDF-së: ${file.name}]`);
      } catch (e) {
        resolve(`[Përmbajtja e skedarit PDF: ${file.name}]`);
      }
    };
    reader.onerror = () => resolve(`[Nuk u mundësua leximi automatik i PDF-së: ${file.name}]`);
    reader.readAsArrayBuffer(file);
  });
}

async function readAsTextFallback(file: File): Promise<string> {
  try {
    const text = await readAsText(file);
    // Remove null bytes / binary non-printable junk
    return text.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ' ');
  } catch (e) {
    return `[Nuk u mundësua nxjerrja e plotë e tekstit për skedarin ${file.name}]`;
  }
}

function formatToMarkdown(filename: string, rawContent: string, extension: string): string {
  const cleanTitle = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const dateStr = new Date().toLocaleDateString('sq-AL');

  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) {
    return rawContent; // Already formatted with img tag
  }

  const lines = rawContent.split('\n');
  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';

    if (/^(KAPITULLI|LEKSIONI|KAPITULL|CHAPTER|SECTION|LEKSION|MODULI)\s+\d+/i.test(trimmed)) {
      return `\n## ${trimmed}\n`;
    }
    if (/^\d+\.\s+[A-ZÇË]/.test(trimmed)) {
      return `\n### ${trimmed}\n`;
    }
    if (/^[•\-*]\s+/.test(trimmed)) {
      return trimmed;
    }
    return trimmed;
  });

  const bodyMarkdown = formattedLines.join('\n').replace(/\n{3,}/g, '\n\n');

  return `# ${cleanTitle}\n\n> 📚 **Material Mësimor i Importuar**\n> - **Skedari Origjinal:** \`${filename}\`\n> - **Data e Importimit:** ${dateStr}\n\n---\n\n${bodyMarkdown || '*Skedari u importua me sukses. Ju lutem plotësoni shënimet tuaja.*'}`;
}
