import React, { useState, useEffect } from 'react';
import { 
  FileCode2, 
  Save, 
  Plus, 
  Play, 
  Check, 
  Copy, 
  Sparkles, 
  FileText, 
  FolderPlus, 
  Trash2, 
  Rocket,
  Code,
  Braces,
  FileJson,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { WorkspaceFile } from '../types';
import { API } from '../services/api';

interface OpenClawEditorProps {
  onSendToSapphire?: (code: string) => void;
  onDeployTrigger?: () => void;
}

export const OpenClawEditor: React.FC<OpenClawEditorProps> = ({ onSendToSapphire, onDeployTrigger }) => {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [activeContent, setActiveContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState('typescript');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const fetched = await API.getFiles();
    if (fetched && fetched.length > 0) {
      setFiles(fetched);
      setActiveFileId(fetched[0].id);
      setActiveContent(fetched[0].content);
    } else {
      const defaultFile: WorkspaceFile = {
        id: 'file-default',
        name: 'main.ts',
        path: '/src/main.ts',
        language: 'typescript',
        content: `// OpenClaw Cloud Execution Script
export function calculateMetrics(input: number[]): number {
  return input.reduce((acc, curr) => acc + curr, 0);
}

console.log("Calculated:", calculateMetrics([10, 20, 30, 40]));`,
        size: 210,
        updatedAt: new Date().toISOString()
      };
      setFiles([defaultFile]);
      setActiveFileId(defaultFile.id);
      setActiveContent(defaultFile.content);
    }
  };

  const currentFile = files.find(f => f.id === activeFileId);

  const handleSelectFile = (file: WorkspaceFile) => {
    // Save draft of current file before switching
    if (currentFile) {
      currentFile.content = activeContent;
    }
    setActiveFileId(file.id);
    setActiveContent(file.content);
  };

  const handleSave = async () => {
    if (!currentFile) return;
    setIsSaving(true);
    try {
      await API.saveFile({
        name: currentFile.name,
        content: activeContent,
        language: currentFile.language,
        path: currentFile.path
      });
      currentFile.content = activeContent;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;
    let initialTemplate = '// New Module\n';
    if (newFileLang === 'json') initialTemplate = '{\n  "name": "project-config"\n}\n';
    if (newFileLang === 'python') initialTemplate = '#!/usr/bin/env python3\nprint("OpenClaw ready")\n';
    
    const created = await API.saveFile({
      name: newFileName.trim(),
      content: initialTemplate,
      language: newFileLang
    });

    setFiles(prev => [...prev, created]);
    setActiveFileId(created.id);
    setActiveContent(created.content);
    setIsNewFileModalOpen(false);
    setNewFileName('');
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) return;
    const remaining = files.filter(f => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
      setActiveContent(remaining[0].content);
    }
  };

  const lineCount = activeContent.split('\n').length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-4 gap-3">
      {/* Top IDE Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-cyan-400">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>{currentFile?.name || 'editor'}</span>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden md:inline">
            {lineCount} lines | {Buffer.byteLength(activeContent, 'utf8')} bytes
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSendToSapphire && (
            <button
              onClick={() => onSendToSapphire(activeContent)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Review</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-md shadow-cyan-600/20"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save File'}</span>
              </>
            )}
          </button>

          {onDeployTrigger && (
            <button
              onClick={onDeployTrigger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Deploy Build</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split View: File Sidebar + Code Editor */}
      <div className="flex-1 flex gap-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        {/* Left File Tree Panel */}
        <div className="w-56 bg-slate-900/60 border-r border-slate-800/80 p-3 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span className="font-bold uppercase tracking-wider text-slate-300">Files</span>
            <button
              onClick={() => setIsNewFileModalOpen(true)}
              title="Add New File"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
            {files.map((f) => {
              const isActive = f.id === activeFileId;
              return (
                <button
                  key={f.id}
                  onClick={() => handleSelectFile(f)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition group ${
                    isActive
                      ? 'bg-slate-800 border border-slate-700 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {f.language === 'json' ? (
                      <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : f.language === 'python' ? (
                      <FileCode2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Code className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate">{f.name}</span>
                  </div>

                  {files.length > 1 && (
                    <span
                      onClick={(e) => handleDeleteFile(f.id, e)}
                      title="Delete file"
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Editor View with Line Numbers */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* File Tabs header */}
          <div className="flex items-center gap-1 px-3 pt-2 bg-slate-900/40 border-b border-slate-800 overflow-x-auto">
            {files.map((f) => (
              <button
                key={f.id}
                onClick={() => handleSelectFile(f)}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-mono flex items-center gap-2 border-t border-x transition ${
                  f.id === activeFileId
                    ? 'bg-slate-950 border-slate-700 text-cyan-300 font-semibold'
                    : 'bg-slate-900/40 border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{f.name}</span>
              </button>
            ))}
          </div>

          {/* Editor Body */}
          <div className="flex-1 flex overflow-hidden p-3 font-mono text-xs">
            {/* Line numbers gutter */}
            <div className="select-none pr-3 text-right text-slate-600 font-mono border-r border-slate-800/80 mr-3 shrink-0">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code text area */}
            <textarea
              value={activeContent}
              onChange={(e) => setActiveContent(e.target.value)}
              spellCheck={false}
              className="flex-1 h-full w-full bg-transparent text-slate-100 focus:outline-none resize-none leading-6 font-mono selection:bg-cyan-500/30"
            />
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {isNewFileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-cyan-400" /> Create New File
              </h3>
              <button
                onClick={() => setIsNewFileModalOpen(false)}
                className="text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">File Name:</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. auth.ts, schema.json, model.py"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Language Type:</label>
                <select
                  value={newFileLang}
                  onChange={(e) => setNewFileLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                >
                  <option value="typescript">TypeScript (.ts / .tsx)</option>
                  <option value="javascript">JavaScript (.js)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="python">Python (.py)</option>
                  <option value="markdown">Markdown (.md)</option>
                  <option value="shell">Shell Script (.sh)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsNewFileModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
