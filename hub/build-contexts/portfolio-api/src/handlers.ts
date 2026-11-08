import { chat, ollamaHealth } from './ollama.js';
import type { PortfolioStore } from './store.js';
import type { JobHandler, JsonValue, OllamaMessage } from './types.js';

function object(value: JsonValue | undefined): Record<string, JsonValue> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function string(value: JsonValue | undefined, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function number(value: JsonValue | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function bool(value: JsonValue | undefined, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function array(value: JsonValue | undefined): JsonValue[] {
  return Array.isArray(value) ? value : [];
}

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function degrees(rad: number): number {
  return (rad * 180) / Math.PI;
}

function normalizeAngle(angle: number): number {
  const twoPi = Math.PI * 2;
  return ((angle % twoPi) + twoPi) % twoPi;
}

function solveKepler(meanAnomaly: number, eccentricity: number): number {
  let E = eccentricity < 0.8 ? meanAnomaly : Math.PI;
  for (let i = 0; i < 40; i += 1) {
    const delta = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-12) break;
  }
  return E;
}

function orbitalPropagate(input: JsonValue): JsonValue {
  const data = object(input);
  const a = number(data.semiMajorAxisKm, 7000);
  const e = number(data.eccentricity, 0.001);
  const inclination = radians(number(data.inclinationDeg, 51.6));
  const raan = radians(number(data.raanDeg, 0));
  const argp = radians(number(data.argPerigeeDeg, 0));
  const mu = number(data.muKm3s2, 398600.4418);
  const dt = number(data.deltaSeconds, 0);
  if (a <= 0 || e < 0 || e >= 1) throw new Error('semiMajorAxisKm must be > 0 and eccentricity in [0,1)');

  const meanMotion = Math.sqrt(mu / (a * a * a));
  let meanAnomaly: number;
  if (typeof data.meanAnomalyDeg === 'number') {
    meanAnomaly = radians(data.meanAnomalyDeg) + meanMotion * dt;
  } else {
    const trueAnomaly = radians(number(data.trueAnomalyDeg, 0));
    const E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(trueAnomaly / 2), Math.sqrt(1 + e) * Math.cos(trueAnomaly / 2));
    meanAnomaly = E - e * Math.sin(E) + meanMotion * dt;
  }
  meanAnomaly = normalizeAngle(meanAnomaly);
  const E = solveKepler(meanAnomaly, e);
  const trueAnomaly = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const radius = a * (1 - e * Math.cos(E));
  const p = a * (1 - e * e);
  const rPerifocal = [radius * Math.cos(trueAnomaly), radius * Math.sin(trueAnomaly), 0];
  const factor = Math.sqrt(mu / p);
  const vPerifocal = [-factor * Math.sin(trueAnomaly), factor * (e + Math.cos(trueAnomaly)), 0];

  const cosO = Math.cos(raan), sinO = Math.sin(raan);
  const cosI = Math.cos(inclination), sinI = Math.sin(inclination);
  const cosW = Math.cos(argp), sinW = Math.sin(argp);
  const rotation = [
    [cosO * cosW - sinO * sinW * cosI, -cosO * sinW - sinO * cosW * cosI, sinO * sinI],
    [sinO * cosW + cosO * sinW * cosI, -sinO * sinW + cosO * cosW * cosI, -cosO * sinI],
    [sinW * sinI, cosW * sinI, cosI]
  ];
  const apply = (vector: number[]): [number, number, number] => rotation.map((row) => row[0]! * vector[0]! + row[1]! * vector[1]! + row[2]! * vector[2]!) as [number, number, number];
  const position = apply(rPerifocal);
  const velocity = apply(vPerifocal);
  const altitudeKm = radius - 6378.137;
  return {
    positionKm: { x: position[0], y: position[1], z: position[2] },
    velocityKmS: { x: velocity[0], y: velocity[1], z: velocity[2] },
    radiusKm: radius,
    altitudeKm,
    periodSeconds: (Math.PI * 2) / meanMotion,
    meanAnomalyDeg: degrees(meanAnomaly),
    eccentricAnomalyDeg: degrees(E),
    trueAnomalyDeg: degrees(trueAnomaly),
    speedKmS: Math.hypot(velocity[0]!, velocity[1]!, velocity[2]!)
  };
}

const EEG_BANDS = [
  { name: 'delta', low: 0.5, high: 4 },
  { name: 'theta', low: 4, high: 8 },
  { name: 'alpha', low: 8, high: 13 },
  { name: 'beta', low: 13, high: 30 },
  { name: 'gamma', low: 30, high: 45 }
];

function eegAnalyze(input: JsonValue): JsonValue {
  const data = object(input);
  const raw = array(data.samples).filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const sampleRate = number(data.sampleRateHz, 256);
  if (raw.length < 32) throw new Error('At least 32 numeric samples are required');
  if (sampleRate <= 0) throw new Error('sampleRateHz must be > 0');
  const samples = raw.slice(0, 4096);
  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  const centered = samples.map((value) => value - mean);
  const window = centered.map((value, index) => value * (0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (centered.length - 1))));
  const maxFrequency = Math.min(45, sampleRate / 2);
  const resolution = 0.5;
  const powers: Array<{ frequency: number; power: number }> = [];
  for (let frequency = resolution; frequency <= maxFrequency; frequency += resolution) {
    let real = 0;
    let imag = 0;
    for (let index = 0; index < window.length; index += 1) {
      const angle = (2 * Math.PI * frequency * index) / sampleRate;
      real += window[index]! * Math.cos(angle);
      imag -= window[index]! * Math.sin(angle);
    }
    powers.push({ frequency, power: real * real + imag * imag });
  }
  const totalPower = powers.reduce((sum, item) => sum + item.power, 0) || 1;
  const bands = EEG_BANDS.map((band) => {
    const inBand = powers.filter((item) => item.frequency >= band.low && item.frequency < band.high);
    const power = inBand.reduce((sum, item) => sum + item.power, 0);
    return { band: band.name, power, relativePower: power / totalPower };
  });
  let peak = { frequency: 0, power: -1 };
  for (const item of powers) if (item.power > peak.power) peak = item;
  const dominant = [...bands].sort((a, b) => b.power - a.power)[0];
  return {
    sampleCount: samples.length,
    sampleRateHz: sampleRate,
    durationSeconds: samples.length / sampleRate,
    meanMicrovolts: mean,
    bands,
    peakFrequencyHz: peak.frequency,
    dominantBand: dominant?.band || null,
    interpretation: 'Computed from supplied samples only; not a medical device or diagnosis.',
    license: 'CC0 computation'
  };
}

