import { ChatMessage, MemoryItem, WorkspaceFile, TerminalLog, SystemMetrics } from '../types';

export const API = {
  // 1. Health check
  async getHealth() {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline', agent: 'Sapphire + OpenClaw' };
    }
  },

  // 2. Telemetry
  async getMetrics(): Promise<SystemMetrics> {
    try {
      const res = await fetch('/api/system/metrics');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return await res.json();
    } catch {
      return {
        uptime: 'unavailable',
        cpuUsage: 0,
        ramUsage: { used: 0, total: 0, percentage: 0 },
        diskUsage: { used: 0, total: 0, percentage: 0 },
        nodeVersion: 'unknown',
        activeProcesses: 0,
        ollamaStatus: 'offline',
        geminiStatus: 'offline'
      };
    }
  },

  // 3. Sapphire Chat
  async sendChatMessage(message: string, persona: 'sapphire' | 'openclaw' | 'atlas' = 'sapphire', activeMemories: MemoryItem[] = []): Promise<ChatMessage> {
    try {
      const res = await fetch('/api/sapphire/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, persona, activeMemories })
      });
      if (!res.ok) throw new Error(`Chat error: ${res.status}`);
      return await res.json();
    } catch (error: any) {
      return {
        id: `err-${Date.now()}`,
        sender: persona,
        content: `Local Ollama request failed: ${error?.message || 'network error'}`,
        timestamp: new Date().toISOString(),
        tokensUsed: 0,
        model: 'unavailable'
      };
    }
  },

  // 4. Terminal Command Execution
  async execCommand(command: string, cwd?: string): Promise<TerminalLog> {
    try {
      const token = localStorage.getItem('buildmaster_terminal_token') || '';
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ command, cwd })
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          id: `err-${Date.now()}`,
          command,
          output: data?.error || `Terminal error: HTTP ${res.status}`,
          status: 'error',
          timestamp: new Date().toISOString(),
          cwd: cwd || '/app'
        };
      }
      return data;
    } catch (e: any) {
      return {
        id: `err-${Date.now()}`,
        command,
        output: `Error executing command: ${e.message || 'Network error'}`,
        status: 'error',
        timestamp: new Date().toISOString(),
        cwd: cwd || '/workspace/project'
      };
    }
  },

  // 5. Memory Management
  async getMemories(): Promise<MemoryItem[]> {
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      return data.memories || [];
    } catch {
      return [];
    }
  },

  async addMemory(memory: Omit<MemoryItem, 'id' | 'timestamp'>): Promise<MemoryItem> {
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memory)
    });
    return await res.json();
  },

  async deleteMemory(id: string): Promise<boolean> {
    const res = await fetch(`/api/memory/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // 6. Workspace Files
  async getFiles(): Promise<WorkspaceFile[]> {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      return data.files || [];
    } catch {
      return [];
    }
  },

  async saveFile(file: { name: string; content: string; language?: string; path?: string }): Promise<WorkspaceFile> {
    const res = await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(file)
    });
    return await res.json();
  },

  // 7. Ollama Test
  async testOllama(url: string, model: string) {
    const res = await fetch('/api/ollama/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, model })
    });
    return await res.json();
  },

  // 8. Multi-Agent Hub Collaboration
  async collaborate(task: string) {
    const res = await fetch('/api/hub/collaborate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task })
    });
    return await res.json();
  },

  // 9. Site & Security Scanner
  async scanSite() {
    const res = await fetch('/api/brain/scan');
    return await res.json();
  }
};
