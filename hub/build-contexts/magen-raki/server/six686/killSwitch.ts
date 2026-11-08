let active = false;

let activatedAt: string | null = null;
let activatedBy: string | null = null;
let activationReason: string | null = null;

export function activateKillSwitch(
  ownerId = "owner",
  reason = "Emergency Operator Override"
) {
  active = true;
  activatedAt = new Date().toISOString();
  activatedBy = ownerId;
  activationReason = reason;

  return getKillSwitchStatus();
}

export function releaseKillSwitch(ownerId = "owner") {
  active = false;

  const released = {
    releasedAt: new Date().toISOString(),
    releasedBy: ownerId,
  };

  activatedAt = null;
  activatedBy = null;
  activationReason = null;

  return {
    ...getKillSwitchStatus(),
    ...released,
  };
}

export const deactivateKillSwitch = releaseKillSwitch;

export function isSystemStopped(): boolean {
  return active;
}

export function getKillSwitchStatus() {
  return {
    active,
    activatedAt,
    activatedBy,
    activationReason,
  };
}

export function assertSystemActive() {
  if (active) {
    throw new Error(
      `SIX 686 EMERGENCY STOP ACTIVE. System quarantined by ${activatedBy || "Operator"}${
        activationReason ? ` (${activationReason})` : ""
      }. All agent executions suspended.`
    );
  }
}
