import { Router } from "express";
import { runProtectedInference } from "../magen-raki/inference.js";
import { getHeartbeat } from "../magen-raki/heartbeat.js";
import { generateComplianceBundle } from "../magen-raki/compliance.js";
import { generateThreatReport } from "../magen-raki/threatReports.js";
import { getUsage, getUsageSummary } from "../magen-raki/usageMeter.js";
import {
  listModels,
  publishModel,
  validateModel,
} from "../magen-raki/marketplace.js";
import { cacheStatus, clearCache } from "../magen-raki/warmCache.js";

export const magenRakiRouter = Router();

// Run Protected Inference with Warm Cache + Risk Hardening
magenRakiRouter.post("/inference", async (req, res) => {
  try {
    const { model, prompt, tenantId, metadata } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await runProtectedInference({
      model: model || "llama3:latest",
      prompt,
      tenantId: tenantId || "default",
      metadata,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Inference failed",
      blocked: error.message?.includes("blocked"),
    });
  }
});

// Live Heartbeat Dashboard API
magenRakiRouter.get("/heartbeat", (_req, res) => {
  res.json(getHeartbeat());
});

// Compliance Evidence Bundle Generation
magenRakiRouter.post("/compliance/:framework", (req, res) => {
  try {
    const raw = req.params.framework.toUpperCase();
    const framework = (raw === "SOC2" || raw === "ISO27001" || raw === "HIPAA" || raw === "PCI_DSS" || raw === "EU_AI_ACT" || raw === "FEDRAMP" || raw === "NIST")
      ? raw
      : "SOC2";

    const bundle = generateComplianceBundle(framework as any);
    res.json(bundle);
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Threat Intelligence Report
magenRakiRouter.get("/threat-report", (_req, res) => {
  res.json(generateThreatReport());
});

// Usage Tracking & Pay-Per-Inference Summary
magenRakiRouter.get("/usage/:tenantId", (req, res) => {
  res.json(getUsageSummary(req.params.tenantId));
});

magenRakiRouter.get("/usage", (_req, res) => {
  res.json(getUsage());
});

// Warm Cache Controls
magenRakiRouter.get("/cache/status", (_req, res) => {
  res.json(cacheStatus());
});

magenRakiRouter.post("/cache/clear", (_req, res) => {
  clearCache();
  res.json({ success: true, message: "Warm cache cleared" });
});

// Marketplace Models
magenRakiRouter.get("/marketplace", (_req, res) => {
  res.json(listModels());
});

magenRakiRouter.post("/marketplace", (req, res) => {
  try {
    const model = publishModel(req.body);
    res.status(201).json(model);
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
    });
  }
});

magenRakiRouter.post("/marketplace/:id/validate", (req, res) => {
  try {
    const model = validateModel(req.params.id);
    res.json(model);
  } catch (error: any) {
    res.status(404).json({
      error: error.message,
    });
  }
});
