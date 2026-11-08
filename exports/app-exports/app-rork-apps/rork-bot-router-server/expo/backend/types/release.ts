export interface BotStatus {
  name: string;
  icon: string;
  completed: boolean;
  completedAt?: string;
  attempts?: number;
  lastError?: string;
}

export interface Release {
  id: string;
  type: "release";
  artist: string;
  track: string;
  timestamp: string;
  createdAt: string;
  botStatuses: BotStatus[];
}

export interface ReleaseEvent {
  type: "release";
  artist: string;
  track: string;
  timestamp: string;
}
