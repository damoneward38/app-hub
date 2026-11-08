import { getHeartbeat } from "./heartbeat.js";
import { getAuditLedger } from "../six686/auditLedger.js";

export function generateThreatReport() {
  const heartbeat = getHeartbeat();
  const audit = getAuditLedger(500);

  const blocked = audit.filter((entry: any) =>
    String(entry.decision || entry.event || "").toUpperCase().includes("BLOCK")
  );

  const policyViolations = audit.filter((entry: any) =>
    String(entry.capability || entry.event || "").toUpperCase().includes("POLICY") ||
    String(entry.decision || "").toUpperCase() === "BLOCK"
  );

  return {
    title: "Magen-Raki Threat Intelligence Report",
    generatedAt: Date.now(),
    currentRisk: heartbeat.currentRisk,
    systemStatus: heartbeat.status,
    blockedEvents: blocked.length,
    policyEvents: policyViolations.length,
    totalAuditEvents: audit.length,
    recommendation:
      heartbeat.currentRisk >= 90
        ? "Immediate containment and investigation recommended."
        : heartbeat.currentRisk >= 70
        ? "Elevated monitoring and hardening recommended."
        : "System operating within configured risk thresholds.",
  };
}
