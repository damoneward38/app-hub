import type {
  AuditEntry,
} from "./types";
import {
  createId,
  sha512,
} from "./crypto";
import { SIX686_CONFIG } from "./config";
import { sanitizeTelemetry } from "./telemetryGuard";

const ledger: AuditEntry[] = [];

function getPreviousHash(): string {
  if (ledger.length === 0) {
    return "GENESIS_SIX686_ROM_00000000000000000000000000000000";
  }
  return ledger[ledger.length - 1].hash;
}

export function writeAudit(
  entry: Omit<
    AuditEntry,
    "id" | "timestamp" | "previousHash" | "hash"
  >
): AuditEntry {
  const previousHash = getPreviousHash();
  const timestamp = new Date().toISOString();

  const sanitized = sanitizeTelemetry(entry) as Omit<
    AuditEntry,
    "id" | "timestamp" | "previousHash" | "hash"
  >;

  const payload = {
    previousHash,
    timestamp,
    ...sanitized,
  };

  const record: AuditEntry = {
    id: createId(),
    timestamp,
    previousHash,
    hash: sha512(payload),
    ...sanitized,
  };

  ledger.push(record);

  if (ledger.length > SIX686_CONFIG.audit.maxEntries) {
    ledger.shift();
  }

  return record;
}

export function getAuditLedger(limit = 100): AuditEntry[] {
  return [...ledger].reverse().slice(0, limit);
}

export function verifyAuditChainIntegrity(): {
  valid: boolean;
  totalBlocks: number;
  genesisHash: string;
  latestHash: string;
  errorBlockIndex?: number;
  message: string;
} {
  if (ledger.length === 0) {
    return {
      valid: true,
      totalBlocks: 0,
      genesisHash: "GENESIS",
      latestHash: "GENESIS",
      message: "Ledger is currently empty (Genesis state intact).",
    };
  }

  let expectedPrevHash = "GENESIS_SIX686_ROM_00000000000000000000000000000000";

  for (let i = 0; i < ledger.length; i++) {
    const block = ledger[i];
    if (block.previousHash !== expectedPrevHash) {
      return {
        valid: false,
        totalBlocks: ledger.length,
        genesisHash: ledger[0].hash,
        latestHash: ledger[ledger.length - 1].hash,
        errorBlockIndex: i,
        message: `Tamper detected at block #${i}: previousHash mismatch. Chain broken.`,
      };
    }

    const { id, timestamp, previousHash, hash, ...rest } = block;
    const computedHash = sha512({
      previousHash,
      timestamp,
      ...rest,
    });

    if (computedHash !== hash) {
      return {
        valid: false,
        totalBlocks: ledger.length,
        genesisHash: ledger[0].hash,
        latestHash: ledger[ledger.length - 1].hash,
        errorBlockIndex: i,
        message: `Tamper detected at block #${i}: Cryptographic SHA-512 hash mismatch. Payload altered.`,
      };
    }

    expectedPrevHash = hash;
  }

  return {
    valid: true,
    totalBlocks: ledger.length,
    genesisHash: ledger[0].hash.slice(0, 16) + "...",
    latestHash: ledger[ledger.length - 1].hash.slice(0, 16) + "...",
    message: `All ${ledger.length} ledger blocks verified. Cryptographic chain is authentic and untampered.`,
  };
}
