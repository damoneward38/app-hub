import crypto from "node:crypto";
import { getAuditLedger } from "../six686/auditLedger.js";
import type { ComplianceBundle } from "./types.js";

export function generateComplianceBundle(
  framework: "SOC2" | "ISO27001" | "HIPAA" | "PCI_DSS" | "EU_AI_ACT" | "FEDRAMP" | "NIST"
): ComplianceBundle {
  const auditEvents = getAuditLedger(500);

  const riskEvents = auditEvents.filter((event: any) =>
    String(event.capability || event.event || "").toUpperCase().includes("RISK")
  );

  const policyEvents = auditEvents.filter((event: any) =>
    String(event.capability || event.event || "").toUpperCase().includes("POLICY")
  );

  const generatedAt = Date.now();

  const bundleBase = {
    framework,
    generatedAt,
    riskEvents,
    policyEvents,
    auditEvents,
  };

  const integrityHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(bundleBase))
    .digest("hex");

  return {
    id: crypto.randomUUID(),
    ...bundleBase,
    integrityHash,
  };
}
