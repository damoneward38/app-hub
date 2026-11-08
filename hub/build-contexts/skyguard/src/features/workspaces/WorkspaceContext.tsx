import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  WorkspaceNode, 
  AuditLogRecord, 
  WorkspaceUser, 
  WorkspaceReport, 
  InventoryAsset, 
  AlertIncident 
} from '../../types';
import { initialInventoryAssets, initialAlerts } from '../../services/mockSecurityApi';

// Initial Workspaces matching the exact SKYGUARD -> Workspace A / Workspace B tree
export const INITIAL_WORKSPACES: WorkspaceNode[] = [
  {
    id: 'workspace_123',
    name: 'Workspace A',
    displayName: 'Workspace A (Production Enclave)',
    description: 'Primary sovereign production environment with high-assurance Zero-Trust perimeter and mTLS enforcement.',
    tier: 'Enterprise Enclave',
    environment: 'production',
    apexDomain: 'mycompany.com',
    createdAt: '2026-01-15T00:00:00Z',
    users: [
      {
        id: 'user_456',
        name: 'Noam Almagor',
        email: 'chief.security@skyguard.mesh',
        role: 'owner',
        status: 'active',
        mfaEnabled: true,
        joinedAt: '2026-01-15',
        lastActive: 'Just now (Active)',
        title: 'Chief Information Security Officer',
      },
      {
        id: 'user_102',
        name: 'Sarah Connor',
        email: 'soc.lead@mycompany.com',
        role: 'admin',
        status: 'active',
        mfaEnabled: true,
        joinedAt: '2026-03-10',
        lastActive: '12 mins ago',
        title: 'Lead SOC Incident Commander',
      },
      {
        id: 'user_103',
        name: 'David K.',
        email: 'devops@mycompany.com',
        role: 'analyst',
        status: 'active',
        mfaEnabled: true,
        joinedAt: '2026-04-01',
        lastActive: '1 hour ago',
        title: 'Cloud Infrastructure & SRE',
      },
    ],
    assets: initialInventoryAssets.slice(0, 7),
    alerts: initialAlerts,
    reports: [
      {
        id: 'rep_soc2_q3',
        title: 'SOC 2 Type II Sovereign Audit Evidence Brief',
        type: 'SOC2',
        period: 'Q3 2026',
        generatedAt: '2026-08-20T04:00:00Z',
        generatedBy: 'user_456',
        status: 'ready',
        securityScore: 99.8,
        fileSize: '4.2 MB',
      },
      {
        id: 'rep_iso_2026',
        title: 'ISO/IEC 27001:2022 Continuous Posture Assessment',
        type: 'ISO27001',
        period: 'August 2026',
        generatedAt: '2026-08-19T21:30:00Z',
        generatedBy: 'user_102',
        status: 'ready',
        securityScore: 98.4,
        fileSize: '3.1 MB',
      },
      {
        id: 'rep_gdpr_art17',
        title: 'GDPR Art. 17 Cryptographic Shredding & DSAR Log',
        type: 'GDPR',
        period: 'August 2026',
        generatedAt: '2026-08-20T03:00:00Z',
        generatedBy: 'user_456',
        status: 'ready',
        securityScore: 100.0,
        fileSize: '1.8 MB',
      },
      {
        id: 'rep_exec_brief',
        title: 'Executive Cyber Briefing & Threat Digest',
        type: 'Executive',
        period: 'Q3 2026',
        generatedAt: '2026-08-20T05:00:00Z',
        generatedBy: 'user_456',
        status: 'ready',
        securityScore: 99.8,
        fileSize: '2.4 MB',
      },
    ],
  },
  {
    id: 'workspace_456',
    name: 'Workspace B',
    displayName: 'Workspace B (Staging Sandbox)',
    description: 'Pre-production staging mesh with ephemeral mock fixtures and integration test runners.',
    tier: 'Staging Sandbox',
    environment: 'staging',
    apexDomain: 'staging.mycompany.dev',
    createdAt: '2026-02-01T00:00:00Z',
    users: [
      {
        id: 'user_456',
        name: 'Noam Almagor',
        email: 'chief.security@skyguard.mesh',
        role: 'owner',
        status: 'active',
        mfaEnabled: true,
        joinedAt: '2026-01-15',
        lastActive: 'Just now',
        title: 'CISO',
      },
      {
        id: 'user_201',
        name: 'Elena Rostova',
        email: 'qa.sec@mycompany.dev',
        role: 'admin',
        status: 'active',
        mfaEnabled: true,
        joinedAt: '2026-05-12',
        lastActive: '35 mins ago',
        title: 'Security QA & Red-Team Tester',
      },
    ],
    assets: [
      {
        id: 'ast_stg_01',
        name: 'Staging API Gateway v1',
        category: 'APIs',
        identifier: 'https://staging-api.mycompany.dev',
        parentApex: 'staging.mycompany.dev',
        status: 'healthy',
        ipOrHost: '10.200.1.5 (Staging Mesh)',
        environment: 'staging',
        monitoringActive: true,
        compliancePassing: true,
        securityScore: 96.0,
        lastScan: '10 mins ago',
        tags: ['Sandbox Ingress', 'Staging'],
        vulnerabilitiesCount: 0,
        wafShielded: true,
      },
      {
        id: 'ast_stg_02',
        name: 'Developer Pre-Release Portal',
        category: 'Websites',
        identifier: 'https://dev-portal.mycompany.dev',
        parentApex: 'staging.mycompany.dev',
        status: 'healthy',
        ipOrHost: '10.200.1.12',
        environment: 'staging',
        monitoringActive: true,
        compliancePassing: true,
        securityScore: 98.0,
        lastScan: '1 hour ago',
        tags: ['Web Client', 'Staging'],
        vulnerabilitiesCount: 0,
        wafShielded: true,
      },
      {
        id: 'ast_stg_03',
        name: 'Staging Kubernetes Test Pods',
        category: 'Servers',
        identifier: 'k8s-staging-cluster-01',
        parentApex: 'staging.mycompany.dev',
        status: 'healthy',
        ipOrHost: '10.200.2.0/24',
        environment: 'staging',
        monitoringActive: true,
        compliancePassing: true,
        securityScore: 95.0,
        lastScan: '4 hours ago',
        tags: ['K8s', 'E2E Testing'],
        vulnerabilitiesCount: 0,
        wafShielded: false,
      },
      {
        id: 'ast_stg_04',
        name: 'Ephemeral PostgreSQL DB Sandbox',
        category: 'Databases',
        identifier: 'staging-rds-sandbox.internal',
        parentApex: 'staging.mycompany.dev',
        status: 'healthy',
        ipOrHost: '10.200.3.10',
        environment: 'staging',
        monitoringActive: true,
        compliancePassing: true,
        securityScore: 99.0,
        lastScan: '2 hours ago',
        tags: ['Anonymized Fixtures', 'PostgreSQL'],
        vulnerabilitiesCount: 0,
        wafShielded: true,
      },
    ],
    alerts: [
      {
        id: 'alert_456',
        title: 'Ephemeral Sandbox Test Key Ingestion',
        severity: 'medium',
        status: 'resolved',
        source: 'api_security',
        createdAt: '2026-08-19T14:20:00Z',
        affectedAsset: 'staging-api.mycompany.dev',
        assignedTo: 'user_201',
        target: 'staging-api.mycompany.dev',
        timestamp: '18 hours ago',
        description: 'Automated CI/CD test harness injected disposable API key in sandbox enclave.',
      },
    ],
    reports: [
      {
        id: 'rep_stg_dast',
        title: 'Staging Pre-Release DAST & SAST Vulnerability Brief',
        type: 'Executive',
        period: 'Sprint 42',
        generatedAt: '2026-08-19T18:00:00Z',
        generatedBy: 'user_201',
        status: 'ready',
        securityScore: 94.2,
        fileSize: '1.2 MB',
      },
      {
        id: 'rep_stg_pen',
        title: 'Automated Ephemeral Red-Team Penetration Report',
        type: 'Executive',
        period: 'August 2026',
        generatedAt: '2026-08-18T14:30:00Z',
        generatedBy: 'user_456',
        status: 'ready',
        securityScore: 96.0,
        fileSize: '2.1 MB',
      },
    ],
  },
];

