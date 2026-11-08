import crypto from "node:crypto";
import type { UsageRecord } from "./types.js";

// Standard base rate per character ($0.0000001 / char)
const PRICE_PER_CHARACTER = 0.0000001;

const now = Date.now();
const usage: UsageRecord[] = [
  {
    id: "use_seed_001",
    tenantId: "sapphire",
    model: "nero-4.0",
    inputCharacters: 18450,
    outputCharacters: 9230,
    estimatedCost: (18450 + 9230) * PRICE_PER_CHARACTER,
    timestamp: now - 3600000 * 5,
  },
  {
    id: "use_seed_002",
    tenantId: "sapphire",
    model: "llama3:latest",
    inputCharacters: 42100,
    outputCharacters: 16800,
    estimatedCost: (42100 + 16800) * PRICE_PER_CHARACTER,
    timestamp: now - 3600000 * 3,
  },
  {
    id: "use_seed_003",
    tenantId: "openclaw",
    model: "nero-4.0",
    inputCharacters: 65400,
    outputCharacters: 34100,
    estimatedCost: (65400 + 34100) * PRICE_PER_CHARACTER,
    timestamp: now - 3600000 * 4,
  },
  {
    id: "use_seed_004",
    tenantId: "openclaw",
    model: "six686-guard",
    inputCharacters: 88200,
    outputCharacters: 21900,
    estimatedCost: (88200 + 21900) * PRICE_PER_CHARACTER,
    timestamp: now - 3600000 * 2,
  },
  {
    id: "use_seed_005",
    tenantId: "enterprise-alpha",
    model: "nero-4.0",
    inputCharacters: 142000,
    outputCharacters: 78500,
    estimatedCost: (142000 + 78500) * PRICE_PER_CHARACTER,
    timestamp: now - 3600000 * 6,
  },
  {
    id: "use_seed_006",
    tenantId: "enterprise-alpha",
    model: "gemini-2.5-flash",
    inputCharacters: 95000,
    outputCharacters: 52000,
    estimatedCost: (95000 + 52000) * PRICE_PER_CHARACTER,
    timestamp: now - 3600000 * 1,
  },
  {
    id: "use_seed_007",
    tenantId: "fintech-shield",
    model: "six686-guard",
    inputCharacters: 125000,
    outputCharacters: 48000,
    estimatedCost: (125000 + 48000) * PRICE_PER_CHARACTER,
    timestamp: now - 3600000 * 2.5,
  },
  {
    id: "use_seed_008",
    tenantId: "fintech-shield",
    model: "nero-4.0",
    inputCharacters: 83000,
    outputCharacters: 41200,
    estimatedCost: (83000 + 41200) * PRICE_PER_CHARACTER,
    timestamp: now - 1800000,
  },
];

export function recordUsage(
  tenantId: string,
  model: string,
  input: string,
  output: string
): UsageRecord {
  const inputCharacters = input.length;
  const outputCharacters = output.length;
  const estimatedCost =
    (inputCharacters + outputCharacters) * PRICE_PER_CHARACTER;

  const record: UsageRecord = {
    id: crypto.randomUUID(),
    tenantId,
    model,
    inputCharacters,
    outputCharacters,
    estimatedCost,
    timestamp: Date.now(),
  };

  usage.push(record);
  return record;
}

export function getUsage(tenantId?: string): UsageRecord[] {
  if (!tenantId) {
    return usage;
  }
  return usage.filter((record) => record.tenantId === tenantId);
}

export function getUsageSummary(tenantId: string) {
  const records = getUsage(tenantId);

  return {
    tenantId,
    requests: records.length,
    inputCharacters: records.reduce(
      (total, item) => total + item.inputCharacters,
      0
    ),
    outputCharacters: records.reduce(
      (total, item) => total + item.outputCharacters,
      0
    ),
    estimatedCost: records.reduce(
      (total, item) => total + item.estimatedCost,
      0
    ),
  };
}
