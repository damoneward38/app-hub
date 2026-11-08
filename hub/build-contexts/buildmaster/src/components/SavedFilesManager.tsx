import React, { useState } from 'react';
import { 
  FolderGit2, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink, 
  Plus, 
  FileJson, 
  Search,
  HardDrive,
  CloudUpload
} from 'lucide-react';
import { WorkspaceFile } from '../types';
import { API } from '../services/api';

interface SavedFilesManagerProps {
  files: WorkspaceFile[];
  setFiles: React.Dispatch<React.SetStateAction<WorkspaceFile[]>>;
  onOpenInEditor?: (file: WorkspaceFile) => void;
}

export const SavedFilesManager: React.FC<SavedFilesManagerProps> = ({ files, setFiles, onOpenInEditor }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadLang, setUploadLang] = useState('typescript');

  const handleDownload = (file: WorkspaceFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateNew = async () => {
    if (!uploadName.trim()) return;
    const created = await API.saveFile({
      name: uploadName.trim(),
      content: uploadContent || '// Created via Project File Manager\n',
      language: uploadLang
    });

    setFiles(prev => [...prev, created]);
    setIsUploadModalOpen(false);
    setUploadName('');
    setUploadContent('');
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.language.toLowerCase().includes(search.toLowerCase())
  );

  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              Saved Files & S3-Backed Storage
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/30 font-mono">
                {files.length} ASSETS ({Math.round(totalBytes / 1024)} KB)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Persistent project files with direct download, code editor sync, and AI analysis.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Project File</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative p-2 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter workspace files by name or language..."
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
        />
      </div>

      {/* File Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-sky-400">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate max-w-[180px]">{file.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{file.path}</span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-slate-950 text-sky-300 border border-slate-800">
                  {file.language}
                </span>
              </div>

              {/* Code preview snippet */}
              <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-24 leading-relaxed">
                {file.content.slice(0, 160)}
                {file.content.length > 160 && '...'}
              </pre>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                {file.size || Buffer.byteLength(file.content, 'utf8')} B
              </span>

              <div className="flex items-center gap-1.5">
                {onOpenInEditor && (
                  <button
                    onClick={() => onOpenInEditor(file)}
                    title="Open in OpenClaw Editor"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => handleCopy(file.id, file.content)}
                  title="Copy file content"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                >
                  {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleDownload(file)}
                  title="Download File"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-sky-400" /> Save Project File
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">File Name:</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. database.ts, api.py, README.md"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-sky-500 focus:outline-none font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Language Type:</label>
                <select
                  value={uploadLang}
                  onChange={(e) => setUploadLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-sky-500 focus:outline-none font-mono"
                >
                  <option value="typescript">TypeScript (.ts)</option>
                  <option value="javascript">JavaScript (.js)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="python">Python (.py)</option>
                  <option value="markdown">Markdown (.md)</option>
                  <option value="shell">Shell (.sh)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Content Body:</label>
                <textarea
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  rows={4}
                  placeholder="Paste or write file code here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-sky-500 focus:outline-none resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                disabled={!uploadName.trim()}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs"
              >
                Save File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
