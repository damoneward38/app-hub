export interface ErrorLogRecord {
  errorId: string;
  timestamp: string;
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  handledBy: string;
}

const STORAGE_KEY = 'skyguard_enclave_error_log';

export function generateErrorId(): string {
  const hexPart = Math.floor((1 + Math.random()) * 0x100000000)
    .toString(16)
    .substring(1)
    .toUpperCase();
  const timeSlice = Date.now().toString(36).toUpperCase().slice(-4);
  return `ERR-SEC-${timeSlice}-${hexPart.slice(0, 4)}`;
}

export function logEnclaveError(error: Error, errorInfo?: { componentStack?: string | null }): ErrorLogRecord {
  const errorId = generateErrorId();
  const timestamp = new Date().toISOString();

  const record: ErrorLogRecord = {
    errorId,
    timestamp,
    name: error?.name || 'Error',
    message: error?.message || 'Unknown runtime exception',
    stack: error?.stack,
    componentStack: errorInfo?.componentStack || undefined,
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    handledBy: 'SkyGuard.ZeroTrust.ErrorBoundary',
  };

  // 1. Structured Console Telemetry for SOC & DevTools
  console.group(`%c[SkyGuard Security Enclave] Runtime Fault Quarantined (${errorId})`, 'background: #dc2626; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 3px;');
  console.error('Error ID:', errorId);
  console.error('Exception Name:', record.name);
  console.error('Exception Message:', record.message);
  if (record.stack) console.error('Stack Trace:\n', record.stack);
  if (record.componentStack) console.error('Component Hierarchy Trace:\n', record.componentStack);
  console.info('Context Telemetry:', {
    timestamp: record.timestamp,
    url: record.url,
    userAgent: record.userAgent,
    handledBy: record.handledBy,
  });
  console.groupEnd();

  // 2. Persist in diagnostic localStorage buffer (FIFO ring buffer of max 20 events)
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const logs: ErrorLogRecord[] = existing ? JSON.parse(existing) : [];
    logs.unshift(record);
    if (logs.length > 20) logs.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (storageErr) {
    console.warn('Unable to persist error log to localStorage:', storageErr);
  }

  // 3. Dispatch Custom Event for real-time app listeners
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('skyguard:enclave_error', { detail: record }));
    } catch {
      // Ignore in non-browser environments
    }
  }

  return record;
}

export function getLoggedErrors(): ErrorLogRecord[] {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}

export function clearLoggedErrors(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
