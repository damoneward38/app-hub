import { cacheStatus } from "./warmCache.js";

interface HeartbeatEvent {
  timestamp: number;
  riskScore: number;
  status: "HEALTHY" | "WARNING" | "CONTAINED";
}

const events: HeartbeatEvent[] = [];

export function recordHeartbeat(riskScore: number) {
  let status: "HEALTHY" | "WARNING" | "CONTAINED" = "HEALTHY";

  if (riskScore >= 90) {
    status = "CONTAINED";
  } else if (riskScore >= 70) {
    status = "WARNING";
  }

  const event: HeartbeatEvent = {
    timestamp: Date.now(),
    riskScore,
    status,
  };

  events.unshift(event);

  if (events.length > 500) {
    events.pop();
  }

  return event;
}

export function getHeartbeat() {
  const latest = events[0];

  return {
    status: latest?.status || "HEALTHY",
    currentRisk: latest?.riskScore || 0,
    events: events.slice(0, 100),
    cache: cacheStatus(),
    timestamp: Date.now(),
  };
}
