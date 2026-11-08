import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  Area,
} from 'recharts';
import {
  DollarSign,
  Layers,
  Users,
  Cpu,
  RefreshCw,
  Zap,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import type { MagenUsageRecord, TenantAggregatedUsage } from '../types';

interface TenantUsageCardProps {
  className?: string;
  onSelectTenant?: (tenantId: string) => void;
}

const COLORS = [
  '#6366f1', // Indigo (Nero-4.0)
  '#06b6d4', // Cyan (Sapphire)
  '#10b981', // Emerald (Safe/Guard)
  '#f59e0b', // Amber (High Compute)
  '#ec4899', // Pink
  '#8b5cf6', // Violet
];

export const TenantUsageCard: React.FC<TenantUsageCardProps> = ({
  className = '',
  onSelectTenant,
}) => {
  const [usageRecords, setUsageRecords] = useState<MagenUsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>('ALL');
  const [chartView, setChartView] = useState<'cost' | 'characters' | 'composed' | 'models'>('composed');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch usage records from /api/magen-raki/usage
  const fetchUsageData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/magen-raki/usage');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch usage data`);
      }
      const data: MagenUsageRecord[] = await res.json();
      setUsageRecords(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Error fetching /api/magen-raki/usage:', err);
      setError(err.message || 'Failed to connect to usage API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  // Optional auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchUsageData();
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Aggregate by Tenant
  const tenantAggregations: TenantAggregatedUsage[] = useMemo(() => {
    const map = new Map<string, TenantAggregatedUsage>();

    usageRecords.forEach((record) => {
      const existing = map.get(record.tenantId) || {
        tenantId: record.tenantId,
        requestsCount: 0,
        inputCharacters: 0,
        outputCharacters: 0,
        totalCharacters: 0,
        estimatedCost: 0,
        modelsUsed: [],
      };

      existing.requestsCount += 1;
      existing.inputCharacters += record.inputCharacters;
      existing.outputCharacters += record.outputCharacters;
      existing.totalCharacters += record.inputCharacters + record.outputCharacters;
      existing.estimatedCost += record.estimatedCost;

      if (!existing.modelsUsed.includes(record.model)) {
        existing.modelsUsed.push(record.model);
      }

      map.set(record.tenantId, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalCharacters - a.totalCharacters);
  }, [usageRecords]);

  // Model-level breakdown for pie chart
  const modelAggregations = useMemo(() => {
    const map = new Map<string, { name: string; value: number; characters: number; cost: number }>();

    usageRecords.forEach((record) => {
      const existing = map.get(record.model) || {
        name: record.model,
        value: 0,
        characters: 0,
        cost: 0,
      };

      existing.value += 1;
      existing.characters += record.inputCharacters + record.outputCharacters;
      existing.cost += record.estimatedCost;

      map.set(record.model, existing);
    });

    return Array.from(map.values());
  }, [usageRecords]);

  // Filtered dataset based on dropdown
  const filteredTenantData = useMemo(() => {
    if (selectedTenantFilter === 'ALL') {
      return tenantAggregations;
    }
    return tenantAggregations.filter((t) => t.tenantId === selectedTenantFilter);
  }, [tenantAggregations, selectedTenantFilter]);

  // High-level summary totals
  const totalSpend = useMemo(
    () => usageRecords.reduce((sum, r) => sum + r.estimatedCost, 0),
    [usageRecords]
  );
  const totalCharacters = useMemo(
    () => usageRecords.reduce((sum, r) => sum + r.inputCharacters + r.outputCharacters, 0),
    [usageRecords]
  );
  const totalInputChars = useMemo(
    () => usageRecords.reduce((sum, r) => sum + r.inputCharacters, 0),
    [usageRecords]
  );
  const totalOutputChars = useMemo(
    () => usageRecords.reduce((sum, r) => sum + r.outputCharacters, 0),
    [usageRecords]
  );
  const totalRequests = usageRecords.length;
  const uniqueTenantsCount = tenantAggregations.length;

  // Simulate a live inference to immediately update the graph
  const handleSimulateInference = async () => {
    setIsSimulating(true);
    setSimulationNotice(null);
    try {
      const sampleTenants = ['sapphire', 'openclaw', 'enterprise-alpha', 'fintech-shield', 'neural-core'];
      const randomTenant = sampleTenants[Math.floor(Math.random() * sampleTenants.length)];
      const samplePrompts = [
        'Analyze repository AST for zero-day memory leaks.',
        'Evaluate SOC-2 compliance for production cloud enclave.',
        'Run Six 686 hardware risk scoring on inbound API webhook.',
        'Verify SHA-512 cryptographic seal on immutable ledger.',
      ];
      const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];

      const res = await fetch('/api/magen-raki/inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nero-4.0',
          prompt: randomPrompt,
          tenantId: randomTenant,
        }),
      });

      if (!res.ok) {
        throw new Error('Inference API rejected execution');
      }

      await fetchUsageData();
      setSimulationNotice(`Inference logged for tenant "${randomTenant}" via /api/magen-raki/inference`);
      setTimeout(() => setSimulationNotice(null), 4000);
    } catch (err: any) {
      console.error('Simulate error:', err);
      setSimulationNotice(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Export JSON summary
  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(usageRecords, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magen-raki-usage-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-indigo-500/30 backdrop-blur-md rounded-xl p-3.5 shadow-2xl text-xs space-y-1.5 z-50 min-w-[200px]">
          <div className="font-semibold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="text-indigo-400 capitalize">{label || payload[0]?.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-mono">
              Tenant Metric
            </span>
          </div>
          {payload.map((entry: any, index: number) => {
            const isCost = entry.dataKey === 'estimatedCost' || entry.name.toLowerCase().includes('cost');
            const isCharacters = entry.dataKey?.includes('Char') || entry.dataKey === 'totalCharacters';
            let formattedVal = entry.value;

            if (isCost) {
              formattedVal = `$${Number(entry.value).toFixed(6)}`;
            } else if (isCharacters || typeof entry.value === 'number') {
              formattedVal = Number(entry.value).toLocaleString();
            }

            return (
              <div key={`tooltip-${index}`} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                  <span className="text-slate-400">{entry.name}:</span>
                </span>
                <span className="font-mono font-medium text-slate-100">{formattedVal}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="magen-tenant-usage-card"
      className={`bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/30 transition-all rounded-2xl p-6 shadow-xl backdrop-blur-sm ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-100 tracking-tight">
                  Tenant Inference & Metering Telemetry
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Pay-Per-Char
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time usage tracking & character billing aggregated from{' '}
                <code className="text-indigo-300 font-mono bg-indigo-950/40 px-1 py-0.5 rounded text-[11px]">
                  /api/magen-raki/usage
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tenant Selector Dropdown */}
          <div className="relative inline-block text-xs">
            <select
              value={selectedTenantFilter}
              onChange={(e) => {
                setSelectedTenantFilter(e.target.value);
                if (onSelectTenant && e.target.value !== 'ALL') {
                  onSelectTenant(e.target.value);
                }
              }}
              className="bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none text-xs font-medium"
            >
              <option value="ALL">All Tenants ({tenantAggregations.length})</option>
              {tenantAggregations.map((t) => (
                <option key={t.tenantId} value={t.tenantId}>
                  {t.tenantId} ({t.requestsCount} reqs)
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Chart View Switcher Buttons */}
          <div className="flex rounded-lg bg-slate-800/70 p-0.5 border border-slate-700/70 text-xs">
            <button
              onClick={() => setChartView('composed')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                chartView === 'composed'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dual-axis Cost & Character volume"
            >
              Dual Axis
            </button>
            <button
              onClick={() => setChartView('characters')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                chartView === 'characters'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Input vs Output Characters"
            >
              Characters
            </button>
            <button
              onClick={() => setChartView('cost')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                chartView === 'cost'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Total Estimated Cost ($)"
            >
              Cost ($)
            </button>
            <button
              onClick={() => setChartView('models')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                chartView === 'models'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Model Distribution"
            >
              Models
            </button>
          </div>

          {/* Simulate Inference Trigger */}
          <button
            onClick={handleSimulateInference}
            disabled={isSimulating}
            className="flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all disabled:opacity-50"
            title="Dispatch a test protected inference to record new usage"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-bounce text-amber-400' : 'text-indigo-400'}`} />
            <span>{isSimulating ? 'Scoring...' : 'Test Charge'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchUsageData}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all disabled:opacity-50"
            title="Refresh usage telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2 py-1 text-[11px] font-mono rounded-lg border transition-all ${
              autoRefresh
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 8s auto polling"
          >
            {autoRefresh ? 'Auto 8s ON' : 'Auto OFF'}
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Export usage records JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulation Feedback Alert */}
      {simulationNotice && (
        <div className="mt-4 p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{simulationNotice}</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400">Live Graph Updated</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Error loading usage data: {error}</span>
          <button
            onClick={fetchUsageData}
            className="ml-auto underline hover:text-rose-200 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Tiles Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
        {/* Total Cost */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Billed Spend</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            ${totalSpend.toFixed(5)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-medium">@ $0.0000001</span> / char
          </div>
        </div>

        {/* Total Characters */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Characters</span>
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300">
            {totalCharacters.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between font-mono">
            <span>In: {totalInputChars.toLocaleString()}</span>
            <span>Out: {totalOutputChars.toLocaleString()}</span>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Tenants</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {uniqueTenantsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {tenantAggregations.slice(0, 3).map((t) => t.tenantId).join(', ')}
            {tenantAggregations.length > 3 ? '...' : ''}
          </div>
        </div>

        {/* Inferences Executed */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Requests</span>
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-xl font-bold font-mono text-violet-300">
            {totalRequests}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono text-slate-400">
            Avg ~{totalRequests ? Math.round(totalCharacters / totalRequests).toLocaleString() : 0} char/req
          </div>
        </div>
      </div>

      {/* Recharts Visualization Container */}
      <div className="mt-6 bg-slate-950/60 border border-slate-800/90 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-semibold text-slate-200">
              {chartView === 'composed' && 'Dual Axis: Character Volume vs. Estimated Cost'}
              {chartView === 'characters' && 'Input vs. Output Character Distribution per Tenant'}
              {chartView === 'cost' && 'Estimated Cost ($ USD) per Tenant'}
              {chartView === 'models' && 'Model Usage Share Across All Inferences'}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>

        {/* Chart Render Area */}
        <div className="h-[280px] w-full">
          {isLoading && usageRecords.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Fetching telemetry records from /api/magen-raki/usage...</span>
            </div>
          ) : filteredTenantData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <span>No usage records found for selected filter.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'composed' ? (
                <ComposedChart
                  data={filteredTenantData}
                  margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="tenantId"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#818cf8"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                    label={{
                      value: 'Total Chars',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: '#818cf8', fontSize: 10 },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `$${Number(val).toFixed(4)}`}
                    label={{
                      value: 'Cost ($)',
                      angle: 90,
                      position: 'insideRight',
                      style: { fill: '#10b981', fontSize: 10 },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="totalCharacters"
                    name="Total Characters"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="estimatedCost"
                    name="Estimated Cost ($)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              ) : chartView === 'characters' ? (
                <BarChart
                  data={filteredTenantData}
                  margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="tenantId"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                  <Bar
                    dataKey="inputCharacters"
                    name="Input Chars"
                    fill="#3b82f6"
                    stackId="chars"
                    radius={[0, 0, 0, 0]}
                    maxBarSize={48}
                  />
                  <Bar
                    dataKey="outputCharacters"
                    name="Output Chars"
                    fill="#06b6d4"
                    stackId="chars"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              ) : chartView === 'cost' ? (
                <BarChart
                  data={filteredTenantData}
                  margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="tenantId"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `$${Number(val).toFixed(4)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                  <Bar
                    dataKey="estimatedCost"
                    name="Estimated Cost ($)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  >
                    {filteredTenantData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                  />
                  <Pie
                    data={modelAggregations}
                    cx="40%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="characters"
                    nameKey="name"
                  >
                    {modelAggregations.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tenant Breakdown Table List */}
      <div className="mt-5 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Tenant Usage Breakdown
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredTenantData.length} active tenant{filteredTenantData.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-mono text-[11px]">
                <th className="py-2 px-2.5">Tenant ID</th>
                <th className="py-2 px-2.5">Requests</th>
                <th className="py-2 px-2.5">Input Chars</th>
                <th className="py-2 px-2.5">Output Chars</th>
                <th className="py-2 px-2.5">Total Chars</th>
                <th className="py-2 px-2.5 text-right">Est. Cost ($)</th>
                <th className="py-2 px-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTenantData.map((tenant, idx) => (
                <tr
                  key={tenant.tenantId}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectTenant && onSelectTenant(tenant.tenantId)}
                >
                  <td className="py-2.5 px-2.5 font-sans font-medium text-slate-200 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="capitalize">{tenant.tenantId}</span>
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-300">
                    {tenant.requestsCount}
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-400">
                    {tenant.inputCharacters.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-400">
                    {tenant.outputCharacters.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-indigo-300 font-semibold">
                    {tenant.totalCharacters.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-emerald-400 font-semibold text-right">
                    ${tenant.estimatedCost.toFixed(6)}
                  </td>
                  <td className="py-2.5 px-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTenantFilter(
                          selectedTenantFilter === tenant.tenantId ? 'ALL' : tenant.tenantId
                        );
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition-all font-sans"
                    >
                      {selectedTenantFilter === tenant.tenantId ? 'Clear Filter' : 'Filter'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
