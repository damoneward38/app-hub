import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Tag, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Cpu, 
  ToggleLeft, 
  ToggleRight,
  Filter
} from 'lucide-react';
import { MemoryItem } from '../types';
import { API } from '../services/api';

interface MemoryCenterProps {
  memories: MemoryItem[];
  setMemories: React.Dispatch<React.SetStateAction<MemoryItem[]>>;
}

export const MemoryCenter: React.FC<MemoryCenterProps> = ({ memories, setMemories }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'long-term' | 'learned' | 'code' | 'preference' | 'system'>('learned');
  const [newTags, setNewTags] = useState('');

  const categories = [
    { id: 'all', label: 'All Memories' },
    { id: 'long-term', label: 'Long-Term' },
    { id: 'learned', label: 'Learned Knowledge' },
    { id: 'code', label: 'Code Standards' },
    { id: 'preference', label: 'Preferences' },
    { id: 'system', label: 'System Instructions' }
  ];

  const handleToggleActive = (id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  };

  const handleDelete = async (id: string) => {
    await API.deleteMemory(id);
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const handleAddMemory = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const tagArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const created = await API.addMemory({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      isActive: true,
      tags: tagArray.length ? tagArray : ['user-created']
    });

    setMemories(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
  };

  const filteredMemories = memories.filter(m => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const activeCount = memories.filter(m => m.isActive).length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-4 gap-4 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              Memory & Knowledge Center
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {activeCount} ACTIVE IN CONTEXT
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Persistent memory store automatically injected into Sapphire AI reasoning passes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories by title, text, or tag..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs whitespace-nowrap transition border ${
                selectedCategory === cat.id
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredMemories.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              m.isActive
                ? 'bg-slate-900/90 border-slate-700 shadow-md'
                : 'bg-slate-950/60 border-slate-800/80 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {m.category}
                </span>

                <button
                  onClick={() => handleToggleActive(m.id)}
                  title={m.isActive ? 'Active (Click to disable)' : 'Disabled (Click to activate)'}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                >
                  {m.isActive ? (
                    <ToggleRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>

              <h3 className="text-sm font-bold text-white mb-1.5">{m.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-1">
                {m.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    #{t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleDelete(m.id)}
                title="Delete Memory"
                className="p-1 hover:text-rose-400 text-slate-500 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredMemories.length === 0 && (
          <div className="col-span-full p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
            No memories match the filter. Click "Add Memory" to create one.
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" /> Store New Memory
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">Memory Title:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Primary Database Config, Team Coding Style"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="long-term">Long-Term Knowledge</option>
                  <option value="learned">Learned Pattern</option>
                  <option value="code">Code Standard</option>
                  <option value="preference">User Preference</option>
                  <option value="system">System Directive</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Content / Instructions:</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Details to remember across AI reasoning passes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none resize-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono">Tags (comma separated):</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. auth, api, rules"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs"
              >
                Save Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
