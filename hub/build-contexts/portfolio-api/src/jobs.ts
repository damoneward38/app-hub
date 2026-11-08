import { randomUUID } from 'node:crypto';
import type { PortfolioStore } from './store.js';
import type { Job, JobEvent, JobHandler, JsonValue } from './types.js';

type Subscriber = (job: Job, event: JobEvent) => void;

export class JobManager {
  private readonly store: PortfolioStore;
  private readonly handlers: Record<string, JobHandler>;
  private readonly subscribers = new Set<Subscriber>();
  private readonly cancelled = new Set<string>();
  private readonly queue: string[] = [];
  private running = 0;
  private readonly concurrency: number;

  constructor(store: PortfolioStore, handlers: Record<string, JobHandler>, concurrency = 2) {
    this.store = store;
    this.handlers = handlers;
    this.concurrency = Math.max(1, Math.min(concurrency, 8));
  }

  capabilities(): string[] {
    return Object.keys(this.handlers).sort();
  }

  async create(appId: string, type: string, input: JsonValue): Promise<Job> {
    const handler = this.handlers[type];
    if (!handler) throw new Error(`Unknown job type: ${type}`);
    const now = new Date().toISOString();
    const job: Job = {
      id: randomUUID(),
      appId,
      type,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
      input,
      events: []
    };
    await this.store.saveJob(job);
    await this.emit(job, 'info', 'Job queued');
    this.queue.push(job.id);
    this.drain();
    return job;
  }

  async cancel(id: string): Promise<Job | undefined> {
    const job = await this.store.getJob(id);
    if (!job || job.finishedAt) return job;
    this.cancelled.add(id);
    job.status = 'cancelled';
    job.updatedAt = new Date().toISOString();
    job.finishedAt = job.updatedAt;
    await this.store.saveJob(job);
    await this.emit(job, 'warn', 'Job cancelled by request');
    return job;
  }

  isCancelled(id: string): boolean {
    return this.cancelled.has(id);
  }

  subscribe(subscriber: Subscriber): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  private async drain(): Promise<void> {
    while (this.running < this.concurrency && this.queue.length) {
      const id = this.queue.shift();
      if (!id) break;
      this.running += 1;
      this.run(id).finally(() => {
        this.running -= 1;
        this.drain();
      });
    }
  }

  private async run(id: string): Promise<void> {
    const job = await this.store.getJob(id);
    if (!job || job.status !== 'queued') return;
    const handler = this.handlers[job.type];
    if (!handler) {
      job.status = 'failed';
      job.error = `Unknown job type: ${job.type}`;
      job.finishedAt = new Date().toISOString();
      await this.store.saveJob(job);
      await this.emit(job, 'error', job.error);
      return;
    }
    job.status = 'running';
    job.startedAt = new Date().toISOString();
    job.updatedAt = job.startedAt;
    await this.store.saveJob(job);
    await this.emit(job, 'info', `Running ${job.type}`);
    try {
      const context = {
        job,
        log: async (message: string, data?: JsonValue) => this.emit(job, 'info', message, data),
        warn: async (message: string, data?: JsonValue) => this.emit(job, 'warn', message, data),
        isCancelled: () => this.cancelled.has(job.id)
      };
      const result = await handler(job.input, context);
      if (this.cancelled.has(job.id)) {
        job.status = 'cancelled';
      } else {
        job.status = 'succeeded';
        job.result = result;
      }
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      await this.emit(job, 'error', job.error);
    } finally {
      job.updatedAt = new Date().toISOString();
      job.finishedAt = job.updatedAt;
      if (job.events.length > 200) job.events = job.events.slice(-200);
      await this.store.saveJob(job);
      await this.emit(job, job.status === 'failed' ? 'error' : 'info', `Job ${job.status}`);
      this.cancelled.delete(job.id);
    }
  }

  private async emit(job: Job, level: JobEvent['level'], message: string, data?: JsonValue): Promise<void> {
    const event: JobEvent = { at: new Date().toISOString(), level, message, ...(data === undefined ? {} : { data }) };
    job.events.push(event);
    job.updatedAt = event.at;
    for (const subscriber of this.subscribers) {
      try {
        subscriber(job, event);
      } catch {
        this.subscribers.delete(subscriber);
      }
    }
    await this.store.saveJob(job);
  }
}