// Initial Canonical Audit Logs (Featuring the exact canonical audit_123 record)
export const INITIAL_CANONICAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'audit_123',
    workspaceId: 'workspace_123',
    userId: 'user_456',
    action: 'ALERT_RESOLVED',
    entity: 'alert',
    entityId: 'alert_123',
    createdAt: '2026-08-20T06:19:45.120Z',
    metadata: {
      alertTitle: 'Repeated failed login attempts',
      severity: 'high',
      targetAsset: 'api.skyguard.com',
      resolutionReason: 'Origin IP quarantined via WAF block list; automated token revocation complete',
      resolvedByRole: 'owner',
      timeToMitigate: '1m 23s',
      evidenceDigest: 'sha256:8f2a91b0c948e71b2d4f5e6a987c3b2104fae19b',
    },
  },
  {
    id: 'audit_122',
    workspaceId: 'workspace_123',
    userId: 'user_456',
    action: 'REPORT_GENERATED',
    entity: 'report',
    entityId: 'rep_soc2_q3',
    createdAt: '2026-08-20T04:00:15.000Z',
    metadata: {
      reportTitle: 'SOC 2 Type II Sovereign Audit Evidence Brief',
      reportType: 'SOC2',
      securityScore: 99.8,
      controlsAudited: 50,
      passingRatio: '94%',
    },
  },
  {
    id: 'audit_121',
    workspaceId: 'workspace_123',
    userId: 'user_102',
    action: 'ASSET_REGISTERED',
    entity: 'asset',
    entityId: 'ast_web_01',
    createdAt: '2026-08-19T22:10:00.000Z',
    metadata: {
      assetName: 'Customer Facing Portal',
      category: 'Websites',
      identifier: 'https://mycompany.com',
      wafShielded: true,
      securityScore: 99.8,
    },
  },
  {
    id: 'audit_120',
    workspaceId: 'workspace_123',
    userId: 'user_456',
    action: 'USER_INVITED',
    entity: 'user',
    entityId: 'user_103',
    createdAt: '2026-08-19T18:30:00.000Z',
    metadata: {
      invitedEmail: 'devops@mycompany.com',
      assignedRole: 'analyst',
      mfaRequired: true,
      ssoProvider: 'Okta Sovereign OIDC',
    },
  },
  {
    id: 'audit_119',
    workspaceId: 'workspace_456',
    userId: 'user_201',
    action: 'ALERT_RESOLVED',
    entity: 'alert',
    entityId: 'alert_456',
    createdAt: '2026-08-19T14:25:00.000Z',
    metadata: {
      alertTitle: 'Ephemeral Sandbox Test Key Ingestion',
      severity: 'medium',
      resolutionReason: 'Key verified as disposable sandbox token; test suite pipeline completed',
      resolvedByRole: 'admin',
    },
  },
  {
    id: 'audit_118',
    workspaceId: 'workspace_456',
    userId: 'user_456',
    action: 'WORKSPACE_CREATED',
    entity: 'workspace',
    entityId: 'workspace_456',
    createdAt: '2026-02-01T00:00:00.000Z',
    metadata: {
      workspaceName: 'Workspace B (Staging Sandbox)',
      tier: 'Staging Sandbox',
      apexDomain: 'staging.mycompany.dev',
    },
  },
];

