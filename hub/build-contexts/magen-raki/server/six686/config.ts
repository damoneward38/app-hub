export const SIX686_CONFIG = {
  version: "1.0.0",

  risk: {
    medium: 0.35,
    high: 0.65,
    critical: 0.9,
  },

  approval: {
    expirationMinutes: 15,
  },

  telemetry: {
    enabled: true,
    blockSensitiveData: true,
  },

  audit: {
    maxEntries: 10000,
  },

  security: {
    allowGovernorModification: false,
    allowAuditDeletion: false,
    allowKillSwitchDisableByAgent: false,
  },
} as const;