function marketPaper(input: JsonValue): JsonValue {
  const data = object(input);
  const symbol = string(data.symbol, 'UNKNOWN').toUpperCase().slice(0, 16);
  const side = string(data.side, 'buy').toLowerCase();
  const quantity = number(data.quantity, 0);
  const price = number(data.price, 0);
  const feeBps = number(data.feeBps, 5);
  if (!['buy', 'sell'].includes(side)) throw new Error('side must be buy or sell');
  if (quantity <= 0 || price <= 0) throw new Error('quantity and price must be > 0');
  if (feeBps < 0 || feeBps > 1000) throw new Error('feeBps must be between 0 and 1000');
  const notional = quantity * price;
  const fee = (notional * feeBps) / 10_000;
  const slippageBps = Math.min(100, Math.max(0, number(data.slippageBps, 2)));
  const fillPrice = side === 'buy' ? price * (1 + slippageBps / 10_000) : price * (1 - slippageBps / 10_000);
  const total = side === 'buy' ? quantity * fillPrice + fee : quantity * fillPrice - fee;
  return {
    orderId: `paper_${Date.now().toString(36)}`,
    symbol,
    side,
    quantity,
    requestedPrice: price,
    fillPrice,
    notional,
    fee,
    slippageBps,
    cashImpact: side === 'buy' ? -total : total,
    mode: 'paper',
    liveTrading: false,
    accepted: true,
    riskChecks: {
      positiveQuantity: quantity > 0,
      notionalUnder100k: notional <= 100_000,
      priceFinite: Number.isFinite(price),
      feeWithinBounds: feeBps <= 1000
    }
  };
}

const THREAT_WEIGHTS: Record<string, number> = {
  ip: 15,
  domain: 20,
  url: 20,
  hash: 30,
  email: 10,
  cve: 35,
  process: 25,
  registry: 25,
  file: 20
};

