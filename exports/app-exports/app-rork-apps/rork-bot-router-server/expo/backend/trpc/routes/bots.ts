import * as z from "zod";

import { createTRPCRouter, publicProcedure } from "../create-context";
import { requireSubscriber } from "../middleware/auth";
import { BotStatus } from "../../types/release";
import * as bots from "../../bots";

export const botRouter = createTRPCRouter({
  triggerBots: publicProcedure
    .input(
      z.object({
        artist: z.string(),
        track: z.string(),
        timestamp: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await requireSubscriber(ctx);

      const botStatuses: BotStatus[] = [
        { name: 'Hype Bot', icon: '🎉', completed: false },
        { name: 'Content Bot', icon: '📝', completed: false },
        { name: 'Art Bot', icon: '🎨', completed: false },
        { name: 'Duplicate Bot', icon: '🔄', completed: false },
        { name: 'Fresh Content Bot', icon: '🌟', completed: false },
        { name: 'AI Brain Bot', icon: '🤖', completed: false },
      ];

      const release = {
        id: Date.now().toString(),
        type: "release" as const,
        artist: input.artist,
        track: input.track,
        timestamp: input.timestamp,
        createdAt: new Date().toISOString(),
        botStatuses,
      };

      console.log('🤖 Triggering bots for user:', user.email);

      bots.hypeBot(release);
      botStatuses[0].completed = true;
      botStatuses[0].completedAt = new Date().toISOString();

      bots.contentBot(release);
      botStatuses[1].completed = true;
      botStatuses[1].completedAt = new Date().toISOString();

      bots.artBot(release);
      botStatuses[2].completed = true;
      botStatuses[2].completedAt = new Date().toISOString();

      bots.duplicateBot(release);
      botStatuses[3].completed = true;
      botStatuses[3].completedAt = new Date().toISOString();

      bots.freshContentBot(release);
      botStatuses[4].completed = true;
      botStatuses[4].completedAt = new Date().toISOString();

      bots.aiBrainBot(release);
      botStatuses[5].completed = true;
      botStatuses[5].completedAt = new Date().toISOString();

      return { success: true, message: 'Bots triggered!', release };
    }),
});
