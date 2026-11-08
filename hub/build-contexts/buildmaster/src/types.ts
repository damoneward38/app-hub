export type TabType = 
  | 'home'
  | 'sapphire'
  | 'openclaw'
  | 'brain'
  | 'memory'
  | 'files'
  | 'pipeline'
  | 'pricing'
  | 'settings';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sapphire' | 'openclaw' | 'atlas' | 'system';
  content: string;
  timestamp: string;
  tokensUsed?: number;
  model?: string;
  thoughtProcess?: string[];
  suggestedMemories?: string[];
  codeSnippets?: { language: string; code: string; filename?: string }[];
}

export interface MemoryItem {
  id: string;
  category: 'long-term' | 'learned' | 'code' | 'preference' | 'system';
  title: string;
  content: string;
  timestamp: string;
  isActive: boolean;
  tags: string[];
}

export interface WorkspaceFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  size: number;
  updatedAt: string;
  isDraft?: boolean;
}

export interface TerminalLog {
  id: string;
  command: string;
  output: string;
  status: 'success' | 'error' | 'running';
  timestamp: string;
  cwd: string;
}

export interface SystemMetrics {
  uptime: string;
  cpuUsage: number;
  ramUsage: { used: number; total: number; percentage: number };
  diskUsage: { used: number; total: number; percentage: number };
  nodeVersion: string;
  activeProcesses: number;
  ollamaStatus: 'connected' | 'disconnected' | 'checking';
  geminiStatus: 'active' | 'configured' | 'standby';
}

export interface AgentPersona {
  id: 'sapphire' | 'openclaw' | 'atlas';
  name: string;
  role: string;
  badge: string;
  avatarColor: string;
  description: string;
  status: 'idle' | 'thinking' | 'streaming' | 'complete';
  currentTask?: string;
  progress?: number;
}

export interface DeploymentStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: string;
  log?: string;
}

export interface DeploymentRecord {
  id: string;
  target: 'vercel' | 'cloudflare' | 'cloudrun' | 'aws';
  commit: string;
  branch: string;
  status: 'queued' | 'building' | 'deploying' | 'live' | 'failed';
  timestamp: string;
  url?: string;
  stages: DeploymentStage[];
}

export interface AppSettings {
  ollamaBaseUrl: string;
  ollamaModel: string;
  ollamaApiKey: string;
  geminiModel: string;
  thinkingLevel: 'HIGH' | 'LOW' | 'MINIMAL';
  systemPrompt: string;
  autoSpeakResponse: boolean;
  voiceName: string;
  speechRate: number;
  wakeWordEnabled: boolean;
  autoSaveDrafts: boolean;
  activePlan: 'free' | 'pro' | 'enterprise';
}