function threatTriage(input: JsonValue): JsonValue {
  const data = object(input);
  const indicators = array(data.indicators).map((item) => object(item));
  if (!indicators.length) throw new Error('indicators[] is required');
  const findings = indicators.map((indicator) => {
    const type = string(indicator.type, 'unknown').toLowerCase();
    const value = string(indicator.value, '');
    let score = THREAT_WEIGHTS[type] ?? 10;
    const reasons: string[] = [];
    if (/\.(ru|cn|tk|top|xyz|onion)$/i.test(value)) { score += 20; reasons.push('high-risk TLD'); }
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(value)) { score += 5; reasons.push('private address'); }
    if (/^[a-f0-9]{64}$/i.test(value)) { score += 15; reasons.push('sha256-shaped hash'); }
    if (/^CVE-\d{4}-\d{4,}$/i.test(value)) { score += 20; reasons.push('known CVE format'); }
    if (/powershell|cmd\.exe|wscript|cscript|mshta/i.test(value)) { score += 25; reasons.push('dual-use execution binary'); }
    if (/base64|eval\(|fromCharCode/i.test(value)) { score += 20; reasons.push('obfuscation indicator'); }
    score = Math.min(100, score);
    return { type, value, score, reasons, severity: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low' };
  });
  const riskScore = Math.round(findings.reduce((sum, finding) => sum + finding.score, 0) / findings.length);
  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  const actions = riskLevel === 'high'
    ? ['isolate affected host', 'collect volatile evidence', 'block indicators at egress', 'open incident ticket']
    : riskLevel === 'medium'
      ? ['enrich indicators with local logs', 'review recent authentication events', 'monitor for 24 hours']
      : ['continue monitoring', 'retain indicators for correlation'];
  return {
    riskScore,
    riskLevel,
    findings,
    actions,
    liveBlocking: false,
    note: 'Deterministic triage over submitted indicators; no external reputation lookup performed.'
  };
}

function documentStats(input: JsonValue): JsonValue {
  const data = object(input);
  const text = string(data.text, '');
  if (!text) throw new Error('text is required');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = (text.match(/[.!?]+(?=\s|$)/g) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter((part) => part.trim()).length;
  const unique = new Set(text.toLowerCase().match(/[a-z0-9']+/g) || []).size;
  return {
    characters: text.length,
    words,
    sentences,
    paragraphs,
    uniqueWords: unique,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
    checksum: simpleChecksum(text)
  };
}

function simpleChecksum(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function createHandlers(store: PortfolioStore): Record<string, JobHandler> {
  return {
    'ai.chat': async (input) => {
      const data = object(input);
      const messages = array(data.messages).map((item) => object(item));
      const normalized: OllamaMessage[] = messages.map((message) => ({
        role: ['system', 'assistant', 'user'].includes(string(message.role)) ? (string(message.role) as OllamaMessage['role']) : 'user',
        content: string(message.content)
      })).filter((message) => message.content);
      if (!normalized.length) throw new Error('messages[] is required');
      const result = await chat(normalized, string(data.model, process.env.OLLAMA_MODEL || 'llama3.2'));
      return { ...result };
    },
    'ai.analyze': async (input, context) => {
      const data = object(input);
      const text = string(data.text);
      if (!text) throw new Error('text is required');
      await context.log('Analyzing submitted text with local model');
      const result = await chat([
        { role: 'system', content: string(data.system, 'You are a precise analyst. Respond with concrete findings and cite only the provided text.') },
        { role: 'user', content: text.slice(0, 24_000) }
      ], string(data.model, process.env.OLLAMA_MODEL || 'llama3.2'));
      return { ...result, inputCharacters: text.length };
    },
    'health.check': async (_input, context) => {
      const [ollama, storage] = await Promise.all([ollamaHealth(), store.health()]);
      await context.log('Health checks completed', { ollama: ollama.ok, storage: storage.ok });
      return { ollama, storage, timestamp: new Date().toISOString() };
    },
    'orbital.propagate': async (input) => orbitalPropagate(input),
    'eeg.analyze': async (input) => eegAnalyze(input),
    'market.paper': async (input) => marketPaper(input),
    'threat.triage': async (input, context) => {
      const result = threatTriage(input) as Record<string, JsonValue>;
      if (bool(object(input).useAi, false)) {
        await context.log('Generating local-model analyst note');
        const ai = await chat([
          { role: 'system', content: 'Summarize the deterministic triage result in under 120 words. Do not invent indicators.' },
          { role: 'user', content: JSON.stringify(result) }
        ]);
        result.analystNote = ai.text;
        result.model = ai.model;
      }
      return result;
    },
    'document.stats': async (input) => documentStats(input)
  };
}
