import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { AppState, Job, JsonValue, StoredRecord } from './types.js';

type CollectionName = 'jobs' | 'records' | 'state';

class Mutex {
  private tail: Promise<void> = Promise.resolve();

  run<T>(task: () => Promise<T>): Promise<T> {
    const start = this.tail;
    let release: () => void = () => undefined;
    this.tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    return start.then(task).finally(release);
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function safeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'default';
}

export class PortfolioStore {
  private readonly root: string;
  private readonly mutex = new Mutex();
  private readonly cache = new Map<CollectionName, unknown>();

  constructor(root: string) {
    this.root = root;
  }

  async init(): Promise<void> {
    await fs.mkdir(this.root, { recursive: true });
    await fs.mkdir(path.join(this.root, 'records'), { recursive: true });
    await fs.access(this.root, fs.constants.W_OK);
  }

  private file(name: CollectionName): string {
    return path.join(this.root, `${name}.json`);
  }

  private async load<T>(name: CollectionName, fallback: T): Promise<T> {
    if (this.cache.has(name)) return clone(this.cache.get(name) as T);
    try {
      const raw = await fs.readFile(this.file(name), 'utf8');
      const parsed = JSON.parse(raw) as T;
      this.cache.set(name, parsed);
      return clone(parsed);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') throw error;
      this.cache.set(name, fallback);
      return clone(fallback);
    }
  }

  private async persist<T>(name: CollectionName, value: T): Promise<void> {
    const target = this.file(name);
    const tmp = `${target}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
    await fs.rename(tmp, target);
    this.cache.set(name, clone(value));
  }

  async listJobs(limit = 100, appId?: string): Promise<Job[]> {
    return this.mutex.run(async () => {
      const jobs = await this.load<Job[]>('jobs', []);
      const filtered = appId ? jobs.filter((job) => job.appId === appId) : jobs;
      return filtered.slice(-Math.max(1, Math.min(limit, 500))).reverse();
    });
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.mutex.run(async () => {
      const jobs = await this.load<Job[]>('jobs', []);
      return jobs.find((job) => job.id === id);
    });
  }

  async saveJob(job: Job): Promise<void> {
    await this.mutex.run(async () => {
      const jobs = await this.load<Job[]>('jobs', []);
      const index = jobs.findIndex((item) => item.id === job.id);
      if (index >= 0) jobs[index] = clone(job);
      else jobs.push(clone(job));
      await this.persist('jobs', jobs.slice(-1000));
    });
  }

  async listRecords(appId: string, collection: string): Promise<StoredRecord[]> {
    return this.mutex.run(async () => {
      const records = await this.load<StoredRecord[]>('records', []);
      return records.filter((record) => record.appId === appId && record.collection === collection);
    });
  }

  async putRecord(record: StoredRecord): Promise<StoredRecord> {
    return this.mutex.run(async () => {
      const records = await this.load<StoredRecord[]>('records', []);
      const index = records.findIndex((item) => item.id === record.id);
      if (index >= 0) records[index] = clone(record);
      else records.push(clone(record));
      await this.persist('records', records.slice(-5000));
      return clone(record);
    });
  }

  async deleteRecord(appId: string, collection: string, id: string): Promise<boolean> {
    return this.mutex.run(async () => {
      const records = await this.load<StoredRecord[]>('records', []);
      const next = records.filter((item) => !(item.id === id && item.appId === appId && item.collection === collection));
      if (next.length === records.length) return false;
      await this.persist('records', next);
      return true;
    });
  }

  async getState(appId: string): Promise<AppState | undefined> {
    return this.mutex.run(async () => {
      const states = await this.load<Record<string, AppState>>('state', {});
      return states[safeName(appId)];
    });
  }

  async putState(appId: string, data: JsonValue): Promise<AppState> {
    return this.mutex.run(async () => {
      const states = await this.load<Record<string, AppState>>('state', {});
      const next: AppState = { appId, updatedAt: new Date().toISOString(), data };
      states[safeName(appId)] = next;
      await this.persist('state', states);
      return clone(next);
    });
  }

  async health(): Promise<{ ok: boolean; root: string; jobs: number; records: number }> {
    try {
      await fs.access(this.root, fs.constants.W_OK);
      const jobs = await this.listJobs(500);
      const records = await this.mutex.run(async () => this.load<StoredRecord[]>('records', []));
      return { ok: true, root: this.root, jobs: jobs.length, records: records.length };
    } catch {
      return { ok: false, root: this.root, jobs: 0, records: 0 };
    }
  }
}