interface WorkspaceContextType {
  workspaces: WorkspaceNode[];
  activeWorkspaceId: string;
  activeWorkspace: WorkspaceNode;
  auditLogs: AuditLogRecord[];
  setActiveWorkspaceId: (id: string) => void;
  createWorkspace: (data: { name: string; displayName: string; apexDomain: string; tier: WorkspaceNode['tier']; environment: WorkspaceNode['environment']; description: string }) => WorkspaceNode;
  resolveAlert: (alertId: string, workspaceId?: string, reason?: string) => AuditLogRecord;
  addUserToWorkspace: (workspaceId: string, user: Omit<WorkspaceUser, 'id' | 'joinedAt'>) => WorkspaceUser;
  addAssetToWorkspace: (workspaceId: string, asset: InventoryAsset) => void;
  addReportToWorkspace: (workspaceId: string, report: Omit<WorkspaceReport, 'id' | 'generatedAt' | 'generatedBy'>) => WorkspaceReport;
  logAuditEvent: (event: { action: string; entity: string; entityId: string; workspaceId?: string; userId?: string; metadata?: Record<string, any> }) => AuditLogRecord;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceNode[]>(() => {
    const saved = localStorage.getItem('skyguard_workspaces');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_WORKSPACES;
      }
    }
    return INITIAL_WORKSPACES;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    const savedId = localStorage.getItem('skyguard_active_workspace_id');
    return savedId || 'workspace_123';
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>(() => {
    const savedLogs = localStorage.getItem('skyguard_audit_logs');
    if (savedLogs) {
      try {
        return JSON.parse(savedLogs);
      } catch {
        return INITIAL_CANONICAL_AUDIT_LOGS;
      }
    }
    return INITIAL_CANONICAL_AUDIT_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('skyguard_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('skyguard_active_workspace_id', activeWorkspaceId);
  }, [activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem('skyguard_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const logAuditEvent = ({
    action,
    entity,
    entityId,
    workspaceId = activeWorkspaceId,
    userId = 'user_456',
    metadata = {},
  }: {
    action: string;
    entity: string;
    entityId: string;
    workspaceId?: string;
    userId?: string;
    metadata?: Record<string, any>;
  }): AuditLogRecord => {
    const newLog: AuditLogRecord = {
      id: `audit_${Math.floor(100 + Math.random() * 900)}`,
      workspaceId,
      userId,
      action,
      entity,
      entityId,
      createdAt: new Date().toISOString(),
      metadata,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  const resolveAlert = (alertId: string, workspaceId = activeWorkspaceId, reason = 'Resolved by operator'): AuditLogRecord => {
    // 1. Update Alert Status in workspaces
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        return {
          ...ws,
          alerts: ws.alerts.map((al) => (al.id === alertId ? { ...al, status: 'resolved' } : al)),
        };
      })
    );

    // 2. Emit EXACT canonical audit log matching requested schema
    const targetAlert = activeWorkspace.alerts.find((a) => a.id === alertId);
    const auditRecord: AuditLogRecord = {
      id: alertId === 'alert_123' ? 'audit_123' : `audit_${Math.floor(100 + Math.random() * 900)}`,
      workspaceId,
      userId: 'user_456',
      action: 'ALERT_RESOLVED',
      entity: 'alert',
      entityId: alertId,
      createdAt: new Date().toISOString(),
      metadata: {
        alertTitle: targetAlert?.title || 'Security Incident',
        severity: targetAlert?.severity || 'high',
        targetAsset: targetAlert?.affectedAsset || targetAlert?.target || 'api.skyguard.com',
        resolutionReason: reason,
        resolvedByRole: 'owner',
        timeToMitigate: 'Just now',
        evidenceDigest: `sha256:${Math.random().toString(16).substring(2, 10)}...`,
      },
    };

    setAuditLogs((prev) => [auditRecord, ...prev.filter((l) => l.id !== auditRecord.id)]);
    return auditRecord;
  };

  const createWorkspace = (data: {
    name: string;
    displayName: string;
    apexDomain: string;
    tier: WorkspaceNode['tier'];
    environment: WorkspaceNode['environment'];
    description: string;
  }): WorkspaceNode => {
    const newId = `workspace_${Math.floor(100 + Math.random() * 900)}`;
    const newWorkspace: WorkspaceNode = {
      id: newId,
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      tier: data.tier,
      environment: data.environment,
      apexDomain: data.apexDomain,
      createdAt: new Date().toISOString(),
      users: [
        {
          id: 'user_456',
          name: 'Noam Almagor',
          email: 'chief.security@skyguard.mesh',
          role: 'owner',
          status: 'active',
          mfaEnabled: true,
          joinedAt: new Date().toISOString().split('T')[0],
          lastActive: 'Just now',
          title: 'CISO',
        },
      ],
      assets: [],
      alerts: [],
      reports: [],
    };

    setWorkspaces((prev) => [...prev, newWorkspace]);
    logAuditEvent({
      action: 'WORKSPACE_CREATED',
      entity: 'workspace',
      entityId: newId,
      workspaceId: newId,
      metadata: { name: data.name, apexDomain: data.apexDomain },
    });

    return newWorkspace;
  };

  const addUserToWorkspace = (workspaceId: string, userData: Omit<WorkspaceUser, 'id' | 'joinedAt'>): WorkspaceUser => {
    const newId = `user_${Math.floor(100 + Math.random() * 900)}`;
    const newUser: WorkspaceUser = {
      id: newId,
      ...userData,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        return {
          ...ws,
          users: [...ws.users, newUser],
        };
      })
    );

