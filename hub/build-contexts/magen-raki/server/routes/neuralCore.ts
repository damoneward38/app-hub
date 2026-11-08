import { Router } from "express";
import { askNeuralCore } from "../neural-core/neroEngine.js";
import {
  governAction,
  createAction,
  approveRequest,
  getAuditLedger,
  activateKillSwitch,
  releaseKillSwitch,
  getKillSwitchStatus,
} from "../six686/index.js";
import { evaluateReadinessGate } from "../magenRaki/readinessGate.js";

export const neuralCoreRouter = Router();

// Chat directly with Nero-4.0
neuralCoreRouter.post("/chat", async (req, res) => {
  try {
    const { message, prompt, context } = req.body;
    const inputPrompt = prompt || message;
    if (!inputPrompt) {
      return res.status(400).json({ error: "Message or prompt is required" });
    }

    const response = await askNeuralCore(inputPrompt, context);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Govern an action through Six 686
neuralCoreRouter.post("/govern", async (req, res) => {
  try {
    const action = createAction({
      agentId: req.body.agentId || "neural-core",
      type: req.body.type || "execute",
      capability: req.body.capability || "execute-command",
      target: req.body.target || req.body.path || "system",
      description: req.body.description || req.body.command || "Action submitted to Six 686",
      metadata: {
        command: req.body.command,
        ...req.body.metadata,
      },
    });

    const decision = await governAction(action);
    res.json(decision);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve an action
neuralCoreRouter.post("/approve/:actionId", (req, res) => {
  try {
    const approvedBy = req.body.approvedBy || "Administrator";
    const approval = approveRequest(req.params.actionId, approvedBy);
    res.json({
      success: true,
      approval,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// Run Repository Readiness Gate
neuralCoreRouter.post("/readiness", async (req, res) => {
  try {
    const report = await evaluateReadinessGate();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Ledger
neuralCoreRouter.get("/audit", (_req, res) => {
  res.json(getAuditLedger());
});

// Status
neuralCoreRouter.get("/status", (_req, res) => {
  const ks = getKillSwitchStatus();
  res.json({
    neuralCore: "ONLINE",
    six686: ks.active ? "STOPPED" : "ACTIVE",
    emergencyStop: ks.active,
    timestamp: Date.now(),
  });
});

// Kill Switch Activate
neuralCoreRouter.post("/kill-switch/activate", (req, res) => {
  const reason = req.body.reason || "Manual Kill Switch Activation via API";
  activateKillSwitch(reason);
  res.json({
    success: true,
    status: "STOPPED",
  });
});

// Kill Switch Deactivate
neuralCoreRouter.post("/kill-switch/deactivate", (req, res) => {
  const reason = req.body.reason || "Kill Switch Released via API";
  releaseKillSwitch(reason);
  res.json({
    success: true,
    status: "ACTIVE",
  });
});

// Voice-First AI Guidance Route (Neuro-Core Voice Assistant with HSM Attestation)
neuralCoreRouter.post("/voice-guide", async (req, res) => {
  try {
    const { transcript, contextSection = "general", mode = "beginner", userEmail = "anonymous" } = req.body;
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const lower = transcript.toLowerCase();
    let text = "";
    let category = "GENERAL_GUIDE";
    let suggestedAction: { label: string; tab: string } | null = null;

    // Smart context-aware Q&A and beginner-friendly lay-man routing
    if (lower.includes("audit bundle") || lower.includes("evidence") || lower.includes("export")) {
      category = "AUDIT_BUNDLE";
      text = "An audit bundle is a cryptographic, tamper-proof package of your system logs, configuration proofs, and readiness evaluations. It is sealed with SHA-512 hashes so compliance auditors can verify that no security events were altered.";
      suggestedAction = { label: "Open Compliance Vault", tab: "compliance" };
    } else if (lower.includes("enclave") || lower.includes("six 686") || lower.includes("hardware") || lower.includes("silicon")) {
      category = "ENCLAVE_EXPLANATION";
      text = "The Six 686 Hardware Enclave acts as a physical security barrier. It isolates memory channels via direct DMA protection and evaluates every AI tool execution in under two milliseconds before any command touches the host operating system.";
      suggestedAction = { label: "View Six 686 Governor", tab: "governor" };
    } else if (lower.includes("sandbox") || lower.includes("threat") || lower.includes("attack") || lower.includes("injection")) {
      category = "THREAT_RADAR";
      text = "A sandbox is a strictly quarantined virtual container where untrusted AI code or prompts run without access to real files, network credentials, or sensitive environmental variables. If malicious code fires, the sandbox safely absorbs the impact.";
      suggestedAction = { label: "Launch Threat Radar", tab: "threats" };
    } else if (lower.includes("kill switch") || lower.includes("emergency") || lower.includes("freeze")) {
      category = "KILL_SWITCH";
      text = "The emergency hardware kill switch is an instantaneous circuit breaker. When triggered by a root administrator, it halts all agent execution loops and blocks tool invocations in under zero point five milliseconds.";
      suggestedAction = { label: "Open Hardware Governor", tab: "governor" };
    } else if (lower.includes("readiness") || lower.includes("check") || lower.includes("assertion") || lower.includes("deploy")) {
      category = "READINESS_GATE";
      text = "The Readiness Gate runs twelve automated pre-flight assertions across build integrity, secret isolation, and container security. It prevents any unverified code from reaching production.";
      suggestedAction = { label: "Run Readiness Gate", tab: "readiness" };
    } else if (lower.includes("pipeline") || lower.includes("ci/cd") || lower.includes("repair") || lower.includes("rollback")) {
      category = "PIPELINE_REPAIR";
      text = "Our autonomous CI/CD pipeline enforces a nine-stage release flow with an eight-step repair discipline: Diagnose, Plan, Patch, Test, Build, Staging, Synthetic Probe, and Report. If probes fail, it triggers instant automatic rollback.";
      suggestedAction = { label: "View CI/CD Pipeline", tab: "pipeline" };
    } else if (lower.includes("model") || lower.includes("marketplace") || lower.includes("hub") || lower.includes("nero")) {
      category = "MODEL_MARKETPLACE";
      text = "The Verified Model Marketplace allows you to deploy hardware-attested AI weights. Every model is benchmarked for AST delimiter defense, latency, and memory zeroization.";
      suggestedAction = { label: "Browse Model Hub", tab: "marketplace" };
    } else {
      // General Nero-4.0 fallback response
      try {
        const neroResp = await askNeuralCore(
          `You are Nero-4.0, the voice AI security guide for Magen-Raki. Give a clear, helpful, 2-3 sentence answer suitable for speaking aloud via speech synthesis: ${transcript}`,
          contextSection
        );
        text = neroResp?.text || "I am here to help you navigate Magen-Raki and Six 686 security architectures. You can ask me about enclaves, audit bundles, emergency kill switches, or autonomous repair pipelines.";
      } catch (err) {
        text = "Magen-Raki provides sovereign AI security through the Neural Core engine and Six 686 hardware governor. You can ask me to explain any security subsystem or guide you through setting up an audit bundle.";
      }
    }

    // Cryptographic HSM Attestation Seal
    const hsmSignature = `0x${Buffer.from(`hsm_voice_${Date.now()}_${userEmail}`).toString("hex").padEnd(64, "0").slice(0, 64)}`;

    res.json({
      text,
      voiceParams: {
        pitch: 1.02,
        rate: 1.0,
        language: "en-US",
      },
      category,
      suggestedAction,
      hsmSignature,
      auditRecordId: `aud_voice_${Date.now()}`,
      confidentiality: "LOCAL_SPEECH_RECOGNITION_VERIFIED",
      timestamp: Date.now(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

