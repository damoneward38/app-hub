import crypto from "node:crypto";

export interface MarketplaceModel {
  id: string;
  name: string;
  description: string;
  version: string;
  publisher: string;
  validated: boolean;
  createdAt: number;
}

const models: MarketplaceModel[] = [
  {
    id: "magen-nero-4",
    name: "Neural Core Nero-4.0",
    description: "Enterprise high-assurance code repair and system analysis engine.",
    version: "4.0.8",
    publisher: "Magen-Raki Labs",
    validated: true,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "six686-guard-v2",
    name: "Six 686 Hardware Risk Enclave Model",
    description: "Hardware-level AST risk scoring and tamper-proof policy evaluation.",
    version: "2.4.1",
    publisher: "Six 686 Systems",
    validated: true,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "sapphire-agent-v1",
    name: "Sapphire Workspace Agent",
    description: "Autonomous task orchestration and multi-agent coordination.",
    version: "1.2.0",
    publisher: "Sapphire OpenClaw",
    validated: true,
    createdAt: Date.now() - 86400000,
  }
];

export function publishModel(
  input: Omit<MarketplaceModel, "id" | "validated" | "createdAt">
): MarketplaceModel {
  const model: MarketplaceModel = {
    id: crypto.randomUUID(),
    ...input,
    validated: false,
    createdAt: Date.now(),
  };

  models.push(model);
  return model;
}

export function validateModel(id: string): MarketplaceModel {
  const model = models.find((item) => item.id === id);

  if (!model) {
    throw new Error("Marketplace model not found");
  }

  model.validated = true;
  return model;
}

export function listModels(): MarketplaceModel[] {
  return models;
}
