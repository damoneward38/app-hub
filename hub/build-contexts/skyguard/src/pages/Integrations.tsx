import React, { useState } from 'react';
import { 
  Plug, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Shield, 
  Cloud, 
  Activity, 
  Key, 
  Bell, 
  Plus, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { initialIntegrations } from '../services/mockSecurityApi';
import { IntegrationConnector } from '../types';

export default function Integrations() {
  const [connectors, setConnectors] = useState<IntegrationConnector[]>(initialIntegrations);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookName, setWebhookName] = useState('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return Terminal;
      case 'Shield': return Shield;
      case 'Cloud': return Cloud;
      case 'Activity': return Activity;
      case 'Key': return Key;
      default: return Bell;
    }
  };

  const handleTriggerSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, lastSync: 'Just now (0s ago)', status: 'connected' } : c
        )
      );
    }, 1000);
  };

  const handleToggleConnection = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'connected' ? 'disconnected' : 'connected';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || !webhookName.trim()) return;

    const newConnector: IntegrationConnector = {
      id: `custom_webhook_${Math.floor(Math.random() * 899 + 100)}`,
      name: webhookName,
      category: 'Incident Notification',
      icon: 'Bell',
      status: 'connected',
      lastSync: 'Real-time',
      eventsIngestedToday: 0,
      description: `Custom enterprise webhook forwarding to ${webhookUrl}`,
    };

    setConnectors([...connectors, newConnector]);
    setWebhookName('');
    setWebhookUrl('');
    setIsAddingWebhook(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Plug className="w-3.5 h-3.5" />
            <span>SIEM, SOAR &amp; Cloud Connectors</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Security Integrations Hub
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Bi-Directional Telemetry Piping • Real-Time SOC Forwarding • Webhook Dispatcher
          </p>
        </div>

        <button
          onClick={() => setIsAddingWebhook(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Webhook</span>
        </button>
      </div>

      {/* Add Custom Webhook Drawer */}
      {isAddingWebhook && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-md animate-in fade-in">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Configure Custom Security Event Webhook
            </h3>
            <button
              onClick={() => setIsAddingWebhook(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddWebhook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Integration / Service Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Corporate Security Ops Slack Hook"
                value={webhookName}
                onChange={(e) => setWebhookName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                HTTPS Webhook Target URL
              </label>
              <input
                type="url"
                required
                placeholder="https://hooks.slack.com/services/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Register &amp; Test Webhook
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => {
          const Icon = getIcon(c.icon);
          const isConnected = c.status === 'connected';
          const isSyncing = syncingId === c.id;

          return (
            <div
              key={c.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    isConnected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                  <span className="text-[10px] font-mono text-blue-600 uppercase font-bold block mt-0.5">
                    {c.category}
                  </span>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs font-mono">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Last Ingest:</span>
                  <strong className="text-slate-800">{c.lastSync}</strong>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Today's Events:</span>
                  <strong className="text-blue-600">{c.eventsIngestedToday.toLocaleString()}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleTriggerSync(c.id)}
                    disabled={isSyncing || !isConnected}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleConnection(c.id)}
                    className={`p-2 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${
                      isConnected
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