    logAuditEvent({
      action: 'USER_CREATED',
      entity: 'user',
      entityId: newId,
      workspaceId,
      metadata: { name: newUser.name, email: newUser.email, role: newUser.role },
    });

    return newUser;
  };

  const addAssetToWorkspace = (workspaceId: string, asset: InventoryAsset) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        return {
          ...ws,
          assets: [asset, ...ws.assets],
        };
      })
    );

    logAuditEvent({
      action: 'ASSET_REGISTERED',
      entity: 'asset',
      entityId: asset.id,
      workspaceId,
      metadata: { name: asset.name, category: asset.category, identifier: asset.identifier },
    });
  };

  const addReportToWorkspace = (
    workspaceId: string,
    reportData: Omit<WorkspaceReport, 'id' | 'generatedAt' | 'generatedBy'>
  ): WorkspaceReport => {
    const newId = `rep_${reportData.type.toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`;
    const newReport: WorkspaceReport = {
      id: newId,
      ...reportData,
      generatedAt: new Date().toISOString(),
      generatedBy: 'user_456',
    };

    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        return {
          ...ws,
          reports: [newReport, ...ws.reports],
        };
      })
    );

    logAuditEvent({
      action: 'REPORT_GENERATED',
      entity: 'report',
      entityId: newId,
      workspaceId,
      metadata: { title: newReport.title, type: newReport.type, score: newReport.securityScore },
    });

    return newReport;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        auditLogs,
        setActiveWorkspaceId,
        createWorkspace,
        resolveAlert,
        addUserToWorkspace,
        addAssetToWorkspace,
        addReportToWorkspace,
        logAuditEvent,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
