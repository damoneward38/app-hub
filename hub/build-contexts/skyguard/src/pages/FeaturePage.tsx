import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  features, 
  featureSetsMeta 
} from '../data/features';
import FeatureCard from '../components/FeatureCard';
import FeatureDetailModal from '../components/FeatureDetailModal';
import { Feature } from '../types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Layers, 
  Filter, 
  Check, 
  ShieldCheck, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

export default function FeaturePage() {
  const { page } = useParams<{ page: string }>();
  const navigate = useNavigate();
  const pageNum = Number.parseInt(page || '1', 10);
  const totalPages = Math.ceil(features.length / 13);

  if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > totalPages) {
    return <Navigate to="/404" replace />;
  }

  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewAllMatrix, setViewAllMatrix] = useState(false);

  // Current set metadata
  const currentSetMeta = featureSetsMeta.find((s) => s.set === pageNum) || featureSetsMeta[0];

  // Features per page = 13 (78 features across 6 pages)
  const start = (pageNum - 1) * 13;
  const end = start + 13;
  const pageFeatures = useMemo(() => {
    return features.slice(start, end);
  }, [start, end]);

  // Filtered features if searching or filtering by category
  const displayedFeatures = useMemo(() => {
    const source = viewAllMatrix || searchQuery.trim() !== '' || selectedCategory !== 'all' 
      ? features 
      : pageFeatures;

    return source.filter((f) => {
      const matchesSearch = searchQuery.trim() === '' || 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.titleHe && f.titleHe.includes(searchQuery)) ||
        f.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.complianceTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        f.specs.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [viewAllMatrix, searchQuery, selectedCategory, pageFeatures]);

  const categories = [
    'all',
    'Privacy & Governance',
    'OS & Infrastructure',
    'Network & WAF',
    'Identity & Zero-Trust',
    'Cryptography & DLP',
    'SIEM & SOC Operations'
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">Feature Catalog</span>
            <span>/</span>
            <span className="text-blue-600 font-mono font-bold">Set {pageNum}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewAllMatrix(!viewAllMatrix)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewAllMatrix
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-blue-600 shadow-sm'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{viewAllMatrix ? 'Viewing All 78 Modules' : 'Switch to Full 78 Matrix View'}</span>
            </button>
          </div>
        </div>

        {/* Set Switcher Tabs (Sets 1 to 6) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          {featureSetsMeta.map((s) => {
            const isActive = pageNum === s.set && !viewAllMatrix;
            return (
              <button
                key={s.set}
                onClick={() => {
                  setViewAllMatrix(false);
                  navigate(`/features/${s.set}`);
                }}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono text-xs font-bold ${isActive ? 'text-white' : 'text-blue-600'}`}>
                    Set 0{s.set}
                  </span>
                  <span className={`text-[10px] font-mono ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    #{s.range}
                  </span>
                </div>
                <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {s.title}
                </span>
                <span className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`} dir="rtl">
                  {s.titleHe}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Set Header */}
        {!viewAllMatrix && (
          <div className="bg-slate-800 text-white border border-slate-700 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-slate-700 text-blue-400 font-bold">
                    Feature Set {pageNum} of 6
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    (Features {start + 1}–{end} of 78)
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                  {currentSetMeta.title}
                </h1>
                <p className="text-sm text-slate-300 mb-2 font-medium" dir="rtl">
                  {currentSetMeta.titleHe}
                </p>
                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {currentSetMeta.desc}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/pricing"
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors whitespace-nowrap shadow-md"
                >
                  Unlock in Plan
                </Link>
                <Link
                  to="/white-label"
                  className="px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors whitespace-nowrap"
                >
                  White‑Label Stack
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, compliance tag (GDPR, WAF...)"
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        {displayedFeatures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {displayedFeatures.map((f) => (
              <FeatureCard 
                key={f.id} 
                feature={f} 
                onInspect={(feature) => setSelectedFeature(feature)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 mb-12 shadow-sm">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No matching security modules found</h3>
            <p className="text-xs text-slate-500 mb-4">Try adjusting your search query or category filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination Controls (Prev & Next) */}
        {!viewAllMatrix && searchQuery.trim() === '' && selectedCategory === 'all' && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <div>
              {pageNum > 1 ? (
                <Link
                  to={`/features/${pageNum - 1}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold hover:text-blue-600 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>← Previous Set (Set {pageNum - 1})</span>
                </Link>
              ) : (
                <div className="text-xs text-slate-400 font-mono">
                  Beginning of catalog (Set 1)
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 font-mono text-xs text-slate-500">
              <span>Set</span>
              <span className="font-bold text-slate-900 px-2 py-1 bg-white border border-slate-200 rounded shadow-sm">
                {pageNum}
              </span>
              <span>of 6</span>
            </div>

            <div>
              {pageNum * 13 < features.length ? (
                <Link
                  to={`/features/${pageNum + 1}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-md"
                >
                  <span>Next Set (Set {pageNum + 1}) →</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/white-label"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-md"
                >
                  <span>Explore White‑Label Licensing</span>
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Feature Inspection Modal */}
        <FeatureDetailModal 
          feature={selectedFeature} 
          onClose={() => setSelectedFeature(null)} 
        />
      </div>
    </div>
  );
}
